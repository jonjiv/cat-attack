import { objectDepth } from '../grid.js';

// A few cheese crumbs hop up and fall when a mouse takes a bite.
export function crumbBurst(scene, x, y, count = 6) {
  for (let i = 0; i < count; i++) {
    const crumb = scene.add.image(x, y, 'crumb').setDepth(objectDepth(y) + 1);
    const dx = Phaser.Math.Between(-10, 10);
    const hop = Phaser.Math.Between(5, 11);
    scene.tweens.add({
      targets: crumb,
      x: x + dx / 2,
      y: y - hop,
      duration: 160,
      ease: 'Quad.easeOut',
      onComplete: () =>
        scene.tweens.add({
          targets: crumb,
          x: x + dx,
          y: y + Phaser.Math.Between(0, 4),
          alpha: 0,
          duration: 260,
          ease: 'Quad.easeIn',
          onComplete: () => crumb.destroy(),
        }),
    });
  }
}
