import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronLeft, Sparkles, X, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/server";
import { getSubscription, isPro } from "@/lib/subscription/get";
import { FREE_LIMITS } from "@/lib/subscription/limits";
import { formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Pro Subscription" };

interface FeatureRow {
  label: string;
  free: string | boolean;
  pro: string | boolean;
}

const FEATURE_ROWS: FeatureRow[] = [
  {
    label: "Zones (couple / squad / family)",
    free: `${FREE_LIMITS.ownedZones} zone`,
    pro: "Không giới hạn",
  },
  {
    label: "Wishes / điều ước per user",
    free: `${FREE_LIMITS.wishesPerUser} active`,
    pro: "Không giới hạn",
  },
  { label: "Image upload cho wish", free: false, pro: true },
  { label: "URL preview Shopee/Lazada/Tiki", free: false, pro: true },
  {
    label: "Lịch kỷ niệm (countdowns)",
    free: `${FREE_LIMITS.countdowns} countdown`,
    pro: "Không giới hạn",
  },
  { label: "Thư hẹn giờ", free: `${FREE_LIMITS.lettersPerMonth}/tháng`, pro: "Không giới hạn" },
  {
    label: "Kỷ niệm (memories)",
    free: `${FREE_LIMITS.memories} items`,
    pro: "1000 items + R2 CDN",
  },
  { label: "Wrapped Recap video MP4", free: false, pro: true },
  { label: "Zone Decoration (theme + sticker)", free: false, pro: true },
  {
    label: "Shared Vault (bucket / notes / file)",
    free: "200MB cơ bản",
    pro: "5GB + unlimited items",
  },
  { label: "Premium wish card templates", free: "3 templates", pro: "8+ templates" },
  { label: "Custom couple/zone slug URL", free: false, pro: true },
  { label: "Priority support", free: false, pro: true },
  { label: "Early access tính năng beta", free: false, pro: true },
  { label: "Ad-free commitment", free: true, pro: true },
];

export default async function SubscriptionPage() {
  const user = await requireUser();
  const sub = await getSubscription(user.id);
  const userIsPro = isPro(sub);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/settings"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại Cài đặt
      </Link>

      <header className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight">Pro Subscription</h1>
        <p className="text-muted-foreground text-sm">
          Mở khoá toàn bộ tính năng để chăm sóc người ấy / cả nhóm tốt hơn.
        </p>
      </header>

      {/* Current plan card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <CardDescription>Gói hiện tại</CardDescription>
              <CardTitle className="flex items-center gap-2">
                {userIsPro ? (
                  <>
                    <Sparkles className="text-primary h-5 w-5" />
                    Pro
                  </>
                ) : (
                  "Free"
                )}
              </CardTitle>
            </div>
            <span
              className={
                userIsPro
                  ? "bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-medium"
                  : "bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium"
              }
            >
              {userIsPro ? "ACTIVE" : "MIỄN PHÍ"}
            </span>
          </div>
        </CardHeader>
        {userIsPro && sub.currentPeriodEnd ? (
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Gia hạn vào {formatDateTime(sub.currentPeriodEnd)}
              {sub.cancelledAt ? " — đã huỷ, sẽ hết hạn vào ngày trên" : ""}
            </p>
          </CardContent>
        ) : null}
      </Card>

      {/* Pricing cards */}
      {!userIsPro ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Hàng tháng</CardTitle>
              <CardDescription>Linh hoạt huỷ bất cứ lúc nào</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-4xl font-bold tracking-tight">
                  29.000<span className="text-muted-foreground text-base font-normal">đ/tháng</span>
                </p>
                <p className="text-muted-foreground text-xs">≈ 1 ly trà sữa Phúc Long size M</p>
              </div>
              <Button className="w-full" disabled>
                <Zap className="h-4 w-4" />
                Sắp có — PayOS đang setup
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary relative border-2">
            <span className="bg-primary text-primary-foreground absolute -top-2.5 left-4 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
              Tiết kiệm 57%
            </span>
            <CardHeader>
              <CardTitle className="text-2xl">Hàng năm</CardTitle>
              <CardDescription>Trả 1 lần, dùng cả năm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-4xl font-bold tracking-tight">
                  149.000
                  <span className="text-muted-foreground text-base font-normal">đ/năm</span>
                </p>
                <p className="text-muted-foreground text-xs">
                  ≈ 12.400đ/tháng — bằng 1 buổi cafe Highlands
                </p>
              </div>
              <Button className="w-full" disabled>
                <Sparkles className="h-4 w-4" />
                Sắp có — PayOS đang setup
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Feature comparison */}
      <Card>
        <CardHeader>
          <CardTitle>So sánh Free vs Pro</CardTitle>
          <CardDescription>
            15 điểm khác biệt — Pro cho phép sống &ldquo;thật&rdquo; cùng người ấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium">Tính năng</th>
                  <th className="px-3 py-2.5 text-center font-medium">Free</th>
                  <th className="text-primary px-3 py-2.5 text-center font-medium">Pro</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row, idx) => (
                  <tr key={row.label} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-3 py-2.5">{row.label}</td>
                    <td className="text-muted-foreground px-3 py-2.5 text-center">
                      {renderCell(row.free)}
                    </td>
                    <td className="text-primary px-3 py-2.5 text-center font-medium">
                      {renderCell(row.pro)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Câu hỏi thường gặp</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4 text-sm">
          <div>
            <p className="text-foreground font-medium">Sau khi mua Pro, tôi vẫn giữ data Free?</p>
            <p>
              Có — toàn bộ wishes, kỷ niệm, thư của bạn được giữ nguyên. Pro chỉ mở rộng giới hạn.
            </p>
          </div>
          <div>
            <p className="text-foreground font-medium">Huỷ Pro thì sao?</p>
            <p>
              Bạn giữ Pro features đến hết kỳ hạn đã trả. Sau đó tự động về Free. Data không bị mất,
              chỉ giới hạn lại số lượng wish / countdown / letter mới.
            </p>
          </div>
          <div>
            <p className="text-foreground font-medium">Pro chia chung cho cả zone?</p>
            <p>
              Có. Nếu bạn là Pro và mời partner / squad, mọi member trong zone bạn owner cũng dùng
              được Pro features (image wish, premium templates, decoration). Mỗi user vẫn cần Pro
              riêng để có quota zone độc lập của họ.
            </p>
          </div>
          <div>
            <p className="text-foreground font-medium">Phương thức thanh toán?</p>
            <p>
              Hidden Gift dùng PayOS (chuyển khoản 0% phí trong VN). Stripe / VNPay / Momo không có
              trong MVP. Đang setup KYC business — sẽ open sớm.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function renderCell(v: string | boolean) {
  if (v === true) return <Check className="text-primary mx-auto h-4 w-4" />;
  if (v === false) return <X className="text-muted-foreground/40 mx-auto h-4 w-4" />;
  return v;
}
