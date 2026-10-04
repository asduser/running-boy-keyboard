import { byId } from "./dom";
import type { Layout } from "./layout";

const POPUPS = {
  soundUnlock: "parent_soundUnlock",
  mainMenu: "parent_popup",
  volume: "parent_miscGame",
  settings: "parent_option",
  help: "parent_help",
  levelIntro: "parent_level1Popup",
  gameOver: "parent_gameOverPopup",
  winner: "parent_winnerPopup",
  stats: "parent_statsPopup",
} as const;

export type Popup = keyof typeof POPUPS;

const ALL_POPUPS = Object.keys(POPUPS) as Popup[];

export class Screens {
  constructor(private readonly layout: Layout) {
    layout.onResize(() => ALL_POPUPS.forEach((popup) => layout.fitPopup(this.element(popup))));
  }

  show(popup: Popup): void {
    const element = this.element(popup);
    element.style.display = "block";
    this.layout.fitPopup(element);
  }

  hide(...popups: Popup[]): void {
    popups.forEach((popup) => (this.element(popup).style.display = "none"));
  }

  hideGamePopups(): void {
    this.hide(...ALL_POPUPS.filter((popup) => popup !== "soundUnlock"));
  }

  private element(popup: Popup): HTMLElement {
    return byId(POPUPS[popup]);
  }
}
