// Her oyun sayfasının ortak parçaları: mod seçici, ilk ziyarette yardım,
// istatistik/sonuç penceresi ve paylaşma.

import { buyuk } from "./turkce.js";
import { bugununNumarasi, yeniGuneKalan, sureYaz } from "./gunluk.js";
import { oku, yaz } from "./depo.js";
import { istatistikOku, guncelSeri } from "./istatistik.js";
import { pencereAc, pencereleriBagla, paylas } from "./arayuz.js";

/**
 * ayarlar:
 *   oyun, hak, tebrik
 *   yeniOyun      : alıştırma modunda "Yeni kelime" düğmesine basılınca
 *   paylasimMetni : () => paylaşılacak metin
 * Döner: { alistirma, gun, sonucuGoster(durum) }
 *   durum = { bitti, kazandi, tahminSayisi, cevap }
 */
export function sayfaKur({ oyun, hak, tebrik, yeniOyun, paylasimMetni }) {
  const alistirma = new URLSearchParams(location.search).get("mod") === "alistirma";
  const gun = bugununNumarasi();
  let durum = { bitti: false };
  let geriSayim;

  document.getElementById("mod-gunluk").classList.toggle("secili", !alistirma);
  document.getElementById("mod-alistirma").classList.toggle("secili", alistirma);
  document.getElementById("gun-no").textContent = alistirma ? "Alıştırma" : `#${gun}`;

  function doldur() {
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
      const vurgu = durum.bitti && durum.kazandi && !alistirma && durum.tahminSayisi === i + 1;
      satir.innerHTML = `<span>${i + 1}</span><div class="cubuk${vurgu ? " vurgu" : ""}" style="width:${Math.max(8, (adet / enCok) * 100)}%">${adet}</div>`;
      dagilim.appendChild(satir);
    });

    document.getElementById("oyun-sonu").hidden = !durum.bitti;
    if (!durum.bitti) return;

    document.getElementById("sonuc-baslik").textContent = durum.kazandi
      ? tebrik[durum.tahminSayisi - 1]
      : "Bu sefer olmadı";
    const kelimeLink = document.getElementById("sonuc-kelime");
    kelimeLink.textContent = buyuk(durum.cevap);
    kelimeLink.href = `https://sozluk.gov.tr/?kelime=${encodeURIComponent(durum.cevap)}`;

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

  function ac() {
    doldur();
    pencereAc("sonuc-penceresi");
  }

  document.getElementById("istatistik-ac").addEventListener("click", ac);
  document.getElementById("paylas").addEventListener("click", () => paylas(paylasimMetni()));
  document.getElementById("yeni-kelime").addEventListener("click", () => {
    document.getElementById("sonuc-penceresi").close();
    durum = { bitti: false };
    yeniOyun();
  });
  pencereleriBagla();

  if (!oku(`${oyun}.yardim-goruldu`, false)) {
    pencereAc("yardim-penceresi");
    yaz(`${oyun}.yardim-goruldu`, true);
  }

  return {
    alistirma,
    gun,
    sonucuGoster(yeniDurum, gecikme = 0) {
      durum = yeniDurum;
      setTimeout(ac, gecikme);
    },
  };
}
