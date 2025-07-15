import EvaluateScene from "./evaluateScene.js";

class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainGameScene" });
    this.politicianData = [];
    this.politicianPage = 0;
    this.politiciansPerPage = 6;

    this.cabinetPositions = [];
    this.draggedPolitician = null;
  }

  preload() {
    // Load politicians and image list
    this.load.json("politicians", "politicians.json");
    this.load.json("imageList", "pictures.json");

    // Create placeholder textures
    this.createPlaceholderImages();
  }

  create() {
    // Load images listed in pictures.json
    const images = this.cache.json.get("imageList");
    images.forEach((img) => {
      this.load.image(img, `pictures/${img}.png`);
    });

    this.load.once("complete", () => {
      const politicianData = this.cache.json.get("politicians");

      this.setupBackground();
      this.setupCabinetPositions();
      this.politicianData = politicianData;
      this.showPoliticianPage(0);
      this.setupUI();
      this.setupInputHandlers();
    });


    this.load.start(); // Start loading the dynamic images

  }

  createPlaceholderImages() {
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
      "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"
    ];

    colors.forEach((color, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(Phaser.Display.Color.HexStringToColor(color).color);
      graphics.fillRect(0, 0, 80, 100);
      graphics.generateTexture(`politician_${index}`, 80, 100);
      graphics.destroy();
    });

    const g = this.add.graphics();
    g.fillStyle(0x2c3e50);
    g.fillRoundedRect(0, 0, 120, 140, 10);
    g.lineStyle(3, 0x3498db);
    g.strokeRoundedRect(0, 0, 120, 140, 10);
    g.generateTexture("cabinet_slot", 120, 140);
    g.destroy();
  }

  setupBackground() {
    this.add.text(400, 30, "Government Cabinet", {
      fontSize: "28px",
      fontFamily: "Arial",
      color: "#2C3E50",
    }).setOrigin(0.5);

    /*this.add.text(598, 590, "Available Politicians", {
      fontSize: "18px",
      fontFamily: "Arial",
      color: "#34495E",
    }).setOrigin(0.5);*/

  }

  setupCabinetPositions() {
    const positions = [
      { name: "President", x: 400, y: 130, key: "President" },
      { name: "Economy", x: 140, y: 150, key: "Economy" },
      { name: "Vice President", x: 270, y: 150, key: "VP" },
      { name: "Chief of Staff", x: 530, y: 150, key: "CoS" },
      { name: "Defence", x: 660, y: 150, key: "Defence" },
      { name: "Justice", x: 75, y: 320, key: "Justice" },
      { name: "Foregin Affairs", x: 205, y: 320, key: "Foregin" },
      { name: "Agriculture", x: 335, y: 320, key: "Agriculture" },
      { name: "Health", x: 465, y: 320, key: "Health" },
      { name: "Education", x: 595, y: 320, key: "Education" },
      { name: "Interior", x: 725, y: 320, key: "Interior" },
    ];

    positions.forEach(pos => {
      const slot = this.add.image(pos.x, pos.y, "cabinet_slot");
      slot.setInteractive({ dropZone: true });
      slot.setData("position", pos.key);

      this.add.text(pos.x, pos.y + 80, pos.name, {
        fontSize: "14px",
        fontFamily: "Arial",
        color: "#2C3E50",
      }).setOrigin(0.5);

      this.cabinetPositions.push({
        sprite: slot,
        key: pos.key,
        x: pos.x,
        y: pos.y,
        occupied: false,
        politician: null,
        effectText: null,
      });
    });
  }

  showPoliticianPage(page) {
    // Remove old sprites (except those in cabinet)
    if (this.politicians && this.politicians.length) {
      this.politicians.forEach(p => {
        if (!p.sprite.getData("inCabinet")) {
          p.sprite.destroy();
          p.nameText.destroy();
          p.statsText.destroy();
        }
      });

      // Keep only the ones in the cabinet
      this.politicians = this.politicians.filter(p => p.sprite.getData("inCabinet"));
    } else {
      this.politicians = [];
    }

    const start = page * this.politiciansPerPage;
    const end = start + this.politiciansPerPage;
    const pageData = this.politicianData.slice(start, end);

    pageData.forEach((politician, index) => {
      // 🔽 Skip if politician is already assigned to a cabinet
      const alreadyAssigned = this.cabinetPositions.some(pos => pos.politician && pos.politician.name === politician.name);
      if (alreadyAssigned) return;

      const x = 100 + index * 120;
      const y = 480;
      const textureKey = this.textures.exists(politician.image) ? politician.image : "placeholder";

      const sprite = this.add.image(x, y, textureKey);
      sprite.setScale(0.3);
      sprite.setInteractive();
      this.input.setDraggable(sprite);

      sprite.setData("politician", politician);
      sprite.setData("originalX", x);
      sprite.setData("originalY", y);
      sprite.setData("inCabinet", false);
      sprite.setData("page", page);

      const nameText = this.add.text(x, y + 60, politician.name, {
        fontSize: "12px",
        fontFamily: "Arial",
        color: "#2C3E50",
      }).setOrigin(0.5);

      const statsText = this.createStatsText(politician, x, y + 75);

      this.politicians.push({
        sprite,
        data: politician,
        nameText,
        statsText,
        originalX: x,
        originalY: y,
      });
    });

    this.politicianPage = page;
  }

  createStatsText(politician, x, y) {
    const str = `${politician.party}`;

    return this.add.text(x, y, str, {
      fontSize: "10px",
      fontFamily: "Arial",
      color: "#7F8C8D",
    }).setOrigin(0.5);
  }

  setupUI() {
    const leftArrow = this.add.text(30, 480, "<", {
      fontSize: "32px",
      fontFamily: "Arial",
      color: "#34495E",
    }).setInteractive().setOrigin(0.5);

    const rightArrow = this.add.text(770, 480, ">", {
      fontSize: "32px",
      fontFamily: "Arial",
      color: "#34495E",
    }).setInteractive().setOrigin(0.5);

    leftArrow.on("pointerdown", () => {
      if (this.politicianPage > 0) {
        this.showPoliticianPage(this.politicianPage - 1);
      }
    });

    rightArrow.on("pointerdown", () => {
      const maxPage = Math.floor(this.politicianData.length / this.politiciansPerPage);
      if (this.politicianPage < maxPage) {
        this.showPoliticianPage(this.politicianPage + 1);
      }
    });

    const evalButton = this.add.text(700, 50, "[ EVALUATE ]", {
      fontSize: "20px",
      backgroundColor: "#2980b9",
      color: "#fff",
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    // Add this somewhere in your scene's create method to create the warning text (initially hidden)
    this.missingText = this.add.text(690, 20, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#e74c3c', // red warning color
      align: 'center',
    }).setOrigin(0.5).setVisible(false);

    
    evalButton.on("pointerdown", () => {
      const cabinet = this.politicians
        .filter(p => p.sprite.getData("inCabinet"))
        .map(p => {
          const position = p.sprite.getData("cabinetPosition");
          return {
            ...p.data,
            positionKey: position,
            image: p.sprite.texture.key,
          };
        });

      const requiredPositions = [
        "President", "Economy", "VP", "CoS", "Defence",
        "Justice", "Foregin", "Agriculture", "Health", "Education", "Interior"
      ];

      const filledPositions = cabinet.map(member => member.positionKey);
      const unfilled = requiredPositions.filter(pos => !filledPositions.includes(pos));

      if (unfilled.length > 0) {
        this.missingText.setText(`Some positions are empty`);
        this.missingText.setVisible(true);
        return;
      }

      // Hide warning if previously shown
      this.missingText.setVisible(false);

      console.log("cabinet to evaluate:", cabinet);

      this.scene.pause();
      this.scene.setVisible(false);
      this.scene.launch("EvaluateScene", { cabinet });
    });
  }

  setupInputHandlers() {
    this.input.on("dragstart", (pointer, gameObject) => {
      this.draggedPolitician = gameObject;
      gameObject.setTint(0x888888);
      gameObject.setScale(0.4);
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("drop", (pointer, gameObject, dropZone) => {
      const politician = gameObject.getData("politician");
      const key = dropZone.getData("position");
      const cabinetPos = this.cabinetPositions.find(pos => pos.key === key);

      if (cabinetPos && !cabinetPos.occupied) {
        this.assignToCabinet(gameObject, cabinetPos, politician);
      } else {
        this.resetPosition(gameObject);
      }
    });

    this.input.on("dragend", (pointer, gameObject) => {
      gameObject.clearTint();
      gameObject.setScale(0.3);

      if (!gameObject.getData("inCabinet")) {
        this.resetPosition(gameObject);
      }

      this.draggedPolitician = null;
    });

    this.input.on("pointerdown", (pointer, targets) => {
      if (pointer.leftButtonDown() && targets.length > 0) {
        const target = targets[0];
        if (target.getData("politician") && target.getData("inCabinet")) {
          this.removeFromCabinet(target);
        }
      }
    });
  }

  assignToCabinet(sprite, cabinetPos, politician) {
    sprite.x = cabinetPos.x;
    sprite.y = cabinetPos.y - 20;

    sprite.setData("inCabinet", true);
    sprite.setData("cabinetPosition", cabinetPos.key);

    cabinetPos.occupied = true;
    politician.positionKey = cabinetPos.key;  
    cabinetPos.politician = politician;
    if (cabinetPos.effectText) cabinetPos.effectText.destroy();

    this.updateTextPositions(sprite, cabinetPos);
  }

  updateTextPositions(sprite, cabinetPos) {
    const obj = this.politicians.find(p => p.sprite === sprite);
    if (obj) {
      obj.nameText.x = cabinetPos.x;
      obj.nameText.y = cabinetPos.y + 20;
      obj.statsText.x = cabinetPos.x;
      obj.statsText.y = cabinetPos.y + 35;
    }
  }

  removeFromCabinet(sprite) {
    const key = sprite.getData("cabinetPosition");
    const cabinetPos = this.cabinetPositions.find(p => p.key === key);

    if (!cabinetPos) return;

    cabinetPos.occupied = false;
    cabinetPos.politician = null;

    if (cabinetPos.effectText) {
      cabinetPos.effectText.destroy();
      cabinetPos.effectText = null;
    }

    sprite.setData("inCabinet", false);
    sprite.setData("cabinetPosition", null);
  }

  resetPosition(sprite) {
  const obj = this.politicians.find(p => p.sprite === sprite);
    if (!obj) return;

    const page = sprite.getData("page");
    if (page !== this.politicianPage) {
      // Politician doesn't belong to current page — remove them
      obj.sprite.destroy();
      obj.nameText.destroy();
      obj.statsText.destroy();

      this.politicians = this.politicians.filter(p => p !== obj);
      return;
    }

    // Otherwise, reset position
    sprite.x = obj.originalX;
    sprite.y = obj.originalY;
    obj.nameText.x = obj.originalX;
    obj.nameText.y = obj.originalY + 60;
    obj.statsText.x = obj.originalX;
    obj.statsText.y = obj.originalY + 75;
  }

  saveCabinetAsImage() {
  // Wait for rendering to complete before taking snapshot
    this.game.renderer.snapshot((image) => {
      // Open the image in a new tab
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<img src="${image.src}" alt="Cabinet Snapshot">`);
      }
    });
  }
}

// Game configuration
const config = {
  scene: [MainGameScene, EvaluateScene],
  type: Phaser.AUTO,
  width: 800,
  height: 600,
    scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  parent: "phaser-game",
  backgroundColor: "#ECF0F1",
};

new Phaser.Game(config);
