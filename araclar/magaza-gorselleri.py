"""magaza/ham/ altındaki ekran görüntülerinden mağaza görselleri üretir.

Her görselin üstüne kısa bir başlık yazar, görüntüyü yuvarlatılmış köşelerle
ortalar. Çıktı: magaza/play-ekran-*.png (1080x1920, Google Play için 9:16).

Kullanım:
    araclar/.venv/bin/python araclar/magaza-gorselleri.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

KOK = Path(__file__).resolve().parent.parent
HAM = KOK / "magaza" / "ham"
HEDEF = KOK / "magaza"
YAZI_TIPI = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

ZEMIN = "#121417"
VURGU = "#17a398"
BEYAZ = "#ffffff"

# (ham dosya, üst satır, alt satır)
SAHNELER = [
    ("1-klasik.jpg", "Klasik", "Günün kelimesini 6 tahminde bul"),
    ("2-palavra.jpg", "Palavra", "Her satırda bir renk yalan söylüyor"),
    ("3-arada.jpg", "Arada", "Kelime iki kelimenin arasında"),
    ("4-artieksi.jpg", "Artı Eksi", "Kaç harf doğru, ama hangileri?"),
    ("5-istatistik.jpg", "Serini koru", "Sonucunu arkadaşlarınla paylaş"),
    ("6-anasayfa.jpg", "4 oyun, her gün", "Türkçe günlük kelime oyunları"),
]

GENISLIK, YUKSEKLIK = 1080, 1920
UST_ALAN = 360


def ortali(cizim, y, metin, boyut, renk):
    font = ImageFont.truetype(YAZI_TIPI, boyut)
    sol, _, sag, _ = cizim.textbbox((0, 0), metin, font=font)
    cizim.text(((GENISLIK - (sag - sol)) / 2 - sol, y), metin, font=font, fill=renk)


def yuvarlak_kose(resim, yaricap):
    maske = Image.new("L", resim.size, 0)
    ImageDraw.Draw(maske).rounded_rectangle((0, 0, *resim.size), radius=yaricap, fill=255)
    resim.putalpha(maske)
    return resim


def sahne(dosya, baslik, alt_baslik):
    tuval = Image.new("RGB", (GENISLIK, YUKSEKLIK), ZEMIN)
    cizim = ImageDraw.Draw(tuval)
    ortali(cizim, 110, baslik, 84, VURGU)
    ortali(cizim, 225, alt_baslik, 52, BEYAZ)

    goruntu = Image.open(HAM / dosya).convert("RGB")
    yukseklik = YUKSEKLIK - UST_ALAN - 60
    genislik = round(goruntu.width * yukseklik / goruntu.height)
    goruntu = yuvarlak_kose(goruntu.resize((genislik, yukseklik), Image.LANCZOS), 36)
    x = (GENISLIK - genislik) // 2
    # İnce çerçeve
    cizim.rounded_rectangle(
        (x - 3, UST_ALAN - 3, x + genislik + 3, UST_ALAN + yukseklik + 3),
        radius=39, outline="#2e3137", width=3,
    )
    tuval.paste(goruntu, (x, UST_ALAN), goruntu)
    return tuval


def main():
    for i, (dosya, baslik, alt_baslik) in enumerate(SAHNELER, start=1):
        sahne(dosya, baslik, alt_baslik).save(HEDEF / f"play-ekran-{i}.png", optimize=True)
    print(f"{len(SAHNELER)} mağaza görseli magaza/ klasörüne yazıldı.")


if __name__ == "__main__":
    main()
