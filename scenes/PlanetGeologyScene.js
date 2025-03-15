const tileSize = 40;
const worldWidth = 400;
const worldHeight = window.innerHeight - 200;
const playerSpeed = 100;
const changeOfCrystals = 0.1;
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
        const tileIndex = tileX * this.groundYLength + tileY;
        return tileIndex;
    } else {
        return null;
    }
	}
	create() {
		this.crystalsCount = 0;
    this.player = this.physics.add.sprite((window.innerWidth + tileSize) / 2, 100, 'player');
		this.player.setSize(18, 32);
		this.player.setOffset(7, 0);
		this.player.setScale(1.1);
		this.ground = this.physics.add.staticGroup();
		this.groundXLength = Math.floor(worldWidth / tileSize) + 2;
		this.groundYLength = Math.floor(worldHeight / tileSize) + 2;
		this.startX = window.innerWidth / 2 - worldWidth / 2;
		this.startY = 200;

		for(let i = 0; i < this.groundXLength; i++){
			for(let j = 0; j < this.groundYLength; j++){	
				let groundTile;
				if(j == 0){
					groundTile = this.ground.create(this.startX +  i * (tileSize), this.startY +  j * (tileSize), 'ground_top', 6 * 33 + 6);
				} else if(Math.random() < changeOfStone){
					groundTile = this.ground.create(this.startX +  i * (tileSize), this.startY +  j * (tileSize), 'ground_stone', 6 * 33 + 6);
				} else if(Math.random() < changeOfCrystals) {
					groundTile = this.ground.create(this.startX +  i * (tileSize), this.startY +  j * (tileSize), 'ground_crystals', 6 * 33 + 6);
				} else {
					groundTile = this.ground.create(this.startX +  i * (tileSize), this.startY +  j * (tileSize), 'ground_plain', 6 * 33 + 6);
				}
				groundTile.setScale((tileSize) / 32);
				groundTile.refreshBody();
			}	
		}
		
		this.physics.add.collider(this.player, this.ground);
		this.player.setCollideWorldBounds(true);
		// this.player.setBounce(0.2);
		this.player.setGravityY(300);

		this.scoreText = this.add.text(50, 30, "Mined crystals: " + this.crystalsCount, {
			fontSize: '32px',
			fill: '#ffffff',
			fontFamily: 'PixelRoundedFont',
	});
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
    this.cursors = this.input.keyboard.createCursorKeys();  // This will give you up, down, left, right keys
  }
	removeTile(index) {
    const tile = this.ground.children.entries[index];	
    tile.setActive(false).setVisible(false).disableBody(true, true); 
    // tile.destroy(); 
  }

  update(time, delta) {
    let tilePlayer = this.getTilePlayerIsOn();

    // Moving Right
    if (this.cursors.right.isDown) {
			if (tilePlayer % this.groundYLength == 0 || !this.isTileActive(tilePlayer + this.groundYLength - 1)) {
				this.player.anims.play('run_right', true);
			} else {
				this.player.anims.play('mine_right', true);
				this.handleMining(this.cursors.right, tilePlayer + this.groundYLength - 1);
			}
			this.player.setVelocityX(playerSpeed);
			if (this.player.x > window.innerWidth / 2 + worldWidth / 2) {
				this.player.setVelocityX(0);
			}
    } else if (this.cursors.left.isDown) {
			if (tilePlayer % this.groundYLength == 0 || !this.isTileActive(tilePlayer - this.groundYLength - 1)) {
				this.player.anims.play('run_left', true);
			} else {
				this.player.anims.play('mine_left', true);
				this.handleMining(this.cursors.left, tilePlayer - this.groundYLength - 1);
			}
			this.player.setVelocityX(-playerSpeed);
			if (this.player.x < window.innerWidth / 2 - worldWidth / 2) {
				this.player.setVelocityX(0);
			}
    } else if (this.cursors.down.isDown) {
			this.player.anims.play('mine_down', true);
			this.handleMining(this.cursors.down, tilePlayer);
        
    } else {
			this.player.anims.play('idle', true);
			this.player.setVelocityX(0);
    }
	}

	isTileActive(index) {
		return this.ground.children.entries[index] && this.ground.children.entries[index].active;
	}

	handleMining(key, tileIndex) {
		if (Phaser.Input.Keyboard.JustDown(key)) {
				key.mineStartTime = this.time.now; 
		}
		
		if (this.time.now - key.mineStartTime > 750) {
			if(this.ground.children.entries[tileIndex].texture.key == 'ground_crystals') {
				this.crystalsCount++;
				this.scoreText.setText("Mined crystals: " + this.crystalsCount);
			}
			if(this.ground.children.entries[tileIndex].texture.key != 'ground_stone') {
				this.removeTile(tileIndex);
				key.mineStartTime = this.time.now; 
			}
		}
	}

}