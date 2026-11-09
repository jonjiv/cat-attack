// Cats. Every sheet has 4 frames: 0-1 sitting (tail flick), 2 wind-up, 3 action.
// The Pouncer's action is a sideways leap; the others share one sitting body with
// different fur colors, faces, and a little extra (scarf, nightcap, antenna...).
import { Grid, art } from './lib.js';
import { WEAPON_ART } from './weapons.js';
import { CATS as CAT_DATA } from '../src/data/cats.js';

const W = 20;
const H = 20;

// Eye rows (row 6) and mouth rows (row 8).
const EYES = {
  open: '...oMGoMMMMMMoGMo...',
  closed: '...oMooMMMMMMooMo...',
  robot: '...oMGGMMMMMMGGMo...',
};
const MOUTH = {
  shut: '....oLLLLooLLLLo....',
  open: '....oLLLoPPoLLLo....',
};

// Sitting, facing the viewer. The tail curls around the right side.
const top = (eyes, mouth) => [
  '....................',
  '...oo..........oo...',
  '...oPo........oPo...',
  '...oPMooooooooMPo...',
  '...oMMMMMMMMMMMMo...',
  '...oMMMDMDDMDMMMo...',
  EYES[eyes],
  '...oLMMMMPPMMMMLo...',
  MOUTH[mouth],
];
const body = [
  '....oMDLLLLLLDMo....',
  '...oMMMDLLLLDMMMo...',
  '...oMMMLLLLLLMMMo...',
  '..oMMMMLLLLLLMMMMo..',
  '..oMDMMLLLLLLMMDMo..',
  '..oMMMMLLLLLLMMMMo..',
];
const tailDown = [
  '..oMDMMMLLLLMMMDMoMo',
  '..oMMWWMMMMMMWWMMoMo',
  '..oooooooooooooooMMo',
  '................ooo.',
  '....................',
];
const tailFlick = [
  '..oMDMMMLLLLMMMDMoMo',
  '..oMMWWMMMMMMWWMMoMo',
  '..ooooooooooooooooMo',
  '..................o.',
  '....................',
];

const sit = (eyes, mouth, tail = tailDown) => [...top(eyes, mouth), ...body, ...tail];
// Crouch: a shorter body, so the head drops 2 pixels.
const crouch = (eyes, mouth) => ['....................', '....................', ...top(eyes, mouth), ...body.slice(2), ...tailDown];

const pouncerLeap = [
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '..............o..o..',
  '.............oPooPo.',
  'oo..ooooooooooMMMMo.',
  'oMooMMDMMDMMMDMMGoMo',
  '.oMMMMMMMMMMMMMMMMPo',
  '..oMMDMMDMMMMMMLLLo.',
  '..oLLLLLLLLLLLLLLo..',
  '.oWo..oooooooooo.oWo',
  'oWo..............oWo',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
];

// Extras drawn on top of the cat. head: true means it moves down with the head when crouching.
const EXTRAS = {
  scarf: {
    rows: ['oSSSSSSSSSSo', '........oSSo', '........oSo.'],
    legend: { S: 'iceDark' }, x: 4, y: 9, head: false,
  },
  nightcap: {
    rows: ['.....ooo......', '....oBBBoo....', '...oBBBBBBooo.', '..oBBBBBBBBBWo', '.oWWWWWWWWWWo.'],
    legend: { B: 'petalPurple', W: 'white' }, x: 3, y: 0, head: true,
  },
  antenna: {
    rows: ['RR', 'oo', 'oo'],
    legend: { R: 'laser' }, x: 9, y: 0, head: true,
  },
  headband: {
    rows: ['RRRRRRRRRRRRRR', '............oR'],
    legend: { R: 'red' }, x: 4, y: 5, head: true,
  },
  yarnBall: {
    rows: ['.oooo.', 'oPpPPo', 'oPPpPo', 'opPPpo', 'oPPpPo', '.oooo.'],
    legend: { P: 'petalPink', p: 'petalPurple' }, x: 0, y: 13, head: false,
  },
  // Hairball Cat: shaggy cheek fur (where the hairballs come from), and a spare hairball.
  cheekFluff: {
    rows: [
      '.oo..............oo.',
      '..oFF..........FFo..',
      'ooFFF..........FFFoo',
      '..ooF..........Foo..',
      '...oo..........oo...',
    ],
    legend: { F: 'stoneLight' }, x: 0, y: 5, head: true,
  },
  spareHairball: {
    rows: ['..o.o..', '.ooooo.', 'ooSsSSo', '.oSSsSo', 'ooSsSSo', '.ooooo.', '..o.o..'],
    legend: { S: 'stoneMid', s: 'stoneLight' }, x: 0, y: 12, head: false,
  },
  // Hiss Cat's megaphone, to make that hiss extra loud.
  megaphone: {
    rows: ['oo.....', 'oYoo...', 'oYYYoo.', 'oYYYYRo', 'oYYYoo.', 'oYoo...', 'oo.....'],
    legend: { Y: 'cheeseMid', R: 'red' }, x: 0, y: 8, head: false,
  },
  // Fisher Cat: a bucket hat, a fishing rod, and (when it gets a bite) a fish on the line.
  bucketHat: {
    rows: ['...oooooo...', '..oHHHHHHo..', '..oHHHHHHo..', 'oBBBBBBBBBBo'],
    legend: { H: 'woodLight', B: 'woodDark' }, x: 4, y: 1, head: true,
  },
  rod: {
    rows: ['.....R', '.....R', '....R.', '....R.', '...R..', '...R..', '..R...', '..R...', '.R....', '.R....', 'R.....'],
    legend: { R: 'woodDark' }, x: 14, y: 2, head: false,
  },
  caughtFish: {
    rows: ['oIIo.', 'IIIIo', 'oIIo.'],
    legend: { I: 'ice' }, x: 15, y: 0, head: false,
  },
  // Wizard Cat: a starry pointed hat and a star wand.
  wizardHat: {
    rows: ['....oo....', '...oBBo...', '..oBYBBo..', '.oBBBBYBo.', 'oYYYYYYYYo'],
    legend: { B: 'iceDark', Y: 'cheeseLight' }, x: 5, y: 0, head: true,
  },
  wand: {
    rows: ['..Y..', 'YYYYY', '.YKY.', 'Y...Y', '..W..', '..W..', '.W...', '.W...'],
    legend: { Y: 'cheeseLight', K: 'white', W: 'woodLight' }, x: 15, y: 4, head: false,
  },
  // Level 3 for the wizard: a gold star on the hat, since a crown would hide it.
  hatStar: {
    rows: ['..Y..', 'YYYYY', '.YRY.'],
    legend: { Y: 'cheeseLight', R: 'red' }, x: 8, y: 1, head: true,
  },
  // Tiny Cat Army's upgrades, sized for the commander kitten at the back.
  armyMedal: {
    rows: ['RYYR'],
    legend: { R: 'red', Y: 'cheeseLight' }, x: 8, y: 8, head: false,
  },
  armyCrown: {
    rows: ['Y.YY.Y', 'YYYYYY'],
    legend: { Y: 'cheeseLight' }, x: 7, y: 0, head: false,
  },
  // Upgrade badges: a red collar with a gold bell (level 2), then a crown (level 3).
  collar: {
    rows: ['RRRRYYRRRR', '....YY....'],
    legend: { R: 'red', Y: 'cheeseLight' }, x: 5, y: 9, head: true,
  },
  crown: {
    rows: ['Y.YY.Y', 'YYYYYY', 'YRYYRY'],
    legend: { Y: 'cheeseLight', R: 'red' }, x: 7, y: 1, head: true,
  },
  // Speedy Cat's raised paw, mid-swipe.
  paw: {
    rows: ['.oo.', 'oWWo', 'oWWo', '.oMo', '.oMo'],
    legend: { W: 'white', M: 'catBlack' }, x: 16, y: 6, head: false,
  },
};

// Level 4: each cat wears its end-of-tree weapon in the top-right corner.
for (const [name, type] of Object.entries(CAT_DATA)) {
  const { rows, legend } = WEAPON_ART[type.tree.weapon.fire.icon];
  EXTRAS[`weapon_${name}`] = { rows, legend, x: W - rows[0].length, y: 0, head: false };
}

// frames: list of [rows, extra names, crouched, noBadges]. crouched frames shift head extras
// down by 2. badges (upgrade collar/crown) go on every frame except noBadges ones (the leap).
function sheet(legend, frames, badges = []) {
  return frames.map(([rows, extras = [], crouched = false, noBadges = false]) => {
    const g = new Grid(W, H).stamp(art(rows, legend), 0, 0);
    for (const name of noBadges ? extras : [...extras, ...badges]) {
      const e = EXTRAS[name];
      g.stamp(art(e.rows, e.legend), e.x, e.y + (crouched && e.head ? 2 : 0));
    }
    return g;
  });
}

// A typical cat: sits, crouches to wind up, then acts with its mouth open.
function standard(legend, extras, eyes = 'open') {
  return [
    [sit(eyes, 'shut'), extras],
    [sit(eyes, 'shut', tailFlick), extras],
    [crouch(eyes, 'shut'), extras, true],
    [sit(eyes, 'open'), extras],
  ];
}

const FUR = {
  tabby: { M: 'catMid', D: 'catDark', L: 'catLight', W: 'catCream', P: 'pink', G: 'grassHi' },
  grey: { M: 'stoneLight', D: 'stoneMid', L: 'stoneHi', W: 'white', P: 'pink', G: 'cheeseLight' },
  cream: { M: 'catCream', D: 'catLight', L: 'white', W: 'white', P: 'pink', G: 'ice' },
  frost: { M: 'stoneHi', D: 'ice', L: 'white', W: 'white', P: 'pink', G: 'iceDark' },
  black: { M: 'catBlack', D: 'catBlack', L: 'catBlackHi', W: 'white', P: 'pink', G: 'cheeseLight' },
  calico: { M: 'white', D: 'catMid', L: 'catCream', W: 'white', P: 'pink', G: 'grassHi' },
  sleepy: { M: 'dirtLight', D: 'dirtMid', L: 'dirtPale', W: 'catCream', P: 'pink', G: 'grassHi' },
  metal: { M: 'stoneLight', D: 'stoneMid', L: 'stoneHi', W: 'stoneMid', P: 'laser', G: 'laser' },
  blue: { M: 'iceDark', D: 'catBlackHi', L: 'ice', W: 'white', P: 'pink', G: 'cheeseLight' },
  mystic: { M: 'petalPurple', D: 'catBlackHi', L: 'petalPink', W: 'white', P: 'pink', G: 'cheeseLight' },
};

// ---- Tiny Cat Army: three kittens in camo helmets, drawn as one 20x20 group ----

const HELMET = { H: 'dirtLight', S: 'dirtDark' };
const kitten = (mouth) => [
  'o.oooo.o',
  'oPoHSoPo',
  'oPHSHHPo',
  'oooooooo',
  'oMGMMGMo',
  mouth,
  '.oLLLLo.',
  'oMLLLLMo',
  'oMMMMMMo',
  '.oooooo.',
];
const KITTEN_FUR = [FUR.tabby, FUR.grey, FUR.black];
const kittenArt = (fur, mouth = 'oMMPPMMo') => art(kitten(mouth), { ...fur, ...HELMET });

// One frame: y positions of the back kitten and the two in front (null = off charging).
function armyFrame({ back = 2, left = 9, right = 9, mouth }, badges) {
  const g = new Grid(W, H);
  g.stamp(kittenArt(KITTEN_FUR[1], mouth), 6, back);
  if (left !== null) g.stamp(kittenArt(KITTEN_FUR[0]), 0, left);
  if (right !== null) g.stamp(kittenArt(KITTEN_FUR[2]), 12, right);
  for (const name of badges) {
    const e = EXTRAS[name];
    g.stamp(art(e.rows, e.legend), e.x, e.y);
  }
  return g;
}

// 0-1 standing guard (one kitten bobs), 2 crouching, 3 the commander shouts while the others charge.
const armySheet = (badges) =>
  [{}, { right: 8 }, { left: 10, right: 10 }, { left: null, right: null, mouth: 'oMPooPMo' }].map((pose) => armyFrame(pose, badges));

const ANCHOR = [10, 15];

// Each cat: its fur and its 4 frames.
const CATS = {
  pouncer: [FUR.tabby, [[sit('open', 'shut')], [sit('open', 'shut', tailFlick)], [crouch('open', 'shut'), [], true], [pouncerLeap, [], false, true]]],
  hairball: [FUR.grey, standard(FUR.grey, ['cheekFluff', 'spareHairball'])],
  yarn: [FUR.cream, standard(FUR.cream, ['yarnBall'])],
  ice: [FUR.frost, standard(FUR.frost, ['scarf'])],
  speedy: [
    FUR.black,
    [
      [sit('open', 'shut'), ['headband']],
      [sit('open', 'shut', tailFlick), ['headband']],
      [crouch('open', 'shut'), ['headband'], true],
      [sit('open', 'open'), ['headband', 'paw']],
    ],
  ],
  hiss: [FUR.calico, standard(FUR.calico, ['megaphone'])],
  // Sleepy Cat: asleep (eyes shut, breathing), awake, then a squashed stomp.
  sleepy: [
    FUR.sleepy,
    [
      [sit('closed', 'shut'), ['nightcap']],
      [sit('closed', 'shut', tailFlick), ['nightcap']],
      [sit('open', 'open'), ['nightcap']],
      [crouch('open', 'open'), ['nightcap'], true],
    ],
  ],
  robocat: [FUR.metal, standard(FUR.metal, ['antenna'], 'robot')],
  fisher: [
    FUR.blue,
    [
      ...standard(FUR.blue, ['bucketHat', 'rod']).slice(0, 3),
      [sit('open', 'open'), ['bucketHat', 'rod', 'caughtFish']],
    ],
  ],
  wizard: [FUR.mystic, standard(FUR.mystic, ['wizardHat', 'wand']), { '': [], 2: ['collar'], 3: ['collar', 'hatStar'] }],
};

// Four sheets per cat: "pouncer" (level 1), "pouncer2" (collar), "pouncer3" (collar and crown),
// and "pouncer4" (all that, plus its weapon).
const LEVEL_BADGES = { '': [], 2: ['collar'], 3: ['collar', 'crown'] };

export const sprites = {
  ...Object.fromEntries(
    Object.entries(CATS).flatMap(([name, [fur, frames, levelBadges = LEVEL_BADGES]]) =>
      Object.entries({ ...levelBadges, 4: [...levelBadges[3], `weapon_${name}`] }).map(([level, badges]) => [
        name + level,
        { frames: sheet(fur, frames, badges), anchor: ANCHOR },
      ]),
    ),
  ),
  army: { frames: armySheet([]), anchor: ANCHOR },
  army2: { frames: armySheet(['armyMedal']), anchor: ANCHOR },
  army3: { frames: armySheet(['armyMedal', 'armyCrown']), anchor: ANCHOR },
  army4: { frames: armySheet(['armyMedal', 'armyCrown', 'weapon_army']), anchor: ANCHOR },
  // One kitten charging at a mouse.
  armySoldier: { frames: [new Grid(8, 10).stamp(kittenArt(KITTEN_FUR[0]), 0, 0)], anchor: [4, 5] },
};
