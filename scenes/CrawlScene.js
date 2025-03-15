 class CrawlScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CrawlScene' });
    console.log('something');
  }

  preload() {
   this.load.image('backImage', 'assets/AlchemyPrest.PNG');

   this.load.spritesheet('alien', 'assets/alien.png', {
            frameWidth: 32,  
            frameHeight: 32  
        });
  }

  create() {  const { width, height } = this.sys.game.canvas;
  const backImage = this.add.image(width / 2, height / 2, 'backImage').setOrigin(0.5);

  const bgScale = Math.max(width / backImage.width, height / backImage.height);
  backImage.setScale(bgScale).setScrollFactor(0);

  const gameWidth = this.scale.width;
  const gameHeight = this.scale.height;

  this.alien = this.physics.add.sprite(gameWidth + 50, gameHeight / 1.2, 'alien').setOrigin(0.5);
  this.alien.setScale(4);

  this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('alien', { start: 0, end: 9 }), // Adjust frame range
      frameRate: 10,
      repeat: -1
  });

  this.alien.anims.play('walk', true);

  this.tweens.add({
      targets: this.alien,
      x: gameWidth / 1.5,
      duration: 2000, 
      ease: 'Linear',
      onComplete: () => { 
          this.alien.anims.stop();
          this.createSpeechBubble(this.alien.x, this.alien.y - 100, 
              "Traveler, welcome to Planet Alchemy—\na world where untapped elements pulse beneath its shifting surface.");
          this.time.delayedCall(4000, () => {
              this.createSpeechBubble(this.alien.x, this.alien.y - 100, 
                  "Hover over the flasks to reveal clues.\nUse the dropdowns to match the correct elements.");
                  this.cameras.main.fadeOut(3500);
                  this.time.delayedCall(2000, () => this.scene.start('PlanetChemistryScene'));
          });
      }
  });
}

createSpeechBubble(x, y, text) {
  const bubbleWidth = 220;
  const bubbleHeight = 80;
  const padding = 10;
  const pointerSize = 10;

  if (this.currentBubble) {
      this.currentBubble.destroy();
      this.currentText.destroy();
  }

  this.currentBubble = this.add.graphics();
  this.currentBubble.fillStyle(0xffffff, 1); 
  this.currentBubble.fillRoundedRect(x - bubbleWidth / 2, y - bubbleHeight / 2, bubbleWidth, bubbleHeight, 16);
  this.currentBubble.lineStyle(2, 0x000000, 1); 
  this.currentBubble.strokeRoundedRect(x - bubbleWidth / 2, y - bubbleHeight / 2, bubbleWidth, bubbleHeight, 16);

  this.currentBubble.fillTriangle(
      x - 10, y + bubbleHeight / 2 - 5,
      x + 10, y + bubbleHeight / 2 - 5,
      x, y + bubbleHeight / 2 + pointerSize
  );

  this.currentText = this.add.text(x, y, text, {
      fontSize: '14px',
      color: '#000000',
      align: 'center',
      fontFamily: 'Arial',
      wordWrap: { width: bubbleWidth - padding * 2 }
  }).setOrigin(0.5);
  }
}

