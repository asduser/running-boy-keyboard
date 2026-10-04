import type { Level } from "../models/level";

export class MainMenu {
  private played = false;

  constructor(private readonly level: Level) {}

  get showsLevelIntro(): boolean {
    return !this.played;
  }

  get startLabel(): string {
    return this.played ? `"${this.level.title}"` : "Start";
  }

  markPlayed(): void {
    this.played = true;
  }
}
