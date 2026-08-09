import type { Metadata } from "next";
import { Inter, Playfair_Display, Syncopate, Montserrat } from "next/font/google";
import { CinematicLoader } from "@/components/ui/CinematicLoader";
import { CinematicLetterbox } from "@/components/ui/CinematicLetterbox";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Navbar } from "@/components/ui/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const syncopate = Syncopate({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-syncopate",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Automobili Lamborghini | Aventador SVJ",
  description: "A luxury automotive digital experience.",
  icons: {
    icon: "https://upload.wikimedia.org/wikipedia/en/d/df/Lamborghini_Logo.svg",
  },
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
        <CustomCursor />
        <CinematicLoader />
        <CinematicLetterbox />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
