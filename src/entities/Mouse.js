import { objectDepth } from '../grid.js';
import { PALETTE } from '../../art-src/palette.js';
import { ringBurst } from '../fx/effects.js';
import { sound } from '../audio/sound.js';

const tint = (name) => Phaser.Display.Color.HexStringToColor(PALETTE[name]).color;
const HIT_TINT = 0xff7a7a;
const FROZEN_TINT = tint('ice');
const SLOWED_TINT = tint('petalPink');

// Walk animations are made once per sprite sheet: frames 0-1 down, 2-3 up, 4-5 right.
export function makeMouseAnims(scene, sprite) {
  const anims = { down: [0, 1], up: [2, 3], side: [4, 5] };
  for (const [dir, frames] of Object.entries(anims)) {
    const key = `${sprite}-${dir}`;
    if (!scene.anims.exists(key)) {
      scene.anims.create({ key, frames: scene.anims.generateFrameNumbers(sprite, { frames }), frameRate: 6, repeat: -1 });
    }
  }
}

// A mouse walks a list of points. It calls events.arrive if it reaches the last one,
// or events.defeat if cats knock its health to zero first.
// Where it is comes from how far it has walked (travelled), so cats can push it backward.
export class Mouse {
  constructor(scene, type, route, events) {
    this.type = type;
    this.events = events;
    this.alive = true;
    this.health = type.health;
    this.maxHealth = type.health;
    this.hidden = false; // sneaky mouse tucked in tall grass
    this.speed = type.speed * Phaser.Math.FloatBetween(0.92, 1.08);
    this.travelled = 0;
    this.frozen = 0; // seconds left frozen solid
    this.slowTime = 0; // seconds left tangled in yarn
    this.slowFactor = 1;
    this.boostIn = type.boostEvery; // Rocket Mouse: seconds until the next burst
    this.boostLeft = 0;
    this.healIn = type.healEvery; // Nurse Mouse: seconds until the next heal

    // Each mouse walks slightly off-center so a crowd doesn't stack into one sprite.
    const ox = Phaser.Math.Between(-2, 2);
    const oy = Phaser.Math.Between(-2, 2);
    const points = route.map((p) => ({ x: p.x + ox, y: p.y + oy }));
    this.legs = [];
    let start = 0;
    for (let i = 1; i < points.length; i++) {
      const len = Phaser.Math.Distance.BetweenPoints(points[i - 1], points[i]);
      this.legs.push({ a: points[i - 1], b: points[i], start, len });
      start += len;
    }
    this.total = start;
    this.leg = null;

    const s = scene.manifest[type.sprite];
    this.sprite = scene.add
      .sprite(points[0].x, points[0].y, type.sprite)
      .setOrigin(s.anchor[0] / s.frameWidth, s.anchor[1] / s.frameHeight);
    // Pop out of the mouse hole.
    this.sprite.setAlpha(0);
    scene.tweens.add({ targets: this.sprite, alpha: 1, duration: 250 });
    if (type.scale) this.sprite.setScale(type.scale);
    // The Big Boss Rat shows how much health it has left.
    if (type.boss) this.bar = scene.add.graphics();
    this.place();
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  // Move the sprite to the spot `travelled` pixels along the path.
  place() {
    const leg = this.legs.find((l) => this.travelled < l.start + l.len) || this.legs[this.legs.length - 1];
    const t = Math.min(1, (this.travelled - leg.start) / leg.len);
    this.sprite.setPosition(leg.a.x + (leg.b.x - leg.a.x) * t, leg.a.y + (leg.b.y - leg.a.y) * t);
    this.sprite.setDepth(objectDepth(this.sprite.y));
    this.drawBar();
    if (leg !== this.leg) {
      this.leg = leg;
      this.face(leg);
    }
  }

  drawBar() {
    if (!this.bar) return;
    const w = 18;
    const x = Math.round(this.sprite.x - w / 2);
    const y = Math.round(this.sprite.y - 20);
    const fill = Math.max(0, Math.round((w - 2) * (this.health / this.maxHealth)));
    this.bar
      .clear()
      .setDepth(this.sprite.depth + 1)
      .fillStyle(tint('outline'))
      .fillRect(x, y, w, 4)
      .fillStyle(tint('red'))
      .fillRect(x + 1, y + 1, fill, 2);
  }

  face(leg) {
    const dx = leg.b.x - leg.a.x;
    const dy = leg.b.y - leg.a.y;
    const dir = Math.abs(dx) > Math.abs(dy) ? 'side' : dy > 0 ? 'down' : 'up';
    this.sprite.setFlipX(dir === 'side' && dx < 0);
    this.sprite.play(`${this.type.sprite}-${dir}`, true);
    this.showStatus();
  }

  update(dt) {
    if (!this.alive) return;
    if (this.frozen > 0) {
      this.frozen -= dt;
      if (this.frozen <= 0) this.showStatus();
      return;
    }
    let speed = this.speed;
    if (this.type.boostEvery) {
      this.boostIn -= dt;
      if (this.boostIn <= 0) {
        this.boostIn = this.type.boostEvery;
        this.boostLeft = this.type.boostTime;
        ringBurst(this.sprite.scene, this.x, this.y, 6, 'stoneLight', [0, 1]);
        sound.play('rocket');
      }
      if (this.boostLeft > 0) {
        this.boostLeft -= dt;
        speed *= this.type.boostSpeed;
      }
    }
    if (this.slowTime > 0) {
      speed *= this.slowFactor;
      this.slowTime -= dt;
      if (this.slowTime <= 0) this.showStatus();
    }
    this.travelled = Math.min(this.total, this.travelled + speed * dt);
    this.place();
    if (this.travelled >= this.total) {
      this.alive = false;
      this.events.arrive(this);
    }
  }

  // Tint and walk speed show what's happening to the mouse. Tints keep its own art visible.
  showStatus() {
    const anims = this.sprite.anims;
    if (this.frozen > 0) {
      this.sprite.setTint(FROZEN_TINT);
      anims.pause();
    } else if (this.slowTime > 0) {
      this.sprite.setTint(SLOWED_TINT);
      anims.resume();
      anims.timeScale = 0.5;
    } else {
      this.sprite.clearTint();
      anims.resume();
      anims.timeScale = 1;
    }
  }

  // Take a hit: flash red, and vanish if out of health. Armor softens every hit.
  hit(damage) {
    if (!this.alive) return;
    this.health -= Math.max(0.25, damage - (this.type.armor || 0));
    if (this.health <= 0) {
      this.alive = false;
      this.sprite.destroy();
      if (this.bar) this.bar.destroy();
      this.events.defeat(this);
      return;
    }
    this.drawBar();
    this.sprite.setTint(HIT_TINT);
    this.sprite.scene.time.delayedCall(70, () => this.sprite.active && this.showStatus());
  }

  // Nurse Mouse: get some health back.
  heal(amount) {
    if (!this.alive) return;
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.drawBar();
  }

  // Ice Cat: frozen solid in place for a moment.
  chill(seconds) {
    if (!this.alive) return;
    this.frozen = Math.max(this.frozen, seconds * (this.type.boss ? 0.5 : 1));
    this.showStatus();
  }

  // Yarn Cat: walk at `factor` speed for a while.
  slow(factor, seconds) {
    if (!this.alive) return;
    this.slowFactor = factor;
    this.slowTime = Math.max(this.slowTime, seconds);
    this.showStatus();
  }

  // Hiss Cat: shoved back along the path.
  pushBack(distance) {
    if (!this.alive) return;
    this.travelled = Math.max(0, this.travelled - distance * (this.type.boss ? 0.5 : 1));
    this.place();
  }

  // Sneaky mice fade almost out of sight while hidden.
  setHidden(hidden) {
    if (hidden === this.hidden) return;
    this.hidden = hidden;
    this.sprite.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setAlpha(hidden ? 0.2 : 1);
  }

  // Shrink away with the stolen bite.
  scurryOff() {
    if (this.bar) this.bar.destroy();
    this.sprite.stop();
    this.sprite.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 0.5,
      duration: 220,
      onComplete: () => this.sprite.destroy(),
    });
  }

  // Stand still (the game is over).
  stop() {
    this.alive = false;
    this.sprite.anims.pause();
  }
}
