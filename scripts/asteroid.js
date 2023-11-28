export class Asteroid {
  status;
  points;
  position = {
    x: 0,
    y: 0,
    radius: 0,
  };
  currentLives;
  points;
  speed;
  color;

  constructor(points, position, speed) {
    this.status = "ongoing";
    this.points = points;
    this.position = position;
    this.points = points;
    this.currentLives = points;
    this.speed = speed;
    this.Color = this.currentLives;
  }

  get Status() {
    return this.status;
  }

  set Status(status) {
    this.status = status;
  }

  get Points() {
    return this.points;
  }

  get Position() {
    return this.position;
  }

  set Position(position) {
    this.position = position;
  }

  get CurrentLives() {
    return this.currentLives;
  }

  set CurrentLives(decreaseLives) {
    if (this.currentLives === 1) {
      this.Status = "destroyed";
    }

    this.currentLives += decreaseLives;
    this.Color = this.currentLives;
    this.position.radius -= 10;
  }

  get Color() {
    return this.color;
  }

  set Color(currentLives) {
    switch (currentLives) {
      case 1:
        this.color = "#A0522D";
        break;

      case 2:
        this.color = "#A52A2A";
        break;

      case 3:
        this.color = "#8B4513";
        break;

      case 4:
        this.color = "#412819";
        break;
    }
  }

  getAsteroidPoints() {
    const asteroidPosition = this.position;
    let asteroidPoints = [];

    for (let i = 0; i < 360; i++) {
      const angle = (i / 360) * 2 * Math.PI;

      const positionX =
        asteroidPosition.x + asteroidPosition.radius * Math.cos(angle);
      const positionY =
        asteroidPosition.y + asteroidPosition.radius * Math.sin(angle);

      asteroidPoints.push([positionX, positionY]);
    }

    return asteroidPoints;
  }

  rocketCollision(rocketsList) {
    const EPSILON = 5;
    const asteroidPoints = this.getAsteroidPoints();

    for (const { rocketY, rocketX, id } of rocketsList) {
      for (const [asteroidX, asteroidY] of asteroidPoints) {
        const distance = Math.sqrt(
          Math.pow(rocketX - asteroidX, 2) + Math.pow(rocketY - asteroidY, 2)
        );

        if (distance < EPSILON) {
          return [true, id];
        }
      }
    }

    return [false, -1];
  }
}

export function generateAsteroid(game, deviceWidth) {
  const possibleAsteroidValues = [1, 2, 3, 4];
  let randomIndex = Math.floor(Math.random() * possibleAsteroidValues.length);
  const asteroidValue = possibleAsteroidValues[randomIndex];

  let position = {};
  const possibleXValues =
    deviceWidth > 700
      ? Array.from({ length: 390 }, (_, index) => index + 1)
      : Array.from({ length: 190 }, (_, index) => index + 1);
  randomIndex = Math.floor(Math.random() * possibleXValues.length);
  const xPosition = possibleXValues[randomIndex];

  const possibleRadius = [25, 35, 45, 55];
  const radius = possibleRadius[asteroidValue - 1];

  position.x = game.width - xPosition;
  position.y = -radius;
  position.radius = radius;

  const possibleSpeeds = Array.from({ length: 3 }, (_, index) => index + 4);
  randomIndex = Math.floor(Math.random() * possibleSpeeds.length);
  const speed = possibleSpeeds[randomIndex];

  const asteroid = new Asteroid(asteroidValue, position, speed);

  return asteroid;
}
