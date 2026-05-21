import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Gift, Mail, Image as ImageIcon, Bell, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Hidden Gift — Bí mật yêu thương cho hai người",
  description:
    "App couple Việt Nam: ghi điều ước, chuẩn bị quà bí mật, thư hẹn giờ, lưu kỷ niệm. Bí mật được enforce ngay tầng database.",
};

const FEATURES = [
  {
    icon: Heart,
    title: "Điều ước riêng tư",
    description:
      "Ghi điều bạn muốn nhận. Partner KHÔNG thấy — bí mật enforce ngay tầng database (RLS), không phải UI trick.",
  },
  {
    icon: Gift,
    title: "Quà bí mật",
    description:
      "Chuẩn bị quà cho người ấy mà họ không hề hay biết. Đúng ngày bấm Tặng — họ mới thấy.",
  },
  {
    icon: Mail,
    title: "Thư hẹn giờ",
    description:
      "Viết thư cho ngày tương lai — sinh nhật, 100 ngày, kỷ niệm. Hệ thống giao đúng lúc.",
  },
  {
    icon: ImageIcon,
    title: "Kỷ niệm chung",
    description:
      "Album ảnh/video chia sẻ riêng giữa hai người. Lưu khoảnh khắc, không bị lẫn vào Facebook.",
  },
  {
    icon: Bell,
    title: "Ping nhau",
    description: "Gửi 1 emoji là partner thấy ngay — realtime. Cách nhanh nhất để nói nhớ.",
  },
] as const;

export default function WelcomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
      {/* Hero */}
      <section className="space-y-6 text-center">
        <span className="bg-accent text-accent-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
          <ShieldCheck className="h-3.5 w-3.5" />
          Bí mật ở tầng database, không phải UI
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Bí mật yêu thương <br className="hidden sm:inline" />
          <span className="text-primary">cho hai người</span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          App couple Việt Nam. Ghi điều ước, chuẩn bị quà bí mật, gửi thư hẹn giờ, lưu kỷ niệm —
          partner không thể thấy đến khi bạn muốn họ thấy.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Bắt đầu miễn phí</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Tôi đã có tài khoản</Link>
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          Miễn phí 100% trong giai đoạn Beta · Không yêu cầu thẻ
        </p>
      </section>

      {/* Features grid */}
      <section className="mt-16 grid gap-4 sm:mt-24 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title}>
              <CardHeader>
                <div className="bg-accent text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3">{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      {/* Trust strip */}
      <section className="mt-16 rounded-xl border p-6 sm:mt-24 sm:p-10">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Tại sao &ldquo;bí mật&rdquo; không chỉ là khẩu hiệu?
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Phần lớn app couple ẩn nội dung ở giao diện. Nếu partner inspect mạng hoặc database,
              mọi thứ lộ. Hidden Gift dùng Postgres Row-Level Security: ngay cả query trực tiếp với
              token của partner cũng trả về 0 dòng.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Dành cho ai?</h2>
            <ul className="text-muted-foreground mt-2 space-y-1.5 text-sm">
              <li>• Couple Gen Z muốn giữ riêng tư mà vẫn chia sẻ kỷ niệm</li>
              <li>• Long-distance — thư hẹn giờ + ping realtime</li>
              <li>• Người crush thầm — Solo mode (sắp ra mắt)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-16 text-center sm:mt-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Sẵn sàng có một góc riêng?
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Tạo tài khoản trong 30 giây. Mời partner bằng 1 link.
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link href="/signup">Tạo tài khoản miễn phí</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
