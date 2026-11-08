// Mouse types. speed is pixels per second (a tile is 16 px). bites = cheese taken on arrival.
// treats = fish treats you earn for beating it.
// armor: taken off every hit (a hit always does at least 0.25), so small hits barely hurt.
// sneaky: invisible in tall grass, and safe from cats there, unless a Robocat is in reach.
// boss: freezes and hisses only work half as well, and it has a health bar.
export const MICE = {
  field: { name: 'Field Mouse', sprite: 'mouse', speed: 30, health: 3, bites: 1, treats: 2 },
  speedy: { name: 'Speedy Mouse', sprite: 'speedyMouse', speed: 48, health: 1.6, bites: 1, treats: 2 },
  armored: { name: 'Armored Mouse', sprite: 'armoredMouse', speed: 24, health: 6, armor: 0.5, bites: 1, treats: 3 },
  sneaky: { name: 'Sneaky Mouse', sprite: 'sneakyMouse', speed: 32, health: 3.5, bites: 1, treats: 3, sneaky: true },
  boss: {
    name: 'Big Boss Rat', sprite: 'bossRat', speed: 15, health: 45, armor: 0.3, bites: 3, treats: 20, boss: true,
  },
};
