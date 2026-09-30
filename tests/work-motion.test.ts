import { test } from "node:test";
import assert from "node:assert/strict";
import { projectProgress, projectStyle, headingRevealProgress, nearestProject, rainTarget, smootherstep } from "../src/lib/work-motion.ts";

test("project focus peaks at center and fades continuously on both sides", () => {
  assert.equal(projectProgress(450,900),1);
  assert.equal(projectProgress(0,900),projectProgress(900,900));
  assert.ok(projectStyle(projectProgress(350,900)).scale > projectStyle(projectProgress(50,900)).scale);
  assert.equal(projectProgress(-900,900),0);
  assert.equal(smootherstep(0),0); assert.equal(smootherstep(1),1);
  assert.ok(smootherstep(.25) < .25); assert.ok(smootherstep(.75) > .75);
  assert.equal(projectStyle(0).brightness,.42); assert.equal(projectStyle(1).brightness,1);
});
test("the nearest project can be selected for playback without changing scroll position", () => {
  assert.equal(nearestProject([69,831],900),0);
  assert.equal(nearestProject([67,832],900),1);
});
test("category heading reveal follows its viewport position", () => {
  assert.equal(headingRevealProgress(900 * .88,900),0);
  assert.equal(headingRevealProgress(900 * .62,900),1);
  assert.ok(headingRevealProgress(900 * .72,900) > 0 && headingRevealProgress(900 * .72,900) < 1);
});
test("homepage rain always stays at full speed, work idle never freezes", () => {
  assert.equal(rainTarget(false,true),1);
  assert.equal(rainTarget(true,false),1);
  assert.equal(rainTarget(true,true),.12);
});
