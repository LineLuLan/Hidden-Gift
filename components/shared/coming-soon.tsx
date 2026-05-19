import Link from "next/link";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  notes?: string[];
}

export function ComingSoon({ icon: Icon, title, description, notes }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </header>

      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="bg-accent text-primary inline-flex h-14 w-14 items-center justify-center rounded-full">
            <Icon className="h-7 w-7" />
          </div>
          <p className="font-medium">Sắp ra mắt</p>
          <p className="text-muted-foreground max-w-md text-sm">
            Tính năng này đang được xây dựng. Hiện tại bạn có thể bắt đầu với{" "}
            <Link href="/wishes" className="text-primary hover:underline">
              Điều ước
            </Link>
            .
          </p>
          {notes && notes.length > 0 ? (
            <ul className="text-muted-foreground mt-2 max-w-md space-y-1 text-left text-xs">
              {notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span aria-hidden>•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <Button asChild variant="ghost" size="sm" className="mt-3">
            <Link href="/">← Về trang chủ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
