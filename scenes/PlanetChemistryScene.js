class PlanetChemistryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlanetChemistryScene' });
  }

  create() {
    this.add.text(400, 50, 'Planet 1', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
    // Example content here

    const nextPlanetBtn = this.add.text(700, 550, 'Next Planet →', { fontSize: '20px', fill: '#0ff' })
      .setInteractive();

    nextPlanetBtn.on('pointerdown', () => {
      this.scene.start('PlanetTechnologyScene');
    });
  }
}
