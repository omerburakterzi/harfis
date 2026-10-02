// Arada: gizli kelime sözlükte (Türkçe alfabetik sırada) iki kelimenin arasında.
// Her tahmin aralığın bir ucunu yaklaştırır.

import { CEVAPLAR, GECERLI } from "../kelimeler.js";
import { buyuk, karsilastir } from "../ortak/turkce.js";
import { gununKelimesi } from "../ortak/gunluk.js";
import { oku, yaz } from "../ortak/depo.js";
import { sonucKaydet } from "../ortak/istatistik.js";
import { klavyeKur } from "../ortak/klavye.js";
import { bildir } from "../ortak/arayuz.js";
import { sayfaKur } from "../ortak/sayfa.js";

const OYUN = "arada";
const HAK = 18;
const UZUNLUK = 5;
const TEBRIK = [
  "Şans mı bu?", "İnanılmaz!", "İnanılmaz!", "Dâhiyane!", "Dâhiyane!", "Muhteşem!",
  "Muhteşem!", "Harika!", "Harika!", "Çok iyi!", "Çok iyi!", "Güzel!",
  "Güzel!", "İyi!", "İyi!", "Fena değil!", "Az kalsın!", "Kıl payı!",
];

// Sözlük Türkçe alfabeye göre sıralı: C < Ç, G < Ğ, I < İ, O < Ö, S < Ş, U < Ü.
const SOZLUK = [...GECERLI].sort(karsilastir);
const SIRA = new Map(SOZLUK.map((kelime, i) => [kelime, i]));

let cevap;
let tahminler = [];
let mevcut = "";
let ust; // aralığın üst ucu (sözlükteki sırası)
let alt; // aralığın alt ucu
let bitti = false;
let kazandi = false;

const sayfa = sayfaKur({ oyun: OYUN, hak: HAK, tebrik: TEBRIK, yeniOyun: baslat, paylasimMetni });
const { alistirma, gun } = sayfa;

const ustEl = document.getElementById("ust-sinir");
const altEl = document.getElementById("alt-sinir");
const girisEl = document.getElementById("giris");
klavyeKur(document.getElementById("klavye"), tusaBasildi);

function kareleriKur(kap) {
  kap.innerHTML = "";
  for (let h = 0; h < UZUNLUK; h++) {
    const kare = document.createElement("div");
    kare.className = "kare";
    kap.appendChild(kare);
  }
}

// İki ucun ortak başlangıcı gizli kelimenin de başlangıcıdır.
function ortakBaslangic(a, b) {
  let n = 0;
  while (n < a.length && a[n] === b[n]) n++;
  return n;
}

function sinirCiz(kap, kelime, bilinen, animasyonlu) {
  [...kap.children].forEach((kare, h) => {
    kare.textContent = buyuk(kelime[h]);
    if (h < bilinen) kare.dataset.durum = "dogru";
    else delete kare.dataset.durum;
    if (animasyonlu) {
      kare.classList.remove("donuyor");
      void kare.offsetWidth;
      kare.style.animationDelay = `${h * 60}ms`;
      kare.classList.add("donuyor");
    }
  });
}

function ekraniGuncelle(degisen) {
  const ustKelime = SOZLUK[ust];
  const altKelime = SOZLUK[alt];
  const bilinen = ortakBaslangic(ustKelime, altKelime);
  sinirCiz(ustEl, ustKelime, bilinen, degisen === "ust");
  sinirCiz(altEl, altKelime, bilinen, degisen === "alt");

  // Gizli kelime aralığın neresinde? 0 = üst sınırda, 1 = alt sınırda.
  const hedef = SIRA.get(cevap);
  const konum = (hedef - ust) / (alt - ust);
  // Kelime bulunmadan %100 ya da %0 göstermeyelim.
  const ustYakinlik = Math.min(99, Math.max(1, Math.round((1 - konum) * 100)));
  document.getElementById("ust-yuzde").textContent = `%${ustYakinlik}`;
  document.getElementById("alt-yuzde").textContent = `%${100 - ustYakinlik}`;
  document.getElementById("olcek-isaret").style.top = `${konum * 100}%`;
  document.getElementById("olcek-dolgu").style.height = `${konum * 100}%`;

  const kalanKelime = Math.max(0, alt - ust - 1);
  const elenen = 1 - kalanKelime / (SOZLUK.length - 2);
  document.getElementById("kalan-hak").textContent = HAK - tahminler.length;
  document.getElementById("elenen").textContent = `%${Math.floor(elenen * 100)}`;
  document.getElementById("ilerleme").style.width = `${elenen * 100}%`;

  girisCiz();
}

function girisCiz() {
  const gosterilen = bitti ? cevap : mevcut;
  [...girisEl.children].forEach((kare, h) => {
    const harf = gosterilen[h] || "";
    kare.textContent = buyuk(harf);
    kare.classList.toggle("dolu", Boolean(harf));
    if (bitti && kazandi) kare.dataset.durum = "dogru";
    else if (bitti) kare.dataset.durum = "var";
    else delete kare.dataset.durum;
  });
}

function salla() {
  girisEl.classList.remove("salla");
  void girisEl.offsetWidth;
  girisEl.classList.add("salla");
}

function tusaBasildi(tus) {
  if (bitti) return;
  if (tus === "gir") return gonder();
  if (tus === "sil") {
    mevcut = mevcut.slice(0, -1);
  } else if (mevcut.length < UZUNLUK) {
    mevcut += tus;
    const kare = girisEl.children[mevcut.length - 1];
    kare.classList.remove("zipla");
    void kare.offsetWidth;
    kare.classList.add("zipla");
  }
  girisCiz();
}

// Tahmini uygular; aralığın hangi ucunun değiştiğini döner.
function uygula(tahmin) {
  const sira = SIRA.get(tahmin);
  const hedef = SIRA.get(cevap);
  tahminler.push(tahmin);
  if (sira === hedef) return "bulundu";
  if (sira < hedef) {
    ust = sira;
    return "ust";
  }
  alt = sira;
  return "alt";
}

function gonder() {
  if (mevcut.length < UZUNLUK) {
    salla();
    return bildir("Harf sayısı yetersiz");
  }
  if (!GECERLI.has(mevcut)) {
    salla();
    return bildir("Sözlükte yok");
  }
  const sira = SIRA.get(mevcut);
  if (sira <= ust || sira >= alt) {
    salla();
    return bildir("Bu kelime aralığın dışında");
  }

  const tahmin = mevcut;
  mevcut = "";
  const degisen = uygula(tahmin);

  if (degisen === "bulundu") {
    bitir(true);
  } else {
    bildir(degisen === "ust" ? "Daha sonra ↓" : "Daha önce ↑", 900);
    if (tahminler.length === HAK) bitir(false);
  }
  ekraniGuncelle(degisen);
  kaydet();
}

function bitir(sonuc) {
  bitti = true;
  kazandi = sonuc;
  if (kazandi) {
    girisEl.classList.add("kazandi");
    bildir(TEBRIK[tahminler.length - 1]);
  } else {
    bildir(buyuk(cevap), 3000);
  }
  if (!alistirma) sonucKaydet(OYUN, HAK, gun, kazandi, tahminler.length);
  sayfa.sonucuGoster({ bitti, kazandi, tahminSayisi: tahminler.length, cevap }, 1700);
}

function kaydet() {
  if (alistirma) return;
  yaz(`${OYUN}.gunluk`, { gun, tahminler, bitti, kazandi });
}

function paylasimMetni() {
  const hedef = SIRA.get(cevap);
  const oklar = tahminler.map((t) => {
    const sira = SIRA.get(t);
    return sira === hedef ? "✅" : sira < hedef ? "⬇️" : "⬆️";
  });
  const skor = kazandi ? tahminler.length : "X";
  const adres = location.origin + location.pathname;
  return `Harfiyen Arada #${gun} ${skor}/${HAK}\n\n${oklar.join("")}\n\n${adres}`;
}

function baslat() {
  kareleriKur(ustEl);
  kareleriKur(altEl);
  kareleriKur(girisEl);
  girisEl.classList.remove("kazandi");
  tahminler = [];
  mevcut = "";
  bitti = false;
  kazandi = false;
  ust = 0;
  alt = SOZLUK.length - 1;

  cevap = alistirma
    ? CEVAPLAR[Math.floor(Math.random() * CEVAPLAR.length)]
    : gununKelimesi(CEVAPLAR, gun, OYUN);

  if (!alistirma) {
    const kayit = oku(`${OYUN}.gunluk`, null);
    if (kayit && kayit.gun === gun) {
      kayit.tahminler.forEach(uygula);
      bitti = kayit.bitti;
      kazandi = kayit.kazandi;
      if (bitti) sayfa.sonucuGoster({ bitti, kazandi, tahminSayisi: tahminler.length, cevap }, 400);
    }
  }
  ekraniGuncelle();
}

baslat();
