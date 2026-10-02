// Küçük bildirimler, pencereler ve paylaşma.

export function bildir(mesaj, sure = 1600) {
  const kap = document.getElementById("bildirimler");
  const el = document.createElement("div");
  el.className = "bildirim";
  el.textContent = mesaj;
  kap.prepend(el);
  setTimeout(() => {
    el.classList.add("gidiyor");
    setTimeout(() => el.remove(), 300);
  }, sure);
}

export function pencereAc(id) {
  const pencere = document.getElementById(id);
  if (!pencere.open) pencere.showModal();
}

// Pencerelerdeki kapat düğmeleri ve dışına tıklayınca kapanma.
export function pencereleriBagla() {
  for (const pencere of document.querySelectorAll("dialog")) {
    pencere.addEventListener("click", (e) => {
      if (e.target === pencere || e.target.closest("[data-kapat]")) pencere.close();
    });
  }
  for (const btn of document.querySelectorAll("[data-ac]")) {
    btn.addEventListener("click", () => pencereAc(btn.dataset.ac));
  }
}

export async function paylas(metin) {
  const dokunmatik = window.matchMedia("(pointer: coarse)").matches;
  if (dokunmatik && navigator.share) {
    try {
      await navigator.share({ text: metin });
      return;
    } catch (hata) {
      if (hata.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(metin);
    bildir("Sonuç kopyalandı");
  } catch {
    bildir("Kopyalanamadı");
  }
}
