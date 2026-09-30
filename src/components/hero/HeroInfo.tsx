"use client";
import { type CSSProperties, type RefObject } from "react";
import { heroInfo, textDepth } from "@/config/hero";
import type { SceneController } from "@/lib/scene";

export function HeroInfo({ controller }: { controller: RefObject<SceneController> }) {
  const { identity, education, practice, scrollHint } = heroInfo;
  return <><div className="hero-information" style={textDepth.enabled ? {
    "--text-opacity": textDepth.opacity,
    "--ink": textDepth.colour,
    "--muted": textDepth.mutedColour,
    "--text-softness": `${textDepth.blur}px`,
  } as CSSProperties : undefined}>
    <section className="info-block info-identity" style={{ left: identity.left, top: identity.top }}>
      <h1>{identity.name}</h1>
      <p>{identity.portfolio}</p>
    </section>
    <section className="info-block info-education" style={{ right: education.right, top: education.top }}>
      <p>{education.undergraduate}</p>
      <p>{education.postgraduate.map((part, i) =>
        <span key={i} className={part.supplementary ? "education-supplementary" : undefined}>{part.text}</span>)}</p>
    </section>
    <section className="info-block info-practice" style={{ left: practice.left, top: practice.top }}>
      <h2><span className="practice-xr">XR</span><span> · 空间媒体 · 交互叙事</span></h2>
      <p>{practice.en}</p>
    </section>
  </div>
    <button type="button" className="scroll-hint" aria-controls="work" onClick={event => {
      event.stopPropagation();
      const work = document.getElementById("work");
      if (work) {
        if (controller.current.scrollTo) controller.current.scrollTo(work);
        else work.scrollIntoView({ behavior: controller.current.state.reducedMotion ? "instant" : "smooth" });
      }
    }}>{scrollHint}</button>
  </>;
}
