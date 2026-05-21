"use client";

import { useState, useTransition } from "react";
import { Copy, Check, RefreshCw, Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateInviteCode } from "@/lib/account/actions";
import { env } from "@/lib/env";

interface InviteCardProps {
  initialCode: string | null;
  isOwner: boolean;
  alreadyLinked: boolean;
}

export function InviteCard({ initialCode, isOwner, alreadyLinked }: InviteCardProps) {
  const [code, setCode] = useState<string | null>(initialCode);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const inviteUrl = code ? `${env.NEXT_PUBLIC_APP_URL}/invite/${code}` : null;

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateInviteCode();
      if (!result.ok) {
        toast.error(result.error ?? "Không tạo được mã");
        return;
      }
      setCode(result.code ?? null);
      toast.success("Đã tạo mã mời mới");
    });
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Đã copy link mời");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không copy được — copy thủ công nha");
    }
  };

  const handleShare = async () => {
    if (!inviteUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Hidden Gift — Lời mời",
          text: "Tham gia Hidden Gift với mình nhé",
          url: inviteUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  if (alreadyLinked) {
    return (
      <Card>
        <CardHeader>
          <div className="bg-accent text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg">
            <Heart className="h-5 w-5" />
          </div>
          <CardTitle className="mt-2">Đã liên kết partner</CardTitle>
          <CardDescription>
            Hai bạn đã ở chung một tài khoản couple. Sẵn sàng để chuẩn bị bí mật cho nhau.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lời mời</CardTitle>
          <CardDescription>
            Chỉ chủ tài khoản tạo được mã mời. Nhờ partner tạo và gửi link cho bạn.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mời partner</CardTitle>
        <CardDescription>
          Gửi link này cho người yêu. Khi họ bấm vào và đăng nhập, hai bạn sẽ ở chung một tài khoản
          couple. Mã chỉ dùng được 1 lần.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {code ? (
          <>
            <div className="bg-muted rounded-md border p-3">
              <p className="text-muted-foreground text-xs">Mã mời</p>
              <p className="mt-1 font-mono text-lg tracking-widest">{code}</p>
            </div>
            <div className="bg-muted overflow-x-auto rounded-md border p-3">
              <p className="text-muted-foreground text-xs">Link mời</p>
              <p className="mt-1 text-sm break-all">{inviteUrl}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCopy} variant="outline" disabled={!inviteUrl}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Đã copy" : "Copy link"}
              </Button>
              <Button onClick={handleShare} disabled={!inviteUrl}>
                Chia sẻ
              </Button>
              <Button
                onClick={handleGenerate}
                variant="ghost"
                disabled={pending}
                title="Tạo mã mới — mã cũ vô hiệu"
              >
                <RefreshCw className="h-4 w-4" />
                {pending ? "Đang tạo..." : "Mã mới"}
              </Button>
            </div>
          </>
        ) : (
          <Button onClick={handleGenerate} disabled={pending}>
            {pending ? "Đang tạo..." : "Tạo mã mời"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
