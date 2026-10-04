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
  function extreme(values, pick) {
    return values.length ? pick(...values) : 0;
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
    enemy: DOG
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
    constructor(level) {
      __publicField(this, "level", level);
      __publicField(this, "played", false);
    }
    get showsLevelIntro() {
      return !this.played;
    }
    get startLabel() {
      return this.played ? `"${this.level.title}"` : "Start";
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
  var DEFAULT_DIFFICULTY = "hard";
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

  // main/src/ts/viewmanager/controller.ts
  var GameController = class {
    constructor(deps) {
      __publicField(this, "deps", deps);
      const { game, settings } = deps;
      game.on("roundStarted", (round) => {
        const { level } = this.deps;
        deps.gameView.showRound(round, {
          heroSprites: HEROES[this.settings.hero].spriteFolder,
          enemySprites: level.enemy.spriteFolder,
          background: level.background
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
      const { screens, menuView, gameView, mainMenu, audio } = this.deps;
      this.applySettings(this.settings);
      menuView.renderStartLabel(mainMenu.startLabel);
      gameView.showMenuBackground();
      screens.show("mainMenu");
      if (this.settings.menuMusic) {
        audio.playMusic("menu");
      }
    }
    start() {
      if (this.deps.mainMenu.showsLevelIntro) {
        this.switchPopup("mainMenu", "levelIntro");
      } else {
        this.click();
        this.beginRound();
      }
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
      this.deps.screens.hide("volume", "settings", "help");
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
      const { screens, audio, stats, game, level } = this.deps;
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

  // main/src/ts/viewmanager/dom.ts
  function byId(id, type = HTMLElement) {
    const element = document.getElementById(id);
    if (!(element instanceof type)) {
      throw new Error(`Missing element #${id} of type ${type.name}`);
    }
    return element;
  }

  // main/src/ts/viewmanager/gameView.ts
  var GameView = class {
    constructor() {
      __publicField(this, "look", null);
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
    }
    renderTyping(round) {
      const text = byId("textField");
      text.replaceChildren(
        ...round.chars.map((state) => {
          const span = document.createElement("span");
          span.textContent = state.char;
          span.classList.toggle("char-typed", state.typed);
          span.classList.toggle("char-mistyped", state.mistyped);
          return span;
        })
      );
      byId("progressBar", HTMLProgressElement).value = round.progress;
      byId("divScoreVal").textContent = String(round.score);
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
    setBackground(file) {
      document.body.style.backgroundImage = `url('${imageUrl(file)}')`;
    }
    setStageVisible(visible) {
      const display = visible ? "block" : "none";
      byId("wrapper_div").style.display = display;
      byId("GameScoreDiv").style.display = display;
      byId("generalMenuDiv").style.display = display;
    }
  };

  // main/src/ts/viewmanager/handlers.ts
  function bindHandlers(actions) {
    const clickActions = {
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
      byId("gameDiff", HTMLSelectElement).value = difficulty.id;
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
    renderStartLabel(label) {
      byId("startBtn").textContent = label;
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
      mainMenu: new MainMenu(FIRST_LEVEL),
      level: FIRST_LEVEL,
      audio,
      screens,
      gameView: new GameView(),
      menuView: new MenuView()
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
})();
