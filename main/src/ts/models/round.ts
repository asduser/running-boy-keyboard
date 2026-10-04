export type RoundOutcome = "won" | "lost" | "aborted";

export interface CharState {
  readonly char: string;
  readonly typed: boolean;
  readonly mistyped: boolean;
}

export interface Actor {
  readonly position: number;
  readonly frame: number;
}

export interface RoundSnapshot {
  readonly chars: readonly CharState[];
  readonly progress: number;
  readonly length: number;
  readonly score: number;
  readonly hero: Actor;
  readonly enemy: Actor;
}

export interface RoundResult {
  readonly outcome: RoundOutcome;
  readonly score: number;
  readonly durationSec: number;
}
