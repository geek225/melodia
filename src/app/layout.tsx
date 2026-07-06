import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { RealtimeProvider } from "@/components/RealtimeProvider";
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
  title: "Melodia - Ton histoire. Ta musique.",
  description: "Créez votre musique générée par IA avec Melodia. Exprimez vos sentiments à travers la musique.",
  openGraph: {
    title: "Melodia - Ton histoire. Ta musique.",
    description: "Créez votre musique générée par IA avec Melodia.",
    images: [{ url: "https://melodia.vercel.app/images/logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
