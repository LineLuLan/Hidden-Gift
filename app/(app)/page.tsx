import Link from "next/link";
import { Bell, Calendar, Flower2, Gift, Heart, Image, Mail, Sparkles, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountdownWidget } from "@/components/countdowns/countdown-widget";
import { FloatingWishesHero } from "@/components/home/floating-wishes-hero";
import { getAccountDetail, isPartnerLinked } from "@/lib/account/queries";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { listCountdowns } from "@/lib/countdowns/queries";
import { getSubscription, isPro } from "@/lib/subscription/get";
import { listWishes } from "@/lib/wishes/queries";

interface Feature {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** "always" | "couple" (gated on partner) | "solo" (only for Solo mode) | "soon" */
  status: "always" | "couple" | "solo" | "soon";
}

const COUPLE_FEATURES: Feature[] = [
  {
    href: "/wishes",
    title: "Điều ước",
    description:
      "Ghi điều mong nhận. Cả nhóm thấy chung — ai âm thầm chuẩn bị quà thì bạn không biết đến lúc mở.",
    icon: Heart,
    status: "always",
  },
  {
    href: "/secrets",
    title: "Chuẩn bị bí mật",
    description: "Quà bạn đang chuẩn bị — recipient chỉ thấy sau khi bạn bấm Đã tặng.",
    icon: Gift,
    status: "couple",
  },
  {
    href: "/letters",
    title: "Thư hẹn giờ",
    description: "Viết hôm nay, giao vào ngày bạn chọn. Sinh nhật, kỷ niệm, hay bất ngờ ngẫu hứng.",
    icon: Mail,
    status: "couple",
  },
  {
    href: "/countdowns",
    title: "Lịch kỷ niệm",
    description: "Đếm ngày tới sinh nhật, kỷ niệm, hay dịp đặc biệt. Cả nhóm cùng thấy.",
    icon: Calendar,
    status: "always",
  },
  {
    href: "/pings",
    title: "Emoji Ping",
    description: "Gửi 1 emoji + 1 dòng — realtime, người ấy nhận toast ngay khi bạn bấm.",
    icon: Bell,
    status: "couple",
  },
  {
    href: "/memories",
    title: "Kỷ niệm",
    description: "Album ảnh + video chung. iPhone HEIC tự convert, resize 2048px.",
    icon: Image,
    status: "always",
  },
  {
    href: "/gift-ideas",
    title: "Gợi ý quà",
    description: "30+ ý tưởng quà tuyển chọn cho couple VN, lọc theo dịp + ngân sách.",
    icon: Sparkles,
    status: "always",
  },
];

const SOLO_FEATURES: Feature[] = [
  {
    href: "/crush",
    title: "Solo Crush",
    description: "Crush profile + nhật ký riêng tư + đếm ngược. Hoàn toàn private.",
    icon: Flower2,
    status: "always",
  },
  {
    href: "/wishes",
    title: "Wishlist",
    description: "Điều ước cho bản thân. Sau này tỏ tình thành công có thể share.",
    icon: Heart,
    status: "always",
  },
  {
    href: "/countdowns",
    title: "Lịch kỷ niệm",
    description: "Đếm ngày tới crush birthday, lần đầu gặp, hay dịp riêng.",
    icon: Calendar,
    status: "always",
  },
  {
    href: "/memories",
    title: "Kỷ niệm",
    description: "Lưu khoảnh khắc với crush. iPhone HEIC tự convert.",
    icon: Image,
    status: "always",
  },
  {
    href: "/gift-ideas",
    title: "Gợi ý quà",
    description: "30+ ý tưởng để tặng crush khi đúng dịp.",
    icon: Sparkles,
    status: "always",
  },
];

const FEATURE_TUTORIAL_KEY: Record<string, string> = {
  "/wishes": "feature-wishes",
  "/secrets": "feature-secrets",
  "/letters": "feature-letters",
  "/pings": "feature-pings",
  "/memories": "feature-memories",
  "/gift-ideas": "feature-gift-ideas",
  "/crush": "feature-crush",
  "/countdowns": "feature-countdowns",
};

export default async function HomePage() {
  const user = await requireUser();
  const account = await requireAccount();

  const [detail, countdowns, wishes, subscription] = await Promise.all([
    getAccountDetail(account.accountId),
    listCountdowns(),
    listWishes(),
    getSubscription(user.id),
  ]);

  const linked = detail ? isPartnerLinked(detail) : false;
  const isSolo = account.kind === "solo";
  const userIsPro = isPro(subscription);

  const greeting =
    (user.user_metadata?.display_name as string | undefined) ?? user.email?.split("@")[0] ?? "bạn";

  const FEATURES = isSolo ? SOLO_FEATURES : COUPLE_FEATURES;

  const nameByUserId = new Map(
    (detail?.members ?? []).map((m) => [m.user_id, m.display_name ?? "Thành viên"] as const),
  );

  const activeWishes = wishes.filter((w) => !w.is_fulfilled);
  const myActiveWishes = activeWishes.filter((w) => w.user_id === user.id);

  const subtitle = isSolo
    ? "Solo mode — chỉ bạn và crush. Hoàn toàn riêng tư."
    : linked
      ? `${activeWishes.length} điều ước đang lơ lửng giữa tụi mình — ai đó sẽ âm thầm chuẩn bị 🤫`
      : "Bí mật được giữ ngay tầng database. Bắt đầu với 1 điều ước nhỏ — rồi mời người ấy join.";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <FloatingWishesHero
        greeting={greeting}
        subtitle={subtitle}
        wishes={activeWishes}
        nameByUserId={nameByUserId}
        currentUserId={user.id}
      />

      {/* Quick stats — only when there's data */}
      {wishes.length > 0 || countdowns.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatChip
            icon={Heart}
            label="Điều ước đang chờ"
            value={String(myActiveWishes.length)}
            href="/wishes"
          />
          <StatChip
            icon={Calendar}
            label="Countdown đang theo dõi"
            value={String(countdowns.length)}
            href="/countdowns"
          />
          <StatChip
            icon={Sparkles}
            label="Gói"
            value={userIsPro ? "Pro" : "Free"}
            href="/settings/subscription"
            highlight={!userIsPro}
            highlightLabel={!userIsPro ? "Xem Pro" : undefined}
          />
        </div>
      ) : null}

      {/* Invite nudge / Solo banner */}
      {!isSolo && !linked ? (
        <Card data-tutorial="invite-card" className="border-primary/30">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-accent text-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Mời partner để mở khoá Bí mật, Thư hẹn giờ, Ping</p>
                <p className="text-muted-foreground text-sm">
                  Hoặc{" "}
                  <Link href="/crush" className="text-primary hover:underline">
                    chuyển sang Solo mode
                  </Link>{" "}
                  nếu đang crush thầm.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/settings">Mời partner</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isSolo ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-accent text-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Flower2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Solo Crush mode đã bật</p>
                <p className="text-muted-foreground text-sm">
                  Tỏ tình thành công?{" "}
                  <Link href="/crush" className="text-primary hover:underline">
                    Chuyển sang Couple mode
                  </Link>{" "}
                  để mời người ấy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Nearest countdown */}
      <CountdownWidget countdowns={countdowns} />

      {/* Feature tiles */}
      <div>
        <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          Khám phá tính năng
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isOpen = feature.status === "always" || (feature.status === "couple" && linked);
            const badge =
              feature.status === "soon" ? "Sắp ra mắt" : isOpen ? "Đã mở" : "Cần partner";

            const tutorialKey = FEATURE_TUTORIAL_KEY[feature.href];
            const content = (
              <Card
                data-tutorial={tutorialKey}
                className={
                  isOpen
                    ? "group hover:border-primary/40 h-full transition-all hover:-translate-y-0.5 hover:shadow-md"
                    : "h-full opacity-60"
                }
              >
                <CardHeader>
                  <div className="from-accent to-accent/40 group-hover:from-primary/20 group-hover:to-primary/5 text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-3">{feature.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p
                    className={
                      isOpen
                        ? "text-primary text-xs font-medium tracking-wide uppercase"
                        : "text-muted-foreground text-xs tracking-wide uppercase"
                    }
                  >
                    {badge}
                  </p>
                </CardContent>
              </Card>
            );

            return isOpen ? (
              <Link key={feature.href} href={feature.href} className="block">
                {content}
              </Link>
            ) : (
              <div key={feature.href}>{content}</div>
            );
          })}
        </div>
      </div>

      {/* Pro upsell — only when Free */}
      {!userIsPro ? (
        <Card className="from-primary/10 to-accent/40 border-primary/30 bg-gradient-to-br">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Mở khoá Pro — chỉ 29k/tháng</p>
                <p className="text-muted-foreground text-sm">
                  Unlimited zones · countdowns · letters · image wish · decoration · Wrapped video.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/settings/subscription">Xem chi tiết</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

interface StatChipProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  highlight?: boolean;
  highlightLabel?: string;
}

function StatChip({ icon: Icon, label, value, href, highlight, highlightLabel }: StatChipProps) {
  return (
    <Link href={href} className="block">
      <Card
        className={
          highlight
            ? "border-primary/40 from-primary/10 hover:border-primary h-full bg-gradient-to-br to-transparent transition-colors"
            : "hover:border-primary/40 h-full transition-colors"
        }
      >
        <CardContent className="flex items-center gap-3 p-4">
          <div className="bg-accent text-primary inline-flex h-9 w-9 items-center justify-center rounded-md">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[11px] tracking-wide uppercase">{label}</p>
            <p className="text-foreground truncate text-lg font-semibold">{value}</p>
          </div>
          {highlightLabel ? (
            <span className="text-primary text-[10px] font-medium tracking-wide uppercase">
              {highlightLabel}
            </span>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
