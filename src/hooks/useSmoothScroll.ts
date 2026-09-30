"use client";
import { useEffect, type RefObject } from "react";
import Lenis from "lenis";
import { workConfig } from "@/config/work";
import type { SceneController } from "@/lib/scene";

const scrollKeys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "]);

/** One native-scroll Lenis instance feeds the existing shared scene RAF. */
export function useSmoothScroll(controller: RefObject<SceneController>) {
  useEffect(() => {
    const config = workConfig.smoothScroll;
    if (!config.enabled) return;
    const scene = controller.current.state;
    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: config.smoothWheel,
      lerp: config.lerp,
      wheelMultiplier: config.wheelMultiplier,
      touchMultiplier: config.touchMultiplier,
      syncTouch: false,
      anchors: false,
      respectReducedMotion: true,
    });
    const markInput = () => { scene.lastScrollInput = performance.now(); };
    const syncState = () => {
      scene.scrollVelocity = lenis.velocity;
      scene.scrollMoving = lenis.isScrolling !== false || Math.abs(lenis.velocity) > config.velocityThreshold;
    };
    const offVirtual = lenis.on("virtual-scroll", markInput);
    const offScroll = lenis.on("scroll", instance => {
      if (instance.isScrolling === "native") markInput();
      syncState();
    });
    const keydown = (event: KeyboardEvent) => {
      if (scrollKeys.has(event.key) && !(event.target as Element)?.closest("button,a,input,textarea")) markInput();
    };
    window.addEventListener("keydown", keydown);
    const beforeFrame = (now: number) => { lenis.raf(now); syncState(); };
    controller.current.beforeFrame = beforeFrame;
    controller.current.scrollTo = target => {
      markInput();
      lenis.scrollTo(target, { lerp: config.lerp, immediate: scene.reducedMotion });
    };
    syncState();
    return () => {
      offVirtual(); offScroll(); window.removeEventListener("keydown", keydown);
      if (controller.current.beforeFrame === beforeFrame) controller.current.beforeFrame = undefined;
      controller.current.scrollTo = undefined;
      scene.scrollVelocity = 0; scene.scrollMoving = false;
      lenis.destroy();
    };
  }, [controller]);
}
