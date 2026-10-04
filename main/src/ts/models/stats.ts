export interface StatsSummary {
  readonly attempts: number;
  readonly wins: number;
  readonly losses: number;
  readonly aborted: number;
  readonly totalScore: number;
  readonly maxScore: number;
  readonly minScore: number;
  readonly totalTimeSec: number;
  readonly maxTimeSec: number;
  readonly minTimeSec: number;
}
