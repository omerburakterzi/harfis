# Harfiyen

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
- `js/ortak/tahmin-oyunu.js`: harf tahminli oyunların ortak altyapısı (tahta, kayıt, istatistik, paylaşma)
- `js/ortak/`: diğer ortak parçalar (klavye, günün kelimesi, renk değerlendirme, Türkçe harf işlemleri)
- `css/ortak.css`: tüm tasarım
- `veri/cevaplar.txt`: günün kelimesi olabilecek kelimeler (elle seçilir)
- `veri/gecerli.txt`, `js/kelimeler.js`: üretilen dosyalar, elle değiştirilmez

## Kelime listesini güncellemek

`veri/cevaplar.txt` dosyasını düzenle, sonra:

```bash
python3 araclar/kelimeleri-hazirla.py
```

Site yayına girdikten sonra cevap listesini değiştirmek günlerin kelimelerini kaydırır.

## Lisanslar

Geçerli kelime listesi [Zemberek-NLP](https://github.com/ahmetaa/zemberek-nlp)
sözlüğünden üretilmiştir (Apache License 2.0, © Ahmet A. Akın, Mehmet D. Akın).
