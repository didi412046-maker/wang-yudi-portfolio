"use client";
import { useEffect, useRef, type RefObject } from "react";
import { visual } from "@/config/hero";
import type { SceneController } from "@/lib/scene";

export function useHeroScene(element: RefObject<HTMLElement | null>) {
  const controller = useRef<SceneController>({
    state: { x: 0, y: 0, previousX: 0, previousY: 0, width: 0, height: 0, scale: 1,
      open: false, openness: 0, visible: true, overUI: false, reducedMotion: false, collisions: 0,
      scrollVelocity: 0, scrollMoving: false, lastScrollInput: -Infinity },
    listeners: new Set(),
  });
  useEffect(() => {
    const c = controller.current;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => { c.state.reducedMotion = media.matches; };
    updateMotion();
    media.addEventListener("change", updateMotion);
    let id = 0, last = 0, from = 0, target = false, elapsed = 0;
    let intervals: number[] = [], costs: number[] = [], sampleSize = "";
    const tick = (now: number) => {
      const start = performance.now();
      const interval = last ? now - last : 0;
      const dt = last ? Math.min((now - last) / 1000, visual.performance.maxFrameDelta) : 0;
      last = now;
      if (target !== c.state.open) { target = c.state.open; from = c.state.openness; elapsed = 0; }
      elapsed += dt * 1000;
      const t = c.state.reducedMotion ? 1 : Math.min(1, elapsed / visual.umbrella.openAnimationDuration);
      const ease = t * t * (3 - 2 * t);
      c.state.openness = from + ((target ? 1 : 0) - from) * ease;
      c.beforeFrame?.(now);
      for (const listener of c.listeners) listener(dt, c.state, now);
      // Development-only measurement of the actual shared frame loop; no overlay.
      if (process.env.NODE_ENV === "development" && element.current) {
        const size = `${c.state.width}x${c.state.height}/${c.state.open ? "open" : "closed"}`;
        if (size !== sampleSize) { intervals = []; costs = []; sampleSize = size; }
        if (interval > 0) { intervals.push(interval); costs.push(performance.now() - start); }
        if (intervals.length >= visual.performance.metricsWindowFrames) {
          const total = intervals.reduce((sum, value) => sum + value, 0);
          const p95 = (values: number[]) => values.sort((a, b) => a - b)[Math.floor(values.length * 0.95)];
          element.current.dataset.performance = JSON.stringify({ size, frames: intervals.length,
            fps: +(1000 * intervals.length / total).toFixed(1),
            frameP95: +p95(intervals).toFixed(2), renderP95: +p95(costs).toFixed(2) });
          intervals = []; costs = [];
        }
      }
      c.state.previousX = c.state.x;
      c.state.previousY = c.state.y;
      id = requestAnimationFrame(tick);
    };
    const resume = () => {
      cancelAnimationFrame(id); last = 0; intervals = []; costs = [];
      if (!document.hidden) id = requestAnimationFrame(tick);
    };
    resume();
    document.addEventListener("visibilitychange", resume);
    return () => { cancelAnimationFrame(id); media.removeEventListener("change", updateMotion); document.removeEventListener("visibilitychange", resume); };
  }, [element]);
  return controller;
}
