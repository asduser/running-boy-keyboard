import type { Background } from "../models";
import type { Actor, RoundSnapshot } from "../models";
import type { Snowfall, Weather } from "../models";
import { MENU_BACKGROUND, imageUrl, spriteUrl, svgUrl } from "./assets";
import type { Birds } from "./birds";
import { byId } from "./dom";
import type { WeatherView } from "./weatherView";

export interface RoundLook {
  readonly heroSprites: string;
  readonly enemySprites: string;
  readonly background: Background;
  readonly birds: boolean;
  readonly textColor?: string;
  readonly weather?: Weather;
  readonly snowfall?: Snowfall;
}

export class GameView {
  private look: RoundLook | null = null;
  private typedText = "";

  constructor(
    private readonly birds: Birds,
    private readonly weather: WeatherView,
  ) {}

  showRound(round: RoundSnapshot, look: RoundLook): void {
    this.look = look;
    this.setBackground(look.background);
    byId("textField").style.color = look.textColor ?? "";
    const input = byId("primerText", HTMLInputElement);
    input.value = "";
    input.maxLength = round.length;
    byId("progressBar", HTMLProgressElement).max = round.length;
    this.renderTyping(round);
    this.moveHero(round.hero);
    this.moveEnemy(round.enemy);
    this.setStageVisible(true);
    this.weather.start(look.weather, look.snowfall);
    input.focus({ preventScroll: true });
  }

  renderTyping(round: RoundSnapshot): void {
    const text = byId("textField");
    text.replaceChildren(
      ...round.chars.map((state) => {
        const span = document.createElement("span");
        span.textContent = state.char;
        span.classList.toggle("char-typed", state.typed);
        span.classList.toggle("char-mistyped", state.mistyped && !state.typed);
        return span;
      }),
    );
    byId("progressBar", HTMLProgressElement).value = round.progress;
    byId("divScoreVal").textContent = String(round.score);
    this.typedText = round.chars
      .slice(0, round.progress)
      .map((state) => state.char)
      .join("");
    this.syncInput();
  }

  syncInput(): void {
    const input = byId("primerText", HTMLInputElement);
    if (input.value !== this.typedText) {
      input.value = this.typedText;
    }
  }

  moveHero(hero: Actor): void {
    if (this.look) {
      this.placeSprite(byId("spriteBoy", HTMLImageElement), this.look.heroSprites, hero);
    }
  }

  moveEnemy(enemy: Actor): void {
    if (this.look) {
      this.placeSprite(byId("spriteEnemy", HTMLImageElement), this.look.enemySprites, enemy);
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

  private setBackground(background: Background): void {
    const foreground = byId("foreground");
    if (typeof background === "string") {
      document.body.style.backgroundImage = `url("${imageUrl(background)}")`;
      foreground.style.backgroundImage = "none";
      return;
    }
    const scenery = background();
    document.body.style.backgroundImage = `url("${svgUrl(scenery.background)}")`;
    foreground.style.backgroundImage = `url("${svgUrl(scenery.foreground)}")`;
  }

  private setStageVisible(visible: boolean): void {
    const display = visible ? "block" : "none";
    byId("wrapper_div").style.display = display;
    byId("GameScoreDiv").style.display = display;
    byId("generalMenuDiv").style.display = display;
    if (visible && this.look?.birds) {
      this.birds.start();
    } else {
      this.birds.stop();
    }
    if (!visible) {
      this.weather.stop();
      byId("primerText").blur();
    }
  }
}
