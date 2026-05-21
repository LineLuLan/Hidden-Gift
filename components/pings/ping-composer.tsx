"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { sendPing } from "@/lib/pings/actions";

const PRESET_EMOJIS = ["❤️", "💝", "🥰", "😘", "🤗", "😴", "🍜", "☕", "🌸", "✨", "🎉", "🥲"];

interface PingComposerProps {
  /** All eligible recipients (account members excluding the current user). */
  recipients: { id: string; name: string }[];
}

export function PingComposer({ recipients }: PingComposerProps) {
  const [emoji, setEmoji] = useState<string>("❤️");
  const [message, setMessage] = useState("");
  const [recipientId, setRecipientId] = useState<string>(recipients[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  const currentRecipient = recipients.find((r) => r.id === recipientId) ?? recipients[0];
  const showPicker = recipients.length > 1;

  const handleSend = (formData: FormData) => {
    startTransition(async () => {
      formData.set("emoji", emoji);
      formData.set("message", message);
      formData.set("recipientId", recipientId);
      const result = await sendPing(formData);
      if (!result.ok) {
        toast.error(result.error ?? "Không gửi được");
        return;
      }
      toast.success(`Đã gửi ${emoji} tới ${currentRecipient?.name ?? "người ấy"}`);
      setMessage("");
    });
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        {showPicker ? (
          <div className="space-y-1.5">
            <Label htmlFor="ping-recipient">Gửi tới</Label>
            <select
              id="ping-recipient"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
            >
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

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
            placeholder={`Gửi kèm vài chữ tới ${currentRecipient?.name ?? "người ấy"}... (tuỳ chọn)`}
          />
          <Button type="submit" className="w-full" disabled={pending || !recipientId}>
            {pending ? "Đang gửi..." : `Gửi ${emoji} tới ${currentRecipient?.name ?? "người ấy"}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
