import { COLORS } from './colors.js'; // Adjust the path if it's in a subfolder


export default class EvaluateScene extends Phaser.Scene {
  constructor() {
    super("EvaluateScene");
  }

  init(data) {
    this.cabinet = data.cabinet;
    this.colorPalette = []
  }

  preload() {}

  create() {
    this.createTitle();
    this.positions = this.getPositions();
    console.log(this.positions);
    this.totalStats = { popultarity: 0, sordPop: 0, bludPop: 0, soll: 0, military: 0, pfjpOP: 0, usprOP: 0, uspmOP: 0, uspcOP: 0, nfpOP: 0, idOP: 0 };
    this.presidentParty = "Temp";
    this.nOfUSPMinisters = 0;
    this.calculateStats();
  
    this.displayCabinetMembers();
    this.displayAverageStats();
    this.createParliamentDiagram(); // 🧩 Add this
    this.createScreenshotButton();
    this.createBackButton();

    console.log(this.cabinet);
  }

  createTitle() {
    this.add.text(600, 40, "Your Cabinet Evaluation", {
      fontSize: "28px",
      fontFamily: "Arial",
      color: "#1F2F3F",
    }).setOrigin(0.5);
  }

  getPositions() {
    return [
      { name: "President", x: 598, y: 130, key: "President" },
      { name: "Economy", x: 338, y: 150, key: "Economy" },
      { name: "Vice President", x: 468, y: 150, key: "VP" },
      { name: "Chief of Staff", x: 728, y: 150, key: "CoS" },
      { name: "Defence", x: 858, y: 150, key: "Defence" },
      { name: "Justice", x: 270, y: 320, key: "Justice" },
      { name: "Foregin Affairs", x: 400, y: 320, key: "Foregin" },
      { name: "Agriculture", x: 530, y: 320, key: "Agriculture" },
      { name: "Health", x: 660, y: 320, key: "Health" },
      { name: "Education", x: 790, y: 320, key: "Education" },
      { name: "Interior", x: 920, y: 320, key: "Interior" },
    ];
  }

  displayCabinetMembers() {
    this.positions.forEach(pos => {
      const member = this.cabinet.find(m => m.positionKey === pos.key);
      if (!member) return;

      this.add.image(pos.x, pos.y, member.image).setScale(0.3);
      this.add.text(pos.x, pos.y + 60, member.name, {
        fontSize: "12px",
        fontFamily: "Arial",
        color: "#000",
      }).setOrigin(0.5);

      this.add.text(pos.x, pos.y + 80, pos.name, {
        fontSize: "14px",
        fontFamily: "Arial",
        color: "#2C3E50",
      }).setOrigin(0.5);


      this.totalStats.leadership += member.leadership || 0;
      this.totalStats.intelligence += member.intelligence || 0;
      this.totalStats.charisma += member.charisma || 0;
    });
  }

  displayAverageStats() {

    this.militaryStatus = "Temp";
    this.IDStatus = "Temp";
    this.PFJPStatus = "Temp";
    this.NFPStatus = "Temp";
    this.USPCStatus = "Temp";
    this.USPRStatus = "Temp";
    this.USPMStatus = "Temp";
    this.GNASupportSeats = 0;
    if(this.totalStats.military > 0.5){
      this.militaryStatus = "Supporting the Goverment";
    }
    else if(this.totalStats.military > 0.0){
      this.militaryStatus = "Tolerating the Goverment";
    }
    else{
      this.militaryStatus = "Unruly Generals";
    }

    if(this.totalStats.idOP > 0.15){
      this.IDStatus = "Supporting the Goverment";
      this.GNASupportSeats += 10;
    }
    else if(this.totalStats.idOP  > 0.0){
      this.IDStatus = "Tolerating the Goverment";
    }
    else{
      this.IDStatus = "Opposing the Goverment";
    }

    if(this.totalStats.pfjpOP > 5.0){
      this.PFJPStatus = "Supporting the Goverment";
      this.GNASupportSeats += 70;
    }
    else if(this.totalStats.pfjpOP  > 3.0){
      this.PFJPStatus = "Tolerating the Goverment";
    }
    else{
      this.PFJPStatus = "Opposing the Goverment";
    }

    if(this.totalStats.nfpOP > 3.0){
      this.NFPStatus = "Supporting the Goverment";
      this.GNASupportSeats += 40;
    }
    else if(this.totalStats.nfpOP  > 1.0){
      this.NFPStatus = "Tolerating the Goverment";
    }
    else{
      this.NFPStatus = "Opposing the Goverment";
    }

    if(this.totalStats.uspcOP > 5.0){
      this.USPCStatus = "Supporting the Goverment";
      this.GNASupportSeats += 40;
    }
    else if(this.totalStats.uspcOP  > 3.0){
      this.USPCStatus = "Tolerating the Goverment";
    }
    else{
      this.USPCStatus = "Opposing the Goverment";
    }

    if(this.totalStats.usprOP > 5.0){
      this.USPRStatus = "Supporting the Goverment";
      this.GNASupportSeats += 40;
    }
    else if(this.totalStats.usprOP  > 3.0){
      this.USPRStatus = "Tolerating the Goverment";
    }
    else{
      this.USPRStatus = "Opposing the Goverment";
    }

    if(this.presidentParty == "USP" || this.presidentParty == "USP - ID"){
      this.USPMStatus = "Supporting the Goverment";
      this.GNASupportSeats += 50;
    }
    else if(this.nOfUSPMinisters >= 5){
      this.USPMStatus = "Supporting the Goverment";
      this.GNASupportSeats += 50;
    }
    else if(this.totalStats.usprOP > 3.0 && this.totalStats.uspcOP > 3.0){
      this.USPMStatus = "Tolerating the Goverment";
    }
    else if(this.totalStats.usprOP > 5.0 && this.totalStats.uspcOP > 5.0){
      this.USPMStatus = "Supporting the Goverment";
      this.GNASupportSeats += 50;
    }
    else{
      this.USPMStatus= "Opposing the Goverment";
    }

    this.add.text(400, 500, `Military: ${this.militaryStatus}`, {
      fontSize: "16px",
      fontFamily: "Arial",
      color: "#2C3E50",
      align: "center",
    }).setOrigin(0.5);
  
  
  }

  // 🧩 Parliament Diagram Integration
  createParliamentDiagram() {
    this.initDiagramData();
    this.initDescriptions();
    this.initInfoText();
    this.createSegments();
    this.drawInitialSegments();
    this.setupDiagramInteraction();
    this.createColorToggleButton();

  }

  initDiagramData() {
    this.centerX = 900;
    this.centerY = 520;
    this.outerRadius = 80;
    this.innerRadius = 20;
    this.percentages = [4, 28, 16, 20, 16, 16];
    this.colors = [COLORS.ID, COLORS.PFJP, COLORS.USPr, COLORS.USP, COLORS.USPc, COLORS.NFP];
    this.calculateColorSupport();
    this.segments = [];
  }

  initDescriptions() {
    this.descriptions = [
      `ID: 10\nStatus: ${this.IDStatus}`,
      `PFJP: 70\nStatus: ${this.PFJPStatus}`,
      `USP Reformers: 40\nStatus: ${this.USPRStatus}`,
      `USP Moderates: 50\nStatus: ${this.USPMStatus}`,
      `USP Conservatives: 40\nStatus: ${this.USPCStatus}`,
      `NFP: 40\nStatus: ${this.NFPStatus}`
    ];
  }

  initInfoText() {
    const defaultText = `Grand National Assembly\nSupport: ${this.GNASupportSeats}/250`;
    this.defaultInfo = defaultText; // store for reuse

    this.infoText = this.add.text(800, 530, defaultText, {
      font: '16px Arial',
      fill: '#000000',
      backgroundColor: '#f0f0f0',
      padding: { x: 10, y: 6 },
      wordWrap: { width: 300 }
    }).setDepth(100).setVisible(true); // 👈 show immediately
  }

  createSegments() {
    const total = 100;
    let startAngle = Math.PI;

    this.percentages.forEach((percent, index) => {
      const angle = Math.PI * (percent / total);
      const midAngle = startAngle + angle / 2;
      const graphics = this.add.graphics({ fillStyle: { color: this.colors[index] } });

      this.segments.push({
        graphics,
        startAngle,
        endAngle: startAngle + angle,
        midAngle,
        outerRadius: this.outerRadius,
        innerRadius: this.innerRadius,
        color: this.colors[index],
        offset: 0
      });

      startAngle += angle;
    });
  }

  drawInitialSegments() {
    this.segments.forEach(seg => {
      this.drawSegmentWithOffset(seg, this.centerX, this.centerY, 0);
    });
  }

  setupDiagramInteraction() {
    this.input.on('pointermove', pointer => {
      const mouseAngleRaw = Phaser.Math.Angle.Between(this.centerX, this.centerY, pointer.x, pointer.y);
      const mouseAngle = (mouseAngleRaw + Math.PI * 2) % (Math.PI * 2);
      const dist = Phaser.Math.Distance.Between(this.centerX, this.centerY, pointer.x, pointer.y);

      let anyHovered = false;

      this.segments.forEach((seg, i) => {
        const inAngle = mouseAngle >= seg.startAngle && mouseAngle < seg.endAngle;
        const inRadius = dist >= seg.innerRadius && dist <= seg.outerRadius;
        const isHovered = inAngle && inRadius;
        const offset = isHovered ? 10 : 0;
        const innerR = seg.innerRadius;
        const outerR = seg.outerRadius + (isHovered ? 10 : 0);

        seg.graphics.clear();
        this.drawSegmentWithOffset(seg, this.centerX, this.centerY, offset, outerR, innerR);

        if (isHovered) {
          this.infoText.setText(this.descriptions[i]);
          this.infoText.setVisible(true);
          anyHovered = true;
        }
      });

      if (!anyHovered) {
        this.infoText.setText(this.defaultInfo);
      }

    });
  }

  drawSegmentWithOffset(seg, cx, cy, offset, outerRadius = seg.outerRadius, innerRadius = seg.innerRadius) {
    const step = (seg.endAngle - seg.startAngle) / 60;
    const offsetX = Math.cos(seg.midAngle) * offset;
    const offsetY = Math.sin(seg.midAngle) * offset;

    const graphics = seg.graphics;
    graphics.beginPath();

    for (let angle = seg.startAngle; angle <= seg.endAngle; angle += step) {
      const x = cx + offsetX + Math.cos(angle) * outerRadius;
      const y = cy + offsetY + Math.sin(angle) * outerRadius;
      if (angle === seg.startAngle) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }

    for (let angle = seg.endAngle; angle >= seg.startAngle; angle -= step) {
      const x = cx + offsetX + Math.cos(angle) * innerRadius;
      const y = cy + offsetY + Math.sin(angle) * innerRadius;
      graphics.lineTo(x, y);
    }

    graphics.closePath();
    graphics.fillStyle(seg.color, 1);
    graphics.fillPath();
  }

  createColorToggleButton() {
    const circle = this.add.circle(this.centerX, this.centerY, 16, 0x444444)
      .setInteractive({ useHandCursor: true })
      .setDepth(101);

    const icon = this.add.text(this.centerX, this.centerY, "🎨", {
      fontSize: "16px"
    }).setOrigin(0.5).setDepth(102);

    circle.on("pointerdown", () => {
      this.toggleColorScheme();
    });
    icon.on("pointerdown", () => {
      this.toggleColorScheme();
    });
  }

  toggleColorScheme() {
    if(this.supportColorSheme){
      this.supportColorSheme = false;
      this.colors = [COLORS.ID, COLORS.PFJP, COLORS.USPr, COLORS.USP, COLORS.USPc, COLORS.NFP];
    } 
    else{
      this.supportColorSheme = true;
      this.colors = this.colorSupport;
    }

    this.segments.forEach((seg, i) => {
      seg.color = this.colors[i];
      seg.graphics.clear();
      this.drawSegmentWithOffset(seg, this.centerX, this.centerY, seg.offset || 0);
    });
  }

  calculateColorSupport(){
    this.colorSupport = [0xA0A0A0, 0xA0A0A0, 0xA0A0A0, 0xA0A0A0, 0xA0A0A0, 0xA0A0A0];

    const statuses = [
      this.IDStatus,
      this.PFJPStatus,
      this.USPRStatus,
      this.USPMStatus,
      this.USPCStatus,
      this.NFPStatus
    ];

    statuses.forEach((status, i) => {
      this.colorSupport[i] = this.getColorForStatus(status);
    });
    console.log(this.colorSupport)
  }

  getColorForStatus(status) {
    console.log(status);
    switch (status) {
      case "Supporting the Goverment":
        return COLORS.SUPPORT;
      case "Tolerating the Goverment":
        return COLORS.TOLERATE;
      default:
        return COLORS.OPPOSE;
    }
  }

  createScreenshotButton() {
    const btn = this.add.text(1000, 50, "[ SAVE IMAGE ]", {
      fontSize: "20px",
      backgroundColor: "#27ae60",
      color: "#fff",
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    btn.on("pointerdown", () => {
      this.game.renderer.snapshot(fullImage => {
        const cropX = 220;
        const cropY = 80;
        const cropWidth = 750; // 500 - 100
        const cropHeight = 350;

        // Create off-screen canvas
        const offCanvas = document.createElement("canvas");
        offCanvas.width = cropWidth;
        offCanvas.height = cropHeight;

        const ctx = offCanvas.getContext("2d");

        // Draw cropped portion from full snapshot
        ctx.drawImage(fullImage, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        // Convert to downloadable image
        const croppedImageURL = offCanvas.toDataURL("image/png");

        const a = document.createElement("a");
        a.href = croppedImageURL;
        a.download = "cabinet-cropped.png";
        a.click();
      });
    });

  }

  createBackButton() {
    const back = this.add.text(196, 50, "← BACK", {
      fontSize: "20px",
      backgroundColor: "#FF6B6B",
      color: "#fff",
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    back.on("pointerdown", () => {
      this.totalStats = { popultarity: 0, sordPop: 0, bludPop: 0, soll: 0, military: 0, pfjpOP: 0, usprOP: 0, uspmOP: 0, uspcOP: 0, nfpOP: 0, idOP: 0 };
      this.scene.stop();
      this.scene.setVisible(true, "MainGameScene");
      this.scene.resume("MainGameScene");
    });
  }

  calculateStats(){
    const popWeights = [0.28, 0.1, 0.08, 0.06]; //This are the weights of each position [president, VP, ministed, CoS]

    var i = 0;
    while(i < this.cabinet.length){
      var polititan = this.cabinet[i];
      var popWeight = 0.0;
      switch(polititan.positionKey){
        case "President": 
          popWeight = popWeights[0]; this.presidentParty = polititan.party; break;
        case "VP": 
          popWeight = popWeights[1];break;
        case "Cos": 
          popWeight = popWeights[3];break;
        case "Defence":
          popWeight = popWeights[2];
          this.totalStats.military = this.totalStats.military + polititan.stats["OP-Military"]; break;
        default:
          popWeight = popWeights[2];
          if(polititan.party == "USP" || polititan.party == "ID - USP") 
            this.nOfUSPMinisters++;
          if(polititan.stats["OP-Military"] < 0)
            this.totalStats.military = this.totalStats.military + polititan.stats["OP-Military"];
          break;
      }
      this.totalStats.sordPop = this.totalStats.sordPop + polititan.stats["OP-Sords"] * popWeight;
      this.totalStats.bludPop = this.totalStats.bludPop + polititan.stats["OP-Bluds"] * popWeight;
      this.totalStats.pfjpOP = this.totalStats.pfjpOP + polititan.stats["OP-PFJP"];
      this.totalStats.nfpOP = this.totalStats.nfpOP + polititan.stats["OP-NFP"];
      this.totalStats.uspcOP = this.totalStats.uspcOP + polititan.stats["OP-USP-C"];
      this.totalStats.usprOP = this.totalStats.usprOP + polititan.stats["OP-USP-R"];
      i++;
    }

    this.totalStats.popultarity = this.totalStats.sordPop * 0.7 + this.totalStats.bludPop * 0.3;
    this.totalStats.idOP = this.totalStats.bludPop ;

    for (let key in this.totalStats) {
      this.totalStats[key] = Math.round(this.totalStats[key] * 100) / 100;
    }

  }
}