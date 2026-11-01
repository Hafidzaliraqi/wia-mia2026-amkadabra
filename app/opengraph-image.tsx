import { ImageResponse } from "next/og";

// Gambar pratinjau saat tautan website dibagikan (WhatsApp, LinkedIn, dsb.)
export const alt = "Tuntasin: lapor sekali, pantau sampai tuntas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function GambarPratinjau() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0a1322", color: "white", padding: "72px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "#1e48d4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          <div style={{ fontSize: 44, fontWeight: 800 }}>Tuntasin</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            <span style={{ marginRight: 20 }}>Lapor sekali, pantau sampai</span>
            <span style={{ color: "#ffc93c" }}>tuntas.</span>
          </div>
          <div style={{ fontSize: 30, color: "#c9d6ec" }}>Diteruskan otomatis ke instansi yang tepat, tenggat terbuka untuk publik, dan selesai setelah warga mengonfirmasi.</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["Terkirim", "Diteruskan", "Dikerjakan", "Konfirmasi", "Selesai"].map((t, i) => (
            <div key={t} style={{ display: "flex", padding: "10px 20px", borderRadius: 999, fontSize: 24, background: i < 3 ? "#1e48d4" : "#1b2c4a", color: i < 3 ? "white" : "#9fb2d3" }}>{t}</div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
