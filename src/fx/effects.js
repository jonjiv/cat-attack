import { objectDepth } from '../grid.js';
import { PALETTE } from '../../art-src/palette.js';

const tint = (name) => Phaser.Display.Color.HexStringToColor(PALETTE[name]).color;
const RING_MAX = 32; // the ring sheet's biggest circle, in pixels

// An expanding dotted ring that reaches `radius`: hiss waves, stomp dust, hairball splats.
export function ringBurst(scene, x, y, radius, colorName, frames = [0, 1, 2, 3]) {
  const ring = scene.add
    .image(x, y, 'ring', frames[0])
    .setScale(radius / RING_MAX)
    .setTint(tint(colorName))
    .setDepth(objectDepth(y) + 1);
  frames.forEach((f, i) => scene.time.delayedCall(i * 60, () => ring.setFrame(f)));
  scene.tweens.add({ targets: ring, alpha: 0, delay: frames.length * 60 - 60, duration: 120, onComplete: () => ring.destroy() });
}

// Speedy Cat's claw marks over a mouse.
export function scratchMark(scene, x, y, flip) {
  const s = scene.add.image(x, y - 5, 'scratch').setFlipX(flip).setDepth(objectDepth(y) + 2);
  scene.tweens.add({ targets: s, alpha: 0, delay: 60, duration: 120, onComplete: () => s.destroy() });
}

// A "z" drifting up from a sleeping cat.
export function floatingZ(scene, x, y) {
  const z = scene.add.image(x, y, 'zee').setDepth(objectDepth(y + 20));
  scene.tweens.add({ targets: z, x: x + 5, y: y - 10, alpha: 0, duration: 1300, onComplete: () => z.destroy() });
}

// Robocat's laser: a red beam with a bright core, gone in a flash.
export function laserBeam(scene, from, to) {
  const beam = scene.add
    .graphics()
    .setDepth(objectDepth(Math.max(from.y, to.y)) + 2)
    .lineStyle(2, tint('laser'))
    .lineBetween(from.x, from.y, to.x, to.y)
    .lineStyle(1, tint('white'))
    .lineBetween(from.x, from.y, to.x, to.y);
  scene.time.delayedCall(90, () => beam.destroy());
}
