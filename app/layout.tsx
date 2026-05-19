import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hidden Gift — Bí mật yêu thương cho hai người",
    template: "%s | Hidden Gift",
  },
  description:
    "Ghi điều ước, chuẩn bị quà bí mật, gửi thư hẹn giờ, lưu kỷ niệm cùng người ấy. Bí mật được enforce ngay tầng database.",
  applicationName: "Hidden Gift",
  authors: [{ name: "100B Studio" }],
  keywords: ["couple", "quà tặng", "kỷ niệm", "letters", "wishes"],
  formatDetection: {
    email: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
