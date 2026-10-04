import { ABANDONED_AREA } from "../levels/abandonedArea";
import { MainMenu } from "./mainMenu";

describe("MainMenu", () => {
  it("shows the level intro and a plain start label before the first round", () => {
    const menu = new MainMenu(ABANDONED_AREA);

    expect(menu.showsLevelIntro).toBe(true);
    expect(menu.startLabel).toBe("Start");
  });

  it("skips the intro and names the level after a round was played", () => {
    const menu = new MainMenu(ABANDONED_AREA);

    menu.markPlayed();

    expect(menu.showsLevelIntro).toBe(false);
    expect(menu.startLabel).toBe('"Abandoned area"');
  });
});
