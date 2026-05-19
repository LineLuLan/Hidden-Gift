import type { Metadata } from "next";
import { Image as ImageIcon } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";
import { requireUser } from "@/lib/auth/server";
import { features } from "@/lib/env";

export const metadata: Metadata = { title: "Kỷ niệm" };

export default async function MemoriesPage() {
  await requireUser();
  return (
    <ComingSoon
      icon={ImageIcon}
      title="Kỷ niệm"
      description="Album ảnh và video chung của hai người. Cùng nhau lưu giữ những khoảnh khắc."
      notes={[
        features.r2
          ? "Cloudflare R2 đã cấu hình ✓ — UI upload sẽ ra mắt sớm"
          : "Cần Cloudflare R2 (xem docs/API-KEYS-GUIDE.md §4) cho upload ảnh/video",
        "Cần partner link để share album",
        "Free tier 10GB miễn phí egress",
      ]}
    />
  );
}
