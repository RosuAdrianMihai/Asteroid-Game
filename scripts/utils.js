import { generateAsteroid } from "./asteroid.js";
import { handleEndGame } from "./main.js";

export function parseStoredScores() {
  const topScores = JSON.parse(localStorage.getItem("topScores"));

  if (topScores && topScores.length > 0) {
    return topScores;
  } else {
    return [];
  }
}

export function createLeaderBoardList(leaderboardList, noScores, topScores) {
  if (topScores.length === 0) {
    noScores.style.display = "block";
    return;
  } else {
    noScores.style.display = "none";

    while (leaderboardList.firstChild) {
      leaderboardList.removeChild(leaderboardList.firstChild);
    }
  }

  topScores = topScores.sort(
    (firstScoreObj, secondScoreObj) =>
      secondScoreObj.score - firstScoreObj.score
  );

  for (const scoreObj of topScores) {
    let liScore = document.createElement("li");
    liScore.classList.add("leaderboardItem");
    liScore.innerHTML = `${scoreObj.username}: ${scoreObj.score}`;

    leaderboardList.append(liScore);
  }
}

export function drawSpaceship(ctxGame, position) {
  const vertex2X = position.bottomRight.x;
  const vertex2Y = position.bottomRight.y;

  const vertex3X = position.bottomLeft.x;
  const vertex3Y = position.bottomLeft.y;

  ctxGame.beginPath();

  ctxGame.moveTo(position.top.x, position.top.y);

  ctxGame.lineTo(vertex2X, vertex2Y);
  ctxGame.lineTo(vertex3X, vertex3Y);

  ctxGame.closePath();

  ctxGame.fillStyle = "white";
  ctxGame.fill();
}

export function drawAsteroid(ctxGame, asteroid) {
  const position = asteroid.Position;
  const currentLives = asteroid.CurrentLives;
  const color = asteroid.Color;

  ctxGame.beginPath();
  ctxGame.arc(position.x, position.y, position.radius, 0, 2 * Math.PI);
  ctxGame.fillStyle = color;
  ctxGame.fill();
  ctxGame.stroke();

  ctxGame.font = "20px Arial";
  ctxGame.fillStyle = "white";
  ctxGame.textAlign = "center";
  ctxGame.textBaseline = "middle";

  ctxGame.fillText(currentLives, position.x, position.y);
}

export function drawRocket(ctxGame, rocket) {
  ctxGame.fillStyle = "red";

  ctxGame.fillRect(
    rocket.rocketX - rocket.width / 2,
    rocket.rocketY + rocket.height,
    rocket.width,
    rocket.height
  );
}

export function gameLoop(
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
) {
  for (let i = 0; i < lives.length; i++) {
    let liveEl = lives[i];

    if (i < spaceship.Lives) {
      liveEl.style.backgroundColor = "red";
    } else {
      liveEl.style.backgroundColor = "black";
    }
  }

  if (spaceship.Lives > 0) {
    loopInfo.asteroidCreationTimer += 10;

    const currentLevel =
      userScore < 70 ? levels - Math.floor(userScore / 10) : 1;
    const currentTimer = currentLevel * 150;

    if (loopInfo.asteroidCreationTimer % currentTimer === 0) {
      const newAsteroid = generateAsteroid(game, deviceWidth);
      asteroidList.push(newAsteroid);
    }

    ctxGame.clearRect(0, 0, game.width, game.height);

    drawSpaceship(ctxGame, spaceship.Position);

    let collisionCount = 0;

    asteroidList = asteroidList.filter((asteroid) => {
      return (
        asteroid.Status !== "collision" &&
        asteroid.Status !== "destroyed" &&
        asteroid.Position.y <= game.height + asteroid.Position.radius
      );
    });

    asteroidList.forEach((asteroid) => {
      asteroid.Position.y += asteroid.speed;
      drawAsteroid(ctxGame, asteroid);

      const spaceshipCollision = spaceship.asteroidCollision(asteroid);

      if (spaceshipCollision) {
        asteroid.Status = "collision";
        collisionCount--;
      }

      const [rocketCollision, rocketID] = asteroid.rocketCollision(
        spaceship.activeRockets
      );

      if (rocketCollision) {
        asteroid.CurrentLives = -1;

        if (asteroid.CurrentLives === 0) {
          userScore += asteroid.points;
          bonusLife.currentStreak += asteroid.points;
        }

        const rocketIndex = spaceship.activeRockets.findIndex(
          (currentRocket) => {
            return currentRocket.id === rocketID;
          }
        );
        spaceship.availableRockets.push(spaceship.activeRockets[rocketIndex]);
        spaceship.activeRockets.splice(rocketIndex, 1);
      }
    });

    spaceship.Lives = collisionCount;

    spaceship.shootRocket();

    for (let i = 0; i < spaceship.activeRockets.length; i++) {
      let rocketShot = spaceship.activeRockets[i];
      let { rocketY, height } = rocketShot;

      if (rocketY < -height) {
        spaceship.activeRockets.splice(i, 1);
        spaceship.availableRockets.push(rocketShot);
      }
    }

    spaceship.activeRockets.forEach((rocket) => {
      switch (spaceship.orientation) {
        case "N":
          rocket.rocketY -= rocket.speed;
          break;

        case "E":
          rocket.rocketX += rocket.speed;
          break;

        case "S":
          rocket.rocketY += rocket.speed;
          break;

        case "W":
          rocket.rocketX -= rocket.speed;
      }

      drawRocket(ctxGame, rocket);
    });

    score.innerHTML = userScore;

    if (bonusLife.currentStreak >= 75) {
      bonusLife.giveLife = true;
    }

    if (bonusLife.giveLife && spaceship.lives < 3) {
      bonusLife.giveLife = false;
      bonusLife.currentStreak = 0;
      spaceship.lives += 1;
    }

    loopInfo.animationID = requestAnimationFrame(() =>
      gameLoop(
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
      )
    );
  } else {
    let scoreObj = {
      username: userNickname,
      score: userScore,
    };

    handleEndGame(scoreObj);

    cancelAnimationFrame(loopInfo.animationID);
  }
}
