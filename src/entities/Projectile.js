import { objectDepth } from '../grid.js';

// Something a cat throws. It follows the mouse as it flies (so it lands on it), rising `arc`
// pixels at the middle. If the mouse is gone, it lands where the mouse last was.
// onLand gets the landing spot.
export function throwAt(scene, key, from, target, { duration, arc = 0 }, onLand) {
  const shot = scene.add.image(from.x, from.y, key);
  // Aim at the mouse's middle rather than its feet.
  let aim = { x: target.x, y: target.y - 4 };
  const flight = { t: 0 };
  scene.tweens.add({
    targets: flight,
    t: 1,
    duration,
    onUpdate: () => {
      if (target.alive) aim = { x: target.x, y: target.y - 4 };
      const groundY = from.y + (aim.y - from.y) * flight.t;
      shot.setPosition(from.x + (aim.x - from.x) * flight.t, groundY - Math.sin(flight.t * Math.PI) * arc);
      shot.setDepth(objectDepth(groundY) + 1);
    },
    onComplete: () => {
      shot.destroy();
      onLand(aim);
    },
  });
}
