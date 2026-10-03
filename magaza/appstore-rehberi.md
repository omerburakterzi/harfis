# App Store rehberi

Apple Developer Program'a katıldıktan sonra App Store Connect'te doldurman gereken
her şey burada. Kopyala-yapıştır yapabilirsin.

## Uygulama kaydı (App Store Connect → Uygulamalar → +)

| Alan | Değer |
|---|---|
| Platform | iOS |
| Ad | `Harfoni: Kelime Oyunları` |
| Birincil dil | Türkçe |
| Paket Kimliği (Bundle ID) | `com.harfoni.app` (Xcode'dakiyle aynı) |
| SKU | `harfoni-ios` (sadece senin göreceğin bir kod) |
| Kullanıcı erişimi | Tam erişim |

## Görseller (bu klasörde)

| Alan | Dosya |
|---|---|
| iPhone 6,9 inç ekran görüntüleri | `appstore-ekran-1.png` … `appstore-ekran-6.png` (sırasıyla yükle) |

Uygulama simgesi uygulamanın içinden otomatik alınıyor, ayrıca yüklemene gerek yok.
Uygulama sadece iPhone için olduğundan iPad görüntüsü istenmez.

## Mağaza metinleri

**Alt başlık** (en fazla 30 karakter)

```
Günlük Türkçe kelime bulmaca
```

**Tanıtım metni** (en fazla 170 karakter, inceleme beklemeden değiştirilebilir)

```
Her gün dört yeni bulmaca! Klasik, yalan söyleyen Palavra, alfabetik Arada ve sayılarla oynanan Muamma. Serini koru, sonucunu paylaş.
```

**Açıklama** (en fazla 4000 karakter)

```
Harfoni, Türkçe günlük kelime oyunlarını tek bir yerde toplar. Her gün her oyunda yeni bir bulmaca seni bekliyor; günlük modda herkes aynı bulmacayı çözer, sonucunu arkadaşlarınla karşılaştırırsın.

DÖRT OYUN, DÖRT FARKLI ZEKÂ

• Klasik: 5 harfli gizli kelimeyi 6 tahminde bul. Renkler hangi harflerin doğru yerde olduğunu, hangilerinin kelimede olduğunu gösterir.

• Palavra: Her satırda bir renk yalan söylüyor! Hangi ipucunun yanlış olduğunu bulup 8 tahminde kelimeye ulaş. Yalan olduğunu düşündüğün kareleri işaretle, klavye sana göre boyansın.

• Arada: Gizli kelime alfabede iki kelimenin arasında. Her tahminle aralığı daralt, kelimeye ne kadar uzak olduğunu yüzde olarak gör.

• Muamma: Hangi harflerin doğru olduğunu değil, kaç tanesinin doğru olduğunu söyler. Okulda oynadığımız artı-eksi sayı bulmacasının kelimeli hali!

ÖZELLİKLER

• Her gün her oyunda yeni bulmaca (Türkiye saatiyle gece yarısı)
• İstersen her sabah "bugünün bulmacaları hazır" hatırlatması
• Sınırsız alıştırma modu
• Seri, kazanma oranı ve tahmin dağılımı istatistikleri
• Sonucunu emojilerle paylaş, cevabı ele vermeden
• Türkçe Q klavye; Ç, Ğ, İ, Ö, Ş, Ü harfleri tam destekli
• "Evler", "yolda" gibi ekli kelimeler de tahmin olarak kabul edilir
• Tamamen internetsiz oynanabilir
• Karanlık ve açık tema
• Hesap yok, üyelik yok, reklam yok, veri toplanmaz

Kelimeyi bulunca anlamına TDK Sözlük'ten tek dokunuşla bakabilirsin.

Önerin ya da bulduğun bir hata mı var? iletisim@harfoni.com adresine yaz.
```

**Anahtar kelimeler** (en fazla 100 karakter, virgülle ayrılmış, boşluksuz)

```
kelime,bulmaca,günlük,harf,tahmin,zeka,beyin,türkçe,sözcük,kelime oyunu,bilmece,hece
```

> Başka oyunların ya da markaların adlarını (ör. "Wordle") anahtar kelimelere
> ekleme; Apple bunu kurallara aykırı sayıyor ve uygulamayı reddedebiliyor.

**Bağlantılar**
- Destek URL'si: `https://harfoni.com/hakkinda.html`
- Pazarlama URL'si: `https://harfoni.com`
- Gizlilik Politikası URL'si: `https://harfoni.com/gizlilik.html`

**Kategori**
- Birincil: Oyunlar → Kelime
- İkincil: Oyunlar → Bulmaca

**Telif hakkı:** `2026 Ömer Burak Terzi`

**Fiyat:** Ücretsiz

## Uygulama Gizliliği (Gizlilik etiketi)

Uygulama ziyaretçi sayacı da dahil hiçbir veri göndermiyor (sayaç sadece harfoni.com
sitesinde çalışıyor). Bu yüzden:

- "Bu uygulamadan veri topluyor musunuz?" → **Hayır, bu uygulamadan veri toplamıyoruz**

Mağazada "Veri Toplanmıyor" etiketi görünecek.

## Yaş derecelendirmesi

Anketteki her soruya **Hiç / Yok / Hayır** cevabı ver:
- Şiddet, cinsellik, küfür, korku, uyuşturucu, kumar, yarışma: Yok
- Sınırsız web erişimi: **Hayır** (TDK bağlantısı Safari'de açılıyor, uygulama içinde tarayıcı yok)
- Kullanıcı tarafından üretilen içerik, sohbet: Hayır

Beklenen sonuç: **4+**

## İnceleme notları (App Review Information)

Giriş gerekmediği için demo hesabı alanını boş bırak. "Notlar" alanına:

```
Harfoni is a collection of four daily Turkish word puzzle games. No account or login is required and the app works fully offline (all game content is bundled in the app).

Native features: an optional daily local notification reminding the player that new puzzles are available (toggle on the home screen, "Günlük hatırlatma"), offline play, and statistics stored on device.

The daily puzzle changes at midnight Turkey time. Practice mode ("Alıştırma") offers unlimited random puzzles for testing.
```

İletişim bilgisi olarak adını, telefonunu ve `iletisim@harfoni.com` adresini yaz.
Bu bilgiler sadece Apple'ın inceleme ekibine gidiyor.

## Şifreleme beyanı

Uygulamanın ayarlarında "standart dışı şifreleme kullanmıyor" bilgisi zaten var;
App Store Connect bu soruyu sormayacak.
