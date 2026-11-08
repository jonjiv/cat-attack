// Helpers for drawing pixel art as grids of palette color names.

export class Grid {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.px = new Array(w * h).fill(null);
  }

  set(x, y, color) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.px[y * this.w + x] = color;
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.px[y * this.w + x];
  }

  // Copy another grid's non-transparent pixels onto this one.
  stamp(src, ox, oy, flip = false) {
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        const c = src.get(flip ? src.w - 1 - x : x, y);
        if (c) this.set(ox + x, oy + y, c);
      }
    }
    return this;
  }
}

// Build a grid from strings. '.' is transparent; 'o' is the outline color by default.
export function art(rows, legend) {
  const keys = { o: 'outline', ...legend };
  const w = Math.max(...rows.map((r) => r.length));
  rows.forEach((r, i) => {
    if (r.length !== w) console.warn(`  art row ${i} is ${r.length} wide, expected ${w}: "${r}"`);
  });
  const g = new Grid(w, rows.length);
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      if (!keys[ch]) throw new Error(`No legend entry for "${ch}" in row ${y}`);
      g.set(x, y, keys[ch]);
    });
  });
  return g;
}

// Small seeded random generator, so generated art is the same every build.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Overhead tiles are 16x16 squares.
export const TILE = 16;
