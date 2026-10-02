// Türkçe harf işlemleri. Standart toUpperCase "i"yi "I" yapar, bu yüzden
// her yerde bu fonksiyonları kullanıyoruz.

export const HARFLER = "abcçdefgğhıijklmnoöprsştuüvyz";

export const buyuk = (metin) => metin.toLocaleUpperCase("tr-TR");
export const kucuk = (metin) => metin.toLocaleLowerCase("tr-TR");

export const harfMi = (karakter) => karakter.length === 1 && HARFLER.includes(karakter);

// Türkçe alfabetik sıralama (Betweenle tarzı oyun için gerekecek).
export const karsilastir = new Intl.Collator("tr-TR").compare;
