import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Gift,
  Mail,
  Image as ImageIcon,
  Bell,
  Sparkles,
  Flame,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/server";
import { computeWrappedStats } from "@/lib/wrapped/queries";

export const metadata: Metadata = { title: "Wrapped" };

const VN_MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

interface WrappedPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function WrappedPage({ searchParams }: WrappedPageProps) {
  const user = await requireUser();
  const sp = await searchParams;
  const requestedYear = sp.year ? parseInt(sp.year, 10) : new Date().getFullYear();
  const year = Number.isInteger(requestedYear) ? requestedYear : new Date().getFullYear();

  const stats = await computeWrappedStats(user.id, year);

  const totalEvents =
    stats.wishesCount +
    stats.secretsPreparedCount +
    stats.lettersSentCount +
    stats.memoriesCount +
    stats.pingsSentCount +
    stats.diaryEntriesCount;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-primary text-xs font-medium tracking-widest uppercase">Wrapped</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{year}</h1>
        <p className="text-muted-foreground">Tổng kết năm của bạn trên Hidden Gift</p>
      </header>

      <Card>
        <CardContent className="space-y-2 py-8 text-center">
          <p className="text-muted-foreground text-sm tracking-wide uppercase">Tổng hoạt động</p>
          <p className="text-primary text-6xl font-bold">{totalEvents}</p>
          <p className="text-muted-foreground text-sm">khoảnh khắc bạn đã ghi lại</p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatTile
          icon={Heart}
          label="Điều ước"
          primary={stats.wishesCount}
          secondary={`${stats.wishesFulfilledCount} đã thành sự thật`}
        />
        <StatTile
          icon={Gift}
          label="Bí mật chuẩn bị"
          primary={stats.secretsPreparedCount}
          secondary={`${stats.secretsDeliveredCount} đã tặng`}
        />
        <StatTile
          icon={Mail}
          label="Thư đã viết"
          primary={stats.lettersSentCount}
          secondary={`${stats.lettersDeliveredCount} đã giao`}
        />
        <StatTile
          icon={ImageIcon}
          label="Kỷ niệm"
          primary={stats.memoriesCount}
          secondary="ảnh / video lưu chung"
        />
        <StatTile
          icon={Bell}
          label="Ping gửi đi"
          primary={stats.pingsSentCount}
          secondary={`${stats.pingsReceivedCount} nhận về`}
        />
        <StatTile
          icon={Sparkles}
          label="Nhật ký crush"
          primary={stats.diaryEntriesCount}
          secondary="entry tự ghi"
        />
      </div>

      {stats.topMonth ? (
        <Card>
          <CardHeader>
            <div className="bg-accent text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg">
              <Flame className="h-5 w-5" />
            </div>
            <CardTitle className="mt-2">Tháng sôi động nhất</CardTitle>
            <CardDescription>
              {VN_MONTHS[stats.topMonth.month - 1]} với {stats.topMonth.activityCount} ping qua lại.
              Năm tới giữ vibe nha 💝
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardContent className="flex flex-col gap-3 py-6 text-center">
          <p className="text-muted-foreground text-sm">
            Năm tới sẽ là một năm nhiều khoảnh khắc đẹp hơn.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/wishes/new">Tạo điều ước mới</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/wrapped?year=${year - 1}`}>
                <Calendar className="h-4 w-4" />
                Xem năm {year - 1}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  primary,
  secondary,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  primary: number;
  secondary: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 p-5">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs tracking-wide uppercase">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <p className="text-3xl font-bold">{primary}</p>
        <p className="text-muted-foreground text-xs">{secondary}</p>
      </CardContent>
    </Card>
  );
}
