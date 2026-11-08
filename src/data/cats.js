// Cat types, in shop order (keys 1-8 pick them). range is in pixels (a tile is 16 px);
// cooldown is seconds between attacks. power picks the attack in src/entities/Cat.js.
// upgrades: level 2 and level 3. Each lists its cost and the stats that change.
// Every level-3 cat can spot sneaky mice in tall grass, like Robocat.
// This file has no imports so the sprite builder (art-src/ui.js) can read the ranges too.
export const CATS = {
  pouncer: {
    name: 'Pouncer', blurb: 'LEAPS ON A MOUSE', sprite: 'pouncer', power: 'pounce',
    cost: 10, range: 30, damage: 2, cooldown: 0.7,
    upgrades: [
      { cost: 15, damage: 3, cooldown: 0.6 },
      { cost: 25, damage: 4.5, range: 36, cooldown: 0.5 },
    ],
  },
  hairball: {
    name: 'Hairball Cat', blurb: 'LOBS HAIRBALLS FAR', sprite: 'hairball', power: 'lob',
    cost: 15, range: 56, damage: 2, cooldown: 1.5, splash: 12,
    upgrades: [
      { cost: 20, damage: 3, splash: 14 },
      { cost: 35, damage: 4.5, range: 64, splash: 16, cooldown: 1.2 },
    ],
  },
  yarn: {
    name: 'Yarn Cat', blurb: 'TANGLES MICE TO SLOW THEM', sprite: 'yarn', power: 'yarn',
    cost: 12, range: 40, damage: 0.5, cooldown: 1.3, slow: 0.45, slowTime: 2.0,
    upgrades: [
      { cost: 15, damage: 0.8, slow: 0.35, slowTime: 2.5 },
      { cost: 25, damage: 1, range: 48, slow: 0.25, slowTime: 3 },
    ],
  },
  ice: {
    name: 'Ice Cat', blurb: 'FREEZES A MOUSE SOLID', sprite: 'ice', power: 'ice',
    cost: 18, range: 36, damage: 1, cooldown: 2.2, freezeTime: 1.0,
    upgrades: [
      { cost: 20, damage: 1.5, freezeTime: 1.4 },
      { cost: 35, damage: 2, range: 44, freezeTime: 1.8, cooldown: 1.8 },
    ],
  },
  speedy: {
    name: 'Speedy Cat', blurb: 'SUPER FAST LITTLE SWIPES', sprite: 'speedy', power: 'swipe',
    cost: 14, range: 24, damage: 0.6, cooldown: 0.3,
    upgrades: [
      { cost: 18, damage: 0.9, cooldown: 0.25 },
      { cost: 30, damage: 1.3, range: 28, cooldown: 0.2 },
    ],
  },
  hiss: {
    name: 'Hiss Cat', blurb: 'HISSES MICE BACKWARD', sprite: 'hiss', power: 'hiss',
    cost: 20, range: 30, damage: 0.5, cooldown: 3.0, push: 20,
    upgrades: [
      { cost: 25, damage: 0.8, push: 28 },
      { cost: 40, damage: 1, range: 36, push: 36, cooldown: 2.4 },
    ],
  },
  sleepy: {
    name: 'Sleepy Cat', blurb: 'NAPS, THEN GIANT STOMP', sprite: 'sleepy', power: 'stomp',
    cost: 25, range: 34, damage: 3, cooldown: 4.0,
    upgrades: [
      { cost: 30, damage: 4.5, cooldown: 3.5 },
      { cost: 45, damage: 6.5, range: 40, cooldown: 3.0 },
    ],
  },
  robocat: {
    name: 'Robocat', blurb: 'LASERS. SEES SNEAKY MICE', sprite: 'robocat', power: 'laser',
    cost: 30, range: 48, damage: 1.5, cooldown: 0.6, seesHidden: true,
    upgrades: [
      { cost: 35, damage: 2.2, cooldown: 0.5 },
      { cost: 50, damage: 3, range: 56, cooldown: 0.4 },
    ],
  },
};

export const MAX_LEVEL = 3;

// A cat's stats at a level (1-3): the base stats with each upgrade so far laid on top.
export function catStats(type, level) {
  const stats = { ...type };
  for (let i = 0; i < level - 1; i++) Object.assign(stats, type.upgrades[i]);
  if (level === MAX_LEVEL) stats.seesHidden = true;
  stats.cost = type.cost;
  return stats;
}

// What the next upgrade costs, or null at max level.
export function upgradeCost(type, level) {
  return level < MAX_LEVEL ? type.upgrades[level - 1].cost : null;
}

// Selling gives back most of what you spent.
export const SELL_BACK = 0.7;
