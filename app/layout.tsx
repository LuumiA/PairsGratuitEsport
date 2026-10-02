import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://pairs-gratuit-esport-t7ro.vercel.app";
const DESCRIPTION =
  "Paris esport 100% gratuits sur Valorant, CS2 et League of Legends — points fictifs, quiz quotidien, groupes d'amis et classement.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PairsGratuitEsport",
    template: "%s · PairsGratuitEsport",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "PairsGratuitEsport",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "PairsGratuitEsport",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PairsGratuitEsport",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a12",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster theme="dark" richColors position="top-center" />
      </body>
    </html>
  );
}
