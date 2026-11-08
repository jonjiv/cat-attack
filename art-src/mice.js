// Mice. Each sheet has 6 frames: walk down (2), walk up (2), walk right (2). Left = right flipped.
// Every kind of mouse is the same field mouse drawing with different fur and a little extra
// (bottle-cap helmet, bandit mask). The Big Boss Rat is its own, bigger drawing.
import { Grid, art } from './lib.js';

const W = 14;
const H = 12;

const head = ['.ooo....ooo.', 'oPPPo..oPPPo', 'oPPPMooMPPPo', '.ooMMMMMMoo.'];
const backHead = ['.ooo....ooo.', 'oMMMo..oMMMo', 'oMMMMooMMMMo', '.ooMMMMMMoo.'];

// face: the eye row of the front view (the sneaky mouse swaps in a bandit mask).
const down = (feet, face = '..oMoMMoMo..') => [
  ...head,
  face,
  '..oMMMMMMo..',
  '...oMPPMo...',
  '..oLLMMLLo..',
  '.oMLLLLLLMo.',
  '.oMLLLLLLMo.',
  '..oMMMMMMo..',
  feet,
];

const up = (tail1, tail2) => [
  ...backHead,
  '..oMMMMMMo..',
  '..oMMMMMMo..',
  '.oMMMMMMMMo.',
  '.oMMMMMMMMo.',
  '.oMDMMMMDMo.',
  '..oooooooo..',
  tail1,
  tail2,
];

const side = (tail5, tail6, feet, face = '...oMMMMMMoMMo') => [
  '......ooo.....',
  '.....oPPPo....',
  '.....oPPMoo...',
  '....oMMMMMMoo.',
  face,
  tail5,
  tail6,
  '..oLLLLLLLMo..',
  '...oLLLLLLo...',
  feet,
  '..............',
  '..............',
];

// The six frames as rows, in sheet order, with which view each one is.
function mouseRows({ frontFace, sideFace } = {}) {
  return [
    ['front', down('...oo..oo...', frontFace)],
    ['front', down('..oo....oo..', frontFace)],
    ['back', up('.....oPo....', '......oPo...')],
    ['back', up('......oPo...', '.....oPo....')],
    ['side', side('..oMMMMMMMMMPo', 'PPoMMMMMMMMMo.', '....oo..oo....', sideFace)],
    ['side', side('P.oMMMMMMMMMPo', '.PoMMMMMMMMMo.', '.....oo.oo....', sideFace)],
  ];
}

// Build a sheet. extras: { front, back, side } -> [art, x, y] drawn on top of that view.
function mouseSheet(legend, rows, extras = {}) {
  return rows.map(([view, r]) => {
    const a = art(r, legend);
    // Front and back views are 12 wide; center them in the 14-wide frame.
    const g = new Grid(W, H).stamp(a, Math.floor((W - a.w) / 2), 0);
    if (extras[view]) g.stamp(...extras[view]);
    return g;
  });
}

const FIELD_FUR = { M: 'furMid', L: 'furLight', D: 'furDark', P: 'pink' };
const SPEEDY_FUR = { M: 'dirtLight', L: 'dirtPale', D: 'dirtMid', P: 'pink' };
const SNEAKY_FUR = { M: 'furDark', L: 'furMid', D: 'catBlack', P: 'pink', K: 'outline' };

// A bottle cap worn as a helmet: red with silver ridges.
const CAP = { R: 'red', S: 'stoneHi' };
const capFront = art(['.oooooo.', 'oRSRSRSo', 'oRRRRRRo'], CAP);
const capSide = art(['.oooooo', 'oSRSRSo', 'oRRRRRo'], CAP);

// ---- Big Boss Rat: 22x18 frames, darker and bigger, red eyes, buck teeth, and a crown ----

const RW = 22;
const RH = 18;
const RAT_FUR = { M: 'furDark', D: 'catBlack', L: 'furMid', P: 'pink', R: 'laser', W: 'white' };
const crown = art(['Y.Y.Y', 'YYYYY', 'YYYYY'], { Y: 'cheeseLight' });

const ratFront = (feet) => [
  '.ooo........ooo.',
  'oPPPo......oPPPo',
  'oPPPMooooooMPPPo',
  '.oPMMMMMMMMMMPo.',
  '.oMMMMMMMMMMMMo.',
  '.oMMRoMMMMoRMMo.',
  '..oMMMMMMMMMMo..',
  '..oMMMMPPMMMMo..',
  '...oMMoWWoMMo...',
  '..oDMMMooMMMDo..',
  '.oDMMLLLLLLMMDo.',
  'oDMMLLLLLLLLMMDo',
  'oDMMLLLLLLLLMMDo',
  'oDMMLLLLLLLLMMDo',
  'oDDMMLLLLLLMMDDo',
  '.oDDMMMMMMMMDDo.',
  feet,
  '................',
];

const ratBack = (t1, t2, t3, t4) => [
  '.ooo........ooo.',
  'oDDDo......oDDDo',
  'oDDDMooooooMDDDo',
  '.oMMMMMMMMMMMMo.',
  '.oMMMMMMMMMMMMo.',
  '.oMMMMMMMMMMMMo.',
  '..oMMMMMMMMMMo..',
  '.oDMMMMMMMMMMDo.',
  'oDMMMMDMMDMMMMDo',
  'oDMMMMMMMMMMMMDo',
  'oDMMMDMMMMDMMMDo',
  'oDMMMMMMMMMMMMDo',
  '.oDMMMMMMMMMMDo.',
  '..oooooooooooo..',
  t1,
  t2,
  t3,
  t4,
];

const ratSide = (tail8, tail9, feet) => [
  '......................',
  '......................',
  '......................',
  '......................',
  '......................',
  '......................',
  '..............ooo.....',
  '.............oPPPo....',
  '.............oPPMoo...',
  '......ooooooooMMMMMoo.',
  '....ooMMMMMMMMMMMRoMMo',
  '...oDMMMMMMMMMMMMMMMPo',
  '..oDMMMMMMMMMMMMMMMMo.',
  '..oDMMMMMMMMMMMMMWWo..',
  tail8,
  tail9,
  feet,
  '......................',
];

function ratFrame(rows, view) {
  const a = art(rows, RAT_FUR);
  const g = new Grid(RW, RH).stamp(a, Math.floor((RW - a.w) / 2), 0);
  if (view === 'side') g.stamp(crown, 9, 6);
  else g.stamp(crown, 9, 0);
  return g;
}

const bossRat = [
  ratFrame(ratFront('..ooPPooooPPoo..'), 'front'),
  ratFrame(ratFront('...oPPooooPPo...'), 'front'),
  ratFrame(ratBack('.......oPo......', '........oPo.....', '.........oPo....', '..........oo....'), 'back'),
  ratFrame(ratBack('.......oPo......', '......oPo.......', '.....oPo........', '.....oo.........'), 'back'),
  ratFrame(ratSide('PPoDMMLLLLLLLLLMMoo...', 'P..oDLLLLLLLLLLLo.....', '....oooPPooooPPoo.....'), 'side'),
  ratFrame(ratSide('PPoDMMLLLLLLLLLMMoo...', '.P.oDLLLLLLLLLLLo.....', '....ooPPoooooPPo......'), 'side'),
];

export const sprites = {
  mouse: { frames: mouseSheet(FIELD_FUR, mouseRows()), anchor: [7, 9] },
  speedyMouse: { frames: mouseSheet(SPEEDY_FUR, mouseRows()), anchor: [7, 9] },
  armoredMouse: {
    frames: mouseSheet(FIELD_FUR, mouseRows(), { front: [capFront, 3, 0], back: [capFront, 3, 0], side: [capSide, 5, 0] }),
    anchor: [7, 9],
  },
  sneakyMouse: {
    frames: mouseSheet(SNEAKY_FUR, mouseRows({ frontFace: '..oKoKKoKo..', sideFace: '...oMMMMMKoKKo' })),
    anchor: [7, 9],
  },
  bossRat: { frames: bossRat, anchor: [11, 16] },
};
