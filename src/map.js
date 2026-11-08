// Turns a map definition into the facts the game needs: which tiles are path, which are blocked, etc.
const key = (col, row) => `${col},${row}`;

// Every tile the path passes through, in walking order.
function pathTiles(corners) {
  const tiles = [corners[0]];
  for (let i = 1; i < corners.length; i++) {
    let [c, r] = corners[i - 1];
    const [tc, tr] = corners[i];
    while (c !== tc || r !== tr) {
      c += Math.sign(tc - c);
      r += Math.sign(tr - r);
      tiles.push([c, r]);
    }
  }
  return tiles;
}

export function buildMap(def) {
  const path = pathTiles(def.path);
  const pathSet = new Set(path.map(([c, r]) => key(c, r)));
  const tallSet = new Set([...def.tallGrass, ...def.pathGrass].map(([c, r]) => key(c, r)));
  const blocked = new Set([...pathSet, ...tallSet, key(...def.hole), key(...def.cheese)]);
  for (const t of def.cheeseTiles) blocked.add(key(...t));
  for (const p of def.props) if (p.blocks) blocked.add(key(...p.at));

  const isPath = (col, row) => pathSet.has(key(col, row));
  // The path's last tile runs on into the cheese pile.
  const joinsPath = (col, row) => isPath(col, row) || key(col, row) === key(...def.cheese);

  return {
    def,
    path,
    inBounds: (col, row) => col >= 0 && row >= 0 && col < def.cols && row < def.rows,
    isPath,
    isTallGrass: (col, row) => tallSet.has(key(col, row)),
    canPlace: (col, row) => !blocked.has(key(col, row)),
    // A cat now sits here.
    occupy: (col, row) => blocked.add(key(col, row)),
    // The cat here was sold.
    vacate: (col, row) => blocked.delete(key(col, row)),

    // Which frame of the path sheet fits this tile: 1 = up, 2 = right, 4 = down, 8 = left.
    pathMask(col, row) {
      return (
        (joinsPath(col, row - 1) ? 1 : 0) |
        (joinsPath(col + 1, row) ? 2 : 0) |
        (joinsPath(col, row + 1) ? 4 : 0) |
        (joinsPath(col - 1, row) ? 8 : 0)
      );
    },
  };
}
