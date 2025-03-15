const tileSize = 40;
const worldWidth = 400;
const worldHeight = window.innerHeight + 500;
const playerSpeed = 100;
const changeOfCrystals = 0.1;
const cameraSpeed = 0.5;
const miningTime = 750;
const changeOfStone = 0.25;

class PlanetGeologyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlanetGeologyScene' });
  }
	preload() {
		this.load.spritesheet('player', 'assets/miner.png', {frameWidth: 32, frameHeight: 32});
		// this.load.spritesheet('ground', 'assets/tiles.png', {frameWidth: 16, frameHeight: 16});
		this.load.image('ground_top', 'assets/tile.png');
		this.load.image('ground_plain', 'assets/tile_normal.png');
		this.load.image('ground_crystals', 'assets/tile_gems.png');
		this.load.image('ground_stone', 'assets/tile_stone.png');
  }
	getTilePlayerIsOn() {
    const playerX = this.player.x + 16;
    const playerY = this.player.y + 16;
    const tileX = Math.floor((playerX - this.startX) / tileSize);
    const tileY = Math.floor((playerY - this.startY) / tileSize) + 1;

		if (tileX >= 0 && tileX < this.groundXLength && tileY >= 0 && tileY < this.groundYLength) {
      const tileIndex = tileY * this.groundXLength + tileX;
      return tileIndex;
    } else {
      return null;
    }
	}
	createTileRow(j, length, obj) {
		let groundTile;
		for(let i = 0; i < length; i++) {
			if(j == 0){
				groundTile = this.ground.create(this.startX +  i * (tileSize), this.startY +  j * (tileSize), 'ground_top');
				obj.hasPath = true;
			} else if(Math.random() < changeOfStone){
					groundTile = this.ground.create(this.startX +  i * (tileSize), this.startY +  j * (tileSize), 'ground_stone');
			} else if(Math.random() < changeOfCrystals) {
				groundTile = this.ground.create(this.startX +  i * (tileSize), this.startY +  j * (tileSize), 'ground_crystals');
				obj.hasPath = true;
			} else {
				groundTile = this.ground.create(this.startX +  i * (tileSize), this.startY +  j * (tileSize), 'ground_plain');
				obj.hasPath = true;
			}
			groundTile.setScale((tileSize) / 32);
			groundTile.refreshBody();
		}
	}
	create() {
		this.cameras.main.fadeIn(1000);
		this.crystalsCount = 0;
		this.isAlive = true;
    this.player = this.physics.add.sprite((window.innerWidth + tileSize) / 2, 100, 'player');
		this.player.setSize(18, 32);
		this.player.setOffset(7, 0);
		this.player.setScale(1.1);
		this.timer = 0;
		this.ground = this.physics.add.staticGroup();
		this.groundXLength = Math.floor(worldWidth / tileSize) + 2;
		this.groundYLength = Math.floor(worldHeight / tileSize) + 2;
		this.startX = window.innerWidth / 2 - worldWidth / 2;
		this.startY = 200;

		for(let i = 0; i < this.groundYLength; i++){
			let obj = {hasPath: false};
			do {
				this.createTileRow(i, this.groundXLength, obj);
			} while(!obj.hasPath);

		}
		
		this.physics.add.collider(this.player, this.ground);
		this.player.setCollideWorldBounds(true);
		this.player.setGravityY(300);

		this.scoreText = this.add.text(35, 35, "Mined crystals: " + this.crystalsCount, {
			fontSize: '32px',
			fill: '#ffffff',
			fontFamily: 'PixelRoundedFont',
		});
		this.scoreText.setScrollFactor(0);
    // Add animations
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', { start: 1, end: 1 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'mine_down',
      frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'run_left',
      frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

		this.anims.create({
      key: 'mine_left',
      frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
      frameRate: 10,
      repeat: -1
    });

		this.anims.create({
      key: 'run_right',
      frames: this.anims.generateFrameNumbers('player', { start: 12, end: 14 }),
      frameRate: 10,
      repeat: -1
    });
		this.anims.create({
      key: 'mine_right',
			frames: this.anims.generateFrameNumbers('player', { start: 15, end: 17 }),
      frameRate: 10,
      repeat: -1
    });

    // Add keys for input
    this.cursors = this.input.keyboard.createCursorKeys(); 
  }
	updateGrid() {
		let firstRowY = this.startY;
		let firstRowTiles = this.ground.getChildren().filter(tile => {
			return tile.y === firstRowY;
		});
		this.startY += tileSize;

		firstRowTiles.forEach(tile => {
			tile.destroy();
		});	
		//create new row at the bottom
		let obj = {hasPath: false};
		do {
			this.createTileRow(this.groundYLength - 1, this.groundXLength, obj);
		} while(!obj.hasPath);
	
	};
	removeTile(index) {
    const tile = this.ground.children.entries[index];	
    tile.setActive(false).setVisible(false).disableBody(true, true); 
    // tile.destroy(); 
  }

  update(time, delta) {
		this.time.delayedCall(10000, () => {
			this.timer += 1;
			if(this.timer % 87 == 0) {
				this.updateGrid();
			}
		});
		this.time.delayedCall(2000, () => {			
			if(this.isAlive) {
				this.cameras.main.scrollY += cameraSpeed;
			}
		});
		if(this.cameras.main.scrollY - this.player.y > 0) {
			// this.isAlive = false;
		}
    let tilePlayer = this.getTilePlayerIsOn();
		
    if(this.isAlive) {
			if (this.cursors.right.isDown) {
				// Check if we can move to the right or need to mine
				if (tilePlayer < this.groundXLength || !this.isTileActive(tilePlayer + 1 - this.groundXLength)) {
					// Player moves right
					this.player.anims.play('run_right', true);
				} else {
					// Player mines to the right
					this.player.anims.play('mine_right', true);
					this.handleMining(this.cursors.right, tilePlayer + 1 - this.groundXLength); // Tile to the right
				}
				this.player.setVelocityX(playerSpeed);
		
				// Prevent player from moving off screen to the right
				if (this.player.x > window.innerWidth / 2 + worldWidth / 2 + 32) {
					this.player.setVelocityX(0);
				}
		} else if (this.cursors.left.isDown) {
				// Check if we can move to the left or need to mine
				if (tilePlayer < this.groundXLength || !this.isTileActive(tilePlayer - 1 - this.groundXLength)) {
						// Player moves left
						this.player.anims.play('run_left', true);
				} else {
						// Player mines to the left
						this.player.anims.play('mine_left', true);
						this.handleMining(this.cursors.left, tilePlayer - 1 - this.groundXLength); // Tile to the left
				}
				this.player.setVelocityX(-playerSpeed);
		
				// Prevent player from moving off screen to the left
				if (this.player.x < window.innerWidth / 2 - worldWidth / 2) {
						this.player.setVelocityX(0);
				}
		} else if (this.cursors.down.isDown) {
				// Player mines downward
				this.player.anims.play('mine_down', true);
				this.handleMining(this.cursors.down, tilePlayer); // Current tile
		} else {
				// Player idle when no keys are pressed
				this.player.anims.play('idle', true);
				this.player.setVelocityX(0);
		}
		
		} else {
			this.player.anims.play('idle', true);
			//lost
		}
	}

	isTileActive(index) {
		return this.ground.children.entries[index] && this.ground.children.entries[index].active;
	}

	handleMining(key, tileIndex) {
		if (Phaser.Input.Keyboard.JustDown(key)) {
				key.mineStartTime = this.time.now; 
		}
		
		if (this.time.now - key.mineStartTime > miningTime) {
			if(this.ground.children.entries[tileIndex].texture.key == 'ground_crystals') {
				this.crystalsCount++;
				
				if(this.crystalsCount == 5) {
					//won
					this.cameras.main.fadeOut(1000);
				}
				this.scoreText.setText("Mined crystals: " + this.crystalsCount);
			}
			if(this.ground.children.entries[tileIndex].texture.key != 'ground_stone') {
				this.removeTile(tileIndex);
				key.mineStartTime = this.time.now; 
			}
		}
	}

}