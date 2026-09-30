import { useEffect, useRef, type RefObject } from "react";
import { createWaterLens } from "@/lib/water-lens";

type PointerRef = RefObject<{ x: number; y: number } | null>;
export function DropletCursor({ elementRef, videoRef, overlayRef, pointerRef, lensActive }: {
  elementRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  overlayRef: RefObject<HTMLElement | null>;
  pointerRef: PointerRef;
  lensActive: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!lensActive) return;
    const render = createWaterLens(canvasRef.current!);
    let frame = 0;
    const draw = () => {
      render(videoRef.current, overlayRef.current, pointerRef.current);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [lensActive, overlayRef, pointerRef, videoRef]);
  return <div ref={elementRef} className="droplet-cursor visual-layer" data-mode="default" aria-hidden="true">
    <canvas ref={canvasRef} className="cursor-lens-canvas" aria-hidden="true" />
    <span className="cursor-project-label">VIEW<br />PROJECT</span>
  </div>;
}
