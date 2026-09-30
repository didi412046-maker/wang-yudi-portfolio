"use client";
import { useEffect, useRef, type CSSProperties, type PointerEvent, type RefObject } from "react";
import { visual } from "@/config/hero";
import type { SceneController } from "@/lib/scene";
import { Umbrella } from "./Umbrella";
import { HeroInfo } from "./HeroInfo";

const clickable = (target: EventTarget | null) => target instanceof Element && !!target.closest("button,a,input,[data-clickable]");

export function Hero({ controller }: { controller: RefObject<SceneController> }) {
  const hero = useRef<HTMLElement>(null), umbrella = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const sync = () => {
    const s = controller.current.state;
    if (umbrella.current) {
      umbrella.current.style.transform = `translate3d(${s.x}px,${s.y}px,0) scale(${s.scale})`;
      umbrella.current.style.opacity = s.visible && !s.overUI ? "1" : "0";
      umbrella.current.dataset.state = s.open ? "open" : "closed";
    }
  };
  useEffect(() => {
    const el = hero.current!, s = controller.current.state;
    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      s.width = width; s.height = height;
      s.scale = visual.umbrella.scale * Math.max(visual.umbrella.minWidth, Math.min(visual.umbrella.maxWidth, width * visual.umbrella.responsiveWidth)) / visual.umbrella.canopyWidth;
      if (!moved.current) { s.x = width * visual.umbrella.initialPosition.x / 100; s.y = height * visual.umbrella.initialPosition.y / 100; }
      s.previousX = s.x; s.previousY = s.y; sync();
    };
    const blur = () => { s.visible = false; el.dataset.cursorActive = "false"; sync(); };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    window.addEventListener("blur", blur);
    controller.current.listeners.add(sync);
    return () => { observer.disconnect(); window.removeEventListener("blur", blur); controller.current.listeners.delete(sync); };
    // All scene values are mutable refs, avoiding React renders on pointermove.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller]);

  const move = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect(), s = controller.current.state;
    moved.current = true; s.visible = true;
    s.x = event.clientX - rect.left; s.y = event.clientY - rect.top;
    s.overUI = clickable(event.target);
    event.currentTarget.dataset.cursorActive = String(event.pointerType !== "touch");
    sync();
  };

  return <section ref={hero} className="hero" aria-label="Wang Yudi portfolio — interactive umbrella" style={{
    "--background": visual.background, "--ink": visual.text.colour, "--muted": visual.text.mutedColour,
    "--text-opacity": visual.text.opacity, "--text-weight": visual.text.fontWeight,
    ...Object.fromEntries(Object.entries(visual.text.fontSize).map(([key, value]) => [`--font-${key}`, value])),
    ...Object.fromEntries(Object.entries(visual.layers).map(([key, value]) => [`--layer-${key}`, value])),
    "--cursor-size": `${visual.cursor.size}px`, "--cursor-color": visual.cursor.color,
    "--cursor-opacity": visual.cursor.opacity, "--cursor-smoothing": `${visual.cursor.smoothing}ms`,
    "--umbrella-fade": `${visual.umbrella.fadeDuration}ms`,
  } as CSSProperties}
    onPointerMove={move} onPointerDown={move} onPointerEnter={move}
    onPointerLeave={() => { controller.current.state.visible = false; hero.current!.dataset.cursorActive = "false"; sync(); }}
    onPointerOver={event => { controller.current.state.overUI = clickable(event.target); sync(); }}
    onPointerOut={event => { controller.current.state.overUI = clickable(event.relatedTarget); sync(); }}
    onFocusCapture={event => { if (clickable(event.target)) { controller.current.state.overUI = true; sync(); } }}
    onBlurCapture={() => { controller.current.state.overUI = false; sync(); }}
    onClick={event => {
      if (clickable(event.target)) return;
      controller.current.state.open = !controller.current.state.open; sync();
    }}>
    <HeroInfo controller={controller} />
    <Umbrella controller={controller} elementRef={umbrella} />
  </section>;
}
