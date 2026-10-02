"""Kelime listelerini hazırlar ve js/kelimeler.js dosyasını üretir.

Kullanım (proje klasöründen):
    python3 -m venv araclar/.venv && araclar/.venv/bin/pip install zeyrek   # bir kez
    araclar/.venv/bin/python araclar/kelimeleri-hazirla.py

Üç liste üretilir:
- CEVAPLAR: veri/cevaplar.txt (elle seçilmiş, yalın kelimeler).
- YALIN:    Zemberek-NLP sözlüğündeki 5 harfli yalın kelimeler (Apache 2.0) ve
            cevaplar. Arada bu listeyi kullanır, çünkü ekli halleri katmak sözlüğü
            ikiye katlar ve aynı kökün halleri üst üste dizilir.
- GECERLI:  YALIN + sık kullanılan 5 harfli ekli haller ("evden", "aldın").
            Ekli haller FrequencyWords Türkçe sıklık listesinden (CC-BY-SA 4.0)
            alınır ve zeyrek ile çözümlenerek isim, yabancı kelime ve yazım
            hataları ayıklanır.

Kaynak dosyalar ilk çalıştırmada indirilip araclar/.kaynak/ altına konur.
"""

import logging
import random
import re
import urllib.request
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
KAYNAK = KOK / "araclar" / ".kaynak"
ZEMBEREK = "https://raw.githubusercontent.com/ahmetaa/zemberek-nlp/master/morphology/src/main/resources/tr/"
SIKLIK = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/tr/tr_full.txt"

HARFLER = "abcçdefgğhıijklmnoöprsştuüvyz"
KELIME = re.compile(f"[{HARFLER}]{{5}}")
SAPKALI = str.maketrans({"â": "a", "î": "i", "û": "u"})

# Ekli bir hal en az bu kadar geçmeli; daha azı çoğunlukla yazım hatası.
EN_AZ_SIKLIK = 20

# Ekli hali kabul edilmeyecek kökler (küfür ve hakaret).
YASAK_KOKLER = {
    "sik", "sikmek", "siktir", "piç", "göt", "amcık", "orospu", "yarak", "taşak",
    "ibne", "pezevenk", "kahpe", "yavşak", "puşt", "gavat", "sürtük", "kaltak",
    "penis", "vajina", "sperm", "porno", "seks", "zenci",
}

# Yayından sonra bu sayıyı ya da cevap listesini değiştirmek
# günlerin kelimelerini değiştirir.
KARISTIRMA_TOHUMU = 2026


def indir(ad, adres):
    yol = KAYNAK / ad
    if not yol.exists():
        KAYNAK.mkdir(parents=True, exist_ok=True)
        print(f"İndiriliyor: {ad}")
        urllib.request.urlretrieve(adres, yol)
    return yol


def temizle(kelime):
    return kelime.strip().translate(SAPKALI)


def yalin_kelimeler():
    kelimeler = set()
    for ad in ["master-dictionary.dict", "non-tdk.dict"]:
        for satir in indir(ad, ZEMBEREK + ad).read_text(encoding="utf-8").splitlines():
            kelime = temizle(satir.split(" [")[0])
            if KELIME.fullmatch(kelime):
                kelimeler.add(kelime)
    return kelimeler


def ekli_kelimeler(bilinen):
    import zeyrek

    logging.disable(logging.WARNING)
    cozumleyici = zeyrek.MorphAnalyzer()

    def turkce_mi(kelime):
        for c in cozumleyici._parse(kelime):
            kok = c.dict_item.lemma
            if not kok[:1].islower():  # özel isim ya da yabancı kelime
                continue
            if kok in YASAK_KOKLER or kok.removesuffix("mak").removesuffix("mek") in YASAK_KOKLER:
                return False
            parcalar = [m[0] for m in c.morphemes]
            if any(p.id_ == "Zero" for p in parcalar):  # "gen idi" gibi eksiltili yapılar
                continue
            if any(p.informal for p in parcalar) or len(c.stem) < 2:
                continue
            return True
        return False

    ekli = set()
    for satir in indir("tr_full.txt", SIKLIK).open(encoding="utf-8"):
        kelime, adet = satir.rsplit(" ", 1)
        if int(adet) < EN_AZ_SIKLIK:
            break  # liste sıklığa göre sıralı
        if KELIME.fullmatch(kelime) and kelime not in bilinen and turkce_mi(kelime):
            ekli.add(kelime)
    return ekli


def cevaplari_oku():
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
    return cevaplar


def js_listesi(kelimeler):
    return '"' + " ".join(kelimeler) + '".split(" ")'


def main():
    cevaplar = cevaplari_oku()
    yalin = yalin_kelimeler() | set(cevaplar)
    ekli = ekli_kelimeler(yalin)
    gecerli = yalin | ekli

    random.Random(KARISTIRMA_TOHUMU).shuffle(cevaplar)

    (KOK / "veri" / "gecerli.txt").write_text("\n".join(sorted(gecerli)) + "\n", encoding="utf-8")
    js = (
        "// Bu dosya araclar/kelimeleri-hazirla.py ile üretilir, elle değiştirmeyin.\n"
        "// Kaynaklar ve lisanslar için README.md dosyasına bakın.\n"
        f"export const CEVAPLAR = {js_listesi(cevaplar)};\n"
        f"export const YALIN = new Set({js_listesi(sorted(yalin))});\n"
        f"export const GECERLI = new Set([...YALIN, ...{js_listesi(sorted(ekli))}]);\n"
    )
    (KOK / "js" / "kelimeler.js").write_text(js, encoding="utf-8")
    print(f"{len(cevaplar)} cevap, {len(yalin)} yalın, {len(ekli)} ekli, {len(gecerli)} geçerli kelime yazıldı.")


if __name__ == "__main__":
    main()
