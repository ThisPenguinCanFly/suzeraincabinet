class EvaluateScene extends Phaser.Scene {
  constructor() {
    super({ key: "EvaluateScene" })
    this.cabinet = null
  }

  init(data) {
    this.cabinet = data.cabinet
  }

  create() {
    this.cameras.main.setBackgroundColor("#34495E")

    const titleText = this.add
      .text(400, 50, "Cabinet Evaluation", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#fff",
      })
      .setOrigin(0.5)

    let yOffset = 120
    this.cabinet.forEach((member) => {
      const memberText = this.add.text(50, yOffset, `${member.positionKey}: ${member.name} (${member.party})`, {
        fontSize: "18px",
        fontFamily: "Arial",
        color: "#fff",
      })
      yOffset += 30
    })

    const backButton = this.add
      .text(400, 550, "[ Back to Game ]", {
        fontSize: "24px",
        backgroundColor: "#2980b9",
        color: "#fff",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive()

    backButton.on("pointerdown", () => {
      this.scene.stop()
      this.scene.resume("MainGameScene")
      this.scene.setVisible("MainGameScene", true)
    })
  }
}

export default EvaluateScene
