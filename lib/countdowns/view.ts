/**
 * @file lib/countdowns/view.ts
 * @description Pure display helpers — usable in both server and client components.
 *              No DB / server-only imports here.
 */

export interface Countdown {
  id: string;
  account_id: string;
  created_by: string;
  title: string;
  target_date: string; // YYYY-MM-DD
  is_recurring: boolean;
  emoji: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CountdownView {
  diffDays: number;
  effectiveDate: Date;
  kind: "upcoming" | "past" | "today";
}

export function computeCountdownView(
  c: Pick<Countdown, "target_date" | "is_recurring">,
): CountdownView {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const [yStr, mStr, dStr] = c.target_date.split("-");
  let target = new Date(Date.UTC(Number(yStr), Number(mStr) - 1, Number(dStr)));

  if (c.is_recurring && target.getTime() < today.getTime()) {
    while (target.getTime() < today.getTime()) {
      target = new Date(
        Date.UTC(target.getUTCFullYear() + 1, target.getUTCMonth(), target.getUTCDate()),
      );
    }
  }

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const kind: CountdownView["kind"] = diffDays === 0 ? "today" : diffDays > 0 ? "upcoming" : "past";
  return { diffDays, effectiveDate: target, kind };
}
