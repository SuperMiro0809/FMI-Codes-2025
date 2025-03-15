const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,  // scale the game to fit the window
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight
  },
  backgroundColor: '#242424',
  physics: { default: 'arcade' },
  scene: [MenuScene,PlanetTechnologyScene,CrawlScene]
};

const game = new Phaser.Game(config);
