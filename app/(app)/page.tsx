import Link from "next/link";
import { Heart, Gift, Mail, Image, Bell } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/server";

interface Feature {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
}

const FEATURES: Feature[] = [
  {
    href: "/wishes",
    title: "Điều ước",
    description: "Ghi điều bạn mong nhận. Partner không thấy danh sách này — chỉ riêng bạn.",
    icon: Heart,
    available: true,
  },
  {
    href: "/secrets",
    title: "Chuẩn bị bí mật",
    description: "Lên kế hoạch quà tặng cho partner. Bí mật cho tới ngày tặng.",
    icon: Gift,
    available: false,
  },
  {
    href: "/letters",
    title: "Thư hẹn giờ",
    description: "Viết thư giao vào ngày đã chọn. Sinh nhật, kỷ niệm, hay bất ngờ.",
    icon: Mail,
    available: false,
  },
  {
    href: "/memories",
    title: "Kỷ niệm",
    description: "Album ảnh + video chung. Cùng nhau lưu giữ khoảnh khắc.",
    icon: Image,
    available: false,
  },
  {
    href: "/pings",
    title: "Emoji Ping",
    description: "Gửi tim cho partner trong nháy mắt. Cảm xúc tức thời.",
    icon: Bell,
    available: false,
  },
];

export default async function HomePage() {
  const user = await requireUser();
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          const content = (
            <Card
              className={
                feature.available ? "hover:border-primary/40 transition-colors" : "opacity-60"
              }
            >
              <CardHeader>
                <div className="bg-accent text-accent-foreground inline-flex h-10 w-10 items-center justify-center rounded-lg">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  {feature.available ? "Đã mở" : "Sắp ra mắt"}
                </p>
              </CardContent>
            </Card>
          );

          return feature.available ? (
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
