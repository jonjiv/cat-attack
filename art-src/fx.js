// Small effect pieces.
import { Grid, art } from './lib.js';

// Things cats throw.
const hairball = art(['.ooo.', 'oSsSo', 'osSso', 'oSsSo', '.ooo.'], { S: 'stoneMid', s: 'stoneLight' });
const yarnBall = art(['.ooo.', 'oPpPo', 'opPpo', 'oPpPo', '.ooo.'], { P: 'petalPink', p: 'petalPurple' });
const iceShard = art(['..o..', '.oIo.', 'oIWIo', '.oIo.', '..o..'], { I: 'ice', W: 'white' });

// Expanding dotted ring (white, tinted in game): hiss sound wave, stomp dust, hairball splat.
const RING_MAX = 32;
function ring(radius) {
  const size = RING_MAX * 2 + 1;
  const g = new Grid(size, size);
  const steps = Math.round(2 * Math.PI * radius);
  for (let i = 0; i < steps; i += 2) {
    const a = (i / steps) * 2 * Math.PI;
    g.set(Math.round(RING_MAX + Math.cos(a) * radius), Math.round(RING_MAX + Math.sin(a) * radius), 'white');
  }
  return g;
}

// A sleeping "z" and Speedy Cat's claw marks.
const zee = art(['WWW', '..W', '.W.', 'WWW'], { W: 'white' });
const scratch = art(['W.W.W..', '.W.W.W.', '..W.W.W'], { W: 'white' });

// A cheese crumb that flies off when a mouse takes a bite.
const crumb = art(['Yd', 'dd'], { Y: 'cheeseLight', d: 'cheeseDark' });

// The twinkle a beaten mouse vanishes in: grows into a star, then fades.
const SPARK = { W: 'white', s: 'sparkle', p: 'cheesePale' };
const sparkle = [
  ['.......', '.......', '.......', '...W...', '.......', '.......', '.......'],
  ['.......', '.......', '...s...', '..sWs..', '...s...', '.......', '.......'],
  ['...s...', '...W...', '..pWp..', 'sWWWWWs', '..pWp..', '...W...', '...s...'],
  ['.......', '.......', '...p...', '..psp..', '...p...', '.......', '.......'],
].map((rows) => art(rows, SPARK));

// A fish treat: the money for buying cats.
const treat = art(
  [
    '..oooo.oo',
    '.oBHBBoBo',
    'oBoBBBBBo',
    'oBBBBBBBo',
    '.oBBBBoBo',
    '..oooo.oo',
  ],
  { B: 'ice', H: 'white' },
);

export const sprites = {
  crumb: { frames: [crumb], anchor: [1, 1] },
  sparkle: { frames: sparkle, anchor: [3, 3] },
  treat: { frames: [treat], anchor: [4, 3] },
  hairballShot: { frames: [hairball], anchor: [2, 2] },
  yarnShot: { frames: [yarnBall], anchor: [2, 2] },
  iceShot: { frames: [iceShard], anchor: [2, 2] },
  ring: { frames: [8, 16, 24, 32].map(ring), anchor: [RING_MAX, RING_MAX] },
  zee: { frames: [zee], anchor: [1, 2] },
  scratch: { frames: [scratch], anchor: [3, 1] },
};
