class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {
    // load background image clearly here
    this.load.image('space-bg', 'assets/space-background.jpg');
  }

  create() {
    // Adding fullscreen background
    const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'space-bg');
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(scaleX, scaleY);

    // Title text clearly visible on background
    this.add.text(this.scale.width / 2, 350, 'Space Conquer 2', { fontSize: '100px', fontFamily: 'Luxomona', fill: '#FFBF00' })
      .setOrigin(0.5);

    // Styled interactive Start button
    const startBtn = this.add.text(this.scale.width / 2, 500, '▶️ Start Exploring', {
        fontSize: '42px',
        fontFamily: 'Orbitron',
        fill: '#00ff88',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 10, y: 8 },
        borderRadius: '8px'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Hover effect (scale)
    startBtn.on('pointerover', () => {
      startBtn.setScale(1.1);
    });

    startBtn.on('pointerout', () => {
      startBtn.setScale(1.0);
    });

    // Scene switcher logic
    startBtn.on('pointerdown', () => {
      this.scene.start('PlanetChemistryScene');
    });
  }
}
