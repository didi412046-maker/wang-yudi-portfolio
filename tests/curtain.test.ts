import { test } from "node:test";
import assert from "node:assert/strict";
import { createStrand, createCanopyCollider, curtainTailLengthVh, updateCanopyCollider, stepStrand, canopyDistance } from "../src/lib/curtain.ts";
import { umbrellaGeometry, canopyY, type Scene } from "../src/lib/scene.ts";
import { visual } from "../src/config/hero.ts";

const scene = (): Scene => ({ x: 720, y: 400, previousX: 720, previousY: 400, width: 1440, height: 900,
  scale: 1, open: true, openness: 1, visible: true, overUI: false, reducedMotion: false, collisions: 0,
  scrollVelocity: 0, scrollMoving: false, lastScrollInput: -Infinity });
const collider = (patch: Partial<Scene> = {}, vx = 0) => {
  const s = Object.assign(scene(), patch), c = createCanopyCollider();
  updateCanopyCollider(c, s, s.x, s.y, s.openness, vx, 0); return c;
};
const rope = (x = 700, seed = 2609) => createStrand(x, 950, seed);
const advance = (s: ReturnType<typeof rope>, c: ReturnType<typeof collider>, seconds: number) => {
  for (let i = 0; i < seconds * 120; i++) stepStrand(s, 1 / 120, c);
};
const maxOffset = (s: ReturnType<typeof rope>) => Math.max(...Array.from(s.x, x => Math.abs(x - s.baseX)));
const stretch = (s: ReturnType<typeof rope>) => Math.max(...Array.from(s.x).slice(1).map((_, i) =>
  Math.abs(Math.hypot(s.x[i + 1] - s.x[i], s.y[i + 1] - s.y[i]) / s.restLength - 1)));

test("17 connected points keep only the top pinned and distant ropes stay vertical", () => {
  const s = rope(1100); advance(s, collider(), 3);
  assert.equal(s.x.length, 17); assert.equal(s.y.length, 17);
  assert.equal(s.x[0], 1100); assert.equal(s.previousX[0], 1100);
  assert.equal(s.y[0], 0); assert.equal(s.previousY[0], 0);
  assert.equal(maxOffset(s), 0); assert.equal(s.touching, false);
  assert.ok(stretch(s) < 0.035);
  // Bottom is a simulated node, not fixed at its initial y.
  assert.notEqual(s.y[16], 950);
});

test("collider follows shared SVG canopy geometry and respects open/hidden/UI states", () => {
  const c = collider(), g = umbrellaGeometry(1);
  for (let i = 0; i < c.vertices.length; i += 2) {
    assert.equal(c.vertices[i + 1], canopyY(c.vertices[i], g.half, g.rise, g.tip));
  }
  assert.ok(canopyDistance(720, 440, c) < 0);
  assert.ok(canopyDistance(720, 390, c) > 0);
  assert.ok(canopyDistance(720, 500, c) > 0);
  assert.ok(canopyDistance(900, 440, c) > 0);
  for (const patch of [{ open: false }, { openness: 0 }, { visible: false }, { overUI: true }]) {
    const c = collider(patch), s = rope();
    assert.equal(c.active, false); advance(s, c, 1); assert.equal(maxOffset(s), 0);
  }
});

test("ropes wrap at both rims and their lower free ends hang sideways instead of mirroring", () => {
  for (const x of [640, 700, 740, 800]) {
    const s = rope(x), c = collider(); advance(s, c, 5);
    assert.equal(s.x[0], x); assert.equal(s.y[0], 0);
    assert.ok((s.x[16] - x) * Math.sign(x - 720) > 25);
    assert.ok(Math.abs(s.x[16] - s.x[9]) < 25);
    assert.ok(stretch(s) < 0.04);
    // Check interpolated segments, not just nodes, for visible fabric penetration.
    for (let i = 1; i < s.x.length; i++) for (let t = 0; t <= 1; t += 0.05) {
      const px = s.x[i - 1] + (s.x[i] - s.x[i - 1]) * t;
      const py = s.y[i - 1] + (s.y[i] - s.y[i - 1]) * t;
      assert.ok(canopyDistance(px, py, c) + c.padding > -1.5);
    }
  }
});

test("release preserves inertia then gravity and damping settle the free rope", () => {
  const s = rope(), c = collider(); advance(s, c, 4);
  const before = maxOffset(s); c.active = false;
  stepStrand(s, 1 / 120, c);
  assert.ok(maxOffset(s) > before * 0.9);
  assert.ok(s.x.some((x, i) => i > 0 && Math.abs(x - s.previousX[i]) > 0.001));
  advance(s, c, 5);
  assert.ok(maxOffset(s) < before * 0.05);
  assert.ok(stretch(s) < 0.04);
});

test("canopy horizontal velocity transfers only to nodes in contact", () => {
  const a = rope(), b = rope(), still = collider(), moving = collider({}, 600);
  stepStrand(a, 1 / 120, still); stepStrand(b, 1 / 120, moving);
  assert.ok(a.touching && b.touching);
  let transferred = 0;
  for (let i = 1; i < a.x.length; i++) {
    const difference = (b.x[i] - b.previousX[i]) - (a.x[i] - a.previousX[i]);
    if (a.contacts[i]) { assert.ok(difference > 0); transferred += difference; }
    else assert.equal(difference, 0);
  }
  assert.ok(transferred > 0);
});

test("individual physical properties retain their small variation", () => {
  const a = createStrand(700, 950, 123), b = createStrand(700, 950, 456);
  assert.notEqual(a.gravity, b.gravity); assert.notEqual(a.damping, b.damping);
  assert.ok(Math.abs(a.gravity / visual.curtain.gravity - 1) <= 0.08);
});

test("curtain transition tails use stable weighted length bands", () => {
  assert.equal(curtainTailLengthVh(.1,.5),0);
  assert.equal(curtainTailLengthVh(.3,0),6);
  assert.equal(curtainTailLengthVh(.64,1),16);
  assert.equal(curtainTailLengthVh(.7,0),16);
  assert.equal(curtainTailLengthVh(.89,1),25);
  assert.equal(curtainTailLengthVh(.95,1),visual.curtain.transition.maxTailVh);
});

test("every rendered strand seed responds to actual canopy contact, without a depth exemption", () => {
  const c = collider();
  // Same seed sequence as the 240-line desktop renderer, including formerly exempt lines.
  for (let i = 0; i < visual.curtain.lineCount; i++) {
    const s = rope(700, 2609 + i * 7919);
    let touched = false;
    for (let frame = 0; frame < 60; frame++) {
      stepStrand(s, 1 / 120, c); touched ||= s.touching;
    }
    assert.ok(touched, "strand " + i + " never contacted the canopy");
    assert.ok(maxOffset(s) > 1, "strand " + i + " stayed permanently straight");
  }
});

test("rapid moving contact and varying step sizes stay finite without stretching unboundedly", () => {
  const s = rope(), c = collider(), state = scene();
  for (let i = 0; i < 600; i++) {
    const x = 720 + 160 * Math.sin(i / 50), vx = 384 * Math.cos(i / 50);
    updateCanopyCollider(c, state, x, 400, 1, vx, 0);
    const dt = i % 2 ? 1 / 120 : 1 / 240;
    stepStrand(s, dt, c);
    assert.equal(s.x[0], 700); assert.equal(s.y[0], 0);
    assert.ok(s.x.every(Number.isFinite) && s.y.every(Number.isFinite));
    for (let n = 1; n < s.x.length; n++) {
      assert.ok(Math.hypot(s.x[n] - s.previousX[n], s.y[n] - s.previousY[n]) / dt <= visual.curtain.maxPointSpeed + 1e-6);
    }
  }
  assert.ok(stretch(s) < 0.12);
});
