export interface Enemy {
  readonly name: string;
  readonly spriteFolder: string;
  readonly startPosition: number;
  readonly maxSteps: number;
  readonly barkSteps: readonly number[];
}

export const DOG: Enemy = {
  name: "Xaero",
  spriteFolder: "rb6_sprites",
  startPosition: 40,
  maxSteps: 300,
  barkSteps: [20, 22, 80, 82, 200, 202],
};
