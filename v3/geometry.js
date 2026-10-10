export const PROJECTION_Y = 0.78;
export const CHAIR_RADIUS = 21;
export const WALK_RADIUS = 16;
export const OFFICE_BOUNDS = { left: 65, top: 90, right: 859, bottom: 932 };

// Floor footprints only. Raised surfaces and cast shadows have no collision.
export function footprintsFor(object) {
  const { x, y, w, h, type } = object;
  if (type === "boxes") {
    return Array.from({ length: 6 }, (_, i) => ({
      x: x + (i % 3) * 53,
      y: y + Math.floor(i / 3) * (57 / PROJECTION_Y) - 25 / PROJECTION_Y,
      w: 45,
      h: 28 / PROJECTION_Y,
    }));
  }
  if (type === "chair") return [{ x: x + w / 2, y: y + h / 2 + 6, radius: 19 }];
  if (type === "water")
    return [{ x, y: y - 13 / PROJECTION_Y, w: 34, h: 32 / PROJECTION_Y }];
  return [{ x, y, w, h }];
}

export function distanceToSolid(x, y, solid) {
  if (solid.radius !== undefined)
    return Math.max(0, Math.hypot(x - solid.x, y - solid.y) - solid.radius);
  const cx = Math.max(solid.x, Math.min(solid.x + solid.w, x));
  const cy = Math.max(solid.y, Math.min(solid.y + solid.h, y));
  return Math.hypot(x - cx, y - cy);
}
