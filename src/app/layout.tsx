import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";

export const metadata: Metadata = {
  title: "NusaPhone Official — Pusat Jual Beli & Tukar Tambah Smartphone Bergaransi",
  description:
    "Platform jual beli HP Baru & Second berkualitas dengan laporan QC 35+ titik, jaminan IMEI permanen, dan fitur Tukar Tambah instan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col antialiased selection:bg-brand-600 selection:text-white">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
