// Tohumlu rastgele sayı üreteci: aynı tohum her cihazda aynı sayıları verir.
// Günlük oyunlarda herkesin aynı bulmacayı görmesi için gerekli.
export function rastgeleUretec(tohum) {
  let durum = tohum >>> 0;
  return function () {
    durum = (durum + 0x6d2b79f5) >>> 0;
    let t = durum;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
