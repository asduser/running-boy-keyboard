export type HeroId = "model1" | "model2" | "model3" | "model4";

export interface Hero {
  readonly id: HeroId;
  readonly name: string;
  readonly spriteFolder: string;
}

export const HEROES: Readonly<Record<HeroId, Hero>> = {
  model1: { id: "model1", name: "Model №1", spriteFolder: "rb_sprites" },
  model2: { id: "model2", name: "Model №2", spriteFolder: "rb3_sprites" },
  model3: { id: "model3", name: "Model №3", spriteFolder: "rb4_sprites" },
  model4: { id: "model4", name: "Model №4", spriteFolder: "rb5_sprites" },
};

export const DEFAULT_HERO: HeroId = "model1";

export function isHeroId(value: string): value is HeroId {
  return value in HEROES;
}
