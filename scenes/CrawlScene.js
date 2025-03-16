class CrawlScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CrawlScene' });
  }

  preload() {
    this.load.image('backImage', 'assets/planet-background.png');
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
      y: height / 1.4, 
      duration: 2000,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.character = this.physics.add.sprite(300, height / 1.2, 'character').setOrigin(0.5);
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
      duration: 3500,
      ease: 'Linear',
      onComplete: () => {
        this.showGameOver();
      }
    });
  }

  showGameOver() {
    this.add.text(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, 'CONGRATILATIONS \nYOU\'VE WON THE GAME!', {
      fontSize: '70px',
      fontStyle: 'bold',
      color: '#009933',
      align: 'center'
    }).setOrigin(0.5)
    .setShadow(5, 5, '#000', 10, true, true);
  }
}