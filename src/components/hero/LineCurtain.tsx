"use client";
import { useEffect, useRef, type RefObject } from "react";
import { visual } from "@/config/hero";
import { seededRandom, type SceneController } from "@/lib/scene";
import { createStrand, createCanopyCollider, curtainTailLengthVh, updateCanopyCollider, stepStrand, type CurtainStrand } from "@/lib/curtain";

type CurtainLayer = "far" | "mid" | "front";
type Line = CurtainStrand & {
  width: number; opacity: number; layer: CurtainLayer; blur: number; depth: number; tailLength: number;
};

const layerForDepth = (depth: number): CurtainLayer => {
  const d = visual.depth.curtain;
  const total = d.farRatio + d.midRatio + d.frontRatio;
  if (depth < d.farRatio / total) return "far";
  if (depth < (d.farRatio + d.midRatio) / total) return "mid";
  return "front";
};

const range = (value: readonly number[], random: () => number) => value[0] + random() * (value[1] - value[0]);

export function LineCurtain({ controller }: { controller: RefObject<SceneController> }) {
  const far = useRef<HTMLCanvasElement>(null), mid = useRef<HTMLCanvasElement>(null), front = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const elements = [far.current!, mid.current!, front.current!];
    const contexts = elements.map(element => element.getContext("2d")!);
    const c = controller.current, p = visual.curtain, depth = visual.depth.curtain, collider = createCanopyCollider();
    let lines: Line[] = [], buckets: Record<CurtainLayer, Line[]> = { far: [], mid: [], front: [] };
    let width = 0, canvasHeight = 0, heroHeight = 0;
    let lastX = c.state.x, lastY = c.state.y, lastOpen = c.state.openness;
    const resize = () => {
      ({ width, height: canvasHeight } = elements[1].getBoundingClientRect());
      heroHeight = document.querySelector<HTMLElement>(".hero")?.getBoundingClientRect().height || innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, visual.performance.maxDpr);
      elements.forEach(element => { element.width = Math.round(width * dpr); element.height = Math.round(canvasHeight * dpr); });
      contexts.forEach(ctx => ctx.setTransform(dpr, 0, 0, dpr, 0, 0));
      const random = seededRandom(2609), tailRandom = seededRandom(240926);
      const count = Math.max(1, Math.round(p.lineCount * width / p.referenceWidth)), spacing = width / count;
      lines = Array.from({ length: count }, (_, i) => {
        const baseX = (i + 0.15 + random() * 0.7) * spacing;
        const short = random() < p.shortLineRatio;
        const min = short ? p.shortMinLength : p.minLength, max = short ? p.shortMaxLength : p.maxLength;
        const length = heroHeight * (min + random() * (max - min));
        const lineDepth = random(), layer = layerForDepth(lineDepth);
        const opacity = range(depth[`${layer}Opacity`], random), widthRange = depth[`${layer}Width`];
        const tailVh = curtainTailLengthVh(tailRandom(), tailRandom());
        const tailLength = p.transition.enabled && length >= heroHeight * p.transition.minEligibleLength
          ? heroHeight * tailVh / 100 : 0;
        return { ...createStrand(baseX, length, 2609 + i * 7919), depth: lineDepth, layer,
          opacity, width: range(widthRange, random), tailLength,
          blur: layer === "front" ? depth.frontBlur : 0 };
      });
      buckets = { far: [], mid: [], front: [] };
      for (const line of lines) buckets[line.layer].push(line);
      elements.forEach(element => {
        element.dataset.lineCount = String(count);
        element.dataset.pointsPerStrand = String(p.segmentsPerStrand + 1);
        element.dataset.transitionTails = JSON.stringify({ count: lines.filter(line => line.tailLength > 0).length,
          maxVh: p.transition.maxTailVh, fadeRatio: p.transition.fadeTailRatio });
        element.dataset.depthVolume = JSON.stringify({ far: lines.filter(line => line.layer === "far").length,
          mid: lines.filter(line => line.layer === "mid").length, front: lines.filter(line => line.layer === "front").length });
      });
      lastX = c.state.x; lastY = c.state.y; lastOpen = c.state.openness;
    };
    const draw = (dt: number) => {
      const s = c.state, dx = s.x - lastX, dy = s.y - lastY;
      const motionSteps = s.open && s.visible && !s.overUI ? Math.ceil(Math.hypot(dx, dy) / (visual.umbrella.canopyWidth * s.scale / 4)) : 1;
      const steps = Math.min(p.maxMotionSubsteps, Math.max(1, Math.ceil(dt / p.maxStep), motionSteps));
      let contacts = 0;
      if (!s.reducedMotion) for (let step = 1; step <= steps; step++) {
        const t = step / steps;
        updateCanopyCollider(collider, s, lastX + dx * t, lastY + dy * t, lastOpen + (s.openness - lastOpen) * t, dt ? dx / dt : 0, dt ? dy / dt : 0);
        for (const line of lines) stepStrand(line, dt / steps, collider);
      }
      lastX = s.x; lastY = s.y; lastOpen = s.openness;
      contexts.forEach(ctx => { ctx.clearRect(0, 0, width, canvasHeight); ctx.filter = "none"; });
      let displacement = 0, freeEndOffset = 0;
      ([("far"), ("mid"), ("front")] as CurtainLayer[]).forEach((layer, index) => {
        const ctx = contexts[index];
        ctx.filter = layer === "front" && depth.frontBlur ? `blur(${depth.frontBlur}px)` : "none";
        for (const line of buckets[layer]) {
          contacts += Number(line.touching);
          const last = line.x.length - 1, lastX = line.x[last], lastY = line.y[last];
          const endY = line.tailLength > 0 ? Math.max(lastY, heroHeight + line.tailLength) : lastY;
          const fadeStart = endY * (1 - p.transition.fadeTailRatio);
          const gradient = ctx.createLinearGradient(0, 0, 0, Math.max(1, endY));
          gradient.addColorStop(0, `rgba(${p.lineColor},${line.opacity})`);
          gradient.addColorStop(Math.max(0, Math.min(1, fadeStart / Math.max(1, endY))), `rgba(${p.lineColor},${line.opacity})`);
          gradient.addColorStop(1, `rgba(${p.lineColor},0)`);
          ctx.strokeStyle = gradient; ctx.lineWidth = line.width;
          ctx.beginPath(); ctx.moveTo(line.x[0], line.y[0]);
          for (let i = 1; i < line.x.length; i++) {
            ctx.lineTo(line.x[i], line.y[i]);
            displacement = Math.max(displacement, Math.abs(line.x[i] - line.baseX));
          }
          if (endY > lastY + 1) {
            const previous = Math.max(0, last - 1), segmentY = Math.max(1, lastY - line.y[previous]);
            const tangent = Math.max(-0.3, Math.min(0.3, (lastX - line.x[previous]) / segmentY));
            const settleDistance = Math.min(72, (endY - lastY) * 0.35);
            const samples = Math.max(2, Math.ceil((endY - lastY) / 18));
            for (let i = 1; i <= samples; i++) {
              const y = lastY + (endY - lastY) * i / samples;
              const travel = y - lastY;
              const x = lastX + tangent * settleDistance * (1 - Math.exp(-travel / Math.max(1, settleDistance)));
              ctx.lineTo(x, y);
            }
          }
          freeEndOffset = Math.max(freeEndOffset, Math.abs(lastX - line.baseX));
          ctx.stroke();
        }
      });
      if (process.env.NODE_ENV === "development") {
        elements[1].dataset.displacement = displacement.toFixed(2);
        elements[1].dataset.contact = JSON.stringify({ x: s.x, y: s.y, touching: contacts, freeEndOffset: +freeEndOffset.toFixed(2), steps });
      }
    };
    const observer = new ResizeObserver(resize); observer.observe(elements[1]); resize();
    c.listeners.add(draw);
    return () => { observer.disconnect(); c.listeners.delete(draw); };
  }, [controller]);
  return <>
    <canvas ref={far} className="line-curtain line-curtain-far visual-layer" aria-hidden="true" />
    <canvas ref={mid} className="line-curtain line-curtain-mid visual-layer" aria-hidden="true" />
    <canvas ref={front} className="line-curtain line-curtain-front visual-layer" aria-hidden="true" />
  </>;
}
