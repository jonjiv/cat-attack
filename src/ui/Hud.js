// Everything drawn on top of the field: counters, the wave button, the cat shop, messages.
// It lives in world space (same zoom as the field) so its pixels match the game's pixels.
import { PALETTE } from '../../art-src/palette.js';
import { canGoFullscreen, isFullscreen, toggleFullscreen } from '../fullscreen.js';

const HUD_DEPTH = 40000;
const BANNER_DEPTH = 50000;
const CHAR_W = 8; // Press Start 2P at 8px is 8 pixels per character
const PIXEL_TEXT = { fontFamily: '"Press Start 2P"', fontSize: '8px' };

export const color = (name) => Phaser.Display.Color.HexStringToColor(PALETTE[name]).color;

function text(scene, x, y, str, colorName = 'white') {
  return scene.add.text(x, y, str, { ...PIXEL_TEXT, color: PALETTE[colorName] });
}

// Dark box with a colored line along the bottom.
function panel(scene, w, h, accent) {
  return scene.add
    .graphics()
    .fillStyle(color('outline'))
    .fillRect(0, 0, w, h)
    .fillStyle(color(accent))
    .fillRect(1, h - 1, w - 2, 1);
}

// Invisible clickable area (origin top-left, so it lines up inside containers).
function hitZone(scene, w, h) {
  return scene.add.zone(0, 0, w, h).setOrigin(0).setInteractive({ useHandCursor: true });
}

const WAVE_W = 84;
const CARD_W = 24;
const CARD_H = 34;
const CARD_GAP = 2;

export class Hud {
  // cats: list of cat types for the shop. onNextWave(), onSelectCat(type or null).
  // audio: { sfx, music } on/off now; onToggleSfx() and onToggleMusic() return the new state.
  constructor(scene, { cats, onNextWave, onSelectCat, audio, onToggleSfx, onToggleMusic }) {
    this.scene = scene;

    // Top-left: fish treats and cheese left.
    this.treatText = text(scene, 14, 3, '');
    this.cheeseText = text(scene, 53, 3, '');
    this.counters = scene.add
      .container(0, 0, [
        panel(scene, 72, 14, 'ice'),
        scene.add.image(7, 7, 'treat'),
        this.treatText,
        scene.add.image(46, 7, 'cheeseIcon'),
        this.cheeseText,
      ])
      .setDepth(HUD_DEPTH);

    // Next to the counters: sound effects and music on/off.
    const toggle = (x, icon, on, onClick) => {
      const img = scene.add.image(x + 7, 7, icon, on ? 0 : 1);
      const zone = hitZone(scene, 14, 14).setX(x);
      zone.on('pointerdown', () => img.setFrame(onClick() ? 0 : 1));
      return [scene.add.graphics().fillStyle(color('outline')).fillRect(x, 0, 14, 14), img, zone];
    };
    this.audioButtons = scene.add
      .container(0, 0, [
        ...toggle(0, 'soundIcon', audio.sfx, onToggleSfx),
        ...toggle(16, 'musicIcon', audio.music, onToggleMusic),
        ...(canGoFullscreen ? this.fullscreenButton(32) : []),
      ])
      .setDepth(HUD_DEPTH);

    // Top-right: wave number, and the Next Wave button under it.
    this.waveText = text(scene, 2, 3, '');
    this.buttonBg = scene.add.graphics();
    this.buttonText = text(scene, (WAVE_W - 9 * CHAR_W) / 2, 20, 'NEXT WAVE', 'outline');
    this.buttonZone = hitZone(scene, WAVE_W, 16).setY(16);
    this.buttonZone.on('pointerover', () => this.drawButton('cheeseLight'));
    this.buttonZone.on('pointerout', () => this.drawButton('cheeseMid'));
    this.buttonZone.on('pointerdown', () => onNextWave());
    this.waveBox = scene.add
      .container(0, 0, [panel(scene, WAVE_W, 14, 'cheeseMid'), this.waveText, this.buttonBg, this.buttonText, this.buttonZone])
      .setDepth(HUD_DEPTH);
    this.drawButton('cheeseMid');

    // Bottom: one card per cat you can buy.
    this.cards = cats.map((type, i) => this.makeCard(type, i, onSelectCat));
    const barW = cats.length * (CARD_W + CARD_GAP) + CARD_GAP;
    this.shop = scene.add
      .container(0, 0, [panel(scene, barW, CARD_H + 4, 'catMid'), ...this.cards.map((c) => c.box)])
      .setDepth(HUD_DEPTH);
    this.shopSize = { w: barW, h: CARD_H + 4 };

    // Above the shop: the name and power of the cat you're pointing at.
    this.hovered = null;
    this.infoBg = scene.add.graphics();
    this.infoText = text(scene, 4, 3, '');
    this.info = scene.add.container(0, 0, [this.infoBg, this.infoText]).setDepth(HUD_DEPTH);

    this.hint = null;
    this.messages = [];
  }

  // Full screen on/off. It's on pointerup because browsers only allow it when a finger lifts.
  fullscreenButton(x) {
    const s = this.scene;
    const icon = s.add.image(x + 7, 7, 'fullIcon', isFullscreen() ? 1 : 0);
    const zone = hitZone(s, 14, 14).setX(x);
    zone.on('pointerup', toggleFullscreen);
    const update = () => icon.setFrame(isFullscreen() ? 1 : 0);
    const events = ['fullscreenchange', 'webkitfullscreenchange'];
    for (const e of events) document.addEventListener(e, update);
    s.events.once('shutdown', () => events.forEach((e) => document.removeEventListener(e, update)));
    return [s.add.graphics().fillStyle(color('outline')).fillRect(x, 0, 14, 14), icon, zone];
  }

  // Only while pointing at a card, so the label doesn't sit over the path the rest of the time.
  refreshInfo() {
    const type = this.hovered;
    this.info.setVisible(!!type);
    if (!type) return;
    const str = `${type.name.toUpperCase()}: ${type.blurb}`;
    this.infoText.setText(str);
    this.infoW = str.length * CHAR_W + 8;
    this.infoBg.clear().fillStyle(color('outline')).fillRect(0, 0, this.infoW, 14).fillStyle(color('catMid')).fillRect(1, 13, this.infoW - 2, 1);
    this.placeInfo();
  }

  placeInfo() {
    if (!this.infoW) return;
    this.info.setPosition(Math.max(this.shop.x, Math.round(this.shop.x + this.shopSize.w / 2 - this.infoW / 2)), this.shop.y - 16);
  }

  makeCard(type, i, onSelectCat) {
    const s = this.scene;
    const border = s.add.graphics();
    const cat = s.add.image(CARD_W / 2, 13, type.sprite, 0);
    const cost = String(type.cost);
    const costText = text(s, (CARD_W - cost.length * CHAR_W) / 2, 24, cost, 'white');
    const zone = hitZone(s, CARD_W, CARD_H);
    zone.on('pointerdown', () => onSelectCat(type));
    zone.on('pointerover', () => {
      this.hovered = type;
      this.refreshInfo();
    });
    zone.on('pointerout', () => {
      this.hovered = null;
      this.refreshInfo();
    });
    const box = s.add.container(CARD_GAP + i * (CARD_W + CARD_GAP), 2, [border, cat, costText, zone]);
    return { type, box, border, cat, costText };
  }

  // Selected card gets a bright border; cards you can't afford fade.
  refreshShop(selected, treats) {
    for (const c of this.cards) {
      const on = c.type === selected;
      c.border
        .clear()
        .fillStyle(color(on ? 'cheeseLight' : 'earthMid'))
        .fillRect(0, 0, CARD_W, CARD_H)
        .fillStyle(color(on ? 'dirtMid' : 'outline'))
        .fillRect(1, 1, CARD_W - 2, CARD_H - 2);
      const affordable = treats >= c.type.cost;
      c.cat.setAlpha(affordable ? 1 : 0.45);
      c.costText.setColor(PALETTE[affordable ? 'white' : 'red']);
    }
  }

  drawButton(fill) {
    this.buttonBg
      .clear()
      .fillStyle(color('outline'))
      .fillRect(0, 16, WAVE_W, 16)
      .fillStyle(color(fill))
      .fillRect(1, 17, WAVE_W - 2, 14);
  }

  setWaveButtonEnabled(on) {
    for (const o of [this.buttonBg, this.buttonText]) o.setAlpha(on ? 1 : 0.4);
    if (on) this.buttonZone.setInteractive({ useHandCursor: true });
    else this.buttonZone.disableInteractive();
    this.drawButton('cheeseMid');
  }

  setCounts({ treats, cheese, wave, waves }) {
    this.treatText.setText(String(treats));
    this.cheeseText.setText(String(cheese));
    this.waveText.setText(`WAVE ${wave}/${waves}`);
  }

  // Where flying treats should land.
  treatTarget() {
    return { x: this.counters.x + 7, y: this.counters.y + 7 };
  }

  // Place everything against the edges of what the screen shows. view = visible world rect.
  layout(view) {
    this.view = view;
    const left = Math.round(view.x) + 4;
    const top = Math.round(view.y) + 4;
    const right = Math.round(view.x + view.width) - 4;
    const bottom = Math.round(view.y + view.height) - 4;
    this.counters.setPosition(left, top);
    // Right of the counters, so they stay clear of the mouse hole on wide screens.
    this.audioButtons.setPosition(left + 74, top);
    this.waveBox.setPosition(right - WAVE_W, top);
    // Bottom-left, so the bar stays clear of the last stretch of path and the cheese.
    this.shop.setPosition(left, bottom - this.shopSize.h);
    this.placeInfo();
    this.placeMessages();
  }

  // A message box centered near the top. Stays until hidden if ms is null.
  message(str, ms = null, accent = 'cheeseMid') {
    const w = str.length * CHAR_W + 8;
    const box = this.scene.add
      .container(0, 0, [panel(this.scene, w, 14, accent), text(this.scene, 4, 3, str, 'white')])
      .setDepth(HUD_DEPTH);
    box.boxW = w;
    this.messages.push(box);
    this.placeMessages();
    if (ms) {
      this.scene.tweens.add({ targets: box, alpha: 0, delay: ms, duration: 300, onComplete: () => this.removeMessage(box) });
    }
    return box;
  }

  removeMessage(box) {
    box.destroy();
    this.messages = this.messages.filter((b) => b !== box);
    this.placeMessages();
  }

  // Stack messages one under another, below the wave box and button (which end 36px from the top).
  placeMessages() {
    const v = this.view;
    if (!v) return;
    this.messages.forEach((box, i) => {
      box.setPosition(Math.round(v.x + v.width / 2 - box.boxW / 2), Math.round(v.y) + 40 + i * 16);
    });
  }

  showHint(str) {
    this.hint = this.message(str);
  }

  hideHint() {
    if (this.hint) this.removeMessage(this.hint);
    this.hint = null;
  }

  // Tech tree over a placed cat: the cat, its two upgrades, and the weapon they lead to.
  // info: { name, sheet, nodes: [{ key, name, blurb, cost, state, icon }], nextNode, sellValue, treats, x, y }
  showCatPanel(info, { onBuy, onSell }) {
    this.hideCatPanel();
    const s = this.scene;
    const w = 184;
    const h = 92;
    const nodeW = 30;
    const nodeH = 24;
    const spots = { power: { x: 72, y: 18 }, skill: { x: 72, y: 44 }, weapon: { x: 138, y: 31 } };
    const root = { x: 14, y: 31 };
    const byKey = Object.fromEntries(info.nodes.map((n) => [n.key, n]));

    const parts = [
      panel(s, w, h, 'cheeseMid'),
      // Catches clicks on the panel's background so they don't reach the field.
      s.add.zone(0, 0, w, h).setOrigin(0).setInteractive(),
      text(s, 4, 4, info.name.toUpperCase(), 'cheeseLight'),
    ];

    // Sell button, top right.
    const sellStr = `SELL ${info.sellValue}`;
    const sellW = sellStr.length * CHAR_W + 6;
    const sellX = w - sellW - 3;
    parts.push(s.add.graphics().fillStyle(color('cheeseMid')).fillRect(sellX, 2, sellW, 12), text(s, sellX + 3, 4, sellStr, 'outline'));
    const sellZone = hitZone(s, sellW, 12).setPosition(sellX, 2);
    sellZone.on('pointerdown', onSell);
    parts.push(sellZone);

    // Lines joining the tree: bright once the node they lead from is owned.
    const lines = s.add.graphics();
    const link = (x1, y1, x2, y2, lit) => {
      const mid = Math.round((x1 + x2) / 2);
      lines
        .lineStyle(1, color(lit ? 'cheeseLight' : 'stoneDark'))
        .lineBetween(x1, y1, mid, y1)
        .lineBetween(mid, y1, mid, y2)
        .lineBetween(mid, y2, x2, y2);
    };
    const rootY = root.y + nodeH / 2;
    for (const key of ['power', 'skill']) {
      const y = spots[key].y + nodeH / 2;
      link(root.x + nodeW, rootY, spots[key].x, y, true);
      link(spots[key].x + nodeW, y, spots.weapon.x, spots.weapon.y + nodeH / 2, byKey[key].state === 'owned');
    }
    parts.push(lines);

    // The cat itself, at the root of the tree.
    parts.push(
      s.add.graphics().fillStyle(color('cheeseLight')).fillRect(root.x, root.y, nodeW, nodeH).fillStyle(color('dirtMid')).fillRect(root.x + 1, root.y + 1, nodeW - 2, nodeH - 2),
      s.add.image(root.x + nodeW / 2, root.y + nodeH / 2, info.sheet, 0),
    );

    // The two lines of text about whichever node you're pointing at (or the next one to buy).
    const titleLine = text(s, 4, 71, '', 'cheeseLight');
    const blurbLine = text(s, 4, 81, '', 'white');
    const describe = () => {
      const node = byKey[this.treeHover] || byKey[info.nextNode];
      titleLine.setText(node ? node.name : 'TREE COMPLETE!');
      blurbLine.setText(node ? node.blurb : '');
    };

    for (const node of info.nodes) {
      const { x, y } = spots[node.key];
      const owned = node.state === 'owned';
      const canBuy = node.state === 'ready' && info.treats >= node.cost;
      const border = owned ? 'cheeseLight' : canBuy ? 'white' : 'stoneDark';
      const fill = owned ? 'dirtMid' : 'outline';
      const dim = node.state === 'locked' ? 0.45 : 1;
      parts.push(s.add.graphics().fillStyle(color(border)).fillRect(x, y, nodeW, nodeH).fillStyle(color(fill)).fillRect(x + 1, y + 1, nodeW - 2, nodeH - 2).setAlpha(dim));
      parts.push(s.add.image(x + nodeW / 2, y + 8, node.icon).setAlpha(dim));
      const price = owned ? 'OK' : String(node.cost);
      const priceColor = owned ? 'cheeseLight' : canBuy ? 'white' : node.state === 'ready' ? 'red' : 'stoneMid';
      parts.push(text(s, x + (nodeW - price.length * CHAR_W) / 2, y + 15, price, priceColor).setAlpha(dim));
      const zone = hitZone(s, nodeW, nodeH).setPosition(x, y);
      zone.on('pointerover', () => {
        this.treeHover = node.key;
        describe();
      });
      zone.on('pointerout', () => {
        this.treeHover = null;
        describe();
      });
      zone.on('pointerdown', () => canBuy && onBuy(node.key));
      parts.push(zone);
    }
    parts.push(titleLine, blurbLine);
    describe();

    // Above the cat, or below it if there's no room; kept inside the screen.
    const v = this.view;
    let x = Math.round(info.x - w / 2);
    let y = Math.round(info.y - 22 - h);
    if (v) {
      x = Phaser.Math.Clamp(x, Math.round(v.x) + 2, Math.round(v.x + v.width) - w - 2);
      if (y < v.y + 2) y = Math.round(info.y + 6);
      y = Math.min(y, Math.round(v.y + v.height) - h - 2);
    }
    this.catPanel = s.add.container(x, y, parts).setDepth(HUD_DEPTH + 10);
  }

  hideCatPanel() {
    if (this.catPanel) this.catPanel.destroy();
    this.catPanel = null;
  }

  // Big two-line panel in the middle of the field (win / lose).
  banner(cx, cy, title, subtitle, accent) {
    const w = Math.max(title.length, subtitle.length) * CHAR_W + 24;
    const h = 52;
    const s = this.scene;
    s.add
      .graphics()
      .setDepth(BANNER_DEPTH)
      .fillStyle(color('outline'))
      .fillRect(cx - w / 2, cy - h / 2, w, h)
      .fillStyle(color(accent))
      .fillRect(cx - w / 2 + 2, cy - h / 2 + 2, w - 4, 1)
      .fillRect(cx - w / 2 + 2, cy + h / 2 - 3, w - 4, 1);
    const line = (y, str, colorName) =>
      text(s, cx, y, str, colorName).setOrigin(0.5).setDepth(BANNER_DEPTH + 1);
    line(cy - 8, title, 'cheeseLight');
    line(cy + 10, subtitle, 'white');
  }
}
