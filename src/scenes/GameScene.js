import { TILE, toWorld, toTile, objectDepth } from '../grid.js';
import { buildMap } from '../map.js';
import { FIELD } from '../data/maps/field.js';
import { MICE } from '../data/mice.js';
import { CATS, MAX_LEVEL, SELL_BACK } from '../data/cats.js';
import { WAVES, scaleForWave, waveBonus } from '../data/waves.js';
import { Mouse, makeMouseAnims } from '../entities/Mouse.js';
import { Cat, makeCatAnims } from '../entities/Cat.js';
import { crumbBurst } from '../fx/crumbs.js';
import { sparkleBurst, makeSparkleAnim } from '../fx/sparkle.js';
import { Hud } from '../ui/Hud.js';
import { sound } from '../audio/sound.js';

const GROUND_DEPTH = 0;
const RING_DEPTH = 4999;
const CURSOR_DEPTH = 5000;
const FLYING_DEPTH = 39000;

// How many bites the whole cheese pile holds.
const CHEESE_BITES = 20;
const START_TREATS = 40;
const SHOP = Object.values(CATS);

// Pile picture for how much cheese is left: full, 3/4, 1/2, 1/4, crumbs.
function cheeseFrame(left) {
  const f = left / CHEESE_BITES;
  if (f > 0.75) return 0;
  if (f > 0.5) return 1;
  if (f > 0.25) return 2;
  if (f > 0) return 3;
  return 4;
}

// Same answer every time for the same tile, so the meadow looks the same after a resize.
function tileHash(col, row) {
  let h = Math.imul(col, 374761393) + Math.imul(row, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.manifest = this.registry.get('manifest');
    this.map = buildMap(FIELD);
    this.fieldW = FIELD.cols * TILE;
    this.fieldH = FIELD.rows * TILE;
    this.meadowDrawn = new Set();

    this.drawField();
    this.cheeseLeft = CHEESE_BITES;
    this.cheese = this.placeOnTile('cheese', ...FIELD.cheese);

    makeSparkleAnim(this);
    for (const type of Object.values(MICE)) makeMouseAnims(this, type.sprite);
    for (const type of SHOP) makeCatAnims(this, type);

    this.treats = START_TREATS;
    this.cats = new Map(); // "col,row" -> Cat
    this.mice = [];
    this.route = FIELD.path.map(([col, row]) => toWorld(col, row));
    this.gameOver = false;

    // Waves: wave 0 means none started yet. schedule = mice still to come this wave.
    this.wave = 0;
    this.waveRunning = false;
    this.waveTime = 0;
    this.schedule = [];

    this.hud = new Hud(this, {
      cats: SHOP,
      onNextWave: () => this.startWave(),
      onSelectCat: (type) => {
        sound.play('click');
        this.selectCat(this.selected === type ? null : type);
      },
      audio: sound.settings,
      onToggleSfx: () => sound.toggleSfx(),
      onToggleMusic: () => sound.toggleMusic(),
    });

    // Hovering a tile shows the cursor; on an open tile, a see-through cat and its reach.
    this.cursor = this.placeOnTile('cursor', 0, 0).setDepth(CURSOR_DEPTH).setVisible(false);
    this.ghost = this.add.image(0, 0, SHOP[0].sprite).setAlpha(0.55).setVisible(false);
    this.ring = this.add.image(0, 0, `range-${SHOP[0].sprite}-1`).setDepth(RING_DEPTH).setVisible(false);
    // Reach of the cat whose upgrade panel is open.
    this.panelRing = this.add.image(0, 0, `range-${SHOP[0].sprite}-1`).setDepth(RING_DEPTH).setVisible(false);
    this.panelCat = null;
    this.selectCat(SHOP[0]);

    // Clicks on the HUD (anything interactive under the pointer) don't reach the field.
    this.input.on('pointermove', (p, over) => (over.length ? this.hideCursor() : this.updateCursor(p)));
    this.input.on('pointerdown', (p, over) => !over.length && this.onFieldClick(p));
    this.input.keyboard.on('keydown-SPACE', () => this.startWave());
    this.input.keyboard.on('keydown-ESC', () => (this.panelCat ? this.closeCatPanel() : this.selectCat(null)));
    this.input.keyboard.on('keydown-U', () => this.panelCat && this.upgradeCat(this.panelCat));
    this.input.keyboard.on('keydown-S', () => this.panelCat && this.sellCat(this.panelCat));
    this.input.keyboard.on('keydown', (e) => {
      const type = SHOP[Number(e.key) - 1];
      if (type) this.selectCat(type);
    });

    this.refreshHud();
    this.hud.setWaveButtonEnabled(true);
    this.hud.showHint('PLACE CATS, THEN PRESS NEXT WAVE');

    this.scale.on('resize', this.fitCamera, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.fitCamera, this));
    this.fitCamera();
  }

  // Run the whole game faster (used for testing balance; could become a fast-forward button).
  setGameSpeed(speed) {
    this.gameSpeed = speed;
    this.time.timeScale = speed;
    this.tweens.timeScale = speed;
    this.anims.globalTimeScale = speed;
  }

  update(_time, delta) {
    if (this.gameOver) return;
    const ms = Math.min(delta, 100) * (this.gameSpeed || 1);
    const dt = ms / 1000;

    if (this.waveRunning) {
      this.waveTime += ms;
      while (this.schedule.length && this.schedule[0].at <= this.waveTime) this.spawnMouse(this.schedule.shift().type);
    }
    for (const m of this.mice) m.update(dt);
    this.mice = this.mice.filter((m) => m.alive);
    this.updateHiding();
    for (const c of this.cats.values()) c.update(dt, this.mice);

    if (this.waveRunning && !this.gameOver && !this.schedule.length && !this.mice.length) this.waveCleared();
  }

  // ---- waves ----

  startWave() {
    if (this.waveRunning || this.gameOver || this.wave >= WAVES.length) return;
    this.wave++;
    this.waveRunning = true;
    this.waveTime = 0;
    this.schedule = [];
    for (const group of WAVES[this.wave - 1]) {
      const type = scaleForWave(MICE[group.mouse], this.wave);
      for (let i = 0; i < group.count; i++) this.schedule.push({ at: (group.delay || 0) + i * group.every, type });
    }
    this.schedule.sort((a, b) => a.at - b.at);
    this.hud.hideHint();
    this.hud.setWaveButtonEnabled(false);
    this.hud.message(`WAVE ${this.wave}!`, 1200, 'red');
    sound.play('wave');
    this.refreshHud();
  }

  waveCleared() {
    this.waveRunning = false;
    const bonus = waveBonus(this.wave);
    this.treats += bonus;
    this.refreshHud();
    if (this.wave >= WAVES.length) {
      this.win();
      return;
    }
    this.hud.message(`WAVE ${this.wave} CLEARED! +${bonus}`, 1800, 'grassLight');
    sound.play('cleared');
    this.hud.setWaveButtonEnabled(true);
  }

  // ---- mice ----

  spawnMouse(type) {
    const events = { arrive: (m) => this.mouseReachedCheese(m), defeat: (m) => this.mouseDefeated(m) };
    this.mice.push(new Mouse(this, type, this.route, events));
    if (type.boss) {
      this.hud.message('THE BIG BOSS RAT IS COMING!', 2200, 'red');
      sound.play('boss');
    }
  }

  // Sneaky mice vanish in tall grass, unless a Robocat can see them.
  updateHiding() {
    for (const m of this.mice) {
      if (!m.type.sneaky) continue;
      const { col, row } = toTile(m.x, m.y);
      const inGrass = this.map.isTallGrass(col, row);
      m.setHidden(inGrass && ![...this.cats.values()].some((c) => c.canReveal(m)));
    }
  }

  // Sparkle away, and a fish treat hops out and flies to the treat counter.
  mouseDefeated(mouse) {
    const { x, y } = mouse;
    sparkleBurst(this, x, y - 4);
    sound.play('squeak');
    if (mouse.type.boss) {
      // A big rat gets a big sparkle.
      sparkleBurst(this, x - 8, y - 10);
      sparkleBurst(this, x + 8, y - 8);
      this.hud.message('BOSS RAT BEATEN!', 1800, 'cheeseMid');
    }
    const treat = this.add.image(x, y - 4, 'treat').setDepth(FLYING_DEPTH);
    this.tweens.add({
      targets: treat,
      y: y - 14,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () =>
        this.tweens.add({
          targets: treat,
          ...this.hud.treatTarget(),
          duration: 420,
          ease: 'Quad.easeIn',
          onComplete: () => {
            treat.destroy();
            sound.play('coin');
            this.treats += mouse.type.treats;
            this.refreshHud();
          },
        }),
    });
  }

  mouseReachedCheese(mouse) {
    mouse.scurryOff();
    crumbBurst(this, this.cheese.x - 8, this.cheese.y - 4);
    sound.play('chomp');
    this.cheeseLeft = Math.max(0, this.cheeseLeft - mouse.type.bites);
    this.cheese.setFrame(cheeseFrame(this.cheeseLeft));
    this.refreshHud();
    if (this.cheeseLeft === 0) this.lose();
  }

  // ---- end of game ----

  endGame(title, subtitle, accent) {
    this.gameOver = true;
    this.waveRunning = false;
    for (const m of this.mice) m.stop();
    this.hideCursor();
    this.closeCatPanel();
    this.hud.setWaveButtonEnabled(false);
    this.hud.banner(this.fieldW / 2, this.fieldH / 2, title, subtitle, accent);
    // Short pause so a click that was already happening doesn't skip the message.
    this.time.delayedCall(400, () => this.input.once('pointerdown', () => this.scene.restart()));
  }

  lose() {
    sound.play('lose');
    this.endGame('THE MICE GOT THE CHEESE!', 'CLICK TO TRY AGAIN', 'red');
  }

  win() {
    sound.play('win');
    this.endGame('THE CHEESE IS SAFE!', 'CLICK TO PLAY AGAIN', 'cheeseMid');
  }

  // ---- cats and the cursor ----

  selectCat(type) {
    this.selected = type;
    if (type) {
      this.setAnchored(this.ghost, type.sprite);
      this.setAnchored(this.ring, `range-${type.sprite}-1`);
    }
    this.hideCursor();
    this.refreshHud();
  }

  // Swap an image's picture and line up its anchor the way placeOnTile does.
  setAnchored(img, key) {
    const s = this.manifest[key];
    img.setTexture(key, 0).setOrigin(s.anchor[0] / s.frameWidth, s.anchor[1] / s.frameHeight);
  }

  // Clicking a cat opens its upgrade panel; clicking anywhere else first closes the panel.
  onFieldClick(pointer) {
    if (this.gameOver) return;
    const { col, row } = this.pointerTile(pointer);
    const cat = this.cats.get(`${col},${row}`);
    if (cat) this.openCatPanel(cat);
    else if (this.panelCat) this.closeCatPanel();
    else this.tryPlaceCat(pointer);
  }

  openCatPanel(cat) {
    this.panelCat = cat;
    this.setAnchored(this.panelRing, `range-${cat.type.sprite}-${cat.level}`);
    this.panelRing.setPosition(cat.home.x, cat.home.y).setVisible(true);
    this.hud.showCatPanel(
      {
        name: cat.type.name,
        level: cat.level,
        maxLevel: MAX_LEVEL,
        upgradeCost: cat.upgradeCost,
        sellValue: this.sellValue(cat),
        treats: this.treats,
        x: cat.home.x,
        y: cat.home.y,
      },
      { onUpgrade: () => this.upgradeCat(cat), onSell: () => this.sellCat(cat) },
    );
  }

  closeCatPanel() {
    this.panelCat = null;
    this.panelRing.setVisible(false);
    this.hud.hideCatPanel();
  }

  sellValue(cat) {
    return Math.floor(cat.spent * SELL_BACK);
  }

  upgradeCat(cat) {
    const cost = cat.upgradeCost;
    if (cost === null || this.treats < cost) return;
    this.treats -= cost;
    sound.play('upgrade');
    cat.upgrade();
    sparkleBurst(this, cat.home.x, cat.home.y - 8);
    this.refreshHud();
  }

  sellCat(cat) {
    this.treats += this.sellValue(cat);
    sound.play('sell');
    cat.remove();
    this.cats.delete(`${cat.col},${cat.row}`);
    this.map.vacate(cat.col, cat.row);
    this.closeCatPanel();
    this.refreshHud();
  }

  tryPlaceCat(pointer) {
    const type = this.selected;
    if (this.gameOver || !type) return;
    const { col, row } = this.pointerTile(pointer);
    if (!this.map.inBounds(col, row) || !this.map.canPlace(col, row) || this.treats < type.cost) return;
    this.treats -= type.cost;
    this.map.occupy(col, row);
    this.cats.set(`${col},${row}`, new Cat(this, type, col, row));
    sound.play('meow');
    this.refreshHud();
    this.updateCursor(pointer);
  }

  refreshHud() {
    this.hud.setCounts({ treats: this.treats, cheese: this.cheeseLeft, wave: this.wave, waves: WAVES.length });
    this.hud.refreshShop(this.selected, this.treats);
    // Keep the open panel's prices and buttons up to date.
    if (this.panelCat) this.openCatPanel(this.panelCat);
  }

  pointerTile(pointer) {
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    return toTile(world.x, world.y);
  }

  hideCursor() {
    this.cursor.setVisible(false);
    this.ghost.setVisible(false);
    this.ring.setVisible(false);
  }

  updateCursor(pointer) {
    if (this.gameOver) return;
    const { col, row } = this.pointerTile(pointer);
    this.hideCursor();
    if (!this.map.inBounds(col, row)) return;

    const { x, y } = toWorld(col, row);
    const type = this.selected;
    const canBuy = type && this.map.canPlace(col, row) && this.treats >= type.cost;
    this.cursor.setPosition(x, y).setFrame(canBuy ? 0 : 1).setVisible(true);

    if (canBuy) {
      this.ghost.setPosition(x, y).setDepth(objectDepth(y) + 0.5).setVisible(true);
      this.setAnchored(this.ring, `range-${type.sprite}-1`);
      this.ring.setPosition(x, y).setVisible(true);
    }
    // Hovering a cat you already placed shows how far it reaches.
    const cat = this.cats.get(`${col},${row}`);
    if (cat) {
      this.setAnchored(this.ring, `range-${cat.type.sprite}-${cat.level}`);
      this.ring.setPosition(x, y).setVisible(true);
    }
  }

  // ---- camera and map drawing ----

  // Zoom so the whole playing field just fits the screen's width or height, centered.
  // Whatever screen is left over shows the meadow around the field.
  fitCamera() {
    const { width, height } = this.scale;
    const cam = this.cameras.main;
    cam.setSize(width, height);
    const zoom = Math.min(width / this.fieldW, height / this.fieldH);
    cam.setZoom(zoom).centerOn(this.fieldW / 2, this.fieldH / 2);
    const view = {
      x: this.fieldW / 2 - width / zoom / 2,
      y: this.fieldH / 2 - height / zoom / 2,
      width: width / zoom,
      height: height / zoom,
    };
    this.fillMeadow(view);
    this.hud.layout(view);
  }

  // Put a sprite so its anchor pixel sits on a tile's center.
  placeOnTile(key, col, row, frame = 0) {
    const { x, y } = toWorld(col, row);
    const img = this.add.image(x, y, key, frame).setDepth(objectDepth(y));
    this.setAnchored(img, key);
    return img.setFrame(frame);
  }

  grassKey(col, row) {
    return `grass${Math.floor(tileHash(col, row) * 3)}`;
  }

  drawField() {
    for (let row = 0; row < FIELD.rows; row++) {
      for (let col = 0; col < FIELD.cols; col++) {
        let tile;
        if (this.map.isPath(col, row)) tile = this.placeOnTile('path', col, row, this.map.pathMask(col, row));
        else tile = this.placeOnTile(this.grassKey(col, row), col, row);
        tile.setDepth(GROUND_DEPTH);
      }
    }
    FIELD.tallGrass.forEach(([col, row], i) => this.placeOnTile('tallGrass', col, row, i % 2));
    // Grass over the path draws in front of anything walking through its tile.
    FIELD.pathGrass.forEach(([col, row], i) => {
      const grass = this.placeOnTile('tallGrass', col, row, i % 2);
      grass.setDepth(objectDepth(grass.y + TILE / 2));
    });
    for (const p of FIELD.props) this.placeOnTile(p.key, ...p.at);
    this.placeOnTile('mouseHole', ...FIELD.hole);
  }

  // Draw grass and scenery outside the playing field, out to the edges of the screen.
  // Only tiles not drawn yet are added, so growing the window just fills in the new edges.
  fillMeadow(view) {
    const c0 = Math.floor(view.x / TILE) - 1;
    const r0 = Math.floor(view.y / TILE) - 1;
    const c1 = Math.ceil((view.x + view.width) / TILE);
    const r1 = Math.ceil((view.y + view.height) / TILE) + 2; // trees below the view still poke up into it

    for (let row = r0; row <= r1; row++) {
      for (let col = c0; col <= c1; col++) {
        if (this.map.inBounds(col, row) || this.meadowDrawn.has(`${col},${row}`)) continue;
        this.meadowDrawn.add(`${col},${row}`);
        this.placeOnTile(this.grassKey(col, row), col, row).setDepth(GROUND_DEPTH);
        this.decorateMeadow(col, row);
      }
    }
  }

  decorateMeadow(col, row) {
    // How many tiles this spot is from the playing field.
    const gap = Math.max(-1 - col, col - FIELD.cols, -1 - row, row - FIELD.rows);
    const h = tileHash(col + 1000, row);
    // Trees are 2 tiles wide and tall, so keep them on even tiles and clear of the field.
    if (gap >= 2 && col % 2 === 0 && row % 2 === 0 && h < 0.45) {
      this.placeOnTile('tree', col, row, h < 0.22 ? 0 : 1);
    } else if (gap >= 1 && h > 0.93) {
      this.placeOnTile('bush', col, row);
    } else if (h > 0.86) {
      this.placeOnTile(h > 0.895 ? 'flowersA' : 'flowersB', col, row);
    }
  }
}
