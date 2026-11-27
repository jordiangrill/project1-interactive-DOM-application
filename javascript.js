// Implement Start screen
let gameScreen = document.getElementById("game-area");

gameScreen.classList.add("hidden");

let finishGame = document.getElementById("finish-game");

finishGame.classList.add("hidden");

// Start Game 
let startButton = document.getElementById("start-button");
startButton.addEventListener("click", startGame);

let opponentsInterval;
let debrisInterval;
let batteryInterval;
let roadInterval;

const totalHamiltons = 19;
const totalPickupsPerType = 10;
const startingSpeedKmh = 50;
const minimumSpeedKmh = 20;
const maximumSpeedKmh = 350;
const oilSpeedLossKmh = 30;
const batterySpeedGainKmh = 30;
const startingRaceSpeed = 2;
const maximumRaceSpeed = 6;
const startingPlayerSpeed = 2;
const maximumPlayerSpeed = 4;
const trackLeftPercent = 16;
const trackRightPercent = 84;
const objectGapPercent = 1;
// Gives each pickup time to leave the track before its sprite is reused
const minimumPickupInterval = 1.2;

function startGame() {
  let startScreen = document.getElementById("start-screen");

  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  resetRace();
  startRaceAudio();

  opponentsInterval = setInterval(moveOpponents, 1);
  debrisInterval = setInterval(moveDebris, 1);
  batteryInterval = setInterval(moveBattery, 1);
  roadInterval = setInterval(moveRoad, 1);
}

function resetRace() {
  opponentsPosition = 0;
  oilPosition = 0;
  batteryPosition = 0;
  roadPosition = 0;
  hamiltonsPassed = 0;
  oilItemsSpawned = 0;
  batteryItemsSpawned = 0;
  pickupSchedule = createPickupSchedule();
  pickupScheduleIndex = 0;
  speedKmh = startingSpeedKmh;
  updateMovementSpeeds();
  gameEnded = false;
  playerLeftPosition = 43;

  opponents.style.top = "0px";
  debris.style.top = "0px";
  energy.style.top = "0px";
  player.style.left = playerLeftPosition + "%";
  debris.style.display = "";
  energy.style.display = "";
  track.style.backgroundPositionY = "0px";

  placeObjectsRandomly([opponents, debris, energy]);
  debris.style.display = "none";
  energy.style.display = "none";
  updateRaceStatus();
}

// game screen
let opponents = document.getElementById("rivals");
let debris = document.getElementById("oil");
let energy = document.getElementById("battery");
let road = document.getElementById("road");
let track = document.getElementById("track");
let player = document.getElementById("player");
let racePositionDisplay = document.getElementById("race-position");
let raceSpeedDisplay = document.getElementById("race-speed");
let raceAudio = document.getElementById("race-audio");
let resultMessage = document.getElementById("result-message");

let opponentsPosition = 0;
let oilPosition = 0;
let batteryPosition = 0;
let roadPosition = 0;
let hamiltonsPassed = 0;
let oilItemsSpawned = 0;
let batteryItemsSpawned = 0;
let pickupSchedule = [];
let pickupScheduleIndex = 0;
let raceSpeed = 2;
let playerSpeed = 2;
let speedKmh = startingSpeedKmh;
let gameEnded = false;

function shuffleArray(items) {
  for (let i = items.length - 1; i > 0; i--) {
    let randomIndex = Math.floor(Math.random() * (i + 1));
    [items[i], items[randomIndex]] = [items[randomIndex], items[i]];
  }
  return items;
}

function createPickupSchedule() {
  let minimumProgress = 1;
  let maximumProgress = totalHamiltons - 1;
  let availableProgress =
    maximumProgress -
    minimumProgress -
    (totalPickupsPerType - 1) * minimumPickupInterval;

  if (availableProgress < 0) {
    throw new Error("Too many pickups to schedule between Hamiltons.");
  }

  function randomProgressPoints() {
    let randomOffsets = Array.from(
      { length: totalPickupsPerType },
      () => Math.random() * availableProgress,
    ).sort((first, second) => first - second);

    return randomOffsets.map(
      (offset, index) =>
        minimumProgress + offset + index * minimumPickupInterval,
    );
  }

  let schedule = [
    ...randomProgressPoints().map((atProgress) => ({
      atProgress,
      type: "oil",
    })),
    ...randomProgressPoints().map((atProgress) => ({
      atProgress,
      type: "battery",
    })),
  ];

  return schedule.sort((first, second) => first.atProgress - second.atProgress);
}

function placeObjectsRandomly(objects) {
  let shuffledObjects = shuffleArray([...objects]);

  let trackWidth = track.clientWidth;
  let objectWidths = shuffledObjects.map(
    (object) => (object.getBoundingClientRect().width / trackWidth) * 100,
  );
  let totalObjectWidth = objectWidths.reduce(
    (total, width) => total + width,
    0,
  );
  let totalGapWidth = objectGapPercent * (shuffledObjects.length - 1);
  let spareWidth =
    trackRightPercent - trackLeftPercent - totalObjectWidth - totalGapWidth;

  if (spareWidth < 0) {
    throw new Error(
      "Track is too narrow to place the objects without overlap.",
    );
  }

  let randomCuts = Array.from(
    { length: shuffledObjects.length },
    () => Math.random() * spareWidth,
  ).sort((a, b) => a - b);
  let gaps = [
    randomCuts[0],
    ...randomCuts.slice(1).map((cut, index) => cut - randomCuts[index]),
    spareWidth - randomCuts[randomCuts.length - 1],
  ];
  let position = trackLeftPercent + gaps[0];

  shuffledObjects.forEach((object, index) => {
    object.style.left = position + "%";
    position += objectWidths[index] + objectGapPercent;
    if (index < shuffledObjects.length - 1) {
      position += gaps[index + 1];
    }
  });
}

function getRandomObjectPosition(object, otherObjects) {
  let trackRect = track.getBoundingClientRect();
  let objectWidthPercent =
    (object.getBoundingClientRect().width / trackRect.width) * 100;
  let availableRanges = [
    [trackLeftPercent, trackRightPercent - objectWidthPercent],
  ];

  otherObjects.forEach((otherObject) => {
    if (otherObject.style.display === "none") {
      return;
    }

    let otherRect = otherObject.getBoundingClientRect();
    let otherLeftPercent =
      ((otherRect.left - trackRect.left) / trackRect.width) * 100;
    let otherWidthPercent = (otherRect.width / trackRect.width) * 100;
    let blockedStart = otherLeftPercent - objectWidthPercent - objectGapPercent;
    let blockedEnd = otherLeftPercent + otherWidthPercent + objectGapPercent;

    availableRanges = availableRanges.flatMap(([start, end]) => {
      if (blockedEnd <= start || blockedStart >= end) {
        return [[start, end]];
      }

      let remainingRanges = [];
      if (blockedStart > start) {
        remainingRanges.push([start, Math.min(blockedStart, end)]);
      }
      if (blockedEnd < end) {
        remainingRanges.push([Math.max(blockedEnd, start), end]);
      }
      return remainingRanges;
    });
  });

  let availableWidth = availableRanges.reduce(
    (total, [start, end]) => total + Math.max(0, end - start),
    0,
  );

  if (availableWidth <= 0) {
    throw new Error(
      "No non-overlapping position is available for this object.",
    );
  }

  let randomOffset = Math.random() * availableWidth;
  for (let [start, end] of availableRanges) {
    let rangeWidth = Math.max(0, end - start);
    if (randomOffset < rangeWidth) {
      return start + randomOffset;
    }
    randomOffset -= rangeWidth;
  }

  return availableRanges[availableRanges.length - 1][1];
}

function moveRoad() {
  if (gameEnded) {
    return;
  }

  if (!road.naturalWidth || !road.naturalHeight || !track.clientWidth) {
    return;
  }

  let roadTileHeight =
    road.naturalHeight * (track.clientWidth / road.naturalWidth);
  roadPosition = (roadPosition + raceSpeed) % roadTileHeight;
  track.style.backgroundPositionY = roadPosition + "px";
}

function moveOpponents() {
  if (gameEnded) {
    return;
  }

  opponentsPosition += raceSpeed;
  opponents.style.top = opponentsPosition + "px";

  if (checkCollision(player, opponents)) {
    endGame();
    return;
  }

  if (opponentsPosition >= track.clientHeight) {
    hamiltonsPassed++;
    updateRaceStatus();

    if (getRacePosition() === 1) {
      endGame();
      return;
    }

    opponentsPosition = 0;
    opponents.style.top = "0px";
    opponents.style.left =
      getRandomObjectPosition(opponents, [debris, energy]) + "%";
  }

  spawnPickupsAsDue();
}

function moveDebris() {
  if (gameEnded || debris.style.display === "none") {
    return;
  }

  oilPosition += raceSpeed;
  debris.style.top = oilPosition + "px";

  if (checkCollision(player, debris)) {
    changeSpeed(-oilSpeedLossKmh);
    debris.style.display = "none";
  } else if (oilPosition >= track.clientHeight) {
    debris.style.display = "none";
  }
}

function moveBattery() {
  if (gameEnded || energy.style.display === "none") {
    return;
  }

  batteryPosition += raceSpeed;
  energy.style.top = batteryPosition + "px";

  if (checkCollision(player, energy)) {
    changeSpeed(batterySpeedGainKmh);
    energy.style.display = "none";
  } else if (batteryPosition >= track.clientHeight) {
    energy.style.display = "none";
  }
}

function spawnPickupsAsDue() {
  let raceProgress = hamiltonsPassed + opponentsPosition / track.clientHeight;

  while (
    pickupScheduleIndex < pickupSchedule.length &&
    pickupSchedule[pickupScheduleIndex].atProgress <= raceProgress
  ) {
    let pickupType = pickupSchedule[pickupScheduleIndex].type;
    let pickup = pickupType === "oil" ? debris : energy;
    let otherPickups =
      pickupType === "oil" ? [opponents, energy] : [opponents, debris];

    pickup.style.display = "";
    pickup.style.top = "0px";
    pickup.style.left = getRandomObjectPosition(pickup, otherPickups) + "%";

    if (pickupType === "oil") {
      oilPosition = 0;
      oilItemsSpawned++;
    } else {
      batteryPosition = 0;
      batteryItemsSpawned++;
    }

    pickupScheduleIndex++;
  }
}

function changeSpeed(amountKmh) {
  speedKmh = Math.max(
    minimumSpeedKmh,
    Math.min(maximumSpeedKmh, speedKmh + amountKmh),
  );
  updateMovementSpeeds();
  updateRaceStatus();
}

function startRaceAudio() {
  raceAudio.currentTime = 0;
  raceAudio.play().catch((error) => {
    console.error("Could not play the race audio.", error);
  });
}

function stopRaceAudio() {
  raceAudio.pause();
  raceAudio.currentTime = 0;
}

function updateMovementSpeeds() {
  let speedProgress =
    (speedKmh - startingSpeedKmh) / (maximumSpeedKmh - startingSpeedKmh);
  raceSpeed =
    startingRaceSpeed + speedProgress * (maximumRaceSpeed - startingRaceSpeed);
  playerSpeed =
    startingPlayerSpeed +
    speedProgress * (maximumPlayerSpeed - startingPlayerSpeed);
}

function updateRaceStatus() {
  racePositionDisplay.textContent =
    "P" + getRacePosition() + "/" + (totalHamiltons + 1);
  raceSpeedDisplay.textContent = "Speed " + speedKmh + " km/h";
}

function getRacePosition() {
  return totalHamiltons + 1 - hamiltonsPassed;
}

function getFinishMessage(position) {
  if (position === 1) {
    return "Victory! You finished P1 - What a drive!";
  }
  if (position <= 3) {
    return "Podium finish! You finished P" + position + " - incredible!";
  }
  if (position <= 10) {
    return "Points finish! You finished P" + position + " - great job!";
  }
  return "Mercedes is not happy! You finished P" + position + ".";
}

function checkCollision(player, opponents) {
  let antonelli = player.getBoundingClientRect();
  let hamilton = opponents.getBoundingClientRect();

  return !(
    antonelli.right < hamilton.left ||
    antonelli.left > hamilton.right ||
    antonelli.bottom < hamilton.top ||
    antonelli.top > hamilton.bottom
  );
}

let playerLeftPosition = 43;
player.style.left = playerLeftPosition + "%";

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    playerLeftPosition = Math.max(14, playerLeftPosition - playerSpeed);
  } else if (event.key === "ArrowRight") {
    playerLeftPosition = Math.min(72, playerLeftPosition + playerSpeed);
  }

  player.style.left = playerLeftPosition + "%";
});

function endGame() {
  if (gameEnded) {
    return;
  }

  gameEnded = true;
  gameScreen.classList.add("hidden");
  finishGame.classList.remove("hidden");
  resultMessage.textContent = getFinishMessage(getRacePosition());
  clearInterval(opponentsInterval);
  clearInterval(debrisInterval);
  clearInterval(batteryInterval);
  clearInterval(roadInterval);
  stopRaceAudio();
}

// finish screen
let restartButton = document.getElementById("restart-button");

function newRace() {
  gameScreen.classList.remove("hidden");
  finishGame.classList.add("hidden");
  startGame();
}

restartButton.addEventListener("click", newRace);
