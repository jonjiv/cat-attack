import { objectDepth } from '../grid.js';

export function makeSparkleAnim(scene) {
  if (!scene.anims.exists('sparkle')) {
    scene.anims.create({ key: 'sparkle', frames: scene.anims.generateFrameNumbers('sparkle', { frames: [0, 1, 2, 3] }), frameRate: 14 });
  }
}

// A beaten mouse vanishes in a little burst of twinkling stars.
export function sparkleBurst(scene, x, y) {
  const offsets = [[0, -4], [-5, -1], [5, -2], [-2, 3], [3, 2]];
  offsets.forEach(([dx, dy], i) => {
    const s = scene.add.sprite(x + dx, y + dy, 'sparkle', 0).setDepth(objectDepth(y) + 2).setVisible(false);
    scene.time.delayedCall(i * 45, () => {
      s.setVisible(true).play('sparkle');
      s.once('animationcomplete', () => s.destroy());
    });
  });
}
