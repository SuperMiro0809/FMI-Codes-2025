let globalSelectedOptions = new Array(6).fill(null);  
let globalMenuOptionPairs = [
  { fact: "fact1", answer: "ans1" },
  { fact: "fact2", answer: "ans2" },
  { fact: "fact3", answer: "ans3" },
  { fact: "fact4", answer: "ans4" },
  { fact: "fact5", answer: "ans5" },
  { fact: "fact6", answer: "ans6" }
];
class PlanetChemistryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlanetChemistryScene' });
    this.menus = [];
    this.menuOptions = [globalMenuOptionPairs[0].answer, globalMenuOptionPairs[1].answer,  globalMenuOptionPairs[2].answer, globalMenuOptionPairs[3].answer, globalMenuOptionPairs[4].answer, globalMenuOptionPairs[5].answer];
    this.selectedOptions = {};
  }

  preload() {
    this.load.image('background', 'assets/chemistryPlanet.jpg'); // Adjust filename if needed
   
    this.load.spritesheet('flasks', 'assets/Flasks 32x32.png', {
      frameWidth: 32,  
      frameHeight: 32  
    });
}

  create() {

    const menuCount = 6;
    const menuSpacing = 120;
    const startX = (800 - (menuCount * menuSpacing - 20)) / 2;
    const startY = 500;

    this.add.image(400, 300, 'background').setOrigin(0.5).setDepth(-1);
    
    const selectedFrames = [0, 12, 40, 16, 28,30]; //change later!!!
    const spacingX = 120;
    for (let i = 0; i < selectedFrames.length; i++) {
      
      this.add.text(startX + i * menuSpacing, startY-150, globalMenuOptionPairs[i].fact, {
        fontSize: '14px',
        fill: '#ffffff',
        backgroundColor: '#000'
      })
      .setPadding(5)
      .setOrigin(0.5);
  

      this.add.image(startX+45 + (i * spacingX), startY-30, 'flasks', selectedFrames[i])
        .setOrigin(1)
        .setScale(3);
    }

    this.add.text(400, 50, 'Alchemy', { fontSize: '32px', fill: '#6699ff' }).setOrigin(0.5);
    
    for (let i = 0; i < menuCount; i++) {
        let menu = this.add.text(startX + i * menuSpacing, startY, `options`,
            { fontSize: '20px', fill: '#fff', backgroundColor: '#000' })
            .setPadding(10)
            .setInteractive()
            .setOrigin(0.5);
        
        menu.menuIndex = i;
        menu.optionsGroup = null;
        this.selectedOptions[i] = null;
        
        menu.on('pointerover', () => this.showDropdown(menu));
        this.menus.push(menu);
    }

    this.input.on('pointermove', (pointer) => {
        let hoveringOverMenu = this.menus.some(menu => menu.getBounds().contains(pointer.x, pointer.y));
        let hoveringOverOption = false;
        
        this.menus.forEach(menu => {
            if (menu.optionsGroup) {
                menu.optionsGroup.getChildren().forEach(option => {
                    if (option.getBounds().contains(pointer.x, pointer.y)) {
                        hoveringOverOption = true;
                    }
                });
            }
        });
        
        if (!hoveringOverMenu && !hoveringOverOption) {
            this.menus.forEach(menu => this.hideDropdown(menu));
        }
    });

    const submitBtn = this.add.text(750, 570, 'Submit', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#6699ff'
    })
    .setPadding(10)
    .setInteractive()
    .setOrigin(0.5);
  
    submitBtn.on('pointerdown', () => this.handleSubmit());

    // const nextPlanetBtn = this.add.text(700, 550, 'Next Planet →', { fontSize: '20px', fill: '#0ff' })
    //   .setInteractive();

    // nextPlanetBtn.on('pointerdown', () => {
    //   this.scene.start('PlanetTechnologyScene');
    // });
  }

  handleSubmit() {
    if (this.checkCorrectSubmition()) {
      this.showPopup("Correct! Proceeding to the next planet...");
      this.time.delayedCall(2000, () => {
        this.scene.start('PlanetTechnologyScene');
      });
    } 
    else if (this.nothingIsSelected()) {
      this.showPopup("You have not selected an answer for every element!");
    } 
    else {
      this.showPopup("Wrong answer! Please try again.");
    }
  }

  nothingIsSelected(){
    return Object.entries(this.selectedOptions).every(([key, value]) => {
      if (value === null) return true;
      return false;
    });
  }

  checkCorrectSubmition() {
    return Object.entries(this.selectedOptions).every(([key, value]) => {
      if (value === null) return false;
      return globalMenuOptionPairs[key].answer === value;
    });
  }


  showDropdown(menu) {
    if (menu.optionsGroup) return;

    menu.optionsGroup = this.add.group();

    this.menuOptions.forEach((option, i) => {
        let isSelectedGlobally = Object.values(this.selectedOptions).includes(option);
        let isSelectedInMenu = this.selectedOptions[menu.menuIndex] === option;
        let optionText = this.add.text(menu.x, menu.y + 30 + (i * 20), isSelectedInMenu ? `(•) ${option}` : `( ) ${option}`, {
            fontSize: '16px', fill: isSelectedGlobally ? '#f00' : '#fff', backgroundColor: '#555'
        })
            .setPadding(5)
            .setInteractive()
            .setOrigin(0.5)
            .on('pointerdown', () => this.selectOption(menu.menuIndex, option, optionText, menu));
        
        menu.optionsGroup.add(optionText);
    });
  }

  hideDropdown(menu) {
    if (menu.optionsGroup) {
        menu.optionsGroup.destroy(true);
        menu.optionsGroup = null;
    }
  }

  selectOption(menuIndex, optionValue, optionText, menu) {

    if (globalSelectedOptions.includes(optionValue)) {
      this.showPopup(`${optionValue} is already selected!`);
      return;
  }
    if (this.selectedOptions[menuIndex] === optionValue) {
        this.selectedOptions[menuIndex] = null;
        globalSelectedOptions[menuIndex] = null;
        optionText.setText(`( ) ${optionValue}`).setFill('#fff');
    } else {
        this.selectedOptions[menuIndex] = optionValue;
        globalSelectedOptions[menuIndex] = optionValue; 
        this.menus.forEach(m => this.hideDropdown(m));
    }
  }

  showPopup(message) {
    const popup = this.add.text(400, 300, message, {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000'
    })
    .setPadding(15)
    .setOrigin(0.5)
    .setDepth(100);
  
    this.tweens.add({
      targets: popup,
      alpha: { from: 1, to: 0 },
      ease: 'Linear',
      duration: 4000,
      onComplete: () => popup.destroy()
    });
  }
}