class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  preload() {
    this.load.image('space-bg', 'assets/space-background.jpg');
  }

  create() {
    // full screen background
    const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'space-bg');
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(scaleX, scaleY);

    const titleText = this.add.text(this.scale.width / 2, 350, 'Galactic Science Quest', { fontSize: '6rem', fontFamily: 'Luxomona' })
      .setOrigin(0.5);

    this.titleText = titleText;
    this.gradientShift = 0;

    const startBtn = this.add.text(this.scale.width / 2, 500, '▶️ Start Exploring', {
      fontSize: '2.6rem',
      fontFamily: 'Orbitron',
      fill: '#00ff88',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 10, y: 8 },
      borderRadius: '8px'
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // hover effect (scale)
    startBtn.on('pointerover', () => {
      startBtn.setScale(1.1);
    });

    startBtn.on('pointerout', () => {
      startBtn.setScale(1.0);
    });

    // scene switcher
    startBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        // this.scene.start('IntroductionScene');
        this.scene.start("SpaceScene", {leftPlanet:"technoPlanet", rightPlanet:"physicsPlanet"})
      });
    });
  }

  update(time, delta) {
    this.gradientShift += delta * 0.2; // speed of animation

    if (this.gradientShift > this.titleText.width) {
      this.gradientShift = 0;
    }

    const gradient = this.titleText.context.createLinearGradient(
      this.gradientShift, 0,
      this.gradientShift + this.titleText.width, 0
    );

    gradient.addColorStop(0, '#FFBF00');  // amber
    gradient.addColorStop(0.3, '#FFEA00'); // gold
    gradient.addColorStop(1, '#FFBF00');  // amber again

    this.titleText.setFill(gradient);

    // refresh text to show changes
    this.titleText.setText(this.titleText.text);
  }
}
