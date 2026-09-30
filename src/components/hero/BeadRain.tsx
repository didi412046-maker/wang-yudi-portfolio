"use client";
import { useEffect, useRef, type RefObject } from "react";
import { visual } from "@/config/hero";
import { seededRandom, stepBead, type Bead, type SceneController } from "@/lib/scene";

type BeadLayer = "far" | "mid" | "near";
type GroundImpact = { x: number; y: number; radius: number; color: string; age: number; life: number; bounce: number };
type SplashDrop = { x: number; y: number; vx: number; vy: number; radius: number; color: string; age: number; life: number };
const range = (value: readonly number[], random: () => number) => value[0] + random() * (value[1] - value[0]);
const layerForDepth = (depth: number): BeadLayer => {
  const d = visual.depth.beads;
  const total = d.farRatio + d.midRatio + d.nearRatio;
  if (depth < d.farRatio / total) return "far";
  if (depth < (d.farRatio + d.midRatio) / total) return "mid";
  return "near";
};

export function BeadRain({ controller }: { controller: RefObject<SceneController> }) {
  const far = useRef<HTMLCanvasElement>(null), mid = useRef<HTMLCanvasElement>(null), near = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const elements = [far.current!, mid.current!, near.current!];
    const contexts = elements.map(element => element.getContext("2d")!);
    const c = controller.current, p = visual.beads, depth = visual.depth.beads;
    const random = seededRandom(8072);
    let beads: Bead[] = [], buckets: Record<BeadLayer, Bead[]> = { far: [], mid: [], near: [] }, width = 0, height = 0, oldOpenness = 0;
    let impacts: GroundImpact[] = [], splashes: SplashDrop[] = [];
    const sprites = p.colorPalette.map(color => {
      const sprite = document.createElement("canvas"); sprite.width = sprite.height = 48;
      const ctx = sprite.getContext("2d")!;
      const fill = ctx.createRadialGradient(18, 15, 1, 24, 24, 22);
      fill.addColorStop(0, "#e1faf5"); fill.addColorStop(0.25, color + "b5");
      fill.addColorStop(0.7, color + "e0"); fill.addColorStop(1, color + "20");
      ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(24, 24, 22, 0, Math.PI * 2); ctx.fill();
      return sprite;
    });
    const reset = (bead?: Bead): Bead => {
      if (bead) {
        bead.x = random() * width; bead.y = -15 - random() * 70;
        bead.vx = 0; bead.vy = 0; bead.mode = "fall"; bead.side = 1; bead.localX = 0;
        return bead;
      }
      const layerDepth = random(), layer = layerForDepth(layerDepth);
      const sizeScale = range(depth[`${layer}SizeScale`], random);
      const speedScale = range(depth[`${layer}SpeedScale`], random);
      const opacityScale = range(depth[`${layer}Opacity`], random);
      const baseSpeed = p.minSpeed + random() * (p.maxSpeed - p.minSpeed);
      const radius = (p.minSize + random() ** 1.5 * (p.maxSize - p.minSize)) / 2 * sizeScale;
      return Object.assign(bead ?? {}, {
        x: random() * width, y: bead ? -15 - random() * 70 : random() * height,
        radius, speed: baseSpeed * speedScale,
        opacity: Math.min(1, (p.opacityMin + random() * (p.opacityMax - p.opacityMin)) * opacityScale),
        drift: (random() * 2 - 1) * p.horizontalDrift,
        color: Math.floor(random() * p.colorPalette.length), foreground: layer === "near",
        depth: layerDepth, layer, blur: layer === "far" ? depth.farBlur : layer === "near" ? range(depth.nearBlur, random) : depth.midBlur,
        vx: 0, vy: 0, mode: "fall" as const, side: 1, localX: 0,
      });
    };
    const resize = () => {
      ({ width, height } = elements[1].getBoundingClientRect());
      const dpr = Math.min(devicePixelRatio || 1, visual.performance.maxDpr);
      elements.forEach((canvas, i) => { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); contexts[i].setTransform(dpr, 0, 0, dpr, 0, 0); });
      const count = Math.max(p.minCount, Math.min(p.maxCount, Math.round(p.count * width * height / p.referenceArea)));
      beads = Array.from({ length: count }, () => reset());
      buckets = { far: [], mid: [], near: [] };
      for (const bead of beads) buckets[bead.layer ?? "mid"].push(bead);
      elements.forEach(element => {
        element.dataset.count = String(beads.length);
        element.dataset.depthVolume = JSON.stringify({ far: beads.filter(bead => bead.layer === "far").length,
          mid: beads.filter(bead => bead.layer === "mid").length, near: beads.filter(bead => bead.layer === "near").length });
      });
    };
    const createImpact = (bead: Bead, groundY: number) => {
      if (splashes.length >= 24 || random() > .28) return;
      const color = p.colorPalette[bead.color];
      impacts.push({ x: bead.x, y: groundY, radius: Math.max(1.8, bead.radius * .72), color,
        age: 0, life: .12 + random() * .06, bounce: 8 + random() * 10 });
      if (impacts.length > 8) impacts.shift();
      const count = 2 + Math.floor(random() * 3);
      for (let i = 0; i < count && splashes.length < 24; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        splashes.push({ x: bead.x, y: groundY - 1, vx: side * (22 + random() * 50),
          vy: -(34 + random() * 52), radius: .8 + random() * 1.25, color,
          age: 0, life: .3 + random() * .2 });
      }
    };
    const drawGroundEffects = (ctx: CanvasRenderingContext2D, dt: number) => {
      impacts = impacts.filter(impact => {
        impact.age += dt;
        const progress = Math.min(1, impact.age / impact.life);
        const rise = Math.sin(progress * Math.PI) * impact.bounce;
        ctx.save();
        ctx.globalAlpha = (1 - progress) * .72;
        ctx.fillStyle = impact.color;
        ctx.translate(impact.x, impact.y - rise);
        ctx.scale(progress < .28 ? 1.35 : 1, progress < .28 ? .48 : 1);
        ctx.beginPath(); ctx.arc(0, 0, impact.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        return progress < 1;
      });
      splashes = splashes.filter(drop => {
        drop.age += dt;
        const progress = Math.min(1, drop.age / drop.life);
        drop.vy += 150 * dt;
        drop.x += drop.vx * dt;
        drop.y += drop.vy * dt;
        ctx.save();
        ctx.globalAlpha = (1 - progress) * .62;
        ctx.fillStyle = drop.color;
        ctx.translate(drop.x, drop.y);
        ctx.scale(.75, 1.3);
        ctx.beginPath(); ctx.arc(0, 0, drop.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        return progress < 1;
      });
    };
    const render = (dt: number) => {
      contexts.forEach(ctx => { ctx.clearRect(0, 0, width, height); ctx.filter = "none"; });
      const contactRect = document.getElementById("contact")?.getBoundingClientRect();
      const groundActive = !!contactRect && contactRect.bottom > 0 && contactRect.bottom <= height + 32;
      const groundY = groundActive && contactRect ? Math.min(height - 2, Math.max(0, contactRect.bottom - 2)) : height + 40;
      for (const bead of beads) {
        if (!c.state.reducedMotion) stepBead(bead, dt * (c.state.rainTimeScale ?? 1), c.state, oldOpenness);
        if (groundActive && !c.state.reducedMotion && bead.y + bead.radius >= groundY) {
          createImpact(bead, groundY);
          reset(bead);
          continue;
        }
        if (bead.y > height + 20 || bead.x < -30 || bead.x > width + 30) reset(bead);
      }
      ([("far"), ("mid"), ("near")] as BeadLayer[]).forEach((layer, index) => {
        const ctx = contexts[index];
        ctx.filter = layer === "near" && depth.nearBlur[1] ? `blur(${depth.nearBlur[1]}px)` : "none";
        for (const bead of buckets[layer]) {
          ctx.globalAlpha = bead.opacity;
          ctx.drawImage(sprites[bead.color], bead.x - bead.radius, bead.y - bead.radius, bead.radius * 2, bead.radius * 2);
        }
        ctx.globalAlpha = 1;
      });
      if (groundActive && !c.state.reducedMotion) drawGroundEffects(contexts[1], dt);
      else { impacts = []; splashes = []; }
      oldOpenness = c.state.openness;
      elements[1].dataset.collisions = String(c.state.collisions);
      elements[1].dataset.count = String(beads.length);
      elements[1].dataset.groundActive = String(groundActive);
      elements[1].dataset.splashCount = String(splashes.length);
    };
    const observer = new ResizeObserver(resize); observer.observe(elements[1]); resize();
    c.listeners.add(render);
    return () => { observer.disconnect(); c.listeners.delete(render); };
  }, [controller]);
  return <>
    <canvas ref={far} className="beads-rear beads-far visual-layer" aria-hidden="true" />
    <canvas ref={mid} className="beads-mid visual-layer" aria-hidden="true" />
    <canvas ref={near} className="beads-front beads-near visual-layer" aria-hidden="true" />
  </>;
}
