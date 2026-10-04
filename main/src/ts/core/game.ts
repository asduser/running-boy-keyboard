import type { Difficulty } from "../models/difficulty";
import type { Level } from "../models/level";
import type { Actor, RoundResult, RoundSnapshot } from "../models/round";
import { Emitter } from "./emitter";
import { HERO_START_POSITION, HERO_STEP, MISTAKE_PENALTY, SPRITE_FRAMES } from "./rules";
import { browserScheduler, type Scheduler } from "./scheduler";
import { TypingRound, type TypingResult } from "./typingRound";

export interface RoundConfig {
  readonly level: Level;
  readonly difficulty: Difficulty;
}

export interface GameEvents {
  roundStarted: RoundSnapshot;
  typed: { readonly result: Exclude<TypingResult, "ignored">; readonly round: RoundSnapshot };
  heroMoved: Actor;
  enemyMoved: Actor;
  enemyBarked: void;
  roundEnded: RoundResult;
}

interface ActiveRound {
  readonly config: RoundConfig;
  readonly typing: TypingRound;
  readonly startedAt: number;
  readonly stopChase: () => void;
  score: number;
  heroSteps: number;
  hero: Actor;
  enemySteps: number;
  enemy: Actor;
}

export interface GameOptions {
  readonly scheduler?: Scheduler;
  readonly now?: () => number;
  readonly random?: () => number;
}

export class Game extends Emitter<GameEvents> {
  private round: ActiveRound | null = null;
  private readonly scheduler: Scheduler;
  private readonly now: () => number;
  private readonly random: () => number;

  constructor(options: GameOptions = {}) {
    super();
    this.scheduler = options.scheduler ?? browserScheduler;
    this.now = options.now ?? Date.now;
    this.random = options.random ?? Math.random;
  }

  get isRunning(): boolean {
    return this.round !== null;
  }

  start(config: RoundConfig): void {
    this.abort();
    const { texts, enemy } = config.level;
    const text = texts[Math.floor(this.random() * texts.length)];
    this.round = {
      config,
      typing: new TypingRound(text),
      startedAt: this.now(),
      stopChase: this.scheduler.every(config.difficulty.enemyStepDelayMs, () => this.chaseStep()),
      score: 0,
      heroSteps: 1,
      hero: { position: HERO_START_POSITION, frame: 1 },
      enemySteps: 1,
      enemy: { position: enemy.startPosition, frame: 1 },
    };
    this.emit("roundStarted", this.snapshot(this.round));
  }

  type(input: string): void {
    const round = this.round;
    if (!round) {
      return;
    }
    const result = round.typing.check(input);
    if (result === "ignored") {
      return;
    }
    if (result === "correct") {
      round.score += round.config.difficulty.pointsPerChar;
      round.heroSteps++;
      round.hero = {
        position: round.hero.position + HERO_STEP,
        frame: round.heroSteps % SPRITE_FRAMES,
      };
      this.emit("heroMoved", round.hero);
    } else {
      round.score -= MISTAKE_PENALTY;
    }
    this.emit("typed", { result, round: this.snapshot(round) });
    if (round.typing.finished) {
      this.finish("won");
    }
  }

  abort(): void {
    if (this.round) {
      this.finish("aborted");
    }
  }

  private chaseStep(): void {
    const round = this.round;
    if (!round) {
      return;
    }
    const { enemy } = round.config.level;
    const { enemyStep, catchDistance } = round.config.difficulty;
    if (round.enemySteps < enemy.maxSteps) {
      round.enemy = {
        position: round.enemy.position + enemyStep,
        frame: round.enemySteps % SPRITE_FRAMES,
      };
      round.enemySteps++;
      this.emit("enemyMoved", round.enemy);
    }
    if (round.enemy.position >= round.hero.position - catchDistance) {
      this.finish("lost");
      return;
    }
    if (enemy.barkSteps.includes(round.enemySteps)) {
      this.emit("enemyBarked", undefined);
    }
  }

  private finish(outcome: RoundResult["outcome"]): void {
    const round = this.round;
    if (!round) {
      return;
    }
    round.stopChase();
    this.round = null;
    this.emit("roundEnded", {
      outcome,
      score: round.score,
      durationSec: (this.now() - round.startedAt) / 1000,
    });
  }

  private snapshot(round: ActiveRound): RoundSnapshot {
    return {
      chars: round.typing.characters,
      progress: round.typing.progress,
      length: round.typing.length,
      score: round.score,
      hero: round.hero,
      enemy: round.enemy,
    };
  }
}
