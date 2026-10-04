import { isDifficultyId, type DifficultyId } from "../models/difficulty";
import { isHeroId, type HeroId } from "../models/hero";
import { byId } from "./dom";

export interface UiActions {
  start(): void;
  startLevel(): void;
  openVolume(): void;
  openSettings(): void;
  openHelp(): void;
  backToMenu(): void;
  leaveToMenu(): void;
  leaveToHelp(): void;
  playAgain(): void;
  resultToMenu(): void;
  showStats(): void;
  unlockSound(): void;
  toggleMenuMusic(): void;
  setGameMusic(enabled: boolean): void;
  setMenuSounds(enabled: boolean): void;
  setEnemySounds(enabled: boolean): void;
  setMenuMusicVolume(volume: number): void;
  setGameMusicVolume(volume: number): void;
  setDifficulty(difficulty: DifficultyId): void;
  setHero(hero: HeroId): void;
  type(input: string): void;
  hover(): void;
}

export function bindHandlers(actions: UiActions): void {
  const clickActions: Record<string, () => void> = {
    start: () => {
      actions.start();
    },
    "start-level": () => {
      actions.startLevel();
    },
    "open-volume": () => {
      actions.openVolume();
    },
    "open-settings": () => {
      actions.openSettings();
    },
    "open-help": () => {
      actions.openHelp();
    },
    "back-to-menu": () => {
      actions.backToMenu();
    },
    "leave-to-menu": () => {
      actions.leaveToMenu();
    },
    "leave-to-help": () => {
      actions.leaveToHelp();
    },
    "play-again": () => {
      actions.playAgain();
    },
    "result-to-menu": () => {
      actions.resultToMenu();
    },
    "show-stats": () => {
      actions.showStats();
    },
    "unlock-sound": () => {
      actions.unlockSound();
    },
    "toggle-menu-music": () => {
      actions.toggleMenuMusic();
    },
    "game-music-on": () => {
      actions.setGameMusic(true);
    },
    "game-music-off": () => {
      actions.setGameMusic(false);
    },
    "menu-sounds-on": () => {
      actions.setMenuSounds(true);
    },
    "menu-sounds-off": () => {
      actions.setMenuSounds(false);
    },
    "enemy-sounds-on": () => {
      actions.setEnemySounds(true);
    },
    "enemy-sounds-off": () => {
      actions.setEnemySounds(false);
    },
  };

  document.addEventListener("click", (event) => {
    const target = (event.target as Element).closest<HTMLElement>("[data-action]");
    const action = target?.dataset.action;
    if (action) {
      clickActions[action]?.();
    }
  });

  document.addEventListener("mouseover", (event) => {
    const target = (event.target as Element).closest("[data-hover-sound]");
    if (target && !target.contains(event.relatedTarget as Node | null)) {
      actions.hover();
    }
  });

  onValue("volume_range", "input", (value) => {
    actions.setMenuMusicVolume(Number(value) / 100);
  });
  onValue("gameAudio_range", "input", (value) => {
    actions.setGameMusicVolume(Number(value) / 100);
  });
  onValue("primerText", "input", (value) => {
    actions.type(value);
  });
  onValue("gameDiff", "change", (value) => {
    if (isDifficultyId(value)) {
      actions.setDifficulty(value);
    }
  });
  byId("heroChoise").addEventListener("change", (event) => {
    const value = (event.target as HTMLInputElement).value;
    if (isHeroId(value)) {
      actions.setHero(value);
    }
  });
}

function onValue(id: string, type: "input" | "change", handler: (value: string) => void): void {
  const element = byId(id, HTMLElement) as HTMLInputElement | HTMLSelectElement;
  element.addEventListener(type, () => {
    handler(element.value);
  });
}
