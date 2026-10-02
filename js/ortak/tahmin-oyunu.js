// Harf tahminine dayalı oyunların ortak altyapısı: tahta, klavye, günlük kayıt,
// istatistik, sonuç penceresi ve paylaşma. Oyunlar sadece kurallarını verir.

import { CEVAPLAR, GECERLI } from "../kelimeler.js";
import { buyuk } from "./turkce.js";
import { bugununNumarasi, gununKelimesi, yeniGuneKalan, sureYaz } from "./gunluk.js";
import { oku, yaz } from "./depo.js";
import { istatistikOku, sonucKaydet, guncelSeri } from "./istatistik.js";
import { klavyeKur } from "./klavye.js";
import { bildir, pencereAc, pencereleriBagla, paylas } from "./arayuz.js";

const UZUNLUK = 5;
const CEVIRME_ARASI = 280; // ms, harflerin sırayla dönmesi
const EMOJI = { dogru: "🟦", var: "🟧", yok: "⬛" };

/**
 * ayarlar:
 *   oyun        : kayıt anahtarı ("klasik", "palavra")
 *   ad          : paylaşımda görünen ad ("Klasik")
 *   hak         : tahmin hakkı
 *   tebrik      : her tahmin sayısı için kazanma mesajı (hak uzunluğunda)
 *   renkler     : (tahmin, cevap, satirNo, tohum) => ["dogru" | "var" | "yok", ...]
 *   klavyeBoya  : tuşlar renklensin mi (varsayılan true)
 */
export function tahminOyunuKur(ayarlar) {
  const { oyun, ad, hak, tebrik, renkler, klavyeBoya = true } = ayarlar;

  const alistirma = new URLSearchParams(location.search).get("mod") === "alistirma";
  const gun = bugununNumarasi();

  let cevap;
  let tohum; // oyuna özel rastgelelik (günlükte herkes için aynı)
  let tahminler = [];
  let mevcut = "";
  let bitti = false;
  let kazandi = false;
  let kilitli = false;

  const tahta = document.getElementById("tahta");
  const klavye = klavyeKur(document.getElementById("klavye"), tusaBasildi);

  function tahtaKur() {
    tahta.innerHTML = "";
    tahta.style.setProperty("--satir-sayisi", hak);
    for (let s = 0; s < hak; s++) {
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
  const satirRenkleri = (tahmin, i) => renkler(tahmin, cevap, i, tohum);

  function mevcutSatiriCiz() {
    const kareler = satirEl(tahminler.length).children;
    for (let h = 0; h < UZUNLUK; h++) {
      const harf = mevcut[h] || "";
      kareler[h].textContent = buyuk(harf);
      kareler[h].classList.toggle("dolu", Boolean(harf));
    }
  }

  function satiriBoya(i, tahmin, animasyonlu) {
    const sonuc = satirRenkleri(tahmin, i);
    const kareler = satirEl(i).children;
    sonuc.forEach((durum, h) => {
      const kare = kareler[h];
      kare.textContent = buyuk(tahmin[h]);
      const boya = () => {
        kare.dataset.durum = durum;
        if (klavyeBoya) klavye.boya(tahmin[h], durum);
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
    } else if (tahminler.length === hak) {
      bitir(false);
    }
    kaydet();
  }

  function bitir(sonuc) {
    bitti = true;
    kazandi = sonuc;
    if (kazandi) {
      satirEl(tahminler.length - 1).classList.add("kazandi");
      bildir(tebrik[tahminler.length - 1]);
    } else {
      bildir(buyuk(cevap), 3000);
    }
    if (!alistirma) sonucKaydet(oyun, hak, gun, kazandi, tahminler.length);
    setTimeout(sonucPenceresiniAc, 1700);
  }

  function kaydet() {
    if (alistirma) return;
    yaz(`${oyun}.gunluk`, { gun, tahminler, bitti, kazandi });
  }

  function paylasimMetni() {
    const satirlar = tahminler.map((t, i) =>
      satirRenkleri(t, i).map((d) => EMOJI[d]).join("")
    );
    const skor = kazandi ? tahminler.length : "X";
    const adres = location.origin + location.pathname;
    return `Harfiyen ${ad} #${gun} ${skor}/${hak}\n\n${satirlar.join("\n")}\n\n${adres}`;
  }

  // ---- Sonuç ve istatistik penceresi ----

  let geriSayim;

  function sonucPenceresiniAc() {
    istatistikleriDoldur();
    pencereAc("sonuc-penceresi");
  }

  function istatistikleriDoldur() {
    const ist = istatistikOku(oyun, hak);
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

    document.getElementById("oyun-sonu").hidden = !bitti;
    if (!bitti) return;

    document.getElementById("sonuc-baslik").textContent = kazandi
      ? tebrik[tahminler.length - 1]
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
      tohum = Math.floor(Math.random() * 1e9);
      return;
    }

    cevap = gununKelimesi(CEVAPLAR, gun, oyun);
    tohum = gun;
    const kayit = oku(`${oyun}.gunluk`, null);
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

  if (!oku(`${oyun}.yardim-goruldu`, false)) {
    pencereAc("yardim-penceresi");
    yaz(`${oyun}.yardim-goruldu`, true);
  }

  // Oyuna özel eklemeler (ör. Palavra'da kareleri işaretleme) için.
  return {
    tahta,
    tahminSayisi: () => tahminler.length,
  };
}
