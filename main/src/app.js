"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // main/src/ts/core/emitter.ts
  var Emitter = class {
    constructor() {
      __publicField(this, "listeners", {});
    }
    on(type, listener) {
      var _a;
      const set = (_a = this.listeners)[type] ?? (_a[type] = /* @__PURE__ */ new Set());
      set.add(listener);
      return () => set.delete(listener);
    }
    emit(type, payload) {
      this.listeners[type]?.forEach((listener) => {
        listener(payload);
      });
    }
  };

  // main/src/ts/core/rules.ts
  var HERO_START_POSITION = 253;
  var HERO_STEP = 3;
  var MISTAKE_PENALTY = 2;
  var SPRITE_FRAMES = 4;

  // main/src/ts/core/scheduler.ts
  var browserScheduler = {
    every(intervalMs, task) {
      const id = setInterval(task, intervalMs);
      return () => {
        clearInterval(id);
      };
    }
  };

  // main/src/ts/core/typingRound.ts
  var TypingRound = class {
    constructor(text) {
      __publicField(this, "text", text);
      __publicField(this, "chars");
      __publicField(this, "cursor", 0);
      this.chars = text.split("").map((char) => ({ char, typed: false, mistyped: false }));
    }
    get progress() {
      return this.cursor;
    }
    get length() {
      return this.chars.length;
    }
    get finished() {
      return this.cursor >= this.chars.length;
    }
    get characters() {
      return this.chars.map((state) => ({ ...state }));
    }
    check(input) {
      const current = this.chars[this.cursor];
      if (!current || input.length <= this.cursor) {
        return "ignored";
      }
      if (input[this.cursor] !== current.char) {
        current.mistyped = true;
        return "mistake";
      }
      current.typed = true;
      this.cursor++;
      return "correct";
    }
  };

  // main/src/ts/core/game.ts
  var Game = class extends Emitter {
    constructor(options = {}) {
      super();
      __publicField(this, "round", null);
      __publicField(this, "scheduler");
      __publicField(this, "now");
      __publicField(this, "random");
      this.scheduler = options.scheduler ?? browserScheduler;
      this.now = options.now ?? Date.now;
      this.random = options.random ?? Math.random;
    }
    get isRunning() {
      return this.round !== null;
    }
    start(config) {
      this.abort();
      const { texts, enemy } = config.level;
      const text = texts[Math.floor(this.random() * texts.length)];
      if (text === void 0) {
        throw new Error(`Level ${String(config.level.number)} has no texts`);
      }
      this.round = {
        config,
        typing: new TypingRound(text),
        startedAt: this.now(),
        stopChase: this.scheduler.every(config.difficulty.enemyStepDelayMs, () => {
          this.chaseStep();
        }),
        score: 0,
        heroSteps: 1,
        hero: { position: HERO_START_POSITION, frame: 1 },
        enemySteps: 1,
        enemy: { position: enemy.startPosition, frame: 1 }
      };
      this.emit("roundStarted", this.snapshot(this.round));
    }
    type(input) {
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
          frame: round.heroSteps % SPRITE_FRAMES
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
    abort() {
      if (this.round) {
        this.finish("aborted");
      }
    }
    chaseStep() {
      const round = this.round;
      if (!round) {
        return;
      }
      const { enemy } = round.config.level;
      const { enemyStep, catchDistance } = round.config.difficulty;
      if (round.enemySteps < enemy.maxSteps) {
        round.enemy = {
          position: round.enemy.position + enemyStep,
          frame: round.enemySteps % SPRITE_FRAMES
        };
        round.enemySteps++;
        this.emit("enemyMoved", round.enemy);
      }
      if (round.enemy.position >= round.hero.position - catchDistance) {
        this.finish("lost");
        return;
      }
      if (enemy.barkSteps.includes(round.enemySteps)) {
        this.emit("enemyBarked", void 0);
      }
    }
    finish(outcome) {
      const round = this.round;
      if (!round) {
        return;
      }
      round.stopChase();
      this.round = null;
      this.emit("roundEnded", {
        outcome,
        score: round.score,
        durationSec: (this.now() - round.startedAt) / 1e3
      });
    }
    snapshot(round) {
      return {
        chars: round.typing.characters,
        progress: round.typing.progress,
        length: round.typing.length,
        score: round.score,
        hero: round.hero,
        enemy: round.enemy
      };
    }
  };

  // main/src/ts/core/sessionStats.ts
  var SessionStats = class {
    constructor() {
      __publicField(this, "attempts", 0);
      __publicField(this, "results", []);
    }
    startAttempt() {
      this.attempts++;
    }
    record(result) {
      this.results.push(result);
    }
    summary() {
      const scores = this.results.map((result) => result.score);
      const times = this.results.map((result) => result.durationSec);
      const wins = this.count("won");
      const losses = this.count("lost");
      return {
        attempts: this.attempts,
        wins,
        losses,
        aborted: this.attempts - wins - losses,
        totalScore: sum(scores),
        maxScore: extreme(scores, Math.max),
        minScore: extreme(scores, Math.min),
        totalTimeSec: sum(times),
        maxTimeSec: extreme(times, Math.max),
        minTimeSec: extreme(times, Math.min)
      };
    }
    count(outcome) {
      return this.results.filter((result) => result.outcome === outcome).length;
    }
  };
  function sum(values) {
    return values.reduce((total, value) => total + value, 0);
  }
  function extreme(values, pick2) {
    return values.length ? pick2(...values) : 0;
  }

  // main/src/ts/models/enemy.ts
  var DOG = {
    name: "Xaero",
    spriteFolder: "rb6_sprites",
    startPosition: 40,
    maxSteps: 300,
    barkSteps: [20, 22, 80, 82, 200, 202]
  };

  // main/src/ts/levels/abandonedArea.ts
  var ABANDONED_AREA = {
    number: 1,
    title: "Abandoned area",
    background: "bg_font_mini.jpg",
    texts: [
      "hgfj ysdsk oery sdgsw wgqsy ushdsz dsjsw o",
      "ifgdu nvcq zasy mglgp fyeg cgdsgh sqwff kb",
      "bvjmgfjfie tdsrwfdfg dssrqifkc xghstwr erq",
      "os jun pre mid gui ris sin qua liv cal abs",
      "fdofdkl fdhjreyux fdyudywer fuidfuid fpi f",
      "mcrsft ppl ggl andrd s wndws phn lg smsng"
    ],
    enemy: DOG,
    birds: true,
    weather: {
      calmMs: { min: 2e3, max: 8e3 },
      stormMs: { min: 1e4, max: 25e3 },
      drops: { min: 70, max: 160 },
      windDeg: { min: 6, max: 20 },
      lightningStrikes: { min: 1, max: 4 }
    }
  };

  // main/src/ts/levels/snowScene.ts
  var WIDTH = 1500;
  var HEIGHT = 750;
  var GROUND_Y = 688;
  var SCARF_COLORS = ["#d62828", "#2a9d8f", "#f4a261", "#6a4c93", "#1d70b8"];
  var FAR_RANGE = "M0 520 L90 400 L170 450 L260 300 L340 390 L420 340 L520 250 L610 380 L700 330 L790 420 L880 290 L980 240 L1080 360 L1170 310 L1260 400 L1350 280 L1440 370 L1500 330 V640 H0Z";
  var FAR_SNOWLINE = "M0 0 H1500 V360 L1450 372 L1400 350 L1340 366 L1290 345 L1230 362 L1170 342 L1110 366 L1050 335 L990 352 L930 330 L870 350 L810 338 L750 362 L690 344 L630 368 L570 340 L510 330 L450 356 L390 348 L330 370 L270 342 L210 362 L150 350 L90 368 L40 352 L0 362Z";
  var MID_RANGE = "M0 560 L110 450 L200 520 L300 420 L400 500 L470 460 L560 540 L660 430 L760 510 L850 470 L950 550 L1050 440 L1150 520 L1240 460 L1330 530 L1420 450 L1500 500 V690 H0Z";
  var MID_SNOWLINE = "M0 0 H1500 V478 L1460 486 L1420 470 L1380 488 L1330 476 L1270 490 L1220 474 L1160 486 L1100 470 L1050 484 L1000 472 L940 488 L880 478 L820 490 L760 474 L700 486 L650 470 L600 486 L540 478 L480 490 L420 474 L360 486 L300 470 L240 488 L180 476 L120 488 L60 472 L0 484Z";
  var HILLS = "M0 640 C120 600 220 610 330 632 C450 656 540 596 680 604 C800 611 880 650 1000 636 C1120 622 1200 590 1320 606 C1410 618 1460 640 1500 630 V700 H0Z";
  var GROUND = "M0 690 C150 682 300 694 450 688 C600 682 750 692 900 687 C1050 682 1200 693 1350 688 C1420 686 1470 690 1500 688 V750 H0Z";
  var PINES = [
    [70, 648, 1],
    [110, 652, 0.8],
    [560, 612, 0.9],
    [600, 618, 0.7],
    [1210, 606, 1],
    [1250, 610, 0.75],
    [1440, 636, 0.85]
  ];
  function between(random, min, max) {
    return min + random() * (max - min);
  }
  function planSnowmen(random = Math.random) {
    const near = Math.round(between(random, 3, 5));
    const far = Math.round(between(random, 1, 3));
    const place = (count, baseY, scale) => Array.from({ length: count }, (_, slot) => {
      const slotWidth = WIDTH / count;
      return {
        x: Math.round(slot * slotWidth + between(random, 0.2, 0.8) * slotWidth),
        baseY: Math.round(between(random, ...baseY)),
        scale: Number(between(random, ...scale).toFixed(2)),
        flip: random() < 0.5,
        scarf: SCARF_COLORS[Math.floor(random() * SCARF_COLORS.length)] ?? "#d62828",
        hat: random() < 0.6
      };
    });
    return [...place(far, [664, 674], [0.35, 0.5]), ...place(near, [694, 704], [0.75, 1.05])];
  }
  function snowman({ x, baseY, scale, flip, scarf, hat }) {
    const hatShape = hat ? '<rect x="-11" y="-118" width="22" height="18" rx="2" fill="#222"/><rect x="-11" y="-106" width="22" height="4" fill="#b22"/><rect x="-16" y="-102" width="32" height="4" rx="2" fill="#222"/>' : "";
    return `<g transform="translate(${String(x)} ${String(baseY)}) scale(${String(flip ? -scale : scale)} ${String(scale)})">
<ellipse cx="4" cy="0" rx="32" ry="6" fill="#5a7894" opacity=".25"/>
<path d="M-17 -66 L-38 -84 M-30 -77 L-36 -71 M17 -66 L38 -86 M31 -80 L39 -76" stroke="#6b4a2b" stroke-width="3" stroke-linecap="round" fill="none"/>
<circle cy="-26" r="27" fill="url(#ball)"/>
<circle cy="-64" r="19" fill="url(#ball)"/>
<circle cy="-91" r="13" fill="url(#ball)"/>
<path d="M-13 -79 Q0 -71 13 -79 L13 -75 Q0 -67 -13 -75Z M6 -76 L11 -60 L4 -60 L2 -74Z" fill="${scarf}"/>
<circle cx="-4" cy="-94" r="1.8" fill="#222"/><circle cx="5" cy="-94" r="1.8" fill="#222"/>
<path d="M1 -90 L16 -87 L1 -85Z" fill="#f28c28"/>
<circle cy="-60" r="2.2" fill="#333"/><circle cy="-50" r="2.2" fill="#333"/><circle cy="-34" r="2.4" fill="#333"/>
${hatShape}
</g>`;
  }
  function pine(x, baseY, scale) {
    return `<g transform="translate(${String(x)} ${String(baseY)}) scale(${String(scale)})">
<rect x="-3" y="-10" width="6" height="12" fill="#5b3b22"/>
<path d="M0 -70 L-16 -40 L-8 -40 L-22 -12 L22 -12 L8 -40 L16 -40Z" fill="#2f5d50"/>
<path d="M0 -70 L-8 -55 L-2 -57 L0 -52 L3 -57 L8 -55Z M-14 -38 L-6 -42 L0 -38 L6 -42 L14 -38 L8 -40 L0 -46 L-8 -40Z" fill="#f4f9fd"/>
</g>`;
  }
  function snowScene(random = Math.random) {
    const snowmen = planSnowmen(random).map(snowman).join("");
    const pines = PINES.map(([x, y, scale]) => pine(x, y, scale)).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${String(WIDTH)}" height="${String(HEIGHT)}" viewBox="0 0 ${String(WIDTH)} ${String(HEIGHT)}">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb0e8"/><stop offset=".55" stop-color="#a9d6f3"/><stop offset=".85" stop-color="#e3f2fb"/></linearGradient>
<linearGradient id="far" x1="0" y1="0" x2="0" y2="1"><stop offset=".3" stop-color="#9db7d1"/><stop offset="1" stop-color="#d4e4f1"/></linearGradient>
<linearGradient id="mid" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#6f8fb0"/><stop offset="1" stop-color="#a9c1d8"/></linearGradient>
<linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfdff"/><stop offset="1" stop-color="#dbe8f3"/></linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#e8f1f8"/><stop offset="1" stop-color="#c3d7e8"/></linearGradient>
<radialGradient id="ball" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eef4fa"/><stop offset="1" stop-color="#c2d4e6"/></radialGradient>
<clipPath id="farClip"><path d="${FAR_RANGE}"/></clipPath>
<clipPath id="midClip"><path d="${MID_RANGE}"/></clipPath>
</defs>
<rect width="${String(WIDTH)}" height="${String(HEIGHT)}" fill="url(#sky)"/>
<path d="${FAR_RANGE}" fill="url(#far)"/>
<path d="${FAR_SNOWLINE}" fill="#f7fbfe" clip-path="url(#farClip)"/>
<path d="${MID_RANGE}" fill="url(#mid)"/>
<path d="${MID_SNOWLINE}" fill="#f4f9fd" clip-path="url(#midClip)"/>
<path d="${HILLS}" fill="url(#hill)"/>
${pines}
<path d="${GROUND}" fill="url(#ground)"/>
<path d="M0 ${String(GROUND_Y + 2)} H${String(WIDTH)}" stroke="#ffffff" stroke-width="3" opacity=".8"/>
${snowmen}
</svg>`;
  }

  // main/src/ts/levels/mock.ts
  var SNOW_LEVEL = {
    number: 2,
    title: "Snowman",
    background: snowScene,
    texts: ABANDONED_AREA.texts,
    enemy: DOG,
    birds: false,
    snowfall: { flakes: 160 }
  };

  // main/src/ts/levels/index.ts
  var FIRST_LEVEL = ABANDONED_AREA;

  // main/src/ts/media/sounds.ts
  var MEDIA_PATH = "../../media/";
  var MUSIC = {
    menu: "main_sound.ogg",
    game: "fontGameMusic.ogg"
  };
  var EFFECTS = {
    hover: "button19.wav",
    click: "click.ogg",
    bark: "dogAgressive.wav",
    gameOver: "gameOver.wav",
    win: "winnerPopup.wav"
  };

  // main/src/ts/media/audioManager.ts
  var AudioManager = class {
    constructor(options = {}) {
      __publicField(this, "music");
      __publicField(this, "effects");
      __publicField(this, "onAutoplayBlocked");
      __publicField(this, "wanted", /* @__PURE__ */ new Set());
      __publicField(this, "suspended", false);
      const basePath = options.basePath ?? MEDIA_PATH + "sounds/";
      this.onAutoplayBlocked = options.onAutoplayBlocked ?? (() => void 0);
      this.music = createAll(MUSIC, basePath, true);
      this.effects = createAll(EFFECTS, basePath, false);
    }
    playMusic(id, fromStart = false) {
      const track = this.music[id];
      this.wanted.add(track);
      if (fromStart) {
        track.currentTime = 0;
      }
      track.play().catch((error) => {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          this.onAutoplayBlocked();
        }
      });
    }
    pauseMusic(id) {
      const track = this.music[id];
      this.wanted.delete(track);
      track.pause();
    }
    setMusicVolume(id, volume) {
      this.music[id].volume = volume;
    }
    playEffect(id) {
      const effect = this.effects[id];
      effect.pause();
      effect.currentTime = 0;
      effect.play().catch(() => void 0);
    }
    setSuspended(suspended) {
      this.suspended = suspended;
      this.all().forEach((sound) => sound.muted = suspended);
    }
    unlock() {
      this.all().filter((sound) => sound.paused).forEach((sound) => {
        this.prime(sound);
      });
    }
    prime(sound) {
      sound.muted = true;
      sound.play().then(() => {
        if (!this.wanted.has(sound)) {
          sound.pause();
          sound.currentTime = 0;
        }
      }).catch(() => void 0).finally(() => {
        sound.muted = this.suspended;
      });
    }
    all() {
      return [...Object.values(this.music), ...Object.values(this.effects)];
    }
  };
  function createAll(files, basePath, loop) {
    const entries = Object.entries(files);
    return Object.fromEntries(
      entries.map(([id, file]) => {
        const audio = new Audio(basePath + file);
        audio.loop = loop;
        audio.preload = "auto";
        return [id, audio];
      })
    );
  }

  // main/src/ts/media/pageActivity.ts
  function watchPageActivity(onChange) {
    let focused = true;
    const update = () => {
      onChange(!document.hidden && focused);
    };
    const onBlur = () => {
      focused = false;
      update();
    };
    const onFocus = () => {
      focused = true;
      update();
    };
    document.addEventListener("visibilitychange", update);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }

  // main/src/ts/menu/mainMenu.ts
  var MainMenu = class {
    constructor() {
      __publicField(this, "played", false);
    }
    get showsLevelIntro() {
      return !this.played;
    }
    markPlayed() {
      this.played = true;
    }
  };

  // main/src/ts/models/difficulty.ts
  var DIFFICULTIES = {
    easy: {
      id: "easy",
      typingSpeed: "Low",
      errorImpact: "-",
      totalTime: "Max",
      pointsPerChar: 4,
      enemyStep: 1,
      enemyStepDelayMs: 250,
      catchDistance: 90
    },
    medium: {
      id: "medium",
      typingSpeed: "Normal",
      errorImpact: "5%",
      totalTime: "Normal",
      pointsPerChar: 5,
      enemyStep: 2,
      enemyStepDelayMs: 250,
      catchDistance: 89
    },
    hard: {
      id: "hard",
      typingSpeed: "Hard",
      errorImpact: "15%",
      totalTime: "Low",
      pointsPerChar: 8,
      enemyStep: 3,
      enemyStepDelayMs: 250,
      catchDistance: 90
    }
  };
  var DEFAULT_DIFFICULTY = "easy";
  function isDifficultyId(value) {
    return value in DIFFICULTIES;
  }

  // main/src/ts/models/hero.ts
  var HEROES = {
    model1: { id: "model1", name: "Model \u21161", spriteFolder: "rb_sprites" },
    model2: { id: "model2", name: "Model \u21162", spriteFolder: "rb3_sprites" },
    model3: { id: "model3", name: "Model \u21163", spriteFolder: "rb4_sprites" },
    model4: { id: "model4", name: "Model \u21164", spriteFolder: "rb5_sprites" }
  };
  var DEFAULT_HERO = "model1";
  function isHeroId(value) {
    return value in HEROES;
  }

  // main/src/ts/menu/settings.ts
  var DEFAULT_SETTINGS = {
    difficulty: DEFAULT_DIFFICULTY,
    hero: DEFAULT_HERO,
    menuMusic: true,
    menuMusicVolume: 0.65,
    gameMusic: true,
    gameMusicVolume: 1,
    menuSounds: true,
    enemySounds: true
  };
  var Settings = class {
    constructor(initial = DEFAULT_SETTINGS) {
      __publicField(this, "state");
      __publicField(this, "listeners", /* @__PURE__ */ new Set());
      this.state = initial;
    }
    get current() {
      return this.state;
    }
    update(changes) {
      this.state = { ...this.state, ...changes };
      this.listeners.forEach((listener) => {
        listener(this.state);
      });
    }
    subscribe(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
  };

  // main/src/ts/viewmanager/dom.ts
  function byId(id, type = HTMLElement) {
    const element = document.getElementById(id);
    if (!(element instanceof type)) {
      throw new Error(`Missing element #${id} of type ${type.name}`);
    }
    return element;
  }

  // main/src/ts/viewmanager/flock.ts
  var MAX_BIRDS = 10;
  function between2(random, min, max) {
    return min + random() * (max - min);
  }
  function planFlock(random = Math.random) {
    const count = 1 + Math.min(MAX_BIRDS - 1, Math.floor(random() * MAX_BIRDS));
    const birds = Array.from({ length: count }, () => ({
      topPercent: between2(random, 4, 40),
      sizePx: Math.round(between2(random, 26, 48)),
      durationMs: Math.round(between2(random, 9e3, 18e3)),
      delayMs: Math.round(between2(random, 0, 4e3)),
      flapMs: Math.round(between2(random, 280, 520))
    }));
    return { birds, pauseAfterMs: Math.round(between2(random, 1500, 6e3)) };
  }

  // main/src/ts/viewmanager/birds.ts
  var SVG_NS = "http://www.w3.org/2000/svg";
  var BAT_PATH = "M0 5 Q9 -2 20 9 Q31 -2 40 5 Q32 7 20 17 Q8 7 0 5Z";
  var BIRD_BODY_PATH = "M1.5 8.6 L4 7.7 Q5.5 5.8 7.6 6.6 Q9 7.2 10 7.6 Q18 7.4 26 8.4 L36 6 L31 9.2 L36 12.4 L25.5 10.4 Q17 11.6 10 10.2 Q7 10.4 5.2 9.8 Q4 9.4 3.8 9.2 Z";
  var BIRD_WING_PATH = "M11 8 Q14 1 27 0 Q21 3.5 19.5 8 Z";
  var Birds = class {
    constructor(plan = planFlock) {
      __publicField(this, "plan", plan);
      __publicField(this, "sky", byId("birds"));
      __publicField(this, "flight", 0);
      __publicField(this, "flying", false);
      __publicField(this, "nextFlock");
    }
    start() {
      if (this.flying) {
        return;
      }
      this.flying = true;
      this.flyFlock(++this.flight);
    }
    stop() {
      this.flying = false;
      this.flight += 1;
      clearTimeout(this.nextFlock);
      this.sky.replaceChildren();
    }
    flyFlock(flight) {
      const { birds, pauseAfterMs } = this.plan();
      let airborne = birds.length;
      birds.forEach((plan) => {
        const bird = this.createBird(plan);
        bird.addEventListener("animationend", (event) => {
          if (event.target !== bird) {
            return;
          }
          bird.remove();
          airborne -= 1;
          if (airborne === 0 && flight === this.flight) {
            this.nextFlock = setTimeout(() => {
              this.flyFlock(flight);
            }, pauseAfterMs);
          }
        });
        this.sky.append(bird);
      });
    }
    createBird(flight) {
      const bird = document.createElement("div");
      bird.className = "bird";
      bird.style.top = `${flight.topPercent}%`;
      bird.style.width = `${flight.sizePx}px`;
      bird.style.animationDuration = `${flight.durationMs}ms`;
      bird.style.animationDelay = `${flight.delayMs}ms`;
      const svg = svgElement("svg", { viewBox: "0 0 40 18" });
      svg.style.setProperty("--flap", `${flight.flapMs}ms`);
      const songbird = svgElement("g", { class: "bird-shape" });
      songbird.append(
        svgElement("path", { d: BIRD_BODY_PATH }),
        svgElement("path", { class: "bird-wing", d: BIRD_WING_PATH })
      );
      svg.append(songbird, svgElement("path", { class: "bat-shape", d: BAT_PATH }));
      bird.append(svg);
      return bird;
    }
  };
  function svgElement(name, attributes) {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }

  // main/src/ts/viewmanager/controller.ts
  var GameController = class {
    constructor(deps) {
      __publicField(this, "deps", deps);
      __publicField(this, "level");
      const { game, settings } = deps;
      this.level = deps.level;
      game.on("roundStarted", (round) => {
        const { level } = this;
        deps.gameView.showRound(round, {
          heroSprites: HEROES[this.settings.hero].spriteFolder,
          enemySprites: level.enemy.spriteFolder,
          background: level.background,
          birds: level.birds,
          weather: level.weather,
          snowfall: level.snowfall
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
    init() {
      const { screens, gameView, audio } = this.deps;
      this.applySettings(this.settings);
      gameView.showMenuBackground();
      screens.show("mainMenu");
      if (this.settings.menuMusic) {
        audio.playMusic("menu");
      }
    }
    start() {
      this.click();
      this.deps.menuView.showMenuStep("levels");
      this.deps.screens.show("mainMenu");
    }
    chooseLevel() {
      this.deps.menuView.showMenuStep("main");
      this.level = this.deps.level;
      if (this.deps.mainMenu.showsLevelIntro) {
        this.switchPopup("mainMenu", "levelIntro");
      } else {
        this.click();
        this.beginRound();
      }
    }
    mockLevel() {
      this.click();
      this.deps.menuView.showMenuStep("main");
      this.level = this.deps.mockLevel;
      this.beginRound();
    }
    menuBack() {
      this.click();
      this.deps.menuView.showMenuStep("main");
      this.deps.screens.show("mainMenu");
    }
    startLevel() {
      this.click();
      this.beginRound();
    }
    openVolume() {
      this.openFromMenu("volume");
    }
    openSettings() {
      this.openFromMenu("settings");
    }
    openHelp() {
      this.openFromMenu("help");
    }
    backToMenu() {
      this.deps.screens.hide("volume", "settings", "help", "levelIntro");
      this.deps.screens.show("mainMenu");
      this.click();
    }
    leaveToMenu() {
      this.leaveGame("mainMenu");
    }
    leaveToHelp() {
      this.leaveGame("help");
    }
    playAgain() {
      this.click();
      this.beginRound();
    }
    resultToMenu() {
      this.click();
      this.deps.screens.hideGamePopups();
      this.deps.screens.show("mainMenu");
      this.resumeMenuMusic();
    }
    showStats() {
      const { screens, menuView, stats } = this.deps;
      this.click();
      menuView.renderStats(stats.summary());
      screens.hide("gameOver", "winner");
      screens.show("stats");
    }
    unlockSound() {
      this.deps.screens.hide("soundUnlock");
      this.deps.audio.unlock();
    }
    toggleMenuMusic() {
      const enabled = !this.settings.menuMusic;
      this.deps.settings.update({ menuMusic: enabled });
      if (enabled) {
        this.deps.audio.playMusic("menu");
      } else {
        this.deps.audio.pauseMusic("menu");
      }
    }
    setGameMusic(enabled) {
      this.deps.settings.update({ gameMusic: enabled });
    }
    setMenuSounds(enabled) {
      this.deps.settings.update({ menuSounds: enabled });
    }
    setEnemySounds(enabled) {
      this.deps.settings.update({ enemySounds: enabled });
    }
    setMenuMusicVolume(volume) {
      this.deps.settings.update({ menuMusicVolume: volume });
    }
    setGameMusicVolume(volume) {
      this.deps.settings.update({ gameMusicVolume: volume });
    }
    setDifficulty(difficulty) {
      this.deps.settings.update({ difficulty });
    }
    setHero(hero) {
      this.deps.settings.update({ hero });
    }
    type(input) {
      this.deps.game.type(input);
      this.deps.gameView.syncInput();
    }
    hover() {
      if (this.settings.menuSounds) {
        this.deps.audio.playEffect("hover");
      }
    }
    get settings() {
      return this.deps.settings.current;
    }
    beginRound() {
      const { screens, audio, stats, game } = this.deps;
      const { level } = this;
      screens.hideGamePopups();
      audio.pauseMusic("menu");
      if (this.settings.gameMusic) {
        audio.playMusic("game");
      }
      stats.startAttempt();
      game.start({ level, difficulty: DIFFICULTIES[this.settings.difficulty] });
    }
    leaveGame(destination) {
      this.deps.game.abort();
      this.resumeMenuMusic();
      this.deps.screens.show(destination);
    }
    onRoundEnded(result) {
      const { stats, mainMenu, gameView, audio, screens } = this.deps;
      stats.record(result);
      if (this.level === this.deps.level) {
        mainMenu.markPlayed();
      }
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
    openFromMenu(popup) {
      this.switchPopup("mainMenu", popup);
      this.click();
    }
    switchPopup(from, to) {
      this.deps.screens.hide(from);
      this.deps.screens.show(to);
    }
    resumeMenuMusic() {
      if (this.settings.menuMusic) {
        this.deps.audio.playMusic("menu", true);
      }
    }
    click() {
      if (this.settings.menuSounds) {
        this.deps.audio.playEffect("click");
      }
    }
    applySettings(state) {
      this.deps.menuView.renderSettings(state);
      this.deps.audio.setMusicVolume("menu", state.menuMusicVolume);
      this.deps.audio.setMusicVolume("game", state.gameMusicVolume);
    }
  };

  // main/src/ts/viewmanager/assets.ts
  var ASSETS_PATH = "../../assets/";
  var MENU_BACKGROUND = "bg_font_mini2.jpg";
  function spriteUrl(folder, frame) {
    return `${ASSETS_PATH}sprites/${folder}/rb${frame}_mini.png`;
  }
  function imageUrl(file) {
    return `${ASSETS_PATH}images/${file}`;
  }
  function svgUrl(markup) {
    return `data:image/svg+xml,${encodeURIComponent(markup)}`;
  }

  // main/src/ts/viewmanager/gameView.ts
  var GameView = class {
    constructor(birds, weather) {
      __publicField(this, "birds", birds);
      __publicField(this, "weather", weather);
      __publicField(this, "look", null);
      __publicField(this, "typedText", "");
    }
    showRound(round, look) {
      this.look = look;
      this.setBackground(look.background);
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
    renderTyping(round) {
      const text = byId("textField");
      text.replaceChildren(
        ...round.chars.map((state) => {
          const span = document.createElement("span");
          span.textContent = state.char;
          span.classList.toggle("char-typed", state.typed);
          span.classList.toggle("char-mistyped", state.mistyped && !state.typed);
          return span;
        })
      );
      byId("progressBar", HTMLProgressElement).value = round.progress;
      byId("divScoreVal").textContent = String(round.score);
      this.typedText = round.chars.slice(0, round.progress).map((state) => state.char).join("");
      this.syncInput();
    }
    syncInput() {
      const input = byId("primerText", HTMLInputElement);
      if (input.value !== this.typedText) {
        input.value = this.typedText;
      }
    }
    moveHero(hero) {
      if (this.look) {
        this.placeSprite(byId("spriteBoy", HTMLImageElement), this.look.heroSprites, hero);
      }
    }
    moveEnemy(enemy) {
      if (this.look) {
        this.placeSprite(byId("spriteEnemy", HTMLImageElement), this.look.enemySprites, enemy);
      }
    }
    hide() {
      this.setStageVisible(false);
      this.showMenuBackground();
    }
    showMenuBackground() {
      this.setBackground(MENU_BACKGROUND);
    }
    placeSprite(sprite, folder, actor) {
      sprite.src = spriteUrl(folder, actor.frame);
      sprite.style.left = `${actor.position}px`;
    }
    setBackground(background) {
      const url = typeof background === "string" ? imageUrl(background) : svgUrl(background());
      document.body.style.backgroundImage = `url("${url}")`;
    }
    setStageVisible(visible) {
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
  };

  // main/src/ts/viewmanager/handlers.ts
  function bindHandlers(actions) {
    const clickActions = {
      start: () => {
        actions.start();
      },
      "choose-level": () => {
        actions.chooseLevel();
      },
      "mock-level": () => {
        actions.mockLevel();
      },
      "menu-back": () => {
        actions.menuBack();
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
      }
    };
    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-action]");
      const action = target?.dataset.action;
      if (action) {
        clickActions[action]?.();
      }
    });
    document.addEventListener("mouseover", (event) => {
      const target = event.target.closest("[data-hover-sound]");
      if (target && !target.contains(event.relatedTarget)) {
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
      const value = event.target.value;
      if (isHeroId(value)) {
        actions.setHero(value);
      }
    });
  }
  function onValue(id, type, handler) {
    const element = byId(id, HTMLElement);
    element.addEventListener(type, () => {
      handler(element.value);
    });
  }

  // main/src/ts/viewmanager/layout.ts
  var STAGE_WIDTH = 1250;
  var STAGE_HEIGHT = 750;
  var STAGE_GROUND_Y = 688;
  var STAGE_TOP_SPACE = 30;
  var BG_WIDTH = 1500;
  var BG_HEIGHT = 750;
  var BG_GROUND_HEIGHT = BG_HEIGHT - 688;
  var POPUP_GAP = 16;
  var Layout = class {
    constructor() {
      __publicField(this, "resizeListeners", /* @__PURE__ */ new Set());
      __publicField(this, "lastViewportWidth", 0);
      __publicField(this, "stageScale", 1);
    }
    init() {
      const onResize = () => {
        this.fitStage();
        this.resizeListeners.forEach((listener) => {
          listener();
        });
      };
      window.addEventListener("resize", onResize);
      window.addEventListener("orientationchange", onResize);
      window.visualViewport?.addEventListener("resize", () => {
        this.fitStage();
      });
      window.visualViewport?.addEventListener("scroll", () => {
        this.fitStage();
      });
      onResize();
    }
    onResize(listener) {
      this.resizeListeners.add(listener);
    }
    fitPopup(overlay) {
      if (overlay.style.display !== "block") {
        return;
      }
      const box = overlay.firstElementChild;
      overlay.style.zoom = "1";
      const widthScale = Math.min(1, (window.innerWidth - 2 * POPUP_GAP) / box.offsetWidth);
      const heightScale = (window.innerHeight - 2 * POPUP_GAP) / box.offsetHeight;
      overlay.style.zoom = String(Math.max(Math.min(widthScale, heightScale), widthScale / 2));
    }
    fitStage() {
      const viewport = window.visualViewport;
      const width = window.innerWidth;
      const height = viewport ? viewport.height : window.innerHeight;
      const viewTop = viewport ? viewport.offsetTop : 0;
      const typing = document.activeElement === byId("primerText");
      if (!typing || width !== this.lastViewportWidth) {
        this.lastViewportWidth = width;
        this.stageScale = height > width ? Math.min(1, width / STAGE_WIDTH) : Math.min(1, width / STAGE_WIDTH, height / STAGE_HEIGHT);
      }
      const scale = this.stageScale;
      const bgScale = Math.max(scale, width / BG_WIDTH);
      const body = document.body;
      body.style.backgroundSize = `${BG_WIDTH * bgScale}px ${BG_HEIGHT * bgScale}px`;
      body.style.backgroundPosition = `center ${viewTop + height - BG_HEIGHT * bgScale}px`;
      const groundTop = viewTop + height - BG_GROUND_HEIGHT * bgScale;
      const stageTop = Math.max(
        viewTop - STAGE_TOP_SPACE * scale,
        groundTop - STAGE_GROUND_Y * scale
      );
      const stage = byId("wrapper");
      stage.style.left = `${(width - STAGE_WIDTH * scale) / 2}px`;
      stage.style.top = `${stageTop}px`;
      stage.style.transform = `scale(${scale})`;
    }
  };

  // main/src/ts/viewmanager/menuView.ts
  var MenuView = class {
    renderSettings(settings) {
      const difficulty = DIFFICULTIES[settings.difficulty];
      const difficultySelect = byId("gameDiff", HTMLSelectElement);
      difficultySelect.value = difficulty.id;
      difficultySelect.dataset.difficulty = difficulty.id;
      byId("optionValueSpeed").textContent = difficulty.typingSpeed;
      byId("optionValueError").textContent = difficulty.errorImpact;
      byId("optionValueTime").textContent = difficulty.totalTime;
      const hero = document.querySelector(
        `input[name="heroValue"][value="${settings.hero}"]`
      );
      if (hero) {
        hero.checked = true;
      }
      const musicButton = byId("mybtnBg");
      musicButton.classList.toggle("on", settings.menuMusic);
      musicButton.classList.toggle("off", !settings.menuMusic);
      byId("volume_range", HTMLInputElement).value = String(
        Math.round(settings.menuMusicVolume * 100)
      );
      byId("gameAudio_range", HTMLInputElement).value = String(
        Math.round(settings.gameMusicVolume * 100)
      );
      this.renderToggle("musicInGameOn", "musicInGameOff", settings.gameMusic);
      this.renderToggle("VolumeBtOn", "VolumeBtOff", settings.menuSounds);
      this.renderToggle("VolumeDogOn", "VolumeDogOff", settings.enemySounds);
    }
    showMenuStep(step) {
      byId("boyMenu").dataset.step = step;
    }
    renderStats(stats) {
      const values = {
        summaryGS: String(stats.attempts),
        winnerGS: String(stats.wins),
        loserGS: String(stats.losses),
        nonerGS: String(stats.aborted),
        summaryScore: String(stats.totalScore),
        maxScoreVal: String(stats.maxScore),
        minScoreVal: String(stats.minScore),
        allTimeVal: stats.totalTimeSec.toFixed(2),
        maxTimeVal: stats.maxTimeSec.toFixed(2),
        minTimeVal: stats.minTimeSec.toFixed(2)
      };
      Object.entries(values).forEach(([id, value]) => byId(id).textContent = value);
    }
    renderToggle(onId, offId, enabled) {
      byId(onId).classList.toggle("selected", enabled);
      byId(offId).classList.toggle("selected", !enabled);
    }
  };

  // main/src/ts/viewmanager/screens.ts
  var POPUPS = {
    soundUnlock: "parent_soundUnlock",
    mainMenu: "parent_popup",
    volume: "parent_miscGame",
    settings: "parent_option",
    help: "parent_help",
    levelIntro: "parent_level1Popup",
    gameOver: "parent_gameOverPopup",
    winner: "parent_winnerPopup",
    stats: "parent_statsPopup"
  };
  var ALL_POPUPS = Object.keys(POPUPS);
  var Screens = class {
    constructor(layout) {
      __publicField(this, "layout", layout);
      layout.onResize(() => {
        ALL_POPUPS.forEach((popup) => {
          layout.fitPopup(this.element(popup));
        });
      });
    }
    show(popup) {
      const element = this.element(popup);
      element.style.display = "block";
      this.layout.fitPopup(element);
    }
    hide(...popups) {
      popups.forEach((popup) => this.element(popup).style.display = "none");
    }
    hideGamePopups() {
      this.hide(...ALL_POPUPS.filter((popup) => popup !== "soundUnlock"));
    }
    element(popup) {
      return byId(POPUPS[popup]);
    }
  };

  // main/src/ts/viewmanager/scrollbar/scrollbars.ts
  var MIN_THUMB = 24;
  function attachScrollbar(id) {
    const view = byId(id);
    const track = document.createElement("div");
    const thumb = document.createElement("div");
    track.className = "scroll-track";
    thumb.className = "scroll-thumb";
    track.append(thumb);
    view.classList.add("custom-scroll");
    view.after(track);
    const getMetrics = () => {
      const thumbHeight = Math.max(MIN_THUMB, view.clientHeight / view.scrollHeight * view.clientHeight);
      return {
        thumbHeight,
        travel: view.clientHeight - thumbHeight,
        range: view.scrollHeight - view.clientHeight
      };
    };
    const update = () => {
      const { thumbHeight, travel, range } = getMetrics();
      track.hidden = range <= 0;
      track.style.top = `${view.offsetTop}px`;
      track.style.left = `${view.offsetLeft + view.offsetWidth}px`;
      track.style.height = `${view.clientHeight}px`;
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${range > 0 ? view.scrollTop / range * travel : 0}px)`;
    };
    thumb.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      thumb.setPointerCapture(event.pointerId);
      thumb.classList.add("dragging");
      const startY = event.clientY;
      const startTop = view.scrollTop;
      const move = (moveEvent) => {
        const { travel, range } = getMetrics();
        view.scrollTop = startTop + (moveEvent.clientY - startY) * range / travel;
      };
      const end = () => {
        thumb.classList.remove("dragging");
        thumb.removeEventListener("pointermove", move);
        thumb.removeEventListener("pointerup", end);
        thumb.removeEventListener("pointercancel", end);
      };
      thumb.addEventListener("pointermove", move);
      thumb.addEventListener("pointerup", end);
      thumb.addEventListener("pointercancel", end);
    });
    track.addEventListener("pointerdown", (event) => {
      if (event.target !== track) {
        return;
      }
      const { thumbHeight, travel, range } = getMetrics();
      const offset = event.clientY - track.getBoundingClientRect().top - thumbHeight / 2;
      view.scrollTo({ top: Math.min(Math.max(offset, 0), travel) / travel * range, behavior: "smooth" });
    });
    view.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(view);
    Array.from(view.children).forEach((child) => {
      observer.observe(child);
    });
    update();
  }

  // main/src/ts/levels/storm.ts
  function pick(random, { min, max }) {
    return Math.round(min + random() * (max - min));
  }
  function planStorm(weather, random = Math.random) {
    const calmMs = pick(random, weather.calmMs);
    const stormMs = pick(random, weather.stormMs);
    const drops = pick(random, weather.drops);
    const windDeg = pick(random, weather.windDeg);
    const strikes = pick(random, weather.lightningStrikes);
    const lightningAtMs = Array.from(
      { length: strikes },
      () => pick(random, { min: 0, max: stormMs })
    ).sort((a, b) => a - b);
    return { calmMs, stormMs, drops, windDeg, lightningAtMs };
  }

  // main/src/ts/viewmanager/weatherView.ts
  var FADE_MS = 2e3;
  var WeatherView = class {
    constructor(plan = planStorm) {
      __publicField(this, "plan", plan);
      __publicField(this, "sky", byId("weather"));
      __publicField(this, "rain", byId("weatherRain"));
      __publicField(this, "flash", byId("weatherFlash"));
      __publicField(this, "snow", byId("weatherSnow"));
      __publicField(this, "weather", null);
      __publicField(this, "snowfall", null);
      __publicField(this, "timers", []);
    }
    start(weather, snowfall) {
      if (this.sky.classList.contains("sunny") && (weather ?? null) === this.weather && (snowfall ?? null) === this.snowfall) {
        return;
      }
      this.stop();
      this.sky.classList.add("sunny");
      if (snowfall) {
        this.snowfall = snowfall;
        this.startSnow(snowfall);
      }
      if (!weather) {
        return;
      }
      this.weather = weather;
      this.storm(weather, this.plan(weather), true);
    }
    stop() {
      this.weather = null;
      this.snowfall = null;
      this.timers.forEach((timer) => {
        clearTimeout(timer);
      });
      this.timers = [];
      this.sky.classList.remove("sunny", "storm", "snowy");
      this.flash.classList.remove("strike");
      this.rain.replaceChildren();
      this.snow.replaceChildren();
    }
    startSnow(snowfall) {
      this.snow.replaceChildren(
        ...Array.from({ length: snowfall.flakes }, () => {
          const flake = document.createElement("i");
          const size = 2 + Math.random() * 5;
          const fallMs = Math.round(16e3 - size * 1500 + Math.random() * 3e3);
          const swayMs = Math.round(2e3 + Math.random() * 2500);
          flake.style.left = `${(Math.random() * 110 - 5).toFixed(2)}%`;
          flake.style.width = `${size.toFixed(1)}px`;
          flake.style.height = `${size.toFixed(1)}px`;
          flake.style.opacity = (0.55 + Math.random() * 0.4).toFixed(2);
          flake.style.setProperty("--drift", `${Math.round(Math.random() * 140 - 40)}px`);
          flake.style.animationDuration = `${String(fallMs)}ms, ${String(swayMs)}ms`;
          flake.style.animationDelay = `-${String(Math.round(Math.random() * fallMs))}ms, -${String(Math.round(Math.random() * swayMs))}ms`;
          return flake;
        })
      );
      this.sky.classList.add("snowy");
    }
    cycle(weather) {
      const storm = this.plan(weather);
      this.later(storm.calmMs, () => {
        this.storm(weather, storm, false);
      });
    }
    storm(weather, storm, instant) {
      this.beginStorm(storm, instant);
      storm.lightningAtMs.forEach((at) => {
        this.later(at, () => {
          this.strike();
        });
      });
      this.later(storm.stormMs, () => {
        this.sky.classList.remove("storm");
        this.later(FADE_MS, () => {
          this.rain.replaceChildren();
          this.cycle(weather);
        });
      });
    }
    beginStorm(storm, instant) {
      this.rain.style.transform = `rotate(${storm.windDeg}deg)`;
      this.rain.replaceChildren(
        ...Array.from({ length: storm.drops }, () => {
          const drop = document.createElement("i");
          drop.style.left = `${(Math.random() * 130 - 15).toFixed(2)}%`;
          drop.style.height = `${Math.round(40 + Math.random() * 50)}px`;
          drop.style.opacity = (0.25 + Math.random() * 0.45).toFixed(2);
          drop.style.animationDuration = `${Math.round(450 + Math.random() * 400)}ms`;
          drop.style.animationDelay = `-${Math.round(Math.random() * 1e3)}ms`;
          return drop;
        })
      );
      this.sky.classList.toggle("instant", instant);
      this.sky.classList.add("storm");
      if (instant) {
        this.sky.getBoundingClientRect();
        this.sky.classList.remove("instant");
      }
    }
    strike() {
      this.flash.classList.remove("strike");
      this.flash.getBoundingClientRect();
      this.flash.classList.add("strike");
    }
    later(ms, task) {
      this.timers.push(setTimeout(task, ms));
    }
  };

  // main/src/ts/app.ts
  function main() {
    const layout = new Layout();
    const screens = new Screens(layout);
    const audio = new AudioManager({
      onAutoplayBlocked: () => {
        screens.show("soundUnlock");
      }
    });
    const controller = new GameController({
      game: new Game(),
      stats: new SessionStats(),
      settings: new Settings(),
      mainMenu: new MainMenu(),
      level: FIRST_LEVEL,
      mockLevel: SNOW_LEVEL,
      audio,
      screens,
      gameView: new GameView(new Birds(), new WeatherView()),
      menuView: new MenuView()
    });
    bindHandlers(controller);
    watchPageActivity((active) => {
      audio.setSuspended(!active);
    });
    ["help_info", "miscGame_info", "option_info"].forEach(attachScrollbar);
    layout.init();
    controller.init();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
