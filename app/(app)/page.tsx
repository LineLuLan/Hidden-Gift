import Link from "next/link";
import { Heart, Gift, Mail, Image, Bell, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { getAccountDetail, isPartnerLinked } from "@/lib/account/queries";

interface Feature {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** "always" | "couple" (gated on partner linked) | "soon" (placeholder). */
  status: "always" | "couple" | "soon";
}

const FEATURES: Feature[] = [
  {
    href: "/wishes",
    title: "Điều ước",
    description: "Ghi điều bạn mong nhận. Partner không thấy danh sách này — chỉ riêng bạn.",
    icon: Heart,
    status: "always",
  },
  {
    href: "/secrets",
    title: "Chuẩn bị bí mật",
    description: "Lên kế hoạch quà tặng cho partner. Bí mật cho tới ngày tặng.",
    icon: Gift,
    status: "couple",
  },
  {
    href: "/letters",
    title: "Thư hẹn giờ",
    description: "Viết thư giao vào ngày đã chọn. Sinh nhật, kỷ niệm, hay bất ngờ.",
    icon: Mail,
    status: "couple",
  },
  {
    href: "/pings",
    title: "Emoji Ping",
    description: "Gửi tim cho partner trong nháy mắt. Cảm xúc tức thời, realtime.",
    icon: Bell,
    status: "couple",
  },
  {
    href: "/memories",
    title: "Kỷ niệm",
    description: "Album ảnh + video chung. iPhone HEIC tự convert, resize 2048px.",
    icon: Image,
    status: "always",
  },
];

export default async function HomePage() {
  const user = await requireUser();
  const account = await requireAccount();
  const detail = await getAccountDetail(account.accountId);
  const linked = detail ? isPartnerLinked(detail) : false;

  const greeting =
    (user.user_metadata?.display_name as string | undefined) ?? user.email?.split("@")[0] ?? "bạn";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-1.5">
        <p className="text-muted-foreground text-sm">Chào</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{greeting} ơi 💝</h1>
        <p className="text-muted-foreground max-w-xl">
          Bí mật yêu thương được lưu trữ an toàn ngay trên database. Bắt đầu với một điều ước nhỏ.
        </p>
      </header>

      {!linked ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-accent text-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Mời partner để mở khoá Bí mật, Thư hẹn giờ, Ping</p>
                <p className="text-muted-foreground text-sm">
                  Bạn có thể tạo điều ước riêng ngay. Các tính năng couple cần 2 người.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/settings">Mời partner</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          const isOpen = feature.status === "always" || (feature.status === "couple" && linked);
          const badge = feature.status === "soon" ? "Sắp ra mắt" : isOpen ? "Đã mở" : "Cần partner";

          const content = (
            <Card className={isOpen ? "hover:border-primary/40 transition-colors" : "opacity-60"}>
              <CardHeader>
                <div className="bg-accent text-accent-foreground inline-flex h-10 w-10 items-center justify-center rounded-lg">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">{badge}</p>
              </CardContent>
            </Card>
          );

          return isOpen ? (
            <Link key={feature.href} href={feature.href} className="block">
              {content}
            </Link>
          ) : (
            <div key={feature.href}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
