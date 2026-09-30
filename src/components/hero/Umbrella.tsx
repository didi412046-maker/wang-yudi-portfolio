"use client";
import { useEffect, useRef, type RefObject } from "react";
import { visual } from "@/config/hero";
import { umbrellaGeometry, type SceneController } from "@/lib/scene";

export function Umbrella({ controller, elementRef }: { controller: RefObject<SceneController>; elementRef: RefObject<HTMLDivElement | null> }) {
  const canopy = useRef<SVGPathElement>(null), ribs = useRef<SVGPathElement>(null), panels = useRef<SVGPathElement>(null);
  useEffect(() => {
    const c = controller.current;
    let last = -1;
    const draw = () => {
      const amount = c.state.openness;
      if (last === amount) return;
      last = amount;
      const { half: h, rise, tip } = umbrellaGeometry(amount);
      const bottom = tip + rise;
      let path = `M 0 ${tip} Q ${h / 2} ${tip + rise * 0.3} ${h} ${bottom}`;
      for (let i = 0; i < 6; i++) {
        const start = h - (i * h / 3), end = start - h / 3;
        path += ` Q ${(start + end) / 2} ${bottom - (3 + 16 * amount)} ${end} ${bottom}`;
      }
      path += ` Q ${-h / 2} ${tip + rise * 0.3} 0 ${tip} Z`;
      canopy.current!.setAttribute("d", path);
      let ribPath = "";
      for (let i = 1; i < 6; i++) {
        const x = -h + i * h / 3;
        ribPath += `M 0 ${tip} Q ${x * 0.8} ${tip + rise * 0.48} ${x} ${bottom} `;
      }
      ribs.current!.setAttribute("d", ribPath);
      panels.current!.setAttribute("d", `M 0 ${tip} Q ${h / 2} ${tip + rise * 0.3} ${h} ${bottom} Q ${h * 5 / 6} ${bottom - (3 + 16 * amount)} ${h * 2 / 3} ${bottom} Q ${h * 0.5} ${tip + rise * 0.48} 0 ${tip}Z`);
      elementRef.current!.dataset.openness = amount.toFixed(3);
    };
    c.listeners.add(draw); draw();
    return () => { c.listeners.delete(draw); };
  }, [controller, elementRef]);
  return <div ref={elementRef} className="umbrella visual-layer" data-state="closed" aria-hidden="true">
    <svg viewBox="-150 -5 300 170" overflow="visible">
      <path d={`M0 7 V${visual.umbrella.shaftEnd} Q0 146 10 143 Q16 141 16 135`} fill="none" stroke={visual.umbrella.color} strokeWidth="2.2" strokeLinecap="round" />
      <path d={`M0 72 V${visual.umbrella.shaftEnd - 6}`} stroke="#80adbd" strokeWidth="1.1" />
      <path ref={canopy} fill={visual.umbrella.color} stroke={visual.umbrella.darkColor} strokeWidth="0.6" />
      <path ref={panels} fill={visual.umbrella.lightColor} opacity="0.6" />
      <path ref={ribs} fill="none" stroke={visual.umbrella.ribColor} strokeWidth="0.65" opacity="0.5" />
    </svg>
  </div>;
}
