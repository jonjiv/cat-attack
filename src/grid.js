// Overhead grid <-> world math. Tile (0, 0) is the top-left of the playing field.
export const TILE = 16;

// World position of a tile's center.
export function toWorld(col, row) {
  return { x: col * TILE + TILE / 2, y: row * TILE + TILE / 2 };
}

// Which tile a world point is over (may be outside the field).
export function toTile(x, y) {
  return { col: Math.floor(x / TILE), row: Math.floor(y / TILE) };
}

// Things standing on the map sort by how far down their feet are, so lower ones draw in front.
export function objectDepth(worldY) {
  return 10000 + worldY;
}
