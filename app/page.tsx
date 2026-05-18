export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mx-auto max-w-xl space-y-6">
        <p className="text-sm uppercase tracking-widest text-foreground/60">
          Phase 0 · Scaffold
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Hidden Gift
        </h1>
        <p className="text-lg leading-relaxed text-foreground/80">
          Bí mật yêu thương cho hai người. Repo đang ở Phase 0 — chưa có feature.
          Xem <code className="rounded bg-foreground/10 px-1.5 py-0.5 text-sm">docs/CHECKLIST.md</code> để theo dõi tiến độ.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-foreground/70">
          <span>Next.js 16</span>
          <span aria-hidden>·</span>
          <span>React 19</span>
          <span aria-hidden>·</span>
          <span>Tailwind v4</span>
          <span aria-hidden>·</span>
          <span>Supabase</span>
        </div>
      </div>
    </main>
  );
}
