import { PALETTE } from '../../art-src/palette.js';
import { CATS_BY_PRICE } from '../data/cats.js';
import { MICE } from '../data/mice.js';
import { makeCatAnims } from '../entities/Cat.js';
import { makeMouseAnims } from '../entities/Mouse.js';
import { sound } from '../audio/sound.js';

// Same size as the playing field, so the title fits the screen the same way.
const W = 384;
const H = 224;
const PATH_Y = 168;
const PATH_LEFT_RIGHT = 2 | 8; // path sheet frame that joins left and right

// Title screen: the name, every cat sitting in a row, and mice scurrying along a path.
// The first click also switches sound on (browsers only allow it after a click).
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    // Grass and path reach far past the edges so any screen shape is covered.
    this.add.tileSprite(W / 2, H / 2, 4000, 4000, 'grass0');
    this.add.tileSprite(W / 2, PATH_Y, 4000, 16, 'path', PATH_LEFT_RIGHT);
    this.add.image(W / 2 + 150, PATH_Y + 6, 'cheese', 0).setOrigin(0.5, 1).setDepth(PATH_Y + 10);

    const title = { fontFamily: '"Press Start 2P"', fontSize: '16px' };
    const small = { fontFamily: '"Press Start 2P"', fontSize: '8px' };
    // Drop shadow, then the title on top.
    this.add.text(W / 2 + 2, 34, 'CAT ATTACK', { ...title, color: PALETTE.outline }).setOrigin(0.5);
    this.add.text(W / 2, 32, 'CAT ATTACK', { ...title, color: PALETTE.cheeseLight }).setOrigin(0.5);
    this.add.text(W / 2, 54, 'CATS VS MICE', { ...small, color: PALETTE.white }).setOrigin(0.5);
    this.add.text(W / 2, 68, 'IDEAS BY GIDEON', { ...small, color: PALETTE.cheesePale }).setOrigin(0.5);

    // Every cat, sitting in a row, each with a different level look.
    const lineup = CATS_BY_PRICE;
    lineup.forEach((type, i) => {
      makeCatAnims(this, type);
      const level = (i % 3) + 1;
      const sheet = level === 1 ? type.sprite : `${type.sprite}${level}`;
      this.add.sprite(W / 2 + (i - (lineup.length - 1) / 2) * 30, 128, sheet).setOrigin(0.5, 0.75).play(`${sheet}-idle`).setDepth(128);
    });

    // A parade of mice running for the cheese.
    for (const type of Object.values(MICE)) makeMouseAnims(this, type.sprite);
    const parade = ['mouse', 'speedyMouse', 'mouse', 'armoredMouse', 'sneakyMouse', 'rocketMouse', 'nurseMouse', 'mamaMouse', 'mouse', 'bossRat'];
    parade.forEach((key, i) => {
      const m = this.add.sprite(-30 - i * 34, PATH_Y + 4, key).setOrigin(0.5, 0.75).play(`${key}-side`).setDepth(PATH_Y + 4);
      this.tweens.add({ targets: m, x: W / 2 + 130, duration: 7000, repeat: -1, delay: 0 });
    });

    const play = this.add.text(W / 2, 200, 'CLICK TO PLAY', { ...small, color: PALETTE.white }).setOrigin(0.5).setDepth(300);
    this.tweens.add({ targets: play, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });

    const start = () => {
      sound.unlock();
      sound.play('meow');
      this.scene.start('Game');
    };
    this.input.once('pointerdown', start);
    this.input.keyboard.once('keydown', start);

    this.scale.on('resize', this.fit, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.fit, this));
    this.fit();
  }

  fit() {
    const { width, height } = this.scale;
    const cam = this.cameras.main;
    cam.setSize(width, height);
    cam.setZoom(Math.min(width / W, height / H)).centerOn(W / 2, H / 2);
  }
}
