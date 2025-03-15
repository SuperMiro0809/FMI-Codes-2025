class PlanetPhysicsScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlanetPhysicsScene" });
  }

  preload() {
    this.load.image("bg", "assets/background.png");
    this.load.image("player", "assets/Capture.png");
    this.load.image("item", "assets/item.png");
  }

  create() {
    this.cameras.main.fadeIn(1000);
    this.physics.world.setBounds(0, 0, 800, 600);
    this.add
      .text(50, 50, "Planet 4", { fontSize: "32px", fill: "#ffffff" })
      .setOrigin(0.5);
    let bg = this.add.image(400, 300, "bg");

    // Scale it to fit the canvas (if necessary)
    bg.setDisplaySize(window.innerWidth, window.innerHeight);
    this.player = this.physics.add.sprite(window.innerWidth / 2, 100, "player");
    this.player.setSize(10, 32);
    this.player.setOffset(7, 0);
    this.player.setScale(0.5);
    this.player.setCollideWorldBounds(true); // Stops at screen edges

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // Move up
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
    }
  }
}
