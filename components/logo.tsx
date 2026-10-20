import Link from "next/link";
import { situs } from "@/lib/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg" aria-label={`${situs.nama}, ke beranda`}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="9" className="fill-rambu" />
        <path
          d="M16 6.5c-4.1 0-7.4 3.2-7.4 7.3 0 4.9 6.1 10.6 6.8 11.2a.9.9 0 0 0 1.2 0c.7-.6 6.8-6.3 6.8-11.2 0-4.1-3.3-7.3-7.4-7.3z"
          fill="white"
        />
        <path
          d="M12.9 13.9l2.2 2.2 4-4.2"
          fill="none"
          className="stroke-rambu"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-lg font-extrabold tracking-tight">{situs.nama}</span>
    </Link>
  );
}
