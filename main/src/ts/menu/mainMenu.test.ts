import { MainMenu } from "./mainMenu";

describe("MainMenu", () => {
  it("shows the level intro before the first round", () => {
    const menu = new MainMenu();

    expect(menu.showsLevelIntro).toBe(true);
  });

  it("skips the intro after a round was played", () => {
    const menu = new MainMenu();

    menu.markPlayed();

    expect(menu.showsLevelIntro).toBe(false);
  });
});
