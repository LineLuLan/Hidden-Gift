import type { Metadata } from "next";
import { Mail } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";
import { requireUser } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Thư hẹn giờ" };

export default async function LettersPage() {
  await requireUser();
  return (
    <ComingSoon
      icon={Mail}
      title="Thư hẹn giờ"
      description="Viết thư cho người ấy giao vào ngày bạn chọn — sinh nhật, kỷ niệm 100 ngày, hoặc đơn giản là một ngày bình thường."
      notes={[
        "Cần Trigger.dev (xem docs/API-KEYS-GUIDE.md §5) để schedule delivery",
        "Cần partner link để chọn người nhận",
        "Tiptap rich text editor đã có trong stack, sẽ wire UI sau",
      ]}
    />
  );
}
