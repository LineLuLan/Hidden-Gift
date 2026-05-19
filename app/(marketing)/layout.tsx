/**
 * @file app/(marketing)/layout.tsx
 * @description Public marketing layout. No auth gate — anyone can view.
 *              Hero-style header with simple top nav.
 */

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border/60 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/welcome" className="text-primary font-semibold tracking-tight">
            Hidden Gift
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground hidden px-3 py-1.5 sm:inline"
            >
              Về 100B Studio
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Bắt đầu miễn phí</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-border/60 border-t py-6">
        <div className="text-muted-foreground mx-auto max-w-5xl px-4 text-xs">
          © {new Date().getFullYear()} Hidden Gift · 100B Studio · Made with 💝 in Hà Nội
        </div>
      </footer>
    </div>
  );
}
