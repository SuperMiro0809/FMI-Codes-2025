class PlanetPhysicsScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlanetPhysicsScene" });
    this.score = 0;
    this.inventory = 1;
    this.gravity = 320;
    this.tileSize = 32;
    this.cameraSpeed = 3;
    this.lastGeneratedX = 0; // Track the last generated platform position
    this.jumpStrength;
  }

  preload() {
    this.load.image("player", "assets/tile_stone.png");
    this.load.image("platform", "assets/tile.png");
  }

  create() {
    this.cameras.main.fadeIn(1000);
    this.texts = [];
    this.maxRows = Math.floor(innerHeight / this.tileSize);
    this.maxCols = Math.floor(innerWidth / this.tileSize);

    // Use a dynamic physics group for platforms (to allow collision)
    this.platforms = this.physics.add.group({
      allowGravity: false, // Platforms should not fall
      immovable: true, // Platforms should not move when collided
    });

    this.items = this.physics.add.group({
      allowGravity: false, // Item should not fall
      immovable: true, // Item should not move when collided
    });

    // Create player
    this.player = this.physics.add.sprite(250, 100, "player");
    this.player.setCollideWorldBounds(true); // Prevent player from falling out of the world
    this.player.setGravityY(this.gravity); // Set gravity
    this.player.setPushable(true);

    this.jumpStrength = this.add
      .text(this.player.x, this.player.y - 36, "", {
        fontSize: "25px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
    this.jumpStrength.setDepth(10);

    this.addGround(this.maxRows - 1);
    this.addGround(0);
    this.addRandomPlatforms();

    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard.createCursorKeys();

    // Generate platforms every 2 seconds
    setInterval(() => {
      this.addRandomPlatforms();
      this.addGround(0);
    }, 8000);
  }

  // Function to collect items
  collectItem(player, item) {
    item.disableBody(true, true); // Hide the item
    this.inventory = item.value; // Increase jump strength
    this.jumpStrength.setText("Jump Strength:" + this.inventory * 100 + "%");
    let newGravity = this.gravity * this.inventory; // Adjust gravity
    console.log(item.id);
    console.log(this.texts.filter((text) => text.id == item.id));
    this.texts.forEach((text, index) => {
      if (text.id === item.id) {
        // Destroy the Phaser sprite object from the scene
        text.destroy();

        // Remove the item from the array
        this.texts.splice(index, 1);
      }
    });
    this.physics.world.gravity.y = newGravity;
    console.log("Gravity=" + this.physics.world.gravity.y);
    console.log("SCORE UPP=" + this.inventory);
  }

  addRandomPlatforms() {
    for (let i = 1; i < 10; i++) {
      this.addPlatform(
        this.maxCols + i * 3, // Start generating beyond the screen
        Math.floor(Math.random() * (this.maxRows - 6)) + 3,
        Math.floor(Math.random() * 3) + 3
      );
    }
    this.lastGeneratedX = this.maxCols; // Keep track of last X position
  }

  addGround(y) {
    let numGaps = Math.floor(Math.random() * 3) + 1;
    let pos = [];
    for (let i = 0; i < numGaps; i++) {
      pos[i] = Math.floor(Math.random() * this.maxCols);
      for (let j = 0; j < i; j++) {
        if (Math.abs(pos[j] - pos[i]) < 5) {
          pos.pop();
          i--;
          break;
        }
      }
    }

    for (let i = 0; i < this.maxCols; i++) {
      let isGap = false;
      for (let j = 0; j < numGaps; j++) {
        if (Math.abs(i - pos[j]) < Math.floor(Math.random() * 2) + 2) {
          isGap = true;
          break;
        }
      }
      if (!isGap) {
        this.addPlatform(i, y, 1);
      }
    }
  }

  generateID(length = 8) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  addPlatform(x, y, width) {
    let platform;
    for (let i = 0; i < width; i++) {
      platform = this.platforms.create(
        (x + i) * this.tileSize,
        y * this.tileSize,
        "platform"
      );
      platform.setOrigin(0);
      platform.setData("destroyed", false);
      platform.setImmovable(true);
    }
    if (Phaser.Math.FloatBetween(0, 1) > 0.9) {
      const id = this.generateID();
      let item = this.items.create(platform.x, platform.y - 30, "item");
      item.id = id;
      item.setData("platform", platform);

      item.value = Phaser.Math.FloatBetween(0.5, 1);
      item.value = parseFloat(item.value.toFixed(2));
      let scoreText = this.add
        .text(item.x, item.y - 36, item.value, {
          fontSize: "25px",
          fill: "#ffffff",
        })
        .setOrigin(0.5);
      scoreText.value = scoreText.setDepth(10);
      scoreText.id = id;
      this.texts.push(scoreText);
      console.log(scoreText);

      if (this.player && item) {
        this.physics.add.overlap(
          this.player,
          item,
          this.collectItem,
          null,
          this
        );
      }
    }
  }

  update() {
    this.platforms.children.iterate((platform) => {
      if (!platform) return;

      const playerBounds = this.player.getBounds();
      const platformBounds = platform.getBounds();

      if (
        playerBounds.right > platformBounds.left && // Player's right side is past platform's left
        playerBounds.left < platformBounds.left + 5 && // Ensures it's a left collision
        playerBounds.bottom > platformBounds.top && // Player is within platform's vertical range
        playerBounds.top < platformBounds.bottom
      ) {
        this.player.setVelocityX(0);
        this.player.x = platformBounds.left - playerBounds.width / 2;
      }
    });

    this.platforms.children.iterate((child) => {
      if (child) {
        child.x -= this.cameraSpeed; // Move platforms left

        // Remove platforms that go off-screen
        if (child.x < -this.tileSize) {
          this.platforms.remove(child, true, true); // Remove from physics group and destroy
        }
      }
    });
    this.texts.forEach((text) => {
      text.x -= this.cameraSpeed;
    });
    this.items.children.iterate((item) => {
      if (item) {
        let platform = item.getData("platform");
        if (platform) {
          item.x = platform.x; // Keep item aligned with platform
        }
        item.x -= this.cameraSpeed; // Move item left
        // Remove items that go off-screen
        if (item.x < -this.tileSize) {
          this.items.remove(item, true, true);
        }
      }
    });

    // Player movement
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-this.gravity * this.inventory);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.gravity * this.inventory);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.gravity);
    } else if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.gravity);
    }
  }
}
