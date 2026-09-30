"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const portraits = [
  { src: "/media/contact/portrait-blazer.jpeg", alt: "王雨迪形象照，浅色西装", className: "contact-portrait--one" },
  { src: "/media/contact/portrait-white-close.jpeg", alt: "王雨迪形象照，白色上衣", className: "contact-portrait--two" },
  { src: "/media/contact/portrait-smile.jpeg", alt: "王雨迪形象照，微笑肖像", className: "contact-portrait--three" },
] as const;

export function Contact() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const items = Array.from(section.querySelectorAll<HTMLElement>("[data-contact-reveal]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      items.forEach(item => item.dataset.visible = "true");
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      (entry.target as HTMLElement).dataset.visible = "true";
      observer.unobserve(entry.target);
    }), { threshold: 0.12, rootMargin: "0px 0px -7%" });
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return <section ref={root} id="contact" className="contact" aria-labelledby="contact-title">
    <div className="contact-unified">
      <div className="contact-copy" data-contact-reveal>
        <p className="contact-more-english">A LITTLE MORE ABOUT ME</p>
        <h2 id="contact-title">再认识我一点</h2>
        <p className="contact-more-body">在进入 XR、3D 和数字媒体之前，我花了四年时间学习如何用声音、镜头和身体表达。<br />这里留下一些主持、采访与声音片段，也是我开始讲故事的地方。</p>
        <div className="contact-external-link">
          <a href="https://pan.baidu.com/s/1keplNYEVXnysJGKENLK7QA?pwd=d2j7" target="_blank" rel="noopener noreferrer"
            aria-label="观看王雨迪个人作品片段（百度网盘）">
            <span>观看个人作品片段</span><i aria-hidden="true">↗</i>
          </a>
          <p>百度网盘 · 提取码 d2j7</p>
        </div>
        <div className="contact-list-block">
          <p className="contact-kicker">CONTACT</p>
          <dl className="contact-details">
            <div><dt>PHONE</dt><dd><a href="tel:19967353658">19967353658</a></dd></div>
            <div><dt>WECHAT</dt><dd>z19967353658</dd></div>
            <div className="contact-detail-email"><dt>EMAIL</dt><dd><a href="mailto:19967353658@163.com">19967353658@163.com</a></dd></div>
          </dl>
        </div>
      </div>

      <div className="contact-visuals">
        <div className="contact-portraits" aria-label="王雨迪形象照">
          {portraits.map((portrait, index) => <figure key={portrait.src}
            className={`contact-portrait ${portrait.className}`} data-contact-reveal
            style={{ "--contact-delay": `${index * 80}ms` } as CSSProperties}>
            <img src={portrait.src} alt={portrait.alt} loading="lazy" decoding="async" />
          </figure>)}
        </div>
        <figure className="contact-qr" data-contact-reveal style={{ "--contact-delay": "240ms" } as CSSProperties}>
          <img src="/media/contact/wechat-qr.jpg" alt="王雨迪微信二维码" width="717" height="717" />
          <figcaption><span>微信 / WECHAT</span><small>扫码添加</small></figcaption>
        </figure>
      </div>
    </div>

    <footer className="contact-footer">
      <p>© 2026 WANG YUDI · PORTFOLIO</p>
      <p>XR · SPATIAL MEDIA · INTERACTIVE STORYTELLING</p>
    </footer>
  </section>;
}
