import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Suspense } from "react";

import { Toaster } from "@/components/ui/sonner";
import { PostHogProvider } from "@/components/analytics/posthog-provider";

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

// Inline pre-hydration script reads localStorage and applies .dark class
// before React mounts, eliminating flash of incorrect theme.
const THEME_BOOT = `
(function() {
  try {
    var t = localStorage.getItem('hidden-gift-theme') || 'system';
    var isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
    document.documentElement.dataset.theme = t;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <Suspense fallback={null}>
          <PostHogProvider>{children}</PostHogProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
