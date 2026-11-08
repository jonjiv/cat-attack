// The Field's 15 waves. Each wave is a list of groups that start together:
//   mouse: key in MICE, count: how many, every: ms between them, delay: ms before the group starts.
// New mice join as the waves go on: speedy from wave 3, armored from 5, sneaky from 7,
// and a Big Boss Rat at the end of waves 5, 10, and 15 (two of them in 15).
export const WAVES = [
  /* 1 */ [{ mouse: 'field', count: 6, every: 1600 }],
  /* 2 */ [{ mouse: 'field', count: 8, every: 1400 }],
  /* 3 */ [
    { mouse: 'field', count: 6, every: 1400 },
    { mouse: 'speedy', count: 4, every: 1200, delay: 6000 },
  ],
  /* 4 */ [
    { mouse: 'field', count: 8, every: 1000 },
    { mouse: 'speedy', count: 6, every: 900, delay: 5000 },
  ],
  /* 5 */ [
    { mouse: 'field', count: 8, every: 1000 },
    { mouse: 'armored', count: 3, every: 2500, delay: 4000 },
    { mouse: 'boss', count: 1, every: 0, delay: 14000 },
  ],
  /* 6 */ [
    { mouse: 'field', count: 10, every: 900 },
    { mouse: 'armored', count: 3, every: 2000, delay: 3000 },
    { mouse: 'speedy', count: 8, every: 700, delay: 6000 },
  ],
  /* 7 */ [
    { mouse: 'field', count: 10, every: 900 },
    { mouse: 'sneaky', count: 5, every: 1500, delay: 5000 },
    { mouse: 'speedy', count: 6, every: 700, delay: 12000 },
  ],
  /* 8 */ [
    { mouse: 'armored', count: 6, every: 1600 },
    { mouse: 'sneaky', count: 6, every: 1200, delay: 4000 },
    { mouse: 'field', count: 10, every: 700, delay: 10000 },
  ],
  /* 9 */ [
    { mouse: 'speedy', count: 16, every: 450 },
    { mouse: 'field', count: 12, every: 800, delay: 4000 },
    { mouse: 'sneaky', count: 6, every: 1100, delay: 9000 },
  ],
  /* 10 */ [
    { mouse: 'field', count: 14, every: 700 },
    { mouse: 'armored', count: 6, every: 1500, delay: 3000 },
    { mouse: 'sneaky', count: 6, every: 1000, delay: 8000 },
    { mouse: 'boss', count: 1, every: 0, delay: 16000 },
  ],
  /* 11 */ [
    { mouse: 'speedy', count: 12, every: 500 },
    { mouse: 'armored', count: 8, every: 1300, delay: 4000 },
    { mouse: 'sneaky', count: 8, every: 900, delay: 9000 },
  ],
  /* 12 */ [
    { mouse: 'field', count: 20, every: 500 },
    { mouse: 'armored', count: 10, every: 1100, delay: 5000 },
    { mouse: 'speedy', count: 12, every: 450, delay: 12000 },
  ],
  /* 13 */ [
    { mouse: 'sneaky', count: 12, every: 800 },
    { mouse: 'armored', count: 10, every: 1000, delay: 4000 },
    { mouse: 'speedy', count: 16, every: 400, delay: 10000 },
  ],
  /* 14 */ [
    { mouse: 'field', count: 24, every: 400 },
    { mouse: 'armored', count: 12, every: 900, delay: 3000 },
    { mouse: 'sneaky', count: 12, every: 700, delay: 8000 },
    { mouse: 'speedy', count: 16, every: 350, delay: 14000 },
  ],
  /* 15 */ [
    { mouse: 'armored', count: 12, every: 900 },
    { mouse: 'sneaky', count: 12, every: 700, delay: 3000 },
    { mouse: 'speedy', count: 20, every: 350, delay: 8000 },
    { mouse: 'boss', count: 2, every: 6000, delay: 14000 },
  ],
];

// Mice get tougher and quicker every wave (wave numbers start at 1). Health grows gently at
// first and faster later: about x1.3 by wave 5, x2 by wave 10, x3 by wave 15. Speed: +2% a wave.
export function scaleForWave(type, wave) {
  const n = wave - 1;
  return {
    ...type,
    health: type.health * (1 + 0.06 * n + 0.006 * n * n),
    speed: type.speed * (1 + 0.02 * (wave - 1)),
  };
}

// Fish treats for clearing a wave.
export function waveBonus(wave) {
  return 5 + wave;
}
