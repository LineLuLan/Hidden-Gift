import type { Metadata } from "next";
import { Gift } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";
import { requireUser } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Bí mật" };

export default async function SecretsPage() {
  await requireUser();
  return (
    <ComingSoon
      icon={Gift}
      title="Bí mật"
      description="Chuẩn bị quà tặng cho partner. Bí mật tuyệt đối cho tới ngày tặng — partner không thể thấy ngay cả khi truy cập database."
      notes={[
        "Cần liên kết với partner trước khi tạo bí mật (Phase 1.5)",
        "RLS asymmetric visibility đã sẵn sàng ở tầng database",
        "UI compose + reveal flow sẽ ra mắt sau khi invite link work",
      ]}
    />
  );
}
