import { Game } from "./core/game";
import { SessionStats } from "./core/sessionStats";
import { FIRST_LEVEL } from "./levels";
import { AudioManager } from "./media/audioManager";
import { watchPageActivity } from "./media/pageActivity";
import { MainMenu } from "./menu/mainMenu";
import { Settings } from "./menu/settings";
import { Birds } from "./viewmanager/birds";
import { GameController } from "./viewmanager/controller";
import { GameView } from "./viewmanager/gameView";
import { bindHandlers } from "./viewmanager/handlers";
import { Layout } from "./viewmanager/layout";
import { MenuView } from "./viewmanager/menuView";
import { Screens } from "./viewmanager/screens";

function main(): void {
  const layout = new Layout();
  const screens = new Screens(layout);
  const audio = new AudioManager({
    onAutoplayBlocked: () => {
      screens.show("soundUnlock");
    },
  });
  const controller = new GameController({
    game: new Game(),
    stats: new SessionStats(),
    settings: new Settings(),
    mainMenu: new MainMenu(FIRST_LEVEL),
    level: FIRST_LEVEL,
    audio,
    screens,
    gameView: new GameView(new Birds()),
    menuView: new MenuView(),
  });
  bindHandlers(controller);
  watchPageActivity((active) => {
    audio.setSuspended(!active);
  });
  layout.init();
  controller.init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
