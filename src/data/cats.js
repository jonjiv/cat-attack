// Cat types. The shop lists them by price (see CATS_BY_PRICE). range is in pixels (a tile is 16 px);
// cooldown is seconds between attacks. power picks the attack in src/entities/Cat.js.
//
// Every cat has a tech tree: two upgrades (power and skill) in any order, and once you own
// both, a brand-new weapon that fires on top of the cat's normal attack.
//   stats: the stats a node changes.
//   fire (weapons only):
//     every: seconds between shots. damage, and any of: shots, splash, slow/slowTime, freeze, push, shake.
//     area: hits every mouse in reach instead of firing a shot. ring/sound: its look and noise.
//     icon: the weapon's sprite, also what it shoots. duration/arc: how the shot flies.
// A cat with both upgrades can also spot sneaky mice in tall grass, like Robocat.
// This file has no imports so the sprite builder (art-src/ui.js) can read the ranges too.
export const CATS = {
  pouncer: {
    name: 'Pouncer', blurb: 'LEAPS ON A MOUSE', sprite: 'pouncer', power: 'pounce',
    cost: 10, range: 30, damage: 2, cooldown: 0.7,
    tree: {
      power: { name: 'SHARP CLAWS', blurb: 'HITS MUCH HARDER', cost: 20, stats: { damage: 4 } },
      skill: { name: 'QUICK PAWS', blurb: 'FASTER, LONGER LEAPS', cost: 20, stats: { range: 36, cooldown: 0.5 } },
      weapon: {
        name: 'FISHBONE BOOMERANG', blurb: 'THROWS A BIG BONE', cost: 65,
        fire: { icon: 'wpnFishbone', every: 2.5, damage: 6, splash: 12, duration: 350, arc: 10 },
      },
    },
  },
  hairball: {
    name: 'Hairball Cat', blurb: 'LOBS HAIRBALLS FAR', sprite: 'hairball', power: 'lob',
    cost: 15, range: 56, damage: 2, cooldown: 1.5, splash: 12,
    tree: {
      power: { name: 'EXTRA FUZZ', blurb: 'BIGGER, HARDER SPLATS', cost: 30, stats: { damage: 4, splash: 16 } },
      skill: { name: 'STRONG LUNGS', blurb: 'COUGHS FARTHER, FASTER', cost: 25, stats: { range: 64, cooldown: 1.2 } },
      weapon: {
        name: 'GIANT HAIRBALL', blurb: 'A HUGE SPLAT', cost: 85,
        fire: { icon: 'wpnGiantHairball', every: 5, damage: 10, splash: 24, duration: 700, arc: 30 },
      },
    },
  },
  yarn: {
    name: 'Yarn Cat', blurb: 'TANGLES MICE TO SLOW THEM', sprite: 'yarn', power: 'yarn',
    cost: 12, range: 40, damage: 0.5, cooldown: 1.3, slow: 0.45, slowTime: 2.0,
    tree: {
      power: { name: 'TIGHT KNOTS', blurb: 'SLOWS MICE EVEN MORE', cost: 20, stats: { slow: 0.25, slowTime: 3 } },
      skill: { name: 'LONG THROW', blurb: 'REACHES FARTHER', cost: 20, stats: { damage: 1, range: 48 } },
      weapon: {
        name: 'YARN NET', blurb: 'SLOWS A WHOLE GROUP', cost: 60,
        fire: { icon: 'wpnNet', every: 4, damage: 1, splash: 22, slow: 0.3, slowTime: 2.5, duration: 400, arc: 14 },
      },
    },
  },
  ice: {
    name: 'Ice Cat', blurb: 'FREEZES A MOUSE SOLID', sprite: 'ice', power: 'ice',
    cost: 18, range: 36, damage: 1, cooldown: 2.2, freezeTime: 1.0,
    tree: {
      power: { name: 'DEEP FREEZE', blurb: 'LONGER, COLDER FREEZE', cost: 30, stats: { damage: 1.8, freezeTime: 1.7 } },
      skill: { name: 'ICE SPEED', blurb: 'FASTER, WIDER REACH', cost: 25, stats: { range: 44, cooldown: 1.8 } },
      weapon: {
        name: 'BLIZZARD', blurb: 'FREEZES ALL NEARBY', cost: 90,
        fire: { icon: 'wpnBlizzard', area: true, every: 7, damage: 2, freeze: 1, ring: 'ice', sound: 'ice' },
      },
    },
  },
  speedy: {
    name: 'Speedy Cat', blurb: 'SUPER FAST LITTLE SWIPES', sprite: 'speedy', power: 'swipe',
    cost: 14, range: 24, damage: 0.6, cooldown: 0.3,
    tree: {
      power: { name: 'RAZOR CLAWS', blurb: 'HITS HARDER', cost: 28, stats: { damage: 1.15 } },
      skill: { name: 'TURBO PAWS', blurb: 'SWIPES EVEN FASTER', cost: 20, stats: { range: 28, cooldown: 0.2 } },
      weapon: {
        name: 'THROWING STARS', blurb: '3 STARS AT ONCE', cost: 65,
        fire: { icon: 'wpnStar', every: 2, damage: 2, shots: 3, duration: 220, arc: 2 },
      },
    },
  },
  hiss: {
    name: 'Hiss Cat', blurb: 'HISSES MICE BACKWARD', sprite: 'hiss', power: 'hiss',
    cost: 20, range: 30, damage: 0.5, cooldown: 3.0, push: 20,
    tree: {
      power: { name: 'BIG LUNGS', blurb: 'PUSHES MICE FARTHER', cost: 35, stats: { damage: 1, push: 36 } },
      skill: { name: 'SHARP EARS', blurb: 'FASTER, WIDER HISS', cost: 30, stats: { range: 36, cooldown: 2.4 } },
      weapon: {
        name: 'SONIC BOOM', blurb: 'BLASTS ALL NEARBY', cost: 95,
        fire: { icon: 'wpnSonic', area: true, every: 6, damage: 3, push: 30, ring: 'white', sound: 'hiss' },
      },
    },
  },
  sleepy: {
    name: 'Sleepy Cat', blurb: 'NAPS, THEN GIANT STOMP', sprite: 'sleepy', power: 'stomp',
    cost: 25, range: 34, damage: 3, cooldown: 4.0,
    tree: {
      power: { name: 'HEAVY PAWS', blurb: 'MUCH BIGGER STOMP', cost: 40, stats: { damage: 5.8 } },
      skill: { name: 'SHORT NAPS', blurb: 'WAKES UP SOONER', cost: 35, stats: { range: 40, cooldown: 3.0 } },
      weapon: {
        name: 'PILLOW BOMB', blurb: 'A HUGE FLUFFY BLAST', cost: 100,
        fire: { icon: 'wpnPillow', every: 6, damage: 14, splash: 28, duration: 800, arc: 34, shake: true },
      },
    },
  },
  robocat: {
    name: 'Robocat', blurb: 'LASERS. SEES SNEAKY MICE', sprite: 'robocat', power: 'laser',
    cost: 30, range: 48, damage: 1.5, cooldown: 0.6, seesHidden: true,
    tree: {
      power: { name: 'MORE WATTS', blurb: 'STRONGER LASERS', cost: 45, stats: { damage: 2.6 } },
      skill: { name: 'TARGET SCOPE', blurb: 'FASTER, LONGER AIM', cost: 40, stats: { range: 56, cooldown: 0.4 } },
      weapon: {
        name: 'MISSILES', blurb: '3 ROCKETS AT ONCE', cost: 110,
        fire: { icon: 'wpnMissile', every: 3, damage: 6, shots: 3, splash: 12, duration: 500, arc: 16 },
      },
    },
  },
  army: {
    name: 'Tiny Cat Army', blurb: 'A SQUAD CHARGES MANY MICE', sprite: 'army', power: 'army',
    cost: 16, range: 36, damage: 1, cooldown: 1.0, squad: 2,
    tree: {
      power: { name: 'BOOT CAMP', blurb: 'MORE, TOUGHER KITTENS', cost: 28, stats: { damage: 1.75, squad: 3 } },
      skill: { name: 'SCOUTS', blurb: 'FASTER, WIDER CHARGE', cost: 24, stats: { range: 42, cooldown: 0.8 } },
      weapon: {
        name: 'TINY CANNON', blurb: 'BIG BOOM, TINY CREW', cost: 80,
        fire: { icon: 'wpnShell', every: 3, damage: 7, splash: 16, duration: 420, arc: 14 },
      },
    },
  },
  // Fisher Cat doesn't fight until it gets its harpoon. During waves it catches `haul` treats every cooldown.
  fisher: {
    name: 'Fisher Cat', blurb: 'CATCHES EXTRA FISH TREATS', sprite: 'fisher', power: 'fish',
    cost: 30, range: 16, damage: 0, cooldown: 6.0, haul: 2,
    tree: {
      power: { name: 'BIG NET', blurb: 'CATCHES MORE TREATS', cost: 35, stats: { haul: 4 } },
      skill: { name: 'LUCKY BAIT', blurb: 'CATCHES MORE OFTEN', cost: 30, stats: { cooldown: 4.5 } },
      weapon: {
        name: 'HARPOON', blurb: 'NOW IT FIGHTS TOO', cost: 65, range: 48,
        fire: { icon: 'wpnHarpoon', every: 2.5, damage: 6, duration: 260, arc: 4 },
      },
    },
  },
  wizard: {
    name: 'Wizard Cat', blurb: 'ZAPS A CHAIN OF MICE', sprite: 'wizard', power: 'zap',
    cost: 28, range: 44, damage: 1.2, cooldown: 1.4, chains: 3,
    tree: {
      power: { name: 'ARCANE POWER', blurb: 'LONGER, STRONGER ZAPS', cost: 40, stats: { damage: 2.2, chains: 4 } },
      skill: { name: 'MANA FLOW', blurb: 'FASTER, WIDER ZAPS', cost: 35, stats: { range: 52, cooldown: 1.2 } },
      weapon: {
        name: 'METEOR', blurb: 'CALLS DOWN A ROCK', cost: 105,
        fire: { icon: 'wpnMeteor', every: 6, damage: 16, splash: 30, duration: 900, arc: 60, shake: true },
      },
    },
  },
};

// Cheapest first: the order cats appear in the shop and on the title screen.
export const CATS_BY_PRICE = Object.values(CATS).sort((a, b) => a.cost - b.cost);

// A cat's look: 1 plain, 2 and 3 with one or both upgrades, 4 with its weapon.
export const MAX_LEVEL = 4;

// The tree's nodes, in the order the "next upgrade" shortcut buys them.
export const NODES = ['power', 'skill', 'weapon'];

// 'owned', 'ready' (can be bought), or 'locked' (the weapon needs both upgrades first).
export function nodeState(owned, node) {
  if (owned.has(node)) return 'owned';
  if (node === 'weapon' && !(owned.has('power') && owned.has('skill'))) return 'locked';
  return 'ready';
}

// A cat's stats given which nodes it owns (a Set).
export function catStats(type, owned = new Set()) {
  const stats = { ...type };
  if (owned.has('power')) Object.assign(stats, type.tree.power.stats);
  if (owned.has('skill')) Object.assign(stats, type.tree.skill.stats);
  if (owned.has('power') && owned.has('skill')) stats.seesHidden = true;
  if (owned.has('weapon')) {
    stats.weapon = type.tree.weapon.fire;
    if (type.tree.weapon.range) stats.range = type.tree.weapon.range;
  }
  return stats;
}

// Selling gives back most of what you spent.
export const SELL_BACK = 0.7;
