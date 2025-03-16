const spaceshipConfig = {
  speed: 200,
  spaceshipScale: 0.8,
};

const spaceConfig = {
  asteroidSpeed: 100,
  asteroidScale: 2,
  asteroidImages: 4,
  asteroidSpawnOffset: 300,
  spawnInterval: 500, // in miliseconds
  planetSpeed: 100,
  planetOffset: 100,
  time: 20,
  progressBarWidth: 300,
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
    this.load.image("earth", "assets/earth/image.png")
    this.load.image("technoPlanet", "assets/technoPlanet/image.png")
    this.load.image("physicsPlanet", "assets/physicsPlanet/image.png")
    this.load.image("chemistryPlanet", "assets/chemistryPlanet/image.png")
  }
  // example data:
  // data:{
  //   leftPlanet: "", optional // earth, technoPlanet, physicsPlanet
  //   rightPlanet: "", // earth, technoPlanet, physicsPlanet
  // }

  create(data) {
    this.destination = data.rightPlanet
    this.cameras.main.fadeIn(500, 0, 0, 0);

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

    if(data.leftPlanet){
      this.leftPlanet = this.physics.add.sprite(-spaceConfig.planetOffset, this.game.config.height/2, data.leftPlanet)
      this.leftPlanet.setVelocity(-spaceConfig.planetSpeed, 0);
      this.time.delayedCall((spaceConfig.planetOffset / spaceConfig.planetSpeed)*5000, () => {
        this.leftPlanet.destroy();
      });
    }

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

    this.progress = 0;
    this.progressBar = this.add.graphics(); 
    this.progressBar.x = this.game.config.width / 4 - spaceConfig.progressBarWidth / 4; 
    this.progressBar.y = 20; 

    this.time.addEvent({
      delay: spaceConfig.time * 1000,
      callback: this.spawnRightPlanet,
      callbackScope: this,
      args: [data.rightPlanet]
    });
  }

  update(time, delta) {
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

    let progressPerFrame = (100 / (spaceConfig.time * 1000)) * delta;
    this.progress += progressPerFrame;
    if (this.progress > 100) this.progress = 100;
    this.drawProgressBar();
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
  drawProgressBar() {
    this.progressBar.clear();

    this.progressBar.fillStyle(0x444444);
    this.progressBar.fillRoundedRect(this.progressBar.x, this.progressBar.y, spaceConfig.progressBarWidth, 10, 5);

    this.progressBar.fillStyle(0x00ff00);
    this.progressBar.fillRoundedRect(this.progressBar.x, this.progressBar.y, (this.progress / 100) * spaceConfig.progressBarWidth, 10, 5);
}
  changeScene(){
    if(this.destination!="earth"){
      this.scene.start("PregameAnimation", {planet: this.destination});
    }else{
      this.scene.start("CrawlScene");
    }
  }
  spawnRightPlanet(rightPlanet = "chemistryPlanet"){
    this.rightPlanet = this.physics.add.sprite(this.game.config.width + 500, this.game.config.height/2, rightPlanet)
    this.rightPlanet.setVelocity(-spaceConfig.planetSpeed, 0);
    this.time.delayedCall((spaceConfig.planetOffset / spaceConfig.planetSpeed)*5000, () => {
      this.rightPlanet.setVelocity(0);
    });
    this.physics.add.collider(
      this.spaceship,
      this.rightPlanet,
      this.changeScene,
      null,
      this
    );
  }
}
