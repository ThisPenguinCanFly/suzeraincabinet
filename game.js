import EvaluateScene from "./evaluateScene.js"
import { COLORS, COLOR_HEX } from './colors.js';
import { FONT_FAMILIES } from './fonts.js';
import { createRoundedButton, createGradientRectangle } from './shared.js';

class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainGameScene" })
    this.politicianData = []
    this.cabinetPositions = []
    this.draggedPolitician = null

    this.isMobile = false
    this.scale = 1
  }

  preload() {
   this.isMobile = this.sys.game.device.input.touch
    if(this.isMobile){
      this.politicianPage = 0
      this.politiciansPerPage = 3
    }
    else{
      this.politicianPage = 0
      this.politiciansPerPage = 6
    }
    this.load.json("politicians", "politicians.json")
    this.load.json("imageList", "pictures.json")

    this.createPlaceholders()
  }

  create() {
    this.calculateResponsiveScale()

    const images = this.cache.json.get("imageList")
    images.forEach((img) => {
      this.load.image(img, `pictures/${img}.png`)
    })

    this.load.once("complete", () => {
      const politicianData = this.cache.json.get("politicians")

      this.setupBackground()
      this.setupCabinetPositions()
      this.politicianData = politicianData
      this.setupUI()
      this.showPoliticianPage(0)
      this.setupInputHandlers()
    })

    this.load.start()
  }

  calculateResponsiveScale() {
    const gameWidth = this.sys.game.config.width
    const gameHeight = this.sys.game.config.height
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    const scaleX = windowWidth / gameWidth
    const scaleY = windowHeight / gameHeight
    this.scale = Math.min(scaleX, scaleY, 1)

    if (this.isMobile) {
      this.scale *= 0.95
    }
  }

  createPlaceholders() {
    const g = this.add.graphics()
    g.fillStyle(COLORS.UIBLACK)
    g.fillRoundedRect(0, 0, 120, 140, 10)
    g.lineStyle(3, COLORS.TEXT2)
    g.strokeRoundedRect(0, 0, 120, 140, 10)
    g.generateTexture("cabinet_slot", 120, 140)
    g.destroy()
  }

  setupBackground() {
    const titleSize ="28px";
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    const gradientTex = this.textures.createCanvas('bg-gradient', width, height);
    const ctx = gradientTex.getContext();

    const gradient = ctx.createLinearGradient(0, height, width, 0);
    gradient.addColorStop(0, COLOR_HEX.UIBLACK);
    gradient.addColorStop(1, COLOR_HEX.UIBLACKHOVER);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    gradientTex.refresh();

    this.add.image(0, 0, 'bg-gradient').setOrigin(0, 0);

    this.add
      .text(400, 30, 'GOVERMENT of \'54', {
        fontSize: titleSize,
        fontFamily: FONT_FAMILIES.LSBold,
        color: COLOR_HEX.TEXT,
      })
      .setOrigin(0.5);
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
    ]

    positions.forEach((pos) => {
      const slot = this.add.image(pos.x, pos.y, "cabinet_slot")
      slot.setInteractive({ dropZone: true })
      slot.setData("position", pos.key)

      const textSize = "14px";

      this.add
        .text(pos.x, pos.y + 80, pos.name, {
          fontSize: textSize,
          fontFamily: FONT_FAMILIES.Lora,
          color: COLOR_HEX.TEXT,
        })
        .setOrigin(0.5)

      this.cabinetPositions.push({
        sprite: slot,
        key: pos.key,
        x: pos.x,
        y: pos.y,
        occupied: false,
        politician: null,
        effectText: null,
      })
    })
  }

  showPoliticianPage(page) {
    if (this.politicians && this.politicians.length) {
      this.politicians.forEach((p) => {
        if (!p.sprite.getData("inCabinet")) {
          p.sprite.destroy()
          p.nameText.destroy()
          if(!this.isMobile) p.statsText.destroy();
        }
      })

      this.politicians = this.politicians.filter((p) => p.sprite.getData("inCabinet"))
    } else {
      this.politicians = []
    }

    const start = page * this.politiciansPerPage
    const end = start + this.politiciansPerPage
    const pageData = this.politicianData.slice(start, end)

    pageData.forEach((politician, index) => {
      const alreadyAssigned = this.cabinetPositions.some(
        (pos) => pos.politician && pos.politician.name === politician.name,
      )
      if (alreadyAssigned) return
      
      let x = 0; 
      let y = 0;

      if(this.isMobile){
        x = 900;
        y = 100 + index * 110;
      }
      else{
        x = 100 + index * 120;
        y = 460;
      }
      const textureKey = this.textures.exists(politician.image) ? politician.image : "placeholder"

      const sprite = this.add.image(x, y, textureKey)
      sprite.setScale(0.3)
      sprite.setInteractive()
      this.input.setDraggable(sprite)

      sprite.setData("politician", politician)
      sprite.setData("originalX", x)
      sprite.setData("originalY", y)
      sprite.setData("inCabinet", false)
      sprite.setData("page", page)


      const nameSize = "12px"
      const statsSize = "10px"

      const nameText = this.add
        .text(x, y + 50, politician.name, {
          fontSize: nameSize,
          fontFamily: FONT_FAMILIES.Lora,
          color: COLOR_HEX.TEXT,
        })
        .setOrigin(0.5)
      
      if(!this.isMobile){
        const statsText = this.createStatsText(politician, x, y + 65, statsSize);

        this.politicians.push({
        sprite,
        data: politician,
        nameText,
        statsText,
        originalX: x,
        originalY: y,
      })
      } 
      else{
        this.politicians.push({
        sprite,
        data: politician,
        nameText,
        originalX: x,
        originalY: y,
      })
      }

    })

    this.politicianPage = page
  }

  createStatsText(politician, x, y, fontSize = "10px") {
    const str = `${politician.party}`

    return this.add
      .text(x, y, str, {
        fontSize: fontSize,
        fontFamily: FONT_FAMILIES.Lora,
        color: COLOR_HEX.TEXT,
      })
      .setOrigin(0.5)
  }

  setupUI() {
    const buttonSize = 20;
    const arrowSize = 20;
    const radius = 20; 
    const padding = 5; 
    const strokeWidth = 1;

    if(this.isMobile){
      createGradientRectangle(this, 800, 0, 200, 450, COLOR_HEX.UIBLACK, COLOR_HEX.UIBLACKHOVER);

      const leftArrowButton = createRoundedButton(this, 880, 30, "^", {
        fontSize: arrowSize,
        fontFamily: FONT_FAMILIES.LSBold,
        textColor: COLOR_HEX.TEXT,
        bgColor: COLOR_HEX.UIBLACK,
        hoverColor: COLOR_HEX.UIBLACKHOVER,
        radius: radius,
        padding: padding,
        strokeColor: COLOR_HEX.TEXT,
        strokeWidth: strokeWidth,
      }, () => {
        if (this.politicianPage > 0) {
          this.showPoliticianPage(this.politicianPage - 1);
        }
      });

      const rightArrowButton = createRoundedButton(this, 920, 30, "v", {
        fontSize: arrowSize,
        fontFamily: FONT_FAMILIES.LSBold,
        textColor: COLOR_HEX.TEXT,
        bgColor: COLOR_HEX.UIBLACK,
        hoverColor: COLOR_HEX.UIBLACKHOVER,
        radius: radius,
        padding: padding,
        strokeColor: COLOR_HEX.TEXT,
        strokeWidth: strokeWidth,
      }, () => {
        if (this.politicianPage < Math.floor(this.politicianData.length / this.politiciansPerPage)) {
          this.showPoliticianPage(this.politicianPage + 1);
        }
      });
    }
    else{
      createGradientRectangle(this, 0, 410, 800, 200, COLOR_HEX.UIBLACK, COLOR_HEX.UIBLACKHOVER);

      const leftArrowButton = createRoundedButton(this, 30, 460, "<", {
        fontSize: arrowSize,
        fontFamily: FONT_FAMILIES.LSBold,
        textColor: COLOR_HEX.TEXT,
        bgColor: COLOR_HEX.UIBLACK,
        hoverColor: COLOR_HEX.UIBLACKHOVER,
        radius: radius,
        padding: padding,
        strokeColor: COLOR_HEX.TEXT,
        strokeWidth: strokeWidth,
      }, () => {
        if (this.politicianPage > 0) {
          this.showPoliticianPage(this.politicianPage - 1);
        }
      });

      const rightArrowButton = createRoundedButton(this, 770, 460, ">", {
        fontSize: arrowSize,
        fontFamily: FONT_FAMILIES.LSBold,
        textColor: COLOR_HEX.TEXT,
        bgColor: COLOR_HEX.UIBLACK,
        hoverColor: COLOR_HEX.UIBLACKHOVER,
        radius: radius,
        padding: padding,
        strokeColor: COLOR_HEX.TEXT,
        strokeWidth: strokeWidth,
      }, () => {
        if (this.politicianPage < Math.floor(this.politicianData.length / this.politiciansPerPage)) {
          this.showPoliticianPage(this.politicianPage + 1);
        }
      });
    }

    this.missingText = this.add.text(680, 60, "", {
        fontSize: "18px",
        fontFamily: FONT_FAMILIES.LSBold,
        color: COLOR_HEX.RED,
        align: "center",
      })
      .setOrigin(0.5)
      .setVisible(false);

    const evalButton = createRoundedButton(this, 735, 25, "EVALUATE", {
      fontSize: buttonSize,
      fontFamily: FONT_FAMILIES.Lora,
      textColor: COLOR_HEX.TEXT,
      bgColor: COLOR_HEX.UIBLACK,
      hoverColor: COLOR_HEX.UIBLACKHOVER,
      strokeWidth: 1,
      strokeColor: COLOR_HEX.TEXT,
      radius: 20,
      padding: 5,
    }, () => {
      const cabinet = this.politicians
        .filter((p) => p.sprite.getData("inCabinet"))
        .map((p) => {
          const position = p.sprite.getData("cabinetPosition");
          return {
            ...p.data,
            positionKey: position,
            image: p.sprite.texture.key,
          };
        });

      const requiredPositions = [
        "President", "Economy", "VP", "CoS", "Defence", "Justice",
        "Foregin", "Agriculture", "Health", "Education", "Interior",
      ];

      const filledPositions = cabinet.map((member) => member.positionKey);
      const unfilled = requiredPositions.filter((pos) => !filledPositions.includes(pos));

      if (unfilled.length > 0) {
        this.missingText.setText(`Some positions are empty`);
        this.missingText.setVisible(true);
        return;
      }

      this.missingText.setVisible(false);

      this.scene.pause();
      this.scene.setVisible(false);
      this.scene.launch("EvaluateScene", { cabinet });
    });
  }

  setupInputHandlers() {
    this.input.on("dragstart", (pointer, gameObject) => {
      this.draggedPolitician = gameObject
      gameObject.setTint(0x888888)
      gameObject.setScale(0.4)
    })

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX
      gameObject.y = dragY
    })

    this.input.on("drop", (pointer, gameObject, dropZone) => {
      const politician = gameObject.getData("politician")
      const key = dropZone.getData("position")
      const cabinetPos = this.cabinetPositions.find((pos) => pos.key === key)

      if (cabinetPos && !cabinetPos.occupied) {
        this.assignToCabinet(gameObject, cabinetPos, politician)
      } else {
        this.resetPosition(gameObject)
      }
    })

    this.input.on("dragend", (pointer, gameObject) => {
      gameObject.clearTint()
      gameObject.setScale(0.3)

      if (!gameObject.getData("inCabinet")) {
        this.resetPosition(gameObject)
      }

      this.draggedPolitician = null
    })

    this.input.on("pointerdown", (pointer, targets) => {
      if (pointer.leftButtonDown() && targets.length > 0) {
        const target = targets[0]
        if (target.getData("politician") && target.getData("inCabinet")) {
          this.removeFromCabinet(target)
        }
      }
    })
  }

  assignToCabinet(sprite, cabinetPos, politician) {
    sprite.x = cabinetPos.x
    sprite.y = cabinetPos.y - 20

    sprite.setData("inCabinet", true)
    sprite.setData("cabinetPosition", cabinetPos.key)

    cabinetPos.occupied = true
    politician.positionKey = cabinetPos.key
    cabinetPos.politician = politician
    if (cabinetPos.effectText) cabinetPos.effectText.destroy()

    this.updateTextPositions(sprite, cabinetPos)
  }

  updateTextPositions(sprite, cabinetPos) {
    const obj = this.politicians.find((p) => p.sprite === sprite)
    if (obj) {
      if(!this.isMobile){
        obj.statsText.x = cabinetPos.x
        obj.statsText.y = cabinetPos.y + 50
      }
      obj.nameText.x = cabinetPos.x
      obj.nameText.y = cabinetPos.y + 35
    }
  }

  removeFromCabinet(sprite) {
    const key = sprite.getData("cabinetPosition")
    const cabinetPos = this.cabinetPositions.find((p) => p.key === key)

    if (!cabinetPos) return

    cabinetPos.occupied = false
    cabinetPos.politician = null

    if (cabinetPos.effectText) {
      cabinetPos.effectText.destroy()
      cabinetPos.effectText = null
    }

    sprite.setData("inCabinet", false)
    sprite.setData("cabinetPosition", null)
  }

  resetPosition(sprite) {
    const obj = this.politicians.find((p) => p.sprite === sprite)
    if (!obj) return

    const page = sprite.getData("page")
    if (page !== this.politicianPage) {
      obj.sprite.destroy()
      obj.nameText.destroy()
      obj.statsText.destroy()

      this.politicians = this.politicians.filter((p) => p !== obj)
      return
    }

    sprite.x = obj.originalX
    sprite.y = obj.originalY
    obj.nameText.x = obj.originalX
    obj.nameText.y = obj.originalY + 60

    if(!this.isMobile){
      obj.statsText.x = obj.nameText.x
      obj.statsText.y = obj.nameText.y + 75
    }
  }

  saveCabinetAsImage() {
    this.game.renderer.snapshot((image) => {
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(`<img src="${image.src}" alt="Cabinet Snapshot">`)
      }
    })
  }
}

const isMobile = /Mobi|Android/i.test(navigator.userAgent)

let gameWidth = 800;
let gameHeight = 550;

if(isMobile){
  gameWidth = 1000;
  gameHeight = 450;
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  resolution: window.devicePixelRatio,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.NO_CENTER,
    min: {
      width: 320,
      height: 240,
    },
    max: {
      width: 1920,
      height: 1080,
    },
  },

  scene: [MainGameScene, EvaluateScene],

  parent: "phaser-game",
  render: {
    pixelArt: false,
  },

  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
}


new Phaser.Game(config)
