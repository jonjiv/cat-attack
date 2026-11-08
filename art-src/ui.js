// Interface pieces. For now: the tile cursor (frame 0 = can place, frame 1 = blocked).
import { Grid, art, TILE } from './lib.js';
import { CATS, catStats } from '../src/data/cats.js';

// Small cheese wedge for the cheese counter.
const cheeseIcon = art(
  ['oo.......', 'oLoo.....', 'oYLLoo...', 'oYhYLLoo.', 'oYYYYhYdo', 'ooooooooo'],
  { L: 'cheesePale', Y: 'cheeseMid', h: 'cheeseHole', d: 'cheeseDark' },
);

function cursor(color) {
  const g = new Grid(TILE, TILE);
  for (let i = 0; i < TILE; i++) {
    g.set(i, 0, color);
    g.set(i, TILE - 1, color);
    g.set(0, i, color);
    g.set(TILE - 1, i, color);
  }
  return g;
}

// A dotted circle showing how far a cat can reach, with a faint fill.
function rangeRing(radius) {
  const size = radius * 2 + 1;
  const g = new Grid(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - radius, y - radius);
      if (d <= radius - 0.5) g.set(x, y, 'whiteFill');
    }
  }
  // Walk around the edge one pixel at a time, drawing every other pixel.
  const steps = Math.round(2 * Math.PI * radius);
  for (let i = 0; i < steps; i += 2) {
    const a = (i / steps) * 2 * Math.PI;
    g.set(Math.round(radius + Math.cos(a) * radius), Math.round(radius + Math.sin(a) * radius), 'whiteFaint');
  }
  return g;
}

// Sound and music buttons: frame 0 on, frame 1 off (with a red X).
const ICON = { W: 'white', R: 'red' };
const speakerOn = art(
  ['...W.....', '..WW..W..', 'WWWW.W.W.', 'WWWW.W.W.', 'WWWW.W.W.', 'WWWW.W.W.', '..WW..W..', '...W.....'],
  ICON,
);
const speakerOff = art(
  ['...W.....', '..WW.....', 'WWWWR...R', 'WWWW.R.R.', 'WWWW..R..', 'WWWW.R.R.', '..WWR...R', '...W.....'],
  ICON,
);
const noteRows = ['...WWWWWW', '...W....W', '...W....W', '...W....W', '.WWW..WWW', 'WWWW.WWWW', 'WWW..WWW.', '.........'];
const redX = art(['R...R', '.R.R.', '..R..', '.R.R.', 'R...R'], ICON);
const noteOn = art(noteRows, ICON);
const noteOff = art(noteRows, ICON).stamp(redX, 4, 2);

export const sprites = {
  soundIcon: { frames: [speakerOn, speakerOff], anchor: [4, 4] },
  musicIcon: { frames: [noteOn, noteOff], anchor: [4, 4] },
  cursor: { frames: [cursor('white'), cursor('red')], anchor: [TILE / 2, TILE / 2] },
  cheeseIcon: { frames: [cheeseIcon], anchor: [4, 3] },
  // One reach circle per cat and level ("range-pouncer-2"), sized from the cat's range.
  ...Object.fromEntries(
    Object.values(CATS).flatMap((type) =>
      [1, 2, 3].map((level) => {
        const r = catStats(type, level).range;
        return [`range-${type.sprite}-${level}`, { frames: [rangeRing(r)], anchor: [r, r] }];
      }),
    ),
  ),
};
