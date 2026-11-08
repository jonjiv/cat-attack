// Loads the sprite manifest, then every sprite sheet it lists.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.json('manifest', 'assets/manifest.json');
    this.load.on('filecomplete-json-manifest', (_key, _type, manifest) => {
      for (const [key, s] of Object.entries(manifest)) {
        this.load.spritesheet(key, s.file, { frameWidth: s.frameWidth, frameHeight: s.frameHeight });
      }
    });
  }

  create() {
    this.registry.set('manifest', this.cache.json.get('manifest'));
    // Wait for the pixel font so text doesn't first draw in a fallback font.
    const start = () => this.scene.start('Title');
    document.fonts.load('8px "Press Start 2P"').then(start, start);
  }
}
