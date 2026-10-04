export type DifficultyId = "easy" | "medium" | "hard";

export interface Difficulty {
  readonly id: DifficultyId;
  readonly typingSpeed: string;
  readonly errorImpact: string;
  readonly totalTime: string;
  readonly pointsPerChar: number;
  readonly enemyStep: number;
  readonly enemyStepDelayMs: number;
  readonly catchDistance: number;
}

export const DIFFICULTIES: Readonly<Record<DifficultyId, Difficulty>> = {
  easy: {
    id: "easy",
    typingSpeed: "Low",
    errorImpact: "-",
    totalTime: "Max",
    pointsPerChar: 4,
    enemyStep: 1,
    enemyStepDelayMs: 250,
    catchDistance: 90,
  },
  medium: {
    id: "medium",
    typingSpeed: "Normal",
    errorImpact: "5%",
    totalTime: "Normal",
    pointsPerChar: 5,
    enemyStep: 2,
    enemyStepDelayMs: 250,
    catchDistance: 89,
  },
  hard: {
    id: "hard",
    typingSpeed: "Hard",
    errorImpact: "15%",
    totalTime: "Low",
    pointsPerChar: 8,
    enemyStep: 3,
    enemyStepDelayMs: 250,
    catchDistance: 90,
  },
};

export const DEFAULT_DIFFICULTY: DifficultyId = "hard";

export function isDifficultyId(value: string): value is DifficultyId {
  return value in DIFFICULTIES;
}
