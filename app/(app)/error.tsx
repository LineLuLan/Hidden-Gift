"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry hook will land here once SENTRY_DSN is wired.
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-12">
      <Card>
        <CardHeader>
          <div className="bg-destructive/10 text-destructive inline-flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="mt-3">Đã xảy ra lỗi</CardTitle>
          <CardDescription>
            Có gì đó không ổn ở phía bọn mình. Bạn có thể thử lại hoặc về trang chủ.
            {error.digest ? (
              <span className="mt-2 block text-xs">
                Mã sự cố: <code className="font-mono">{error.digest}</code>
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={reset}>Thử lại</Button>
          <Button asChild variant="ghost">
            <Link href="/">Về trang chủ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
