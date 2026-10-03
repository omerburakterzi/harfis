"""Uygulama simgelerini ve sosyal medya paylaşım görselini üretir.

Kullanım (proje klasöründen):
    araclar/.venv/bin/pip install pillow   # bir kez
    araclar/.venv/bin/python araclar/gorselleri-hazirla.py

Renkler css/ortak.css içindeki karanlık tema renkleriyle aynıdır.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

KOK = Path(__file__).resolve().parent.parent
HEDEF = KOK / "gorseller"
YAZI_TIPI = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

ZEMIN = "#121417"
DOGRU = "#17a398"
VAR = "#d9822b"
YOK = "#3b3f46"
BEYAZ = "#ffffff"
SOLUK = "#9a9ea6"


def yazi_tipi(boyut):
    return ImageFont.truetype(YAZI_TIPI, boyut)


def ortali_yaz(cizim, kutu, metin, boyut, renk=BEYAZ):
    x0, y0, x1, y1 = kutu
    font = yazi_tipi(boyut)
    sol, ust, sag, alt = cizim.textbbox((0, 0), metin, font=font)
    x = x0 + (x1 - x0 - (sag - sol)) / 2 - sol
    y = y0 + (y1 - y0 - (alt - ust)) / 2 - ust
    cizim.text((x, y), metin, font=font, fill=renk)


def simge(boyut, guvenli_alan=1.0, zemin=DOGRU):
    """Turkuaz zemin, büyük beyaz H ve sağ altta küçük turuncu kare.
    guvenli_alan < 1 ise içerik ortaya doğru küçülür (Android'in yuvarlak/şekilli
    simge kesimlerinde kenarlar kırpılabildiği için)."""
    # zemin=None: saydam zemin (Android uyarlanabilir simgesinin ön plan katmanı için)
    resim = Image.new("RGBA", (boyut, boyut), (0, 0, 0, 0)) if zemin is None else Image.new("RGB", (boyut, boyut), zemin)
    cizim = ImageDraw.Draw(resim)
    orta = boyut / 2
    harf_kutusu = boyut * 0.96 * guvenli_alan
    ust = orta - harf_kutusu / 2
    ortali_yaz(cizim, (ust, ust, ust + harf_kutusu, ust + harf_kutusu), "H", int(boyut * 0.645 * guvenli_alan))
    kare = boyut * 0.168 * guvenli_alan
    merkez = orta + boyut * 0.287 * guvenli_alan
    cizim.rounded_rectangle(
        (merkez - kare / 2, merkez - kare / 2, merkez + kare / 2, merkez + kare / 2),
        radius=kare * 0.16, fill=VAR,
    )
    return resim


def paylasim_gorseli():
    genislik, yukseklik = 1200, 630
    resim = Image.new("RGB", (genislik, yukseklik), ZEMIN)
    cizim = ImageDraw.Draw(resim)

    # Üstte HARFONİ yazan renkli kareler
    harfler = "HARFONİ"
    renkler = [DOGRU, VAR, YOK, DOGRU, DOGRU, YOK, VAR]
    kare, bosluk = 112, 14
    toplam = len(harfler) * kare + (len(harfler) - 1) * bosluk
    x0 = (genislik - toplam) / 2
    y0 = 150
    for i, (harf, renk) in enumerate(zip(harfler, renkler)):
        x = x0 + i * (kare + bosluk)
        kutu = (x, y0, x + kare, y0 + kare)
        cizim.rounded_rectangle(kutu, radius=14, fill=renk)
        ortali_yaz(cizim, kutu, harf, 70)

    ortali_yaz(cizim, (0, 320, genislik, 400), "Türkçe günlük kelime oyunları", 50)
    ortali_yaz(cizim, (0, 410, genislik, 460), "Klasik · Palavra · Arada · Muamma", 34, SOLUK)
    ortali_yaz(cizim, (0, 520, genislik, 570), "harfoni.com", 34, DOGRU)
    return resim


def tanitim_gorseli():
    """Google Play mağaza sayfasının üstündeki 1024x500 görsel."""
    genislik, yukseklik = 1024, 500
    resim = Image.new("RGB", (genislik, yukseklik), ZEMIN)
    cizim = ImageDraw.Draw(resim)
    harfler = "HARFONİ"
    renkler = [DOGRU, VAR, YOK, DOGRU, DOGRU, YOK, VAR]
    kare, bosluk = 100, 12
    toplam = len(harfler) * kare + (len(harfler) - 1) * bosluk
    x0 = (genislik - toplam) / 2
    y0 = 120
    for i, (harf, renk) in enumerate(zip(harfler, renkler)):
        x = x0 + i * (kare + bosluk)
        kutu = (x, y0, x + kare, y0 + kare)
        cizim.rounded_rectangle(kutu, radius=12, fill=renk)
        ortali_yaz(cizim, kutu, harf, 62)
    ortali_yaz(cizim, (0, 270, genislik, 330), "Türkçe günlük kelime oyunları", 44)
    ortali_yaz(cizim, (0, 345, genislik, 385), "Klasik · Palavra · Arada · Muamma", 30, SOLUK)
    return resim


def main():
    HEDEF.mkdir(exist_ok=True)
    simge(512).save(HEDEF / "simge-512.png")
    simge(192).save(HEDEF / "simge-192.png")
    simge(512, guvenli_alan=0.72).save(HEDEF / "simge-maskable-512.png")
    simge(180).save(HEDEF / "apple-touch-icon.png")
    simge(32).save(HEDEF / "favicon-32.png")
    paylasim_gorseli().save(HEDEF / "paylasim.png", optimize=True)
    magaza = KOK / "magaza"
    magaza.mkdir(exist_ok=True)
    tanitim_gorseli().save(magaza / "play-tanitim-1024x500.png")
    simge(512).save(magaza / "play-simge-512.png")
    # iOS uygulaması: 1024x1024 simge (saydamlık olmadan) ve açılış ekranı
    ios = KOK / "uygulama" / "ios" / "App" / "App" / "Assets.xcassets"
    if ios.exists():
        simge(1024).convert("RGB").save(ios / "AppIcon.appiconset" / "AppIcon-512@2x.png")
        acilis = Image.new("RGB", (2732, 2732), ZEMIN)
        kucuk = simge(300)
        maske = Image.new("L", kucuk.size, 0)
        ImageDraw.Draw(maske).rounded_rectangle((0, 0, 300, 300), radius=68, fill=255)
        acilis.paste(kucuk, ((2732 - 300) // 2, (2732 - 300) // 2), maske)
        for ad in ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]:
            acilis.save(ios / "Splash.imageset" / ad)
    # Android uygulaması: klasik ve yuvarlak simgeler, uyarlanabilir simge ön planı, açılış ekranı
    android = KOK / "uygulama" / "android" / "app" / "src" / "main" / "res"
    if android.exists():
        yogunluklar = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
        for ad, kat in yogunluklar.items():
            klasor = android / f"mipmap-{ad}"
            boyut = round(48 * kat)
            simge(boyut).save(klasor / "ic_launcher.png")
            yuvarlak = simge(boyut).convert("RGBA")
            maske = Image.new("L", (boyut, boyut), 0)
            ImageDraw.Draw(maske).ellipse((0, 0, boyut, boyut), fill=255)
            yuvarlak.putalpha(maske)
            yuvarlak.save(klasor / "ic_launcher_round.png")
            # Uyarlanabilir simge: 108dp tuval, görünen kısım ortadaki 72dp
            on_plan = round(108 * kat)
            simge(on_plan, guvenli_alan=0.62, zemin=None).save(klasor / "ic_launcher_foreground.png")
        (android / "values" / "ic_launcher_background.xml").write_text(
            '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#17A398</color>\n</resources>\n',
            encoding="utf-8",
        )
        for klasor in android.glob("drawable*"):
            for dosya in klasor.glob("splash.png"):
                genislik, yukseklik = Image.open(dosya).size
                ekran = Image.new("RGB", (genislik, yukseklik), ZEMIN)
                kenar = min(genislik, yukseklik) // 4
                kucuk = simge(kenar)
                maske = Image.new("L", (kenar, kenar), 0)
                ImageDraw.Draw(maske).rounded_rectangle((0, 0, kenar, kenar), radius=kenar * 0.225, fill=255)
                ekran.paste(kucuk, ((genislik - kenar) // 2, (yukseklik - kenar) // 2), maske)
                ekran.save(dosya)
    print("Görseller gorseller/ klasörüne yazıldı.")


if __name__ == "__main__":
    main()
