"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signUpWithEmail, type ActionResult } from "@/lib/auth/actions";
import { GoogleButton } from "@/components/auth/google-button";

interface SignupFormProps {
  googleEnabled: boolean;
}

export function SignupForm({ googleEnabled }: SignupFormProps) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    signUpWithEmail,
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
        <CardDescription>Bắt đầu ghi điều ước và chuẩn bị bí mật cùng người ấy.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Tên hiển thị</Label>
            <Input
              id="displayName"
              name="displayName"
              required
              autoComplete="given-name"
              placeholder="Linh"
              aria-invalid={Boolean(state?.fieldErrors?.displayName)}
            />
            {state?.fieldErrors?.displayName?.[0] ? (
              <p className="text-destructive text-xs">{state.fieldErrors.displayName[0]}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="ban@example.com"
              aria-invalid={Boolean(state?.fieldErrors?.email)}
            />
            {state?.fieldErrors?.email?.[0] ? (
              <p className="text-destructive text-xs">{state.fieldErrors.email[0]}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              aria-invalid={Boolean(state?.fieldErrors?.password)}
            />
            {state?.fieldErrors?.password?.[0] ? (
              <p className="text-destructive text-xs">{state.fieldErrors.password[0]}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              aria-invalid={Boolean(state?.fieldErrors?.confirmPassword)}
            />
            {state?.fieldErrors?.confirmPassword?.[0] ? (
              <p className="text-destructive text-xs">{state.fieldErrors.confirmPassword[0]}</p>
            ) : null}
          </div>

          {state?.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Đang tạo..." : "Tạo tài khoản"}
          </Button>
        </form>

        {googleEnabled ? (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="border-border w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card text-muted-foreground px-2">Hoặc</span>
              </div>
            </div>
            <GoogleButton label="Đăng ký với Google" />
          </>
        ) : null}
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <span className="text-muted-foreground">Đã có tài khoản?&nbsp;</span>
        <Link href="/login" className="text-primary font-medium hover:underline">
          Đăng nhập
        </Link>
      </CardFooter>
    </Card>
  );
}
