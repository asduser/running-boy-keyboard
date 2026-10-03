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
  spriteBoyUrl = "rb" + dik + "_sprites/rb" + spriteUrlThis + "_mini.png";
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
  spriteEnemyUrl = "rb6_sprites/rb" + spriteEnemyUrlThis + "_mini.png";
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
  document.getElementById("wrapper").style.backgroundImage =
    "url('bg_font_mini.jpg')";
}
function hideBGfont() {
  document.getElementById("wrapper").style.backgroundImage =
    "url('bg_font_mini2.jpg')";
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
  mouseoversound = b("../sounds/button19.wav");
  clicksound = b("../sounds/click.ogg");
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
  mouseoversound = b("../sounds/soundsOff.wav");
  clicksound = b("../sounds/soundsOff.wav");
}
function playBgMusic() {
  buttona = document.getElementById("mybtnBg");
  myaudio = document.getElementById("myaudio");
  if (1 == myaudio.paused) {
    myaudio.volume = "0.65";
    myaudio.play();
    buttona.style.backgroundImage = "url('images/bgMusicOn.png')";
    buttona.style.color = "White";
    bgMusicValue = 2;
  } else {
    if (0 == myaudio.paused) {
      myaudio.pause();
      buttona.style.backgroundImage = "url('images/bgMusicOff.png')";
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
