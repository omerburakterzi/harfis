import { CEVAPLAR, GECERLI } from "../kelimeler.js";
import { buyuk } from "../ortak/turkce.js";
import { bugununNumarasi, gununKelimesi, yeniGuneKalan, sureYaz } from "../ortak/gunluk.js";
import { oku, yaz } from "../ortak/depo.js";
import { istatistikOku, sonucKaydet, guncelSeri } from "../ortak/istatistik.js";
import { degerlendir } from "../ortak/degerlendir.js";
import { klavyeKur } from "../ortak/klavye.js";
import { bildir, pencereAc, pencereleriBagla, paylas } from "../ortak/arayuz.js";

const OYUN = "klasik";
const HAK = 6;
const UZUNLUK = 5;
const CEVIRME_ARASI = 280; // ms, harflerin sırayla dönmesi
const TEBRIK = ["Dâhiyane!", "Muhteşem!", "Harika!", "Çok iyi!", "Güzel!", "Kıl payı!"];
const EMOJI = { dogru: "🟦", var: "🟧", yok: "⬛" };

const alistirma = new URLSearchParams(location.search).get("mod") === "alistirma";
const gun = bugununNumarasi();

let cevap;
let tahminler = [];
let mevcut = "";
let bitti = false;
let kazandi = false;
let kilitli = false;

const tahta = document.getElementById("tahta");
const klavye = klavyeKur(document.getElementById("klavye"), tusaBasildi);

function tahtaKur() {
  tahta.innerHTML = "";
  for (let s = 0; s < HAK; s++) {
    const satir = document.createElement("div");
    satir.className = "satir";
    for (let h = 0; h < UZUNLUK; h++) {
      const kare = document.createElement("div");
      kare.className = "kare";
      satir.appendChild(kare);
    }
    tahta.appendChild(satir);
  }
}

const satirEl = (i) => tahta.children[i];

function mevcutSatiriCiz() {
  const kareler = satirEl(tahminler.length).children;
  for (let h = 0; h < UZUNLUK; h++) {
    const harf = mevcut[h] || "";
    kareler[h].textContent = buyuk(harf);
    kareler[h].classList.toggle("dolu", Boolean(harf));
  }
}

function satiriBoya(i, tahmin, animasyonlu) {
  const sonuc = degerlendir(tahmin, cevap);
  const kareler = satirEl(i).children;
  sonuc.forEach((durum, h) => {
    const kare = kareler[h];
    kare.textContent = buyuk(tahmin[h]);
    const boya = () => {
      kare.dataset.durum = durum;
      klavye.boya(tahmin[h], durum);
    };
    if (animasyonlu) {
      kare.style.animationDelay = `${h * CEVIRME_ARASI}ms`;
      kare.classList.add("donuyor");
      setTimeout(boya, h * CEVIRME_ARASI + 250);
    } else {
      boya();
    }
  });
  const sure = animasyonlu ? (UZUNLUK - 1) * CEVIRME_ARASI + 500 : 0;
  return new Promise((bitince) => setTimeout(bitince, sure));
}

function salla() {
  const satir = satirEl(tahminler.length);
  satir.classList.remove("salla");
  void satir.offsetWidth; // animasyonu yeniden başlatmak için
  satir.classList.add("salla");
}

function tusaBasildi(tus) {
  if (bitti || kilitli) return;
  if (tus === "gir") return gonder();
  if (tus === "sil") {
    mevcut = mevcut.slice(0, -1);
  } else if (mevcut.length < UZUNLUK) {
    mevcut += tus;
    const kare = satirEl(tahminler.length).children[mevcut.length - 1];
    kare.classList.remove("zipla");
    void kare.offsetWidth;
    kare.classList.add("zipla");
  }
  mevcutSatiriCiz();
}

async function gonder() {
  if (mevcut.length < UZUNLUK) {
    salla();
    return bildir("Harf sayısı yetersiz");
  }
  if (!GECERLI.has(mevcut)) {
    salla();
    return bildir("Sözlükte yok");
  }

  const tahmin = mevcut;
  const satir = tahminler.length;
  mevcut = "";
  tahminler.push(tahmin);
  kilitli = true;
  await satiriBoya(satir, tahmin, true);
  kilitli = false;

  if (tahmin === cevap) {
    bitir(true);
  } else if (tahminler.length === HAK) {
    bitir(false);
  }
  kaydet();
}

function bitir(sonuc) {
  bitti = true;
  kazandi = sonuc;
  if (kazandi) {
    const satir = satirEl(tahminler.length - 1);
    satir.classList.add("kazandi");
    bildir(TEBRIK[tahminler.length - 1]);
  } else {
    bildir(buyuk(cevap), 3000);
  }
  if (!alistirma) sonucKaydet(OYUN, HAK, gun, kazandi, tahminler.length);
  setTimeout(sonucPenceresiniAc, 1700);
}

function kaydet() {
  if (alistirma) return;
  yaz(`${OYUN}.gunluk`, { gun, tahminler, bitti, kazandi });
}

function paylasimMetni() {
  const satirlar = tahminler.map((t) =>
    degerlendir(t, cevap).map((d) => EMOJI[d]).join("")
  );
  const skor = kazandi ? tahminler.length : "X";
  const adres = location.origin + location.pathname;
  return `Harfiyen Klasik #${gun} ${skor}/${HAK}\n\n${satirlar.join("\n")}\n\n${adres}`;
}

// ---- Sonuç ve istatistik penceresi ----

let geriSayim;

function sonucPenceresiniAc() {
  istatistikleriDoldur();
  pencereAc("sonuc-penceresi");
}

function istatistikleriDoldur() {
  const ist = istatistikOku(OYUN, HAK);
  document.getElementById("ist-baslik").textContent = alistirma
    ? "Günlük oyun istatistikleri"
    : "İstatistikler";
  const sayi = (id, deger) => (document.getElementById(id).textContent = deger);
  sayi("ist-oynanan", ist.oynanan);
  sayi("ist-yuzde", ist.oynanan ? Math.round((ist.kazanilan / ist.oynanan) * 100) : 0);
  sayi("ist-seri", guncelSeri(ist, gun));
  sayi("ist-en-uzun", ist.enUzunSeri);

  const dagilim = document.getElementById("dagilim");
  dagilim.innerHTML = "";
  const enCok = Math.max(1, ...ist.dagilim);
  ist.dagilim.forEach((adet, i) => {
    const satir = document.createElement("div");
    satir.className = "dagilim-satir";
    const vurgu = bitti && kazandi && !alistirma && tahminler.length === i + 1;
    satir.innerHTML = `<span>${i + 1}</span><div class="cubuk${vurgu ? " vurgu" : ""}" style="width:${Math.max(8, (adet / enCok) * 100)}%">${adet}</div>`;
    dagilim.appendChild(satir);
  });

  const sonucBolumu = document.getElementById("oyun-sonu");
  sonucBolumu.hidden = !bitti;
  if (!bitti) return;

  document.getElementById("sonuc-baslik").textContent = kazandi
    ? TEBRIK[tahminler.length - 1]
    : "Bu sefer olmadı";
  const kelimeLink = document.getElementById("sonuc-kelime");
  kelimeLink.textContent = buyuk(cevap);
  kelimeLink.href = `https://sozluk.gov.tr/?kelime=${encodeURIComponent(cevap)}`;

  document.getElementById("paylas").hidden = alistirma;
  document.getElementById("yeni-kelime").hidden = !alistirma;
  document.getElementById("geri-sayim-kutu").hidden = alistirma;

  clearInterval(geriSayim);
  if (!alistirma) {
    const guncelle = () => {
      const kalan = yeniGuneKalan();
      document.getElementById("geri-sayim").textContent = sureYaz(kalan);
      if (kalan < 1000) setTimeout(() => location.reload(), 1500);
    };
    guncelle();
    geriSayim = setInterval(guncelle, 1000);
  }
}

// ---- Başlangıç ----

function baslat() {
  tahtaKur();
  klavye.temizle();
  mevcut = "";
  bitti = false;
  kazandi = false;
  tahminler = [];

  if (alistirma) {
    cevap = CEVAPLAR[Math.floor(Math.random() * CEVAPLAR.length)];
    return;
  }

  cevap = gununKelimesi(CEVAPLAR, gun);
  const kayit = oku(`${OYUN}.gunluk`, null);
  if (kayit && kayit.gun === gun) {
    tahminler = kayit.tahminler;
    tahminler.forEach((t, i) => satiriBoya(i, t, false));
    bitti = kayit.bitti;
    kazandi = kayit.kazandi;
    if (bitti) setTimeout(sonucPenceresiniAc, 400);
  }
}

document.getElementById("mod-gunluk").classList.toggle("secili", !alistirma);
document.getElementById("mod-alistirma").classList.toggle("secili", alistirma);
document.getElementById("gun-no").textContent = alistirma ? "Alıştırma" : `#${gun}`;

document.getElementById("istatistik-ac").addEventListener("click", sonucPenceresiniAc);
document.getElementById("paylas").addEventListener("click", () => paylas(paylasimMetni()));
document.getElementById("yeni-kelime").addEventListener("click", () => {
  document.getElementById("sonuc-penceresi").close();
  baslat();
});
pencereleriBagla();

baslat();

if (!oku("yardim-goruldu", false)) {
  pencereAc("yardim-penceresi");
  yaz("yardim-goruldu", true);
}
