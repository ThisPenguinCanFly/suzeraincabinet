export const COLORS = {
  USP: 0x4F2845,
  USPc: 0x4F282B,
  USPr: 0x3B284F,
  PFJP: 0x28ACE4,
  NFP: 0x825033,
  ID: 0x909090,
  SUPPORT: 0x96CEB4,
  TOLERATE: 0xF7DC6F,
  OPPOSE: 0xFF6B6B,
  BACKGROUND: 0x150D10,
  BACKGROUND2: 0x140D14,
  TEXT: 0xECDCAB,
  TEXT2: 0xBAA878,
  WHITE: 0xFFFFFF,
  RED: 0xE74C3C,
  UIBLACK: 0x141414,
  UIBLACKHOVER: 0x1E1E1E,
};

// Helper to convert number to hex string
const toHexString = (color) =>
  `#${color.toString(16).padStart(6, '0').toUpperCase()}`;

// Create a hex string version of COLORS
export const COLOR_HEX = Object.fromEntries(
  Object.entries(COLORS).map(([key, value]) => [key, toHexString(value)])
);
