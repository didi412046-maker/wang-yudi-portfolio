"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { soundMovingImageCategory, soundMovingImageProjects } from "@/config/work";
import type { SceneController } from "@/lib/scene";

const BARS = [18, 34, 25, 48, 29, 58, 37, 66, 42, 54, 31, 45, 24, 36, 20];

function pointerHoverAllowed() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "00:00";
  const whole = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

function useStoryMotion(root: RefObject<HTMLElement | null>, controller: RefObject<SceneController>) {
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const reveals = Array.from(section.querySelectorAll<HTMLElement>("[data-story-reveal]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) reveals.forEach(item => item.dataset.visible = "true");
    const observer = reducedMotion ? null : new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.visible = "true";
        observer?.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -7%" });
    reveals.forEach(item => observer?.observe(item));

    const frames = Array.from(section.querySelectorAll<HTMLElement>("[data-story-depth-frame]"));
    const updateDepth = () => {
      const viewportHeight = window.innerHeight;
      frames.forEach(frame => {
        const rect = frame.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
        const desktopTravel = Number(frame.dataset.storyTravel ?? 2.5);
        const travel = window.innerWidth <= 699 ? Math.min(desktopTravel, 1.5) : desktopTravel;
        const y = controller.current.state.reducedMotion ? 0 : travel * (1 - 2 * progress);
        frame.querySelector<HTMLElement>(".story-media-depth-layer")
          ?.style.setProperty("--story-depth-y", `${y.toFixed(3)}%`);
        frame.dataset.depthProgress = progress.toFixed(3);
      });
    };
    controller.current.listeners.add(updateDepth);
    updateDepth();
    return () => {
      observer?.disconnect();
      controller.current.listeners.delete(updateDepth);
    };
  }, [controller, root]);
}

function SoundArtwork() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const scrubPointer = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
    };
    syncDuration();
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("durationchange", syncDuration);
    };
  }, []);
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => {});
    else audio.pause();
  };
  const seekToClientX = (clientX: number) => {
    const audio = audioRef.current;
    const track = progressRef.current;
    if (!audio || !track || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const rect = track.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = progress * audio.duration;
    setCurrentTime(audio.currentTime);
  };
  const beginScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    scrubPointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setScrubbing(true);
    seekToClientX(event.clientX);
  };
  const moveScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (scrubPointer.current !== event.pointerId) return;
    seekToClientX(event.clientX);
  };
  const endScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (scrubPointer.current !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    scrubPointer.current = null;
    setScrubbing(false);
  };
  const keyboardSeek = (event: KeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    let next: number | null = null;
    if (event.key === "ArrowLeft") next = audio.currentTime - 5;
    if (event.key === "ArrowRight") next = audio.currentTime + 5;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = audio.duration;
    if (next === null) return;
    event.preventDefault();
    event.stopPropagation();
    audio.currentTime = Math.min(audio.duration, Math.max(0, next));
    setCurrentTime(audio.currentTime);
  };

  return <div className="sound-artwork" data-story-depth-frame data-story-travel="2" data-playing={playing}>
    <div className="story-media-depth-layer sound-artwork-depth-layer">
      <button className="sound-artwork-toggle" type="button" onClick={toggle}
        aria-label={`${playing ? "暂停" : "播放"} She is on her way`} aria-pressed={playing}>
        <svg className="sound-artwork-visual" viewBox="0 0 800 600" role="img"
          aria-label="She is on her way 声音叙事的金属呼吸视觉">
          <defs>
            <radialGradient id="sound-lens" cx="42%" cy="34%" r="68%">
              <stop offset="0" stopColor="#d9ffff" stopOpacity=".78" />
              <stop offset=".34" stopColor="#73d8da" stopOpacity=".36" />
              <stop offset="1" stopColor="#294a56" stopOpacity=".06" />
            </radialGradient>
            <linearGradient id="sound-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8ce5e2" stopOpacity="0" />
              <stop offset=".48" stopColor="#a9efec" stopOpacity=".68" />
              <stop offset="1" stopColor="#8ce5e2" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="800" height="600" fill="#17252d" />
          <path d="M70 332H730" stroke="url(#sound-line)" strokeWidth="1" />
          <g className="sound-artwork-bars" aria-hidden="true">
            {BARS.map((height, index) => <line key={index}
              x1={176 + index * 32} x2={176 + index * 32}
              y1={332 - height / 2} y2={332 + height / 2}
              style={{ "--bar-index": index } as CSSProperties} />)}
          </g>
          <circle className="sound-artwork-ring sound-artwork-ring--outer" cx="505" cy="272" r="144" />
          <circle className="sound-artwork-ring sound-artwork-ring--inner" cx="505" cy="272" r="111" />
          <circle className="sound-artwork-lens" cx="505" cy="272" r="82" fill="url(#sound-lens)" />
          <circle cx="477" cy="244" r="14" fill="#e6ffff" opacity=".34" />
          <circle cx="642" cy="148" r="5" fill="#78dcd9" opacity=".62" />
          <circle cx="111" cy="171" r="3" fill="#78dcd9" opacity=".5" />
        </svg>
        <span className="sound-artwork-kicker">SOUND NARRATIVE · 2025</span>
        <span className="sound-artwork-name">She is on her way</span>
        <span className="sound-artwork-state" aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
        <span className="sound-artwork-time" aria-hidden="true">{formatTime(currentTime)} / {formatTime(duration)}</span>
      </button>
    </div>
    <div ref={progressRef} className="sound-artwork-progress" role="slider" tabIndex={0}
      aria-label="She is on her way 播放进度" aria-valuemin={0} aria-valuemax={Math.round(duration || 0)}
      aria-valuenow={Math.round(Math.min(currentTime, duration || 0))}
      aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
      data-scrubbing={scrubbing}
      style={{ "--audio-progress": duration ? `${currentTime / duration * 100}%` : "0%" } as CSSProperties}
      onPointerDown={beginScrub} onPointerMove={moveScrub} onPointerUp={endScrub}
      onPointerCancel={endScrub} onClick={event => event.stopPropagation()} onKeyDown={keyboardSeek}>
      <span className="sound-progress-rail" aria-hidden="true"><span className="sound-progress-fill" /></span>
      <span className="sound-progress-thumb" aria-hidden="true" />
    </div>
    <audio ref={audioRef} src={soundMovingImageProjects[0].mediaSrc} preload="metadata"
      onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
      onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onEnded={() => { setPlaying(false); setCurrentTime(0); }} />
  </div>;
}

function DocumentaryMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const play = () => void videoRef.current?.play().catch(() => {});
  const pause = () => videoRef.current?.pause();
  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) play(); else pause();
  };
  const enter = () => { if (pointerHoverAllowed()) play(); };
  const leave = () => { if (pointerHoverAllowed()) pause(); };

  return <div className="documentary-media-column">
    <button className="documentary-frame" type="button" data-story-depth-frame data-story-travel="2.5"
      data-playing={playing} onPointerEnter={enter} onPointerLeave={leave} onClick={toggle}
      aria-label={`${playing ? "暂停" : "播放"} 石骨铁硬预览`} aria-pressed={playing}>
      <span className="story-media-depth-layer documentary-depth-layer">
        <video ref={videoRef} src={soundMovingImageProjects[1].mediaSrc}
          muted playsInline preload="metadata" aria-label="石骨铁硬纪录片预览"
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      </span>
      <span className="documentary-play-state" aria-hidden="true">{playing ? "暂停" : "播放"}</span>
    </button>
    <div className="documentary-link-row">
      <a href={soundMovingImageProjects[1].fullDocumentaryUrl} target="_blank" rel="noopener noreferrer"
        aria-label="观看石骨铁硬完整纪录片（百度网盘）">
        <span>{soundMovingImageProjects[1].fullDocumentaryLabel}</span><i aria-hidden="true">↗</i>
      </a>
      <p>{soundMovingImageProjects[1].fullDocumentaryPlatform} · 提取码 {soundMovingImageProjects[1].fullDocumentaryCode}</p>
    </div>
  </div>;
}

function ProjectText({ project, titleId, titleClass = "" }: {
  project: typeof soundMovingImageProjects[number];
  titleId: string;
  titleClass?: string;
}) {
  return <div className="story-project-copy">
    <header className="story-project-header" data-story-reveal style={{ "--story-delay": "70ms" } as CSSProperties}>
      <p className="story-project-type"><span>{project.number}</span><i aria-hidden="true" />{project.type}</p>
      {"recognition" in project ? <p className="story-project-recognition"><i aria-hidden="true" />{project.recognition}</p> : null}
      <h3 id={titleId} className={titleClass}>{project.title}</h3>
      <p className="story-project-metadata">{project.metadata}</p>
    </header>
    <div className="story-copy-block" data-story-reveal style={{ "--story-delay": "140ms" } as CSSProperties}>
      <h4>项目概念</h4>
      <p>{project.concept}</p>
    </div>
    <div className="story-copy-block" data-story-reveal style={{ "--story-delay": "220ms" } as CSSProperties}>
      <h4>{project.designLabel}</h4>
      <p>{project.design}</p>
    </div>
  </div>;
}

export function SoundMovingImage({ controller }: { controller: RefObject<SceneController> }) {
  const root = useRef<HTMLElement>(null);
  useStoryMotion(root, controller);
  const soundProject = soundMovingImageProjects[0];
  const documentaryProject = soundMovingImageProjects[1];

  return <section ref={root} id="sound-moving-image" className="sound-moving-image"
    aria-labelledby="sound-moving-image-title">
    <header className="storytelling-category-heading">
      <div className="category-title storytelling-category-title" data-story-reveal>
        <p className="category-number">{soundMovingImageCategory.number}</p>
        <h2 id="sound-moving-image-title">{soundMovingImageCategory.title}</h2>
        <p className="category-english">{soundMovingImageCategory.subtitle}</p>
      </div>
    </header>

    <div className="story-projects">
      <article className="story-project story-project--sound" aria-labelledby="story-sound-title">
        <div className="story-project-media" data-story-reveal>
          <SoundArtwork />
        </div>
        <ProjectText project={soundProject} titleId="story-sound-title" titleClass="story-title--latin" />
      </article>

      <article className="story-project story-project--documentary" aria-labelledby="story-documentary-title">
        <ProjectText project={documentaryProject} titleId="story-documentary-title" titleClass="story-title--chinese" />
        <div className="story-project-media story-project-media--documentary" data-story-reveal
          style={{ "--story-delay": "80ms" } as CSSProperties}>
          <DocumentaryMedia />
        </div>
      </article>
    </div>
  </section>;
}
