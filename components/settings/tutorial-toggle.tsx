"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { restartTutorial } from "@/lib/tutorial/actions";

export function TutorialToggle() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const r = await restartTutorial();
          if (!r.ok) {
            toast.error(r.error ?? "Không bật lại được hướng dẫn");
            return;
          }
          toast.success("Hướng dẫn sẽ chạy lại khi bạn quay về Trang chủ");
          router.push("/");
        });
      }}
    >
      <Sparkles className="h-4 w-4" />
      Bật lại hướng dẫn
    </Button>
  );
}
