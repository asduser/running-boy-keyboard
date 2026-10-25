import type { Enemy } from "./enemy";
import type { Snowfall, Weather } from "./weather";

export interface Scenery {
  readonly background: string;
  readonly foreground: string;
}

export type Background = string | (() => Scenery);

export interface Level {
  readonly number: number;
  readonly title: string;
  readonly background: Background;
  readonly texts: readonly string[];
  readonly enemy: Enemy;
  readonly birds: boolean;
  readonly textColor?: string;
  readonly weather?: Weather;
  readonly snowfall?: Snowfall;
}
