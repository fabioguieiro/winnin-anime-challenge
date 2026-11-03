import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

const poppins = localFont({
  src: [
    { path: "./fonts/Poppins-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/Poppins-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Poppins-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BUSCANIME | Encontre seu próximo anime",
  description:
    "Explore animes, busque por título e filtre por formato com dados do AniList.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
