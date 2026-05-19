import type { Metadata } from "next";
import { Bell } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";
import { requireUser } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Emoji Ping" };

export default async function PingsPage() {
  await requireUser();
  return (
    <ComingSoon
      icon={Bell}
      title="Emoji Ping"
      description="Gửi emoji cho partner trong nháy mắt. Cảm xúc tức thời, không cần lời nói."
      notes={[
        "Cần partner link để gửi ping",
        "Supabase Realtime đã enable ở migration 004",
        "UI nút floating + toast nhận ping sẽ ra mắt sau invite flow",
      ]}
    />
  );
}
