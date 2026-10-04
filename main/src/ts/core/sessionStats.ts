import type { RoundResult } from "../models/round";
import type { StatsSummary } from "../models/stats";

export class SessionStats {
  private attempts = 0;
  private readonly results: RoundResult[] = [];

  startAttempt(): void {
    this.attempts++;
  }

  record(result: RoundResult): void {
    this.results.push(result);
  }

  summary(): StatsSummary {
    const scores = this.results.map((result) => result.score);
    const times = this.results.map((result) => result.durationSec);
    const wins = this.count("won");
    const losses = this.count("lost");
    return {
      attempts: this.attempts,
      wins,
      losses,
      aborted: this.attempts - wins - losses,
      totalScore: sum(scores),
      maxScore: extreme(scores, Math.max),
      minScore: extreme(scores, Math.min),
      totalTimeSec: sum(times),
      maxTimeSec: extreme(times, Math.max),
      minTimeSec: extreme(times, Math.min),
    };
  }

  private count(outcome: RoundResult["outcome"]): number {
    return this.results.filter((result) => result.outcome === outcome).length;
  }
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function extreme(values: readonly number[], pick: (...values: number[]) => number): number {
  return values.length ? pick(...values) : 0;
}
