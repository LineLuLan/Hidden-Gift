"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart, Users, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import { markOnboarded, saveCrushProfile } from "@/lib/crush/actions";
import { generateInviteCode } from "@/lib/account/actions";

type Mode = "couple" | "solo";

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<Mode | null>(null);
  const [crushNickname, setCrushNickname] = useState("");
  const [crushBio, setCrushBio] = useState("");
  const [crushEmoji, setCrushEmoji] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const finish = (selectedMode: Mode) => {
    startTransition(async () => {
      if (selectedMode === "solo" && crushNickname.trim().length > 0) {
        const fd = new FormData();
        fd.set("nickname", crushNickname);
        fd.set("bio", crushBio);
        fd.set("emoji", crushEmoji);
        fd.set("status", "crushing");
        const r1 = await saveCrushProfile(null, fd);
        if (!r1.ok) {
          toast.error(r1.error ?? "Không lưu được crush");
          return;
        }
      }
      const r = await markOnboarded(selectedMode);
      if (!r.ok) {
        toast.error(r.error ?? "Lỗi cập nhật");
        return;
      }
      toast.success("Sẵn sàng rồi 💝");
      router.push("/");
      router.refresh();
    });
  };

  const handleGenerateCode = () => {
    startTransition(async () => {
      const r = await generateInviteCode();
      if (r.ok && r.code) {
        setInviteCode(r.code);
      } else {
        toast.error(r.error ?? "Không tạo được mã");
      }
    });
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs tracking-wide uppercase">
            Bước {step} / 3
          </span>
          {step > 1 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(((step - 1) as 1 | 2 | 3) || 1)}
              disabled={pending}
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>
          ) : null}
        </div>

        {step === 1 ? (
          <>
            <CardTitle className="text-2xl">Bạn đang ở trạng thái nào?</CardTitle>
            <CardDescription>
              Chọn mode để app gợi ý đúng tính năng cho bạn. Đổi bất cứ lúc nào ở Cài đặt.
            </CardDescription>
          </>
        ) : step === 2 ? (
          <>
            <CardTitle className="text-2xl">
              {mode === "solo" ? "Kể mình về crush" : "Mời partner ngay?"}
            </CardTitle>
            <CardDescription>
              {mode === "solo"
                ? "Hoàn toàn private — partner sau này cũng không thấy. Có thể bỏ qua."
                : "Gửi mã mời cho người yêu để cùng dùng Bí mật / Thư hẹn giờ / Ping."}
            </CardDescription>
          </>
        ) : (
          <>
            <CardTitle className="text-2xl">Sẵn sàng!</CardTitle>
            <CardDescription>Mình đã set up xong. Tới khám phá nha.</CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 1 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ModeOption
              icon={Users}
              title="Đang yêu / có người yêu"
              description="2 người dùng chung tài khoản. Mở khoá Bí mật, Thư hẹn giờ, Ping."
              selected={mode === "couple"}
              onClick={() => {
                setMode("couple");
                setStep(2);
              }}
            />
            <ModeOption
              icon={Heart}
              title="Đang crush thầm"
              description="Solo mode. Ghi nhật ký, lưu kỷ niệm với crush riêng tư tuyệt đối."
              selected={mode === "solo"}
              onClick={() => {
                setMode("solo");
                setStep(2);
              }}
            />
          </div>
        ) : null}

        {step === 2 && mode === "solo" ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="emoji">Emoji cho crush (tuỳ chọn)</Label>
              <Input
                id="emoji"
                value={crushEmoji}
                onChange={(e) => setCrushEmoji(e.target.value)}
                maxLength={10}
                placeholder="🌸"
                className="w-24"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nickname">Tên hoặc biệt danh</Label>
              <Input
                id="nickname"
                value={crushNickname}
                onChange={(e) => setCrushNickname(e.target.value)}
                maxLength={80}
                placeholder="Ví dụ: cô bé tóc ngắn lớp Anh 2"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Vì sao crush? (tuỳ chọn)</Label>
              <Textarea
                id="bio"
                value={crushBio}
                onChange={(e) => setCrushBio(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Cái gì làm bạn rung động..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setStep(3)}
                disabled={pending || crushNickname.trim().length === 0}
              >
                Tiếp tục
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCrushNickname("");
                  setCrushBio("");
                  setCrushEmoji("");
                  setStep(3);
                }}
              >
                Bỏ qua bước này
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 && mode === "couple" ? (
          <div className="space-y-3">
            {inviteCode ? (
              <div className="bg-accent rounded-md border p-3 text-sm">
                <p className="text-muted-foreground text-xs">Mã mời</p>
                <p className="mt-1 font-mono text-lg tracking-widest">{inviteCode}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  Copy mã hoặc URL <code>/invite/{inviteCode}</code> gửi cho partner.
                </p>
              </div>
            ) : (
              <Button onClick={handleGenerateCode} disabled={pending}>
                {pending ? "Đang tạo..." : "Tạo mã mời ngay"}
              </Button>
            )}
            <div className="flex gap-2">
              <Button onClick={() => setStep(3)} disabled={pending}>
                Tiếp tục
              </Button>
              <Button variant="ghost" onClick={() => setStep(3)}>
                Để sau, vào app trước
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="bg-accent rounded-md p-4 text-sm">
              <p className="font-medium">Tóm tắt:</p>
              <ul className="text-muted-foreground mt-2 space-y-1">
                <li>
                  • Mode: <strong>{mode === "solo" ? "Solo Crush" : "Couple"}</strong>
                </li>
                {mode === "solo" && crushNickname ? (
                  <li>
                    • Crush:{" "}
                    <strong>
                      {crushEmoji} {crushNickname}
                    </strong>
                  </li>
                ) : null}
                {mode === "couple" && inviteCode ? (
                  <li>
                    • Mã mời: <code className="font-mono">{inviteCode}</code>
                  </li>
                ) : null}
              </ul>
            </div>
            <Button onClick={() => finish(mode ?? "couple")} disabled={pending} className="w-full">
              {pending ? "Đang lưu..." : "Bắt đầu dùng Hidden Gift 💝"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ModeOption({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "border-border hover:border-primary/40 rounded-lg border p-4 text-left transition-colors",
        selected && "border-primary ring-primary/20 ring-2",
      )}
    >
      <div className="bg-accent text-primary inline-flex h-10 w-10 items-center justify-center rounded-md">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </button>
  );
}
