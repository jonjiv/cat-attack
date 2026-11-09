// Turns the pixel grids in art-src/ into PNG sprite sheets in assets/, plus assets/manifest.json.
// Run with: npm run sprites
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePNG } from './png.js';
import { toRGBA } from '../art-src/palette.js';
import * as tiles from '../art-src/tiles.js';
import * as props from '../art-src/props.js';
import * as cheese from '../art-src/cheese.js';
import * as ui from '../art-src/ui.js';
import * as mice from '../art-src/mice.js';
import * as fx from '../art-src/fx.js';
import * as cats from '../art-src/cats.js';
import * as weapons from '../art-src/weapons.js';
import { Grid } from '../art-src/lib.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GROUPS = { tiles, props, cheese, ui, mice, fx, cats, weapons };

// Frames are laid out left to right in one strip.
function sheetPixels(frames) {
  const fw = frames[0].w;
  const fh = frames[0].h;
  const width = fw * frames.length;
  const rgba = new Uint8Array(width * fh * 4);
  frames.forEach((f, i) => {
    if (f.w !== fw || f.h !== fh) throw new Error('All frames in a sprite must be the same size');
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const c = f.get(x, y);
        if (!c) continue;
        rgba.set(toRGBA(c), (y * width + i * fw + x) * 4);
      }
    }
  });
  return { width, height: fh, rgba, fw, fh };
}

const manifest = {};
for (const [folder, mod] of Object.entries(GROUPS)) {
  mkdirSync(join(ROOT, 'assets', folder), { recursive: true });
  for (const [key, def] of Object.entries(mod.sprites)) {
    const { width, height, rgba, fw, fh } = sheetPixels(def.frames);
    const file = `assets/${folder}/${key}.png`;
    writeFileSync(join(ROOT, file), encodePNG(width, height, rgba));
    manifest[key] = { file, frameWidth: fw, frameHeight: fh, frames: def.frames.length, anchor: def.anchor };
    console.log(`  ${file}  ${fw}x${fh} x${def.frames.length}`);
  }
}
writeFileSync(join(ROOT, 'assets', 'manifest.json'), JSON.stringify(manifest, null, 2));

// The app icon for phones: a Pouncer on grass, enlarged by a whole number so pixels stay square.
function writeIcon(size) {
  const g = new Grid(32, 32);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) g.set(x, y, 'grassMid');
  g.stamp(cats.sprites.pouncer.frames[0], 6, 7);
  const { rgba } = sheetPixels([g]);
  const zoom = size / 32;
  const big = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const from = (Math.floor(y / zoom) * 32 + Math.floor(x / zoom)) * 4;
      big.set(rgba.subarray(from, from + 4), (y * size + x) * 4);
    }
  }
  writeFileSync(join(ROOT, 'assets', `icon-${size}.png`), encodePNG(size, size, big));
}
writeIcon(192);
writeIcon(512);

console.log(`Built ${Object.keys(manifest).length} sprites.`);
