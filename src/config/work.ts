export const workConfig = {
  headingReveal: { startViewport: 0.88, endViewport: 0.62, startOpacity: 0.1, startBlur: 10, startY: 0 },
  projectMotion: { minScale: 0.95, maxScale: 1, minBrightness: 0.42, maxBrightness: 1,
    minOpacity: 0.72, maxOpacity: 1, progressDistance: 0.85, progressEase: "smootherstep" },
  projectOverlay: { minOpacity: 0.56, maxOpacity: 1, maxTranslateY: 7 },
  smoothScroll: { enabled: true, smoothWheel: true, lerp: 0.095, wheelMultiplier: 0.95,
    touchMultiplier: 1, velocityThreshold: 0.05 },
  focus: { stopDelay: 240 },
  rain: { scrollingMultiplier: 1, idleMultiplier: 0.12,
    slowDownDuration: 550, speedUpDuration: 200 },
  media: { width: "84vw", aspectRatio: "1.85 / 1", maxWidth: "1500px", radius: "32px" },
} as const;

export const workCategory = { number: "01", title: "沉浸与交互", subtitle: "Immersive & Interactive" };

export const digitalVisualCategory = {
  number: "02",
  title: "三维与数字视觉",
  subtitle: "3D & Digital Visuals",
};

export const digitalVisualProjects = [
  {
    number: "01",
    title: "Refusing Wholeness",
    software: "BLENDER",
    description: "《Refusing Wholeness》以破碎、半透明的数字身体为核心，将玻璃外壳、金属几何结构与故障失真组合成一个持续失稳的赛博格形象，回应数字视觉文化对女性身体“完整、光滑、可读”的审美规范。",
    mediaType: "video",
    mediaSrc: "/media/work/3d-digital-visuals/refusing-wholeness.mp4",
    posterSrc: "/media/work/3d-digital-visuals/refusing-wholeness-poster.png",
  },
  {
    number: "02",
    title: "Broken Rose",
    software: "BLENDER",
    description: "《Broken Rose》让一朵玫瑰在破碎中逐渐失去完整形态，以动态变化探索故障与不完美如何生成新的数字视觉感受。",
    mediaType: "image-video",
    mediaSrc: "/media/work/3d-digital-visuals/broken-rose.mp4",
    posterSrc: "/media/work/3d-digital-visuals/broken-rose-poster.png",
  },
  {
    number: "03",
    title: "Digital Flower",
    software: "BLENDER",
    description: "《Digital Flower》以数字花卉创作为出发点，通过半透明材质、柔和反光与有机形态，探索自然植物在数字空间中的重新生成与视觉想象。",
    mediaType: "image",
    mediaSrc: "/media/work/3d-digital-visuals/digital-flower.jpg",
  },
] as const;

export const soundMovingImageCategory = {
  number: "03",
  title: "声音与影像叙事",
  subtitle: "Sound & Moving Image Storytelling",
};

export const soundMovingImageProjects = [
  {
    number: "01",
    type: "SOUND",
    title: "She is on her way",
    metadata: "声音叙事作品 · 2025",
    concept: "《She is on her way》关注女性日常生活中的压力如何在不知不觉中累积。脚步象征属于自己的节奏，但随着生活中的声音不断进入，这个节奏逐渐被覆盖。她依然向前走，却越来越难听见自己。",
    designLabel: "叙事与声音设计",
    design: "作品以循环的金属呼吸声作为底层节奏，再逐渐加入脚步、键盘、通知声和人声，让压力一点点累积。当声音变得越来越拥挤，外界也开始侵入原本私密的内部空间。最后，所有声音突然退去，只留下呼吸，让“重新听见自己”成为整个作品的转折。",
    mediaSrc: "/media/work/sound-moving-image/she-is-on-her-way.mp3",
  },
  {
    number: "02",
    type: "DOCUMENTARY",
    recognition: "优秀毕业作品",
    title: "石骨铁硬",
    metadata: "文化纪录片 · 2024",
    concept: "《石骨铁硬》从宁波方言出发，记录方言背后的城市生活、地方文化与传承者故事。从菜场里的日常对话，到甬剧与童谣，作品试图让观众从一座城市的“声音”里，看见它正在被保留的记忆与文化。",
    designLabel: "叙事与影像",
    design: "作品采用跟随记录、人物采访与旁白解说交织的方式，将“宁波话为什么硬、它承载着什么、又如何继续被传承”逐步展开。拍摄中以真实生活场景和人物状态为主，通过镜头、同期声、配音与剪辑共同组织叙事，让原本以语言为核心的主题转化为可以被看见和感受到的故事。",
    mediaSrc: "/media/work/sound-moving-image/stone-bones-iron-hard-preview.mp4",
    fullDocumentaryUrl: "https://pan.baidu.com/s/15dWhG_ojfU-n9AXJtK22RA?pwd=589t",
    fullDocumentaryPlatform: "百度网盘",
    fullDocumentaryCode: "589t",
    fullDocumentaryLabel: "观看完整纪录片",
  },
] as const;

export const projects = [
  { number: "01", title: "Becoming Butterfly",
    tag: "非人类具身沉浸式 VR 体验",
    shortDescription: "一副新的身体，一种新的感知，一个新的世界。",
    metadata: ["独立毕业创作", "Unreal Engine", "2026"],
    videoSrc: "/media/work/becoming-butterfly-preview-short.mp4", posterSrc: undefined,
    detailVideoSrc: "/media/work/becoming-butterfly-detail.mp4",
    detailPosterSrc: "/media/work/becoming-butterfly-full-poster.jpg",
    fullExperienceVideoUrl: "https://pan.baidu.com/s/1rpa7Z3xn-IDm9OmAw1B0PQ?pwd=ccrb",
    fullExperienceVideoPlatform: "百度网盘", fullExperienceVideoCode: "ccrb",
    fullExperienceVideoLabel: "观看完整体验视频",
    slug: "project-01" },
  { number: "02", title: "Dreaming The Peony Pavilion",
    titleLines: ["Dreaming The", "Peony Pavilion"], titleIndentRatio: 0.32, titleZh: "游园惊梦",
    tag: "沉浸式 VR 叙事电影",
    shortDescription: "化作杜丽娘的一缕游魂，穿行于散落的记忆，在触碰与聆听中重新拼起一场牡丹亭之梦。",
    heroIntro: "化作杜丽娘的一缕游魂，穿行于散落的记忆，在触碰与聆听中重新拼起一场牡丹亭之梦。",
    metadata: ["团队项目", "叙事设计 / 声音设计", "Unreal Engine", "2026"],
    videoSrc: "/media/work/dreaming-the-peony-pavilion-preview.mp4",
    posterSrc: "/media/work/dreaming-the-peony-pavilion-poster.jpg",
    detailVideoSrc: "/media/work/dreaming-the-peony-pavilion-detail.mp4",
    detailPosterSrc: "/media/work/dreaming-the-peony-pavilion-detail-poster.jpg",
    fullExperienceVideoUrl: "https://pan.baidu.com/s/1VjTRMLZmAfxraKzkQhkTyQ?pwd=chyp",
    fullExperienceVideoPlatform: "百度网盘", fullExperienceVideoCode: "chyp",
    fullExperienceVideoLabel: "观看完整体验视频",
    slug: "project-02" },
] as const;
