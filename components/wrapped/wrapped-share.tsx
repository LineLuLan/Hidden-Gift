"use client";

import { useRef, useState, useTransition } from "react";
import { Download, X, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { WrappedStats } from "@/lib/wrapped/queries";

interface WrappedShareProps {
  stats: WrappedStats;
  displayName: string;
}

export function WrappedShare({ stats, displayName }: WrappedShareProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  const totalEvents =
    stats.wishesCount +
    stats.secretsPreparedCount +
    stats.lettersSentCount +
    stats.memoriesCount +
    stats.pingsSentCount +
    stats.diaryEntriesCount;

  const download = () => {
    if (!cardRef.current) return;
    startTransition(async () => {
      try {
        const { toPng } = await import("html-to-image");
        const dataUrl = await toPng(cardRef.current!, {
          cacheBust: true,
          pixelRatio: 2,
          width: 1080,
          height: 1920,
        });
        const link = document.createElement("a");
        link.download = `hidden-gift-wrapped-${stats.year}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Đã tải ảnh Wrapped");
      } catch (err) {
        console.error("[wrapped-share]", err);
        toast.error("Không tạo được ảnh");
      }
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Share2 className="h-4 w-4" />
        Chia sẻ Wrapped
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="relative my-auto w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-card overflow-hidden rounded-xl border">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="font-semibold">Wrapped {stats.year}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  aria-label="Đóng"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-6 p-4 md:grid-cols-[1fr_auto]">
                <div className="space-y-4 md:order-1">
                  <Button onClick={download} disabled={pending}>
                    <Download className="h-4 w-4" />
                    {pending ? "Đang render..." : "Tải PNG"}
                  </Button>
                  <p className="text-muted-foreground text-xs">
                    1080×1920 (IG Story / TikTok). Share để rủ bạn bè dùng app luôn.
                  </p>
                </div>

                <div className="md:order-2">
                  <div style={{ width: 270, height: 480 }} className="mx-auto">
                    <div
                      ref={cardRef}
                      style={{
                        width: 1080,
                        height: 1920,
                        transform: "scale(0.25)",
                        transformOrigin: "top left",
                      }}
                    >
                      <WrappedCanvas
                        stats={stats}
                        totalEvents={totalEvents}
                        displayName={displayName}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function WrappedCanvas({
  stats,
  totalEvents,
  displayName,
}: {
  stats: WrappedStats;
  totalEvents: number;
  displayName: string;
}) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: "linear-gradient(180deg, #fdf2f8 0%, #fce7f3 40%, #fbcfe8 100%)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 100,
        fontFamily: "system-ui, sans-serif",
        color: "#831843",
      }}
    >
      <div
        style={{
          fontSize: 36,
          letterSpacing: 12,
          textTransform: "uppercase",
          opacity: 0.7,
        }}
      >
        Hidden Gift Wrapped
      </div>
      <div style={{ fontSize: 240, fontWeight: 800, lineHeight: 1, marginTop: 20 }}>
        {stats.year}
      </div>
      <div style={{ fontSize: 56, fontWeight: 600, marginTop: 80, textAlign: "center" }}>
        {displayName} đã ghi
      </div>
      <div
        style={{
          fontSize: 320,
          fontWeight: 800,
          lineHeight: 1,
          marginTop: 20,
          color: "#be185d",
        }}
      >
        {totalEvents}
      </div>
      <div
        style={{
          fontSize: 44,
          marginTop: 20,
          opacity: 0.8,
          textAlign: "center",
        }}
      >
        khoảnh khắc trong năm 💝
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          marginTop: 100,
          fontSize: 36,
          width: "100%",
        }}
      >
        <StatRow label="Điều ước" value={stats.wishesCount} />
        <StatRow label="Bí mật" value={stats.secretsPreparedCount} />
        <StatRow label="Thư" value={stats.lettersSentCount} />
        <StatRow label="Kỷ niệm" value={stats.memoriesCount} />
        <StatRow label="Ping" value={stats.pingsSentCount} />
        <StatRow label="Nhật ký" value={stats.diaryEntriesCount} />
      </div>

      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 60,
          fontSize: 32,
          fontWeight: 500,
          opacity: 0.6,
        }}
      >
        hiddengift.vn
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "2px solid rgba(190, 24, 93, 0.2)",
        paddingBottom: 12,
      }}
    >
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}
