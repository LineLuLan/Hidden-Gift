"use client";

import { useTransition } from "react";
import { Gift, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { claimWish, unclaimWish } from "@/lib/wishes/actions";

interface ClaimButtonProps {
  wishId: string;
  /** If the current user already claimed this wish, pass the secret id so they can unclaim. */
  myClaimSecretId?: string;
  /** Whether someone else already claimed (warning copy will change). */
  someoneElseClaimed?: boolean;
}

export function ClaimButton({ wishId, myClaimSecretId, someoneElseClaimed }: ClaimButtonProps) {
  const [pending, startTransition] = useTransition();

  if (myClaimSecretId) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          if (!confirm("Huỷ chuẩn bị quà này? Bạn có thể claim lại sau.")) return;
          startTransition(async () => {
            const r = await unclaimWish(myClaimSecretId);
            if (!r.ok) toast.error(r.error ?? "Lỗi huỷ");
            else toast.success("Đã huỷ claim");
          });
        }}
      >
        <X className="h-4 w-4" />
        Huỷ chuẩn bị
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() => {
        const warning = someoneElseClaimed
          ? "Đã có người trong nhóm chuẩn bị quà này. Bạn vẫn muốn claim song song?"
          : "Bạn sẽ âm thầm chuẩn bị quà này. Người ấy sẽ không biết đến khi bạn đánh dấu Đã tặng.";
        if (!confirm(warning)) return;
        startTransition(async () => {
          const r = await claimWish(wishId);
          if (!r.ok) toast.error(r.error ?? "Lỗi claim");
          else toast.success("Đã claim — bí mật giữa nhóm 🤫");
        });
      }}
    >
      <Gift className="h-4 w-4" />
      Tôi sẽ chuẩn bị
    </Button>
  );
}
