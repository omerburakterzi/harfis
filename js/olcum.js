// Ziyaretçi sayacı: Cloudflare Web Analytics (çerezsiz, kişiyi tanımlamaz).
// Sadece gerçek sitede çalışır; yerel testler istatistiklere karışmasın.
if (location.hostname === "harfoni.com") {
  const betik = document.createElement("script");
  betik.defer = true;
  betik.src = "https://static.cloudflareinsights.com/beacon.min.js";
  betik.dataset.cfBeacon = JSON.stringify({ token: "40955a3e5b0c421eb577b6661b8ab7f4" });
  document.head.appendChild(betik);
}
