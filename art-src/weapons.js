// Each cat's end-of-tree weapon. The same little picture is what the weapon shoots,
// its button in the tech tree, and the badge the cat wears once it owns the weapon.
import { art } from './lib.js';

const DEFS = {
  wpnFishbone: { rows: ['.o.o.o.', 'oWWWWWo', '.o.o.o.'], legend: { W: 'white' } },
  wpnGiantHairball: {
    rows: ['..ooo..', '.oSsSo.', 'oSsSSso', 'oSSsSSo', 'oSsSSso', '.oSsSo.', '..ooo..'],
    legend: { S: 'stoneMid', s: 'stoneLight' },
  },
  wpnNet: { rows: ['oPoPoPo', 'PoPoPoP', 'oPoPoPo', 'PoPoPoP', 'oPoPoPo'], legend: { P: 'petalPink' } },
  wpnBlizzard: { rows: ['o.o.o', '.oIo.', 'oIWIo', '.oIo.', 'o.o.o'], legend: { I: 'ice', W: 'white' } },
  wpnStar: { rows: ['...o...', '..oSo..', 'ooSSSoo', '..oSo..', '...o...'], legend: { S: 'stoneHi' } },
  wpnSonic: { rows: ['..WW...', '.W..WW.', 'W..W..W', '.W..WW.', '..WW...'], legend: { W: 'white' } },
  wpnPillow: { rows: ['.ooooo.', 'oWWWWWo', 'oWPWWWo', 'oWWWPWo', '.ooooo.'], legend: { W: 'white', P: 'petalPurple' } },
  wpnMissile: { rows: ['..o..', '.oRo.', '.oWo.', '.oWo.', 'oYoYo'], legend: { R: 'red', W: 'white', Y: 'cheeseLight' } },
  wpnShell: { rows: ['.ooooo.', 'oSSSSRo', '.ooooo.'], legend: { S: 'stoneMid', R: 'red' } },
  wpnHarpoon: { rows: ['....oSo', '...oWo.', '..oWo..', '.oWo...', 'oWo....'], legend: { S: 'stoneHi', W: 'woodLight' } },
  wpnMeteor: { rows: ['..oFo..', '.oFRFo.', 'oRRYRRo', '.oRRRo.', '..ooo..'], legend: { F: 'laser', R: 'red', Y: 'cheeseLight' } },
};

export const WEAPON_ART = DEFS;

export const sprites = Object.fromEntries(
  Object.entries(DEFS).map(([key, { rows, legend }]) => [
    key,
    { frames: [art(rows, legend)], anchor: [Math.floor(rows[0].length / 2), Math.floor(rows.length / 2)] },
  ]),
);
