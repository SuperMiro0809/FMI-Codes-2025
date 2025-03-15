const spaceshipConfig = {
    speed:200,
    width:300,
    height:400,
}

class SpaceScene extends Phaser.Scene {
  constructor() {
      super({ key: 'SpaceScene' });
  }

  preload() {
      this.load.image('space-background', 'assets/space-background.jpg');
      this.load.image('spaceship', 'assets/spaceship.png');
  }

  create() {
      this.bg = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, 'space-background')
          .setOrigin(0, 0)
          .setScrollFactor(0);
 
      this.spaceship = this.physics.add.sprite(100, this.game.config.height / 2, 'spaceship').setOrigin(0.5);
      this.spaceship.setCollideWorldBounds(true);

      this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
      this.bg.tilePositionX -= 2;

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
}
