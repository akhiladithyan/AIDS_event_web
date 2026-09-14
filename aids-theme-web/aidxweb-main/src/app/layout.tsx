import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque, Manrope, Anton, Poppins, Audiowide, Rajdhani } from "next/font/google";
import "./globals.css";

import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { MenuProvider } from "@/context/MenuContext";
import CyberParticles from "@/components/ui/CyberParticles";
import CustomCursor from "@/components/ui/CustomCursor";
import { Toaster } from "sonner";
import AnnouncementBanner from "@/components/ui/AnnouncementBanner";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const audiowide = Audiowide({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-audiowide",
  display: "swap",
});

const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIDEX'26 — Doomsday Technical Event | Vel Tech Multi Tech",
  description: "AIDEX'26 — Enter the Doomsday Protocol. A high-stakes national technical symposium powered by AI, intelligence, and advanced engineering.",
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/vtmt.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.png',
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bricolage.variable} ${manrope.variable} ${anton.variable} ${poppins.variable} ${audiowide.variable} ${rajdhani.variable} antialiased`} suppressHydrationWarning>
        <MenuProvider>
          <AnnouncementBanner />
          <CyberParticles />
          <CustomCursor />
          <ErrorReporter />
          <Toaster position="top-center" richColors theme="dark" />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
          />
          {children}

        </MenuProvider>
      </body>
    </html>
  );
}
