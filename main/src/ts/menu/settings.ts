import { DEFAULT_DIFFICULTY, type DifficultyId } from "../models/difficulty";
import { DEFAULT_HERO, type HeroId } from "../models/hero";

export interface SettingsState {
  readonly difficulty: DifficultyId;
  readonly hero: HeroId;
  readonly menuMusic: boolean;
  readonly menuMusicVolume: number;
  readonly gameMusic: boolean;
  readonly gameMusicVolume: number;
  readonly menuSounds: boolean;
  readonly enemySounds: boolean;
}

export const DEFAULT_SETTINGS: SettingsState = {
  difficulty: DEFAULT_DIFFICULTY,
  hero: DEFAULT_HERO,
  menuMusic: true,
  menuMusicVolume: 0.65,
  gameMusic: true,
  gameMusicVolume: 1,
  menuSounds: true,
  enemySounds: true,
};

export type SettingsListener = (state: SettingsState) => void;

export class Settings {
  private state: SettingsState;
  private readonly listeners = new Set<SettingsListener>();

  constructor(initial: SettingsState = DEFAULT_SETTINGS) {
    this.state = initial;
  }

  get current(): SettingsState {
    return this.state;
  }

  update(changes: Partial<SettingsState>): void {
    this.state = { ...this.state, ...changes };
    this.listeners.forEach((listener) => {
      listener(this.state);
    });
  }

  subscribe(listener: SettingsListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
