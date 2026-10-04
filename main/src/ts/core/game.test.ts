import { DIFFICULTIES, type Difficulty } from "../models/difficulty";
import type { Enemy } from "../models/enemy";
import type { Level } from "../models/level";
import type { RoundResult, RoundSnapshot } from "../models/round";
import { Game, type GameEvents, type RoundConfig } from "./game";
import { HERO_START_POSITION, HERO_STEP, MISTAKE_PENALTY } from "./rules";
import { createFakeScheduler, type FakeScheduler } from "./testing";

const ENEMY: Enemy = {
  name: "Test dog",
  spriteFolder: "dog",
  startPosition: 40,
  maxSteps: 300,
  barkSteps: [3],
};

function level(texts: readonly string[], enemy: Enemy = ENEMY): Level {
  return { number: 1, title: "Test", background: "bg.jpg", texts, enemy };
}

interface Setup {
  readonly game: Game;
  readonly clock: FakeScheduler;
  readonly started: RoundSnapshot[];
  readonly ended: RoundResult[];
  readonly advanceTime: (ms: number) => void;
}

function setup(random = 0): Setup {
  const clock = createFakeScheduler();
  let now = 1_000;
  const game = new Game({ scheduler: clock.scheduler, now: () => now, random: () => random });
  const started: RoundSnapshot[] = [];
  const ended: RoundResult[] = [];
  game.on("roundStarted", (round) => started.push(round));
  game.on("roundEnded", (result) => ended.push(result));
  return {
    game,
    clock,
    started,
    ended,
    advanceTime: (ms) => {
      now += ms;
    },
  };
}

function recordTyped(game: Game): GameEvents["typed"][] {
  const events: GameEvents["typed"][] = [];
  game.on("typed", (event) => events.push(event));
  return events;
}

function config(texts: readonly string[], difficulty: Difficulty = DIFFICULTIES.hard): RoundConfig {
  return { level: level(texts), difficulty };
}

describe("Game", () => {
  describe("start", () => {
    it("emits the initial round snapshot", () => {
      const { game, started } = setup();

      game.start(config(["ab"]));

      expect(game.isRunning).toBe(true);
      expect(started).toEqual([
        {
          chars: [
            { char: "a", typed: false, mistyped: false },
            { char: "b", typed: false, mistyped: false },
          ],
          progress: 0,
          length: 2,
          score: 0,
          hero: { position: HERO_START_POSITION, frame: 1 },
          enemy: { position: ENEMY.startPosition, frame: 1 },
        },
      ]);
    });

    it("picks the level text from the random source", () => {
      const first = setup(0);
      const last = setup(0.999);

      first.game.start(config(["first", "last"]));
      last.game.start(config(["first", "last"]));

      expect(first.started[0]?.length).toBe("first".length);
      expect(last.started[0]?.length).toBe("last".length);
    });

    it("schedules the chase with the difficulty step delay", () => {
      const { game, clock } = setup();

      game.start(config(["ab"], DIFFICULTIES.easy));

      expect(clock.intervalMs).toBe(DIFFICULTIES.easy.enemyStepDelayMs);
      expect(clock.running).toBe(true);
    });

    it("aborts a round that is still running", () => {
      const { game, ended } = setup();
      game.start(config(["ab"]));

      game.start(config(["ab"]));

      expect(ended.map((result) => result.outcome)).toEqual(["aborted"]);
      expect(game.isRunning).toBe(true);
    });

    it("rejects a level without texts", () => {
      const { game } = setup();

      expect(() => {
        game.start(config([]));
      }).toThrow("Level 1 has no texts");
    });
  });

  describe("typing", () => {
    it("scores and moves the hero on a correct character", () => {
      const { game } = setup();
      const typed = recordTyped(game);
      const heroMoved = jest.fn();
      game.on("heroMoved", heroMoved);
      game.start(config(["ab"]));

      game.type("a");

      expect(heroMoved).toHaveBeenCalledWith({
        position: HERO_START_POSITION + HERO_STEP,
        frame: 2,
      });
      expect(typed.map(({ result, round }) => [result, round.progress, round.score])).toEqual([
        ["correct", 1, DIFFICULTIES.hard.pointsPerChar],
      ]);
    });

    it("applies the penalty on a mistake without moving the hero", () => {
      const { game } = setup();
      const typed = recordTyped(game);
      const heroMoved = jest.fn();
      game.on("heroMoved", heroMoved);
      game.start(config(["ab"]));

      game.type("x");

      expect(heroMoved).not.toHaveBeenCalled();
      expect(typed.map(({ result, round }) => [result, round.progress, round.score])).toEqual([
        ["mistake", 0, -MISTAKE_PENALTY],
      ]);
    });

    it("ignores input that adds nothing new", () => {
      const { game } = setup();
      const typed = jest.fn();
      game.on("typed", typed);
      game.start(config(["ab"]));

      game.type("");

      expect(typed).not.toHaveBeenCalled();
    });

    it("ignores input when no round is running", () => {
      const { game } = setup();
      const typed = jest.fn();
      game.on("typed", typed);

      game.type("a");

      expect(typed).not.toHaveBeenCalled();
    });

    it("wins when the whole text is typed", () => {
      const { game, clock, ended, advanceTime } = setup();
      game.start(config(["ab"], DIFFICULTIES.medium));
      advanceTime(2_500);

      game.type("x");
      game.type("a");
      game.type("ab");

      expect(ended).toEqual([
        {
          outcome: "won",
          score: 2 * DIFFICULTIES.medium.pointsPerChar - MISTAKE_PENALTY,
          durationSec: 2.5,
        },
      ]);
      expect(game.isRunning).toBe(false);
      expect(clock.running).toBe(false);
    });
  });

  describe("chase", () => {
    it("moves the enemy one step per tick", () => {
      const { game, clock } = setup();
      const enemyMoved = jest.fn();
      game.on("enemyMoved", enemyMoved);
      game.start(config(["ab"], DIFFICULTIES.medium));

      clock.tick(2);

      expect(enemyMoved.mock.calls).toEqual([
        [{ position: ENEMY.startPosition + 2, frame: 1 }],
        [{ position: ENEMY.startPosition + 4, frame: 2 }],
      ]);
    });

    it("loses when the enemy reaches the catch distance", () => {
      const { game, clock, ended } = setup();
      const { enemyStep, catchDistance } = DIFFICULTIES.hard;
      const ticksToCatch = (HERO_START_POSITION - catchDistance - ENEMY.startPosition) / enemyStep;
      game.start(config(["ab"]));

      clock.tick(ticksToCatch - 1);
      expect(ended).toEqual([]);

      clock.tick();
      expect(ended.map((result) => result.outcome)).toEqual(["lost"]);
      expect(clock.running).toBe(false);
    });

    it("catches the hero even when the enemy steps over the exact catch point", () => {
      const { game, clock, ended } = setup();
      game.start(config(["ab"], DIFFICULTIES.medium));
      game.type("a");

      clock.tick(100);

      expect(ended.map((result) => result.outcome)).toEqual(["lost"]);
    });

    it("barks on the configured steps", () => {
      const { game, clock } = setup();
      const barked = jest.fn();
      game.on("enemyBarked", barked);
      game.start(config(["ab"]));

      clock.tick(1);
      expect(barked).not.toHaveBeenCalled();

      clock.tick(1);
      expect(barked).toHaveBeenCalledTimes(1);
    });

    it("stops moving after the maximum number of steps", () => {
      const clock = createFakeScheduler();
      const game = new Game({ scheduler: clock.scheduler, random: () => 0 });
      const enemyMoved = jest.fn();
      game.on("enemyMoved", enemyMoved);
      game.start({
        level: level(["ab"], { ...ENEMY, maxSteps: 3 }),
        difficulty: DIFFICULTIES.easy,
      });

      clock.tick(10);

      expect(enemyMoved).toHaveBeenCalledTimes(2);
    });
  });

  describe("abort", () => {
    it("ends the round as aborted and stops the chase", () => {
      const { game, clock, ended } = setup();
      game.start(config(["ab"]));
      game.type("a");

      game.abort();

      expect(ended).toEqual([
        { outcome: "aborted", score: DIFFICULTIES.hard.pointsPerChar, durationSec: 0 },
      ]);
      expect(clock.running).toBe(false);
    });

    it("does nothing when no round is running", () => {
      const { game, ended } = setup();

      game.abort();

      expect(ended).toEqual([]);
    });
  });

  it("stops notifying a listener after it unsubscribes", () => {
    const { game } = setup();
    const listener = jest.fn();
    const unsubscribe = game.on("roundStarted", listener);

    unsubscribe();
    game.start(config(["ab"]));

    expect(listener).not.toHaveBeenCalled();
  });
});
