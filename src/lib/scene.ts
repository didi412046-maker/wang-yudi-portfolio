import { visual } from "../config/hero.ts";

export type Scene = {
  x: number; y: number; previousX: number; previousY: number;
  width: number; height: number; scale: number;
  open: boolean; openness: number; visible: boolean; overUI: boolean;
  reducedMotion: boolean; collisions: number;
  rainTimeScale?: number;
  scrollVelocity: number; scrollMoving: boolean; lastScrollInput: number;
};
export type FrameListener = (dt: number, scene: Scene, now: number) => void;
export type SceneController = {
  state: Scene;
  listeners: Set<FrameListener>;
  beforeFrame?: (now: number) => void;
  scrollTo?: (target: number | string | HTMLElement) => void;
};

export function umbrellaGeometry(openness: number, scale = 1) {
  const u = visual.umbrella;
  return {
    half: (u.closedHalfWidth + (u.canopyWidth / 2 - u.closedHalfWidth) * openness) * scale,
    rise: (u.closedRise + (u.canopyHeight - u.closedRise) * openness) * scale,
    tip: u.tipY * scale,
  };
}

// This exact quadratic profile is shared by the SVG and collision surface.
export function canopyY(dx: number, half: number, rise: number, tip: number) {
  const t = Math.min(1, Math.abs(dx) / half);
  return tip + rise * (0.6 * t + 0.4 * t * t);
}

export type Bead = {
  x: number; y: number; radius: number; speed: number; opacity: number;
  color: number; foreground: boolean; vx: number; vy: number; drift: number;
  mode: "fall" | "slide" | "released"; side: number; localX: number;
  depth?: number; layer?: "far" | "mid" | "near"; blur?: number;
};

/** Swept relative crossing catches falling beads and a moving/opening canopy. */
export function hitsCanopy(bead: Bead, oldX: number, oldY: number, scene: Scene, oldOpenness: number) {
  if (!scene.open || scene.openness < 0.35 || !scene.visible || scene.overUI) return false;
  const g = umbrellaGeometry(scene.openness, scene.scale);
  const old = umbrellaGeometry(oldOpenness, scene.scale);
  const dx = bead.x - scene.x;
  if (Math.abs(dx) > g.half + bead.radius * visual.umbrella.collisionRadius) return false;
  const surface = scene.y + canopyY(dx, g.half, g.rise, g.tip);
  const previous = scene.previousY + canopyY(oldX - scene.previousX, old.half, old.rise, old.tip);
  const crossed = oldY + bead.radius <= previous + 1 && bead.y + bead.radius >= surface;
  // If the user sweeps sideways, eject particles inside the fabric as well.
  const insideFabric = bead.y + bead.radius >= surface && bead.y < scene.y + g.tip + g.rise;
  return crossed || insideFabric;
}

export function stepBead(bead: Bead, dt: number, scene: Scene, oldOpenness: number) {
  const g = umbrellaGeometry(scene.openness, scene.scale);
  const active = scene.open && scene.openness >= 0.35 && scene.visible && !scene.overUI;
  if (bead.mode === "slide" && active) {
    bead.localX += bead.side * visual.beads.slideSpeed * visual.umbrella.collisionStrength * scene.scale * dt;
    bead.x = scene.x + bead.localX;
    bead.y = scene.y + canopyY(bead.localX, g.half, g.rise, g.tip) - bead.radius;
    if (Math.abs(bead.localX) >= g.half + bead.radius) {
      bead.mode = "released";
      bead.vx = bead.side * visual.beads.edgeKick * visual.umbrella.collisionStrength;
      const speedFraction = Math.max(0, Math.min(1, (bead.speed - visual.beads.minSpeed) / (visual.beads.maxSpeed - visual.beads.minSpeed)));
      bead.vy = visual.beads.edgeReleaseSpeed[0] + speedFraction * (visual.beads.edgeReleaseSpeed[1] - visual.beads.edgeReleaseSpeed[0]);
    }
    return;
  }
  if (bead.mode === "slide") { bead.mode = "fall"; bead.vx = 0; bead.vy = bead.speed; }
  const oldX = bead.x, oldY = bead.y;
  if (bead.mode === "released") {
    bead.vy = Math.min(bead.speed * 1.2, bead.vy + visual.beads.gravity * dt);
    bead.vx *= Math.exp(-1.3 * dt);
    bead.x += bead.vx * dt;
    bead.y += bead.vy * dt;
    if (Math.abs(bead.vx) < 2) bead.mode = "fall";
  } else { bead.y += bead.speed * dt; bead.x += bead.drift * dt; }
  if (hitsCanopy(bead, oldX, oldY, scene, oldOpenness)) {
    bead.mode = "slide";
    bead.localX = Math.max(-g.half, Math.min(g.half, bead.x - scene.x));
    bead.side = bead.localX < 0 ? -1 : 1;
    bead.y = scene.y + canopyY(bead.localX, g.half, g.rise, g.tip) - bead.radius;
    scene.collisions++;
  }
}

export function seededRandom(seed: number) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}
