import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Xác nhận email" };

interface VerifyPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { email } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Kiểm tra hộp thư</CardTitle>
        <CardDescription>
          {email
            ? `Bọn mình vừa gửi link xác nhận tới ${email}. Mở email và bấm vào link để kích hoạt tài khoản.`
            : "Bọn mình vừa gửi link xác nhận tới email của bạn. Bấm vào link để kích hoạt tài khoản."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-3 text-sm">
        <p>Không thấy email? Kiểm tra mục Spam hoặc Promotions.</p>
        <p>
          Email vẫn không tới?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Quay lại đăng nhập
          </Link>{" "}
          và yêu cầu gửi lại.
        </p>
      </CardContent>
      <CardFooter>
        <Link href="/" className="text-primary text-sm hover:underline">
          ← Về trang chủ
        </Link>
      </CardFooter>
    </Card>
  );
}
