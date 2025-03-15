class IntroductionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroductionScene' });
  }

  preload() {
    this.load.image('space-bg', 'assets/space-background.jpg');
    this.load.audio('bg-music', 'assets/audio/Star_Wars_theme.mp3');
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // add background music
    const music = this.sound.add('bg-music', { loop: false, volume: 0.5 });
    music.play();

    // full screen background
    const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'space-bg');
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(scaleX, scaleY);

    const crawlText = `
      SPACE CONQUER 2

      It is a dark time for planet Earth. Centuries of greed and conflict have triggered an environmental catastrophe. Oceans rise, deserts spread, and the air grows toxic. Humanity's time is quickly running out.

      Hope emerges from the ancient Elyrians, an advanced civilization rumored to have solved similar crises through their wisdom and technology.

      In a final act of desperation, Earth launches Project Lumina, entrusting you, Captain of the starship Aurora, to journey across uncharted galaxies, uncover Elyrian secrets, and harness their knowledge.

      Each distant world presents trials that test your scientific skills, courage, and wisdom. Dangerous phenomena and mysterious relics guard the path forward.

      The Elyrians' wisdom is Earth's last hope. Unlock their secrets, harness their advanced technology, and return to restore Earth's ecological balance.

      The future of humanity depends on you.
      The galaxy counts on you...
    `;

    const text = this.add.text(this.scale.width / 2, this.scale.height + 1400, crawlText, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '48px',
      fill: '#FFD700',
      align: 'center',
      wordWrap: { width: 1600, useAdvancedWrap: true }
    }).setOrigin(0.5);

    text.setScale(1, 2);
    text.setAlpha(1);

    // crawl with smooth scale-down effect
    this.tweens.add({
      targets: text,
      y: -600,
      scaleX: 0.5,
      scaleY: 0.1,
      duration: 52000,
      ease: 'Linear',
      onComplete: () => {
        music.stop();
        this.scene.start('PlanetChemistryScene');
      }
    });

    // fade-out only at the top end
    this.time.delayedCall(64000, () => {
      this.tweens.add({
        targets: text,
        alpha: 0,
        duration: 4000,
        ease: 'Linear'
      });
    });

    this.time.delayedCall(48000, () => {
      music.stop();
      this.scene.start('PlanetChemistryScene');
    });

    const skipBtn = this.add.text(this.scale.width - 20, this.scale.height - 20, 'SKIP →', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 8, y: 5 }
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

    skipBtn.on('pointerover', () => {
      this.tweens.add({
        targets: skipBtn,
        scale: 1.2,
        duration: 200,
        ease: 'Power2'
      });
      skipBtn.setStyle({ fill: '#FFFF00' });
    });

    skipBtn.on('pointerout', () => {
      this.tweens.add({
        targets: skipBtn,
        scale: 1.0,
        duration: 200,
        ease: 'Power2'
      });
      skipBtn.setStyle({ fill: '#FFFFFF' });
    });

    skipBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        music.stop();
        this.scene.start('PlanetChemistryScene');
      });
    });
  }
}
