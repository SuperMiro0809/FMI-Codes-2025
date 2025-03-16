class LeavingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LeavingScene' });
  }

  preload() {
    this.load.image('geologyBackImage', 'assets/geologyPlanet/background.jpg');
    this.load.image('avatar', 'assets/spaceship.png'); 
    this.load.image('alien', 'assets/aliens/blue.png');
    this.load.image('geologyAlien', 'assets/aliens/dark-gray.png');
    this.load.image('technologyAlien', 'assets/aliens/masked.png');
    
    this.load.spritesheet('character', 'assets/AstronautPlayerProfile.png', {
      frameWidth: 32, 
      frameHeight: 48   
    });
  }

  create(data) {
    const { width, height } = this.sys.game.canvas;
    const planet = data.from;

    let alienAsset = '';
    let planetBackground = '';

    switch (planet) {
      case 'geologyPlanet':
        alienAsset = 'geologyAlien';
        planetBackground = 'geologyBackImage';
        break;
      case 'technoPlanet':
        alienAsset = 'technologyAlien';
        planetBackground = 'geologyBackImage';
        break;
    }

    const backImage = this.add.image(width / 2, height / 2, planetBackground).setOrigin(0.5);
    const bgScale = Math.max(width / backImage.width, height / backImage.height);
    backImage.setScale(bgScale).setScrollFactor(0);

    this.avatar = this.physics.add.sprite(this.game.config.width - 250, height / 1.4, 'avatar').setOrigin(0.5);
    this.avatar.setScale(2.2); 

    this.alien = this.physics.add.sprite(300, height / 1.25, alienAsset).setOrigin(0.5);
    this.alien.setScale(0.3);

    this.character = this.physics.add.sprite(300, height / 1.2, 'character').setOrigin(0.5);
    this.character.setScale(2);

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }), 
      frameRate: 8,
      repeat: -1
    });

    this.startCharacterWalk(data);
  }

  startCharacterWalk(data) {
    this.character.play('walk');

    this.tweens.add({
      targets: this.character,
      x: this.sys.game.canvas.width - 270, 
      duration: 3000,
      ease: 'Linear',
      onComplete: () => {
        this.character.destroy(); 
        
        this.tweens.add({
          targets: this.avatar,
          y: -this.avatar.height,
          duration: 2000,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            this.scene.start("SpaceScene", {leftPlanet:data.from, rightPlanet:data.to});
          }
        });
      }
    });
  }
}
