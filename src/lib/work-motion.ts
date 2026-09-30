import { workConfig } from "../config/work.ts";

export function projectProgress(center: number, viewportHeight: number) {
  return Math.max(0, 1 - Math.abs(center - viewportHeight / 2) /
    (viewportHeight * workConfig.projectMotion.progressDistance));
}
export function smootherstep(progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
export function easeProjectProgress(progress: number) {
  return workConfig.projectMotion.progressEase === "smootherstep" ? smootherstep(progress) : progress;
}
export function projectStyle(progress: number) {
  const p = workConfig.projectMotion, eased = easeProjectProgress(progress);
  const mix = (a: number, b: number) => a + (b - a) * eased;
  return { scale: mix(p.minScale, p.maxScale), brightness: mix(p.minBrightness, p.maxBrightness),
    opacity: mix(p.minOpacity, p.maxOpacity), easedProgress: eased };
}
export function headingRevealProgress(top: number, viewportHeight: number) {
  const start = viewportHeight * workConfig.headingReveal.startViewport;
  const end = viewportHeight * workConfig.headingReveal.endViewport;
  return Math.max(0, Math.min(1, (start - top) / (start - end)));
}
export function rainTarget(inWork: boolean, settled: boolean) {
  const r = workConfig.rain;
  return inWork && settled ? r.idleMultiplier : r.scrollingMultiplier;
}
export function nearestProject(centers: number[], height: number) {
  let nearest = -1, distance = Infinity;
  centers.forEach((center, i) => { const d = Math.abs(center - height / 2); if (d < distance) { nearest = i; distance = d; } });
  return nearest;
}
