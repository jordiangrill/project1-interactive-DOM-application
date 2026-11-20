// start screen
let gameScreen = document.getElementById("game-area");

gameScreen.classList.add("hidden");

let finishGame = document.getElementById("finish-game");

finishGame.classList.add("hidden");

let button = document.getElementById("play-button");

button.onclick = function () {
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
  return min + Math.random() * (max - min);
}

// game screen
let opponents = document.getElementById("rivals");
let debris = document.getElementById("oil");
let energy = document.getElementById("battery");
let road = document.getElementById("road");

let opponentsPosition = 0;
let oilPosition = 0;
let batteryPosition = 0;

function moveOpponents() {
  opponentsPosition++;
  opponents.style.top = opponentsPosition + "px";
  if (opponentsPosition >= road.clientHeight) {
    opponentsPosition = 0;
    opponents.style.left = randomStart(16, 68) + "%";
  }
}

function moveDebris() {
  oilPosition++;
  debris.style.top = oilPosition + "px";
  if (oilPosition >= road.clientHeight) {
    oilPosition = 0;
    debris.style.left = randomStart(16, 68) + "%";
  }
}

function moveBattery() {
  batteryPosition++;
  energy.style.top = batteryPosition + "px";
  if (batteryPosition >= road.clientHeight) {
    batteryPosition = 0;
    energy.style.left = randomStart(16, 68) + "%";
  }
}

let player = document.getElementById("player");
let playerLeftPosition = 43;
player.style.left = playerLeftPosition + "%";

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft" && playerLeftPosition > 14) {
    playerLeftPosition--;
  } else if (event.key === "ArrowRight" && playerLeftPosition < 72) {
    playerLeftPosition++;
  }
  player.style.left = playerLeftPosition + "%";
});

// checkCollision() ??

// finish screen
