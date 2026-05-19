"use client";

import { useTransition } from "react";
import { Heart, Users, UsersRound, Home } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { setAccountKind } from "@/lib/account/actions";

interface ModeSwitcherProps {
  currentKind: "solo" | "couple" | "squad" | "family";
  memberCount: number;
  isOwner: boolean;
}

const MODES = [
  {
    kind: "couple" as const,
    label: "Couple",
    icon: Heart,
    capacity: 2,
    desc: "2 người. Bí mật / thư hẹn giờ / ping.",
  },
  {
    kind: "squad" as const,
    label: "Squad",
    icon: UsersRound,
    capacity: 8,
    desc: "Tới 8 người. Bạn bè thân, group chat ảo.",
  },
  {
    kind: "family" as const,
    label: "Family",
    icon: Home,
    capacity: 12,
    desc: "Tới 12 người. Gia đình lớn.",
  },
];

export function ModeSwitcher({ currentKind, memberCount, isOwner }: ModeSwitcherProps) {
  const [pending, startTransition] = useTransition();

  if (currentKind === "solo") {
    return null; // Solo mode managed from /crush page
  }

  if (!isOwner) {
    return null;
  }

  const handleSwitch = (kind: "couple" | "squad" | "family") => {
    if (kind === currentKind) return;
    const mode = MODES.find((m) => m.kind === kind)!;
    if (memberCount > mode.capacity) {
      toast.error(`${mode.label} chỉ tối đa ${mode.capacity} người (bạn có ${memberCount})`);
      return;
    }
    if (!confirm(`Đổi sang ${mode.label} mode? Tính năng sẽ adapt theo số người.`)) return;
    startTransition(async () => {
      const r = await setAccountKind(kind);
      if (!r.ok) toast.error(r.error ?? "Lỗi đổi mode");
      else toast.success(`Đã chuyển sang ${mode.label}`);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mode tài khoản</CardTitle>
        <CardDescription>
          Đổi giữa Couple (2 người) / Squad (tới 8) / Family (tới 12). Solo mode quản lý ở trang
          Crush.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-3">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = currentKind === m.kind;
            const disabled = pending || memberCount > m.capacity;
            return (
              <button
                key={m.kind}
                type="button"
                onClick={() => handleSwitch(m.kind)}
                disabled={disabled}
                aria-pressed={active}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors disabled:opacity-50",
                  active
                    ? "border-primary bg-accent ring-primary/20 ring-2"
                    : "border-border hover:border-primary/40",
                )}
              >
                <div className="bg-background text-primary inline-flex h-9 w-9 items-center justify-center rounded-md border">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-2 text-sm font-medium">
                  {m.label}
                  {active ? (
                    <span className="text-muted-foreground ml-1 text-xs">· hiện tại</span>
                  ) : null}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">{m.desc}</p>
              </button>
            );
          })}
        </div>
        <p className="text-muted-foreground mt-3 text-xs">
          {memberCount}/{MODES.find((m) => m.kind === currentKind)?.capacity ?? 2} thành viên hiện
          tại.
        </p>
      </CardContent>
    </Card>
  );
}

// Re-export for icon usage elsewhere
export { Users };
