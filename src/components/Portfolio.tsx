"use client";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { visual, type Destination } from "@/config/hero";
import { useHeroScene } from "@/hooks/useHeroScene";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { Hero } from "./hero/Hero";
import { BeadRain } from "./hero/BeadRain";
import { LineCurtain } from "./hero/LineCurtain";
import { Navigation } from "./hero/Navigation";
import { DropletCursor } from "./hero/DropletCursor";
import { Work } from "./work/Work";
import { Contact } from "./contact/Contact";
import { Resume } from "./contact/Resume";

export function Portfolio() {
  const root = useRef<HTMLElement>(null), cursor = useRef<HTMLDivElement>(null);
  const lensVideo = useRef<HTMLVideoElement | null>(null), lensOverlay = useRef<HTMLElement | null>(null);
  const lensPointer = useRef({ x: 0, y: 0 });
  const lensActiveRef = useRef(false);
  const [lensActive, setLensActive] = useState(false);
  const controller = useHeroScene(root);
  useSmoothScroll(controller);
  useEffect(() => {
    const hide = () => { if (cursor.current) cursor.current.style.opacity = "0"; };
    window.addEventListener("blur", hide);
    return () => { window.removeEventListener("blur", hide); };
  }, []);
  useEffect(() => {
    const syncHoverDuringScroll = () => {
      if (!controller.current.state.scrollMoving || cursor.current?.style.opacity !== "1") return;
      const { x, y } = lensPointer.current;
      const projectLink = document.elementFromPoint(x, y)?.closest<HTMLElement>(".project-link") ?? null;
      const projectVideo = projectLink?.closest(".project-window")?.querySelector("video") ?? null;
      lensVideo.current = projectVideo;
      lensOverlay.current = projectLink;
      const project = !!projectLink;
      if (lensActiveRef.current !== project) {
        lensActiveRef.current = project;
        setLensActive(project);
      }
      if (cursor.current) cursor.current.dataset.mode = project ? "project" : "default";
    };
    controller.current.listeners.add(syncHoverDuringScroll);
    return () => { controller.current.listeners.delete(syncHoverDuringScroll); };
  }, [controller]);
  const move = (event: PointerEvent<HTMLElement>) => {
    const target = event.target as Element;
    const s = controller.current.state;
    const overHome = event.clientY < (root.current?.querySelector(".hero")?.getBoundingClientRect().bottom ?? 0);
    const projectLink = target.closest<HTMLElement>(".project-link");
    const project = !!projectLink;
    const projectVideo = projectLink?.closest(".project-window")?.querySelector("video") ?? null;
    lensVideo.current = project ? projectVideo : null;
    lensOverlay.current = project ? projectLink : null;
    lensPointer.current = { x: event.clientX, y: event.clientY };
    if (lensActiveRef.current !== project) { lensActiveRef.current = project; setLensActive(project); }
    s.overUI = !overHome || !!target.closest("button,a,input,[data-clickable]");
    if (cursor.current) {
      cursor.current.dataset.mode = project ? "project" : "default";
      cursor.current.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0) translate(-50%,-50%)`;
      cursor.current.style.opacity = event.pointerType === "touch" ? "0" : "1";
    }
    event.currentTarget.dataset.cursorActive = String(event.pointerType !== "touch");
  };
  const navigate = (id: Destination) => {
    if (id === "work" || id === "about" || id === "contact") {
      const target = document.getElementById(id === "about" ? "resume" : id);
      if (target) {
        if (controller.current.scrollTo) controller.current.scrollTo(target);
        else target.scrollIntoView({ behavior: controller.current.state.reducedMotion ? "instant" : "smooth" });
      }
      return;
    }
  };
  return <main ref={root} className="portfolio" style={{
    "--background": visual.background, "--ink": visual.text.colour, "--muted": visual.text.mutedColour,
    "--cursor-size": `${visual.cursor.size}px`, "--cursor-color": visual.cursor.color,
    "--cursor-opacity": visual.cursor.opacity, "--cursor-smoothing": `${visual.cursor.smoothing}ms`,
    "--curtain-tail-max": `${visual.curtain.transition.maxTailVh}svh`,
    ...Object.fromEntries(Object.entries(visual.layers).map(([key,value]) => [`--layer-${key}`,value])),
  } as CSSProperties} onPointerMove={move} onPointerEnter={move}
    onFocusCapture={() => { controller.current.state.overUI = true; }}
    onPointerLeave={() => { lensVideo.current = null; lensOverlay.current = null; if (lensActiveRef.current) { lensActiveRef.current = false; setLensActive(false); } if (cursor.current) { cursor.current.style.opacity = "0"; cursor.current.dataset.mode = "default"; } root.current!.dataset.cursorActive = "false"; }}>
    <LineCurtain controller={controller} />
    <Hero controller={controller} />
    <BeadRain controller={controller} />
    <Work controller={controller} />
    <Resume />
    <Contact />
    <Navigation onNavigate={navigate} onSectionNavigate={sectionId => {
      const target = document.getElementById(sectionId);
      if (!target) return;
      if (controller.current.scrollTo) controller.current.scrollTo(target);
      else target.scrollIntoView({ behavior: controller.current.state.reducedMotion ? "instant" : "smooth" });
    }} />
    <DropletCursor elementRef={cursor} videoRef={lensVideo} overlayRef={lensOverlay} pointerRef={lensPointer} lensActive={lensActive} />
  </main>;
}
