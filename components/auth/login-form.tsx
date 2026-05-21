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
import { signInWithEmail, type ActionResult } from "@/lib/auth/actions";
import { GoogleButton } from "@/components/auth/google-button";

interface LoginFormProps {
  googleEnabled: boolean;
  next?: string;
}

export function LoginForm({ googleEnabled, next }: LoginFormProps) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    signInWithEmail,
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Đăng nhập</CardTitle>
        <CardDescription>Quay lại với điều ước và bí mật của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {next ? <input type="hidden" name="next" value={next} /> : null}
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
              autoComplete="current-password"
              aria-invalid={Boolean(state?.fieldErrors?.password)}
            />
            {state?.fieldErrors?.password?.[0] ? (
              <p className="text-destructive text-xs">{state.fieldErrors.password[0]}</p>
            ) : null}
          </div>

          {state?.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Đang đăng nhập..." : "Đăng nhập"}
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
            <GoogleButton next={next} />
          </>
        ) : null}
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <span className="text-muted-foreground">Chưa có tài khoản?&nbsp;</span>
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Đăng ký
        </Link>
      </CardFooter>
    </Card>
  );
}
