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

// Rocket Mouse: goggles and a jetpack (red with a yellow flame).
const ROCKET_FUR = { M: 'stoneLight', L: 'white', D: 'stoneMid', P: 'pink', I: 'iceDark' };
const JET = { R: 'red', Y: 'cheeseLight' };
const jetFins = art(['o..........o', 'R..........R'], JET);
const jetBack = art(['.oo.', 'oRRo', 'oRRo', 'oRRo', '.YY.'], JET);

// Nurse Mouse: pale fur and a white cap with a red cross.
const NURSE_FUR = { M: 'furLight', L: 'white', D: 'furMid', P: 'pink' };
const NURSE_CAP = { W: 'white', R: 'red' };
const nurseFront = art(['.oooooo.', 'oWWRRWWo', 'oWRRRRWo'], NURSE_CAP);
const nurseSide = art(['.oooooo', 'oWWRWWo', 'oWRRRWo'], NURSE_CAP);

// Mama Mouse: a pink apron (her belly color) and a red bow.
const MAMA_FUR = { M: 'furMid', L: 'petalPink', D: 'furDark', P: 'pink' };
const bow = art(['oo.oo', 'oRoRo', 'oo.oo'], { R: 'petalRed' });

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
  rocketMouse: {
    frames: mouseSheet(ROCKET_FUR, mouseRows({ frontFace: '..oIoIIoIo..', sideFace: '...oMMMMMIoIIo' }), {
      front: [jetFins, 1, 7],
      back: [jetBack, 5, 5],
      side: [jetBack, 1, 3],
    }),
    anchor: [7, 9],
  },
  nurseMouse: {
    frames: mouseSheet(NURSE_FUR, mouseRows(), { front: [nurseFront, 3, 0], back: [nurseFront, 3, 0], side: [nurseSide, 5, 0] }),
    anchor: [7, 9],
  },
  mamaMouse: {
    frames: mouseSheet(MAMA_FUR, mouseRows(), { front: [bow, 8, 0], back: [bow, 8, 0], side: [bow, 7, 0] }),
    anchor: [7, 9],
  },
  bossRat: { frames: bossRat, anchor: [11, 16] },
};
