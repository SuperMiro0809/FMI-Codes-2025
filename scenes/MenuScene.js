class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.add.text(400, 200, 'Main Menu', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
    const startBtn = this.add.text(400, 300, 'Start Game', { fontSize: '24px', fill: '#0f0' })
      .setOrigin(0.5)
      .setInteractive();

    startBtn.on('pointerdown', () => {
      this.scene.start('CrawlScene');
    });
  }
}
