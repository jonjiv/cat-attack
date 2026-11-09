import { toWorld, objectDepth } from '../grid.js';
import { catStats, nodeState, NODES, MAX_LEVEL } from '../data/cats.js';
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
// Where the star on Wizard Cat's wand is, relative to the tile center.
const WAND = { x: 7, y: -9 };
// How far a Wizard Cat's zap can jump from one mouse to the next.
const CHAIN_REACH = 36;

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

  // Send the squad: each kitten charges a different mouse (doubling up if there are few), then runs back.
  army(cat, mice) {
    const near = cat.inRange(mice).sort((a, b) => b.travelled - a.travelled);
    if (!near.length) return;
    cat.pose(WINDUP, near[0].x);
    cat.after(120, () => {
      cat.pose(ACTION);
      sound.play('charge');
      const start = { x: cat.home.x, y: cat.home.y - 2 };
      for (let i = 0; i < cat.stats.squad; i++) {
        const target = near[i % near.length];
        cat.after(i * 60, () => {
          throwAt(cat.scene, 'armySoldier', start, target, { duration: 240, arc: 6 }, (spot) => {
            target.hit(cat.stats.damage);
            // A target that isn't alive stays put, so this is just "run back to this spot".
            throwAt(cat.scene, 'armySoldier', spot, { alive: false, x: start.x, y: start.y + 4 }, { duration: 200, arc: 6 }, () => {});
          });
        });
      }
      cat.after(cat.stats.squad * 60 + 460, () => cat.finish());
    });
  },

  // No fighting: during a wave, reel in a fish treat every so often.
  fish(cat) {
    if (!cat.scene.waveRunning) return;
    cat.pose(ACTION);
    sound.play('reel');
    cat.scene.flyTreat(cat.home.x + 8, cat.home.y - 14, cat.stats.haul);
    cat.after(450, () => cat.finish());
  },

  // A zap that jumps from the first mouse to the next nearest, and so on.
  zap(cat, mice) {
    const first = cat.findTarget(mice);
    if (!first) return;
    cat.pose(ACTION, first.x);
    sound.play('zap');
    const chain = [first];
    while (chain.length < cat.stats.chains) {
      const from = chain[chain.length - 1];
      let next = null;
      let best = CHAIN_REACH;
      for (const m of mice) {
        if (!m.alive || m.hidden || chain.includes(m)) continue;
        const d = Phaser.Math.Distance.Between(from.x, from.y, m.x, m.y);
        if (d < best) {
          best = d;
          next = m;
        }
      }
      if (!next) break;
      chain.push(next);
    }
    let a = { x: cat.home.x + WAND.x, y: cat.home.y + WAND.y };
    for (const m of chain) {
      const b = { x: m.x, y: m.y - 4 };
      laserBeam(cat.scene, a, b, 'petalPurple');
      a = b;
    }
    for (const m of chain) m.hit(cat.stats.damage);
    cat.after(200, () => cat.finish());
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

// What a weapon does to one mouse.
function weaponHit(mouse, fire) {
  if (fire.slow) mouse.slow(fire.slow, fire.slowTime);
  if (fire.freeze) mouse.chill(fire.freeze);
  if (fire.push) mouse.pushBack(fire.push);
  mouse.hit(fire.damage);
}

// A shot landed: blast everything nearby, or just hit its target.
function weaponLand(cat, fire, spot, target) {
  if (!fire.splash) {
    if (target.alive) weaponHit(target, fire);
    return;
  }
  sound.play('boom');
  ringBurst(cat.scene, spot.x, spot.y + 4, fire.splash, 'dirtPale', [0, 1, 2]);
  if (fire.shake) cat.scene.cameras.main.shake(90, 0.003);
  for (const m of [...cat.scene.mice]) {
    if (m.alive && !m.hidden && Phaser.Math.Distance.Between(spot.x, spot.y, m.x, m.y - 4) <= fire.splash) weaponHit(m, fire);
  }
}

// The end-of-tree weapon fires by itself, alongside the cat's normal attack.
// Returns whether it found anything to fire at.
function fireWeapon(cat, mice) {
  const fire = cat.stats.weapon;
  const near = cat.inRange(mice).sort((a, b) => b.travelled - a.travelled);
  if (!near.length) return false;
  if (fire.area) {
    sound.play(fire.sound);
    ringBurst(cat.scene, cat.home.x, cat.home.y - 4, cat.stats.range, fire.ring);
    for (const m of near) weaponHit(m, fire);
    return true;
  }
  sound.play('launch');
  for (let i = 0; i < (fire.shots || 1); i++) {
    const target = near[i % near.length];
    cat.after(i * 120, () => {
      throwAt(cat.scene, fire.icon, cat.mouth(), target, fire, (spot) => weaponLand(cat, fire, spot, target));
    });
  }
  return true;
}

export class Cat {
  constructor(scene, type, col, row) {
    this.scene = scene;
    this.type = type;
    this.col = col;
    this.row = row;
    this.owned = new Set(); // tech tree nodes bought so far
    this.stats = catStats(type, this.owned);
    this.weaponIn = 0; // seconds until the weapon can fire again
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

  // 1 plain, 2 and 3 with one or both upgrades, 4 with the weapon.
  get level() {
    return this.owned.has('weapon') ? MAX_LEVEL : 1 + this.owned.size;
  }

  // The next tech tree node that can be bought, or null when the tree is finished.
  get nextNode() {
    return NODES.find((n) => nodeState(this.owned, n) === 'ready') || null;
  }

  buy(node) {
    this.spent += this.type.tree[node].cost;
    this.owned.add(node);
    this.stats = catStats(this.type, this.owned);
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
    if (this.stats.weapon) {
      this.weaponIn -= dt;
      if (this.weaponIn <= 0 && fireWeapon(this, mice)) this.weaponIn = this.stats.weapon.every;
    }
    if (this.busy || this.cooldown > 0) return;
    POWERS[this.type.power](this, mice);
  }
}
