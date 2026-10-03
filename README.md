# Harfoni

Türkçe günlük kelime oyunları. Düz HTML/CSS/JS; kurulum gerektirmez.

## Çalıştırma

```bash
python3 -m http.server 8123
```

Sonra tarayıcıda http://localhost:8123 adresini aç. (Dosyayı çift tıklayarak açmak
çalışmaz; JavaScript modülleri bir sunucu üzerinden yüklenmeli.)

## Klasör yapısı

- `index.html`: oyunların listelendiği ana sayfa
- `klasik.html`, `js/oyunlar/klasik.js`: klasik mod
- `palavra.html`, `js/oyunlar/palavra.js`: her satırda bir yalan
- `arada.html`, `js/oyunlar/arada.js`: alfabetik aralığı daraltma
- `muamma.html`, `js/oyunlar/muamma.js`: sadece doğru/yanlış/yok sayıları
- `js/ortak/sayfa.js`: her oyun sayfasının ortak parçaları (mod seçici, yardım, istatistik/sonuç penceresi, paylaşma)
- `js/ortak/tahmin-oyunu.js`: harf tablolu oyunların (Klasik, Palavra, Muamma) ortak altyapısı
- `js/ortak/`: diğer ortak parçalar (klavye, günün kelimesi, renk değerlendirme, Türkçe harf işlemleri)
- `css/ortak.css`: tüm tasarım
- `hakkinda.html`, `gizlilik.html`: bilgi sayfaları
- `manifest.webmanifest`, `sw.js`: telefona kurulabilen uygulama (PWA) ve internetsiz çalışma
- `gorseller/`: uygulama simgeleri ve paylaşım görseli (`araclar/gorselleri-hazirla.py` ile üretilir)
- `veri/cevaplar.txt`: günün kelimesi olabilecek kelimeler (elle seçilir)
- `veri/gecerli.txt`, `js/kelimeler.js`: üretilen dosyalar, elle değiştirilmez

## Kelime listesini güncellemek

`veri/cevaplar.txt` dosyasını düzenle, sonra:

```bash
python3 -m venv araclar/.venv && araclar/.venv/bin/pip install zeyrek   # sadece ilk sefer
araclar/.venv/bin/python araclar/kelimeleri-hazirla.py
```

Üretilen listeler:
- **Cevaplar**: `veri/cevaplar.txt` (elle seçilmiş yalın kelimeler)
- **Yalın**: sözlükteki 5 harfli eksiz kelimeler; Arada bunu kullanır
- **Geçerli**: yalın + sık kullanılan ekli haller ("evden", "aldın"); diğer oyunlar tahmin olarak bunu kabul eder

Site yayına girdikten sonra cevap listesini değiştirmek günlerin kelimelerini kaydırır.

## Mobil uygulama

`uygulama/` klasöründe Capacitor ile hazırlanmış iOS projesi var. Sitenin dosyaları
uygulamanın içine kopyalanır, yani uygulama internetsiz ve harfoni.com'dan bağımsız çalışır.
Uygulamaya özel özellikler (günlük hatırlatma bildirimi) `js/uygulama.js` içinde; tarayıcıda çalışmaz.

Sitede değişiklik yaptıktan sonra uygulamayı güncellemek için:

```bash
cd uygulama
npm install          # sadece ilk sefer
npm run hazirla      # site dosyalarını kopyalar ve iOS projesini günceller
```

Sonra `uygulama/ios/App/App.xcodeproj` Xcode ile açılıp derlenir.

## Lisanslar

- Yalın kelimeler [Zemberek-NLP](https://github.com/ahmetaa/zemberek-nlp)
  sözlüğünden üretilmiştir (Apache License 2.0, © Ahmet A. Akın, Mehmet D. Akın).
- Ekli kelimeler [FrequencyWords](https://github.com/hermitdave/FrequencyWords)
  Türkçe sıklık listesinden seçilmiştir (CC BY-SA 4.0, © Hermit Dave; kaynak
  verisi OpenSubtitles). Bu yüzden `veri/gecerli.txt` ve `js/kelimeler.js`
  içindeki kelime listeleri CC BY-SA 4.0 ile paylaşılır.
- Ekli kelimeler [zeyrek](https://github.com/obulat/zeyrek) (MIT) ile çözümlenerek
  ayıklanmıştır.
