// Map 1: The Field. Coordinates are [col, row]; the playing field is cols x rows tiles.
export const FIELD = {
  name: 'The Field',
  cols: 24,
  rows: 14,

  // Mice walk these corners in order, in straight lines between them.
  path: [
    [0, 2],
    [6, 2],
    [6, 10],
    [12, 10],
    [12, 3],
    [18, 3],
    [18, 11],
    [21, 11],
  ],
  hole: [0, 2],
  cheese: [22, 11],
  // The cheese pile is bigger than one tile; these tiles are under it.
  cheeseTiles: [
    [21, 10], [22, 10], [23, 10],
    [22, 11], [23, 11],
    [21, 12], [22, 12], [23, 12],
  ],

  // Tall grass growing over the path. Mice walk through it, and sneaky mice hide in it.
  pathGrass: [
    [6, 5], [6, 6], [6, 7],
    [8, 10], [9, 10], [10, 10],
    [12, 6], [12, 7], [12, 8],
    [18, 6], [18, 7], [18, 8],
  ],

  tallGrass: [
    [8, 5], [9, 5], [8, 6], [9, 6], [10, 6], [9, 7],
    [14, 6], [15, 6], [15, 7], [16, 7], [15, 8],
    [2, 9], [3, 9], [3, 10], [2, 11],
  ],

  // blocks: cats can't be placed on this tile
  props: [
    { key: 'bush', at: [3, 0], blocks: true },
    { key: 'bush', at: [10, 1], blocks: true },
    { key: 'bush', at: [22, 1], blocks: true },
    { key: 'bush', at: [0, 12], blocks: true },
    { key: 'bush', at: [15, 13], blocks: true },
    { key: 'bush', at: [21, 6], blocks: true },
    { key: 'rock', at: [8, 12], blocks: true },
    { key: 'rock', at: [16, 1], blocks: true },
    { key: 'rock', at: [3, 5], blocks: true },
    { key: 'rock', at: [22, 8], blocks: true },
    { key: 'flowersA', at: [1, 6] },
    { key: 'flowersB', at: [9, 3] },
    { key: 'flowersA', at: [14, 11] },
    { key: 'flowersB', at: [20, 13] },
    { key: 'flowersA', at: [19, 0] },
    { key: 'flowersB', at: [4, 13] },
    { key: 'flowersA', at: [10, 8] },
    { key: 'flowersB', at: [16, 5] },
    { key: 'flowersA', at: [23, 4] },
  ],
};
