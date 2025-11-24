import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "SpeedTest Indonesia",
  description: "Tes kecepatan internet Anda dengan server lokal Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${plusJakarta.className} bg-slate-950 text-slate-50 antialiased selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
