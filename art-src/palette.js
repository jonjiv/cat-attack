// The one shared palette for the whole game. Art files refer to colors by name.
export const PALETTE = {
  // general
  outline: '#2b1e2f',
  shadow: '#1a10204a',
  hole: '#1a1220',
  white: '#ffffff',
  red: '#ff4d4d',
  sky: '#8fd3e0',

  // field
  grassDark: '#3b6b2b',
  grassMid: '#5b9a38',
  grassLight: '#7fbf45',
  grassHi: '#b4e06a',
  dirtDark: '#6e4527',
  dirtMid: '#94603a',
  dirtLight: '#b98450',
  dirtPale: '#dcae73',
  earthLight: '#7a4e2e',
  earthMid: '#5e3a22',
  earthDark: '#432817',
  stoneDark: '#4f5160',
  stoneMid: '#7c8090',
  stoneLight: '#adb2bf',
  stoneHi: '#dde1e8',

  // cheese
  cheeseDark: '#c78316',
  cheeseMid: '#f2b630',
  cheeseLight: '#ffd965',
  cheesePale: '#fff1a8',
  cheeseHole: '#a86a12',

  // range ring
  whiteFaint: '#ffffffa0',
  whiteFill: '#ffffff26',

  // cats (orange tabby)
  catDark: '#b4561f',
  catMid: '#e8873a',
  catLight: '#f7b46a',
  catCream: '#fde3b5',
  catBlack: '#3b3344',
  catBlackHi: '#5c5266',
  iceDark: '#3f8fc4',

  // mice
  furDark: '#5f5468',
  furMid: '#8e8296',
  furLight: '#c4bac6',
  pink: '#f2a2b4',

  // flowers
  petalWhite: '#f6f1e4',
  petalPink: '#f58fb8',
  petalRed: '#e2483f',
  petalPurple: '#9c6ad6',

  // saved for later phases (cats, effects)
  woodDark: '#6b4226',
  woodLight: '#a46e3f',
  ice: '#86dcff',
  laser: '#ff3d3d',
  sparkle: '#fffbe0',
};

// '#rrggbb' or '#rrggbbaa' -> [r, g, b, a]
export function toRGBA(name) {
  const hex = PALETTE[name];
  if (!hex) throw new Error(`Unknown palette color "${name}"`);
  const n = hex.slice(1);
  return [0, 2, 4, 6].map((i) => (i < n.length ? parseInt(n.slice(i, i + 2), 16) : 255));
}
