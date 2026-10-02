// Tarayıcı hafızası. Gizli sekmede ya da kapalıysa sessizce çalışmaya devam eder.

const ONEK = "harfis.";

export function oku(anahtar, varsayilan) {
  try {
    const deger = localStorage.getItem(ONEK + anahtar);
    return deger === null ? varsayilan : JSON.parse(deger);
  } catch {
    return varsayilan;
  }
}

export function yaz(anahtar, deger) {
  try {
    localStorage.setItem(ONEK + anahtar, JSON.stringify(deger));
  } catch {
    // hafıza kullanılamıyor; oyun yine oynanır, sadece kaydedilmez
  }
}
