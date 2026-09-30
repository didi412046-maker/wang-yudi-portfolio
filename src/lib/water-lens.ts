type Pointer = { x: number; y: number };
type Glyph = {
  char: string; x: number; y: number; height: number; size: number;
  family: string; weight: string; style: string; color: string;
};

export const WATER_LENS = {
  size: 76, magnification: 1.10, videoEdge: 3, textEdge: 1.8,
} as const;

const smootherstep = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

// A single radial field covers the whole lens. The edge bend is a smooth hump
// that returns to zero at the rim, where the image rejoins the real page.
function makeMap(size: number, dpr: number) {
  const map = new Float32Array(size * size * 4), center = (size - 1) / 2, radius = size / 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const index = (y * size + x) * 4;
    const dx = x - center, dy = y - center, distance = Math.hypot(dx, dy), r = distance / radius;
    if (r > 1) { map[index] = -1; continue; }
    const zoom = 1 + (WATER_LENS.magnification - 1) * (1 - smootherstep(r));
    const edge = Math.sin(Math.PI * Math.max(0, Math.min(1, (r - .7) / .3))) ** 2;
    const ux = distance ? dx / distance : 0, uy = distance ? dy / distance : 0;
    const baseX = center + dx / zoom, baseY = center + dy / zoom;
    map[index] = baseX + ux * WATER_LENS.videoEdge * dpr * edge;
    map[index + 1] = baseY + uy * WATER_LENS.videoEdge * dpr * edge;
    map[index + 2] = baseX + ux * WATER_LENS.textEdge * dpr * edge;
    map[index + 3] = baseY + uy * WATER_LENS.textEdge * dpr * edge;
  }
  return map;
}

function sample(data: Uint8ClampedArray, size: number, x: number, y: number, result: number[]) {
  const px = Math.max(0, Math.min(size - 1, x)), py = Math.max(0, Math.min(size - 1, y));
  const x0 = Math.floor(px), y0 = Math.floor(py), x1 = Math.min(size - 1, x0 + 1), y1 = Math.min(size - 1, y0 + 1);
  const tx = px - x0, ty = py - y0;
  const a = (y0 * size + x0) * 4, b = (y0 * size + x1) * 4;
  const c = (y1 * size + x0) * 4, d = (y1 * size + x1) * 4;
  for (let channel = 0; channel < 4; channel++) {
    result[channel] = (data[a + channel] * (1 - tx) + data[b + channel] * tx) * (1 - ty)
      + (data[c + channel] * (1 - tx) + data[d + channel] * tx) * ty;
  }
}

function collectGlyphs(overlay: HTMLElement): Glyph[] {
  const bounds = overlay.getBoundingClientRect();
  const scaleX = bounds.width / overlay.offsetWidth, scaleY = bounds.height / overlay.offsetHeight;
  const walker = document.createTreeWalker(overlay, NodeFilter.SHOW_TEXT), range = document.createRange();
  const glyphs: Glyph[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || !node.textContent) continue;
    const style = getComputedStyle(parent);
    if (style.display === "none" || style.visibility === "hidden") continue;
    for (let i = 0; i < node.textContent.length; i++) {
      const char = node.textContent[i];
      if (!char.trim()) continue;
      range.setStart(node, i); range.setEnd(node, i + 1);
      const rect = range.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      glyphs.push({ char, x: (rect.left - bounds.left) / scaleX, y: (rect.top - bounds.top) / scaleY,
        height: rect.height / scaleY, size: parseFloat(style.fontSize), family: style.fontFamily,
        weight: style.fontWeight, style: style.fontStyle, color: style.color });
    }
  }
  range.detach();
  return glyphs;
}

export function createWaterLens(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2), size = Math.round(WATER_LENS.size * dpr);
  canvas.width = size; canvas.height = size;
  const context = canvas.getContext("2d")!;
  const videoLayer = document.createElement("canvas"), textLayer = document.createElement("canvas");
  videoLayer.width = textLayer.width = size; videoLayer.height = textLayer.height = size;
  const videoContext = videoLayer.getContext("2d", { willReadFrequently: true })!;
  const textContext = textLayer.getContext("2d", { willReadFrequently: true })!;
  const output = context.createImageData(size, size), map = makeMap(size, dpr);
  const videoPixel = [0, 0, 0, 0], textPixel = [0, 0, 0, 0];
  let cachedOverlay: HTMLElement | null = null, cachedWidth = 0, cachedHeight = 0;
  let cachedEditorialTop = 0, glyphs: Glyph[] = [];

  return (video: HTMLVideoElement | null, overlay: HTMLElement | null, pointer: Pointer | null) => {
    if (!video || !overlay || !pointer) { context.clearRect(0, 0, size, size); return; }
    if (overlay !== cachedOverlay || overlay.offsetWidth !== cachedWidth || overlay.offsetHeight !== cachedHeight) {
      cachedOverlay = overlay; cachedWidth = overlay.offsetWidth; cachedHeight = overlay.offsetHeight;
      glyphs = collectGlyphs(overlay);
      const editorial = overlay.querySelector<HTMLElement>(".project-editorial-overlay");
      const bounds = overlay.getBoundingClientRect();
      cachedEditorialTop = editorial ? (editorial.getBoundingClientRect().top - bounds.top) / (bounds.height / overlay.offsetHeight) : 0;
    }
    videoContext.setTransform(1, 0, 0, 1, 0, 0);
    videoContext.clearRect(0, 0, size, size);
    const card = video.closest<HTMLElement>(".project-window");
    videoContext.fillStyle = card ? getComputedStyle(card).backgroundColor : "#afcfd7";
    videoContext.fillRect(0, 0, size, size);
    if (video.readyState >= 2 && video.videoWidth && video.videoHeight) {
      const rect = video.getBoundingClientRect();
      const cover = Math.max(rect.width / video.videoWidth, rect.height / video.videoHeight);
      const cropX = (video.videoWidth * cover - rect.width) / 2;
      const cropY = (video.videoHeight * cover - rect.height) / 2;
      const sourceSize = WATER_LENS.size / cover;
      const sx = (pointer.x - rect.left + cropX) / cover - sourceSize / 2;
      const sy = (pointer.y - rect.top + cropY) / cover - sourceSize / 2;
      const x0 = Math.max(0, sx), y0 = Math.max(0, sy);
      const x1 = Math.min(video.videoWidth, sx + sourceSize), y1 = Math.min(video.videoHeight, sy + sourceSize);
      if (x1 > x0 && y1 > y0) {
        const style = getComputedStyle(video);
        videoContext.filter = style.filter; videoContext.globalAlpha = parseFloat(style.opacity);
        videoContext.drawImage(video, x0, y0, x1 - x0, y1 - y0,
          (x0 - sx) / sourceSize * size, (y0 - sy) / sourceSize * size,
          (x1 - x0) / sourceSize * size, (y1 - y0) / sourceSize * size);
        videoContext.filter = "none"; videoContext.globalAlpha = 1;
      }
    }

    textContext.setTransform(1, 0, 0, 1, 0, 0);
    textContext.clearRect(0, 0, size, size);
    const rect = overlay.getBoundingClientRect();
    const scaleX = rect.width / overlay.offsetWidth, scaleY = rect.height / overlay.offsetHeight;
    const editorial = overlay.querySelector<HTMLElement>(".project-editorial-overlay");
    const editorialTop = editorial ? (editorial.getBoundingClientRect().top - rect.top) / scaleY : 0;
    const textShiftY = editorialTop - cachedEditorialTop;
    textContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    textContext.globalAlpha = editorial ? parseFloat(getComputedStyle(editorial).opacity) : 1;
    textContext.textBaseline = "alphabetic";
    for (const glyph of glyphs) {
      const fontSize = glyph.size * scaleY;
      const left = rect.left + glyph.x * scaleX - pointer.x + WATER_LENS.size / 2;
      const top = rect.top + (glyph.y + textShiftY) * scaleY - pointer.y + WATER_LENS.size / 2;
      if (left < -fontSize || left > WATER_LENS.size + fontSize || top < -fontSize || top > WATER_LENS.size + fontSize) continue;
      textContext.font = `${glyph.style} ${glyph.weight} ${fontSize}px ${glyph.family}`;
      textContext.fillStyle = glyph.color;
      const metrics = textContext.measureText(glyph.char);
      const height = glyph.height * scaleY;
      const baseline = top + (height + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
      textContext.fillText(glyph.char, left, baseline);
    }
    const dot = editorial?.querySelector<HTMLElement>(".project-editorial-dot");
    if (dot) {
      const r = dot.getBoundingClientRect();
      textContext.fillStyle = getComputedStyle(dot).backgroundColor;
      textContext.beginPath(); textContext.arc(r.left + r.width / 2 - pointer.x + WATER_LENS.size / 2,
        r.top + r.height / 2 - pointer.y + WATER_LENS.size / 2, r.width / 2, 0, Math.PI * 2);
      textContext.fill();
    }
    textContext.globalAlpha = 1;

    const videoData = videoContext.getImageData(0, 0, size, size).data;
    const textData = textContext.getImageData(0, 0, size, size).data;
    for (let i = 0; i < map.length; i += 4) {
      if (map[i] < 0) { output.data[i + 3] = 0; continue; }
      sample(videoData, size, map[i], map[i + 1], videoPixel);
      sample(textData, size, map[i + 2], map[i + 3], textPixel);
      const alpha = textPixel[3] / 255;
      output.data[i] = videoPixel[0] * (1 - alpha) + textPixel[0] * alpha;
      output.data[i + 1] = videoPixel[1] * (1 - alpha) + textPixel[1] * alpha;
      output.data[i + 2] = videoPixel[2] * (1 - alpha) + textPixel[2] * alpha;
      output.data[i + 3] = 255;
    }
    context.putImageData(output, 0, 0);
  };
}
