export class Spaceship {
  lives;
  orientation;
  availableRockets = [];
  activeRockets = [];
  rocketShot = null;
  isShooting;
  position = {
    top: {
      x: 0,
      y: 0,
    },
    bottomLeft: {
      x: 0,
      y: 0,
    },
    bottomRight: {
      x: 0,
      y: 0,
    },
  };

  constructor(lives, position) {
    this.lives = lives;
    this.orientation = "N";
    this.isShooting = false;
    this.position = position;

    for (let i = 0; i < 3; i++) {
      this.availableRockets.push({
        id: i + 1,
        rocketX: this.position.top.x,
        rocketY: this.position.top.y,
        height: 10,
        width: 5,
        speed: 5,
      });
    }
  }

  get Lives() {
    return this.lives;
  }

  set Lives(modifyLives) {
    this.lives += modifyLives;
  }

  get Orientation() {
    return this.orientation;
  }

  set Orientation(newOrientation) {
    this.orientation = newOrientation;
  }

  get Position() {
    return this.position;
  }

  getSpaceshipPoints() {
    const { top, bottomLeft, bottomRight } = this.position;
    let spaceshipPoints = [
      [top.x, top.y],
      [bottomLeft.x, bottomLeft.y],
      [bottomRight.x, bottomRight.y],
    ];

    // 50 edge length
    for (let i = 1; i <= 50; i++) {
      // Top left
      let point1 = [bottomLeft.x - i, bottomLeft.y - i];

      // Bottom left
      let point2 = [bottomLeft.x - i, bottomLeft.y + i];

      // Top Right
      let point3 = [bottomLeft.x + i, bottomLeft.y - i];

      // Bottom right
      let point4 = [bottomLeft.x + i, bottomLeft.y + i];

      // Top
      let point5 = [bottomLeft.x, bottomLeft.y - i];

      // Bottom
      let point6 = [bottomLeft.x, bottomLeft.y + i];

      // Left
      let point7 = [bottomLeft.x - i, bottomLeft.y];

      // Right
      let point8 = [bottomLeft.x + i, bottomLeft.y];

      let generatedPoints = [
        point1,
        point2,
        point3,
        point4,
        point5,
        point6,
        point7,
        point8,
      ];

      generatedPoints = generatedPoints.filter((point) => {
        const denominator =
          (bottomRight.y - bottomLeft.y) * (top.x - bottomLeft.x) +
          (bottomLeft.x - bottomRight.x) * (top.y - bottomLeft.y);

        const alpha =
          ((bottomRight.y - bottomLeft.y) * (point[0] - bottomLeft.x) +
            (bottomLeft.x - bottomRight.x) * (point[1] - bottomLeft.y)) /
          denominator;
        const beta =
          ((bottomLeft.y - top.y) * (point[0] - bottomLeft.x) +
            (top.x - bottomLeft.x) * (point[1] - bottomLeft.y)) /
          denominator;
        const gamma = 1 - alpha - beta;

        return alpha >= 0 && beta >= 0 && gamma >= 0;
      });

      spaceshipPoints.push(...generatedPoints);
    }

    return spaceshipPoints;
  }

  changeSpaceshipPosition(game, addedX, addedY) {
    // Right margin
    if (addedX > 0 && this.position.bottomRight.x + addedX > game.width) {
      return;
    }

    // Left margin
    if (addedX < 0 && this.position.bottomLeft.x + addedX < 0) {
      return;
    }

    // Bottom margin
    if (addedY > 0 && this.position.bottomLeft.y + addedY > game.height) {
      return;
    }

    // Top margin
    if (addedY < 0 && this.position.top.y + addedY < 0) {
      return;
    }

    this.position.top.x += addedX;
    this.position.top.y += addedY;

    this.position.bottomLeft.x += addedX;
    this.position.bottomLeft.y += addedY;

    this.position.bottomRight.x += addedX;
    this.position.bottomRight.y += addedY;
  }

  startShooting() {
    this.isShooting = true;
  }

  stopShooting() {
    this.isShooting = false;
    this.rocketShot = null;
  }

  shootRocket() {
    if (
      this.isShooting === true &&
      this.availableRockets.length > 0 &&
      this.rocketShot === null
    ) {
      const rocket = this.availableRockets.pop();

      switch (this.orientation) {
        case "N":
          rocket.rocketX = this.position.top.x;
          rocket.rocketY = this.position.top.y;
          break;

        case "E":
          rocket.rocketX = this.position.bottomRight.x;
          rocket.rocketY = this.position.bottomRight.y;
          break;

        case "S":
          rocket.rocketX = this.position.top.x;
          rocket.rocketY = this.position.top.y;
          break;

        case "W":
          rocket.rocketX = this.position.bottomRight.x;
          rocket.rocketY = this.position.bottomRight.y;
      }

      this.activeRockets.push(rocket);

      this.rocketShot = rocket;
    }
  }

  asteroidCollision(asteroid) {
    const EPSILON = 1;

    const spaceshipPoints = this.getSpaceshipPoints();
    const asteroidPoints = asteroid.getAsteroidPoints();

    for (const [spaceshipX, spaceshipY] of spaceshipPoints) {
      for (const [asteroidX, asteroidY] of asteroidPoints) {
        const distance = Math.sqrt(
          Math.pow(spaceshipX - asteroidX, 2) +
            Math.pow(spaceshipY - asteroidY, 2)
        );

        if (distance < EPSILON) {
          return true;
        }
      }
    }

    return false;
  }
}

export function generateSpaceship(startingPosition) {
  const spaceship = new Spaceship(3, startingPosition);

  return spaceship;
}
