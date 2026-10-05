import type { Enemy } from "./enemy";
import type { Weather } from "./weather";

export interface Level {
  readonly number: number;
  readonly title: string;
  readonly background: string;
  readonly texts: readonly string[];
  readonly enemy: Enemy;
  readonly weather?: Weather;
}
