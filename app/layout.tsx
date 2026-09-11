import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppServiceWorker } from "@/app/serwist";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Doujin Treasure Map",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Doujin Treasure Map",
  },
  description: "自分で作る、同人誌即売会当日のための宝の地図。",
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/app-icon-192.png",
    icon: "/icons/app-icon-192.png",
  },
  title: "Doujin Treasure Map",
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppServiceWorker>{children}</AppServiceWorker>
      </body>
    </html>
  );
}
