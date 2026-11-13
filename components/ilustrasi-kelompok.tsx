import type { KelompokId } from "@/lib/types";
import { warnaKelompok } from "@/lib/warna-kelompok";

const GELAP = "#0f1b2d";
const KUNING = "#ffc93c";

// Ilustrasi vektor per kelompok masalah, dipakai saat laporan tidak punya foto
export function IlustrasiKelompok({ kelompok, className = "" }: { kelompok: KelompokId; className?: string }) {
  const { kuat: K, muda: M } = warnaKelompok[kelompok];
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className={className}>
      <rect width="400" height="300" fill={M} />
      <circle cx="330" cy="60" r="95" fill="#fff" opacity="0.55" />
      <circle cx="40" cy="250" r="80" fill={K} opacity="0.07" />
      <rect y="250" width="400" height="50" fill={K} opacity="0.1" />
      {kelompok === "jalan" && (
        <g>
          <circle cx="86" cy="72" r="24" fill={KUNING} />
          <polygon points="70,300 330,300 222,118 178,118" fill="#2b3a55" />
          <rect x="196" y="268" width="8" height="24" rx="2" fill="#fff" />
          <rect x="197" y="226" width="6" height="16" rx="2" fill="#fff" />
          <rect x="198" y="194" width="4" height="11" rx="1" fill="#fff" />
          <rect x="199" y="170" width="3" height="8" fill="#fff" />
          <rect x="199.5" y="152" width="2" height="5" fill="#fff" />
          <ellipse cx="246" cy="258" rx="32" ry="11" fill="#121a2a" />
          <ellipse cx="246" cy="255" rx="32" ry="11" fill="none" stroke="#56688c" strokeWidth="3" />
          <polygon points="300,270 334,270 317,198" fill="#f97316" />
          <rect x="309" y="230" width="16" height="7" fill="#fff" />
          <rect x="305" y="249" width="24" height="7" fill="#fff" />
          <rect x="293" y="267" width="48" height="9" rx="2" fill="#c2410c" />
        </g>
      )}
      {kelompok === "lingkungan" && (
        <g>
          <ellipse cx="320" cy="132" rx="18" ry="8" fill={K} opacity="0.55" transform="rotate(-30 320 132)" />
          <ellipse cx="78" cy="150" rx="15" ry="7" fill={K} opacity="0.45" transform="rotate(25 78 150)" />
          <ellipse cx="352" cy="196" rx="11" ry="5" fill={K} opacity="0.5" transform="rotate(15 352 196)" />
          <rect x="190" y="112" width="30" height="14" rx="5" fill="#075c37" />
          <rect x="150" y="124" width="110" height="20" rx="6" fill="#075c37" />
          <rect x="160" y="142" width="90" height="118" rx="10" fill={K} />
          <rect x="180" y="160" width="6" height="84" rx="3" fill="#fff" opacity="0.28" />
          <rect x="202" y="160" width="6" height="84" rx="3" fill="#fff" opacity="0.28" />
          <rect x="224" y="160" width="6" height="84" rx="3" fill="#fff" opacity="0.28" />
          <polygon points="281,214 299,214 290,200" fill="#334155" />
          <ellipse cx="290" cy="244" rx="38" ry="30" fill="#334155" />
          <ellipse cx="108" cy="252" rx="32" ry="22" fill="#475569" />
          <polygon points="102,232 114,232 108,222" fill="#475569" />
        </g>
      )}
      {kelompok === "fasilitas" && (
        <g>
          <circle cx="100" cy="124" r="36" fill={KUNING} opacity="0.35" />
          <rect x="96" y="112" width="8" height="150" rx="2" fill={GELAP} opacity="0.8" />
          <rect x="82" y="100" width="36" height="14" rx="4" fill={GELAP} />
          <circle cx="100" cy="118" r="7" fill={KUNING} />
          <rect x="296" y="178" width="14" height="84" rx="3" fill="#7c5a3a" />
          <circle cx="303" cy="158" r="46" fill={K} opacity="0.8" />
          <circle cx="272" cy="182" r="28" fill={K} opacity="0.6" />
          <circle cx="334" cy="184" r="26" fill={K} opacity="0.6" />
          <rect x="150" y="180" width="120" height="11" rx="3" fill={K} />
          <rect x="150" y="196" width="120" height="9" rx="3" fill={K} opacity="0.8" />
          <rect x="146" y="212" width="128" height="12" rx="3" fill={K} />
          <rect x="158" y="224" width="8" height="34" rx="2" fill={GELAP} opacity="0.7" />
          <rect x="254" y="224" width="8" height="34" rx="2" fill={GELAP} opacity="0.7" />
        </g>
      )}
      {kelompok === "administrasi" && (
        <g>
          <rect x="160" y="64" width="140" height="184" rx="10" fill="#fff" opacity="0.7" transform="rotate(8 230 156)" />
          <rect x="120" y="78" width="146" height="186" rx="10" fill="#fff" stroke="#e2e0d8" strokeWidth="2" />
          <rect x="140" y="104" width="84" height="9" rx="4" fill={K} />
          <rect x="140" y="130" width="104" height="6" rx="3" fill={GELAP} opacity="0.15" />
          <rect x="140" y="148" width="92" height="6" rx="3" fill={GELAP} opacity="0.15" />
          <rect x="140" y="166" width="104" height="6" rx="3" fill={GELAP} opacity="0.15" />
          <rect x="140" y="184" width="70" height="6" rx="3" fill={GELAP} opacity="0.15" />
          <circle cx="244" cy="226" r="34" fill={M} stroke={K} strokeWidth="5" />
          <polyline points="230,226 241,237 260,214" fill="none" stroke={K} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <g transform="rotate(28 320 170)">
            <rect x="314" y="112" width="13" height="104" rx="6" fill={GELAP} opacity="0.8" />
            <polygon points="314,216 327,216 320.5,232" fill={KUNING} />
          </g>
        </g>
      )}
      {kelompok === "ketertiban" && (
        <g>
          <rect x="146" y="140" width="8" height="122" rx="2" fill={GELAP} opacity="0.7" />
          <circle cx="150" cy="104" r="48" fill="#fff" stroke="#dc2626" strokeWidth="10" />
          <text x="150" y="123" textAnchor="middle" fontSize="54" fontWeight="800" fontFamily="system-ui, sans-serif" fill="#1e48d4">
            P
          </text>
          <line x1="117" y1="71" x2="183" y2="137" stroke="#dc2626" strokeWidth="9" />
          <polygon points="236,208 262,176 320,176 346,208" fill={K} />
          <polygon points="248,206 267,182 290,182 290,206" fill="#fff" opacity="0.75" />
          <polygon points="297,206 297,182 316,182 334,206" fill="#fff" opacity="0.75" />
          <rect x="210" y="204" width="156" height="44" rx="14" fill={K} />
          <circle cx="248" cy="250" r="15" fill={GELAP} />
          <circle cx="328" cy="250" r="15" fill={GELAP} />
          <circle cx="248" cy="250" r="5" fill="#fff" opacity="0.6" />
          <circle cx="328" cy="250" r="5" fill="#fff" opacity="0.6" />
        </g>
      )}
      {kelompok === "integritas" && (
        <g>
          <ellipse cx="96" cy="240" rx="36" ry="11" fill="#e0a20f" />
          <rect x="60" y="214" width="72" height="26" fill="#f0b429" />
          <ellipse cx="96" cy="214" rx="36" ry="11" fill={KUNING} />
          <path d="M200 58 L272 86 V158 C272 208 238 240 200 256 C162 240 128 208 128 158 V86 Z" fill={K} />
          <polyline points="170,156 194,180 234,132" fill="none" stroke="#fff" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="314" cy="186" r="28" fill="#fff" stroke={GELAP} strokeOpacity="0.7" strokeWidth="8" />
          <line x1="334" y1="206" x2="358" y2="232" stroke={GELAP} strokeOpacity="0.7" strokeWidth="11" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
