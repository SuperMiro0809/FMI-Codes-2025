const GRID_OFFSET_Y_ADDON = 30;

class PlanetTechnologyScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlanetTechnologyScene" });
  }

  preload() {
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.load.image('tech-planet-bg', 'assets/tech-planet-background.jpg');
  }

  create() {
    const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'tech-planet-bg');
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    bg.setScale(scaleX, scaleY);

    this.createPopup();
    this.showPopup();
  }

  createPopup() {
    this.popupContainer = this.add.container(this.scale.width / 2, this.scale.height / 2).setAlpha(0);

    const popupBg = this.add.rectangle(0, 0, 600, 760, 0x222222).setStrokeStyle(3, 0xffffff);
    const popupTitle = this.add.text(-255, -350, 'Connect the Cables', {
      fontFamily: 'Orbitron',
      fontSize: '1.425rem',
      fill: '#FFBF00',
    });

    const instructionsText = `
      Press on the dots, hold and drag your mouse to draw a
      connection with the corresponing dot.
      Press Z to revert an action.
    `

    const popupText = this.add.text(-280, -320, instructionsText, {
      fontFamily: 'Orbitron',
      fontSize: '1rem',
      fill: '#ffffff',
    });

    const resetButton = this.add.text(145, 310, '[RESET]', {
      fontSize: '1.25rem',
      fontFamily: 'Orbitron',
      fill: '#ff0000',
      backgroundColor: '#333333',
      padding: { x: 6, y: 4 },
    }).setInteractive({ useHandCursor: true });

    resetButton.on('pointerdown', () => this.createGrid());

    this.input.keyboard.on('keydown-Z', () => {
      const lastDrawnLine = this.lines.pop();
      const { graphics, points } = lastDrawnLine;

      graphics.destroy();
      this.resetPreviouslyOccupiedCells(points);
      this.resetDotsConnectionStatus(points);
    });

    this.popupContainer.add([popupBg, popupTitle, popupText, resetButton]);
    this.createGrid();
    this.add.existing(this.popupContainer);
  }

  createGrid() {
    this.gridSize = 12;
    this.cellSize = 42;
    this.lines = [];
    this.currentPath = [];
    this.isDrawing = false;
    this.previewLines = [];

    const colors = [0x00ff00, 0xff0000, 0x0000ff, 0xffff00];
    this.dots = [];
    this.grid = [];

    let positions = [];

    let gridOffsetX = -this.gridSize * this.cellSize / 2;
    let gridOffsetY = -this.gridSize * this.cellSize / 2 + GRID_OFFSET_Y_ADDON;

    for (let row = 0; row < this.gridSize; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        let x = gridOffsetX + col * this.cellSize;
        let y = gridOffsetY + row * this.cellSize;
        let color = (row + col) % 2 === 0 ? 0x444444 : 0x555555;

        let square = this.add.rectangle(x, y, this.cellSize, this.cellSize, color).setOrigin(0);
        this.popupContainer.add(square);

        this.grid[row][col] = { x, y, occupied: false };
        positions.push({ x, y, row, col });
      }
    }

    // Hover effect
    this.hoverSquare = this.add.rectangle(0, 0, this.cellSize, this.cellSize, 0xffffff, 0.3)
      .setOrigin(0)
      .setAlpha(0);
    this.popupContainer.add(this.hoverSquare);

    Phaser.Utils.Array.Shuffle(positions);
    let colorIndex = 0;

    for (let i = 0; i < 4; i++) {
      let pos1 = positions[i * 2];
      let pos2 = positions[i * 2 + 1];
      let color = colors[colorIndex];

      this.createDot(pos1, color);
      this.createDot(pos2, color);

      colorIndex = (colorIndex + 1) % colors.length;
    }

    this.input.on('pointermove', (pointer) => this.updatePath(pointer));
    this.input.on('pointerup', () => this.finishPath());
  }

  createDot(pos, color) {
    let dot = this.add.circle(pos.x + this.cellSize / 2, pos.y + this.cellSize / 2, 10, color)
      .setInteractive({ useHandCursor: true });

    dot.color = color;
    dot.gridPosition = { row: pos.row, col: pos.col };
    dot.connected = false;
    this.popupContainer.add(dot);
    this.dots.push(dot);

    dot.on('pointerdown', () => this.startPath(dot));
  }

  startPath(dot) {
    if (dot.connected) return;

    this.isDrawing = true;
    this.currentPath = [{ x: dot.x, y: dot.y, row: dot.gridPosition.row, col: dot.gridPosition.col }];
    this.currentColor = dot.color;
  }

  updatePath(pointer) {
    if (!this.isDrawing) return;

    let col = Math.floor((pointer.x - this.popupContainer.x + this.gridSize * this.cellSize / 2) / this.cellSize);
    let row = Math.floor((pointer.y - this.popupContainer.y + this.gridSize * this.cellSize / 2 - GRID_OFFSET_Y_ADDON) / this.cellSize);

    if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) return;

    let x = -this.gridSize * this.cellSize / 2 + col * this.cellSize;
    let y = -this.gridSize * this.cellSize / 2 + row * this.cellSize + GRID_OFFSET_Y_ADDON;

    this.hoverSquare.setPosition(x, y);
    this.hoverSquare.setAlpha(1);

    let last = this.currentPath[this.currentPath.length - 1];

    // Prevent diagonal movement
    if (Math.abs(last.row - row) + Math.abs(last.col - col) !== 1) return;

    // Allow reversing by removing the last point
    if (this.currentPath.length > 1) {
      let prev = this.currentPath[this.currentPath.length - 2];
      if (prev.row === row && prev.col === col) {
        let removed = this.currentPath.pop();
        this.previewLines.pop().destroy();
        return;
      }
    }

    // Prevent backtracking
    if (this.currentPath.some(p => p.row === row && p.col === col)) return;

    // Check if the new segment would cross an existing path
    let newSegment = { x1: last.x, y1: last.y, x2: x + this.cellSize / 2, y2: y + this.cellSize / 2 };
    if (this.checkLineIntersections({ x, y })) return;

    // Check if this new position contains another dot of a different color
    let dotAtPosition = this.dots.find(dot => dot.gridPosition.row === row && dot.gridPosition.col === col);
    if (dotAtPosition && dotAtPosition.color !== this.currentColor) return; // Prevent connecting to a different-colored dot

    // Create the preview line
    let previewLine = this.add.graphics();
    previewLine.lineStyle(2, this.currentColor, 0.3);
    previewLine.lineBetween(newSegment.x1, newSegment.y1, newSegment.x2, newSegment.y2);
    this.popupContainer.add(previewLine);
    this.previewLines.push(previewLine);

    this.currentPath.push({ x: newSegment.x2, y: newSegment.y2, row, col });

    // Check if this new position contains correct dot
    if (dotAtPosition && dotAtPosition.color === this.currentColor) {
      this.finishPath();
    }
  }

  checkLineIntersections(newSegment) {
    for (let row of this.grid) {
      for (let point of row) {
        if (point.x === newSegment.x && point.y === newSegment.y && point.occupied) {
          return true; // intersection detected
        }
      }
    }
    return false; // no intersections
  }

  finishPath() {
    if (!this.isDrawing || this.currentPath.length < 2) {
      this.resetPath();
      return;
    }

    let start = this.currentPath[0];
    let end = this.currentPath[this.currentPath.length - 1];

    let startDot = this.dots.find(d => d.gridPosition.row === start.row && d.gridPosition.col === start.col);
    let endDot = this.dots.find(d => d.gridPosition.row === end.row && d.gridPosition.col === end.col && d.color === this.currentColor);

    if (endDot && !endDot.connected) {
      this.drawPath(this.currentPath);
      this.updateOccupiedCells();
      startDot.connected = true;
      endDot.connected = true;

      if (this.checkIfWin()) {
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'You Win!', {
          fontSize: '2rem',
          fontFamily: 'Orbitron',
          fill: '#00ff88',
          backgroundColor: '#222222',
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(1000); // Center the text and bring it to the top layer

        // Wait for 2 seconds before fading out
        this.time.delayedCall(2000, () => {
          this.cameras.main.fadeOut(500, 0, 0, 0);

          this.time.delayedCall(500, () => {
            this.scene.start('LeavingScene', {from: "technoPlanet", to:"physicsPlanet"});
          });
        });
      }
    } else {
      this.resetPath();
    }

    this.isDrawing = false;
  }

  updateOccupiedCells() {
    for (let point of this.currentPath) {
      this.grid[point.row][point.col].occupied = true;
    }
  }

  resetPreviouslyOccupiedCells(points) {
    for (let point of points) {
      this.grid[point.row][point.col].occupied = false;
    }
  }

  resetDotsConnectionStatus(points) {
    let start = points[0];
    let end = points[points.length - 1];

    let startDot = this.dots.find(d => d.gridPosition.row === start.row && d.gridPosition.col === start.col);
    let endDot = this.dots.find(d => d.gridPosition.row === end.row && d.gridPosition.col === end.col);

    startDot.connected = false;
    endDot.connected = false;
  }

  drawPath(path) {
    let graphics = this.add.graphics();
    graphics.lineStyle(4, this.currentColor, 1);

    for (let i = 1; i < path.length; i++) {
      let prev = path[i - 1];
      let curr = path[i];
      graphics.lineBetween(prev.x, prev.y, curr.x, curr.y);
    }

    this.lines.push({ graphics, points: this.currentPath });
    this.popupContainer.add(graphics);
  }

  resetPath() {
    this.isDrawing = false;
    this.currentPath = [];
    this.previewLines.forEach(line => line.destroy());
    this.previewLines = [];
    this.hoverSquare.setAlpha(0);
  }

  checkIfWin() {
    for (const dot of this.dots) {
      if (!dot.connected) return false;
    }

    return true;
  }

  showPopup() {
    this.tweens.add({ targets: this.popupContainer, alpha: 1, duration: 500, ease: 'Power2' });
  }

  hidePopup() {
    this.tweens.add({ targets: this.popupContainer, alpha: 0, duration: 500, ease: 'Power2' });
  }
}
