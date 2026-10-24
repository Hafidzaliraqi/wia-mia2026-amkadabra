import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { PenyediaToast } from "@/components/toast";
import { situs } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${situs.nama}: ${situs.tagline}`,
    template: `%s | ${situs.nama}`,
  },
  description: situs.deskripsi,
  applicationName: situs.nama,
};

export const viewport = { themeColor: "#1f4fa8" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <PenyediaToast>{children}</PenyediaToast>
      </body>
    </html>
  );
}
