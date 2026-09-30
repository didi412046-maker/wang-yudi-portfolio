const resumeHref = "/resume/wang-yudi-resume.pdf";

export function Resume() {
  return <section id="resume" className="resume" aria-labelledby="resume-title">
    <div className="resume-inner">
      <div className="resume-identity">
        <p className="resume-kicker">ABOUT / RESUME</p>
        <h2 id="resume-title">王雨迪</h2>
        <p className="resume-name-en">WANG YUDI</p>
      </div>
      <div className="resume-profile">
        <p className="resume-practice">XR · 空间媒体 · 交互叙事</p>
        <p className="resume-practice-en">Interactive &amp; Immersive Experience Design</p>
        <div className="resume-education">
          <p>浙江传媒学院 · 播音与主持艺术</p>
          <p>University of Southampton · Digital Media</p>
        </div>
        <div className="resume-links">
          <a href={resumeHref} target="_blank" rel="noopener noreferrer">查看简历 <i aria-hidden="true">↗</i></a>
          <a href={resumeHref} download="Wang-Yudi-Resume.pdf">下载 PDF <i aria-hidden="true">↓</i></a>
        </div>
      </div>
    </div>
  </section>;
}
