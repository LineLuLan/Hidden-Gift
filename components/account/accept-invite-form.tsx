"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/lib/account/actions";

interface AcceptInviteFormProps {
  code: string;
  inviterName: string | null;
}

export function AcceptInviteForm({ code, inviterName }: AcceptInviteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleAccept = () => {
    startTransition(async () => {
      const result = await acceptInvite(code);
      if (!result.ok) {
        toast.error(result.error ?? "Không nhận được lời mời");
        return;
      }
      toast.success(`Bạn đã trở thành partner của ${inviterName ?? "đối phương"} 💝`);
      router.push("/");
      router.refresh();
    });
  };

  return (
    <Button onClick={handleAccept} className="w-full" disabled={pending}>
      {pending ? "Đang xử lý..." : "Nhận lời mời và liên kết"}
    </Button>
  );
}
