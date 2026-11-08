# Cat Attack

Cats vs. mice! Mice march along the path to steal the cheese pile. Place cats to stop them. Game ideas by Gideon.

## Play it

**[Play Cat Attack online](https://jonjiv.github.io/cat-attack/)**

Or run it on your own computer. You need [Node.js](https://nodejs.org). Nothing else gets installed.

```bash
npm start
```

Then open http://localhost:8080. The game loads its game library (Phaser) and its pixel font from the internet, so it needs a connection.

## How to play

- **Place cats:** pick a cat from the shop at the bottom (or press 1–8), then click a grass tile. Each cat costs fish treats.
- **Start a wave:** press **NEXT WAVE** (or Space). Beat all 15 waves with some cheese left to win.
- **Earn treats:** every mouse your cats beat drops fish treats, and clearing a wave gives a bonus.
- **Upgrade and sell:** click a cat you placed. Level 2 adds a collar, and level 3 adds a crown and lets the cat see sneaky mice. Selling gives back 70% of what you spent. The keys **U** and **S** do the same, and **Esc** closes the panel.
- **Sound:** the speaker and note buttons at the top turn sound effects and music on and off.

## The cats

| Cat | Power |
|---|---|
| Pouncer | Leaps on a mouse |
| Hairball Cat | Lobs hairballs far; they splat every mouse nearby |
| Yarn Cat | Tangles mice to slow them down |
| Ice Cat | Freezes a mouse solid |
| Speedy Cat | Super fast little swipes up close |
| Hiss Cat | Hisses nearby mice backward along the path |
| Sleepy Cat | Naps, then a giant stomp hits every mouse around it |
| Robocat | Laser eyes; sees sneaky mice in tall grass |

## The mice

| Mouse | What to know |
|---|---|
| Field Mouse | The regular one |
| Speedy Mouse | Fast but fragile |
| Armored Mouse | Bottle-cap helmet takes some off every hit, so use big hitters |
| Sneaky Mouse | Hides in the tall grass on the path, where only Robocat or level-3 cats can see it |
| Big Boss Rat | Huge, tough, and takes 3 bites of cheese. Shows up in waves 5, 10, and 15 |

## For grown-ups changing the game

- **Stats:**
  - cats, prices, and upgrades: [src/data/cats.js](src/data/cats.js)
  - mice: [src/data/mice.js](src/data/mice.js)
  - waves: [src/data/waves.js](src/data/waves.js)
  - the map: [src/data/maps/field.js](src/data/maps/field.js)
- **Art:** all of it is drawn in code as grids of colors in [art-src/](art-src/). After changing it, rebuild the images:
  ```bash
  npm run sprites
  ```
- **Sound:** sound effects and music are made in code by [src/audio/sound.js](src/audio/sound.js). The tune is in [src/audio/song.js](src/audio/song.js).
- **Balance check:** [tools/balance-bot.js](tools/balance-bot.js) plays whole games at 6× speed to check the difficulty. Instructions are at the top of that file.

## License

Cat Attack is open source under the [MIT License](LICENSE). It uses [Phaser](https://phaser.io) (MIT) and the [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) font (SIL Open Font License), both loaded from the internet when the game starts.
