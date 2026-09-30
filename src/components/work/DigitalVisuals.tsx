"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { digitalVisualCategory, digitalVisualProjects } from "@/config/work";
import type { SceneController } from "@/lib/scene";

const CROSSFADE_MS = 220;
const BROKEN_ROSE_MATCH_TIME = 4.1;

function useQuietReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const items = Array.from(section.querySelectorAll<HTMLElement>("[data-digital-reveal]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      items.forEach(item => item.dataset.visible = "true");
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.visible = "true";
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8%" });
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [root]);
}

function useMediaDepth(root: RefObject<HTMLElement | null>, controller: RefObject<SceneController>) {
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const frames = Array.from(section.querySelectorAll<HTMLElement>("[data-media-frame]"));
    const scene = controller.current.state;
    const update = () => {
      const viewportHeight = window.innerHeight;
      const travel = window.innerWidth <= 699 ? 2.5 : 4;
      frames.forEach(frame => {
        const rect = frame.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
        const y = scene.reducedMotion ? 0 : travel * (1 - 2 * progress);
        const layer = frame.querySelector<HTMLElement>(".digital-media-scroll-layer");
        layer?.style.setProperty("--media-depth-y", `${y.toFixed(3)}%`);
        frame.dataset.depthProgress = progress.toFixed(3);
      });
    };
    controller.current.listeners.add(update);
    update();
    return () => { controller.current.listeners.delete(update); };
  }, [controller, root]);
}

function hoverPlaybackAllowed() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function RefusingWholenessMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const enter = () => {
    if (!hoverPlaybackAllowed()) return;
    void videoRef.current?.play().catch(() => {});
  };
  const leave = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };
  return <div className="digital-media digital-media--refusing" data-media-frame onPointerEnter={enter} onPointerLeave={leave}>
    <div className="digital-media-scroll-layer">
      <video ref={videoRef}
        src={digitalVisualProjects[0].mediaSrc}
        poster={digitalVisualProjects[0].posterSrc}
        muted loop playsInline preload="metadata"
        aria-label="Refusing Wholeness preview video" />
    </div>
  </div>;
}

function BrokenRoseMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hovering = useRef(false);
  const [videoVisible, setVideoVisible] = useState(false);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const enter = () => {
    if (!hoverPlaybackAllowed()) return;
    hovering.current = true;
    clearTimeout(resetTimer.current);
    const video = videoRef.current;
    if (!video) return;
    const reveal = () => {
      if (!hovering.current) return;
      void video.play().then(() => {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (hovering.current) setVideoVisible(true);
        }));
      }).catch(() => {});
    };
    if (Math.abs(video.currentTime - BROKEN_ROSE_MATCH_TIME) < .15) {
      reveal();
      return;
    }
    video.addEventListener("seeked", reveal, { once: true });
    video.currentTime = BROKEN_ROSE_MATCH_TIME;
  };
  const leave = () => {
    hovering.current = false;
    setVideoVisible(false);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      const video = videoRef.current;
      if (!video || hovering.current) return;
      video.pause();
      video.currentTime = 0;
    }, CROSSFADE_MS);
  };

  return <div className="digital-media digital-media--rose" data-media-frame data-video-visible={videoVisible}
    onPointerEnter={enter} onPointerLeave={leave}>
    <div className="digital-media-scroll-layer">
      <img src={digitalVisualProjects[1].posterSrc} alt="Broken Rose — fragmented digital rose" />
      <video ref={videoRef}
        src={digitalVisualProjects[1].mediaSrc}
        muted loop playsInline preload="metadata"
        aria-label="Broken Rose preview video" />
    </div>
  </div>;
}

function DigitalFlowerMedia() {
  return <div className="digital-media digital-media--flower" data-media-frame>
    <div className="digital-media-scroll-layer">
      <div className="digital-media-hover-layer">
        <img src={digitalVisualProjects[2].mediaSrc} alt="Digital Flower — translucent flower study in Blender" />
      </div>
    </div>
  </div>;
}

export function DigitalVisuals({ controller }: { controller: RefObject<SceneController> }) {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);
  useMediaDepth(root, controller);
  return <section ref={root} id="digital-visuals" className="digital-visuals" aria-labelledby="digital-visuals-title">
    <header className="digital-category-heading">
      <div className="category-title digital-category-title" data-digital-reveal>
        <p className="category-number">{digitalVisualCategory.number}</p>
        <h2 id="digital-visuals-title">{digitalVisualCategory.title}</h2>
        <p className="category-english">{digitalVisualCategory.subtitle}</p>
      </div>
    </header>
    <div className="digital-works-grid">
      {digitalVisualProjects.map((project, index) => <article
        key={project.title}
        className={`digital-work digital-work--${index + 1}`}
        data-digital-reveal
        style={{ "--digital-reveal-delay": `${index * 90}ms` } as CSSProperties}>
        <header className="digital-work-copy">
          <div className="digital-work-meta">
            <span className="digital-work-index">{project.number}</span>
            <span className="digital-work-software"><i aria-hidden="true" />{project.software}</span>
          </div>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
        </header>
        {index === 0 ? <RefusingWholenessMedia /> : index === 1 ? <BrokenRoseMedia /> : <DigitalFlowerMedia />}
      </article>)}
    </div>
  </section>;
}
