import type { Metadata } from "next";
import localFont from "next/font/local";
import { PenyediaToast } from "@/components/toast";
import { situs } from "@/lib/site";
import "./globals.css";

// Font ditanam langsung di project (tidak perlu internet ke Google Fonts)
const jakarta = localFont({
  src: "./fonts/plus-jakarta-sans.woff2",
  variable: "--font-jakarta",
  weight: "200 800",
  display: "swap",
});
const bricolage = localFont({
  src: "./fonts/bricolage-grotesque.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
});
const jetbrains = localFont({
  src: "./fonts/jetbrains-mono.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${situs.nama}: ${situs.tagline}`,
    template: `%s | ${situs.nama}`,
  },
  description: situs.deskripsi,
  applicationName: situs.nama,
};

export const viewport = { themeColor: "#0a1322" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${bricolage.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <PenyediaToast>{children}</PenyediaToast>
      </body>
    </html>
  );
}
