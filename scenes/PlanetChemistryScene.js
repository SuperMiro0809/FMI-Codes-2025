let globalSelectedOptions = new Array(6).fill(null);
let globalMenuOptionPairs = [
  { fact: "Lightest gas in the world", answer: "Helium" },
  { fact: "Makes orange flames", answer: "Calcium chloride" },
  { fact: "Forms up to 10 million different compounds", answer: "Carbon" },
  { fact: "The rarest element on earth", answer: "Francium" },
  { fact: "It is found in meteorites", answer: "Titanium" },
  { fact: "Used as laughing gas at the dentist", answer: "Nitrogen" }
];

class PlanetChemistryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlanetChemistryScene' });
    this.menus = [];
    this.menuOptions = globalMenuOptionPairs.map(pair => pair.answer)
    .sort(() => Math.random() - 0.5);
    this.selectedOptions = {};
  } 

  preload() {
    this.load.image('background', 'assets/chemistryPlanet3.JPG');
    this.load.spritesheet('flasks', 'assets/Flasks 32x32.png', {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    const background = this.add.image(width / 2, height / 2, 'background').setOrigin(0.5);
    const scale = Math.max(width / background.width, height / background.height);
    background.setScale(scale).setScrollFactor(0);

    const selectedFrames = [0, 12, 62, 50, 37, 35];
    const menuCount = selectedFrames.length;
    const spacingX = 180;
    const totalGroupWidth = (menuCount - 1) * spacingX;
    const centerX = width / 2;
    const startX = centerX - totalGroupWidth / 2;
    const startY = height - 200;

    this.add.text(width / 2, 130, 'Alchemy', { 
      fontSize: '60px', 
      fill: '#0a0a0f', 
      fontStyle: 'bold' 
    }).setOrigin(0.5);

    for (let i = 0; i < selectedFrames.length; i++) {
      const currentX = startX + i * spacingX;

      let factText = this.add.text(currentX, startY - 210, globalMenuOptionPairs[i].fact, {
        fontSize: '25px',
        fill: '#0a0a0f',
        backgroundColor: '#b3b3cb',
        wordWrap: { width: 400, useAdvancedWrap: true }
      })
      .setPadding(5)
      .setOrigin(0.5)
      .setAlpha(0); 

      let flaskImage = this.add.image(currentX, startY - 100, 'flasks', selectedFrames[i])
        .setOrigin(0.5)
        .setScale(3)
        .setInteractive(); 

      flaskImage.on('pointerover', () => factText.setAlpha(1));
      flaskImage.on('pointerout', () => factText.setAlpha(0));

      let menu = this.add.text(currentX, startY, 'options', {
        fontSize: '20px',
        fill: '#0a0a0f',
        backgroundColor: '#b3b3cb'
      })
      .setPadding(10)
      .setInteractive()
      .setOrigin(0.5);

      menu.menuIndex = i;
      menu.optionsGroup = null;
      this.selectedOptions[i] = null;
      menu.on('pointerover', () => this.showDropdown(menu));
      this.menus.push(menu);
    }

    const submitBtn = this.add.text(width - 100, height - 50, 'Submit', {
      fontSize: '40px',
      fill: '#b3b3cb',
      backgroundColor: '#0a0a0f'
    })
    .setPadding(10)
    .setInteractive()
    .setOrigin(0.5);

    submitBtn.on('pointerdown', () => this.handleSubmit());

    this.input.on('pointermove', (pointer) => {
      const hoveringMenu = this.menus.some(menu => menu.getBounds().contains(pointer.x, pointer.y));
      const hoveringOption = this.menus.some(menu => 
        menu.optionsGroup?.getChildren().some(option => option.getBounds().contains(pointer.x, pointer.y))
      );

      if (!hoveringMenu && !hoveringOption) {
        this.menus.forEach(menu => this.hideDropdown(menu));
      }
    });
  }

  handleSubmit() {
    if (this.checkCorrectSubmission()) {
      this.showPopup("Correct! Proceeding to the next planet...");
      this.cameras.main.fadeOut(1500);
      this.time.delayedCall(4000, () => this.scene.start('PlanetTechnologyScene'));
    } else if (this.nothingIsSelected()) {
      this.showPopup("You have not selected an answer for every element!");
    } else {
      this.showPopup("Wrong answer! Please try again.");
    }
  }

  nothingIsSelected() {
    return Object.values(this.selectedOptions).some(value => value === null);
  }

  checkCorrectSubmission() {
    return Object.entries(this.selectedOptions).every(([key, value]) => {
      return value !== null && globalMenuOptionPairs[key].answer === value;
    });
  }

  showDropdown(menu) {
    if (menu.optionsGroup) return;
    menu.optionsGroup = this.add.group();

    this.menuOptions.forEach((option, i) => {
      let isSelectedGlobally = Object.values(this.selectedOptions).includes(option);
      let isSelectedInMenu = this.selectedOptions[menu.menuIndex] === option;

      let optionText = this.add.text(menu.x, menu.y + 30 + (i * 20), 
        isSelectedInMenu ? `(•) ${option}` : `( ) ${option}`, {
          fontSize: '16px',
          fill: isSelectedGlobally ? '#8585ad' : '#0a0a0f', 
        backgroundColor: '#b3b3cb',
        
        })
      .setPadding(5)
      .setInteractive()
      .setOrigin(0.5)
      .on('pointerdown', () => this.selectOption(menu.menuIndex, option, menu));

      menu.optionsGroup.add(optionText);
    });
  }

  hideDropdown(menu) {
    if (menu.optionsGroup) {
      menu.optionsGroup.destroy(true);
      menu.optionsGroup = null;
    }
  }

  selectOption(menuIndex, optionValue, menu) {
    if (Object.values(this.selectedOptions).includes(optionValue) && this.selectedOptions[menuIndex] !== optionValue) {
      this.showPopup(`${optionValue} is already selected!`);
      return;
    }

    if (this.selectedOptions[menuIndex] === optionValue) {
      this.selectedOptions[menuIndex] = null;
      globalSelectedOptions[menuIndex] = null;
      menu.setText("options");
    } else {
      this.selectedOptions[menuIndex] = optionValue;
      globalSelectedOptions[menuIndex] = optionValue;
      menu.setText(optionValue);
    }

    this.menus.forEach(m => this.hideDropdown(m));
  }

  showPopup(message) {
    const popup = this.add.text(this.scale.width / 2, this.scale.height / 2, message, {
      fontSize: '18px', 
      fill: '#b3b3cb', 
      backgroundColor: '#0a0a0f'
    }).setPadding(15).setOrigin(0.5).setDepth(100);

    this.tweens.add({ targets: popup, alpha: 0, duration: 4000, onComplete: () => popup.destroy() });
  }
}
