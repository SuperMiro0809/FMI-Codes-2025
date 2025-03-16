class PregameAnimation extends Phaser.Scene {
  constructor() {
      super({ key: 'PregameAnimation' });
  }

  preload() {
      this.load.image('backImage', 'assets/planet-background.png');
      this.load.image('avatar', 'assets/spaceship.png'); 
      this.load.image('alien', 'assets/aliens/blue.png'); 
      
      this.load.spritesheet('character', 'assets/AstronautPlayerProfile.png', {
          frameWidth: 32,
          frameHeight: 48
      });
  }

  create(data) {
      const { width, height } = this.sys.game.canvas;

      this.currentPlanet = data.planet;
      const backImage = this.add.image(width / 2, height / 2, 'backImage').setOrigin(0.5);
      const bgScale = Math.max(width / backImage.width, height / backImage.height);
      backImage.setScale(bgScale).setScrollFactor(0);

      this.avatar = this.physics.add.sprite(250, -100, 'avatar').setOrigin(0.5);
      this.avatar.setScale(2.5);

      this.alien = this.add.image(width - 350, height / 1.22, 'alien'); 
      this.alien.setScale(0.25);
      this.alien.setFlipX(true); 

      // ✅ Create character walking animation
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
              this.character.setScale(3);
              this.character.play('walk');
              this.startCharacterWalk();
          }
      });
  }

  startCharacterWalk() {
    this.tweens.add({
        targets: this.character,
        x: this.sys.game.canvas.width * (2/3), // Moves to two-thirds of the screen width
        duration: 3000,
        ease: 'Linear',
        onComplete: () => {
            this.character.play('walk'); 
            this.createSpeechBubble(this.alien.x, this.alien.y - 110, "Almost there!"); 
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
      this.currentBubble.fillStyle(0xb3b3cb, 1);
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
          color: '#0a0a0f',
          align: 'center',
          fontFamily: 'Arial',
          wordWrap: { width: bubbleWidth - padding * 2 }
      }).setOrigin(0.5);
  }
}
