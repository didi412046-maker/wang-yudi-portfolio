/** All art-direction values live here. Positions are viewport percentages. */
export const visual = {
  background: "#fbfdfc",
  text: {
    colour: "#344f58", mutedColour: "#567079", opacity: 0.9, fontWeight: 400,
    fontSize: {
      identity: "clamp(38px, 3vw, 54px)", portfolio: "clamp(13px, 1vw, 17px)",
      education: "clamp(15px, 1.2vw, 20px)", practice: "clamp(20px, 1.7vw, 28px)",
      practiceEnglish: "clamp(12px, 1vw, 16px)", scrollHint: "clamp(12px, .9vw, 14px)",
    },
  },
  curtain: {
    lineCount: 240, referenceWidth: 1440,
    lineColor: "53, 133, 145", lineWidth: [0.45, 0.8], lineOpacity: [0.18, 0.4],
    // Lengths are viewport-height ratios; only point 0 is anchored.
    minLength: 0.8, maxLength: 1.1,
    shortLineRatio: 0.18, shortMinLength: 0.6, shortMaxLength: 0.8,
    segmentsPerStrand: 16, gravity: 2400,
    damping: 0.96, constraintIterations: 6, segmentStiffness: 0.98,
    individualVariation: 0.08,
    umbrellaCollisionPadding: 2, umbrellaDragTransfer: 0.16,
    collisionPushStrength: 1, contactFriction: 0.12,
    canopySegments: 12, collisionSampleSpacing: 8,
    maxStep: 1 / 100, maxMotionSubsteps: 12, maxDragSpeed: 1600, maxPointSpeed: 280,
    transition: { enabled: true, maxTailVh: 32, fadeTailRatio: 0.12, minEligibleLength: 1.04 },
  },
  beads: {
    count: 525, referenceArea: 1440 * 900, maxCount: 900, minCount: 138,
    minSize: 4.4, maxSize: 10.8, minSpeed: 184, maxSpeed: 380,
    opacityMin: 0.46, opacityMax: 0.85, horizontalDrift: 7,
    colorPalette: ["#277cb6", "#48b7ce", "#38b8a9", "#7ad2c8", "#4d88be"],
    foregroundRatio: 0.2,
    gravity: 180, slideSpeed: 110, edgeKick: 38,
    // Preserve V2's edge-release impulse independently of free-fall speed.
    edgeReleaseSpeed: [41.4, 85.5],
  },
  depth: {
    curtain: {
      farRatio: 0.25, midRatio: 0.5, frontRatio: 0.25,
      farOpacity: [0.08, 0.14], midOpacity: [0.15, 0.22], frontOpacity: [0.24, 0.34],
      farWidth: [0.5, 0.7], midWidth: [0.7, 1], frontWidth: [1, 1.3], frontBlur: 0,
    },
    beads: {
      farRatio: 0.25, midRatio: 0.62, nearRatio: 0.13,
      farSizeScale: [0.5, 0.75], midSizeScale: [0.9, 1.1], nearSizeScale: [1.3, 1.8],
      farSpeedScale: [0.6, 0.75], midSpeedScale: [0.95, 1.05], nearSpeedScale: [1.2, 1.5],
      farOpacity: [0.2, 0.4], midOpacity: [0.85, 1], nearOpacity: [0.95, 1.1],
      farBlur: 0, midBlur: 0, nearBlur: [0, 0],
    },
  },
  umbrella: {
    color: "#0066af", lightColor: "#087ec2", darkColor: "#00599b", ribColor: "#98cde1",
    canopyWidth: 242, responsiveWidth: 0.168, minWidth: 172, maxWidth: 284,
    tipY: 14, canopyHeight: 58, closedRise: 105, closedHalfWidth: 12,
    shaftEnd: 133, scale: 1, openAnimationDuration: 550, fadeDuration: 140,
    collisionRadius: 1, collisionStrength: 1,
    initialPosition: { x: 56, y: 47 },
  },
  cursor: { size: 11, color: "#1b91bf", opacity: 0.9, smoothing: 0 },
  layers: {
    farCurtain: 0, farBeads: 0, information: 1, midCurtain: 2, midBeads: 3,
    frontCurtain: 4, nearBeads: 4, umbrella: 5, cursor: 9, navigation: 10, notice: 11,
  },
  performance: { maxDpr: 2, maxFrameDelta: 1 / 30, metricsWindowFrames: 120 },
} as const;

export type Destination = "work" | "about" | "contact";
// Optical depth only. Disabling restores stable text contrast; physics stays untouched.
export const textDepth = {
  enabled: true,
  opacity: 0.82,
  colour: visual.text.colour,
  mutedColour: visual.text.mutedColour,
  blur: 0,
} as const;

export const navigation: { id: Destination; label: string }[] = [
  { id: "work", label: "WORK" }, { id: "about", label: "ABOUT" }, { id: "contact", label: "CONTACT" },
];

export const heroInfo = {
  identity: { name: "王雨迪", portfolio: "PORTFOLIO 2026", left: "12.5vw", top: "41vh" },
  education: {
    undergraduate: "浙江传媒学院 · 播音与主持艺术",
    postgraduate: [
      { text: "南安普顿大学 ", supplementary: false },
      { text: "/ University of Southampton", supplementary: true },
      { text: " · 数字媒体硕士", supplementary: false },
    ],
    right: "10.5vw", top: "59vh",
  },
  practice: { cn: "XR · 空间媒体 · 交互叙事", en: "Interactive & Immersive Experience Design", left: "45.5vw", top: "24vh" },
  scrollHint: "SCROLL TO EXPLORE ↓",
} as const;

export const prototypeMessages: Record<Destination, string> = {
  work: "Selected works — coming in the next chapter.",
  about: "About — coming in the next chapter.",
  contact: "Contact — coming in the next chapter.",
};
