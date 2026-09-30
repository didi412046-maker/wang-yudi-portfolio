"use client";
import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { workConfig as config, workCategory, projects } from "@/config/work";
import { headingRevealProgress, nearestProject, projectProgress, projectStyle, rainTarget } from "@/lib/work-motion";
import type { SceneController } from "@/lib/scene";
import { DigitalVisuals } from "./DigitalVisuals";
import { SoundMovingImage } from "./SoundMovingImage";

export function Work({ controller }: { controller: RefObject<SceneController> }) {
  const root = useRef<HTMLElement>(null);
  const manualPaused = useRef(false);
  useEffect(() => {
    const overlays = Array.from(root.current?.querySelectorAll<HTMLElement>(".project-window--editorial .project-editorial-overlay") ?? []);
    if (!overlays.length) return;
    const updateIndent = (overlay: HTMLElement) => {
      const lead = overlay.querySelector<HTMLElement>(".project-title-line");
      if (!lead) return;
      const ratio = Number(overlay.dataset.titleIndentRatio ?? 0.46);
      overlay.style.setProperty("--butterfly-indent", `${lead.offsetWidth * ratio}px`);
    };
    const observer = new ResizeObserver(entries => entries.forEach(entry => {
      const overlay = (entry.target as HTMLElement).closest<HTMLElement>(".project-editorial-overlay");
      if (overlay) updateIndent(overlay);
    }));
    overlays.forEach(overlay => {
      const lead = overlay.querySelector<HTMLElement>(".project-title-line");
      if (lead) observer.observe(lead);
      updateIndent(overlay);
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const el = root.current!, scene = controller.current.state;
    const stages = Array.from(el.querySelectorAll<HTMLElement>(".project-stage"));
    const windows = Array.from(el.querySelectorAll<HTMLElement>(".project-window"));
    const videos = Array.from(el.querySelectorAll<HTMLVideoElement>("video"));
    let active = -1, generation = 0, attempting = -1;
    let previousInput = scene.lastScrollInput, wasSettled = false;
    let rain = 1, target = 1, from = 1, elapsed = 0;
    const pauseAll = () => { generation++; attempting = -1; videos.forEach(video => video.pause()); };
    const hidden = () => { if (document.hidden) pauseAll(); };
    document.addEventListener("visibilitychange", hidden);
    const frame = (dt: number, _scene: typeof scene, now: number) => {
      const height = window.innerHeight, quietFor = now - scene.lastScrollInput;
      // A fixed background keeps the same particles throughout Home → Work.
      const inWork = el.getBoundingClientRect().top <= 1;
      const inputChanged = previousInput !== scene.lastScrollInput;
      if (inputChanged) {
        previousInput = scene.lastScrollInput;
        pauseAll(); manualPaused.current = false;
      }
      const moving = scene.scrollMoving || Math.abs(scene.scrollVelocity) > config.smoothScroll.velocityThreshold;
      const settled = inWork && !moving && quietFor >= config.focus.stopDelay;
      if (!settled && wasSettled) { pauseAll(); manualPaused.current = false; }
      wasSettled = settled;
      const nextTarget = rainTarget(inWork, settled);
      if (!inWork) { rain = from = target = 1; elapsed = 0; }
      else {
        if (nextTarget !== target) { from = rain; target = nextTarget; elapsed = 0; }
        elapsed += dt * 1000;
        const duration = target === 1 ? config.rain.speedUpDuration : config.rain.slowDownDuration;
        const t = Math.min(1, elapsed / duration), ease = t * t * (3 - 2 * t);
        rain = from + (target - from) * ease;
      }
      scene.rainTimeScale = rain;
      if (inWork) scene.visible = false;
      const centers = stages.map(stage => { const r = stage.getBoundingClientRect(); return r.top + r.height / 2; });
      const heading = el.querySelector<HTMLElement>(".category-title")!;
      const headingProgress = headingRevealProgress(heading.getBoundingClientRect().top, height);
      const reveal = scene.reducedMotion ? 1 : headingProgress;
      const revealConfig = config.headingReveal;
      heading.style.opacity = String(revealConfig.startOpacity + reveal * (1 - revealConfig.startOpacity));
      heading.style.transform = `translateY(${revealConfig.startY * (1 - reveal)}px)`;
      heading.style.filter = `blur(${revealConfig.startBlur * (1 - reveal)}px)`;
      el.dataset.introProgress = headingProgress.toFixed(3);
      centers.forEach((center, i) => {
        const rawProgress = projectProgress(center, height);
        const style = projectStyle(scene.reducedMotion ? 1 : rawProgress);
        const overlay = config.projectOverlay;
        const textOpacity = overlay.minOpacity + (overlay.maxOpacity - overlay.minOpacity) * style.easedProgress;
        windows[i].style.setProperty("--project-scale", String(style.scale));
        windows[i].style.setProperty("--project-brightness", String(style.brightness));
        windows[i].style.setProperty("--project-opacity", String(style.opacity));
        windows[i].style.setProperty("--project-text-opacity", String(textOpacity));
        windows[i].style.setProperty("--project-text-y", `${overlay.maxTranslateY * (1 - style.easedProgress)}px`);
        windows[i].dataset.progress = rawProgress.toFixed(3);
        windows[i].dataset.easedProgress = style.easedProgress.toFixed(3);
      });
      const projectVisible = windows.some(window => {
        const rect = window.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < height;
      });
      const next = inWork && projectVisible ? nearestProject(centers, height) : -1;
      if (next !== active) { pauseAll(); active = next; manualPaused.current = false; }
      const focused = settled && !document.hidden;
      if (focused && active >= 0 && !scene.reducedMotion && !manualPaused.current
        && videos[active].paused && attempting !== active) {
        const video = videos[active], token = generation;
        attempting = active;
        videos.forEach(other => { if (other !== video) other.pause(); });
        video.play().then(() => {
          // A scroll may arrive while play() is pending: never restart stale playback.
          if (token !== generation || document.hidden) video.pause();
        }).catch(() => { /* The visible playback button is the user-gesture fallback. */ });
      }
      el.dataset.motionState = focused ? "focus" : "explore";
      el.dataset.activeProject = String(active);
      el.dataset.rainMultiplier = rain.toFixed(3);
      el.dataset.scrollVelocity = scene.scrollVelocity.toFixed(3);
    };
    controller.current.listeners.add(frame);
    return () => {
      pauseAll(); controller.current.listeners.delete(frame); scene.rainTimeScale = 1;
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [controller]);

  const playbackLabel = (video: HTMLVideoElement) => {
    const button = video.closest(".project-window")?.querySelector<HTMLButtonElement>(".video-toggle");
    if (button) { button.textContent = video.paused ? "播放预览" : "暂停预览"; button.setAttribute("aria-pressed", String(!video.paused)); }
  };
  return <section ref={root} id="work" className="work" aria-label="作品 · 沉浸与交互" style={{
    "--heading-start-opacity": config.headingReveal.startOpacity,
    "--heading-start-blur": `${config.headingReveal.startBlur}px`,
    "--heading-start-y": `${config.headingReveal.startY}px`, "--media-width": config.media.width,
    "--media-aspect": config.media.aspectRatio, "--media-max-width": config.media.maxWidth, "--media-radius": config.media.radius,
  } as CSSProperties}>
    <header id="immersive-interactive" className="category-heading">
      <div className="category-title">
        <p className="category-number">{workCategory.number}</p>
        <h2>{workCategory.title}</h2>
        <p className="category-english">{workCategory.subtitle}</p>
      </div>
    </header>
    {projects.map(project => {
      const dreaming = project.slug === "project-02";
      const [titleLead, ...titleRest] = project.title.split(" ");
      const titleLines = "titleLines" in project ? project.titleLines : [titleLead, titleRest.join(" ")];
      const titleIndentRatio = "titleIndentRatio" in project ? project.titleIndentRatio : 0.46;
      const titleZh = "titleZh" in project ? project.titleZh : undefined;
      return <article className="project-stage" key={project.slug} aria-labelledby={`${project.slug}-title`}>
        <div className={`project-window project-window--editorial${dreaming ? " project-window--dreaming" : ""}`}>
          <div className="project-surface">
            <video src={project.videoSrc} poster={project.posterSrc} muted loop playsInline preload="metadata"
              aria-label={`${project.title}${titleZh ? ` ${titleZh}` : ""} project preview video`}
              onPlay={event => {
                const video = event.currentTarget;
                root.current?.querySelectorAll("video").forEach(other => { if (other !== video) other.pause(); });
                playbackLabel(video);
              }} onPause={e => playbackLabel(e.currentTarget)} />
            <a className="project-link project-link--editorial"
              href={`/work/${project.slug}`}
              aria-label={`View ${project.title}${titleZh ? ` ${titleZh}` : ""} project`}>
              <span className="project-editorial-overlay" data-title-indent-ratio={titleIndentRatio}>
                <span className="project-editorial-index">
                  <span>{project.number}</span>
                </span>
                <span className="project-editorial-tag"><span className="project-editorial-dot" aria-hidden="true" />{project.tag}</span>
                <h3 id={`${project.slug}-title`} className="project-editorial-title" aria-label={`${project.title}${titleZh ? ` ${titleZh}` : ""}`}>
                  {titleLines.map(line => <span className="project-title-line" aria-hidden="true" key={line}>{line}</span>)}
                </h3>
                {titleZh ? <span className="project-editorial-title-zh" lang="zh-CN">{titleZh}</span> : null}
                <span className="project-editorial-intro">{project.shortDescription}</span>
                <span className="project-editorial-metadata">
                  {project.metadata.map(item => <span key={item} lang={/[\u3400-\u9fff]/.test(item) ? "zh-CN" : "en"}>{item}</span>)}
                </span>
              </span>
            </a>
          </div>
          <button className="video-toggle" type="button" aria-pressed="false" onClick={event => {
            const video = event.currentTarget.closest(".project-window")!.querySelector("video")!;
            if (video.paused) {
              root.current!.querySelectorAll("video").forEach(other => { if (other !== video) other.pause(); });
              manualPaused.current = false; void video.play().catch(() => {});
            } else { manualPaused.current = true; video.pause(); }
          }}>播放预览</button>
        </div>
      </article>;
    })}
    <DigitalVisuals controller={controller} />
    <SoundMovingImage controller={controller} />
  </section>;
}
