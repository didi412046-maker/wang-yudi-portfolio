import { test } from "node:test";
import assert from "node:assert/strict";
import { stepBead, canopyY, umbrellaGeometry, type Scene, type Bead } from "../src/lib/scene.ts";

const scene = (): Scene => ({ x: 500, y: 300, previousX: 500, previousY: 300, width: 1440, height: 900, scale: 1, open: true, openness: 1, visible: true, overUI: false, reducedMotion: false, collisions: 0, scrollVelocity: 0, scrollMoving: false, lastScrollInput: 0 });
const bead = (x = 520, y = 310): Bead => ({ x, y, radius: 4, speed: 100, opacity: 1, color: 0, foreground: false, vx: 0, vy: 100, drift: 0, mode: "fall", side: 1, localX: 0 });

test("open umbrella catches falling beads and releases them past its edge", () => {
  const s = scene(), b = bead();
  for (let i = 0; i < 20 && b.mode === "fall"; i++) stepBead(b, 1 / 60, s, 1);
  assert.equal(b.mode, "slide");
  const g = umbrellaGeometry(1);
  assert.ok(Math.abs(b.y + b.radius - (s.y + canopyY(b.x - s.x, g.half, g.rise, g.tip))) < 0.01);
  for (let i = 0; i < 120 && b.mode === "slide"; i++) stepBead(b, 1 / 60, s, 1);
  assert.equal(b.mode, "released");
  assert.ok(b.x > s.x + g.half);
  const y = b.y;
  stepBead(b, 1 / 60, s, 1);
  assert.ok(b.y > y);
});

test("closed, hidden and UI-hovered umbrellas do not intercept beads", () => {
  const patches: Partial<Scene>[] = [{ open: false }, { visible: false }, { overUI: true }];
  for (const patch of patches) {
    const s = Object.assign(scene(), patch), b = bead();
    for (let i = 0; i < 90; i++) stepBead(b, 1 / 60, s, 1);
    assert.equal(b.mode, "fall"); assert.equal(s.collisions, 0); assert.ok(b.y > 400);
  }
});

test("both sides divert outward", () => {
  for (const sign of [-1, 1]) {
    const s = scene(), b = bead(500 + sign * 20);
    for (let i = 0; i < 20 && b.mode === "fall"; i++) stepBead(b, 1 / 60, s, 1);
    const x = b.x; stepBead(b, 1 / 60, s, 1);
    assert.ok((b.x - x) * sign > 0);
  }
});

test("moving canopy displaces an existing bead and closing releases it", () => {
  const s = scene(), b = bead(520, 340);
  s.previousY = 400;
  stepBead(b, 1 / 60, s, 1);
  assert.equal(b.mode, "slide");
  s.open = false;
  stepBead(b, 1 / 60, s, 1);
  assert.equal(b.mode, "fall");
});

test("doubled falling speeds cannot tunnel through the canopy between frames", () => {
  for (const speed of [184, 380]) for (const x of [420, 500, 580]) {
    const s = scene(), b = bead(x);
    const g = umbrellaGeometry(1);
    b.speed = speed;
    const surface = s.y + canopyY(x - s.x, g.half, g.rise, g.tip);
    b.y = surface - b.radius - 2;
    // Large step intentionally ends below the fabric: endpoint-only tests fail here.
    stepBead(b, 0.2, s, 1);
    assert.equal(b.mode, "slide");
    assert.ok(Math.abs(b.y + b.radius - surface) < 0.01);
  }
});

test("faster free fall retains V2 horizontal slide, kick and edge-release impulse", () => {
  const s = scene(), b = bead();
  b.mode = "slide"; b.side = 1; b.localX = 120; b.speed = 380;
  stepBead(b, 0.1, s, 1);
  assert.equal(b.mode, "released");
  assert.equal(b.vx, 38);
  assert.equal(b.vy, 85.5);
  assert.equal(b.localX, 131);
});
