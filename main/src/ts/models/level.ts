import type { Enemy } from "./enemy";

export interface Level {
  readonly number: number;
  readonly title: string;
  readonly background: string;
  readonly texts: readonly string[];
  readonly enemy: Enemy;
}
