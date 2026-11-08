import { PALETTE } from '../art-src/palette.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';

// The canvas fills the whole window. GameScene zooms the camera so the playing field
// fits the screen's width or height, and draws meadow out to the edges.
// Kept on window so the game can be poked at from the browser console while testing.
window.catAttack = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  pixelArt: true,
  backgroundColor: PALETTE.grassMid,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [BootScene, TitleScene, GameScene],
});
