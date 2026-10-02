import { tahminOyunuKur } from "../ortak/tahmin-oyunu.js";
import { degerlendir } from "../ortak/degerlendir.js";
import { rastgeleUretec } from "../ortak/rastgele.js";

const DURUMLAR = ["dogru", "var", "yok"];

// Klasik değerlendirme, ama her satırda tam bir kare yalan söyler:
// gerçek rengi yerine diğer iki renkten biri gösterilir. Hangi karenin
// yalan söyleyeceği gün ve satıra göre belirlenir, tahmine göre değil.
// Kelime bulununca yalan yok, satır olduğu gibi gösterilir.
function palavraRenkleri(tahmin, cevap, satirNo, tohum) {
  const gercek = degerlendir(tahmin, cevap);
  if (tahmin === cevap) return gercek;

  const rastgele = rastgeleUretec(tohum * 1000 + satirNo);
  const yer = Math.floor(rastgele() * gercek.length);
  const digerleri = DURUMLAR.filter((d) => d !== gercek[yer]);
  const sonuc = [...gercek];
  sonuc[yer] = digerleri[Math.floor(rastgele() * digerleri.length)];
  return sonuc;
}

const oyun = tahminOyunuKur({
  oyun: "palavra",
  ad: "Palavra",
  hak: 8,
  tebrik: [
    "İnanılmaz!", "Dâhiyane!", "Muhteşem!", "Harika!",
    "Çok iyi!", "Güzel!", "Az kalsın!", "Kıl payı!",
  ],
  renkler: palavraRenkleri,
  klavyeBoya: false, // renkler yalan söyleyebildiği için klavye boyanmaz
});

// Oyuncu yalan olduğunu düşündüğü kareye dokunup işaretleyebilir.
oyun.tahta.addEventListener("click", (e) => {
  const kare = e.target.closest(".kare");
  if (!kare || !kare.dataset.durum) return;
  const satir = kare.parentElement;
  if (satir.classList.contains("kazandi")) return;
  const isaretli = satir.querySelector(".kare.yalan-isareti");
  if (isaretli && isaretli !== kare) isaretli.classList.remove("yalan-isareti");
  kare.classList.toggle("yalan-isareti");
});
