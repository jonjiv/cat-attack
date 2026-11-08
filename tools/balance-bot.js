// Scripted player for checking difficulty. Runs in the browser, in the game page's console:
//   const bot = await import('/tools/balance-bot.js'); bot.runBot(bot.MIXED)
// then read window.botLog for how much cheese each wave cost.
// A plan is a list of steps done in order whenever there are enough treats:
//   ['place', catKey, col, row]  or  ['up', '', col, row] (upgrade the cat on that tile)

export async function runBot(plan, speed = 6) {
  const s = window.catAttack.scene.getScene('Game');
  s.setGameSpeed(speed);
  const cam = s.cameras.main;
  const log = [];
  window.botLog = log;
  let i = 0;
  const typeFor = (key) => s.hud.cards.find((c) => c.type.sprite === key).type;
  const tileOnScreen = (c, r) => ({ x: (c * 16 + 8 - cam.worldView.x) * cam.zoom, y: (r * 16 + 8 - cam.worldView.y) * cam.zoom });

  const spend = () => {
    while (i < plan.length) {
      const [op, key, c, r] = plan[i];
      if (op === 'place') {
        const type = typeFor(key);
        if (s.treats < type.cost) return;
        s.selectCat(type);
        s.tryPlaceCat(tileOnScreen(c, r));
        if (!s.cats.get(`${c},${r}`)) log.push(`FAILED place ${key} ${c},${r}`);
      } else {
        const cat = s.cats.get(`${c},${r}`);
        if (cat && cat.upgradeCost !== null) {
          if (s.treats < cat.upgradeCost) return;
          s.upgradeCat(cat);
        }
      }
      i++;
    }
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  while (!s.gameOver) {
    spend();
    const before = s.cheeseLeft;
    s.startWave();
    while (s.waveRunning && !s.gameOver) await sleep(150);
    await sleep(300); // let flying treats land
    log.push(`w${s.wave}: cheese ${s.cheeseLeft} (-${before - s.cheeseLeft}) treats ${s.treats} cats ${s.cats.size} plan ${i}/${plan.length}`);
  }
  log.push(s.cheeseLeft > 0 ? 'WON' : 'LOST');
  return log;
}

// A sensible mixed build: early Pouncers, then splash, slow, Robocats for sneaky mice, then upgrades.
export const MIXED = [
  ['place', 'pouncer', 5, 3], ['place', 'pouncer', 7, 4], ['place', 'yarn', 5, 6], ['place', 'hairball', 8, 8],
  ['up', '', 5, 3], ['place', 'hairball', 13, 8], ['place', 'robocat', 11, 7], ['place', 'ice', 17, 5],
  ['place', 'sleepy', 7, 11], ['up', '', 8, 8], ['place', 'speedy', 11, 9], ['up', '', 5, 6],
  ['place', 'hiss', 17, 9], ['place', 'robocat', 7, 6], ['up', '', 11, 7], ['up', '', 13, 8],
  ['up', '', 7, 4], ['up', '', 8, 8], ['up', '', 13, 8], ['up', '', 5, 3], ['up', '', 7, 11],
  ['up', '', 17, 5], ['up', '', 7, 6], ['up', '', 11, 9], ['up', '', 17, 9], ['up', '', 7, 4],
  ['up', '', 5, 6], ['up', '', 11, 7], ['up', '', 7, 6], ['up', '', 7, 11], ['up', '', 17, 5],
  ['up', '', 11, 9], ['up', '', 17, 9],
];

// A lazy build: only Pouncers, never upgraded. It should lose somewhere in the middle.
export const POUNCERS = [
  [5, 3], [7, 4], [5, 7], [7, 9], [11, 9], [13, 5], [11, 4], [17, 5], [19, 7], [17, 9], [13, 9], [20, 10],
].map(([c, r]) => ['place', 'pouncer', c, r]);
