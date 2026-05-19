"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateProfile, type AccountActionResult } from "@/lib/account/actions";

interface ProfileFormProps {
  currentDisplayName: string | null;
}

export function ProfileForm({ currentDisplayName }: ProfileFormProps) {
  const [state, action, pending] = useActionState<AccountActionResult | null, FormData>(
    updateProfile,
    null,
  );

  useEffect(() => {
    if (state?.ok) toast.success("Đã lưu tên hiển thị");
  }, [state]);

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="displayName">Tên hiển thị</Label>
        <Input
          id="displayName"
          name="displayName"
          required
          maxLength={50}
          defaultValue={currentDisplayName ?? ""}
          placeholder="Linh"
        />
        <p className="text-muted-foreground text-xs">
          Tên này hiện trên sidebar và xuất hiện trong thông báo gửi cho partner.
        </p>
      </div>

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu tên hiển thị"}
      </Button>
    </form>
  );
}
