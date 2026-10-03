type ClipSound = HTMLAudioElement & { playclip: () => void };

declare global {
  interface Window {
    levelValue: number;
    summaryStarts: number;
    t: number;
    getNewTime: Date;
    showSpritesEnemy: number | undefined;
    mouseoversound: ClipSound | undefined;
    clicksound: ClipSound | undefined;
  }
}

const ASSET_PATH = "../";

const STAGE_WIDTH = 1250;
const STAGE_HEIGHT = 750;
const STAGE_GROUND_Y = 688;
const STAGE_TOP_SPACE = 30;
const BG_WIDTH = 1500;
const BG_HEIGHT = 750;
const BG_GROUND_HEIGHT = BG_HEIGHT - 688;
const POPUP_IDS = [
  "parent_soundUnlock",
  "parent_popup",
  "parent_miscGame",
  "parent_option",
  "parent_help",
  "parent_level1Popup",
  "parent_gameOverPopup",
  "parent_winnerPopup",
  "parent_statsPopup",
];

const EXAMPLE_TEXTS = [
  "hgfj ysdsk oery sdgsw wgqsy ushdsz dsjsw o",
  "ifgdu nvcq zasy mglgp fyeg cgdsgh sqwff kb",
  "bvjmgfjfie tdsrwfdfg dssrqifkc xghstwr erq",
  "os jun pre mid gui ris sin qua liv cal abs",
  "fdofdkl fdhjreyux fdyudywer fuidfuid fpi f",
  "mcrsft ppl ggl andrd s wndws phn lg smsng",
];

const AUDIO_TYPES: Record<string, string> = {
  mp3: "audio/mpeg",
  mp4: "audio/mp4",
  ogg: "audio/ogg",
  wav: "audio/wav",
};

let exampleTexto = "";
let masG: string[] = [];
let newPBValue = 0;
let k = 0;
let finalTextPoint = 0;
let spriteUrlCounter = 1;
let spriteEnemyUrlCounter = 1;
let curPos = 253;
let curPosEnemy = 40;
let gameOverPos = 0;
let enemyStep = 3;
let enemySpriteDelay = 250;
let gotScoreVal = 8;
let newScoreVal = 0;
let dik = "";
let VolumeDog = 2;
let bgMusicValue = 0;
let GMvalue = 2;
let arrayCurrentTimeVal: number[] = [];
let arrayAllScoreVal: number[] = [];
let loseVal = 0;
let winsVal = 0;
let allTimeVal = 0;
let summaryScore = 0;
let maxScoreVal = 0;
let minScoreVal = 0;
let maxTimeVal = 0;
let minTimeVal = 0;

let lastViewportWidth = 0;
let stageScale = 1;
const lastDisplay = new WeakMap<HTMLElement, string>();

function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function audio(id: string): HTMLAudioElement {
  return byId<HTMLAudioElement>(id);
}

function exampleText(): void {
  hideBGfont();
  getNewExampletext();
  byId("textField").innerHTML = exampleTexto;
  masG = exampleTexto.split("");
  newPBValue = k = 0;
  byId<HTMLProgressElement>("progressBar").value = 0;
  byId("progressBar").style.backgroundColor = "#fff";
  spriteUrlCounter = 1;
  diffCheker();
  curPos = 253;
  switchGmeOverPoint();
  popupOpen();
  hideHelp();
  runHeroValue();
  playBgMusic();
  MenuButtonOn();
  GMparamOn();
  VolumeDog = 2;
  VolumeDogOn();
  newScoreVal = 0;
  window.levelValue = 1;
  window.t = window.summaryStarts = 0;
  window.getNewTime = new Date();
  arrayCurrentTimeVal = [];
  loseVal = winsVal = allTimeVal = 0;
  arrayAllScoreVal = [];
  maxScoreVal = minScoreVal = summaryScore = 0;
}

function prevParamsDelete(): void {
  newPBValue = k = 0;
  byId<HTMLProgressElement>("progressBar").value = 0;
  spriteEnemyUrlCounter = spriteUrlCounter = 1;
  curPos = 253;
  switchGmeOverPoint();
  minScoreVal = arrayAllScoreVal[window.t] = newScoreVal;
  newScoreVal = 0;
  byId("divScoreVal").innerHTML = String(newScoreVal);
  byId("textField").style.color = "#ffffff";
  byId("spriteBoy").style.left = curPos + "px";
  masG = exampleTexto.split("");
  for (let b = 0; b < finalTextPoint; b++) {
    masG[b] = "<font color='#ffffff'>" + masG[b] + "</font>";
    byId("textField").innerHTML = masG.join("");
  }
  getNewExampletext();
  byId("textField").innerHTML = exampleTexto;
  masG = exampleTexto.split("");
  byId("startBtn").innerHTML = '"Abandoned area"';
}

function getNewExampletext(): void {
  exampleTexto = EXAMPLE_TEXTS[Math.round(5 * Math.random())];
  finalTextPoint = exampleTexto.length;
  byId<HTMLProgressElement>("progressBar").max = finalTextPoint;
  byId<HTMLInputElement>("primerText").maxLength = finalTextPoint;
}

function primer(): void {
  if (k < finalTextPoint) {
    const textValueC = byId<HTMLInputElement>("primerText").value;
    if (textValueC[k] !== exampleTexto[k]) {
      masG[k] = "<font color='#EF2700'>" + masG[k] + "</font>";
      newScoreVal -= 2;
    } else {
      masG[k] = "<font color='#00D155'>" + masG[k] + "</font>";
      newPBValue += 1;
      byId<HTMLProgressElement>("progressBar").value = newPBValue;
      k++;
      spriteUrlCounter += 1;
      changeSpriteBoy();
      scrollSpriteBoy();
      newScoreVal += gotScoreVal;
    }
    scoreThisVal();
    byId("textField").innerHTML = masG.join("");
    if (newPBValue === finalTextPoint) {
      showWinnerL1popup();
      clearInterval(window.showSpritesEnemy);
    }
  }
}

function changeSpriteBoy(): void {
  const spriteUrlThis = spriteUrlCounter % 4;
  byId<HTMLImageElement>("spriteBoy").src =
    ASSET_PATH + "rb" + dik + "_sprites/rb" + spriteUrlThis + "_mini.png";
}

function scrollSpriteBoy(): void {
  const scrolling = byId("spriteBoy");
  curPos = parseInt(scrolling.style.left) + 3;
  scrolling.style.left = curPos + "px";
  switchGmeOverPoint();
}

function changeSpriteEnemy(): void {
  const spriteEnemyUrlThis = spriteEnemyUrlCounter % 4;
  const scrollingEnemy = byId<HTMLImageElement>("spriteEnemy");
  scrollingEnemy.src = ASSET_PATH + "rb6_sprites/rb" + spriteEnemyUrlThis + "_mini.png";
  curPosEnemy = parseInt(scrollingEnemy.style.left) + enemyStep;
  scrollingEnemy.style.left = curPosEnemy + "px";
}

function movingEnemy(): void {
  if (spriteEnemyUrlCounter < 300) {
    changeSpriteEnemy();
    spriteEnemyUrlCounter += 1;
  }
  if (curPosEnemy === gameOverPos) {
    hideStuff("wrapper_div");
    audio("gameAudio").pause();
    hideScoreVal();
    hideGeneralMenuDiv();
    hideBGfont();
    window.levelValue = 0;
    prevParamsDelete();
    minMaxTimeVal();
    loseVal += 1;
    showGOpopup();
    clearInterval(window.showSpritesEnemy);
  }
  if (VolumeDog === 2 && [20, 22, 80, 82, 200, 202].includes(spriteEnemyUrlCounter)) {
    const enemyAudio = audio("enemyAudio");
    enemyAudio.play();
    enemyAudio.currentTime = 0;
  }
}

function runMovingEnemy(): void {
  spriteEnemyUrlCounter = 1;
  changeSpriteEnemy();
  curPosEnemy = 40;
  byId("spriteEnemy").style.left = curPosEnemy + "px";
  window.showSpritesEnemy = setInterval(movingEnemy, enemySpriteDelay);
}

function VolumeDogOn(): void {
  byId("VolumeDogOn").style.color = "#008800";
  byId("VolumeDogOff").style.color = "#ffffff";
  VolumeDog = 2;
}

function VolumeDogOff(): void {
  byId("VolumeDogOn").style.color = "#ffffff";
  byId("VolumeDogOff").style.color = "#008800";
  VolumeDog = 0;
}

function popupOpen(): void {
  setTimeout(() => {
    byId("parent_popup").style.display = "block";
  }, 5);
  byId("wrapper_div").style.display = "none";
}

function showStuff(id: string): void {
  byId(id).style.display = "block";
}

function hideStuff(id: string): void {
  byId(id).style.display = "none";
}

function showHelp(): void {
  byId("parent_help").style.display = "block";
  byId("parent_popup").style.display = "none";
}

function showOption(): void {
  byId("parent_option").style.display = "block";
  byId("parent_popup").style.display = "none";
}

function showMiscGame(): void {
  byId("parent_miscGame").style.display = "block";
  byId("parent_popup").style.display = "none";
}

function showScoreVal(): void {
  byId("GameScoreDiv").style.display = "block";
}

function hideScoreVal(): void {
  byId("GameScoreDiv").style.display = "none";
}

function hideHelp(): void {
  byId("parent_help").style.display = "none";
  byId("parent_option").style.display = "none";
  byId("parent_miscGame").style.display = "none";
  byId("parent_popup").style.display = "block";
}

function showGeneralMenuDiv(): void {
  byId("generalMenuDiv").style.display = "block";
  byId("parent_popup").style.display = "none";
}

function hideGeneralMenuDiv(): void {
  byId("generalMenuDiv").style.display = "none";
}

function showGOpopup(): void {
  byId("parent_gameOverPopup").style.display = "block";
  const gameOverAudio = audio("gameOverAudio");
  gameOverAudio.play();
  gameOverAudio.currentTime = 0;
}

function hideGOpopup(): void {
  byId("parent_gameOverPopup").style.display = "none";
}

function showWinnerL1popup(): void {
  hideStuff("wrapper_div");
  audio("gameAudio").pause();
  hideScoreVal();
  hideGeneralMenuDiv();
  hideBGfont();
  window.levelValue = 0;
  prevParamsDelete();
  minMaxTimeVal();
  winsVal += 1;
  byId("parent_winnerPopup").style.display = "block";
  const winnerAudio = audio("winnerAudio");
  winnerAudio.play();
  winnerAudio.currentTime = 0;
}

function hideWinnerL1popup(): void {
  byId("parent_winnerPopup").style.display = "none";
}

function showStatsPopup(): void {
  byId("parent_statsPopup").style.display = "block";
}

function hideStatsPopup(): void {
  byId("parent_statsPopup").style.display = "none";
}

function showLevelChecker(): void {
  if (window.levelValue === 1) {
    showLevel1popup();
    window.summaryStarts += 1;
    window.getNewTime = new Date();
  }
  if (window.levelValue === 0) {
    byId("parent_popup").style.display = "none";
    showStuff("wrapper_div");
    checkHeroValue();
    runHeroValue();
    audio("myaudio").pause();
    checkGMvalue();
    runMovingEnemy();
    showScoreVal();
    hideLevel1popup();
    window.clicksound?.playclip();
    showGeneralMenuDiv();
    showBGfont();
    window.summaryStarts += 1;
    window.t += 1;
    window.getNewTime = new Date();
  }
}

function showLevel1popup(): void {
  byId("parent_level1Popup").style.display = "block";
  byId("parent_popup").style.display = "none";
}

function hideLevel1popup(): void {
  byId("parent_level1Popup").style.display = "none";
}

function showBGfont(): void {
  setBackground("bg_font_mini.jpg");
}

function hideBGfont(): void {
  setBackground("bg_font_mini2.jpg");
}

function setBackground(file: string): void {
  document.body.style.backgroundImage = "url('" + ASSET_PATH + file + "')";
}

function MenuButtonOn(): void {
  byId("VolumeBtOn").style.color = "#008800";
  byId("VolumeBtOff").style.color = "#ffffff";
  soundHoverMenu();
}

function MenuButtonOff(): void {
  byId("VolumeBtOn").style.color = "#ffffff";
  byId("VolumeBtOff").style.color = "#008800";
}

function createClipSound(...sources: string[]): ClipSound {
  const sound = document.createElement("audio") as ClipSound;
  for (const src of sources) {
    const source = document.createElement("source");
    source.setAttribute("src", src);
    const extension = src.match(/\.(\w+)$/i);
    if (extension) {
      source.setAttribute("type", AUDIO_TYPES[extension[1]]);
    }
    sound.appendChild(source);
  }
  sound.load();
  sound.playclip = () => {
    sound.pause();
    sound.currentTime = 0;
    sound.play();
  };
  return sound;
}

function soundHoverMenu(): void {
  window.mouseoversound = createClipSound(ASSET_PATH + "../sounds/button19.wav");
  window.clicksound = createClipSound(ASSET_PATH + "../sounds/click.ogg");
}

function soundHoverMenu1(): void {
  window.mouseoversound = createClipSound(ASSET_PATH + "../sounds/soundsOff.wav");
  window.clicksound = createClipSound(ASSET_PATH + "../sounds/soundsOff.wav");
}

function playBgMusic(): void {
  const buttona = byId("mybtnBg");
  const myaudio = audio("myaudio");
  if (myaudio.paused) {
    myaudio.volume = 0.65;
    myaudio.play().catch(showSoundUnlock);
    buttona.style.backgroundImage = "url('" + ASSET_PATH + "images/bgMusicOn.png')";
    buttona.style.color = "White";
    bgMusicValue = 2;
  } else {
    myaudio.pause();
    buttona.style.backgroundImage = "url('" + ASSET_PATH + "images/bgMusicOff.png')";
    buttona.style.color = "Black";
    bgMusicValue = 0;
  }
}

function checkBgMusic(): void {
  const myaudio = audio("myaudio");
  if (bgMusicValue === 2) {
    myaudio.currentTime = 0;
    myaudio.play();
  }
  if (bgMusicValue === 0) {
    myaudio.pause();
  }
}

function playGameMusic(): void {
  const gameAudio = audio("myaudio");
  if (gameAudio.paused) {
    gameAudio.play();
  } else {
    gameAudio.pause();
  }
}

function checkGMvalue(): void {
  const gameAudio = audio("gameAudio");
  if (GMvalue === 2) {
    gameAudio.play();
  }
  if (GMvalue === 0) {
    gameAudio.pause();
  }
}

function GMparamOn(): void {
  byId("musicInGameOn").style.color = "#008800";
  byId("musicInGameOff").style.color = "#ffffff";
  GMvalue = 2;
}

function GMparamOff(): void {
  byId("musicInGameOn").style.color = "#ffffff";
  byId("musicInGameOff").style.color = "#008800";
  GMvalue = 0;
}

function diffCheker(): void {
  let valueError = "";
  let valueTime = "";
  let valueSpeed = "";
  switch (byId<HTMLSelectElement>("gameDiff").value) {
    case "Easy":
      valueError = "-";
      valueTime = "Max";
      valueSpeed = "Low";
      gotScoreVal = 4;
      easyDiffVal();
      break;
    case "Medium":
      valueError = "5%";
      valueSpeed = valueTime = "Normal";
      gotScoreVal = 5;
      medDiffVal();
      break;
    case "Hard":
      valueError = "15%";
      valueTime = "Low";
      valueSpeed = "Hard";
      gotScoreVal = 8;
      hardDiffVal();
  }
  byId("optionValueError").innerHTML = valueError;
  byId("optionValueTime").innerHTML = valueTime;
  byId("optionValueSpeed").innerHTML = valueSpeed;
}

function easyDiffVal(): void {
  enemySpriteDelay = 250;
  enemyStep = 1;
}

function medDiffVal(): void {
  enemySpriteDelay = 250;
  enemyStep = 2;
}

function hardDiffVal(): void {
  enemySpriteDelay = 250;
  enemyStep = 3;
}

function switchGmeOverPoint(): void {
  switch (enemyStep) {
    case 1:
      gameOverPos = curPos - 90;
      break;
    case 2:
      gameOverPos = curPos - 89;
      break;
    case 3:
      gameOverPos = curPos - 90;
  }
}

function checkHeroValue(): void {
  const heroes = document.getElementsByName("heroValue") as NodeListOf<HTMLInputElement>;
  for (const hero of heroes) {
    if (hero.checked) {
      dik = hero.value;
      break;
    }
  }
}

function runHeroValue(): void {
  checkHeroValue();
  changeSpriteBoy();
}

function scoreThisVal(): void {
  byId("divScoreVal").innerHTML = String(newScoreVal);
}

function roundTimeChecker(): void {
  for (let tAll = 0; tAll < window.summaryStarts; tAll++) {
    allTimeVal += arrayCurrentTimeVal[tAll];
    summaryScore += arrayAllScoreVal[tAll];
  }
  const noneWLval = window.summaryStarts - winsVal - loseVal;
  byId("summaryGS").innerHTML = String(window.summaryStarts);
  byId("winnerGS").innerHTML = String(winsVal);
  byId("loserGS").innerHTML = String(loseVal);
  byId("nonerGS").innerHTML = String(noneWLval);
  byId("allTimeVal").innerHTML = allTimeVal.toFixed(2);
  byId("maxTimeVal").innerHTML = maxTimeVal.toFixed(2);
  byId("minTimeVal").innerHTML = minTimeVal.toFixed(2);
  byId("maxScoreVal").innerHTML = String(maxScoreVal);
  byId("minScoreVal").innerHTML = String(minScoreVal);
  byId("summaryScore").innerHTML = String(summaryScore);
}

function minMaxTimeVal(): void {
  const t = window.t;
  const currentTimeVal = (Date.now() - window.getNewTime.getTime()) / 1e3;
  arrayCurrentTimeVal[t] = currentTimeVal;
  minTimeVal = arrayCurrentTimeVal[t];
  maxTimeVal = arrayCurrentTimeVal[t];
  if (window.summaryStarts === 1) {
    maxTimeVal = minTimeVal;
  }
  for (let tRes = 0; tRes < window.summaryStarts; tRes++) {
    if (arrayCurrentTimeVal[tRes] < minTimeVal) {
      minTimeVal = arrayCurrentTimeVal[tRes];
    }
    if (arrayCurrentTimeVal[tRes] > maxTimeVal) {
      maxTimeVal = arrayCurrentTimeVal[tRes];
    }
  }
  for (let tRes = 0; tRes < window.summaryStarts; tRes++) {
    if (arrayAllScoreVal[tRes] < minScoreVal) {
      minScoreVal = arrayAllScoreVal[tRes];
    }
    if (arrayAllScoreVal[tRes] > maxScoreVal) {
      maxScoreVal = arrayAllScoreVal[tRes];
    }
  }
}

function fitStage(): void {
  const vv = window.visualViewport;
  const w = window.innerWidth;
  const h = vv ? vv.height : window.innerHeight;
  const viewTop = vv ? vv.offsetTop : 0;
  const typing = document.activeElement === byId("primerText");
  if (!typing || w !== lastViewportWidth) {
    lastViewportWidth = w;
    stageScale =
      h > w ? Math.min(1, w / STAGE_WIDTH) : Math.min(1, w / STAGE_WIDTH, h / STAGE_HEIGHT);
  }
  const bgScale = Math.max(stageScale, w / BG_WIDTH);
  const bgTop = viewTop + h - BG_HEIGHT * bgScale;
  const body = document.body;
  body.style.backgroundSize = BG_WIDTH * bgScale + "px " + BG_HEIGHT * bgScale + "px";
  body.style.backgroundPosition = "center " + bgTop + "px";

  const groundTop = viewTop + h - BG_GROUND_HEIGHT * bgScale;
  const stageTop = Math.max(
    viewTop - STAGE_TOP_SPACE * stageScale,
    groundTop - STAGE_GROUND_Y * stageScale,
  );
  const wrapper = byId("wrapper");
  wrapper.style.left = (w - STAGE_WIDTH * stageScale) / 2 + "px";
  wrapper.style.top = stageTop + "px";
  wrapper.style.transform = "scale(" + stageScale + ")";
}

function fitPopup(overlay: HTMLElement): void {
  if (overlay.style.display !== "block") {
    return;
  }
  const box = overlay.firstElementChild as HTMLElement;
  overlay.style.zoom = "1";
  const gap = 16;
  const widthScale = Math.min(1, (window.innerWidth - 2 * gap) / box.offsetWidth);
  const scale = Math.max(
    Math.min(widthScale, (window.innerHeight - 2 * gap) / box.offsetHeight),
    widthScale / 2,
  );
  overlay.style.zoom = String(scale);
}

function fitAll(): void {
  fitStage();
  for (const id of POPUP_IDS) {
    fitPopup(byId(id));
  }
}

function initResponsive(): void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const el = mutation.target as HTMLElement;
      if (el.style.display !== lastDisplay.get(el)) {
        lastDisplay.set(el, el.style.display);
        fitPopup(el);
      }
    }
  });
  for (const id of POPUP_IDS) {
    const overlay = byId(id);
    lastDisplay.set(overlay, overlay.style.display);
    observer.observe(overlay, { attributes: true, attributeFilter: ["style"] });
  }
  window.addEventListener("resize", fitAll);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", fitStage);
    window.visualViewport.addEventListener("scroll", fitStage);
  }
  window.addEventListener("orientationchange", fitAll);
  fitAll();
}

function allSounds(): HTMLAudioElement[] {
  const sounds = [...document.getElementsByTagName("audio")];
  if (window.mouseoversound) sounds.push(window.mouseoversound);
  if (window.clicksound) sounds.push(window.clicksound);
  return sounds;
}

function muteAllSounds(muted: boolean): void {
  for (const sound of allSounds()) {
    sound.muted = muted;
  }
}

function showSoundUnlock(): void {
  byId("parent_soundUnlock").style.display = "block";
}

function unlockSound(): void {
  byId("parent_soundUnlock").style.display = "none";
  const myaudio = audio("myaudio");
  for (const sound of allSounds()) {
    if (sound !== myaudio && sound.paused) {
      primeSound(sound);
    }
  }
  if (bgMusicValue === 2) {
    myaudio.play();
  }
}

function primeSound(sound: HTMLAudioElement): void {
  sound.muted = true;
  sound
    .play()
    .then(() => {
      sound.pause();
      sound.currentTime = 0;
    })
    .catch(() => {})
    .then(() => {
      sound.muted = document.hidden;
    });
}

Object.assign(window, {
  levelValue: 1,
  summaryStarts: 0,
  t: 0,
  getNewTime: new Date(),
  showSpritesEnemy: undefined,
  exampleText,
  prevParamsDelete,
  primer,
  runMovingEnemy,
  VolumeDogOn,
  VolumeDogOff,
  popupOpen,
  showStuff,
  hideStuff,
  showHelp,
  showOption,
  showMiscGame,
  showScoreVal,
  hideScoreVal,
  hideHelp,
  showGeneralMenuDiv,
  hideGeneralMenuDiv,
  hideGOpopup,
  hideWinnerL1popup,
  showStatsPopup,
  hideStatsPopup,
  showLevelChecker,
  hideLevel1popup,
  showBGfont,
  hideBGfont,
  MenuButtonOn,
  MenuButtonOff,
  soundHoverMenu1,
  playBgMusic,
  checkBgMusic,
  playGameMusic,
  checkGMvalue,
  GMparamOn,
  GMparamOff,
  diffCheker,
  switchGmeOverPoint,
  checkHeroValue,
  runHeroValue,
  roundTimeChecker,
  minMaxTimeVal,
  unlockSound,
});

document.addEventListener("DOMContentLoaded", initResponsive);
document.addEventListener("visibilitychange", () => {
  muteAllSounds(document.hidden);
});

export {};
