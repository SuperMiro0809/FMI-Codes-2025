const spaceshipConfig = {
  speed: 200,
  spaceshipScale: 0.8,
};

const spaceConfig = {
  asteroidSpeed: 100,
  asteroidScale: 2,
  asteroidImages: 4,
  asteroidSpawnOffset: 300,
  spawnInterval: 1000, // in miliseconds
  planetSpeed: 100,
  planetOffset: 100,
};

let asteroidImageIndex = 1;

class SpaceScene extends Phaser.Scene {
  constructor() {
    super({ key: "SpaceScene" });
  }

  preload() {
    this.load.image("space-background", "assets/space-background.jpg");
    this.load.image("spaceship", "assets/spaceship.png");
    this.load.image("asteroid1", "assets/asteroid1.png");
    this.load.image("asteroid2", "assets/asteroid2.png");
    this.load.image("asteroid3", "assets/asteroid3.png");
    this.load.image("asteroid4", "assets/asteroid4.png");
    this.load.image("Earth", "assets/earth/image.png")

    this.load.spritesheet('earth', 'assets/earth/spritesheet.png', {
        frameWidth: 100,
        frameHeight: 100
    });
  }

  create() {
    this.bg = this.add
      .tileSprite(
        0,
        0,
        this.game.config.width,
        this.game.config.height,
        "space-background"
      )
      .setOrigin(0, 0)
      .setScrollFactor(0);

    this.spaceship = this.physics.add
      .sprite(500, this.game.config.height / 2, "spaceship")
      .setOrigin(0.5)
      .setRotation(Math.PI / 2)
      .setScale(spaceshipConfig.spaceshipScale);
    this.spaceship.setCollideWorldBounds(true);
    this.spaceship.setBodySize(this.spaceship.width * 0.8, this.spaceship.height * 0.8)

    this.leftPlanet = this.physics.add.sprite(-spaceConfig.planetOffset, this.game.config.height/2, "Earth")
    this.leftPlanet.setVelocity(-spaceConfig.planetSpeed, 0);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.asteroids = this.physics.add.group();

    this.time.addEvent({
      delay: spaceConfig.spawnInterval,
      callback: this.spawnAsteroid,
      callbackScope: this,
      loop: true,
    });

    this.physics.add.collider(
      this.spaceship,
      this.asteroids,
      this.hitAsteroid,
      null,
      this
    );
  }

  update() {
    this.bg.tilePositionX += 2;

    if (this.cursors.up.isDown) {
      this.spaceship.setVelocityY(-spaceshipConfig.speed);
    } else if (this.cursors.down.isDown) {
      this.spaceship.setVelocityY(spaceshipConfig.speed);
    } else {
      this.spaceship.setVelocityY(0);
    }

    if (this.cursors.left.isDown) {
      this.spaceship.setVelocityX(-spaceshipConfig.speed);
    } else if (this.cursors.right.isDown) {
      this.spaceship.setVelocityX(spaceshipConfig.speed);
    } else {
      this.spaceship.setVelocityX(0);
    }

  }

  spawnAsteroid() {
    let spawnY = Phaser.Math.Between(0, 1) === 0 ? 0 : this.game.config.height;
    let asteroid = this.asteroids.create(
      spaceConfig.asteroidSpawnOffset +
        Phaser.Math.Between(
          0,
          this.game.config.width - spaceConfig.asteroidSpawnOffset
        ),
      spawnY,
      `asteroid${asteroidImageIndex}`
    );
    asteroidImageIndex =
      asteroidImageIndex == spaceConfig.asteroidImages
        ? 1
        : asteroidImageIndex + 1;

    asteroid.setVelocity(
      -spaceConfig.asteroidSpeed,
      spawnY === 0 ? spaceConfig.asteroidSpeed : -spaceConfig.asteroidSpeed
    );
    asteroid.setScale(spaceConfig.asteroidScale);
    asteroid.setCollideWorldBounds(false);

    asteroid.setBodySize(asteroid.width * 0.4, asteroid.height * 0.4);

    this.time.delayedCall(
      (this.game.config.width / spaceConfig.asteroidSpeed) * 1000,
      () => {
        asteroid.destroy();
      }
    );
  }
  hitAsteroid(spaceship, asteroid) {
    spaceship.setVelocity(0);
    spaceship.setTint(0xff0000);
    this.physics.pause();

    this.time.delayedCall(2000, () => {
      this.scene.restart();
    });
  }
}
