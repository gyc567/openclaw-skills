import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenCreditAi - AI Economy. Open Credit. Infinite Potential.",
  description: "The premier marketplace for AI agent skills. Build, monetize, and discover capabilities that power the open AI economy.",
  keywords: ["OpenCreditAi", "AI", "agent", "skills", "marketplace", "AI Economy", "Open Credit"],
  openGraph: {
    title: "OpenCreditAi Marketplace",
    description: "Discover 700+ community-built AI agent skills",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
