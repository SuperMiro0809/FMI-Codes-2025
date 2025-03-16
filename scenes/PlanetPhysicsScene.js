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
    this.currentGetElement;
    this.neededItemToCollect = 5;
  }

	preload() {
		this.load.image("background", "assets/physicsBackground.jpg");
		this.load.spritesheet('item', 'assets/PotionsPack2.png', {
			frameWidth: 32,
			frameHeight: 32
		});
		//load spritesheet for the player
		this.load.spritesheet('player', 'assets/Astronaut Player.png', {
			frameWidth: 32,
			frameHeight: 53
		});
		this.load.image("platform", "assets/tile2.png");
	}

  create() {
		this.anims.create({
			key: 'run',
			frames: this.anims.generateFrameNumbers('player', { start: 8, end: 15 }), // Frames 0-5 from the new spritesheet
			frameRate: 40,
			repeat: -1
		});
	
		this.bc = this.add.image(window.innerWidth, window.innerHeight, 'background').setOrigin(1, 1);
		this.bc.setDisplaySize(window.innerWidth, window.innerHeight);
		
    this.cameras.main.fadeIn(1000);
		this.texts = [];
    this.isAlive = true;
    this.counterItem = 0;
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
			// this.player.setCollideWorldBounds(true); // Prevent player from falling out of the world
			this.player.setGravityY(this.gravity); // Set gravity
			this.player.scale = 1.5;
			this.player.setSize(26, 30);
			this.player.setPushable(true);
			
			this.addPlatform(0, 0, this.maxCols + 1);
			this.addGround(this.maxRows - 1);
			// this.addGround(0);
			this.addRandomPlatforms();

    this.jumpStrength = this.add
      .text(this.player.x, this.player.y - 36, "", {
        fontSize: "25px",
		fontFamily: 'Orbitron',
        fill: "#ffffff",
      })
      .setOrigin(0.5);
    this.currentGetElement = this.add.text(80, 50, "Collected Items: 0/5", {
      fontSize: "25px",
	  fontFamily: 'Orbitron',
      fill: "#ffffff",
    });
    this.jumpStrength.setDepth(10);

    this.addRandomPlatforms();

			this.physics.add.collider(this.player, this.platforms);

			this.cursors = this.input.keyboard.createCursorKeys();

			// Generate platforms every 2 seconds

			setInterval(() => {
				this.addPlatform(this.maxCols, 0, 1);
			}, 150);
			setInterval(() => {
				this.addRandomPlatforms();
				this.addGround(this.maxRows - 1, false);
			}, 2000);
		}

  // Function to collect items
  collectItem(player, item) {
    item.disableBody(true, true); // Hide the item
    this.inventory = item.value; // Increase jump strength
    this.jumpStrength.setText("Jump Strength:" + this.inventory * 100 + "%");
    let newGravity = this.gravity * this.inventory; // Adjust gravity
    this.texts.forEach((text, index) => {
      if (text.id === item.id) {
        text.destroy();
        // Remove the item from the array
        this.texts.splice(index, 1);
      }
    });
    this.physics.world.gravity.y = newGravity;
    this.counterItem++;
    this.currentGetElement.setText(
      "Collected Items: " + this.counterItem + "/" + this.neededItemToCollect
    );
  }

		addRandomPlatforms() {
			for (let i = 1; i < 10; i++) {
				this.addPlatform(
					this.maxCols + i * 6, // Start generating beyond the screen
					Math.floor(Math.random() * (this.maxRows - 6)) + 3,
					Math.floor(Math.random() * 3) + 3
				);
			}
			this.lastGeneratedX = this.maxCols; // Keep track of last X position
		}

		addGround(y, isFirst = true) {
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
					if(isFirst) {
						this.addPlatform(i, y, 1); 
					} else {
						this.addPlatform(i + this.maxCols + 1, y, 1);

					}
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
				let item = this.items.create(platform.x, platform.y - 30, "item", 58);
				//scale
				item.setScale(1.5);
				item.setSize(20, 20);
      	item.id = id;

				item.setData("platform", platform);
	
				item.value = Phaser.Math.FloatBetween(0.7, 1);
				item.value = parseFloat(item.value.toFixed(2));
	      let scoreText = this.add
	        .text(item.x, item.y - 36, item.value, {
	          fontSize: "25px",
			  fontFamily: 'Orbitron',
	          fill: "#ffffff",
	        })
	        .setOrigin(0.5);
	      scoreText.value = scoreText.setDepth(10);
      	scoreText.id = id;
	      this.texts.push(scoreText);

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
			if(this.player.body.velocity.x < 0) {
				this.player.flipX = true;
			} else {
				this.player.flipX = false;
			}
			this.player.anims.play('run', true);
    if (this.counterItem == this.neededItemToCollect) {
      this.scene.start(PlanetGeologyScene);
    }

    if (this.player.x < 0 || this.player.y > window.innerHeight) {
      // loose
      this.isAlive = false;
			this.cameras.main.fadeOut(1000);
      this.jumpStrength.destroy();

      this.add
        .text(this.scale.width / 2, this.scale.height / 2, "You Lost!", {
          fontSize: "32px",
          fontFamily: "Orbitron",
          fill: "#ff0000",
          backgroundColor: "#222222",
          padding: { x: 20, y: 10 },
        })
        .setOrigin(0.5)
        .setDepth(1000)
        .setScrollFactor(0);

      this.time.delayedCall(2000, () => {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.scene.restart();
      });
    }
    if (this.isAlive) {
			this.platforms.children.iterate((platform) => {
				if (!platform) return;
				const playerBounds = this.player.getBounds();
				const platformBounds = platform.getBounds();

				if (
					playerBounds.right > platformBounds.left && // Player's right side is past platform's left
					playerBounds.left < platformBounds.left + 5 && // Ensures it's a left collision
					playerBounds.bottom - 32 > platformBounds.top && // Player is within platform's vertical range
					playerBounds.top + 32 < platformBounds.bottom
				) {
					this.player.setVelocityX(0);
					this.player.x = platformBounds.left - playerBounds.width / 2;
				}
			if (
				playerBounds.right > platformBounds.left && // Player's right side is past platform's left
				playerBounds.left < platformBounds.left + 5 && // Ensures it's a left collision
				playerBounds.bottom - 32 > platformBounds.top && // Player is within platform's vertical range
				playerBounds.top  + 32< platformBounds.bottom
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
        this.player.setVelocityY(-this.gravity * this.inventory - this.gravity);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(this.gravity * this.inventory);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.gravity);
      } else if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.gravity);
      }
      this.jumpStrength.setPosition(this.player.x, this.player.y - 36);
    }
  }
}
