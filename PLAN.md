# Cat Attack: a cat vs. mice tower defense game

Mice are marching across a field to steal the cheese pile. Cats guard the path, and each kind of cat has its own special power. The design comes from Gideon's answers.

## Core game

- **Look:** overhead **pixel art** with a slight "3/4" view, so things show a bit of their front. The playing field is a rectangle of square tiles, **24×14 tiles**. The whole field is on screen with no scrolling.
- **Screen fit:** the playing field is zoomed to fill the screen's width or its height, whichever runs out first. The rest of the screen shows meadow (grass, trees, bushes, flowers) out to the edges, so nothing is ever black bars.
- **Map 1: The Field.** Grass tiles, a winding dirt path, flowers, rocks, bushes, and tall-grass patches where sneaky mice can hide. Mice enter at a mouse hole on the left edge, and the cheese pile sits at the far right end.
- **Cheese:** each mouse that reaches the pile takes a bite. The pile sprite shrinks in stages (full → ¾ → ½ → ¼ → crumbs). When the cheese is gone, you lose.
- **Money:** every mouse you beat drops **fish treats**. You spend treats to place and upgrade cats. You also get a small bonus for finishing each wave.
- **Waves:** you press "Next Wave". Each wave brings more mice and tougher ones, and a **Big Boss Rat** shows up every 5th wave.
- **Defeat effect:** a beaten mouse vanishes in a little burst of pixel sparkles (a 4-frame twinkle of tiny plus-shaped stars) and a treat pops out.
- **Win:** survive all the waves on the map (about 15 for the Field).

## Cats (towers)

| Cat | Power | Good against |
|---|---|---|
| **Pouncer** (basic) | Leaps onto one nearby mouse. Short range, cheap. | Early mice |
| **Hairball Cat** | Coughs hairballs at long range. A slow lob that splats. | Armored mice (big hits) |
| **Yarn Cat** | Throws yarn that tangles mice and slows them. | Speedy mice |
| **Hiss Cat** | A loud hiss pushes nearby mice backward along the path. | Groups of mice |
| **Sleepy Cat** | Naps, then wakes up and does a giant stomp that hits every mouse in a big area. | Crowds, bosses |
| **Ice Cat** | Freezes a mouse solid for a moment. | Speedy mice, bosses |
| **Speedy Cat** | Swipes very fast with small hits. | Swarms |
| **Robocat** | Laser eyes that can see sneaky mice in the grass. Expensive. | Sneaky mice |

Each cat gets 2 upgrade levels, with a sprite change at each level (for example a collar, then a little crown).

## Mice (enemies)

| Mouse | Trait | First appears |
|---|---|---|
| Field Mouse | Basic | Wave 1 |
| Speedy Mouse | Fast, low health | Wave 3 |
| Armored Mouse | Bottle-cap helmet, takes extra hits | Wave 5 |
| Sneaky Mouse | Invisible in tall grass unless Robocat (or an upgraded cat) is nearby | Wave 7 |
| Big Boss Rat | Huge, slow, lots of health, takes 3 bites of cheese | Waves 5, 10, 15 |

Mouse health and speed grow a little each wave, so later waves are stronger, not just bigger.

## Tech approach

- **Engine:** plain HTML5 + JavaScript with **Phaser 3** loaded from a CDN. No build step: open `index.html` or run a tiny local server.
- **Overhead grid:** a tile's center is at `(col * 16 + 8, row * 16 + 8)`. Cats, mice, and scenery are drawn in order of how far down the screen their feet are, so lower things overlap higher ones correctly.
- **Camera:** the canvas fills the whole window. The camera zooms so the 384×224 pixel playing field fits the width or height, and centers on it. When the window changes size, any newly visible meadow around the field gets drawn.
- **Path:** waypoints across tile centers. Mice move along it smoothly.
- **Data-driven:** cats, mice, and waves are defined in JSON-like config files, so balancing is just editing numbers.
- **Crisp pixels:** Phaser runs with `pixelArt: true`, so pixels are never smoothed or blurred. The zoom is whatever makes the field fit, so it isn't always a whole number. At some sizes, a few pixel rows come out one screen pixel wider than others, which is hard to notice at normal sizes.

## Pixel art style

- **Tiles:** 16×16 pixel squares. Ground tiles are grass (3 variants so the field doesn't look repetitive) and dirt path. There are 16 path pieces, one for each way the path can connect to its neighbors (up, down, left, right), and each has ragged grass edges. Tall grass, flowers, rocks, bushes, trees, and the mouse hole are separate sprites placed on top.
- **Sprite sizes:**
  - Cats: about 20×20 px (a little bigger than a tile, so they stand out).
  - Mice: about 12×12 px.
  - Big Boss Rat: about 32×32 px.
  - Cheese pile: 44×34 px (about 3×2 tiles), with 5 shrink stages.
  - Meadow trees: 32×36 px.
  - Projectiles (hairball, yarn ball, ice shard, laser): 4–8 px.
- **Palette:** one small shared palette of about 32 colors for everything. Warm greens and browns for the field, cheese yellows, and a few bright colors for effects (ice blue, laser red, sparkle white). Outlines are a dark color (not pure black), which keeps the art soft and friendly.
- **Directions:** mice walk up, down, left, and right. We draw up, down, and one side view, then flip the side view for the other side. Cats face their target the same way.
- **Animations** (short, 2–6 frames each):
  - Mice: walk, and the sparkle-vanish.
  - Pouncer: idle tail-flick, then pounce (crouch, leap, land).
  - Hairball Cat: cough.
  - Yarn Cat: throw.
  - Hiss Cat: hiss, with a pixel sound-wave ring.
  - Sleepy Cat: sleeping with floating "z"s, then wake and stomp, with a dust ring.
  - Ice Cat: frost puff.
  - Robocat: blinking eye lights and a laser.
  - Upgrades: each level adds a visible pixel detail (collar → crown, a brighter fur color, and so on).
- **UI:** a pixel font (a free bitmap font such as "Press Start 2P" or a custom 5×7 font), chunky 9-slice pixel panels for the shop bar, and pixel icons for fish treats and cheese.
- **How the art gets made:**
  1. **Placeholder pass:** I draw sprites in code as small pixel grids (arrays of palette colors) and turn them into PNG sprite sheets with a script. This makes simple, real pixel art right away, and the game always has art to show.
  2. **Real art pass:** we replace the placeholders with hand-drawn sheets. I can keep drawing them as pixel grids, or Gideon could draw some in a free pixel editor like Piskel or LibreSprite and drop the PNGs into `assets/`. Sprite sizes and sheet layouts stay the same, so swapping art needs no code changes.
- **Effects stay pixel art too:** particles are 1–2 px squares that snap to whole pixels, hits flash white for a frame, and nothing uses soft glows or blur.

### Proposed file layout

```
index.html
src/
  main.js            Phaser config, scenes
  grid.js            tile ↔ world math, depth sorting
  map.js             path tiles, blocked tiles, path piece picking
  scenes/            Boot, Menu, Game, UI overlay, GameOver/Win
  entities/          Cat.js, Mouse.js, Projectile.js
  data/              cats.js, mice.js, waves.js, maps/field.js
  fx/                sparkle.js, cheese shrink
art-src/             pixel grids + palette.js used to generate sprite sheets
tools/
  build-sprites.js   turns pixel grids into PNG sprite sheets
assets/
  tiles/  cats/  mice/  fx/  ui/  font/
```

## Build phases

1. **Pixel setup, field, and path:**
   - Set up a full-window pixel art canvas, with the camera fitting the field to the screen.
   - Make the palette and the sprite-building script.
   - Draw the overhead field with pixel tiles, the path, and the cheese pile. Fill the rest of the screen with meadow.
2. **Mice walking:** basic mice spawn, follow the path, and bite the cheese. The cheese shrinks, and the game is lost when it's gone.
3. **Pouncer cat:** place cats on grass tiles with treats. Pounce attack, sparkle on defeat, treat drops.
4. **Waves and UI:** a wave counter, a Next Wave button, the treat counter, a cat shop bar, and win/lose screens.
5. **More cats:** Hairball, Yarn, Ice, and Speedy first (simplest powers), then Hiss, Sleepy, and Robocat.
6. **More mice:** Speedy, Armored, Sneaky (tall-grass stealth), and the Big Boss Rat.
7. **Upgrades and balance:** two upgrade levels per cat, a sell button, and tuning of the wave difficulty curve.
8. **Art and polish:** final pixel art sprite sheets and animations, a pixel UI and font, chiptune-style sound effects (meows, squeaks, hisses), and music.

Phase 4 gives a small, playable game. Each phase after that adds to a working game.

**Status:** all 8 phases are built. See [README.md](README.md) for how to play.

## Open questions for later

- Should the game have a "fast forward" button?
- Should there be more maps after the field (kitchen, barn, cheese factory)?
- Does Gideon want to draw some of the pixel art (in Piskel or LibreSprite)? If so, which characters?
