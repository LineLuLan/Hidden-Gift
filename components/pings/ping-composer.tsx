"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { sendPing } from "@/lib/pings/actions";

const PRESET_EMOJIS = ["❤️", "💝", "🥰", "😘", "🤗", "😴", "🍜", "☕", "🌸", "✨", "🎉", "🥲"];

interface PingComposerProps {
  partnerName: string;
}

export function PingComposer({ partnerName }: PingComposerProps) {
  const [emoji, setEmoji] = useState<string>("❤️");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSend = (formData: FormData) => {
    startTransition(async () => {
      formData.set("emoji", emoji);
      formData.set("message", message);
      const result = await sendPing(formData);
      if (!result.ok) {
        toast.error(result.error ?? "Không gửi được");
        return;
      }
      toast.success(`Đã gửi ${emoji} tới ${partnerName}`);
      setMessage("");
    });
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div>
          <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">Chọn emoji</p>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
            {PRESET_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                aria-pressed={emoji === e}
                className={cn(
                  "hover:bg-accent flex h-10 items-center justify-center rounded-md border text-xl transition-colors",
                  emoji === e ? "border-primary bg-accent" : "border-border",
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <form action={handleSend} className="space-y-2">
          <Input
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
            placeholder={`Gửi kèm vài chữ tới ${partnerName}... (tuỳ chọn)`}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Đang gửi..." : `Gửi ${emoji} tới ${partnerName}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
