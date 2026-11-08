// Ground tiles, seen from overhead: 16x16 squares.
import { Grid, rng, TILE } from './lib.js';

const ANCHOR = [TILE / 2, TILE / 2];

function groundTile(seed, topColor, extras) {
  const g = new Grid(TILE, TILE);
  const r = rng(seed);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) g.set(x, y, topColor(r));
  }
  if (extras) extras(g, r);
  return g;
}

// A few 2px blades of bright grass scattered on the tile.
function blades(count) {
  return (g, r) => {
    for (let i = 0; i < count; i++) {
      const x = Math.floor(r() * TILE);
      const y = Math.floor(r() * (TILE - 1));
      g.set(x, y, 'grassHi');
      g.set(x, y + 1, 'grassLight');
    }
  };
}

function pebbles(count) {
  return (g, r) => {
    for (let i = 0; i < count; i++) {
      const x = 3 + Math.floor(r() * (TILE - 7));
      const y = 3 + Math.floor(r() * (TILE - 7));
      g.set(x, y, 'stoneLight');
      g.set(x + 1, y, 'stoneMid');
      g.set(x, y + 1, 'stoneDark');
    }
  };
}

const grassTop = (r) => {
  const v = r();
  if (v < 0.08) return 'grassLight';
  if (v < 0.14) return 'grassDark';
  return 'grassMid';
};

const dirtTop = (r) => {
  const v = r();
  if (v < 0.1) return 'dirtLight';
  if (v < 0.17) return 'dirtDark';
  if (v < 0.19) return 'dirtPale';
  return 'dirtMid';
};

// Path tiles join up with their neighbors. mask bits say which sides continue the path:
// 1 = up, 2 = right, 4 = down, 8 = left. Sides that don't get a ragged grass edge.
function pathTile(mask) {
  const g = groundTile(500 + mask, dirtTop, pebbles(1));
  const r = rng(900 + mask);
  const open = { up: mask & 1, right: mask & 2, down: mask & 4, left: mask & 8 };
  for (let i = 0; i < TILE; i++) {
    // Edge depth wobbles between 1 and 3 pixels so the border looks natural.
    const depths = [1, 2, 2, 3].map(() => 1 + Math.floor(r() * 3));
    const edges = [
      [!open.up, (d) => [i, d]],
      [!open.down, (d) => [i, TILE - 1 - d]],
      [!open.left, (d) => [d, i]],
      [!open.right, (d) => [TILE - 1 - d, i]],
    ];
    edges.forEach(([closed, at], k) => {
      if (!closed) return;
      const depth = depths[k];
      for (let d = 0; d < depth; d++) g.set(...at(d), grassTop(r));
      g.set(...at(depth), 'dirtDark');
    });
  }
  return g;
}

export const sprites = {
  grass0: { frames: [groundTile(11, grassTop, blades(3))], anchor: ANCHOR },
  grass1: { frames: [groundTile(22, grassTop, blades(2))], anchor: ANCHOR },
  grass2: { frames: [groundTile(33, grassTop, blades(4))], anchor: ANCHOR },
  // One frame per mask value 0-15.
  path: { frames: Array.from({ length: 16 }, (_, m) => pathTile(m)), anchor: ANCHOR },
};
