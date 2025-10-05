import { Manrope, Cinzel, Inter, Ballet } from "next/font/google";

export const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const display = Cinzel({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "900"],
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const script = Ballet({
  subsets: ["latin"],
  variable: "--font-script",
  weight: "400",
});
