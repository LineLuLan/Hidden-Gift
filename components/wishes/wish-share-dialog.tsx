"use client";

import { useRef, useState, useTransition } from "react";
import { Download, Share2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface WishShareData {
  title: string;
  description: string | null;
  emoji: string | null;
  displayName: string;
}

interface WishShareDialogProps {
  wish: WishShareData;
  open: boolean;
  onClose: () => void;
}

type Template = "rose" | "midnight" | "floral" | "filmgrain";

const TEMPLATES: { id: Template; label: string; preview: string }[] = [
  { id: "rose", label: "Hồng mơ", preview: "from-rose-200 via-pink-300 to-rose-400" },
  { id: "midnight", label: "Đêm sao", preview: "from-indigo-900 via-purple-900 to-slate-900" },
  { id: "floral", label: "Hoa nhẹ", preview: "from-amber-50 via-rose-50 to-orange-100" },
  { id: "filmgrain", label: "Film cũ", preview: "from-stone-300 via-amber-200 to-stone-400" },
];

export function WishShareDialog({ wish, open, onClose }: WishShareDialogProps) {
  const [template, setTemplate] = useState<Template>("rose");
  const [pending, startTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!cardRef.current) return;
    startTransition(async () => {
      try {
        // Dynamic import to keep html-to-image out of initial bundle
        const { toPng } = await import("html-to-image");
        const dataUrl = await toPng(cardRef.current!, {
          cacheBust: true,
          pixelRatio: 2,
          width: 1080,
          height: 1920,
        });
        const link = document.createElement("a");
        link.download = `hidden-gift-wish-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Đã tải ảnh — sẵn sàng share IG Story");
      } catch (err) {
        console.error("[wish-share]", err);
        toast.error("Không tạo được ảnh — thử lại");
      }
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4"
      onClick={onClose}
    >
      <div className="relative my-auto w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-card overflow-hidden rounded-xl border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">Chia sẻ điều ước</h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 p-4 md:grid-cols-[1fr_auto]">
            {/* Template picker + actions */}
            <div className="space-y-4 md:order-1">
              <div>
                <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
                  Chọn template
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplate(t.id)}
                      aria-pressed={template === t.id}
                      className={cn(
                        "relative h-16 overflow-hidden rounded-md border-2 transition-all",
                        template === t.id
                          ? "border-primary ring-primary/20 ring-2"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <div className={cn("absolute inset-0 bg-gradient-to-br", t.preview)} />
                      <span className="absolute inset-x-0 bottom-0 bg-black/40 py-0.5 text-center text-[10px] font-medium text-white">
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleDownload} disabled={pending}>
                  <Download className="h-4 w-4" />
                  {pending ? "Đang render..." : "Tải PNG"}
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!cardRef.current) return;
                    startTransition(async () => {
                      try {
                        const { toBlob } = await import("html-to-image");
                        const blob = await toBlob(cardRef.current!, {
                          cacheBust: true,
                          pixelRatio: 2,
                          width: 1080,
                          height: 1920,
                        });
                        if (!blob) throw new Error("blob null");
                        if (navigator.share && "canShare" in navigator) {
                          const file = new File([blob], "wish.png", { type: "image/png" });
                          if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                              files: [file],
                              title: "Điều ước của tôi",
                              text: "Gửi cùng Hidden Gift 💝",
                            });
                            toast.success("Đã share");
                            return;
                          }
                        }
                        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                        toast.success("Đã copy ảnh — dán vào IG / Messenger");
                      } catch (err) {
                        console.error("[wish-share-native]", err);
                        toast.error("Trình duyệt không hỗ trợ share");
                      }
                    });
                  }}
                  disabled={pending}
                >
                  <Share2 className="h-4 w-4" />
                  Chia sẻ
                </Button>
              </div>

              <p className="text-muted-foreground text-xs">
                Kích thước 1080×1920 (IG Story / TikTok). Render với pixel-ratio 2x.
              </p>
            </div>

            {/* Preview at scaled-down size — actual render uses pixelRatio 2 + width 1080 */}
            <div className="md:order-2">
              <div
                style={{
                  width: 270,
                  height: 480,
                  transformOrigin: "top left",
                }}
                className="mx-auto"
              >
                <div
                  ref={cardRef}
                  style={{
                    width: 1080,
                    height: 1920,
                    transform: "scale(0.25)",
                    transformOrigin: "top left",
                  }}
                >
                  <WishCardCanvas wish={wish} template={template} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Canvas variants (inlined styles for html-to-image fidelity) ──────────

function WishCardCanvas({ wish, template }: { wish: WishShareData; template: Template }) {
  switch (template) {
    case "rose":
      return <RoseTemplate wish={wish} />;
    case "midnight":
      return <MidnightTemplate wish={wish} />;
    case "floral":
      return <FloralTemplate wish={wish} />;
    case "filmgrain":
      return <FilmGrainTemplate wish={wish} />;
  }
}

function CommonWatermark() {
  return (
    <div
      style={{
        position: "absolute",
        right: 60,
        bottom: 60,
        fontFamily: "system-ui, sans-serif",
        fontSize: 32,
        fontWeight: 500,
        opacity: 0.6,
      }}
    >
      Hidden Gift 💝
    </div>
  );
}

const baseTextStyle: React.CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  width: "100%",
  textAlign: "center",
};

function RoseTemplate({ wish }: { wish: WishShareData }) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: "linear-gradient(135deg, #fecdd3 0%, #fb7185 50%, #be185d 100%)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 100,
        color: "#fff",
      }}
    >
      {wish.emoji ? (
        <div style={{ ...baseTextStyle, fontSize: 180, marginBottom: 40 }}>{wish.emoji}</div>
      ) : null}
      <div style={{ ...baseTextStyle, fontSize: 36, opacity: 0.85, marginBottom: 24 }}>
        Điều ước của {wish.displayName}
      </div>
      <div style={{ ...baseTextStyle, fontSize: 90, fontWeight: 700, lineHeight: 1.15 }}>
        {wish.title}
      </div>
      {wish.description ? (
        <div
          style={{
            ...baseTextStyle,
            fontSize: 42,
            opacity: 0.9,
            marginTop: 48,
            maxWidth: 800,
          }}
        >
          {wish.description}
        </div>
      ) : null}
      <CommonWatermark />
    </div>
  );
}

function MidnightTemplate({ wish }: { wish: WishShareData }) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: "radial-gradient(ellipse at top, #312e81 0%, #1e1b4b 50%, #020617 100%)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 100,
        color: "#fef3c7",
      }}
    >
      {/* stars */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(2px 2px at 20% 30%, #fef3c7, transparent), radial-gradient(1px 1px at 60% 70%, #fde68a, transparent), radial-gradient(2px 2px at 80% 20%, #fef9c3, transparent), radial-gradient(1px 1px at 30% 80%, #fde68a, transparent), radial-gradient(2px 2px at 90% 50%, #fef9c3, transparent)",
        }}
      />
      {wish.emoji ? (
        <div style={{ ...baseTextStyle, fontSize: 180, marginBottom: 40, position: "relative" }}>
          {wish.emoji}
        </div>
      ) : null}
      <div
        style={{
          ...baseTextStyle,
          fontSize: 36,
          opacity: 0.7,
          marginBottom: 24,
          position: "relative",
        }}
      >
        Điều {wish.displayName} ước
      </div>
      <div
        style={{
          ...baseTextStyle,
          fontSize: 90,
          fontWeight: 600,
          lineHeight: 1.15,
          position: "relative",
        }}
      >
        {wish.title}
      </div>
      {wish.description ? (
        <div
          style={{
            ...baseTextStyle,
            fontSize: 42,
            opacity: 0.85,
            marginTop: 48,
            maxWidth: 800,
            position: "relative",
          }}
        >
          {wish.description}
        </div>
      ) : null}
      <CommonWatermark />
    </div>
  );
}

function FloralTemplate({ wish }: { wish: WishShareData }) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: "linear-gradient(180deg, #fffbeb 0%, #fff1f2 50%, #ffedd5 100%)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 120,
        color: "#7c2d12",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 80,
          fontSize: 120,
          opacity: 0.3,
        }}
      >
        🌸
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 200,
          right: 80,
          fontSize: 100,
          opacity: 0.3,
        }}
      >
        🌷
      </div>

      <div
        style={{
          ...baseTextStyle,
          fontSize: 28,
          letterSpacing: 8,
          textTransform: "uppercase",
          marginBottom: 60,
          opacity: 0.7,
        }}
      >
        {wish.displayName} mong rằng
      </div>
      {wish.emoji ? (
        <div style={{ ...baseTextStyle, fontSize: 140, marginBottom: 40 }}>{wish.emoji}</div>
      ) : null}
      <div
        style={{
          ...baseTextStyle,
          fontSize: 84,
          fontWeight: 600,
          lineHeight: 1.2,
          fontFamily: "Georgia, serif",
        }}
      >
        {wish.title}
      </div>
      {wish.description ? (
        <div
          style={{
            ...baseTextStyle,
            fontSize: 38,
            marginTop: 48,
            maxWidth: 800,
            opacity: 0.8,
            fontStyle: "italic",
          }}
        >
          “{wish.description}”
        </div>
      ) : null}
      <CommonWatermark />
    </div>
  );
}

function FilmGrainTemplate({ wish }: { wish: WishShareData }) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: "linear-gradient(135deg, #d6d3d1 0%, #fcd34d 50%, #a8a29e 100%)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 100,
        color: "#292524",
      }}
    >
      {/* Frame */}
      <div
        style={{
          position: "absolute",
          inset: 60,
          border: "8px solid #292524",
          opacity: 0.15,
        }}
      />
      {wish.emoji ? (
        <div style={{ ...baseTextStyle, fontSize: 180, marginBottom: 40 }}>{wish.emoji}</div>
      ) : null}
      <div
        style={{
          ...baseTextStyle,
          fontSize: 32,
          letterSpacing: 6,
          textTransform: "uppercase",
          marginBottom: 30,
        }}
      >
        Wishlist · {wish.displayName}
      </div>
      <div
        style={{
          ...baseTextStyle,
          fontSize: 96,
          fontWeight: 800,
          lineHeight: 1.1,
          fontFamily: "'Courier New', monospace",
        }}
      >
        {wish.title}
      </div>
      {wish.description ? (
        <div
          style={{
            ...baseTextStyle,
            fontSize: 40,
            marginTop: 48,
            maxWidth: 800,
            opacity: 0.8,
          }}
        >
          {wish.description}
        </div>
      ) : null}
      <CommonWatermark />
    </div>
  );
}
