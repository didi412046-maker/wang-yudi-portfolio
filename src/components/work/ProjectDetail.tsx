"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Navigation } from "@/components/hero/Navigation";
import { visual, type Destination } from "@/config/hero";
import type { ProjectDetailData } from "@/config/project-details";
import { headingRevealProgress } from "@/lib/work-motion";

type ProjectDetailProps = {
  project: ProjectDetailData;
  nextSlug: string | null;
};

const CONTENT_REVEAL_LAG = 0.06;
const VIDEO_CONTROLS_HIDE_DELAY = 1600;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function ButterflyMark() {
  return (
    <svg
      className="detail-butterfly-mark"
      viewBox="0 0 24 18"
      fill="none"
      aria-hidden="true"
    >
      <path d="M11.35 8.55C9.15 3.2 4.25 1.45 2.35 4.15C.55 6.7 4.25 9.35 11.35 9.5Z" />
      <path d="M11.45 9.55C7.05 9.5 3.25 10.45 3.65 13.65C4.05 16.25 8.55 15.25 11.7 10.65Z" />
      <path d="M12.65 8.55C14.85 3.2 19.75 1.45 21.65 4.15C23.45 6.7 19.75 9.35 12.65 9.5Z" />
      <path d="M12.55 9.55C16.95 9.5 20.75 10.45 20.35 13.65C19.95 16.25 15.45 15.25 12.3 10.65Z" />
      <path className="detail-butterfly-body" d="M12 6.3V13.4M12 6.5 10.8 4.5M12 6.5l1.2-2" />
    </svg>
  );
}

function PavilionMark() {
  return (
    <svg
      className="detail-pavilion-mark"
      viewBox="0 0 24 18"
      fill="none"
      aria-hidden="true"
    >
      <circle className="detail-pavilion-finial" cx="12" cy="1.25" r="0.65" />
      <path d="M12 2v1.35" />
      <path d="M1.5 6.8c1.2 1.4 2.8 1.8 4.6 1.6C8.3 8.1 10.1 5 12 3.4c1.9 1.6 3.7 4.7 5.9 5 1.8.2 3.4-.2 4.6-1.6" />
      <path d="M3.2 9.4h17.6M5.6 9.4v6.8M9.8 9.4v6.8M14.2 9.4v6.8M18.4 9.4v6.8M4.4 16.4h15.2" />
    </svg>
  );
}

function SectionHeading({
  number,
  title,
  english,
}: {
  number: string;
  title: string;
  english: readonly string[];
}) {
  return (
    <div className="detail-chapter-heading">
      <p className="detail-chapter-number">{number}</p>
      <h2>{title}</h2>
      <p className="detail-chapter-english">
        {english.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
    </div>
  );
}

function ProjectDownloadContent({ download }: { download: ProjectDetailData["download"] }) {
  const isCompact = Boolean(download.controls?.length);

  return (
    <div
      className={`detail-chapter-content detail-download-content${
        isCompact ? " detail-download-content-compact" : ""
      }`}
    >
      {download.lead ? <p className="detail-download-lead">{download.lead}</p> : null}
      {download.systemLabel ? (
        <p className="detail-download-system">{download.systemLabel}</p>
      ) : null}
      {download.href ? (
        <a
          className="detail-download-link"
          href={download.href}
          download={download.fileName}
        >
          <span>{download.label}</span>
          <span aria-hidden="true">↓</span>
        </a>
      ) : (
        <span className="detail-download-link detail-download-link-disabled" aria-disabled="true">
          <span>{download.label}</span>
          <span aria-hidden="true">—</span>
        </span>
      )}
      {download.instructions.length > 0 ? (
        <p className="detail-download-instructions">
          {download.instructions.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
      ) : null}
      {download.controls ? (
        <dl className="detail-control-legend" data-detail-item data-reveal-delay="0.02">
          {download.controls.map((item) => (
            <div className="detail-control-row" key={item.control}>
              <dt>{item.control}</dt>
              <dd>{item.action}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

function PeonyCaseStudy({ project }: { project: ProjectDetailData }) {
  const caseStudy = project.editorialCaseStudy;
  if (!caseStudy) return null;

  return (
    <div className="detail-case-study detail-case-study-editorial">
      <section className="detail-chapter detail-chapter-introduction">
        <SectionHeading number="01" title="项目介绍" english={["Project Introduction"]} />
        <div className="detail-chapter-content detail-introduction-content">
          <p className="detail-introduction-lead">{project.introduction.lead}</p>
          <div className="detail-introduction-body">
            {project.introduction.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="detail-role-block" data-detail-item data-reveal-delay="0.02">
            <span className="detail-role-dot" aria-hidden="true" />
            <div>
              <p className="detail-role-label">{caseStudy.role.label}</p>
              <p className="detail-role-value">{caseStudy.role.value}</p>
            </div>
          </div>

          <figure className="detail-project-poster" data-detail-item data-reveal-delay="0.04">
            <figcaption>
              <span>{caseStudy.poster.caption}</span>
              <span>{caseStudy.poster.year}</span>
            </figcaption>
            <img
              src={caseStudy.poster.src}
              alt={caseStudy.poster.alt}
              width={caseStudy.poster.width}
              height={caseStudy.poster.height}
              loading="lazy"
            />
          </figure>
        </div>
      </section>

      <section className="detail-chapter detail-chapter-spatial">
        <SectionHeading
          number="02"
          title="空间叙事设计"
          english={["Spatial Narrative Design"]}
        />
        <div className="detail-chapter-content detail-spatial-content">
          <p className="detail-section-lead">{caseStudy.spatialNarrative.lead}</p>
          <p className="detail-editorial-body">{caseStudy.spatialNarrative.body}</p>

          <div className="detail-memory-field" aria-label="非线性记忆空间">
            <p className="detail-memory-hint">{caseStudy.spatialNarrative.hint}</p>
            <div className="detail-memory-map">
              {caseStudy.spatialNarrative.spaces.map((space, index) => (
                <article
                  className={`detail-memory-space detail-memory-space-${space.placement}`}
                  data-memory-space
                  key={space.title}
                  style={{ "--memory-delay": `${index * 90}ms` } as CSSProperties}
                >
                  <span className="detail-memory-point" aria-hidden="true" />
                  <h3>{space.title}</h3>
                  <p className="detail-memory-english">{space.titleEn}</p>
                  <p className="detail-memory-emotion">{space.emotion}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="detail-chapter detail-chapter-sound">
        <SectionHeading number="03" title="声音设计" english={["Sound Design"]} />
        <div className="detail-chapter-content detail-sound-content">
          <p className="detail-section-lead">{caseStudy.soundDesign.lead}</p>
          <p className="detail-editorial-body detail-sound-intro">
            {caseStudy.soundDesign.intro}
          </p>

          <div className="detail-sound-chapters">
            {caseStudy.soundDesign.chapters.map((chapter, index) => (
              <article
                className="detail-sound-chapter"
                data-detail-item
                data-reveal-delay={(index * 0.06).toFixed(2)}
                key={chapter.title}
              >
                <header>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.subtitle}</p>
                </header>
                <div className="detail-sound-chapter-copy">
                  <div className="detail-kunqu-quotes">
                    {chapter.quotes.map((quote) => (
                      <blockquote key={quote}>“{quote}”</blockquote>
                    ))}
                  </div>
                  <p>{chapter.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="detail-chapter detail-chapter-download">
        <SectionHeading
          number="04"
          title="下载与体验"
          english={["Download", "& Experience"]}
        />
        <ProjectDownloadContent download={project.download} />
      </section>
    </div>
  );
}

export function ProjectDetail({ project, nextSlug }: ProjectDetailProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleNavigate = useCallback(
    (destination: Destination) => {
      const anchor = destination === "about" ? "resume" : destination;
      router.push(`/#${anchor}`);
    },
    [router],
  );

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const cursor = cursorRef.current;
    const root = rootRef.current;
    if (!cursor || !root || event.pointerType === "touch") return;

    cursor.style.transform =
      `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    cursor.style.opacity = "1";
    root.dataset.cursorActive = "true";
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (cursorRef.current) cursorRef.current.style.opacity = "0";
    if (rootRef.current) rootRef.current.dataset.cursorActive = "false";
  }, []);

  const clearControlsTimer = useCallback(() => {
    if (!controlsTimerRef.current) return;
    clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = null;
  }, []);

  const scheduleControlsHide = useCallback(() => {
    clearControlsTimer();
    controlsTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
      controlsTimerRef.current = null;
    }, VIDEO_CONTROLS_HIDE_DELAY);
  }, [clearControlsTimer]);

  const revealVideoControls = useCallback(() => {
    setControlsVisible(true);

    if (isPlaying && !isScrubbing) {
      scheduleControlsHide();
      return;
    }

    clearControlsTimer();
  }, [clearControlsTimer, isPlaying, isScrubbing, scheduleControlsHide]);

  const handleMediaPointerLeave = useCallback(() => {
    if (!isPlaying || isScrubbing) return;
    clearControlsTimer();
    setControlsVisible(false);
  }, [clearControlsTimer, isPlaying, isScrubbing]);

  const toggleVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (video.ended || isEnded) {
        video.currentTime = 0;
        setCurrentTime(0);
        setIsEnded(false);
      }

      setControlsVisible(true);
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
        setControlsVisible(true);
      }
      return;
    }

    video.pause();
  }, [isEnded]);

  const handleVideoPlaying = useCallback(() => {
    setHasStarted(true);
    setIsPlaying(true);
    setIsEnded(false);
    setControlsVisible(true);
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
    clearControlsTimer();

    if (hasStarted || (videoRef.current?.currentTime ?? 0) > 0) {
      setControlsVisible(true);
    }
  }, [clearControlsTimer, hasStarted]);

  const handleVideoEnded = useCallback(() => {
    const video = videoRef.current;
    setHasStarted(true);
    setIsPlaying(false);
    setIsEnded(true);
    setControlsVisible(true);
    clearControlsTimer();

    if (video) setCurrentTime(video.duration || duration);
  }, [clearControlsTimer, duration]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    setDuration(video.duration);
    setCurrentTime(video.currentTime);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || isScrubbing) return;
    setCurrentTime(video.currentTime);
  }, [isScrubbing]);

  const handleSeek = useCallback((nextTime: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;

    const boundedTime = Math.min(video.duration, Math.max(0, nextTime));
    video.currentTime = boundedTime;
    setCurrentTime(boundedTime);
    setIsEnded(false);
  }, []);

  const handleScrubStart = useCallback(
    (event: ReactPointerEvent<HTMLInputElement>) => {
      event.stopPropagation();
      clearControlsTimer();
      setIsScrubbing(true);
      setControlsVisible(true);
    },
    [clearControlsTimer],
  );

  const handleScrubEnd = useCallback(
    (event: ReactPointerEvent<HTMLInputElement>) => {
      event.stopPropagation();
      setIsScrubbing(false);
      if (isPlaying) scheduleControlsHide();
    },
    [isPlaying, scheduleControlsHide],
  );

  useEffect(() => {
    return () => {
      clearControlsTimer();
      videoRef.current?.pause();
    };
  }, [clearControlsTimer]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealItems = Array.from(
      root.querySelectorAll<HTMLElement>("[data-detail-reveal]"),
    );
    const chapters = Array.from(root.querySelectorAll<HTMLElement>(".detail-chapter"));
    const flowSteps = Array.from(root.querySelectorAll<HTMLElement>(".detail-flow-step"));
    const detailItems = Array.from(
      root.querySelectorAll<HTMLElement>("[data-detail-item]"),
    );
    const media = root.querySelector<HTMLElement>(".detail-media");
    const flowSection = root.querySelector<HTMLElement>(".detail-chapter-flow");
    let frame = 0;

    const update = () => {
      frame = 0;

      if (reducedMotion.matches) {
        revealItems.forEach((item) => item.style.setProperty("--detail-reveal", "1"));
        chapters.forEach((chapter) => {
          chapter.style.setProperty("--chapter-heading-progress", "1");
          chapter.style.setProperty("--chapter-content-progress", "1");
        });
        flowSteps.forEach((step) => step.style.setProperty("--flow-step-progress", "1"));
        detailItems.forEach((item) => item.style.setProperty("--detail-item-progress", "1"));
        media?.style.setProperty("--media-progress", "1");
        flowSection?.style.setProperty("--flow-progress", "1");
        return;
      }

      revealItems.forEach((item) => {
        const progress = headingRevealProgress(
          item.getBoundingClientRect().top,
          window.innerHeight,
        );
        item.style.setProperty("--detail-reveal", progress.toFixed(4));
      });

      chapters.forEach((chapter) => {
        const heading = chapter.querySelector<HTMLElement>(".detail-chapter-heading");
        if (!heading) return;

        const headingProgress = headingRevealProgress(
          heading.getBoundingClientRect().top,
          window.innerHeight,
        );
        const contentProgress = clamp(
          (headingProgress - CONTENT_REVEAL_LAG) / (1 - CONTENT_REVEAL_LAG),
        );

        chapter.style.setProperty("--chapter-heading-progress", headingProgress.toFixed(4));
        chapter.style.setProperty("--chapter-content-progress", contentProgress.toFixed(4));
      });

      flowSteps.forEach((step) => {
        const progress = headingRevealProgress(
          step.getBoundingClientRect().top,
          window.innerHeight,
        );
        step.style.setProperty("--flow-step-progress", progress.toFixed(4));
      });

      detailItems.forEach((item) => {
        const baseProgress = headingRevealProgress(
          item.getBoundingClientRect().top,
          window.innerHeight,
        );
        const delay = Number(item.dataset.revealDelay ?? 0);
        const progress = clamp((baseProgress - delay) / Math.max(0.01, 1 - delay));
        item.style.setProperty("--detail-item-progress", progress.toFixed(4));
      });

      if (media) {
        const mediaProgress = headingRevealProgress(
          media.getBoundingClientRect().top,
          window.innerHeight,
        );
        media.style.setProperty("--media-progress", mediaProgress.toFixed(4));
      }

      if (flowSection) {
        const rect = flowSection.getBoundingClientRect();
        const railTravel = rect.height + window.innerHeight * 0.5;
        const flowProgress = clamp((window.innerHeight * 0.85 - rect.top) / railTravel);
        flowSection.style.setProperty("--flow-progress", flowProgress.toFixed(4));
      }
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const memorySpaces = Array.from(
      root.querySelectorAll<HTMLElement>("[data-memory-space]"),
    );
    if (memorySpaces.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      memorySpaces.forEach((space) => {
        space.dataset.visible = "true";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const space = entry.target as HTMLElement;
          space.dataset.visible = "true";
          observer.unobserve(space);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    memorySpaces.forEach((space) => observer.observe(space));
    return () => observer.disconnect();
  }, []);

  const rootStyle = {
    "--background": visual.background,
    "--ink": visual.text.colour,
    "--muted": visual.text.mutedColour,
    "--cyan": visual.cursor.color,
    "--cursor-size": `${visual.cursor.size}px`,
    "--cursor-color": visual.cursor.color,
    "--layer-cursor": visual.layers.cursor,
    "--layer-navigation": visual.layers.navigation,
    "--layer-notice": visual.layers.notice,
  } as CSSProperties;

  return (
    <main
      ref={rootRef}
      className="project-detail"
      data-cursor-active="false"
      style={rootStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Navigation onNavigate={handleNavigate}
        onSectionNavigate={sectionId => router.push(`/#${sectionId}`)} />

      <header className="detail-hero">
        <div className="detail-hero-copy-group" data-detail-reveal>
          <div className="detail-identity detail-hero-identity">
            {project.identityMark === "butterfly" ? (
              <ButterflyMark />
            ) : project.identityMark === "pavilion" ? (
              <PavilionMark />
            ) : (
              <span className="detail-project-mark-placeholder" aria-hidden="true" />
            )}
            <span>
              {project.title}
              {project.titleZh ? <> · <span lang="zh-CN">{project.titleZh}</span></> : null}
            </span>
          </div>

          <p className="detail-hero-intro">{project.heroIntro}</p>
        </div>

        <p className="detail-metadata detail-hero-metadata" data-detail-reveal>
          {project.metadata.join(" · ")}
        </p>
      </header>

      {project.media.videoSrc ? (
        <section
          className="detail-media"
          aria-label={`${project.title} project video`}
          onPointerEnter={revealVideoControls}
          onPointerMove={revealVideoControls}
          onPointerLeave={handleMediaPointerLeave}
        >
          <video
            ref={videoRef}
            className="detail-video"
            src={project.media.videoSrc}
            poster={project.media.posterSrc}
            preload="metadata"
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPlaying={handleVideoPlaying}
            onPause={handleVideoPause}
            onEnded={handleVideoEnded}
            onLoadedMetadata={handleLoadedMetadata}
            onDurationChange={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onSeeked={handleTimeUpdate}
          />
          {project.media.posterSrc ? (
            <img
              className="detail-video-poster"
              src={project.media.posterSrc}
              alt=""
              aria-hidden="true"
              data-visible={hasStarted ? "false" : "true"}
            />
          ) : null}
          <button
            type="button"
            className="detail-video-toggle"
            data-playing={isPlaying ? "true" : "false"}
            data-has-started={hasStarted ? "true" : "false"}
            aria-label={`${isPlaying ? "Pause" : isEnded ? "Replay" : "Play"} ${project.title} video`}
            onClick={toggleVideo}
          >
            <span className="detail-play-control" aria-hidden="true">
              <span className="detail-play-icon" />
            </span>
          </button>
          <div
            className="detail-video-controls"
            data-visible={
              hasStarted && (controlsVisible || !isPlaying || isScrubbing) ? "true" : "false"
            }
            data-scrubbing={isScrubbing ? "true" : "false"}
          >
            <input
              className="detail-video-progress"
              type="range"
              min="0"
              max={duration > 0 ? duration : 1}
              step="0.01"
              value={duration > 0 ? Math.min(currentTime, duration) : 0}
              disabled={duration <= 0}
              aria-label={`Seek ${project.title} video`}
              style={
                {
                  "--video-progress": `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                } as CSSProperties
              }
              onChange={(event) => handleSeek(Number(event.currentTarget.value))}
              onClick={(event) => event.stopPropagation()}
              onFocus={revealVideoControls}
              onPointerDown={handleScrubStart}
              onPointerUp={handleScrubEnd}
              onPointerCancel={handleScrubEnd}
            />
          </div>
        </section>
      ) : (
        <section className="detail-media" aria-label={`${project.title} project video placeholder`}>
          <div className="detail-video-placeholder">
            <span>{project.media.placeholderLabel ?? "PROJECT VIDEO"}</span>
          </div>
        </section>
      )}

      {project.fullExperienceVideoUrl ? (
        <aside className="detail-full-experience" aria-label="完整体验视频">
          <a
            className="detail-full-experience-link"
            href={project.fullExperienceVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`观看 ${project.title} 完整体验视频（百度网盘）`}
          >
            <span>{project.fullExperienceVideoLabel ?? "观看完整体验视频"}</span>
            <span className="detail-full-experience-arrow" aria-hidden="true">↗</span>
          </a>
          {project.fullExperienceVideoPlatform && project.fullExperienceVideoCode ? (
            <p className="detail-full-experience-meta">
              {project.fullExperienceVideoPlatform} · 提取码{" "}
              <strong>{project.fullExperienceVideoCode}</strong>
            </p>
          ) : null}
        </aside>
      ) : null}

      {project.editorialCaseStudy ? (
        <PeonyCaseStudy project={project} />
      ) : (
        <div className="detail-case-study">
          <section className="detail-chapter detail-chapter-introduction">
          <SectionHeading number="01" title="项目介绍" english={["Project Introduction"]} />
          <div className="detail-chapter-content detail-introduction-content">
            <p className="detail-introduction-lead">{project.introduction.lead}</p>
            {project.introduction.body.length > 0 ? (
              <div className="detail-introduction-body">
                {project.introduction.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : null}
            {project.introduction.quote ? (
              <blockquote className="detail-pull-quote">
                <span className="detail-quote-dot" aria-hidden="true" />
                {project.introduction.quote}
              </blockquote>
            ) : null}
          </div>
        </section>

        <section className="detail-chapter detail-chapter-flow">
          <SectionHeading
            number="02"
            title="体验流程与交互设计"
            english={["Experience Flow", "& Interaction Design"]}
          />
          <div className="detail-chapter-content detail-flow-content">
            <p className="detail-flow-lead">{project.experienceLead}</p>
            <div className="detail-flow-journey">
              <span className="detail-flow-rail-progress" aria-hidden="true" />
              {project.flowSteps?.map((step) => (
                <article className="detail-flow-step" key={step.number}>
                  <div className="detail-flow-marker" aria-hidden="true">
                    <span className="detail-flow-number">{step.number}</span>
                    <span className="detail-flow-node" />
                  </div>
                  <div className="detail-flow-step-content">
                    <h3>{step.title}</h3>
                    <p className="detail-flow-action">{step.action}</p>
                    <p className="detail-flow-principle">{step.principle}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="detail-chapter detail-chapter-download">
          <SectionHeading
            number="03"
            title="下载与体验"
            english={["Download", "& Experience"]}
          />
          <ProjectDownloadContent download={project.download} />
          </section>
        </div>
      )}

      <nav className="detail-project-navigation" aria-label="Project navigation">
        <Link className="detail-project-link detail-project-link-back" href="/#work">
          <span aria-hidden="true">←</span>
          <span>BACK TO WORK</span>
        </Link>
        {nextSlug ? (
          <Link className="detail-project-link detail-project-link-next" href={`/work/${nextSlug}`}>
            <span>NEXT PROJECT</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <span className="detail-project-link detail-project-link-disabled" aria-disabled="true">
            <span>NEXT PROJECT</span>
            <span aria-hidden="true">→</span>
          </span>
        )}
      </nav>

      <div
        ref={cursorRef}
        className="droplet-cursor visual-layer detail-droplet-cursor"
        data-mode="default"
        aria-hidden="true"
      />

    </main>
  );
}
