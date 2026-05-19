"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth/actions";

interface GoogleButtonProps {
  label?: string;
  next?: string;
}

export function GoogleButton({ label = "Tiếp tục với Google", next }: GoogleButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await signInWithGoogle(next);
          } catch (error) {
            const message = error instanceof Error ? error.message : "Lỗi đăng nhập Google";
            toast.error(message);
          }
        });
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.9c-.25 1.37-1 2.53-2.13 3.3v2.74h3.43c2-1.85 3.3-4.59 3.3-8.07z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.88 0 5.3-.96 7.07-2.6l-3.43-2.66c-.95.64-2.17 1.02-3.64 1.02-2.8 0-5.18-1.89-6.02-4.43H2.42v2.78A11 11 0 0 0 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.98 14.33A6.6 6.6 0 0 1 5.6 12c0-.81.14-1.59.38-2.33V6.9H2.42A11 11 0 0 0 1 12c0 1.77.42 3.45 1.42 5.1l3.56-2.77z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.57 0 2.97.54 4.08 1.6l3.05-3.05C17.3 2.1 14.88 1 12 1A11 11 0 0 0 2.42 6.9l3.56 2.77C6.82 7.27 9.2 5.38 12 5.38z"
        />
      </svg>
      {pending ? "Đang chuyển..." : label}
    </Button>
  );
}
