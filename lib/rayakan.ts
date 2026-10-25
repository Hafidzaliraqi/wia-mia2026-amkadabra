// Efek konfeti kecil saat laporan terkirim atau dikonfirmasi selesai.
// Tanpa library, dan otomatis tidak jalan kalau pengguna memilih kurangi gerakan.
export function rayakan() {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const kanvas = document.createElement("canvas");
  kanvas.setAttribute("aria-hidden", "true");
  Object.assign(kanvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "60" });
  document.body.appendChild(kanvas);
  const rasio = window.devicePixelRatio || 1;
  kanvas.width = window.innerWidth * rasio;
  kanvas.height = window.innerHeight * rasio;
  const ctx = kanvas.getContext("2d")!;
  ctx.scale(rasio, rasio);
  const warna = ["#1f4fa8", "#157347", "#d99a1c", "#e6edf9", "#13233d"];
  const partikel = Array.from({ length: 110 }, () => ({
    x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
    y: window.innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 13,
    vy: -Math.random() * 12 - 4,
    putar: Math.random() * Math.PI,
    vputar: (Math.random() - 0.5) * 0.3,
    ukuran: 5 + Math.random() * 6,
    warna: warna[Math.floor(Math.random() * warna.length)],
  }));
  const mulai = performance.now();
  function gambar(t: number) {
    const lewat = t - mulai;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of partikel) {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.putar += p.vputar;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - lewat / 2200);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.putar);
      ctx.fillStyle = p.warna;
      ctx.fillRect(-p.ukuran / 2, -p.ukuran / 4, p.ukuran, p.ukuran / 2);
      ctx.restore();
    }
    if (lewat < 2200) requestAnimationFrame(gambar);
    else kanvas.remove();
  }
  requestAnimationFrame(gambar);
}
