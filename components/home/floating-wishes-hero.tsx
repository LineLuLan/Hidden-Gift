import type { Wish } from "@/lib/wishes/queries";

interface FloatingWishesHeroProps {
  greeting: string;
  subtitle: string;
  wishes: Wish[];
  /** Member display names by user_id, for owner labels on non-self wishes. */
  nameByUserId?: Map<string, string>;
  currentUserId?: string;
}

/**
 * Decorative hero: soft pastel gradient + up to 8 wish "bubbles" drifting
 * with CSS keyframe animation. All bubbles non-interactive (pointer-events-none).
 * Pure SSR — no client component needed.
 */
export function FloatingWishesHero({
  greeting,
  subtitle,
  wishes,
  nameByUserId,
  currentUserId,
}: FloatingWishesHeroProps) {
  const bubbles = wishes.slice(0, 8);

  // Pseudo-random but deterministic positions per index so SSR matches client.
  const positions = [
    { top: "8%", left: "4%", size: "sm", delay: "0s", duration: "9s" },
    { top: "14%", left: "78%", size: "md", delay: "1.4s", duration: "11s" },
    { top: "52%", left: "10%", size: "lg", delay: "2.8s", duration: "10s" },
    { top: "62%", left: "70%", size: "sm", delay: "0.8s", duration: "12s" },
    { top: "28%", left: "48%", size: "md", delay: "3.6s", duration: "9.5s" },
    { top: "76%", left: "40%", size: "sm", delay: "1.2s", duration: "11.5s" },
    { top: "38%", left: "84%", size: "sm", delay: "2.2s", duration: "10.5s" },
    { top: "6%", left: "55%", size: "md", delay: "4.0s", duration: "13s" },
  ];

  const sizeClass: Record<string, string> = {
    sm: "max-w-[140px] text-[11px]",
    md: "max-w-[180px] text-xs",
    lg: "max-w-[220px] text-sm",
  };

  return (
    <section
      className="relative isolate overflow-hidden rounded-3xl border bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 px-6 py-12 dark:from-pink-950/30 dark:via-rose-950/20 dark:to-orange-950/20"
      data-tutorial="hero"
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl dark:bg-pink-900/20"
      />
      <div
        aria-hidden
        className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl dark:bg-orange-900/20"
      />

      {/* Floating wish bubbles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {bubbles.map((wish, idx) => {
          const pos = positions[idx % positions.length]!;
          const ownerName =
            wish.user_id === currentUserId
              ? "bạn"
              : (nameByUserId?.get(wish.user_id) ?? "thành viên");
          return (
            <div
              key={wish.id}
              className={`hg-wish-bubble absolute ${sizeClass[pos.size] ?? sizeClass.sm} rounded-2xl border border-white/60 bg-white/60 px-3 py-2 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10`}
              style={{
                top: pos.top,
                left: pos.left,
                animationDelay: pos.delay,
                animationDuration: pos.duration,
              }}
            >
              <div className="flex items-start gap-1.5">
                <span className="text-base leading-none">{wish.emoji ?? "💝"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground line-clamp-1 font-medium">{wish.title}</p>
                  <p className="text-muted-foreground/80 text-[10px]">— {ownerName}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Headline */}
      <div className="relative max-w-xl">
        <p className="text-muted-foreground text-sm">Chào</p>
        <h1 className="text-foreground mt-1 text-4xl font-semibold tracking-tight md:text-5xl">
          {greeting} <span className="text-primary">ơi 💝</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-md text-sm md:text-base">{subtitle}</p>
        {wishes.length === 0 ? (
          <p className="text-muted-foreground/80 mt-3 text-xs italic">
            Tạo điều ước đầu tiên để chúng bay quanh đây nhé 🌸
          </p>
        ) : null}
      </div>
    </section>
  );
}
