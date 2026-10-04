import type { Game } from "../core/game";
import type { SessionStats } from "../core/sessionStats";
import type { AudioManager } from "../media/audioManager";
import type { MainMenu } from "../menu/mainMenu";
import type { Settings, SettingsState } from "../menu/settings";
import { DIFFICULTIES, type DifficultyId } from "../models/difficulty";
import { HEROES, type HeroId } from "../models/hero";
import type { Level } from "../models/level";
import type { RoundResult } from "../models/round";
import type { GameView } from "./gameView";
import type { UiActions } from "./handlers";
import type { MenuView } from "./menuView";
import type { Popup, Screens } from "./screens";

export interface ControllerDeps {
  readonly game: Game;
  readonly stats: SessionStats;
  readonly settings: Settings;
  readonly mainMenu: MainMenu;
  readonly level: Level;
  readonly audio: AudioManager;
  readonly screens: Screens;
  readonly gameView: GameView;
  readonly menuView: MenuView;
}

export class GameController implements UiActions {
  constructor(private readonly deps: ControllerDeps) {
    const { game, settings } = deps;
    game.on("roundStarted", (round) => {
      const { level } = this.deps;
      deps.gameView.showRound(round, {
        heroSprites: HEROES[this.settings.hero].spriteFolder,
        enemySprites: level.enemy.spriteFolder,
        background: level.background,
      });
    });
    game.on("typed", ({ round }) => {
      deps.gameView.renderTyping(round);
    });
    game.on("heroMoved", (hero) => {
      deps.gameView.moveHero(hero);
    });
    game.on("enemyMoved", (enemy) => {
      deps.gameView.moveEnemy(enemy);
    });
    game.on("enemyBarked", () => {
      if (this.settings.enemySounds) {
        deps.audio.playEffect("bark");
      }
    });
    game.on("roundEnded", (result) => {
      this.onRoundEnded(result);
    });
    settings.subscribe((state) => {
      this.applySettings(state);
    });
  }

  init(): void {
    const { screens, menuView, gameView, mainMenu, audio } = this.deps;
    this.applySettings(this.settings);
    menuView.renderStartLabel(mainMenu.startLabel);
    gameView.showMenuBackground();
    screens.show("mainMenu");
    if (this.settings.menuMusic) {
      audio.playMusic("menu");
    }
  }

  start(): void {
    if (this.deps.mainMenu.showsLevelIntro) {
      this.switchPopup("mainMenu", "levelIntro");
    } else {
      this.click();
      this.beginRound();
    }
  }

  startLevel(): void {
    this.click();
    this.beginRound();
  }

  openVolume(): void {
    this.openFromMenu("volume");
  }

  openSettings(): void {
    this.openFromMenu("settings");
  }

  openHelp(): void {
    this.openFromMenu("help");
  }

  backToMenu(): void {
    this.deps.screens.hide("volume", "settings", "help", "levelIntro");
    this.deps.screens.show("mainMenu");
    this.click();
  }

  leaveToMenu(): void {
    this.leaveGame("mainMenu");
  }

  leaveToHelp(): void {
    this.leaveGame("help");
  }

  playAgain(): void {
    this.click();
    this.beginRound();
  }

  resultToMenu(): void {
    this.click();
    this.deps.screens.hideGamePopups();
    this.deps.screens.show("mainMenu");
    this.resumeMenuMusic();
  }

  showStats(): void {
    const { screens, menuView, stats } = this.deps;
    this.click();
    menuView.renderStats(stats.summary());
    screens.hide("gameOver", "winner");
    screens.show("stats");
  }

  unlockSound(): void {
    this.deps.screens.hide("soundUnlock");
    this.deps.audio.unlock();
  }

  toggleMenuMusic(): void {
    const enabled = !this.settings.menuMusic;
    this.deps.settings.update({ menuMusic: enabled });
    if (enabled) {
      this.deps.audio.playMusic("menu");
    } else {
      this.deps.audio.pauseMusic("menu");
    }
  }

  setGameMusic(enabled: boolean): void {
    this.deps.settings.update({ gameMusic: enabled });
  }

  setMenuSounds(enabled: boolean): void {
    this.deps.settings.update({ menuSounds: enabled });
  }

  setEnemySounds(enabled: boolean): void {
    this.deps.settings.update({ enemySounds: enabled });
  }

  setMenuMusicVolume(volume: number): void {
    this.deps.settings.update({ menuMusicVolume: volume });
  }

  setGameMusicVolume(volume: number): void {
    this.deps.settings.update({ gameMusicVolume: volume });
  }

  setDifficulty(difficulty: DifficultyId): void {
    this.deps.settings.update({ difficulty });
  }

  setHero(hero: HeroId): void {
    this.deps.settings.update({ hero });
  }

  type(input: string): void {
    this.deps.game.type(input);
  }

  hover(): void {
    if (this.settings.menuSounds) {
      this.deps.audio.playEffect("hover");
    }
  }

  private get settings(): SettingsState {
    return this.deps.settings.current;
  }

  private beginRound(): void {
    const { screens, audio, stats, game, level } = this.deps;
    screens.hideGamePopups();
    audio.pauseMusic("menu");
    if (this.settings.gameMusic) {
      audio.playMusic("game");
    }
    stats.startAttempt();
    game.start({ level, difficulty: DIFFICULTIES[this.settings.difficulty] });
  }

  private leaveGame(destination: Popup): void {
    this.deps.game.abort();
    this.resumeMenuMusic();
    this.deps.screens.show(destination);
  }

  private onRoundEnded(result: RoundResult): void {
    const { stats, mainMenu, menuView, gameView, audio, screens } = this.deps;
    stats.record(result);
    mainMenu.markPlayed();
    menuView.renderStartLabel(mainMenu.startLabel);
    gameView.hide();
    audio.pauseMusic("game");
    if (result.outcome === "won") {
      screens.show("winner");
      audio.playEffect("win");
    } else if (result.outcome === "lost") {
      screens.show("gameOver");
      audio.playEffect("gameOver");
    }
  }

  private openFromMenu(popup: Popup): void {
    this.switchPopup("mainMenu", popup);
    this.click();
  }

  private switchPopup(from: Popup, to: Popup): void {
    this.deps.screens.hide(from);
    this.deps.screens.show(to);
  }

  private resumeMenuMusic(): void {
    if (this.settings.menuMusic) {
      this.deps.audio.playMusic("menu", true);
    }
  }

  private click(): void {
    if (this.settings.menuSounds) {
      this.deps.audio.playEffect("click");
    }
  }

  private applySettings(state: SettingsState): void {
    this.deps.menuView.renderSettings(state);
    this.deps.audio.setMusicVolume("menu", state.menuMusicVolume);
    this.deps.audio.setMusicVolume("game", state.gameMusicVolume);
  }
}
