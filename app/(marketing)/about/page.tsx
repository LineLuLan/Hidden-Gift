import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Về 100B Studio" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
      <header className="space-y-3">
        <p className="text-primary text-xs font-medium tracking-widest uppercase">Về chúng tôi</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">100B Studio</h1>
      </header>

      <div className="text-foreground/90 mt-6 space-y-4 text-base leading-relaxed">
        <p>
          100B Studio là team 3 người ở Hà Nội — 1 BE Lead, 1 Frontend Dev, 1 PM. Tụi mình build sản
          phẩm cho người Việt với chuẩn engineering quốc tế.
        </p>
        <p>
          Hidden Gift xuất phát từ một câu hỏi đơn giản: tại sao app couple ở Việt Nam chưa có cái
          nào enforce bí mật thật sự ở tầng database? Tụi mình quyết định build cái đầu tiên.
        </p>
        <p>
          Giai đoạn Beta hiện tại miễn phí 100% — tụi mình ưu tiên feedback hơn doanh thu. Khi đủ
          traction, sẽ có Pro tier (tham khảo: 29k/tháng hoặc 149k/năm).
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/signup">Thử ngay</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/welcome">← Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
