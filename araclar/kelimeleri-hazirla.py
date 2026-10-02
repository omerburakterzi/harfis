"""Kelime listelerini hazırlar ve js/kelimeler.js dosyasını üretir.

Kullanım:  python3 araclar/kelimeleri-hazirla.py

- Geçerli tahminler: Zemberek-NLP sözlüğündeki 5 harfli kelimeler (Apache 2.0),
  sık kullanılan ekli hallerden 5 harfli olanlar ve veri/cevaplar.txt.
- Cevaplar: veri/cevaplar.txt (elle seçilmiş).

Zemberek dosyaları ilk çalıştırmada indirilip araclar/.kaynak/ altına konur.
"""

import random
import re
import urllib.request
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
KAYNAK = KOK / "araclar" / ".kaynak"
ZEMBEREK = "https://raw.githubusercontent.com/ahmetaa/zemberek-nlp/master/morphology/src/main/resources/tr/"
KAYNAK_DOSYALARI = ["master-dictionary.dict", "non-tdk.dict", "first-10K"]

HARFLER = "abcçdefgğhıijklmnoöprsştuüvyz"
KELIME = re.compile(f"[{HARFLER}]{{5}}")
SAPKALI = str.maketrans({"â": "a", "î": "i", "û": "u"})

# Yayından sonra bu sayıyı ya da cevap listesini değiştirmek
# günlerin kelimelerini değiştirir.
KARISTIRMA_TOHUMU = 2026


def kaynak_oku(ad):
    yol = KAYNAK / ad
    if not yol.exists():
        KAYNAK.mkdir(parents=True, exist_ok=True)
        print(f"İndiriliyor: {ad}")
        urllib.request.urlretrieve(ZEMBEREK + ad, yol)
    return yol.read_text(encoding="utf-8").splitlines()


def temizle(kelime):
    return kelime.strip().translate(SAPKALI)


def main():
    gecerli = set()
    for ad in ["master-dictionary.dict", "non-tdk.dict"]:
        for satir in kaynak_oku(ad):
            kelime = temizle(satir.split(" [")[0])
            if KELIME.fullmatch(kelime):
                gecerli.add(kelime)
    for satir in kaynak_oku("first-10K"):
        kelime = temizle(satir)
        if KELIME.fullmatch(kelime):
            gecerli.add(kelime)

    cevaplar, hatalar = [], []
    for satir in (KOK / "veri" / "cevaplar.txt").read_text(encoding="utf-8").splitlines():
        kelime = temizle(satir)
        if not kelime or kelime.startswith("#"):
            continue
        if not KELIME.fullmatch(kelime):
            hatalar.append(kelime)
        elif kelime not in cevaplar:
            cevaplar.append(kelime)
    for kelime in hatalar:
        print(f"UYARI: 5 harfli değil ya da geçersiz harf içeriyor, atlandı: {kelime}")

    gecerli.update(cevaplar)
    random.Random(KARISTIRMA_TOHUMU).shuffle(cevaplar)

    (KOK / "veri" / "gecerli.txt").write_text("\n".join(sorted(gecerli)) + "\n", encoding="utf-8")
    js = (
        "// Bu dosya araclar/kelimeleri-hazirla.py ile üretilir, elle değiştirmeyin.\n"
        f'export const CEVAPLAR = "{" ".join(cevaplar)}".split(" ");\n'
        f'export const GECERLI = new Set("{" ".join(sorted(gecerli))}".split(" "));\n'
    )
    (KOK / "js" / "kelimeler.js").write_text(js, encoding="utf-8")
    print(f"{len(cevaplar)} cevap, {len(gecerli)} geçerli kelime yazıldı.")


if __name__ == "__main__":
    main()
