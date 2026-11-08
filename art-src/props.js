// Things that sit on top of the field: bushes, rocks, flowers, tall grass, and the mouse hole.
import { Grid, art, rng, TILE } from './lib.js';

const bush = art(
  [
    '.....oooo.......',
    '...ooHHLLoooo...',
    '..oHHLLLLLHHLo..',
    '.oHLLLLMMLLLLMo.',
    '.oLLLMMLLLMMMMo.',
    'oLLMMMLLMMMMMMDo',
    'oMMMMMMMMMMMDDDo',
    'oMMDMMMMMMDDDDDo',
    '.oDDDMMMDDDDDDo.',
    '..ooDDDDDDDDoo..',
    '....oooooooo....',
  ],
  { H: 'grassHi', L: 'grassLight', M: 'grassMid', D: 'grassDark' },
);

const rock = art(
  [
    '....oooo....',
    '..ooSSSSoo..',
    '.oSSLLSSSSo.',
    'oSSLLSSSSSDo',
    'oSSSSSSSSDDo',
    'oDSSSSSSDDDo',
    '.oDDDDDDDDo.',
    '..oooooooo..',
  ],
  { S: 'stoneMid', L: 'stoneLight', D: 'stoneDark' },
);

const flowerRows = [
  '..w......',
  '.wYw..p..',
  '..w..pYp.',
  '..g...p..',
  '..gg..g..',
  '.g.g.gg..',
  '..ggg.g..',
  '...gggg..',
];
const flowersA = art(flowerRows, { w: 'petalWhite', p: 'petalPink', Y: 'cheeseLight', g: 'grassDark' });
const flowersB = art(flowerRows, { w: 'petalRed', p: 'petalPurple', Y: 'cheeseLight', g: 'grassDark' });

const mouseHole = art(
  [
    '........oooooooo........',
    '.....oooDDLLLLDDooo.....',
    '...ooDDDLLLLLLLLDDDoo...',
    '..oDDDDDDooooooDDDDDDo..',
    '.oDDDDDoo######ooDDDDDo.',
    '.oDDDDo##########oDDDDo.',
    'oDDDDDo##########oDDDDDo',
    'oDDDDo############oDDDDo',
    'oKDDDo############oDDKKo',
    'oKKDDo############oDKKKo',
    'oooooooooooooooooooooooo',
  ],
  { D: 'dirtMid', L: 'dirtLight', K: 'dirtDark', '#': 'hole' },
);

// Tall grass: a clump of blades standing on a whole tile. Sneaky mice will hide in here.
const TALL_UP = 6;
function tallGrass(seed) {
  const g = new Grid(TILE, TILE + TALL_UP);
  const r = rng(seed);
  const list = [];
  while (list.length < 44) {
    const x = Math.floor(r() * TILE);
    const y = 1 + Math.floor(r() * (TILE - 1));
    list.push({ x, y, h: 3 + Math.floor(r() * 6), lean: Math.floor(r() * 3) - 1, tone: r() });
  }
  list.sort((a, b) => a.y - b.y);
  for (const b of list) {
    const tip = b.tone < 0.5 ? 'grassHi' : 'grassLight';
    const body = b.tone < 0.65 ? 'grassDark' : 'grassLight';
    for (let k = 0; k < b.h; k++) {
      const x = b.x + Math.round((b.lean * k) / 4);
      const y = b.y + TALL_UP - k;
      g.set(x, y, k === 0 ? 'grassDark' : k === b.h - 1 ? tip : body);
    }
  }
  return g;
}

// A round, leafy tree for the meadow around the playing field. Lit from the top-left.
function tree(seed) {
  const W = 32;
  const H = 36;
  const g = new Grid(W, H);
  const r = rng(seed);

  // shadow on the ground
  for (let y = -3; y <= 3; y++) {
    for (let x = -11; x <= 11; x++) {
      if ((x * x) / 121 + (y * y) / 9 <= 1) g.set(16 + x, 32 + y, 'shadow');
    }
  }
  // trunk
  for (let y = 22; y <= 32; y++) {
    for (let x = 13; x <= 18; x++) {
      const edge = x === 13 || x === 18 || y === 32;
      g.set(x, y, edge ? 'outline' : x < 15 ? 'woodLight' : 'woodDark');
    }
  }
  // bumpy round canopy
  const cx = 16;
  const cy = 13;
  const bumps = r() * Math.PI;
  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const radius = 12.5 + Math.sin(Math.atan2(dy, dx) * 6 + bumps) * 1.2;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) continue;
      if (dist > radius - 1) {
        g.set(x, y, 'outline');
        continue;
      }
      const light = (-dx - dy) / (radius * 1.4) + (r() - 0.5) * 0.35;
      g.set(x, y, light > 0.45 ? 'grassHi' : light > 0.05 ? 'grassLight' : light > -0.45 ? 'grassMid' : 'grassDark');
    }
  }
  return g;
}

export const sprites = {
  bush: { frames: [bush], anchor: [8, 9] },
  rock: { frames: [rock], anchor: [6, 6] },
  flowersA: { frames: [flowersA], anchor: [4, 6] },
  flowersB: { frames: [flowersB], anchor: [4, 6] },
  mouseHole: { frames: [mouseHole], anchor: [12, 9] },
  tallGrass: { frames: [tallGrass(7), tallGrass(8)], anchor: [TILE / 2, TALL_UP + TILE / 2] },
  tree: { frames: [tree(3), tree(9)], anchor: [16, 30] },
};
