import type { Actor, RoundSnapshot } from "../models/round";
import { MENU_BACKGROUND, imageUrl, spriteUrl } from "./assets";
import { byId } from "./dom";

export interface RoundLook {
  readonly heroSprites: string;
  readonly enemySprites: string;
  readonly background: string;
}

export class GameView {
  private look: RoundLook | null = null;

  showRound(round: RoundSnapshot, look: RoundLook): void {
    this.look = look;
    this.setBackground(look.background);
    const input = byId<HTMLInputElement>("primerText");
    input.value = "";
    input.maxLength = round.length;
    byId<HTMLProgressElement>("progressBar").max = round.length;
    this.renderTyping(round);
    this.moveHero(round.hero);
    this.moveEnemy(round.enemy);
    this.setStageVisible(true);
  }

  renderTyping(round: RoundSnapshot): void {
    const text = byId("textField");
    text.replaceChildren(
      ...round.chars.map((state) => {
        const span = document.createElement("span");
        span.textContent = state.char;
        span.classList.toggle("char-typed", state.typed);
        span.classList.toggle("char-mistyped", state.mistyped);
        return span;
      }),
    );
    byId<HTMLProgressElement>("progressBar").value = round.progress;
    byId("divScoreVal").textContent = String(round.score);
  }

  moveHero(hero: Actor): void {
    if (this.look) {
      this.placeSprite(byId<HTMLImageElement>("spriteBoy"), this.look.heroSprites, hero);
    }
  }

  moveEnemy(enemy: Actor): void {
    if (this.look) {
      this.placeSprite(byId<HTMLImageElement>("spriteEnemy"), this.look.enemySprites, enemy);
    }
  }

  hide(): void {
    this.setStageVisible(false);
    this.showMenuBackground();
  }

  showMenuBackground(): void {
    this.setBackground(MENU_BACKGROUND);
  }

  private placeSprite(sprite: HTMLImageElement, folder: string, actor: Actor): void {
    sprite.src = spriteUrl(folder, actor.frame);
    sprite.style.left = `${actor.position}px`;
  }

  private setBackground(file: string): void {
    document.body.style.backgroundImage = `url('${imageUrl(file)}')`;
  }

  private setStageVisible(visible: boolean): void {
    const display = visible ? "block" : "none";
    byId("wrapper_div").style.display = display;
    byId("GameScoreDiv").style.display = display;
    byId("generalMenuDiv").style.display = display;
  }
}
