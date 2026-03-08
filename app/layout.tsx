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
  title: "ClawSkillStore Marketplace - Discover 700+ AI Agent Skills",
  description: "The premier marketplace for ClawSkillStore agent skills. Discover, install, and manage 700+ community-built skills to supercharge your AI assistant.",
  keywords: ["ClawSkillStore", "AI", "agent", "skills", "marketplace", "Claude", "MCP", "automation"],
  openGraph: {
    title: "ClawSkillStore Marketplace",
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
