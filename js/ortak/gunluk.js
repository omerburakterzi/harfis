// Günün numarası herkes için aynı olsun diye Türkiye saatine göre hesaplanır.
// Türkiye 2016'dan beri sürekli UTC+3.

const BASLANGIC = Date.UTC(2026, 9, 1); // 1 Ekim 2026 = 1. gün
const TURKIYE_FARKI = 3 * 60 * 60 * 1000;
const GUN = 24 * 60 * 60 * 1000;

export function bugununNumarasi(simdi = Date.now()) {
  return Math.floor((simdi + TURKIYE_FARKI - BASLANGIC) / GUN) + 1;
}

export function yeniGuneKalan(simdi = Date.now()) {
  const turkiyeSaati = simdi + TURKIYE_FARKI;
  return GUN - (turkiyeSaati % GUN);
}

export function sureYaz(ms) {
  const toplam = Math.floor(ms / 1000);
  const ikiHane = (n) => String(n).padStart(2, "0");
  return `${ikiHane(Math.floor(toplam / 3600))}:${ikiHane(Math.floor((toplam % 3600) / 60))}:${ikiHane(toplam % 60)}`;
}

// Cevap listesinden günün kelimesini seçer. Her oyun listede farklı bir
// yerden başlar ki aynı gün iki oyunda aynı kelime çıkmasın.
export function gununKelimesi(liste, gun, oyun = "") {
  let kaydirma = 0;
  for (const harf of oyun) kaydirma = (kaydirma * 31 + harf.charCodeAt(0)) % liste.length;
  const sira = (((gun - 1 + kaydirma) % liste.length) + liste.length) % liste.length;
  return liste[sira];
}
