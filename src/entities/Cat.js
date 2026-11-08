import { toWorld, objectDepth } from '../grid.js';
import { catStats, upgradeCost, MAX_LEVEL } from '../data/cats.js';
import { throwAt } from './Projectile.js';
import { ringBurst, scratchMark, floatingZ, laserBeam } from '../fx/effects.js';
import { sound } from '../audio/sound.js';

// Frames in every cat sheet: 0-1 sitting, 2 wind-up, 3 action.
const SIT = 0;
const WINDUP = 2;
const ACTION = 3;

const LEAP_HEIGHT = 8;
// Where a sitting cat's mouth and eyes are, relative to the tile center.
const MOUTH_Y = -6;
const EYES_Y = -9;

// Sprite sheet for a cat at a level: "pouncer", "pouncer2", "pouncer3".
export function catSheet(type, level) {
  return level === 1 ? type.sprite : `${type.sprite}${level}`;
}

export function makeCatAnims(scene, type) {
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const sheet = catSheet(type, level);
    const key = `${sheet}-idle`;
    if (scene.anims.exists(key)) continue;
    // Sleepy Cat breathes slowly; everyone else sits still with the odd tail flick.
    const sleepy = type.power === 'stomp';
    const frames = scene.anims.generateFrameNumbers(sheet, { frames: sleepy ? [0, 1] : [0, 0, 0, 0, 0, 1, 0, 1] });
    scene.anims.create({ key, frames, frameRate: sleepy ? 1.5 : 4, repeat: -1 });
  }
}

// Move along a hop: straight from a to b, rising LEAP_HEIGHT in the middle.
function hopTween(scene, sprite, from, to, duration, onComplete) {
  const hop = { t: 0 };
  scene.tweens.add({
    targets: hop,
    t: 1,
    duration,
    ease: 'Sine.easeInOut',
    onUpdate: () => {
      if (!sprite.active) return; // the cat was sold mid-leap
      const y = from.y + (to.y - from.y) * hop.t;
      sprite.setPosition(from.x + (to.x - from.x) * hop.t, y - Math.sin(hop.t * Math.PI) * LEAP_HEIGHT);
      sprite.setDepth(objectDepth(y));
    },
    onComplete,
  });
}

// Each power gets the cat and the live mice. It returns nothing if there was nothing to attack;
// otherwise it starts the attack (cat.busy) and calls cat.finish() when done.
const POWERS = {
  // Leap onto the mouse closest to the cheese, then hop back home.
  pounce(cat, mice) {
    const target = cat.findTarget(mice);
    if (!target) return;
    cat.pose(WINDUP, target.x);
    cat.after(140, () => {
      // Aim where the mouse is now; if it already got away, the pounce misses.
      const landing = { x: target.x, y: target.y };
      cat.sprite.setFrame(ACTION);
      sound.play('pounce');
      hopTween(cat.scene, cat.sprite, cat.home, landing, 200, () => {
        if (target.alive && Phaser.Math.Distance.BetweenPoints(landing, target) < 10) target.hit(cat.stats.damage);
        cat.sprite.setFrame(WINDUP).setFlipX(cat.home.x < landing.x);
        hopTween(cat.scene, cat.sprite, landing, cat.home, 240, () => cat.finish());
      });
    });
  },

  // Cough a hairball high and far; it splats every mouse near where it lands.
  lob(cat, mice) {
    const target = cat.findTarget(mice);
    if (!target) return;
    cat.pose(WINDUP, target.x);
    cat.after(180, () => {
      cat.pose(ACTION, target.x);
      sound.play('cough');
      throwAt(cat.scene, 'hairballShot', cat.mouth(), target, { duration: 550, arc: 18 }, (spot) => {
        sound.play('splat');
        ringBurst(cat.scene, spot.x, spot.y + 4, cat.stats.splash, 'stoneLight', [0, 1]);
        for (const m of cat.scene.mice) {
          if (m.alive && Phaser.Math.Distance.Between(spot.x, spot.y, m.x, m.y - 4) <= cat.stats.splash) m.hit(cat.stats.damage);
        }
      });
      cat.after(250, () => cat.finish());
    });
  },

  // Toss a ball of yarn that tangles a mouse up and slows it down.
  yarn(cat, mice) {
    const target = cat.findTarget(mice);
    if (!target) return;
    cat.pose(ACTION, target.x);
    sound.play('throw');
    throwAt(cat.scene, 'yarnShot', cat.mouth(), target, { duration: 350, arc: 8 }, () => {
      if (!target.alive) return;
      target.slow(cat.stats.slow, cat.stats.slowTime);
      target.hit(cat.stats.damage);
    });
    cat.after(250, () => cat.finish());
  },

  // Fire an ice shard that freezes a mouse solid for a moment.
  ice(cat, mice) {
    const target = cat.findTarget(mice);
    if (!target) return;
    cat.pose(ACTION, target.x);
    throwAt(cat.scene, 'iceShot', cat.mouth(), target, { duration: 200 }, () => {
      if (!target.alive) return;
      sound.play('ice');
      target.chill(cat.stats.freezeTime);
      target.hit(cat.stats.damage);
    });
    cat.after(220, () => cat.finish());
  },

  // Quick little swipes at a mouse right next to it.
  swipe(cat, mice) {
    const target = cat.findTarget(mice);
    if (!target) return;
    cat.pose(ACTION, target.x);
    scratchMark(cat.scene, target.x, target.y, target.x < cat.home.x);
    sound.play('swipe');
    target.hit(cat.stats.damage);
    cat.after(120, () => cat.finish());
  },

  // A big hiss: every mouse nearby gets shoved back along the path.
  hiss(cat, mice) {
    const near = cat.inRange(mice);
    if (!near.length) return;
    cat.pose(ACTION);
    sound.play('hiss');
    ringBurst(cat.scene, cat.home.x, cat.home.y - 4, cat.stats.range, 'white');
    for (const m of near) {
      m.pushBack(cat.stats.push);
      m.hit(cat.stats.damage);
    }
    cat.after(400, () => cat.finish());
  },

  // Wake up, then stomp so hard every mouse nearby gets hit.
  stomp(cat, mice) {
    if (!cat.inRange(mice).length) return;
    cat.pose(WINDUP);
    cat.after(250, () => {
      cat.pose(ACTION);
      ringBurst(cat.scene, cat.home.x, cat.home.y, cat.stats.range, 'dirtPale');
      sound.play('stomp');
      cat.scene.cameras.main.shake(90, 0.003);
      for (const m of cat.inRange(cat.scene.mice)) m.hit(cat.stats.damage);
      cat.after(350, () => cat.finish());
    });
  },

  // Laser eyes: an instant beam at the mouse closest to the cheese.
  laser(cat, mice) {
    const target = cat.findTarget(mice);
    if (!target) return;
    cat.pose(ACTION, target.x);
    sound.play('laser');
    laserBeam(cat.scene, { x: cat.home.x, y: cat.home.y + EYES_Y }, { x: target.x, y: target.y - 4 });
    target.hit(cat.stats.damage);
    cat.after(150, () => cat.finish());
  },
};

export class Cat {
  constructor(scene, type, col, row) {
    this.scene = scene;
    this.type = type;
    this.col = col;
    this.row = row;
    this.level = 1;
    this.stats = catStats(type, 1);
    this.spent = type.cost;
    this.removed = false;
    this.home = toWorld(col, row);
    this.cooldown = 0;
    this.busy = false;
    this.zTimer = 0;

    const s = scene.manifest[type.sprite];
    this.sprite = scene.add
      .sprite(this.home.x, this.home.y, type.sprite, SIT)
      .setOrigin(s.anchor[0] / s.frameWidth, s.anchor[1] / s.frameHeight)
      .setDepth(objectDepth(this.home.y));
    this.idle();
  }

  get sheet() {
    return catSheet(this.type, this.level);
  }

  idle() {
    this.sprite.setFlipX(false).play(`${this.sheet}-idle`);
  }

  // Next upgrade's cost, or null at max level.
  get upgradeCost() {
    return upgradeCost(this.type, this.level);
  }

  upgrade() {
    this.spent += this.upgradeCost;
    this.level++;
    this.stats = catStats(this.type, this.level);
    this.sprite.setTexture(this.sheet, this.sprite.frame.name);
    if (!this.busy) this.idle();
  }

  remove() {
    this.removed = true;
    this.sprite.destroy();
  }

  // Hold one frame; if a target x is given, face it.
  pose(frame, targetX) {
    this.busy = true;
    this.sprite.stop().setFrame(frame);
    if (targetX !== undefined) this.sprite.setFlipX(targetX < this.home.x);
  }

  after(ms, fn) {
    this.scene.time.delayedCall(ms, () => !this.removed && fn());
  }

  finish() {
    if (this.removed) return;
    this.busy = false;
    this.cooldown = this.stats.cooldown;
    this.idle();
  }

  mouth() {
    return { x: this.home.x, y: this.home.y + MOUTH_Y };
  }

  // Mice this cat can reach. Hidden sneaky mice don't count: cats can't see them.
  inRange(mice) {
    return mice.filter(
      (m) => m.alive && !m.hidden && Phaser.Math.Distance.Between(this.home.x, this.home.y, m.x, m.y) <= this.stats.range,
    );
  }

  // Robocat (and any level-3 cat) spots sneaky mice hiding in reach.
  canReveal(mouse) {
    return this.stats.seesHidden && Phaser.Math.Distance.Between(this.home.x, this.home.y, mouse.x, mouse.y) <= this.stats.range;
  }

  // The mouse in reach that is closest to the cheese.
  findTarget(mice) {
    let best = null;
    for (const m of this.inRange(mice)) if (!best || m.travelled > best.travelled) best = m;
    return best;
  }

  update(dt, mice) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.type.power === 'stomp' && !this.busy) {
      this.zTimer -= dt;
      if (this.zTimer <= 0) {
        this.zTimer = 1.4;
        floatingZ(this.scene, this.home.x + 5, this.home.y - 14);
      }
    }
    if (this.busy || this.cooldown > 0) return;
    POWERS[this.type.power](this, mice);
  }
}
