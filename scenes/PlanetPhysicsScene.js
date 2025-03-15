class PlanetPhysicsScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlanetPhysicsScene" });
    this.score = 0;
    this.scoreText = "";
    this.inventory = 1;
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

    // Create a static ground for collision detection
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 580, "ground").setScale(2).refreshBody(); // Ground at the bottom of the screen

    // Scale it to fit the canvas (if necessary)
    bg.setDisplaySize(window.innerWidth, window.innerHeight);
    this.player = this.physics.add.sprite(window.innerWidth / 2, 100, "player");
    this.player.setSize(60, 62);
    this.player.setScale(0.5);
    this.player.setCollideWorldBounds(true); // Stops at screen edges

    this.scoreText = this.add
      .text(this.player.x, this.player.y - 10, "", {
        fontSize: "32px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    this.coins = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
      let coin = this.coins.create(200 + i * 200, 500, "item");
      coin.value = Phaser.Math.FloatBetween(0, 1);
      coin.value = parseFloat(coin.value.toFixed(2));
      this.physics.add.overlap(this.player, coin, this.collectItem, null, this);
    }

    // this.physics.add.overlap(
    //   this.player,
    //   this.coins,
    //   this.collectItem,
    //   null,
    //   this
    // );

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // Move up
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-160 * this.inventory);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160 * this.inventory);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    }
    this.scoreText.setPosition(this.player.x, this.player.y - 30);
  }
  // Function to collect coins
  collectItem(player, coin) {
    coin.disableBody(true, true); // Hide the coin
    this.inventory = coin.value; // Increase score
    this.scoreText.setText("Score:" + this.inventory);
    let newGravity = 160 * this.inventory; // Adjust gravity
    this.physics.world.gravity.y = newGravity;
    console.log("Gravity=" + this.physics.world.gravity.y);
    console.log("SCORE UPP=" + this.inventory);
  }
}
