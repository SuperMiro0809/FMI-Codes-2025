class PregameAnimation extends Phaser.Scene {
  constructor() {
    super({ key: "PregameAnimation" });
  }

  preload() {
    this.load.image("geologyBackImage", "assets/geologyPlanet/background.jpg");
    this.load.image('teachnoBackImage', 'assets/technoPlanet/background.png');
    this.load.image('physicsBackImage', 'assets/physicsPlanet/background.png');  
    this.load.image("avatar", "assets/spaceship.png");
    this.load.image("physicsAlien", "assets/aliens/blue.png");
    this.load.image("geologyAlien", "assets/aliens/dark-gray.png");
    this.load.image("technologyAlien", "assets/aliens/masked.png");

    this.load.spritesheet("character", "assets/AstronautPlayerProfile.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create(data) {
    const { width, height } = this.sys.game.canvas;
    this.planet = data.planet;

    let alienAsset = "";
    let planetBackground = "";

    switch (this.planet) {
      case "geologyPlanet":
        alienAsset = "geologyAlien";
        planetBackground = "geologyBackImage";
        break;
      case "technoPlanet":
        alienAsset = "technologyAlien";
        planetBackground = "teachnoBackImage";
        break;
      case "physicsPlanet":
        alienAsset = "physicsAlien";
        planetBackground = "physicsBackImage";
        break;
    }

    const backImage = this.add
      .image(width / 2, height / 2, planetBackground)
      .setOrigin(0.5);
    const bgScale = Math.max(
      width / backImage.width,
      height / backImage.height
    );
    backImage.setScale(bgScale).setScrollFactor(0);

    this.avatar = this.physics.add.sprite(250, -100, "avatar").setOrigin(0.5);
    this.avatar.setScale(2.5);

    this.alien = this.add.image(width - 350, height / 1.22, alienAsset);
    this.alien.setScale(0.25);
    this.alien.setFlipX(true);

    const skipBtn = this.add.text(this.scale.width - 20, this.scale.height - 20, 'SKIP →', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '2rem',
      fill: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 8, y: 5 }
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

    skipBtn.on("pointerover", () => {
      this.tweens.add({
        targets: skipBtn,
        scale: 1.2,
        duration: 200,
        ease: "Power2",
      });
      skipBtn.setStyle({ fill: "#FFFF00" });
    });

    skipBtn.on("pointerout", () => {
      this.tweens.add({
        targets: skipBtn,
        scale: 1.0,
        duration: 200,
        ease: "Power2",
      });
      skipBtn.setStyle({ fill: "#FFFFFF" });
    });

    skipBtn.on("pointerdown", () => {
      this.buttonClicked();
    });

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("character", {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("character", {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.tweens.add({
      targets: this.avatar,
      y: height / 1.4,
      duration: 2000,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.character = this.physics.add
          .sprite(300, height / 1.2, "character")
          .setOrigin(0.5);
        this.character.setScale(3);
        this.character.play("walk");
        this.startCharacterWalk();
      },
    });
  }

  buttonClicked() {
    if (this.planet == "technoPlanet") {
      this.scene.start("PlanetTechnologyScene");
    } else if (this.planet == "geologyPlanet") {
      this.scene.start("PlanetGeologyScene");
    } else if(this.planet == "physicsPlanet"){
      this.scene.start("PlanetPhysicsScene");
    }else{
        this.scene.start("MenuScene");
    }
  }

  startCharacterWalk() {
    this.tweens.add({
      targets: this.character,
      x: this.sys.game.canvas.width * (2 / 3),
      duration: 3000,
      ease: "Linear",
      onComplete: () => {
        this.character.stop();
        let texts = ["Hello there", "its me"];
        if (this.planet == "technoPlanet") {
          texts = [
            "Organic lifeform! Assist—wires disconnected, energy fading!",
            "Emergency! Circuit links severed—restore before system collapse!",
            "Power core unstable! Reconnect conduits to prevent meltdown!",
            "Signal disruption detected! Repair cables for continued communication!",
            "Vital flow interrupted! Link circuits or planetary grid will fail!",
            "Urgent! Techno-sphere integrity at risk—synchronize wiring now!",
          ];
        } else if (this.planet == "geologyPlanet") {
          texts = [
            "Terra-being! Bring the sacred ore—immediately!",
            "Planet unstable! Deliver the rare stone now!",
            "Core failing! One primal mineral required!",
            "Seismic crisis! Find and bring the special ore!",
            "Geo-grid weak! One crystal rock needed!",
            "Magmatic flow broken! Retrieve the ancient stone!",
          ];
        }else if(this.planet == "physicsPlanet"){
            texts = [
                "Gravity failing! Jump, run, and reach the energy core—hurry!",
                "Physics in chaos! Navigate the platforms and restore balance!",
                "Laws of motion unstable! Leap to the quantum stabilizer!",
                "Planet collapsing! Only precise jumps can fix the spacetime rift!",
                "Velocity disrupted! Use momentum to reach the control node!",
                "Gravity shift! Master the platforms or our world crumbles!"
              ]
              
        }
        this.createSpeechBubble(this.alien.x, this.alien.y - 160, texts);
      },
    });
  }

  createSpeechBubble(x, y, texts) {
    const bubbleWidth = 320;
    const bubbleHeight = 180;
    const padding = 10;
    const pointerSize = 10;
    let textIndex = 0;

    if (this.currentBubble) {
      this.currentBubble.destroy();
      this.currentText.destroy();
    }

    this.currentBubble = this.add.graphics();
    this.currentBubble.fillStyle(0xb3b3cb, 1);
    this.currentBubble.fillRoundedRect(
      x - bubbleWidth / 2,
      y - bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      16
    );
    this.currentBubble.lineStyle(2, 0x000000, 1);
    this.currentBubble.strokeRoundedRect(
      x - bubbleWidth / 2,
      y - bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      16
    );

    this.currentBubble.fillTriangle(
      x - 10,
      y + bubbleHeight / 2 - 5,
      x + 10,
      y + bubbleHeight / 2 - 5,
      x,
      y + bubbleHeight / 2 + pointerSize
    );

    this.currentText = this.add.text(x, y, texts[textIndex], {
      fontSize: '1.125rem',
      color: '#0a0a0f',
      align: 'center',
      fontFamily: 'Orbitron',
      wordWrap: { width: bubbleWidth - padding * 2 }
    }).setOrigin(0.5);

    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (textIndex == texts.length - 1) {
          if (this.planet == "technoPlanet") {
            this.scene.start("PlanetTechnologyScene");
          } else if (this.planet == "geologyPlanet") {
            this.scene.start("PlanetGeologyScene");
          } else if(this.planet == "physicsPlanet"){
            this.scene.start("PlanetPhysicsScene");
          }else{
            this.scene.start("MenuScene")
          }
        }
        textIndex = (textIndex + 1) % texts.length;
        this.currentText.setText(texts[textIndex]);
      },
      loop: true,
    });
  }
}
