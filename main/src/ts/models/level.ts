import type { Enemy } from "./enemy";
import type { Snowfall, Weather } from "./weather";

export type Background = string | (() => string);

export interface Level {
  readonly number: number;
  readonly title: string;
  readonly background: Background;
  readonly texts: readonly string[];
  readonly enemy: Enemy;
  readonly birds: boolean;
  readonly weather?: Weather;
  readonly snowfall?: Snowfall;
}
