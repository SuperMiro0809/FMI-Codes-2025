const tileSize = 32;
const worldWidth = 400;
const worldHeight = 1000;
const playerSpeed = 100;

class PlanetGeologyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlanetGeologyScene' });
  }
	preload() {
    //load miner.webp as a sprite
		this.load.spritesheet('player', 'assets/miner.png', {frameWidth: tileSize, frameHeight: tileSize});

  }
	create() {
		// this.physics.world.gravity.y = 300;
		
    this.player = this.physics.add.sprite((window.innerWidth + tileSize) / 2, 100, 'player');
		
		this.physics.add.collider(this.player, this.ground);
		this.player.setCollideWorldBounds(true);
		this.player.setBounce(0.2);
		this.player.setGravityY(300);


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

  update(time, delta) {
		if (this.cursors.right.isDown) {
      this.player.anims.play('run_right', true);
			this.player.setVelocityX(playerSpeed);
			if(this.player.x > window.innerWidth / 2 + worldWidth / 2){
				this.player.setVelocityX(0);
			}
    } else if (this.cursors.left.isDown) {
      this.player.anims.play('run_left', true);
			this.player.setVelocityX(-playerSpeed);
			
			if(this.player.x < window.innerWidth / 2 - worldWidth / 2){
				this.player.setVelocityX(0);
			}
    } else if(this.cursors.down.isDown){
			this.player.anims.play('mine_down', true);
		} else {
      this.player.anims.play('idle', true); 
			this.player.setVelocityX(0);
    }
  }

}