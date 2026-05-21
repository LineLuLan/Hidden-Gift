"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateEmailPrefs, type PrefsActionResult } from "@/lib/preferences/actions";
import type { EmailPrefs } from "@/lib/preferences/schema";

interface EmailPrefsCardProps {
  current: EmailPrefs;
}

const FIELDS: { key: keyof EmailPrefs; label: string; desc: string }[] = [
  {
    key: "letter_delivered",
    label: "Thư hẹn giờ tới",
    desc: "Email khi partner gửi thư hoặc thư của bạn đã giao",
  },
  {
    key: "invite_accepted",
    label: "Lời mời được chấp nhận",
    desc: "Email khi partner nhận lời mời partner/squad/family",
  },
  {
    key: "wrapped_yearly",
    label: "Wrapped cuối năm",
    desc: "Email 1/12 với tổng kết hoạt động cả năm",
  },
  {
    key: "ping_summary",
    label: "Tóm tắt Ping hàng ngày",
    desc: "Email cuối ngày tóm tắt ping (off mặc định)",
  },
];

export function EmailPrefsCard({ current }: EmailPrefsCardProps) {
  const [state, action, pending] = useActionState<PrefsActionResult | null, FormData>(
    updateEmailPrefs,
    null,
  );

  useEffect(() => {
    if (state?.ok) toast.success("Đã lưu");
    else if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông báo email</CardTitle>
        <CardDescription>Chọn loại email bạn muốn nhận. Đổi bất cứ lúc nào.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          {FIELDS.map((f) => (
            <label
              key={f.key}
              className="border-border bg-muted/30 flex items-start gap-3 rounded-md border p-3"
            >
              <input
                type="checkbox"
                name={f.key}
                defaultChecked={current[f.key]}
                className="border-input text-primary focus:ring-ring mt-0.5 h-4 w-4 rounded border"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-muted-foreground text-xs">{f.desc}</p>
              </div>
            </label>
          ))}
          <Button type="submit" disabled={pending}>
            {pending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
