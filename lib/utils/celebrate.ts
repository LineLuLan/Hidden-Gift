"use client";

/**
 * Lightweight confetti burst for first-action celebrations. Lazy-loads
 * canvas-confetti so it does not bloat the initial bundle.
 */
export async function celebrate(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const mod = await import("canvas-confetti");
    const confetti = mod.default;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ec4899", "#f472b6", "#fbcfe8", "#fff", "#fde68a"],
    });
  } catch {
    // Confetti failure is non-critical — silent fail
  }
}
