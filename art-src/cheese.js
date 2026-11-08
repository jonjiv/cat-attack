// The cheese pile, built from wedges and wheels. 5 frames: full, 3/4, 1/2, 1/4, crumbs.
import { Grid, art, rng } from './lib.js';

const CHEESE = { L: 'cheesePale', Y: 'cheeseMid', d: 'cheeseDark', h: 'cheeseHole' };

const wedge = art(
  [
    'oo............',
    'oLoo..........',
    'oLLLoo........',
    'oYLLLLoo......',
    'oYYLLLLLoo....',
    'oYhYYLLLLLoo..',
    'oYYYYhYYLLLLoo',
    'oYhYYYYYYYYYdo',
    'oYYYYYYhYYYYdo',
    'oooooooooooooo',
  ],
  CHEESE,
);

const wheel = art(
  [
    '....oooooooo....',
    '..ooLLLLLLLLoo..',
    '.oLLLLLLLLLLLLo.',
    'oLLLLLLLLLLLLLLo',
    'oYLLLLLLLLLLLLYo',
    'oYYYLLLLLLLLYYYo',
    'oYYYYYYYYYYYYYdo',
    'oYYhYYYYYYhYYddo',
    '.oYYYYYhYYYYddo.',
    '..ooYYYYYYYYoo..',
    '....oooooooo....',
  ],
  CHEESE,
);

const W = 44;
const H = 34;
const BASE_Y = 30;

// Pieces are drawn in order (back to front). `show(stage)` says which stages include the piece.
const PIECES = [
  // top
  { art: wedge, x: 15, y: 5, show: (s) => s === 0 },
  // middle
  { art: wedge, x: 21, y: 12, flip: true, show: (s) => s <= 1 },
  { art: wheel, x: 8, y: 12, show: (s) => s <= 1 },
  // bottom
  { art: wedge, x: 4, y: 20, show: (s) => s <= 2 },
  { art: wedge, x: 26, y: 20, flip: true, show: (s) => s <= 2 },
  { art: wheel, x: 14, y: 20, show: (s) => s <= 2 },
  // last little wedge
  { art: wedge, x: 15, y: 20, show: (s) => s === 3 },
];

function shadow(g) {
  const cx = W / 2;
  const rx = 19;
  const ry = 4;
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) g.set(cx + x, BASE_Y + y, 'shadow');
    }
  }
}

function crumbs(g, count, seed) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const x = 6 + Math.floor(r() * (W - 12));
    const y = BASE_Y - 2 + Math.floor(r() * 5);
    g.set(x, y, r() < 0.5 ? 'cheeseLight' : 'cheeseMid');
    if (r() < 0.4) g.set(x + 1, y, 'cheeseDark');
  }
}

function pile(stage) {
  const g = new Grid(W, H);
  shadow(g);
  for (const p of PIECES) {
    if (p.show(stage)) g.stamp(p.art, p.x, p.y, p.flip);
  }
  crumbs(g, [0, 3, 6, 10, 16][stage], 100 + stage);
  return g;
}

export const sprites = {
  cheese: { frames: [0, 1, 2, 3, 4].map(pile), anchor: [W / 2, BASE_Y - 4] },
};
