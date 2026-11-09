// Interface pieces. For now: the tile cursor (frame 0 = can place, frame 1 = blocked).
import { Grid, art, TILE } from './lib.js';
import { CATS, catStats } from '../src/data/cats.js';

// Tech tree buttons for the two upgrade branches.
const iconPower = art(['....W', '...W.', 'W.W..', '.W...', 'W.W..'], { W: 'white' });
const iconSkill = art(['..YY.', '.YY..', 'YYYY.', '..YY.', '.YY..'], { Y: 'cheeseLight' });

// Every reach a cat can have, whichever upgrades it owns.
const OWNED_SETS = [[], ['power'], ['skill'], ['power', 'skill'], ['power', 'skill', 'weapon']];
const RADII = [...new Set(Object.values(CATS).flatMap((type) => OWNED_SETS.map((o) => catStats(type, new Set(o)).range)))];

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

// Full screen button: frame 0 go full screen, frame 1 leave it.
const fullEnter = art(['WWW...WWW', 'W.......W', 'W.......W', '.........', '.........', 'W.......W', 'W.......W', 'WWW...WWW'], ICON);
const fullExit = art(['..W...W..', '..W...W..', 'WWW...WWW', '.........', '.........', 'WWW...WWW', '..W...W..', '..W...W..'], ICON);

export const sprites = {
  fullIcon: { frames: [fullEnter, fullExit], anchor: [4, 4] },
  soundIcon: { frames: [speakerOn, speakerOff], anchor: [4, 4] },
  musicIcon: { frames: [noteOn, noteOff], anchor: [4, 4] },
  cursor: { frames: [cursor('white'), cursor('red')], anchor: [TILE / 2, TILE / 2] },
  cheeseIcon: { frames: [cheeseIcon], anchor: [4, 3] },
  iconPower: { frames: [iconPower], anchor: [2, 2] },
  iconSkill: { frames: [iconSkill], anchor: [2, 2] },
  // One reach circle per distance ("range-36"), shared by any cats with that reach.
  ...Object.fromEntries(RADII.map((r) => [`range-${r}`, { frames: [rangeRing(r)], anchor: [r, r] }])),
};
