import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "SOCIÉTÉ DU VIDE | High-End Slow Fashion",
    template: "%s | SOCIÉTÉ DU VIDE",
  },
  description: "Calm, intellectual luxury. Exploring the space between being and nothingness through refined garments.",
  keywords: ["luxury fashion", "slow fashion", "limited drop", "streetwear", "société du vide", "high-end clothing"],
  openGraph: {
    title: "SOCIÉTÉ DU VIDE",
    description: "Calm, intellectual luxury. Exploring the space between being and nothingness through refined garments.",
    siteName: "SOCIÉTÉ DU VIDE",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOCIÉTÉ DU VIDE",
    description: "Calm, intellectual luxury. Limited drop slow fashion.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased text-foreground bg-background selection:bg-black selection:text-white`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
