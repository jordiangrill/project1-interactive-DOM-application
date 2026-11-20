// start screen
let gameScreen = document.getElementById("game-area");

gameScreen.classList.add("hidden");

let finishGame = document.getElementById("finish-game");

finishGame.classList.add("hidden");

let button = document.getElementById("play-button");

button.onclick = function () {
  console.log("button working");

  let startScreen = document.getElementById("start-screen");

  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  opponents.style.left = randomStart(16, 68) + "%";
  debris.style.left = randomStart(16, 74) + "%";
  energy.style.left = randomStart(16, 74) + "%";

  setInterval(moveOpponents, 1);
  setInterval(moveDebris, 1);
  setInterval(moveBattery, 1);
};

function randomStart(min, max) {
  return min + Math.random() * (68 - 16);
}

// game screen
let opponents = document.getElementById("rivals");
let debris = document.getElementById("oil");
let energy = document.getElementById("battery");

let opponentsPosition = 0;
let oilPosition = 0;
let batteryPosition = 0;

function moveOpponents() {
  opponentsPosition++;
  opponents.style.top = opponentsPosition + "px";
}

function moveDebris() {
  oilPosition++;
  debris.style.top = oilPosition + "px";
}

function moveBattery() {
  batteryPosition++;
  energy.style.top = batteryPosition + "px";
}

// finish screen
