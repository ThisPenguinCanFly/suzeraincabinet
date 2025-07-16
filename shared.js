import { COLORS, COLOR_HEX } from './colors.js';
import { FONT_FAMILIES } from './fonts.js';

export function createRoundedButton(scene, x, y, label, options = {}, onClick) {
  const {
    fontSize = '20px',
    fontFamily = FONT_FAMILIES.Lora,
    textColor = COLOR_HEX.TEXT,
    bgColor = COLOR_HEX.UIBLACK,
    hoverColor = COLOR_HEX.UIBLACKHOVER,
    radius = 12,
    padding = 10,
    strokeColor = null,
    strokeWidth = 0,
  } = options;

  const text = scene.add.text(0, 0, label, {
    fontSize,
    fontFamily,
    color: textColor,
    padding: { x: padding, y: padding / 2 },
  }).setOrigin(0.5);

  const bounds = text.getBounds();
  const width = bounds.width + padding * 2;
  const height = bounds.height + padding * 2;

  const bg = scene.add.graphics();

  const fill = Phaser.Display.Color.HexStringToColor(bgColor).color;
  const hoverFill = Phaser.Display.Color.HexStringToColor(hoverColor).color;

  function drawBackground(color) {
    bg.clear();
    bg.fillStyle(color, 1);
    if (strokeColor && strokeWidth > 0) {
      const strokeCol = Phaser.Display.Color.HexStringToColor(strokeColor).color;
      bg.lineStyle(strokeWidth, strokeCol, 1);
    } else {
      bg.lineStyle(0);
    }
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    if (strokeColor && strokeWidth > 0) {
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
    }
  }

  // Initial draw
  drawBackground(fill);

  const button = scene.add.container(x, y, [bg, text])
    .setSize(width, height)
    .setInteractive({ useHandCursor: true });

  button.on('pointerover', () => drawBackground(hoverFill));
  button.on('pointerout', () => drawBackground(fill));

  if (onClick) {
    button.on('pointerdown', onClick);
  }

  return button;
}

export function createGradientRectangle(scene, x, y, width, height, colorTop, colorBottom) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, colorTop);
  gradient.addColorStop(1, colorBottom);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const key = `gradient-${colorTop}-${colorBottom}-${width}x${height}`;

  if (!scene.textures.exists(key)) {
    scene.textures.addCanvas(key, canvas);
  }

  const rect = scene.add.image(x, y, key).setOrigin(0, 0);

  return rect;
}