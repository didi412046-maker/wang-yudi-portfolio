import { visual } from "../config/hero.ts";
import { canopyY, seededRandom, umbrellaGeometry, type Scene } from "./scene.ts";

export type CurtainStrand = {
  baseX: number; length: number; restLength: number;
  x: Float64Array; y: Float64Array; previousX: Float64Array; previousY: Float64Array;
  velocityX: Float64Array; velocityY: Float64Array; normalX: Float64Array; normalY: Float64Array;
  contacts: Uint8Array; gravity: number; damping: number; stiffness: number;
  previousDt: number; touching: boolean;
};

export function createStrand(baseX: number, length: number, seed: number): CurtainStrand {
  const p = visual.curtain, random = seededRandom(seed);
  const variation = () => 1 + (random() * 2 - 1) * p.individualVariation;
  const x = new Float64Array(p.segmentsPerStrand + 1).fill(baseX);
  const y = Float64Array.from(x, (_, i) => length * i / p.segmentsPerStrand);
  return { baseX, length, restLength: length / p.segmentsPerStrand,
    x, y, previousX: x.slice(), previousY: y.slice(), contacts: new Uint8Array(x.length),
    velocityX: new Float64Array(x.length), velocityY: new Float64Array(x.length),
    normalX: new Float64Array(x.length), normalY: new Float64Array(x.length),
    gravity: p.gravity * variation(), damping: 1 - (1 - p.damping) * variation(),
    stiffness: Math.min(1, p.segmentStiffness * variation()), previousDt: p.maxStep,
    touching: false };
}

/** Stable weighted fringe: 25% receive no extra tail; the rest thin out across Work's first 32vh. */
export function curtainTailLengthVh(bucket: number, amount: number) {
  if (bucket < 0.25) return 0;
  if (bucket < 0.65) return 6 + amount * 10;
  if (bucket < 0.9) return 16 + amount * 9;
  return 25 + amount * (visual.curtain.transition.maxTailVh - 25);
}

export type CanopyCollider = {
  active: boolean; x: number; y: number; half: number; top: number; bottom: number;
  padding: number; velocityX: number; velocityY: number;
  // Convex silhouette: sampled SVG upper curve, closed by the lower rim chord.
  vertices: Float64Array; normals: Float64Array;
};

export function createCanopyCollider(): CanopyCollider {
  const edges = visual.curtain.canopySegments + 1;
  return { active: false, x: 0, y: 0, half: 0, top: 0, bottom: 0, padding: 0,
    velocityX: 0, velocityY: 0, vertices: new Float64Array(edges * 2), normals: new Float64Array(edges * 2) };
}

export function updateCanopyCollider(c: CanopyCollider, scene: Scene, x: number, y: number,
  openness: number, velocityX: number, velocityY: number) {
  const p = visual.curtain, g = umbrellaGeometry(openness, scene.scale);
  c.active = scene.open && scene.visible && !scene.overUI && openness > 0.35;
  c.x = x; c.y = y; c.half = g.half; c.top = g.tip; c.bottom = g.tip + g.rise;
  c.padding = p.umbrellaCollisionPadding * scene.scale;
  const speed = Math.hypot(velocityX, velocityY), limit = Math.min(1, p.maxDragSpeed / (speed || 1));
  c.velocityX = velocityX * limit; c.velocityY = velocityY * limit;
  const count = c.vertices.length / 2;
  for (let i = 0; i < count; i++) {
    const dx = -g.half + 2 * g.half * i / (count - 1);
    c.vertices[i * 2] = dx; c.vertices[i * 2 + 1] = canopyY(dx, g.half, g.rise, g.tip);
  }
  for (let i = 0; i < count; i++) {
    const j = (i + 1) % count;
    const dx = c.vertices[j * 2] - c.vertices[i * 2], dy = c.vertices[j * 2 + 1] - c.vertices[i * 2 + 1];
    const length = Math.hypot(dx, dy);
    c.normals[i * 2] = dy / length; c.normals[i * 2 + 1] = -dx / length;
  }
}

/** Non-positive signed distance means inside the actual inflated canopy polygon. */
export function canopyDistance(x: number, y: number, c: CanopyCollider) {
  let nearest = -Infinity;
  for (let i = 0; i < c.vertices.length; i += 2) {
    nearest = Math.max(nearest, (x - c.x - c.vertices[i]) * c.normals[i]
      + (y - c.y - c.vertices[i + 1]) * c.normals[i + 1] - c.padding);
  }
  return nearest;
}

function anchor(s: CurtainStrand) {
  s.x[0] = s.previousX[0] = s.baseX;
  s.y[0] = s.previousY[0] = 0;
}

function solveLengths(s: CurtainStrand, reverse: boolean) {
  const n = s.x.length;
  for (let k = 1; k < n; k++) {
    const b = reverse ? n - k : k, a = b - 1;
    const dx = s.x[b] - s.x[a], dy = s.y[b] - s.y[a], distance = Math.hypot(dx, dy);
    if (distance < 1e-8) continue;
    const correction = (distance - s.restLength) / distance * s.stiffness;
    const weight = a === 0 ? 1 : 0.5;
    s.x[b] -= dx * correction * weight; s.y[b] -= dy * correction * weight;
    if (a !== 0) { s.x[a] += dx * correction * weight; s.y[a] += dy * correction * weight; }
  }
  anchor(s);
}

/** Segment samples prevent long rope edges from passing through between nodes. */
function solveContacts(s: CurtainStrand, c: CanopyCollider) {
  const p = visual.curtain, left = c.x - c.half - c.padding, right = c.x + c.half + c.padding;
  const top = c.y + c.top - c.padding, bottom = c.y + c.bottom + c.padding;
  for (let b = 1; b < s.x.length; b++) {
    const a = b - 1, ax = s.x[a], ay = s.y[a], bx = s.x[b], by = s.y[b];
    if (Math.max(ax, bx) < left || Math.min(ax, bx) > right || Math.max(ay, by) < top || Math.min(ay, by) > bottom) continue;
    const samples = Math.max(2, Math.ceil(Math.hypot(bx - ax, by - ay) / p.collisionSampleSpacing));
    let depth = 0, hitT = 0, hitNX = 0, hitNY = 0;
    for (let k = 0; k <= samples; k++) {
      const t = k / samples, x = ax + (bx - ax) * t - c.x, y = ay + (by - ay) * t - c.y;
      let nearest = -Infinity, nx = 0, ny = 0;
      for (let e = 0; e < c.vertices.length; e += 2) {
        const d = (x - c.vertices[e]) * c.normals[e] + (y - c.vertices[e + 1]) * c.normals[e + 1] - c.padding;
        if (d > 0) { nearest = d; break; }
        if (d > nearest) { nearest = d; nx = c.normals[e]; ny = c.normals[e + 1]; }
      }
      if (-nearest > depth) { depth = -nearest; hitT = t; hitNX = nx; hitNY = ny; }
    }
    if (depth <= 0) continue;
    s.touching = true;
    const wa = a === 0 ? 0 : 1 - hitT, wb = hitT, denominator = wa * wa + wb * wb;
    if (denominator < 1e-6) continue;
    const push = depth * p.collisionPushStrength / denominator;
    if (wa) { s.x[a] += hitNX * push * wa; s.y[a] += hitNY * push * wa; s.contacts[a] = 1; s.normalX[a] = hitNX; s.normalY[a] = hitNY; }
    if (wb) { s.x[b] += hitNX * push * wb; s.y[b] += hitNY * push * wb; s.contacts[b] = 1; s.normalX[b] = hitNX; s.normalY[b] = hitNY; }
  }
}

export function stepStrand(s: CurtainStrand, dt: number, collider: CanopyCollider) {
  if (dt <= 0) return;
  const p = visual.curtain, damping = Math.pow(s.damping, dt * 60), ratio = dt / s.previousDt;
  s.touching = false; s.contacts.fill(0);
  for (let i = 1; i < s.x.length; i++) {
    const x = s.x[i], y = s.y[i];
    s.x[i] += (x - s.previousX[i]) * ratio * damping;
    s.y[i] += (y - s.previousY[i]) * ratio * damping + s.gravity * dt * dt;
    s.velocityX[i] = (s.x[i] - x) / dt; s.velocityY[i] = (s.y[i] - y) / dt;
    s.previousX[i] = x; s.previousY[i] = y;
  }
  s.previousDt = dt;
  for (let iteration = 0; iteration < p.constraintIterations; iteration++) {
    solveLengths(s, iteration % 2 === 1);
    if (collider.active) solveContacts(s, collider);
  }
  // Project pre-solve velocity onto the contact tangent: positional depenetration
  // must not become a large artificial impulse. Canopy drag enters history once.
  const friction = 1 - Math.pow(1 - p.contactFriction, dt * 60);
  const transfer = 1 - Math.pow(1 - p.umbrellaDragTransfer, dt * 60);
  for (let i = 1; i < s.x.length; i++) {
    let vx = (s.x[i] - s.previousX[i]) / dt, vy = (s.y[i] - s.previousY[i]) / dt;
    if (s.contacts[i]) {
      vx = s.velocityX[i]; vy = s.velocityY[i];
      const inward = Math.min(0, vx * s.normalX[i] + vy * s.normalY[i]);
      vx = (vx - inward * s.normalX[i]) * (1 - friction) + collider.velocityX * transfer;
      vy = (vy - inward * s.normalY[i]) * (1 - friction) + collider.velocityY * transfer;
    }
    const limit = Math.min(1, p.maxPointSpeed / (Math.hypot(vx, vy) || 1));
    s.previousX[i] = s.x[i] - vx * limit * dt;
    s.previousY[i] = s.y[i] - vy * limit * dt;
  }
  anchor(s);
}
