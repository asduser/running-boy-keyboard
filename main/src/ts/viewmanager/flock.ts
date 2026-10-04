export const MAX_BIRDS = 10;

export interface BirdFlight {
  readonly topPercent: number;
  readonly sizePx: number;
  readonly durationMs: number;
  readonly delayMs: number;
  readonly flapMs: number;
}

export interface FlockPlan {
  readonly birds: readonly BirdFlight[];
  readonly pauseAfterMs: number;
}

type Random = () => number;

function between(random: Random, min: number, max: number): number {
  return min + random() * (max - min);
}

export function planFlock(random: Random = Math.random): FlockPlan {
  const count = 1 + Math.min(MAX_BIRDS - 1, Math.floor(random() * MAX_BIRDS));
  const birds = Array.from({ length: count }, () => ({
    topPercent: between(random, 4, 40),
    sizePx: Math.round(between(random, 26, 48)),
    durationMs: Math.round(between(random, 9_000, 18_000)),
    delayMs: Math.round(between(random, 0, 4_000)),
    flapMs: Math.round(between(random, 280, 520)),
  }));
  return { birds, pauseAfterMs: Math.round(between(random, 1_500, 6_000)) };
}
