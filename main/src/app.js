var ASSETS_PATH = "../../assets/";
var MEDIA_PATH = "../../media/";

function exampleText() {
  hideBGfont();
  getNewExampletext();
  document.getElementById("textField").innerHTML = exampleTexto;
  masG = exampleTexto.split("");
  newPBValue = i = k = 0;
  document.getElementById("progressBar").value = 0;
  document.getElementById("progressBar").style.backgroundColor = "#fff";
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
  levelValue = 1;
  t = summaryStarts = 0;
  arrayCurrentTimeVal = [];
  loseVal = noneWLval = winsVal = allTimeVal = 0;
  arrayAllScoreVal = [];
  maxScoreVal = minScoreVal = summaryScore = 0;
}
function prevParamsDelete() {
  newPBValue = i = k = 0;
  document.getElementById("progressBar").value = 0;
  spriteEnemyUrlCounter = spriteUrlCounter = 1;
  curPos = 253;
  switchGmeOverPoint();
  minScoreVal = arrayAllScoreVal[t] = newScoreVal;
  newScoreVal = 0;
  document.getElementById("divScoreVal").innerHTML = newScoreVal;
  document.getElementById("textField").style.color = "#ffffff";
  document.getElementById("spriteBoy").style.left = curPos + "px";
  masG = exampleTexto.split("");
  for (var b = 0; b < finalTextPoint; b++) {
    masG[b] = "<font color='#ffffff'>" + masG[b] + "</font>";
    document.getElementById("textField").innerHTML = masG.join("");
  }
  getNewExampletext();
  document.getElementById("textField").innerHTML = exampleTexto;
  masG = exampleTexto.split("");
  document.getElementById("startBtn").innerHTML = '"Abandoned area"';
}
function getNewExampletext() {
  ExampletextVal = Math.round(5 * Math.random());
  switch (ExampletextVal) {
    case 0:
      exampleTexto = "hgfj ysdsk oery sdgsw wgqsy ushdsz dsjsw o";
      break;
    case 1:
      exampleTexto = "ifgdu nvcq zasy mglgp fyeg cgdsgh sqwff kb";
      break;
    case 2:
      exampleTexto = "bvjmgfjfie tdsrwfdfg dssrqifkc xghstwr erq";
      break;
    case 3:
      exampleTexto = "os jun pre mid gui ris sin qua liv cal abs";
      break;
    case 4:
      exampleTexto = "fdofdkl fdhjreyux fdyudywer fuidfuid fpi f";
      break;
    case 5:
      exampleTexto = "mcrsft ppl ggl andrd s wndws phn lg smsng";
  }
  finalTextPoint = exampleTexto.length;
  document.getElementById("progressBar").max = finalTextPoint;
  document.getElementById("primerText").maxLength = finalTextPoint;
}
function primer() {
  if (k < finalTextPoint) {
    textValueC = document.getElementById("primerText").value;
    if (textValueC[k] != exampleTexto[k]) {
      masG[k] = "<font color='#EF2700'>" + masG[k] + "</font>";
      newScoreVal -= 2;
    } else {
      masG[k] = "<font color='#00D155'>" + masG[k] + "</font>";
      newPBValue += 1;
      document.getElementById("progressBar").value = newPBValue;
      k++;
      spriteUrlCounter += 1;
      changeSpriteBoy();
      scrollSpriteBoy();
      newScoreVal += gotScoreVal;
    }
    scoreThisVal();
    document.getElementById("textField").innerHTML = masG.join("");
    if (newPBValue == finalTextPoint) {
      showWinnerL1popup();
      clearInterval(showSpritesEnemy);
    }
  }
}
function changeSpriteBoy() {
  spriteUrlThis = spriteUrlCounter % 4;
  spriteBoyUrl = ASSETS_PATH + "sprites/rb" + dik + "_sprites/rb" + spriteUrlThis + "_mini.png";
  document.spriteboy_img.src = spriteBoyUrl;
}
function scrollSpriteBoy() {
  scrolling = document.getElementById("spriteBoy");
  curPos = scrolling.style.left;
  curPos = parseInt(curPos) + 3;
  scrolling.style.left = curPos + "px";
  switchGmeOverPoint();
}
function changeSpriteEnemy() {
  spriteEnemyUrlThis = spriteEnemyUrlCounter % 4;
  spriteEnemyUrl = ASSETS_PATH + "sprites/rb6_sprites/rb" + spriteEnemyUrlThis + "_mini.png";
  document.spriteEnemy_img.src = spriteEnemyUrl;
  scrollingEnemy = document.getElementById("spriteEnemy");
  curPosEnemy = scrollingEnemy.style.left;
  curPosEnemy = parseInt(curPosEnemy) + enemyStep;
  scrollingEnemy.style.left = curPosEnemy + "px";
}
function movingEnemy() {
  if (300 > spriteEnemyUrlCounter) {
    changeSpriteEnemy();
    spriteEnemyUrlCounter += 1;
  }
  if (curPosEnemy == gameOverPos) {
    hideStuff("wrapper_div");
    gameAudio.pause();
    hideScoreVal();
    hideGeneralMenuDiv();
    hideBGfont();
    levelValue = 0;
    prevParamsDelete();
    minMaxTimeVal();
    loseVal += 1;
    showGOpopup();
    clearInterval(showSpritesEnemy);
  }
  if (!(
    2 != VolumeDog ||
    (20 != spriteEnemyUrlCounter &&
      22 != spriteEnemyUrlCounter &&
      80 != spriteEnemyUrlCounter &&
      82 != spriteEnemyUrlCounter &&
      200 != spriteEnemyUrlCounter &&
      202 != spriteEnemyUrlCounter)
  )) {
    enemyAudio.play();
    enemyAudio.currentTime = 0;
  }
}
function runMovingEnemy() {
  spriteEnemyUrlCounter = 1;
  changeSpriteEnemy();
  curPosEnemy = "40px";
  scrollingEnemy.style.left = curPosEnemy;
  showSpritesEnemy = setInterval(movingEnemy, enemySpriteDelay);
}
function VolumeDogOn() {
  VolumeDog2 = document.getElementById("VolumeDogOn");
  VolumeDog0 = document.getElementById("VolumeDogOff");
  VolumeDog2.style.color = "#008800";
  VolumeDog0.style.color = "#ffffff";
  VolumeDog = 2;
}
function VolumeDogOff() {
  VolumeDog2.style.color = "#ffffff";
  VolumeDog0.style.color = "#008800";
  VolumeDog = 0;
}
function popupOpen() {
  setTimeout(
    "document.getElementById('parent_popup').style.display='block'",
    5,
  );
  document.getElementById("wrapper_div").style.display = "none";
}
function showStuff(b) {
  document.getElementById(b).style.display = "block";
}
function hideStuff(b) {
  document.getElementById(b).style.display = "none";
}
function showHelp() {
  document.getElementById("parent_help").style.display = "block";
  document.getElementById("parent_popup").style.display = "none";
}
function showOption() {
  document.getElementById("parent_option").style.display = "block";
  document.getElementById("parent_popup").style.display = "none";
}
function showMiscGame() {
  document.getElementById("parent_miscGame").style.display = "block";
  document.getElementById("parent_popup").style.display = "none";
}
function showScoreVal() {
  document.getElementById("GameScoreDiv").style.display = "block";
}
function hideScoreVal() {
  document.getElementById("GameScoreDiv").style.display = "none";
}
function hideHelp() {
  document.getElementById("parent_help").style.display = "none";
  document.getElementById("parent_option").style.display = "none";
  document.getElementById("parent_miscGame").style.display = "none";
  document.getElementById("parent_popup").style.display = "block";
}
function showGeneralMenuDiv() {
  document.getElementById("generalMenuDiv").style.display = "block";
  document.getElementById("parent_popup").style.display = "none";
}
function hideGeneralMenuDiv() {
  document.getElementById("generalMenuDiv").style.display = "none";
}
function showGOpopup() {
  document.getElementById("parent_gameOverPopup").style.display = "block";
  gameOverAudio.play();
  gameOverAudio.currentTime = 0;
}
function hideGOpopup() {
  document.getElementById("parent_gameOverPopup").style.display = "none";
}
function showWinnerL1popup() {
  hideStuff("wrapper_div");
  gameAudio.pause();
  hideScoreVal();
  hideGeneralMenuDiv();
  hideBGfont();
  levelValue = 0;
  prevParamsDelete();
  minMaxTimeVal();
  winsVal += 1;
  document.getElementById("parent_winnerPopup").style.display = "block";
  winnerAudio.play();
  winnerAudio.currentTime = 0;
}
function hideWinnerL1popup() {
  document.getElementById("parent_winnerPopup").style.display = "none";
}
function showStatsPopup() {
  document.getElementById("parent_statsPopup").style.display = "block";
}
function hideStatsPopup() {
  document.getElementById("parent_statsPopup").style.display = "none";
}
function showLevelChecker() {
  if (1 == levelValue) {
    showLevel1popup();
    summaryStarts += 1;
    getNewTime = new Date();
  }
  if (0 == levelValue) {
    document.getElementById("parent_popup").style.display = "none";
    showStuff("wrapper_div");
    checkHeroValue();
    runHeroValue();
    myaudio.pause();
    checkGMvalue();
    runMovingEnemy();
    showScoreVal();
    hideLevel1popup();
    clicksound.playclip();
    showGeneralMenuDiv();
    showBGfont();
    summaryStarts += 1;
    t += 1;
    getNewTime = new Date();
  }
}
function showLevel1popup() {
  document.getElementById("parent_level1Popup").style.display = "block";
  document.getElementById("parent_popup").style.display = "none";
}
function hideLevel1popup() {
  document.getElementById("parent_level1Popup").style.display = "none";
}
function showBGfont() {
  setBackground("bg_font_mini.jpg");
}
function hideBGfont() {
  setBackground("bg_font_mini2.jpg");
}
function setBackground(file) {
  document.body.style.backgroundImage = "url('" + ASSETS_PATH + "images/" + file + "')";
}
function MenuButtonOn() {
  volumeValueOn = document.getElementById("VolumeBtOn");
  volumeValueOff = document.getElementById("VolumeBtOff");
  volumeValueOn.style.color = "#008800";
  volumeValueOff.style.color = "#ffffff";
  soundHoverMenu();
}
function MenuButtonOff() {
  volumeValueOn.style.color = "#ffffff";
  volumeValueOff.style.color = "#008800";
}
function soundHoverMenu() {
  function b(b) {
    var a = document.createElement("audio");
    if (a.canPlayType) {
      for (var c = 0; c < arguments.length; c++) {
        var d = document.createElement("source");
        d.setAttribute("src", arguments[c]);
        if (arguments[c].match(/\.(\w+)$/i)) {
          d.setAttribute("type", html5_audiotypes[RegExp.$1]);
        }
        a.appendChild(d);
      }
      a.load();
      a.playclip = function () {
        a.pause();
        a.currentTime = 0;
        a.play();
      };
      return a;
    }
    return {
      playclip: function () {
        throw Error("Your browser doesn't support HTML5 audio unfortunately");
      },
    };
  }
  html5_audiotypes = {
    mp3: "audio/mpeg",
    mp4: "audio/mp4",
    ogg: "audio/ogg",
    wav: "audio/wav",
  };
  mouseoversound = b(MEDIA_PATH + "sounds/button19.wav");
  clicksound = b(MEDIA_PATH + "sounds/click.ogg");
}
function soundHoverMenu1() {
  function b(b) {
    var a = document.createElement("audio");
    if (a.canPlayType) {
      for (var c = 0; c < arguments.length; c++) {
        var d = document.createElement("source");
        d.setAttribute("src", arguments[c]);
        if (arguments[c].match(/\.(\w+)$/i)) {
          d.setAttribute("type", html5_audiotypes[RegExp.$1]);
        }
        a.appendChild(d);
      }
      a.load();
      a.playclip = function () {
        a.pause();
        a.currentTime = 0;
        a.play();
      };
      return a;
    }
    return {
      playclip: function () {
        throw Error("Your browser doesn't support HTML5 audio unfortunately");
      },
    };
  }
  mouseoversound = b(MEDIA_PATH + "sounds/soundsOff.wav");
  clicksound = b(MEDIA_PATH + "sounds/soundsOff.wav");
}
function playBgMusic() {
  buttona = document.getElementById("mybtnBg");
  myaudio = document.getElementById("myaudio");
  if (1 == myaudio.paused) {
    myaudio.volume = "0.65";
    var playing = myaudio.play();
    if (playing) {
      playing.catch(showSoundUnlock);
    }
    buttona.style.backgroundImage = "url('" + ASSETS_PATH + "images/bgMusicOn.png')";
    buttona.style.color = "White";
    bgMusicValue = 2;
  } else {
    if (0 == myaudio.paused) {
      myaudio.pause();
      buttona.style.backgroundImage = "url('" + ASSETS_PATH + "images/bgMusicOff.png')";
      buttona.style.color = "Black";
      bgMusicValue = 0;
    }
  }
}
function checkBgMusic() {
  if (2 == bgMusicValue) {
    myaudio.currentTime = 0;
    myaudio.play();
  }
  if (0 == bgMusicValue) {
    myaudio.pause();
  }
}
function playGameMusic() {
  gameAudio = document.getElementById("myaudio");
  if (1 == gameAudio.paused) {
    gameAudio.play();
  } else {
    if (0 == myaudio.paused) {
      gameAudio.pause();
    }
  }
}
function checkGMvalue() {
  if (2 == GMvalue) {
    gameAudio.play();
  }
  if (0 == GMvalue) {
    gameAudio.pause();
  }
}
function GMparamOn() {
  musicInGameOn = document.getElementById("musicInGameOn");
  musicInGameOff = document.getElementById("musicInGameOff");
  musicInGameOn.style.color = "#008800";
  musicInGameOff.style.color = "#ffffff";
  GMvalue = 2;
}
function GMparamOff() {
  musicInGameOn.style.color = "#ffffff";
  musicInGameOff.style.color = "#008800";
  GMvalue = 0;
}
function diffCheker() {
  choise = document.getElementById("gameDiff").value;
  switch (choise) {
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
  document.getElementById("optionValueError").innerHTML = valueError;
  document.getElementById("optionValueTime").innerHTML = valueTime;
  document.getElementById("optionValueSpeed").innerHTML = valueSpeed;
}
function easyDiffVal() {
  enemySpriteDelay = 250;
  enemyStep = 1;
}
function medDiffVal() {
  enemySpriteDelay = 250;
  enemyStep = 2;
}
function hardDiffVal() {
  enemySpriteDelay = 250;
  enemyStep = 3;
}
function switchGmeOverPoint() {
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
function checkHeroValue() {
  for (
    var b = document.getElementsByName("heroValue"), e, a = 0;
    a < b.length;
    a++
  ) {
    if (b[a].checked) {
      e = b[a].value;
      break;
    }
  }
  dik = e;
}
function runHeroValue() {
  checkHeroValue();
  changeSpriteBoy();
}
function scoreThisVal() {
  document.getElementById("divScoreVal").innerHTML = newScoreVal;
}
function roundTimeChecker() {
  for (t_all = 0; t_all < summaryStarts; t_all++) {
    allTimeVal += arrayCurrentTimeVal[t_all];
    summaryScore += arrayAllScoreVal[t_all];
  }
  noneWLval = summaryStarts - winsVal - loseVal;
  document.getElementById("summaryGS").innerHTML = summaryStarts;
  document.getElementById("winnerGS").innerHTML = winsVal;
  document.getElementById("loserGS").innerHTML = loseVal;
  document.getElementById("nonerGS").innerHTML = noneWLval;
  document.getElementById("allTimeVal").innerHTML = allTimeVal.toFixed(2);
  document.getElementById("maxTimeVal").innerHTML = maxTimeVal.toFixed(2);
  document.getElementById("minTimeVal").innerHTML = minTimeVal.toFixed(2);
  document.getElementById("maxScoreVal").innerHTML = maxScoreVal;
  document.getElementById("minScoreVal").innerHTML = minScoreVal;
  document.getElementById("summaryScore").innerHTML = summaryScore;
}
function minMaxTimeVal() {
  gotThisTime = new Date();
  currentTimeVal = (gotThisTime - getNewTime) / 1e3;
  arrayCurrentTimeVal[t] = currentTimeVal;
  minTimeVal = arrayCurrentTimeVal[t];
  maxTimeVal = arrayCurrentTimeVal[t];
  if (1 == summaryStarts) {
    maxTimeVal = minTimeVal;
  }
  for (t_res = 0; t_res < summaryStarts; t_res++) {
    if (arrayCurrentTimeVal[t_res] < minTimeVal) {
      minTimeVal = arrayCurrentTimeVal[t_res];
    }
    if (arrayCurrentTimeVal[t_res] > maxTimeVal) {
      maxTimeVal = arrayCurrentTimeVal[t_res];
    }
  }
  for (t_res = 0; t_res < summaryStarts; t_res++) {
    if (arrayAllScoreVal[t_res] < minScoreVal) {
      minScoreVal = arrayAllScoreVal[t_res];
    }
    if (arrayAllScoreVal[t_res] > maxScoreVal) {
      maxScoreVal = arrayAllScoreVal[t_res];
    }
  }
}

var STAGE_WIDTH = 1250;
var STAGE_HEIGHT = 750;
var STAGE_GROUND_Y = 688;
var STAGE_TOP_SPACE = 30;
var BG_WIDTH = 1500;
var BG_HEIGHT = 750;
var BG_GROUND_HEIGHT = BG_HEIGHT - 688;
var POPUP_IDS = [
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
var lastViewportWidth = 0;
var stageScale = 1;

function fitStage() {
  var vv = window.visualViewport;
  var w = window.innerWidth;
  var h = vv ? vv.height : window.innerHeight;
  var viewTop = vv ? vv.offsetTop : 0;
  var typing = document.activeElement === document.getElementById("primerText");
  if (!typing || w !== lastViewportWidth) {
    lastViewportWidth = w;
    stageScale =
      h > w
        ? Math.min(1, w / STAGE_WIDTH)
        : Math.min(1, w / STAGE_WIDTH, h / STAGE_HEIGHT);
  }
  var bgScale = Math.max(stageScale, w / BG_WIDTH);
  var bgTop = viewTop + h - BG_HEIGHT * bgScale;
  var body = document.body;
  body.style.backgroundSize =
    BG_WIDTH * bgScale + "px " + BG_HEIGHT * bgScale + "px";
  body.style.backgroundPosition = "center " + bgTop + "px";

  var groundTop = viewTop + h - BG_GROUND_HEIGHT * bgScale;
  var stageTop = Math.max(
    viewTop - STAGE_TOP_SPACE * stageScale,
    groundTop - STAGE_GROUND_Y * stageScale,
  );
  var wrapper = document.getElementById("wrapper");
  wrapper.style.left = (w - STAGE_WIDTH * stageScale) / 2 + "px";
  wrapper.style.top = stageTop + "px";
  wrapper.style.transform = "scale(" + stageScale + ")";
}

function fitPopup(overlay) {
  if (overlay.style.display !== "block") {
    return;
  }
  var box = overlay.firstElementChild;
  overlay.style.zoom = 1;
  var gap = 16;
  var scale = Math.min(
    1,
    (window.innerWidth - 2 * gap) / box.offsetWidth,
    (window.innerHeight - 2 * gap) / box.offsetHeight,
  );
  scale = Math.max(scale, Math.min(1, (window.innerWidth - 2 * gap) / box.offsetWidth) / 2);
  overlay.style.zoom = scale;
}

function fitAll() {
  fitStage();
  for (var n = 0; n < POPUP_IDS.length; n++) {
    fitPopup(document.getElementById(POPUP_IDS[n]));
  }
}

function initResponsive() {
  var observer = new MutationObserver(function (mutations) {
    for (var n = 0; n < mutations.length; n++) {
      var el = mutations[n].target;
      if (el.style.display !== el.lastDisplay) {
        el.lastDisplay = el.style.display;
        fitPopup(el);
      }
    }
  });
  for (var n = 0; n < POPUP_IDS.length; n++) {
    var overlay = document.getElementById(POPUP_IDS[n]);
    overlay.lastDisplay = overlay.style.display;
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

document.addEventListener("DOMContentLoaded", initResponsive);

function allSounds() {
  var sounds = Array.prototype.slice.call(document.getElementsByTagName("audio"));
  if (window.mouseoversound) sounds.push(mouseoversound);
  if (window.clicksound) sounds.push(clicksound);
  return sounds;
}

function muteAllSounds(muted) {
  var sounds = allSounds();
  for (var n = 0; n < sounds.length; n++) {
    sounds[n].muted = muted;
  }
}

function showSoundUnlock() {
  document.getElementById("parent_soundUnlock").style.display = "block";
}

function unlockSound() {
  document.getElementById("parent_soundUnlock").style.display = "none";
  var sounds = allSounds();
  for (var n = 0; n < sounds.length; n++) {
    if (sounds[n] !== myaudio && sounds[n].paused) {
      primeSound(sounds[n]);
    }
  }
  if (2 == bgMusicValue) {
    myaudio.play();
  }
}

function primeSound(sound) {
  sound.muted = true;
  var playing = sound.play();
  if (playing) {
    playing
      .then(function () {
        sound.pause();
        sound.currentTime = 0;
      })
      .catch(function () {})
      .then(function () {
        sound.muted = document.hidden;
      });
  }
}

document.addEventListener("visibilitychange", function () {
  muteAllSounds(document.hidden);
});
