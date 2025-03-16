class CrawlScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CrawlScene' });
  }

  preload() {
    this.load.image('backImage', 'assets/earth/background.png');
    this.load.image('avatar', 'assets/spaceship.png');

    this.load.spritesheet('character', 'assets/AstronautPlayerProfile.png', {
      frameWidth: 32,
      frameHeight: 48
    });
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    const backImage = this.add.image(width / 2, height / 2, 'backImage').setOrigin(0.5);
    const bgScale = Math.max(width / backImage.width, height / backImage.height);
    backImage.setScale(bgScale).setScrollFactor(0);

    this.avatar = this.physics.add.sprite(250, -100, 'avatar').setOrigin(0.5);
    this.avatar.setScale(2.2);

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.tweens.add({
      targets: this.avatar,
      y: height - 240,
      duration: 2000,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.character = this.physics.add.sprite(300, height - 130, 'character').setOrigin(0.5);
        this.character.setScale(2);
        this.character.play('walk_left')
        this.startCharacterWalk();
      }
    });
  }

  startCharacterWalk() {
    this.tweens.add({
      targets: this.character,
      x: this.sys.game.canvas.width + 100,
      duration: 5000,
      ease: 'Linear',
      onComplete: () => {
        this.showGameOver();
      }
    });
  }

  showGameOver() {
    // Game won text 
    const winText = this.add.text(
      this.sys.game.canvas.width / 2,
      this.sys.game.canvas.height / 2,
      'CONGRATILATIONS \nYOU\'VE WON THE GAME!',
      {
        fontSize: '70px',
        fontStyle: 'bold',
        color: '#009933',
        align: 'center'
      }
    ).setOrigin(0.5)
      .setShadow(5, 5, '#000', 10, true, true);

    // Set a 5-second timer to fade out the win text
    this.time.delayedCall(5000, () => {
      // Fade out the win text
      this.tweens.add({
        targets: winText,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          // After win text fades out, show scrolling credits
          this.showCredits();
        }
      });
    });
  }

  showCredits() {
    const creditsText =
      'CREDITS\n\n' +
      'DEVELOPMENT TEAM\n' +
      'Miroslav Balev\n' +
      'Mihail Dimitrov\n' +
      'Milica Lazarova\n' +
      'Maxim Hristov\n' +
      'Alex Hristov\n\n' +
      'ASSETS\n' +
      'Spaceship - https://anim86.itch.io/space-shooter-ship-constructor\n' +
      'Planets & Asteroids - https://deep-fold.itch.io/pixel-planet-generator\n' +
      'Astronaut - https://floatingkites.itch.io/cute-astronaut\n' +
      'Planet landscapes - https://www.freepik.com/\n' +
      'Music - https://archive.org/details/StarWarsThemeSongByJohnWilliams\n\n' +
      'DEVELOPED WITH\n' +
      'Phaser 3\n\n' +
      'THANK YOU FOR PLAYING!';

    // Position the credits below the bottom of the screen
    const credits = this.add.text(
      this.sys.game.canvas.width / 2,
      this.sys.game.canvas.height + 500,
      creditsText,
      {
        fontSize: '36px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 15
      }
    ).setOrigin(0.5)
      .setShadow(2, 2, '#000', 3, true, true);

    // Create a scrolling tween for the credits
    this.tweens.add({
      targets: credits,
      y: -credits.height, // Scroll until the credits disappear above the screen
      duration: 20000, // Adjust duration to control scrolling speed
      ease: 'Linear',
      onComplete: () => {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
          this.scene.start('MenuScene');
        });
      }
    });
  }
}