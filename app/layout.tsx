import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NavAtas, NavAtasTampilan, NavBawah, NavBawahTampilan } from "@/components/navigasi";
import { Footer } from "@/components/footer";
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] font-sans md:pb-0">
        {/* Suspense dibutuhkan karena menu membaca alamat halaman (usePathname) */}
        <Suspense fallback={<NavAtasTampilan pathname={null} />}>
          <NavAtas />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
        <Suspense fallback={<NavBawahTampilan pathname={null} />}>
          <NavBawah />
        </Suspense>
      </body>
    </html>
  );
}
