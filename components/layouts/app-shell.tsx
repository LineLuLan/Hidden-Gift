"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Gift, Mail, Image, Bell, Home, LogOut } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/wishes", label: "Điều ước", icon: Heart },
  { href: "/secrets", label: "Bí mật", icon: Gift },
  { href: "/letters", label: "Thư hẹn giờ", icon: Mail },
  { href: "/memories", label: "Kỷ niệm", icon: Image },
  { href: "/pings", label: "Ping", icon: Bell },
];

interface AppShellProps {
  displayName: string;
  children: React.ReactNode;
}

export function AppShell({ displayName, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="bg-background flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="border-border bg-card hidden w-64 shrink-0 flex-col border-r md:flex">
        <div className="border-border flex h-16 items-center border-b px-6">
          <Link href="/" className="text-primary text-lg font-semibold tracking-tight">
            Hidden Gift
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {NAV.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-border space-y-2 border-t p-4">
          <p className="text-muted-foreground px-3 text-xs">Xin chào</p>
          <p className="px-3 text-sm font-medium">{displayName}</p>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <header className="border-border bg-card sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 md:hidden">
          <Link href="/" className="text-primary font-semibold">
            Hidden Gift
          </Link>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="icon" aria-label="Đăng xuất">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="border-border bg-card sticky bottom-0 z-10 flex items-stretch border-t md:hidden">
          {NAV.slice(0, 5).map((item) => {
            const active =
              pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
