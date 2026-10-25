export class MainMenu {
  private played = false;

  get showsLevelIntro(): boolean {
    return !this.played;
  }

  markPlayed(): void {
    this.played = true;
  }
}
