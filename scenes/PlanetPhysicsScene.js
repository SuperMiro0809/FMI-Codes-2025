class PlanetPhysicsScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlanetPhysicsScene" });
    this.score = 0;
    this.inventory = 1;
    this.gravity = 160;
    this.tileSize = 32;
    this.cameraSpeed = 3;
    this.lastGeneratedX = 0; // Track the last generated platform position
  }
 
  preload() {
    this.load.image("player", "assets/tile_stone.png");
    this.load.image("platform", "assets/tile.png");
  }
 
  create() {
    this.cameras.main.fadeIn(1000);
 
    this.maxRows = Math.floor(innerHeight / this.tileSize);
    this.maxCols = Math.floor(innerWidth / this.tileSize);
 
    // Use a dynamic physics group for platforms (to allow collision)
    this.platforms = this.physics.add.group({
      allowGravity: false, // Platforms should not fall
      immovable: true, // Platforms should not move when collided
    });
 
    this.addGround(this.maxRows - 1);
    this.addGround(0);
    this.addRandomPlatforms();
 
    // Create player
    this.player = this.physics.add.sprite(250, 100, "player");
    this.player.setCollideWorldBounds(true); // Prevent player from falling out of the world
    this.player.setGravityY(this.gravity); // Set gravity
		this.player.setPushable(true);
 
    // Add collision detection between player and platforms
    this.physics.add.collider(this.player, this.platforms);
 
    this.scoreText = this.add
      .text(this.player.x, this.player.y - 10, "", {
        fontSize: "32px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
 
    this.cursors = this.input.keyboard.createCursorKeys();
 
    // Generate platforms every 2 seconds
    setInterval(() => {
      this.addRandomPlatforms();
    }, 2000);
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
 
  addPlatform(x, y, width) {
    for (let i = 0; i < width; i++) {
      let tile = this.platforms.create(
        (x + i) * this.tileSize,
        y * this.tileSize,
        "platform"
      );
      tile.setOrigin(0);
      tile.setData("destroyed", false);
      tile.setImmovable(true); // Make sure platforms don't move
    }
  }
 
  update() {
		this.platforms.children.iterate((platform) => {
			if (!platform) return;
	
			const playerBounds = this.player.getBounds();
			const platformBounds = platform.getBounds();
	
			if (
					playerBounds.right > platformBounds.left &&  // Player's right side is past platform's left
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
	
				// Check if player is colliding with the left side of a platform
			
			}
		});
	
		// Player movement
		if (this.cursors.up.isDown) {
			this.player.setVelocityY(-160 * this.inventory);
		} else if (this.cursors.down.isDown) {
			this.player.setVelocityY(160 * this.inventory);
		}
		this.scoreText.setPosition(this.player.x, this.player.y - 30);
	}
	
}