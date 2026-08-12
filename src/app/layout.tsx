import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { syncopate, montserrat } from "@/fonts";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "Automobili Lamborghini | Aventador SVJ",
  description: "A luxury automotive digital experience.",
  icons: {
    icon: "https://upload.wikimedia.org/wikipedia/en/d/df/Lamborghini_Logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased dark`}
    >
      <body className={`${syncopate.variable} ${montserrat.variable} font-sans bg-[#050505] text-white overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
