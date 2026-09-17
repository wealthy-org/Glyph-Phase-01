import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Glyph — Economic Being #001",
  description: "A persistent digital being with an observable economic life.",
  applicationName: "Glyph",
  authors: [{ name: "Glyph Protocol" }],
  keywords: ["economic entity", "autonomous agent", "economic being", "observation interface"],
  openGraph: {
    title: "Glyph — Economic Being #001",
    description: "A persistent digital being with an observable economic life.",
    type: "website",
    locale: "en_US",
    siteName: "Glyph",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glyph — Economic Being #001",
    description: "A persistent digital being with an observable economic life.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark bg-[#080808] text-[#F5F5F5] antialiased selection:bg-[#242424] selection:text-[#F5F5F5]`}
    >
      <body className="min-h-screen bg-[#080808] text-[#F5F5F5] font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}
