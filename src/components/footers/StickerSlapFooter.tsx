import React, { useState, useRef, useEffect, useMemo, useId } from "react";
import "./StickerSlapFooter.exact.css";

export const meta = {
  title: "Inzeedo Sticker Slap Footer",
  description: "Playful interactive footer featuring custom draggable physics stickers with tilt velocity, handwritten cursive script wordmark, stamp slap animations, and responsive contact sections.",
  category: 'footers',
  fullWidth: true,
  thumbnail: true,
};

// Math & Utility Helpers
const hash = (b: number) => {
  const O = Math.sin(b * 127.1 + 311.7) * 43758.5453;
  return O - Math.floor(O);
};

const round = (b: number) => Math.round(b * 100) / 100;

const clamp = (val: number, min: number, max: number) =>
  Number.isFinite(val) ? Math.min(max, Math.max(min, val)) : min;

// Cursive font paths dictionary for letters a-z and punctuation
const CHAR_MAP: Record<string, [number, string, string?, number?]> = {
  a: [9.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -3.6C1.8 -1 3 0 4.6 0C6.2 0 7.4 -1.4 7.6 -4L7.6 -9.8L7.6 -3C7.6 -0.8 8.6 -1 10 -1"],
  b: [8.8, "M0 -1C1 -2 1.4 -9.6 2.6 -16.4C3.4 -19.8 1.4 -20 1 -16.4L1 -1.4C1 0 3 0 4.8 0C6.6 0 7.8 -1.8 7.8 -4.6C7.8 -7.4 6.2 -9.4 4.6 -9.4C3 -9.4 1.8 -8 1.4 -6.6L1.4 -7C2.2 -8.6 3.6 -9.4 5 -9.4C6.6 -9.4 7.8 -8.6 8.8 -7.6", "", 1],
  c: [8.6, "M0 -1C1.6 -2 3 -7 4.2 -9.6C3 -9.6 1.4 -7.6 1.4 -4.8C1.4 -2 2.8 0 4.8 0C6.6 0 7.8 -1.2 8.6 -2.4", "", 1],
  d: [9.8, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -3.6C1.8 -1 3 0 4.8 0C6.6 0 7.6 -2 7.6 -5L7.8 -16.4L7.8 -3C7.8 -0.8 8.8 -1 9.8 -1"],
  e: [8.4, "M0 -1C1.4 -1.4 3 -5 4.6 -7C5.6 -6.2 6.6 -5 6.6 -3.6C6.6 -1.2 4.8 0 3.2 0C1.8 0 1 -1 0.8 -2.4C1 -3.8 2.6 -6.8 5.6 -7C6.8 -7 7.6 -5.6 8.4 -4.8", "", 1],
  f: [8.2, "M0 -1C1.6 -3 4.2 -11 4 -16.4C3.8 -19.8 1.6 -19.4 1.6 -16.4L1.6 6C1.6 8.8 3.4 9 4.2 6L4.2 -1C5.2 -1 6.8 -1.6 8.2 -2.6", "M-0.6 -9.6L6.8 -9.6"],
  g: [9.6, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -10L7.8 4.4C7.8 9 5.8 9.6 4.4 9.6C2.2 9.6 1.6 7.6 3 6C4.8 4 7.6 1.6 9.6 -1"],
  h: [9.6, "M0 -1C1 -2 1.4 -9.6 2.6 -16.4C3.4 -19.8 1.4 -20 1 -16.4L1 -1L1 -5.6C1.8 -8.6 3 -10 4.8 -10C6.4 -10 7.2 -9 7.2 -7L7.2 -3C7.2 -0.8 8.2 -1 9.6 -1"],
  i: [5.2, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -3C1.8 -0.8 2.8 -1 4.2 -1C4.6 -1 5 -1.2 5.2 -1.4", "M1.8 -13.2L1.9 -13.3", 1],
  j: [6.4, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 4.4C1.8 9 -0.2 9.6 -1.6 9.6C-3.8 9.6 -4.4 7.6 -3 6C-1.2 4 1.6 1.6 3.8 -1C4.8 -1 5.6 -1.2 6.4 -1.4", "M1.8 -13.2L1.9 -13.3", 1],
  k: [9.6, "M0 -1C1 -2 1.4 -9.6 2.6 -16.4C3.4 -19.8 1.4 -20 1 -16.4L1 -1L1 -5C1.8 -7 3.4 -8 4.8 -8C6.2 -8 7 -7.2 7 -5.6C7 -4 5.8 -3.2 4.2 -3.2L7.6 -1C8.4 -0.6 9 -1 9.6 -1"],
  l: [6.4, "M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 -3.2C1.8 -0.6 4 -1 6.4 -1"],
  m: [14.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -1L1.8 -5.6C2.4 -8.6 3.4 -10 4.8 -10C6.2 -10 7 -9 7 -7L7 -1L7 -5.6C7.6 -8.6 8.6 -10 10 -10C11.4 -10 12.2 -9 12.2 -7L12.2 -3C12.2 -0.8 13.2 -1 14.6 -1"],
  n: [9.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -1L1.8 -5.6C2.4 -8.6 3.4 -10 4.8 -10C6.4 -10 7.2 -9 7.2 -7L7.2 -3C7.2 -0.8 8.2 -1 9.6 -1"],
  o: [9, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5C7.6 -7.8 6.1 -10 4.3 -10C6 -10 7.4 -9.2 9 -9", "", 1],
  p: [9.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 9L1.8 -5.6C2.4 -8.6 3.4 -10 5 -10C7 -10 8.2 -8 8.2 -5C8.2 -2 6.6 0 4.8 0C3.4 0 2.4 -0.6 1.8 -1.6C2.4 -0.6 3.4 0 4.8 0C6.6 0 7.8 -0.8 9.6 -1"],
  q: [10.4, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -10L7.8 9C8.8 6 9 0 10.4 -1"],
  r: [8.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -1L1.8 -5.6C2.6 -8.6 4.2 -10 5.8 -10C6.8 -10 7.6 -9.6 8.2 -8.8", "", 1],
  s: [8.4, "M0 -1C1.6 -2 3 -7 4.4 -10.2C5.6 -8 7.4 -6 7.4 -3.6C7.4 -1.2 5.6 0 3.6 0C2 0 1 -0.6 0.6 -1.6C1 -0.6 2 0 3.6 0C5.6 0 6.8 -0.8 8.4 -1"],
  t: [6.6, "M0 -1C1 -1.4 2.2 -8 2.4 -15L2.4 -3.2C2.4 -0.8 4 -1 6.6 -1", "M-0.8 -9.6L6.2 -9.6"],
  u: [10, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -3.6C1.8 -1 3 0 4.6 0C6.2 0 7.4 -1.4 7.6 -4L7.6 -9.8L7.6 -3C7.6 -0.8 8.6 -1 10 -1"],
  v: [9, "M0 -1C1.2 -1.6 1.6 -6 1.6 -9.6C1.6 -6 2.6 0 4.4 0C6.4 0 7.6 -6 7.6 -9.6C8 -9 8.4 -8.8 9 -8.8", "", 1],
  w: [12.6, "M0 -1C1.2 -1.6 1.6 -6 1.6 -9.6L1.6 -3.6C1.6 -1 2.6 0 4 0C5.4 0 6.2 -1 6.2 -3.6L6.2 -8L6.2 -3.6C6.2 -1 7 0 8.4 0C9.8 0 10.8 -1 10.8 -3.6L10.8 -9.6C11.2 -9 11.8 -8.8 12.6 -8.8", "", 1],
  x: [9, "M0 -1C1.6 -2 2 -8.6 3 -9.6L7 -1C7.6 -0.4 8.4 -1 9 -1", "M7.4 -9.6L2.4 -0.4"],
  y: [9.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -3.6C1.8 -1 3 0 4.6 0C6.2 0 7.4 -1.4 7.6 -4L7.6 -9.8L7.6 4.4C7.6 9 5.6 9.6 4.2 9.6C2 9.6 1.4 7.6 2.8 6C4.6 4 7.4 1.6 9.6 -1"],
  z: [8.8, "M0 -1C1 -2 1.4 -9.6 2.6 -9.6L7.4 -9.6L1.6 -0.2L6 -0.2C7 -0.2 7.8 -1 8.8 -1"],
  "!": [4, "M2 -16L2 -4.4", "M2 -0.6L2.1 -0.7", 1],
  ".": [3.6, "M1.8 -0.6L1.9 -0.7", "", 1],
};

const SCALE_X = 1.22;
const CHAR_SPACING = 1;
const WORD_SPACE = 6;

const placePath = (svgPath: string, offsetX: number, scale = SCALE_X) => {
  let count = 0;
  return svgPath.replace(/-?\d*\.?\d+/g, (m) => (count++ % 2 === 0 ? String(round(+m * scale + offsetX)) : m));
};

const getExtents = (svgPath: string) =>
  (svgPath.match(/-?\d*\.?\d+/g) ?? []).map(Number).filter((_, i) => i % 2 === 1);

interface LayoutBox {
  x0: number;
  x1: number;
  top: number;
}

interface ScriptLayout {
  main: string;
  extra: string[];
  width: number;
  top: number;
  bottom: number;
  boxes: LayoutBox[];
}

const layoutScript = (text: string): ScriptLayout => {
  const norm = String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  let curX = 0;
  let mainPath = "";
  const extraPaths: string[] = [];
  const boxes: LayoutBox[] = [];
  let isStart = true;
  let topMin = 0;
  let bottomMax = 0;

  for (const char of norm) {
    const glyph = CHAR_MAP[char];
    if (!glyph) {
      if (mainPath) curX += WORD_SPACE;
      isStart = true;
      continue;
    }
    const placed = placePath(glyph[1], curX);
    mainPath += isStart ? placed : "L" + placed.slice(1);
    if (glyph[2]) extraPaths.push(placePath(glyph[2], curX));

    const extents = getExtents(glyph[1] + (glyph[2] ?? ""));
    const pMin = Math.min(...extents);
    topMin = Math.min(topMin, pMin);
    bottomMax = Math.max(bottomMax, ...extents);
    boxes.push({ x0: round(curX), x1: round(curX + glyph[0] * SCALE_X), top: pMin });
    isStart = !!glyph[3];
    curX += glyph[0] * SCALE_X + CHAR_SPACING;
  }

  return {
    main: mainPath,
    extra: extraPaths,
    width: boxes.length ? round(curX - CHAR_SPACING) : 0,
    top: topMin,
    bottom: bottomMax,
    boxes,
  };
};

const starPath = (points: number, outerR: number, innerR: number, cx = 0, cy = 0, jitter = 0, seed = 0) => {
  const total = Math.max(3, Math.floor(points) || 3);
  const pts: string[] = [];
  for (let i = 0; i < total * 2; i++) {
    const angle = (i / (total * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? innerR : outerR * (1 + (hash(i * 9.7 + seed) - 0.5) * jitter);
    pts.push(`${round(cx + Math.cos(angle) * r)} ${round(cy + Math.sin(angle) * r)}`);
  }
  return "M" + pts.join("L") + "Z";
};

interface Spot {
  x: number;
  y: number;
  size: number;
  rotate: number;
  depth: number;
}

const stickerSpots = (layout: ScriptLayout, count: number, seed = 0): Spot[] => {
  const n = Math.max(0, Math.floor(count) || 0);
  if (!n || !layout.width) return [];
  return Array.from({ length: n }, (_, i) => {
    const targetX = ((i + 0.5) / n) * layout.width;
    const box = layout.boxes.find((b) => targetX >= b.x0 && targetX <= b.x1 + CHAR_SPACING) ?? layout.boxes[layout.boxes.length - 1];
    const offsetPattern = [1.5, -5, -1, -7, 0.5, -4, -2][i % 7];
    return {
      x: round(targetX + (hash(i * 4.1 + seed) - 0.5) * 3),
      y: round(clamp(box.top + 2.5 + offsetPattern, layout.top - 4, -4)),
      size: round(6.4 + hash(i * 2.3 + seed + 1) * 2.4),
      rotate: round((hash(i * 7.7 + seed + 2) - 0.5) * 34),
      depth: round(0.4 + hash(i * 5.5 + seed + 3) * 0.8),
    };
  });
};

const BURST_PATH = starPath(13, 54, 39, 60, 60, 0.2, 4);
const BOLT_PATH = "M70 8L26 66H55L44 112L94 48H64Z";
const HEART_PATH = "M60 100C22 76 10 56 18 38C26 20 50 18 60 38C70 18 94 20 102 38C110 56 98 76 60 100Z";
const BUBBLE_PATH = "M24 22H96A14 14 0 0 1 110 36V70A14 14 0 0 1 96 84H56L34 102L38 84H24A14 14 0 0 1 10 70V36A14 14 0 0 1 24 22Z";
const SPARKLE_PATH = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`;
const MAP_WAVE_PATH = "M1 5C7 1 11 1 15 4S24 8 29 4S38 0 43 4S52 8 57 4S66 1 71 4S80 7 87 3";

// Sub-component: Cursive Script Text inside Stickers
function ScriptText({
  text,
  cx,
  cy,
  w,
  color,
  stroke = 3.3,
}: {
  text: string;
  cx: number;
  cy: number;
  w: number;
  color: string;
  stroke?: number;
}) {
  const { main, extra, width, top } = useMemo(() => layoutScript(text), [text]);
  if (!width) return null;
  const scale = w / (width + stroke);
  const offsetY = (-top + 1) * scale;
  return (
    <g transform={`translate(${round(cx - (width * scale) / 2)} ${round(cy + offsetY / 2 - scale)}) scale(${round(scale)})`}>
      <path d={main + extra.join("")} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

// Sticker Art & Shape Definitions
function getStickerArt(kind: string, text?: string): { shape: React.ReactNode; art: React.ReactNode } {
  switch (kind) {
    case "burst":
      return {
        shape: <path d={BURST_PATH} />,
        art: (
          <>
            <path d={BURST_PATH} fill="#ff6a2b" />
            <path d={starPath(13, 44, 33, 60, 60, 0.2, 4)} fill="#ff8a4c" />
            <ScriptText text={text ?? "inzeedo"} cx={60} cy={58} w={62} color="#1b1230" stroke={3.4} />
          </>
        ),
      };
    case "smiley":
      return {
        shape: <circle cx="60" cy="60" r="50" />,
        art: (
          <>
            <circle cx="60" cy="60" r="50" fill="#9ab8ff" />
            <circle cx="60" cy="60" r="40" fill="none" stroke="#fff" strokeWidth="3" opacity=".9" />
            <ellipse cx="47" cy="50" rx="4" ry="7.5" fill="#fff" />
            <ellipse cx="73" cy="50" rx="4" ry="7.5" fill="#fff" />
            <path d="M36 66Q60 92 84 66M32 63L39 69M88 63L81 69" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
          </>
        ),
      };
    case "heart":
      return {
        shape: (
          <>
            <path d={HEART_PATH} />
            <path d={SPARKLE_PATH(100, 20, 14)} />
            <path d={SPARKLE_PATH(18, 92, 10)} />
          </>
        ),
        art: (
          <>
            <path d={HEART_PATH} fill="#b0245e" />
            <path d="M30 42Q32 30 45 29" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" opacity=".9" />
            <path d={SPARKLE_PATH(100, 20, 14)} fill="#ffd0e3" />
            <path d={SPARKLE_PATH(18, 92, 10)} fill="#ffd0e3" />
          </>
        ),
      };
    case "bubble":
      return {
        shape: <path d={BUBBLE_PATH} />,
        art: (
          <>
            <path d={BUBBLE_PATH} fill="#ffb6e1" />
            <ScriptText text={text ?? "hello!"} cx={60} cy={53} w={text ? 76 : 44} color="#8a1550" stroke={3.6} />
          </>
        ),
      };
    case "daisy": {
      const petals = Array.from({ length: 9 }, (_, i) => (
        <ellipse key={i} cx="60" cy="31" rx="13" ry="22" transform={`rotate(${i * 40} 60 60)`} />
      ));
      return {
        shape: <>{petals}</>,
        art: (
          <>
            <g fill="#ffd23f">{petals}</g>
            <circle cx="60" cy="60" r="19" fill="#ff6a2b" />
            <circle cx="53.5" cy="57" r="2.6" fill="#1b1230" />
            <circle cx="66.5" cy="57" r="2.6" fill="#1b1230" />
            <path d="M53 65Q60 71 67 65" fill="none" stroke="#1b1230" strokeWidth="3" strokeLinecap="round" />
          </>
        ),
      };
    }
    case "camera":
      return {
        shape: (
          <>
            <rect x="12" y="36" width="96" height="66" rx="16" />
            <rect x="38" y="24" width="36" height="20" rx="6" />
          </>
        ),
        art: (
          <>
            <rect x="12" y="36" width="96" height="66" rx="16" fill="#1d1c22" />
            <rect x="38" y="24" width="36" height="20" rx="6" fill="#1d1c22" />
            <circle cx="60" cy="70" r="24" fill="#fff" />
            <circle cx="60" cy="70" r="17" fill="#1d1c22" />
            <circle cx="60" cy="70" r="11" fill="#5b7cff" />
            <circle cx="55" cy="65" r="4" fill="#fff" />
            <rect x="86" y="46" width="12" height="7" rx="3" fill="#ffd23f" />
            <path d="M22 50H30" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".5" />
          </>
        ),
      };
    case "bolt":
    default:
      return {
        shape: <path d={BOLT_PATH} />,
        art: (
          <>
            <path d={BOLT_PATH} fill="#ffd23f" />
            <path d="M66 20L38 58" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".75" />
          </>
        ),
      };
  }
}

// Sticker SVG with die-cut vinyl white border and animated sheen reflection
function StickerSvg({ kind, text }: { kind: string; text?: string }) {
  const uid = "ssf" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const { shape, art } = getStickerArt(kind, text);
  return (
    <svg viewBox="-6 -6 132 132" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={uid + "c"}>{shape}</clipPath>
        <linearGradient id={uid + "g"} x1="0" x2="1" y1="0" y2="0">
          <stop offset=".35" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".65" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill="#fff" stroke="#fff" strokeWidth="11" strokeLinejoin="round">
        {shape}
      </g>
      {art}
      <g clipPath={`url(#${uid}c)`}>
        <g transform="rotate(20 60 60)">
          <rect className="ssf-sheen" x="-30" y="-30" width="180" height="180" fill={`url(#${uid}g)`} />
        </g>
      </g>
    </svg>
  );
}

// Social icon SVGs
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <path d="M8 10.5V16.5M12 16.5V10.5M12 13.2C12 11.6 13.1 10.4 14.6 10.4C16.1 10.4 17 11.4 17 13.1V16.5" />
      <path className="ssf-dot" d="M8 7.4L8 7.5" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5.2" />
      <circle cx="12" cy="12" r="3.8" />
      <path className="ssf-dot" d="M16.9 7.1L16.9 7.2" />
    </>
  ),
  tiktok: <path d="M13.6 4V15A3.3 3.3 0 1 1 10.3 11.7M13.6 4C14 6.6 15.8 8.2 18.4 8.4" />,
  x: <path d="M5 4.5H8.8L19 19.5H15.2ZM18.6 4.5L13.3 10.5M5.4 19.5L10.7 13.5" />,
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12.4" rx="4" />
      <path d="M10.4 9.6L14.6 12.2L10.4 14.8Z" />
    </>
  ),
  dribbble: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M7.4 4.9C11 9 13.6 14 15 20.2M3.6 10.6C9 11 14 9.6 18 6.2M5.6 17.6C8.6 14 13 12.6 20.4 13.4" />
    </>
  ),
  github: (
    <>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </>
  ),
};

const STICKER_LABELS: Record<string, string> = {
  burst: "Inzeedo Wow burst sticker",
  smiley: "Smiley sticker",
  heart: "Heart sticker",
  bubble: "Speech bubble sticker",
  daisy: "Daisy sticker",
  camera: "Camera sticker",
  bolt: "Lightning bolt sticker",
};

// Default Inzeedo Branding Configurations
const DEFAULT_JOBS = [
  { title: "Senior Creative Technologist", href: "https://inzeedo.lk/careers" },
  { title: "Frontend Motion Engineer", href: "https://inzeedo.lk/careers" },
];

const DEFAULT_SOCIALS = [
  { kind: "linkedin", href: "https://linkedin.com/company/inzeedo" },
  { kind: "instagram", href: "https://instagram.com/inzeedo" },
  { kind: "github", href: "https://github.com/inzeedo" },
];

const DEFAULT_STICKERS = ["burst", "smiley", "heart", "daisy", "bubble", "camera"];

const DEFAULT_CREDITS = [
  { role: "design & code", name: "Inzeedo Studio" },
  { role: "stickers", name: "drawn in code, peel freely" },
  { role: "type", name: "a felt-tip and your system font" },
];

export interface StickerSlapFooterProps {
  wordmark?: string;
  homeHref?: string;
  navLabel?: string;
  navHref?: string;
  chatHref?: string;
  chatLabel?: string;
  jobsLabel?: string;
  jobs?: { title: string; href?: string }[];
  officeLabel?: string;
  address?: string[];
  mapLabel?: string;
  mapHref?: string;
  contactLabel?: string;
  email?: string;
  copiedLabel?: string;
  note?: string;
  socials?: { kind: string; href?: string; label?: string }[];
  stickers?: (string | { kind: string; text?: string; label?: string; x?: number; y?: number; size?: number; rotate?: number; node?: React.ReactNode })[];
  credits?: { role: string; name: string }[];
  height?: string;
  wordmarkMaxHeight?: string;
  paper?: string;
  panel?: string;
  ink?: string;
  cream?: string;
  accent?: string;
  fontSans?: string;
  onStickerMove?: (index: number, x: number, y: number) => void;
  className?: string;
}

export function StickerSlapFooter({
  wordmark = "inzeedo",
  homeHref = "https://inzeedo.lk",
  navLabel = "work",
  navHref = "https://inzeedo.lk",
  chatHref = "https://inzeedo.lk/contact",
  chatLabel = "send us a note",
  jobsLabel = "looking to build with us?",
  jobs = DEFAULT_JOBS,
  officeLabel = "studio",
  address = ["Level 18, West Tower", "World Trade Center, Colombo 01"],
  mapLabel = "Google Maps",
  mapHref = "https://maps.google.com/?q=World+Trade+Center+Colombo",
  contactLabel = "contact",
  email = "hello@inzeedo.lk",
  copiedLabel = "copied, talk soon!",
  note = "*phone calls give us the jitters. emails and quick briefs are lovely.",
  socials = DEFAULT_SOCIALS,
  stickers = DEFAULT_STICKERS,
  credits = DEFAULT_CREDITS,
  height = "100svh",
  wordmarkMaxHeight = "50svh",
  paper = "#f1ece4",
  panel = "#4a6cf0",
  ink = "#141414",
  cream,
  accent = "#ff6a2b",
  fontSans = "'DM Sans', 'Manrope', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  onStickerMove,
  className = "",
}: StickerSlapFooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const creditsRef = useRef<HTMLDivElement>(null);

  const [isInView, setIsInView] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [copiedCount, setCopiedCount] = useState(0);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [stickerPositions, setStickerPositions] = useState<Record<number, { x: number; y: number }>>({});
  const [stackOrder, setStackOrder] = useState<number[]>([]);

  const dragSession = useRef<{
    i: number;
    id: number;
    sx: number;
    sy: number;
    px: number;
    py: number;
    lx: number;
    t: number;
    tilt: number;
    w: number;
    h: number;
    went: boolean;
  } | null>(null);

  const strokeWidth = 3.3;
  const layout = useMemo(() => layoutScript(wordmark), [wordmark]);
  const strokePadding = strokeWidth / 2 + 0.6;
  const skewXOffset = -1.4 - strokePadding;
  const topPadding = layout.top - strokePadding;
  const viewWidth = Math.max(layout.width, 1) + 2.8 + strokePadding * 2 - layout.top * 0.1584;
  const viewHeight = layout.bottom + strokePadding - topPadding;
  const baselineOffset = -1.2 - topPadding;

  const logoViewBox = [
    -strokePadding - 1,
    layout.top - strokePadding,
    Math.max(layout.width, 1) + strokePadding * 2 + 2 - layout.top * 0.1584,
    -layout.top + strokePadding * 2 + 1,
  ]
    .map(round)
    .join(" ");

  const defaultSpots = useMemo(() => stickerSpots(layout, stickers.length, 3), [layout, stickers.length]);
  const drawDuration = clamp(0.7 + layout.width / 45, 1.1, 2.6);
  const startDelay = 1.05;

  const toPercent = (pt: { x: number; y: number }) => ({
    x: ((pt.x - pt.y * 0.1584 - skewXOffset) / viewWidth) * 100,
    y: ((pt.y - topPadding) / viewHeight) * 100,
  });

  const parsedStickers = stickers.map((item, idx) => {
    const obj = typeof item === "string" ? { kind: item } : item;
    const spot = defaultSpots[idx] ?? { x: 0, y: 0, size: 11, rotate: 0, depth: 1 };
    const pct = toPercent(spot);
    const home = { x: obj.x ?? pct.x, y: obj.y ?? pct.y };
    const prog = clamp((home.x / 100) * viewWidth + skewXOffset, 0, layout.width) / Math.max(layout.width, 1);

    return {
      i: idx,
      kind: obj.kind ?? "burst",
      node: (obj as { node?: React.ReactNode }).node,
      text: (obj as { text?: string }).text,
      label: obj.label ?? STICKER_LABELS[obj.kind ?? "burst"],
      home,
      at: stickerPositions[idx] ?? home,
      size: obj.size ?? (spot.size / viewWidth) * 100,
      rotate: obj.rotate ?? spot.rotate,
      depth: spot.depth,
      delay: startDelay + drawDuration * Math.pow(prog, 0.92) + 0.08,
    };
  });

  const creditsDelay = startDelay + drawDuration + layout.extra.length * 0.16 + 0.5;

  // Set path stroke dash lengths for draw-in SVG animations
  useEffect(() => {
    const el = footerRef.current;
    el?.querySelectorAll("path[data-draw]").forEach((p) => {
      (p as SVGPathElement).style.setProperty(
        "--l",
        Math.ceil((p as SVGPathElement).getTotalLength()) + 1 + "px"
      );
    });
  }, [wordmark, replayKey]);

  // Intersection observer for entering viewport
  useEffect(() => {
    const el = footerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setIsInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Scroll effect on panel border curvature and compression
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    let rafId = 0;
    const update = () => {
      rafId = 0;
      const r = el.getBoundingClientRect();
      const vh = document.documentElement.clientHeight || r.height;
      const maxH = Math.min(r.height, vh) || 1;
      const progress = clamp((vh - r.top) / maxH, 0, 1);
      el.style.setProperty("--ssf-sp", (1 - Math.pow(1 - progress, 2)).toFixed(4));
    };
    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Copied indicator timeout
  useEffect(() => {
    if (!copiedCount) return;
    const timer = window.setTimeout(() => setCopiedCount(0), 2200);
    return () => clearTimeout(timer);
  }, [copiedCount]);

  // Click outside to close credits popup
  useEffect(() => {
    if (!creditsOpen) return;
    const onDown = (e: PointerEvent) => {
      if (creditsRef.current && !creditsRef.current.contains(e.target as Node)) {
        setCreditsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCreditsOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [creditsOpen]);

  const copyEmail = async () => {
    if (email) {
      try {
        await navigator.clipboard.writeText(email);
        setCopiedCount((c) => c + 1);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    }
  };

  const raiseSticker = (idx: number) => {
    setStackOrder((prev) => [...prev.filter((i) => i !== idx), idx]);
  };

  const putStickerAt = (idx: number, pt: { x: number; y: number }, emit = true) => {
    setStickerPositions((prev) => ({ ...prev, [idx]: pt }));
    if (emit) onStickerMove?.(idx, round(pt.x), round(pt.y));
  };

  const wiggleSticker = (el: HTMLElement | null, frames: Keyframe[], dur: number) => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    el?.animate?.(frames, { duration: dur, easing: "cubic-bezier(.3,1.4,.4,1)" });
  };

  const DROP_FRAMES: Keyframe[] = [
    { transform: "scale(1.14)" },
    { transform: "scale(.93, 1.04)", offset: 0.4 },
    { transform: "scale(1.02, .98)", offset: 0.7 },
    { transform: "none" },
  ];

  const CLICK_FRAMES: Keyframe[] = [
    { transform: "none" },
    { transform: "rotate(-14deg) scale(1.1)", offset: 0.3 },
    { transform: "rotate(9deg)", offset: 0.6 },
    { transform: "none" },
  ];

  const onStickerDown = (e: React.PointerEvent<HTMLButtonElement>, idx: number) => {
    if (e.button !== 0 || !stageRef.current) return;
    const stageBounds = stageRef.current.getBoundingClientRect();
    const current = parsedStickers[idx].at;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const currentTime = e.timeStamp;
    dragSession.current = {
      i: idx,
      id: e.pointerId,
      sx: current.x,
      sy: current.y,
      px: e.clientX,
      py: e.clientY,
      lx: e.clientX,
      t: currentTime,
      tilt: 0,
      w: stageBounds.width,
      h: stageBounds.height,
      went: false,
    };
    raiseSticker(idx);
  };

  const onStickerMovePointer = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = dragSession.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.px;
    const dy = e.clientY - s.py;
    if (!s.went && Math.hypot(dx, dy) < 4) return;
    const parent = (e.currentTarget as HTMLElement).parentElement;
    if (!parent) return;

    if (!s.went) parent.classList.add("is-drag");
    s.went = true;

    const nextX = clamp(s.sx + (dx / s.w) * 100, 1, 99);
    const nextY = clamp(s.sy + (dy / s.h) * 100, -70, 96);
    parent.style.left = `${nextX}%`;
    parent.style.top = `${nextY}%`;

    const now = e.timeStamp;
    const speed = (e.clientX - s.lx) / Math.max(1, now - s.t);
    s.tilt = s.tilt * 0.75 + clamp(speed * 22, -24, 24) * 0.25;
    s.lx = e.clientX;
    s.t = now;
    parent.style.setProperty("--tilt", `${s.tilt.toFixed(2)}deg`);
  };

  const onStickerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = dragSession.current;
    if (!s || s.id !== e.pointerId) return;
    dragSession.current = null;
    const parent = (e.currentTarget as HTMLElement).parentElement;
    parent?.classList.remove("is-drag");
    parent?.style.setProperty("--tilt", "0deg");
    const liftEl = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(".ssf-st-lift");

    if (s.went && parent) {
      putStickerAt(s.i, {
        x: parseFloat(parent.style.left),
        y: parseFloat(parent.style.top),
      });
      wiggleSticker(liftEl, DROP_FRAMES, 420);
    } else {
      wiggleSticker(liftEl, CLICK_FRAMES, 520);
    }
  };

  const onStickerKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const step = e.shiftKey ? 6 : 2;
    const current = parsedStickers[idx].at;
    const deltaMap: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };

    if (deltaMap[e.key]) {
      e.preventDefault();
      raiseSticker(idx);
      putStickerAt(idx, {
        x: clamp(current.x + deltaMap[e.key][0], 1, 99),
        y: clamp(current.y + deltaMap[e.key][1], -70, 96),
      });
    } else if (e.key === "Home" || e.key === "Escape") {
      e.preventDefault();
      resetStickerHome(idx, e.currentTarget);
    }
  };

  const resetStickerHome = (idx: number, btn: HTMLElement) => {
    setStickerPositions((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
    onStickerMove?.(idx, round(parsedStickers[idx].home.x), round(parsedStickers[idx].home.y));
    wiggleSticker(btn.querySelector<HTMLElement>(".ssf-st-lift"), DROP_FRAMES, 420);
  };

  const replay = () => {
    setStickerPositions({});
    setReplayKey((k) => k + 1);
  };

  const onPointerParallax = (e: React.PointerEvent) => {
    const el = footerRef.current;
    if (!el || e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    el.style.setProperty("--ssf-px", (((e.clientX - rect.left) / rect.width - 0.5) * 2).toFixed(3));
    el.style.setProperty("--ssf-py", (((e.clientY - rect.top) / rect.height - 0.5) * 2).toFixed(3));
  };

  const onPointerLeaveParallax = () => {
    footerRef.current?.style.setProperty("--ssf-px", "0");
    footerRef.current?.style.setProperty("--ssf-py", "0");
  };

  const externalProps = (href?: string) =>
    /^https?:/.test(href || "") ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <footer
      ref={footerRef}
      className={`ssf${isInView ? " is-in" : ""}${className ? " " + className : ""}`}
      style={
        {
          "--ssf-paper": paper,
          "--ssf-panel": panel,
          "--ssf-ink": ink,
          "--ssf-cream": cream ?? paper,
          "--ssf-accent": accent,
          "--ssf-sans": fontSans,
          "--ssf-wmh": wordmarkMaxHeight,
          "--ssf-ar": String(round(viewWidth / baselineOffset)),
          minHeight: height,
        } as React.CSSProperties
      }
      onPointerMove={onPointerParallax}
      onPointerLeave={onPointerLeaveParallax}
    >
      {/* Top Header Bar */}
      <div className="ssf-top">
        {navLabel ? (
          <a className="ssf-nav" href={navHref} {...externalProps(navHref)}>
            <svg viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
              <path d={starPath(11, 48, 30, 0, 0, 0.3, 7)} fill="currentColor" />
            </svg>
            <span>{navLabel}</span>
          </a>
        ) : (
          <span />
        )}

        {/* Small Logo Mark in Header */}
        <a className="ssf-logo" href={homeHref} aria-label={`${wordmark}, home`} {...externalProps(homeHref)}>
          <svg viewBox={logoViewBox} aria-hidden="true" focusable="false">
            <path d={layout.main + layout.extra.join("")} data-draw="" transform="skewX(-9)" />
          </svg>
        </a>

        {chatHref ? (
          <a className="ssf-chat" href={chatHref} aria-label={chatLabel || "Message us"} {...externalProps(chatHref)}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 2.6A9.4 9.4 0 0 0 3.9 16.8L2.7 21.3L7.3 20.1A9.4 9.4 0 1 0 12 2.6Z" fill="currentColor" />
              <path
                d="M8.6 7.6C9.2 7.2 9.7 7.4 10 8L10.6 9.5C10.8 10 10.5 10.4 10.1 10.8C10.8 12.2 11.8 13.2 13.2 13.9C13.6 13.5 14 13.2 14.5 13.4L16 14C16.6 14.3 16.8 14.8 16.4 15.4C15.7 16.4 14.6 16.8 13.4 16.3C10.6 15.2 8.8 13.4 7.7 10.6C7.2 9.4 7.6 8.3 8.6 7.6Z"
                fill="var(--ssf-paper)"
              />
            </svg>
          </a>
        ) : (
          <span />
        )}
      </div>

      {/* Main Curved Colored Panel */}
      <div className="ssf-panel">
        <div className="ssf-cols" style={{ "--ssf-n": 3 } as React.CSSProperties}>
          {/* Column 1: Jobs & Careers */}
          {jobs.length > 0 && (
            <div className="ssf-col" style={{ "--c": 0 } as React.CSSProperties}>
              <h3 className="ssf-tag">{jobsLabel}</h3>
              <ul className="ssf-big">
                {jobs.map((job, idx) => (
                  <li key={idx} className="ssf-line" style={{ "--i": idx } as React.CSSProperties}>
                    {job.href ? (
                      <a href={job.href} {...externalProps(job.href)}>
                        {job.title}
                      </a>
                    ) : (
                      <span>{job.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 2: Studio Address & Map */}
          {address.length > 0 && (
            <div className="ssf-col" style={{ "--c": 1 } as React.CSSProperties}>
              <h3 className="ssf-tag">{officeLabel}</h3>
              <address className="ssf-big" style={{ fontStyle: "normal" }}>
                {address.map((line, idx) => (
                  <span key={idx} className="ssf-line" style={{ "--i": idx } as React.CSSProperties}>
                    <span>{line}</span>
                  </span>
                ))}
              </address>
              {mapLabel && (
                <a className="ssf-map" href={mapHref} {...externalProps(mapHref)}>
                  {mapLabel}
                  <svg viewBox="0 0 88 8" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <path d={MAP_WAVE_PATH} data-draw="" />
                  </svg>
                </a>
              )}
            </div>
          )}

          {/* Column 3: Contact, Email & Socials */}
          <div className="ssf-col" style={{ "--c": 2 } as React.CSSProperties}>
            <h3 className="ssf-tag">{contactLabel}</h3>
            <ul className="ssf-big">
              {email && (
                <li className="ssf-line" style={{ "--i": 0 } as React.CSSProperties}>
                  <button
                    type="button"
                    className={`ssf-copy${copiedCount ? " is-copied" : ""}`}
                    onClick={copyEmail}
                    title="Copy email address"
                  >
                    <span className="ssf-addr">{email}</span>
                    <span className="ssf-done" aria-hidden="true">
                      {copiedLabel}
                    </span>
                  </button>
                </li>
              )}
              {chatHref && chatLabel && (
                <li className="ssf-line" style={{ "--i": 1 } as React.CSSProperties}>
                  <a href={chatHref} {...externalProps(chatHref)}>
                    {chatLabel}
                    {note && <span className="ssf-ast">*</span>}
                  </a>
                </li>
              )}
            </ul>

            {note && <p className="ssf-note">{note}</p>}

            {socials.length > 0 && (
              <ul className="ssf-socials">
                {socials.map((soc, idx) => (
                  <li key={idx}>
                    <a
                      className="ssf-soc"
                      href={soc.href}
                      aria-label={soc.label ?? soc.kind}
                      style={{ "--i": idx } as React.CSSProperties}
                      {...externalProps(soc.href)}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        {SOCIAL_ICONS[soc.kind] ?? SOCIAL_ICONS.github}
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <span className="ssf-sr" role="status">
              {copiedCount ? "Email address copied" : ""}
            </span>
          </div>
        </div>

        {/* Big Wordmark & Interactive Sticker Stage */}
        <div className="ssf-stage">
          <div
            ref={stageRef}
            className="ssf-stage-in"
            style={{ marginBottom: `${round(-((viewHeight - baselineOffset) / viewWidth) * 100)}%` }}
          >
            {/* Clickable Wordmark to replay animation */}
            <button
              type="button"
              className="ssf-wm-btn"
              onClick={replay}
              aria-label={`Write ${wordmark} again`}
            >
              <svg
                key={replayKey}
                className="ssf-wm"
                viewBox={[skewXOffset, topPadding, viewWidth, viewHeight].map(round).join(" ")}
                aria-hidden="true"
                focusable="false"
              >
                <g transform="skewX(-9)">
                  <path
                    d={layout.main}
                    data-draw=""
                    style={
                      {
                        "--dur": `${drawDuration}s`,
                        "--at": `${startDelay}s`,
                      } as React.CSSProperties
                    }
                  />
                  {layout.extra.map((extraPath, idx) => (
                    <path
                      key={idx}
                      d={extraPath}
                      data-draw=""
                      style={
                        {
                          "--dur": ".28s",
                          "--at": `${round(startDelay + drawDuration + idx * 0.16)}s`,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </g>
              </svg>
            </button>

            {/* Draggable Stickers Slapped Onto the Wordmark */}
            {parsedStickers.map((item) => (
              <div
                key={item.i}
                className="ssf-st"
                style={
                  {
                    left: `${item.at.x}%`,
                    top: `${item.at.y}%`,
                    width: `max(${round(item.size)}cqw, 46px)`,
                    zIndex: 3 + Math.max(0, stackOrder.indexOf(item.i) + 1),
                    "--r": `${item.rotate}deg`,
                    "--d": item.depth,
                    "--at": `${round(item.delay)}s`,
                  } as React.CSSProperties
                }
              >
                <button
                  type="button"
                  className="ssf-st-btn"
                  aria-label={`${item.label}. Drag, or use the arrow keys, to move it. Escape puts it back.`}
                  onPointerDown={(e) => onStickerDown(e, item.i)}
                  onPointerMove={onStickerMovePointer}
                  onPointerUp={onStickerUp}
                  onPointerCancel={onStickerUp}
                  onDoubleClick={(e) => resetStickerHome(item.i, e.currentTarget)}
                  onKeyDown={(e) => onStickerKey(e, item.i)}
                >
                  <span className="ssf-st-slap" key={replayKey}>
                    <span className="ssf-st-lift">
                      {item.node ?? <StickerSvg kind={item.kind} text={item.text} />}
                    </span>
                  </span>
                </button>
                <span className="ssf-ring" aria-hidden="true" key={"r" + replayKey} />
              </div>
            ))}
          </div>
        </div>

        {/* Credits Pill & Popover */}
        {credits.length > 0 && (
          <div ref={creditsRef} className="ssf-credits">
            {creditsOpen && (
              <ul className="ssf-pop">
                {credits.map((c, idx) => (
                  <li key={idx}>
                    <b>{c.role}</b>
                    <strong>{c.name}</strong>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="ssf-pill"
              aria-expanded={creditsOpen}
              onClick={() => setCreditsOpen((v) => !v)}
              style={{ "--end": `${round(creditsDelay)}s` } as React.CSSProperties}
            >
              credits
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}

export default StickerSlapFooter;
