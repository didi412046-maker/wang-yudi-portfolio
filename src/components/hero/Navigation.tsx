"use client";

import { useRef, useState, type PointerEvent } from "react";
import { navigation, type Destination } from "@/config/hero";

const workSections = [
  { number: "01", title: "沉浸与交互", subtitle: "Immersive & Interactive", id: "immersive-interactive" },
  { number: "02", title: "三维与数字视觉", subtitle: "3D & Digital Visuals", id: "digital-visuals" },
  { number: "03", title: "声音与影像叙事", subtitle: "Sound & Moving Image Storytelling", id: "sound-moving-image" },
] as const;

export function Navigation({ onNavigate, onSectionNavigate }: {
  onNavigate: (id: Destination) => void;
  onSectionNavigate: (id: string) => void;
}) {
  const [workOpen, setWorkOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const open = () => { clearTimeout(closeTimer.current); setWorkOpen(true); };
  const close = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setWorkOpen(false), 140);
  };
  const handleWorkPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") open();
  };
  const handleWorkClick = () => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) setWorkOpen(value => !value);
    else onNavigate("work");
  };

  return <nav className="navigation" aria-label="Main navigation">
    <div className="navigation-work" data-open={workOpen}
      onPointerEnter={handleWorkPointerEnter} onPointerLeave={close}
      onFocus={open} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
      onKeyDown={event => { if (event.key === "Escape") setWorkOpen(false); }}>
      <button type="button" data-clickable aria-haspopup="true" aria-expanded={workOpen}
        aria-controls="work-category-menu" onClick={handleWorkClick}>WORK</button>
      <div id="work-category-menu" className="work-category-menu" aria-label="作品分类">
        {workSections.map(section => <button type="button" className="work-category-item" key={section.id}
          onClick={() => { onSectionNavigate(section.id); setWorkOpen(false); }}>
          <span className="work-category-number">{section.number}</span>
          <span className="work-category-copy">
            <span className="work-category-title"><i aria-hidden="true" />{section.title}</span>
            <span className="work-category-subtitle">{section.subtitle}</span>
          </span>
        </button>)}
      </div>
    </div>
    {navigation.filter(item => item.id !== "work").map(item =>
      <button type="button" key={item.id} data-clickable onClick={() => onNavigate(item.id)}>{item.label}</button>)}
  </nav>;
}
