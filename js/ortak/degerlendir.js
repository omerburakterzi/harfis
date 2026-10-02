// Bir tahmini cevapla karşılaştırır. Her harf için:
//   "dogru" : harf doğru yerde
//   "var"   : harf kelimede var ama başka yerde
//   "yok"   : harf kelimede yok (ya da hepsi zaten kullanıldı)
// Tekrarlanan harfler doğru sayılır: cevapta bir tane "a" varsa
// tahmindeki ikinci "a" gri kalır.
export function degerlendir(tahmin, cevap) {
  const sonuc = Array(tahmin.length).fill("yok");
  const kalan = {};

  for (let i = 0; i < cevap.length; i++) {
    if (tahmin[i] === cevap[i]) {
      sonuc[i] = "dogru";
    } else {
      kalan[cevap[i]] = (kalan[cevap[i]] || 0) + 1;
    }
  }
  for (let i = 0; i < tahmin.length; i++) {
    if (sonuc[i] !== "dogru" && kalan[tahmin[i]] > 0) {
      sonuc[i] = "var";
      kalan[tahmin[i]] -= 1;
    }
  }
  return sonuc;
}
