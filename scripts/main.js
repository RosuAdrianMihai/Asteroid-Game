import * as Utils from "./utils.js";
import { generateSpaceship } from "./spaceship.js";

const userContainer = document.getElementById("userContainer");
const inputName = document.getElementById("inputName");
const btnStartGame = document.getElementById("startGame");
const leaderboardContainer = document.getElementById("leaderboardContainer");
const noScores = document.getElementById("noScores");
const leaderboardList = document.getElementById("leaderboardList");
const gameContainer = document.getElementById("gameContainer");
const username = document.getElementById("username");
const score = document.getElementById("score");
const lives = document.getElementsByClassName("heart");
const game = document.getElementById("game");
const controlBtnContainer = document.getElementById("btnControl");
const btnNewGame = document.getElementById("newGame");
const btnQuitGame = document.getElementById("quitGame");

const deviceWidth = window.innerWidth;

let userNickname = "";
let userScore = 0;
const levels = 7;
let topScores = Utils.parseStoredScores();

Utils.createLeaderBoardList(leaderboardList, noScores, topScores);

inputName.addEventListener("input", (event) => {
  if (event.target.value.length > 2) {
    btnStartGame.disabled = false;
  } else {
    btnStartGame.disabled = true;
  }
});

window.addEventListener("load", (event) => {
  game.height = 600;
  deviceWidth > 700 ? (game.width = 500) : (game.width = 300);
});

const ctxGame = game.getContext("2d");
let spaceship = null;
let asteroidList = [];

btnStartGame.addEventListener("click", (event) => {
  ctxGame.clearRect(0, 0, game.width, game.height);

  userNickname = inputName.value;

  userContainer.style.display = "none";
  leaderboardContainer.style.display = "none";

  username.innerHTML = userNickname;
  score.innerHTML = 0;
  gameContainer.style.display = "block";

  const sideLength = 50;
  const height = (sideLength * Math.sqrt(3)) / 2;

  const startingX = game.clientWidth / 2;
  const startingY = game.clientHeight - sideLength - 25;

  const vertex2X = startingX + sideLength / 2;
  const vertex2Y = startingY + height;

  const vertex3X = startingX - sideLength / 2;
  const vertex3Y = startingY + height;

  const position = {
    top: {
      x: startingX,
      y: startingY,
    },
    bottomRight: {
      x: vertex2X,
      y: vertex2Y,
    },
    bottomLeft: {
      x: vertex3X,
      y: vertex3Y,
    },
  };

  spaceship = generateSpaceship(position);
  Utils.drawSpaceship(ctxGame, spaceship.Position);

  document.addEventListener("keydown", (event) => {
    if (event.key === "x") {
      spaceship.startShooting();
    }

    switch (event.key) {
      case "ArrowUp":
        spaceship.changeSpaceshipPosition(game, 0, -10);
        break;

      case "ArrowDown":
        spaceship.changeSpaceshipPosition(game, 0, 10);
        break;

      case "ArrowLeft":
        spaceship.changeSpaceshipPosition(game, -10, 0);
        break;

      case "ArrowRight":
        spaceship.changeSpaceshipPosition(game, 10, 0);
        break;
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.key === "x") {
      spaceship.stopShooting();
    }
  });

  let bonusLife = {
    currentStreak: 0,
    giveLife: false,
  };

  let loopInfo = {
    asteroidCreationTimer: 0,
    animationID: null,
  };

  Utils.gameLoop(
    game,
    ctxGame,
    deviceWidth,
    lives,
    spaceship,
    asteroidList,
    levels,
    score,
    userScore,
    userNickname,
    bonusLife,
    loopInfo
  );
});

export function handleEndGame(scoreObj) {
  spaceship = null;
  asteroidList = [];

  topScores = Utils.parseStoredScores();

  topScores.push(scoreObj);

  if (topScores.length === 6) {
    topScores.sort(
      (firstScoreObj, secondScoreObj) =>
        secondScoreObj.score - firstScoreObj.score
    );

    topScores.pop();
  }

  localStorage.setItem("topScores", JSON.stringify(topScores));

  controlBtnContainer.style.display = "flex";
}

btnNewGame.addEventListener("click", () => {
  controlBtnContainer.style.display = "none";

  userScore = 0;
  inputName.value = userNickname;

  btnStartGame.click();
});

btnQuitGame.addEventListener("click", () => {
  Utils.createLeaderBoardList(leaderboardList, noScores, topScores);

  userScore = 0;
  userNickname = "";
  inputName.value = "";
  btnStartGame.disabled = true;

  controlBtnContainer.style.display = "none";

  gameContainer.style.display = "none";
  userContainer.style.display = "flex";
  leaderboardContainer.style.display = "block";
});
