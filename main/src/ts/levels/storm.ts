import type { Range, Weather } from "../models/weather";

export interface StormPlan {
  readonly calmMs: number;
  readonly stormMs: number;
  readonly drops: number;
  readonly windDeg: number;
  readonly lightningAtMs: readonly number[];
}

type Random = () => number;

function pick(random: Random, { min, max }: Range): number {
  return Math.round(min + random() * (max - min));
}

export function planStorm(weather: Weather, random: Random = Math.random): StormPlan {
  const calmMs = pick(random, weather.calmMs);
  const stormMs = pick(random, weather.stormMs);
  const drops = pick(random, weather.drops);
  const windDeg = pick(random, weather.windDeg);
  const strikes = pick(random, weather.lightningStrikes);
  const lightningAtMs = Array.from({ length: strikes }, () =>
    pick(random, { min: 0, max: stormMs }),
  ).sort((a, b) => a - b);
  return { calmMs, stormMs, drops, windDeg, lightningAtMs };
}
