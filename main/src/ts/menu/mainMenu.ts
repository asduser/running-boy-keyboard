export class MainMenu {
  private played = false;

  public get showsLevelIntro(): boolean {
    return !this.played;
  }

  public markPlayed(): void {
    this.played = true;
  }
}
