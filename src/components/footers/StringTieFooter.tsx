import React, { useState, useRef, useEffect, useCallback, useId } from "react";
import "./StringTieFooter.exact.css";

export const meta = {
  title: "Inzeedo String Tie Envelope Footer",
  description: "Tactile envelope closure with dual eyelet washer discs, physically simulated string tie unwrap interaction, and tucked letter reveal.",
  category: 'footers',
  fullWidth: true,
  thumbnail: true,
};

// Math & Physics Utilities
const round = (o: number) => Math.round(o * 100) / 100;
const clamp01 = (o: number) => (o > 0 ? (o < 1 ? o : 1) : 0);
const hash = (o: number) => {
  const O = Math.sin(o * 127.1 + 311.7) * 43758.5453;
  return O - Math.floor(O);
};

interface Point {
  x: number;
  y: number;
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const polyLength = (o: Point[]) => {
  let O = 0;
  for (let N = 1; N < o.length; N++) {
    O += Math.hypot(o[N].x - o[N - 1].x, o[N].y - o[N - 1].y);
  }
  return O;
};

const resample = (o: Point[], O: number): Point[] => {
  const N = Math.max(1, Math.floor(O) || 1);
  if (!o.length) return [];
  if (o.length === 1) return Array.from({ length: N + 1 }, () => ({ ...o[0] }));
  const h = polyLength(o);
  const result: Point[] = [{ ...o[0] }];
  let R = 1;
  let X = 0;
  for (let J = 1; J < N; J++) {
    const D = (h * J) / N;
    while (R < o.length - 1 && X + Math.hypot(o[R].x - o[R - 1].x, o[R].y - o[R - 1].y) < D) {
      X += Math.hypot(o[R].x - o[R - 1].x, o[R].y - o[R - 1].y);
      R++;
    }
    const prev = o[R - 1];
    const curr = o[R];
    const segLen = Math.hypot(curr.x - prev.x, curr.y - prev.y) || 1;
    const C = Math.min(1, Math.max(0, (D - X) / segLen));
    result.push({
      x: prev.x + (curr.x - prev.x) * C,
      y: prev.y + (curr.y - prev.y) * C,
    });
  }
  result.push({ ...o[o.length - 1] });
  return result;
};

const tiePath = (o: Point, O: Point, N: number, h: number, step = 4): Point[] => {
  const R = O.x - o.x;
  const X = O.y - o.y;
  const J = Math.hypot(R, X) || 1;
  const D = { x: R / J, y: X / J };
  const x = { x: D.y, y: -D.x };
  const B = Math.max(1, Math.min(N, J * 0.42));

  const atPoint = (center: Point, radius: number, angle: number): Point => ({
    x: center.x + radius * (Math.cos(angle) * D.x + Math.sin(angle) * x.x),
    y: center.y + radius * (Math.cos(angle) * D.y + Math.sin(angle) * x.y),
  });

  const pts: Point[] = [{ ...O }];

  const arc = (center: Point, radius: number, startAngle: number, endAngle: number) => {
    const count = Math.max(2, Math.ceil((Math.abs(endAngle - startAngle) * radius) / step));
    for (let i = 1; i <= count; i++) {
      pts.push(atPoint(center, radius, startAngle + ((endAngle - startAngle) * i) / count));
    }
  };

  const line = (target: Point) => {
    const last = pts[pts.length - 1];
    const count = Math.max(1, Math.ceil(Math.hypot(target.x - last.x, target.y - last.y) / step));
    for (let i = 1; i <= count; i++) {
      pts.push({
        x: last.x + ((target.x - last.x) * i) / count,
        y: last.y + ((target.y - last.y) * i) / count,
      });
    }
  };

  const tanAngle = (radius: number) => Math.acos(Math.min(1, radius / (J / 2)));
  const PI = Math.PI;
  const Ut = B;
  const atR = B * 1.16;
  const St = tanAngle(Ut);
  const Bt = tanAngle(atR);

  line(atPoint(O, Ut, -PI / 2));
  arc(O, Ut, -PI / 2, PI - St);
  line(atPoint(o, Ut, -St));
  arc(o, Ut, -St, St - 2 * PI);
  line(atPoint(O, atR, -PI + Bt));
  arc(O, atR, -PI + Bt, PI - Bt);
  line(atPoint(o, atR, -Bt));
  arc(o, atR, -Bt, -1.25 * PI);

  const tt = pts[pts.length - 1];
  const Nt = atPoint(o, atR + h * 0.5, -1.32 * PI);
  const jt = {
    x: Nt.x + (x.x * 0.85 - D.x * 0.35) * h * 0.6,
    y: Nt.y + (x.y * 0.85 - D.y * 0.35) * h * 0.6,
  };
  const Ht = Math.max(2, Math.ceil(h / step));
  for (let ht = 1; ht <= Ht; ht++) {
    const I = ht / Ht;
    const lt = 1 - I;
    pts.push({
      x: lt * lt * tt.x + 2 * lt * I * Nt.x + I * I * jt.x,
      y: lt * lt * tt.y + 2 * lt * I * Nt.y + I * I * jt.y,
    });
  }
  return pts;
};

const restPath = (
  start: Point,
  targetLength: number,
  baseRadius: number,
  bounds: Bounds,
  spiralAngle = 1.05,
  seed = 1,
  step = 3
): Point[] => {
  const result: Point[] = [{ ...start }];
  const D = Math.max(0, targetLength);
  const x = baseRadius * 0.75;
  const B = baseRadius * 0.26;
  const cosAng = Math.cos(spiralAngle);
  const sinAng = Math.sin(spiralAngle);

  const clampIn = (pt: Point): Point => ({
    x: Math.min(bounds.right, Math.max(bounds.left, pt.x)),
    y: Math.min(bounds.bottom, Math.max(bounds.top, pt.y)),
  });

  let ft = 0;
  let accumulated = 0;
  let curr = { ...start };
  let guard = 0;

  while (accumulated < D && guard++ < 20000) {
    ft += step / Math.max(1, Math.hypot(B, x));
    const variation = 1 + (hash(Math.floor(ft / 6.283) * 3.1 + seed) - 0.5) * 0.5;
    const wobble = Math.sin(ft * 0.18 + seed) * 0.28;
    const Bt = B * ft - x * variation * Math.sin(ft);
    const tt = x * variation * (1 - Math.cos(ft)) * 0.8;
    const cosWobble = Math.cos(wobble);
    const sinWobble = Math.sin(wobble);
    const Ht = Bt * cosWobble - tt * sinWobble;
    const ht = Bt * sinWobble + tt * cosWobble;
    const nextPt = clampIn({
      x: start.x + Ht * cosAng - ht * sinAng,
      y: start.y + Ht * sinAng + ht * cosAng,
    });
    const dist = Math.hypot(nextPt.x - curr.x, nextPt.y - curr.y);
    if (dist >= 0.01) {
      if (accumulated + dist > D) {
        const ratio = (D - accumulated) / dist;
        result.push({
          x: curr.x + (nextPt.x - curr.x) * ratio,
          y: curr.y + (nextPt.y - curr.y) * ratio,
        });
        accumulated = D;
        break;
      }
      result.push(nextPt);
      accumulated += dist;
      curr = nextPt;
    }
  }

  while (accumulated < D - 0.01 && guard++ < 40000) {
    const nextPt = clampIn({
      x: curr.x - Math.min(step, D - accumulated),
      y: curr.y,
    });
    const dist = Math.hypot(nextPt.x - curr.x, nextPt.y - curr.y);
    if (dist < 0.01) break;
    result.push(nextPt);
    accumulated += dist;
    curr = nextPt;
  }
  return result;
};

const smoothPath = (xs: Float64Array, ys: Float64Array) => {
  const N = Math.min(xs.length, ys.length);
  if (N < 2) return "";
  let d = `M${round(xs[0])} ${round(ys[0])}`;
  for (let i = 1; i < N - 1; i++) {
    d += `Q${round(xs[i])} ${round(ys[i])} ${round((xs[i] + xs[i + 1]) / 2)} ${round((ys[i] + ys[i + 1]) / 2)}`;
  }
  return `${d}L${round(xs[N - 1])} ${round(ys[N - 1])}`;
};

const scrollProgress = (top: number, height: number, viewH: number) => {
  if (!(viewH > 0) || !Number.isFinite(top)) return 1;
  const h = Math.max(1, Math.min(Number.isFinite(height) && height > 0 ? height : viewH, viewH) * 0.7);
  return clamp01((viewH - top) / h);
};

const stepWind = (curr: number, target: number, dt: number, rate: number) => {
  const diff = (target - curr) * (1 - Math.exp(-Math.max(0, dt) * 5));
  const maxStep = Math.max(0, rate) * Math.max(0, dt);
  const next = curr + Math.max(-maxStep, Math.min(maxStep, diff));
  return Math.abs(target - next) < 0.0005 ? target : clamp01(next);
};

interface Rope {
  x: Float64Array;
  y: Float64Array;
  px: Float64Array;
  py: Float64Array;
  seg: number;
}

const makeRope = (pts: Point[]): Rope => {
  const len = pts.length;
  const x = new Float64Array(len);
  const y = new Float64Array(len);
  pts.forEach((p, i) => {
    x[i] = p.x;
    y[i] = p.y;
  });
  return {
    x,
    y,
    px: Float64Array.from(x),
    py: Float64Array.from(y),
    seg: len > 1 ? polyLength(pts) / (len - 1) : 0,
  };
};

const stepRope = (
  rope: Rope,
  tied: Point[],
  rest: Point[],
  pinnedCount: number,
  attract: number,
  drag: { i: number; x: number; y: number } | null = null,
  iterations = 12
) => {
  const total = rope.x.length;
  const pinnedLimit = Math.max(1, Math.min(total, Math.floor(pinnedCount)));
  const isPinned = (idx: number) => idx < pinnedLimit || (drag !== null && drag.i === idx);

  for (let i = 0; i < total; i++) {
    if (drag && drag.i === i) {
      rope.px[i] = rope.x[i];
      rope.py[i] = rope.y[i];
      rope.x[i] = drag.x;
      rope.y[i] = drag.y;
    } else if (i < pinnedLimit) {
      const target = tied[i];
      rope.px[i] = rope.x[i];
      rope.py[i] = rope.y[i];
      if (target) {
        const factor = i === 0 ? 1 : 0.24;
        rope.x[i] += (target.x - rope.x[i]) * factor;
        rope.y[i] += (target.y - rope.y[i]) * factor;
      }
    } else {
      const vx = (rope.x[i] - rope.px[i]) * 0.9;
      const vy = (rope.y[i] - rope.py[i]) * 0.9;
      rope.px[i] = rope.x[i];
      rope.py[i] = rope.y[i];
      rope.x[i] += vx;
      rope.y[i] += vy;
      const targetRest = rest[i];
      if (targetRest && attract > 0) {
        rope.x[i] += (targetRest.x - rope.x[i]) * attract;
        rope.y[i] += (targetRest.y - rope.y[i]) * attract;
      }
    }
  }

  const segmentLength = rope.seg;
  for (let iter = 0; iter < iterations; iter++) {
    for (let c = 0; c < total - 1; c++) {
      const p1 = isPinned(c);
      const p2 = isPinned(c + 1);
      if (p1 && p2) continue;
      const dx = rope.x[c + 1] - rope.x[c];
      const dy = rope.y[c + 1] - rope.y[c];
      const dist = Math.hypot(dx, dy) || 1e-6;
      const delta = (dist - segmentLength) / dist;
      if (p1) {
        rope.x[c + 1] -= dx * delta;
        rope.y[c + 1] -= dy * delta;
      } else if (p2) {
        rope.x[c] += dx * delta;
        rope.y[c] += dy * delta;
      } else {
        rope.x[c] += dx * delta * 0.5;
        rope.y[c] += dy * delta * 0.5;
        rope.x[c + 1] -= dx * delta * 0.5;
        rope.y[c + 1] -= dy * delta * 0.5;
      }
    }
  }
};

const nearestFree = (rope: Rope, x: number, y: number, pinnedCount: number, maxRadius: number) => {
  let nearestIdx = -1;
  let minDistSq = maxRadius * maxRadius;
  for (let j = Math.max(1, Math.floor(pinnedCount)); j < rope.x.length; j++) {
    const distSq = (rope.x[j] - x) ** 2 + (rope.y[j] - y) ** 2;
    if (distSq < minDistSq) {
      minDistSq = distSq;
      nearestIdx = j;
    }
  }
  return nearestIdx;
};

// Sub-components for Eyelet Washer Buttons
function ButtonFace({ uid, accent }: { uid: string; accent: string }) {
  return (
    <svg viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
      <defs>
        <filter id={uid + "p"} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="3" seed="7" result="n" />
          <feDiffuseLighting in="n" surfaceScale="1.4" diffuseConstant="1.05" lightingColor="#fff" result="l">
            <feDistantLight azimuth="235" elevation="56" />
          </feDiffuseLighting>
          <feComposite in="l" in2="SourceGraphic" operator="arithmetic" k1="0.62" k2="0" k3="0.44" k4="0" result="m" />
          <feComposite in="m" in2="SourceAlpha" operator="in" />
        </filter>
        <linearGradient id={uid + "m"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9def5" />
          <stop offset=".3" stopColor="#6b75a8" />
          <stop offset=".55" stopColor="#1a1f45" />
          <stop offset=".8" stopColor="#8d97c8" />
          <stop offset="1" stopColor="#262b58" />
        </linearGradient>
        <linearGradient id={uid + "n"} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#c4cbea" />
          <stop offset=".45" stopColor="#3a4274" />
          <stop offset="1" stopColor="#11142e" />
        </linearGradient>
        <mask id={uid + "h"}>
          <rect x="-100" y="-100" width="200" height="200" fill="#fff" />
          <circle r="12.5" fill="#000" />
        </mask>
      </defs>
      <g mask={`url(#${uid}h)`}>
        <circle r="95" fill={accent} filter={`url(#${uid}p)`} />
        <circle r="33" fill="none" stroke="rgba(0,0,0,.16)" strokeWidth="3.5" />
        <circle r="35.5" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1.5" />
        <circle r="26" fill={`url(#${uid}m)`} />
        <circle r="26" fill="none" stroke="rgba(0,0,0,.45)" strokeWidth="1" />
        <circle r="18.5" fill={`url(#${uid}n)`} />
        <circle r="13" fill="none" stroke="#0b0d22" strokeWidth="2.2" />
      </g>
    </svg>
  );
}

function ButtonGloss({ uid }: { uid: string }) {
  return (
    <svg className="stt-gloss" viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={uid + "g"} cx=".32" cy=".26" r=".85">
          <stop offset="0" stopColor="#fff" stopOpacity=".26" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".24" />
        </radialGradient>
        <mask id={uid + "k"}>
          <rect x="-100" y="-100" width="200" height="200" fill="#fff" />
          <circle r="12.5" fill="#000" />
        </mask>
      </defs>
      <g mask={`url(#${uid}k)`}>
        <circle r="95" fill={`url(#${uid}g)`} />
        <circle r="94" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.4" />
        <path d="M-17 -12A21 21 0 0 1 -3 -21" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M14 15A21 21 0 0 1 3 21" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}

const Arrow = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    <path d="M2.5 9.5L9.5 2.5M4 2.5H9.5V8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NUM_SEGMENTS = 96;

// Default brand configuration for Inzeedo
const DEFAULT_META = ["Inzeedo Studio", "Est. 2024", "Creative Code"];
const DEFAULT_TAPES = ["Looking Forward to", "Connect with Inzeedo!"];
const DEFAULT_LINKS = [
  { label: "inzeedo.lk", href: "https://inzeedo.lk" },
  { label: "github.com/inzeedo", href: "https://github.com/inzeedo" },
  { label: "linkedin.com/company/inzeedo", href: "https://linkedin.com/company/inzeedo" },
];
const DEFAULT_NOTE = {
  kicker: "A note, tucked inside",
  text: "Got an ambitious project, an interactive brand vision or just want to say hi? Our studio is always listening.",
  cta: "Write to Inzeedo",
};
const DEFAULT_SIGNATURE_PATHS = [
  "M12 118C26 96 38 62 50 26C53 16 59 14 59 26C59 50 54 78 51 104C58 76 70 46 84 26C89 18 95 20 94 32C92 56 87 82 90 100C92 108 100 107 106 98C110 90 114 82 122 76C113 71 101 79 99 92C97 103 108 105 116 94C120 88 123 80 125 74C123 86 121 98 127 101C133 104 139 98 143 90C147 82 149 75 152 72C154 78 152 86 158 84C164 82 167 78 173 75C164 73 157 82 157 92C157 103 169 101 175 91C178 85 179 79 181 75C179 87 177 99 185 101C198 103 216 90 234 77",
  "M268 66C256 58 242 66 248 78C236 80 230 94 242 100C254 105 264 97 270 90",
  "M282 98L283.5 99.5",
  "M30 128C96 116 196 106 306 98",
];

export interface StringTieFooterProps {
  meta?: string[];
  title?: string;
  titleAccent?: string;
  tapes?: string[];
  email?: string;
  phone?: string;
  links?: { label: string; href?: string }[];
  regards?: string;
  signature?: string[];
  signatureText?: string;
  signatureLabel?: string;
  note?: { kicker?: string; text?: string; cta?: string };
  copiedLabel?: string;
  height?: string;
  paper?: string;
  ink?: string;
  bodyInk?: string;
  accent?: string;
  cord?: string;
  fontDisplay?: string;
  fontSans?: string;
  fontScript?: string;
  grain?: number;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
}

export function StringTieFooter({
  meta: metaItems = DEFAULT_META,
  title = "Inzeedo",
  titleAccent = "Studio",
  tapes = DEFAULT_TAPES,
  email = "hello@inzeedo.lk",
  phone = "+94 11 234 5678",
  links = DEFAULT_LINKS,
  regards = "Warm Regards,",
  signature = DEFAULT_SIGNATURE_PATHS,
  signatureText,
  signatureLabel = "Signed, Inzeedo Studio",
  note = DEFAULT_NOTE,
  copiedLabel = "Copied",
  height = "100svh",
  paper = "#ffffff",
  ink = "#0d1115",
  bodyInk = "#eef0f3",
  accent = "#1f78d1",
  cord = "#2c55d6",
  fontDisplay = "'Instrument Serif', 'Bodoni Moda', Didot, 'Bodoni 72', 'Bodoni MT', 'Times New Roman', Times, serif",
  fontSans = "'Poppins', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  fontScript = "'Snell Roundhand', 'Segoe Script', 'Brush Script MT', 'Apple Chancery', cursive",
  grain = 0.5,
  defaultOpen = false,
  onToggle,
  className = "",
}: StringTieFooterProps) {
  const uid = "stt" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const containerRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const topDiscRef = useRef<HTMLButtonElement>(null);
  const bottomDiscRef = useRef<HTMLButtonElement>(null);
  const topSpinRef = useRef<HTMLSpanElement>(null);
  const bottomSpinRef = useRef<HTMLSpanElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const svgCordRef = useRef<SVGSVGElement>(null);
  const shadowPathRef = useRef<SVGPathElement>(null);
  const cordPathRef = useRef<SVGPathElement>(null);
  const highlightPathRef = useRef<SVGPathElement>(null);
  const hitPathRef = useRef<SVGPathElement>(null);
  const endLineRef = useRef<SVGLineElement>(null);
  const signatureSvgRef = useRef<SVGSVGElement>(null);

  const [isInView, setIsInView] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isSigned, setIsSigned] = useState(false);
  const [copiedCount, setCopiedCount] = useState(0);
  const [isLoose, setIsLoose] = useState(true);

  const physicsRef = useRef<{
    rope: Rope | null;
    tied: Point[];
    rest: Point[];
    w: number;
    h: number;
    scale: number;
    cordW: number;
    wind: number;
    intent: "open" | "sealed";
    fast: boolean;
    attract: number;
    drag: { i: number; x: number; y: number; id: number } | null;
    seenAt: number;
    holdUntil: number;
    acc: number;
    last: number;
    raf: number;
    visible: boolean;
    reduced: boolean;
    loose: boolean;
    signed: boolean;
    open: boolean;
    ptr: { x: number; y: number; vx: number; vy: number } | null;
  }>({
    rope: null,
    tied: [],
    rest: [],
    w: 0,
    h: 0,
    scale: 1,
    cordW: 3,
    wind: 0,
    intent: defaultOpen ? "open" : "sealed",
    fast: false,
    attract: 0.05,
    drag: null,
    seenAt: 0,
    holdUntil: 0,
    acc: 0,
    last: 0,
    raf: 0,
    visible: false,
    reduced: false,
    loose: true,
    signed: false,
    open: defaultOpen,
    ptr: null,
  });

  // Calculate signature lengths for handwriting animation
  useEffect(() => {
    const paths = signatureSvgRef.current ? Array.from(signatureSvgRef.current.querySelectorAll("path")) : [];
    let delay = 0;
    paths.forEach((p) => {
      const len = Math.ceil(p.getTotalLength()) + 2;
      const dur = Math.max(0.14, len / 620);
      p.style.setProperty("--l", String(len));
      p.style.setProperty("--d", dur.toFixed(2) + "s");
      p.style.setProperty("--w", delay.toFixed(2) + "s");
      delay += dur + 0.06;
    });
  }, [signature]);

  const drawCord = useCallback(() => {
    const phys = physicsRef.current;
    const rope = phys.rope;
    if (!rope) return;

    const d = smoothPath(rope.x, rope.y);
    shadowPathRef.current?.setAttribute("d", d);
    cordPathRef.current?.setAttribute("d", d);
    highlightPathRef.current?.setAttribute("d", d);
    hitPathRef.current?.setAttribute("d", d);

    const len = rope.x.length;
    if (endLineRef.current && len > 2) {
      const ql = rope.x[len - 1];
      const Ml = rope.y[len - 1];
      const fl = ql - rope.x[len - 3];
      const Ct = Ml - rope.y[len - 3];
      const Gt = Math.hypot(fl, Ct) || 1;
      const zl = phys.cordW * 3.4;
      endLineRef.current.setAttribute("x1", String(round(ql - (fl / Gt) * zl)));
      endLineRef.current.setAttribute("y1", String(round(Ml - (Ct / Gt) * zl)));
      endLineRef.current.setAttribute("x2", String(round(ql)));
      endLineRef.current.setAttribute("y2", String(round(Ml)));
    }

    const cordW = phys.cordW;
    cordPathRef.current?.setAttribute("stroke-width", String(cordW));
    shadowPathRef.current?.setAttribute("stroke-width", String(cordW + 1.2));
    highlightPathRef.current?.setAttribute("stroke-width", String(round(cordW * 0.42)));
    highlightPathRef.current?.setAttribute("stroke-dasharray", `${round(cordW * 0.9)} ${round(cordW * 1.25)}`);
    endLineRef.current?.setAttribute("stroke-width", String(round(cordW * 1.55)));
  }, []);

  const measureAndInit = useCallback(() => {
    const cont = containerRef.current;
    const frame = frameRef.current;
    const topDisc = topDiscRef.current;
    const bottomDisc = bottomDiscRef.current;
    const flap = flapRef.current;
    if (!cont || !frame || !topDisc || !bottomDisc || !flap) return;

    const phys = physicsRef.current;
    const cRect = cont.getBoundingClientRect();
    phys.scale = cont.offsetWidth ? cRect.width / cont.offsetWidth : 1;

    const toLocal = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return {
        x: (r.left + r.width / 2 - cRect.left) / phys.scale,
        y: (r.top + r.height / 2 - cRect.top) / phys.scale,
      };
    };

    const topCenter = toLocal(topDisc);
    const bottomCenter = toLocal(bottomDisc);
    const discRadius = topDisc.offsetWidth / 2;

    phys.w = cont.offsetWidth;
    phys.h = cont.offsetHeight;
    phys.cordW = Math.max(2.2, Math.min(3.6, discRadius * 0.036));

    const flapH = flap.offsetHeight;
    const tiedPoints = tiePath(topCenter, bottomCenter, discRadius * 0.4, discRadius * 0.95);
    const cordLength = polyLength(tiedPoints);
    phys.tied = resample(tiedPoints, NUM_SEGMENTS);

    const margin = Math.max(10, discRadius * 0.2);
    const bounds: Bounds = {
      left: margin,
      top: flapH + margin,
      right: phys.w - margin,
      bottom: phys.h - margin,
    };
    const isMobile = phys.w < 640;
    phys.rest = resample(
      restPath(bottomCenter, cordLength, discRadius * (isMobile ? 0.58 : 0.66), bounds, isMobile ? 1.5 : 1.4, 2),
      NUM_SEGMENTS
    );

    const svgCord = svgCordRef.current;
    if (svgCord) {
      svgCord.setAttribute("viewBox", `0 0 ${phys.w} ${phys.h}`);
      svgCord.setAttribute("width", String(phys.w));
      svgCord.setAttribute("height", String(phys.h));
    }

    if (!phys.rope || phys.rope.x.length !== phys.tied.length) {
      phys.rope = makeRope(phys.wind > 0.5 ? phys.tied : phys.rest);
    } else {
      phys.rope.seg = cordLength / NUM_SEGMENTS;
      const pinnedCutoff = Math.floor(phys.wind * (NUM_SEGMENTS + 1));
      for (let i = 0; i < phys.rope.x.length; i++) {
        const pt = i < pinnedCutoff ? phys.tied[i] : phys.rest[i];
        phys.rope.x[i] = phys.rope.px[i] = pt.x;
        phys.rope.y[i] = phys.rope.py[i] = pt.y;
      }
    }
    drawCord();
  }, [drawCord]);

  const tickPhysicsRef = useRef<(now: number) => void>(() => {});

  const tickPhysics = useCallback(
    (now: number) => {
      const phys = physicsRef.current;
      phys.raf = 0;
      const cont = containerRef.current;
      if (!cont || !phys.rope) return;

      const dt = Math.min(0.05, phys.last ? (now - phys.last) / 1000 : 0.016);
      phys.last = now;

      const rect = cont.getBoundingClientRect();
      const scrollRatio = scrollProgress(rect.top, rect.height, window.innerHeight);
      const isSettled = phys.seenAt > 0 && now - phys.seenAt > (phys.reduced ? 0 : 900);
      const targetWind = phys.intent === "sealed" && isSettled && now >= phys.holdUntil ? scrollRatio : 0;

      phys.wind = phys.reduced ? targetWind : stepWind(phys.wind, targetWind, dt, phys.fast ? 1.5 : 0.85);
      if (phys.wind === targetWind) {
        phys.fast = false;
      }

      const pinnedCount = phys.wind * (NUM_SEGMENTS + 1);
      if (topSpinRef.current) {
        topSpinRef.current.style.transform = `rotate(${round(phys.wind * 540)}deg)`;
      }
      if (bottomSpinRef.current) {
        bottomSpinRef.current.style.transform = `rotate(${round(phys.wind * -200)}deg)`;
      }

      if (phys.reduced) {
        const pinnedFloor = Math.floor(pinnedCount);
        for (let i = 0; i < phys.rope.x.length; i++) {
          const pt = i < Math.max(1, pinnedFloor) ? phys.tied[i] : phys.rest[i];
          phys.rope.x[i] = phys.rope.px[i] = pt.x;
          phys.rope.y[i] = phys.rope.py[i] = pt.y;
        }
      } else {
        phys.acc += dt;
        while (phys.acc >= 1 / 60) {
          phys.acc -= 1 / 60;
          const ptr = phys.ptr;
          if (ptr && !phys.drag) {
            for (let v = Math.max(1, Math.floor(pinnedCount)); v < phys.rope.x.length; v++) {
              const dx = phys.rope.x[v] - ptr.x;
              const dy = phys.rope.y[v] - ptr.y;
              const distSq = dx * dx + dy * dy;
              if (distSq < 46 * 46) {
                const force = (1 - Math.sqrt(distSq) / 46) * 0.22;
                phys.rope.x[v] += ptr.vx * force;
                phys.rope.y[v] += ptr.vy * force;
              }
            }
            ptr.vx *= 0.6;
            ptr.vy *= 0.6;
          }
          stepRope(phys.rope, phys.tied, phys.rest, pinnedCount, phys.attract, phys.drag);
        }
      }

      drawCord();
      const looseNow = pinnedCount < NUM_SEGMENTS * 0.98;
      if (looseNow !== phys.loose) {
        phys.loose = looseNow;
        setIsLoose(looseNow);
      }
      if (!phys.signed && phys.wind > 0.985) {
        phys.signed = true;
        setIsSigned(true);
      }
      if (phys.intent === "open" && phys.wind < 0.015 && !phys.open) {
        phys.open = true;
        setIsOpen(true);
      }

      if (phys.visible) {
        phys.raf = requestAnimationFrame((n) => tickPhysicsRef.current(n));
      }
    },
    [drawCord]
  );

  useEffect(() => {
    tickPhysicsRef.current = tickPhysics;
  }, [tickPhysics]);

  const requestTick = useCallback(() => {
    const phys = physicsRef.current;
    if (!phys.raf && phys.visible) {
      phys.last = 0;
      phys.raf = requestAnimationFrame(tickPhysics);
    }
  }, [tickPhysics]);

  useEffect(() => {
    const phys = physicsRef.current;
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    phys.reduced = !!mediaQuery?.matches;

    const onMq = () => {
      phys.reduced = !!mediaQuery?.matches;
    };
    mediaQuery?.addEventListener("change", onMq);

    measureAndInit();

    const cont = containerRef.current;
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => measureAndInit()) : null;
    if (cont) resizeObserver?.observe(cont);

    document.fonts?.ready?.then(() => measureAndInit()).catch(() => {});

    let observer: IntersectionObserver | null = null;
    if (cont && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((e) => e.isIntersecting);
          phys.visible = visible;
          if (visible && !phys.seenAt) {
            phys.seenAt = performance.now();
            setIsInView(true);
          }
          if (visible) requestTick();
        },
        { threshold: 0.12 }
      );
      observer.observe(cont);
    } else {
      phys.visible = true;
      phys.seenAt = performance.now();
      setIsInView(true);
      requestTick();
    }

    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      mediaQuery?.removeEventListener("change", onMq);
      cancelAnimationFrame(phys.raf);
      phys.raf = 0;
      phys.visible = false;
    };
  }, [measureAndInit, requestTick]);

  // Inert attribute on letter when closed
  useEffect(() => {
    const letter = letterRef.current;
    if (letter) {
      if (isOpen) {
        letter.removeAttribute("inert");
      } else {
        letter.setAttribute("inert", "");
      }
    }
  }, [isOpen]);

  // Reset copied tooltip
  useEffect(() => {
    if (!copiedCount) return;
    const timer = window.setTimeout(() => setCopiedCount(0), 2200);
    return () => clearTimeout(timer);
  }, [copiedCount]);

  const toggle = (targetOpen?: boolean) => {
    const phys = physicsRef.current;
    const nextOpen = targetOpen ?? phys.intent === "sealed";
    if (nextOpen !== (phys.intent === "open")) {
      phys.fast = true;
      phys.attract = 0.05;
      phys.drag = null;
      onToggle?.(nextOpen);
      if (nextOpen) {
        phys.intent = "open";
      } else {
        phys.open = false;
        phys.intent = "sealed";
        phys.holdUntil = performance.now() + (phys.reduced ? 0 : 650);
        setIsOpen(false);
      }
      requestTick();
    }
  };

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

  const toLocalCoords = (e: React.PointerEvent) => {
    const bounds = containerRef.current!.getBoundingClientRect();
    const phys = physicsRef.current;
    return {
      x: (e.clientX - bounds.left) / phys.scale,
      y: (e.clientY - bounds.top) / phys.scale,
    };
  };

  const onCordDown = (e: React.PointerEvent) => {
    const phys = physicsRef.current;
    if (!phys.rope) return;
    const local = toLocalCoords(e);
    const idx = nearestFree(phys.rope, local.x, local.y, phys.wind * (NUM_SEGMENTS + 1), 30);
    if (idx < 0) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    phys.drag = { i: idx, x: local.x, y: local.y, id: e.pointerId };
    phys.attract = 0;
    svgCordRef.current?.classList.add("is-drag");
    requestTick();
  };

  const onCordMove = (e: React.PointerEvent) => {
    const phys = physicsRef.current;
    if (!phys.drag || phys.drag.id !== e.pointerId) return;
    const local = toLocalCoords(e);
    phys.drag.x = Math.min(phys.w - 4, Math.max(4, local.x));
    phys.drag.y = Math.min(phys.h - 4, Math.max(4, local.y));
  };

  const onCordUp = (e: React.PointerEvent) => {
    const phys = physicsRef.current;
    if (!phys.drag || phys.drag.id !== e.pointerId) return;
    phys.drag = null;
    svgCordRef.current?.classList.remove("is-drag");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const phys = physicsRef.current;
    const local = toLocalCoords(e);
    const prev = phys.ptr;
    const cap = (v: number) => Math.max(-14, Math.min(14, v));
    phys.ptr = {
      x: local.x,
      y: local.y,
      vx: prev ? cap(local.x - prev.x) : 0,
      vy: prev ? cap(local.y - prev.y) : 0,
    };
  };

  const isExternal = (href?: string) => /^https?:/.test(href || "");
  const fullTitle = [title, titleAccent].filter(Boolean).join(" ");
  let charCounter = 0;

  const renderCharacters = (textStr: string) =>
    [...textStr].map((ch, idx) => (
      <span
        key={idx}
        className="stt-ch"
        style={{ "--i": charCounter++ } as React.CSSProperties}
      >
        {ch === " " ? " " : ch}
      </span>
    ));

  return (
    <footer
      ref={containerRef}
      className={`stt${isInView ? " is-in" : ""}${isOpen ? " is-open" : ""}${isSigned ? " is-signed" : ""}${className ? " " + className : ""}`}
      style={
        {
          "--stt-paper": paper,
          "--stt-ink": ink,
          "--stt-body-ink": bodyInk,
          "--stt-accent": accent,
          "--stt-display": fontDisplay,
          "--stt-sans": fontSans,
          "--stt-script": fontScript,
          "--stt-grain": String(grain),
          "--stt-h": height,
        } as React.CSSProperties
      }
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        physicsRef.current.ptr = null;
      }}
    >
      <div ref={frameRef} className="stt-frame">
        {/* Envelope Top Flap */}
        <div className="stt-flapwrap">
          <div ref={flapRef} className="stt-flap">
            {metaItems.length > 0 && (
              <div className="stt-meta">
                {metaItems.slice(0, 3).map((item, idx) => (
                  <span key={idx}>({item})</span>
                ))}
              </div>
            )}

            <div className="stt-head">
              <h2 className="stt-title">
                <span className="stt-sr">{fullTitle}</span>
                <span aria-hidden="true">
                  {renderCharacters(title)}
                  {titleAccent && (
                    <>
                      {" "}
                      <em>{renderCharacters(titleAccent)}</em>
                    </>
                  )}
                </span>
              </h2>

              {tapes.length > 0 && (
                <p className="stt-tapes">
                  {tapes.slice(0, 2).map((tapeText, idx) => (
                    <React.Fragment key={idx}>
                      <span className={`stt-tape ${idx ? "stt-tape-b" : "stt-tape-a"}`}>
                        <span>{tapeText}</span>
                      </span>
                      {idx === 0 && tapes.length > 1 && <span className="stt-sr"> </span>}
                    </React.Fragment>
                  ))}
                </p>
              )}
            </div>

            {/* Top Eyelet Button */}
            <div className="stt-dock">
              <button
                ref={topDiscRef}
                type="button"
                className="stt-btn stt-btn-top"
                onClick={() => toggle(true)}
                aria-label="Untie the envelope"
                aria-controls={`${uid}note`}
                aria-expanded={isOpen}
                tabIndex={isOpen ? -1 : 0}
                aria-hidden={isOpen ? true : undefined}
              >
                <span ref={topSpinRef} className="stt-spin">
                  <ButtonFace uid={`${uid}t`} accent={accent} />
                </span>
                <ButtonGloss uid={`${uid}t`} />
              </button>
            </div>

            <div className="stt-crease" aria-hidden="true" />
          </div>
        </div>

        {/* Envelope Body / Inside Note */}
        <div className="stt-body">
          <div ref={letterRef} id={`${uid}note`} className="stt-letter" role="region" aria-label="Note">
            {/* Postal Stamp */}
            <svg className="stt-stamp" viewBox="0 0 150 64" aria-hidden="true" focusable="false">
              <circle cx="32" cy="32" r="26" />
              <circle cx="32" cy="32" r="20.5" />
              <text x="32" y="34.5" textLength="30" lengthAdjust="spacingAndGlyphs">
                {metaItems[1] || "Est. 2024"}
              </text>
              <path d="M66 18q10-5 20 0t20 0 20 0 20 0M66 28q10-5 20 0t20 0 20 0 20 0M66 38q10-5 20 0t20 0 20 0 20 0M66 48q10-5 20 0t20 0 20 0 20 0" />
            </svg>

            {note.kicker && <p className="stt-note-k">{note.kicker}</p>}
            {note.text && <p className="stt-note-t">{note.text}</p>}

            <div className="stt-note-row">
              {email && (
                <a className="stt-cta" href={`mailto:${email}`}>
                  {note.cta || "Write to Inzeedo"}
                  <Arrow />
                </a>
              )}
              <button type="button" className="stt-ghost" onClick={() => toggle(false)}>
                Tie it back up
              </button>
            </div>
          </div>

          <div className="stt-panel" aria-hidden="true" />

          {/* Bottom Eyelet Button */}
          <div className="stt-dock-b">
            <button
              ref={bottomDiscRef}
              type="button"
              className="stt-btn"
              onClick={() => toggle()}
              aria-label={isOpen ? "Tie the envelope back up" : "Untie the envelope"}
              aria-controls={`${uid}note`}
              aria-expanded={isOpen}
            >
              <span ref={bottomSpinRef} className="stt-spin">
                <ButtonFace uid={`${uid}b`} accent={accent} />
              </span>
              <ButtonGloss uid={`${uid}b`} />
            </button>
          </div>

          {/* Footer Contacts & Signature */}
          <div className="stt-content">
            <div className="stt-contacts">
              {email && (
                <div>
                  <span className="stt-k">Email</span>
                  <button type="button" className="stt-v" onClick={copyEmail} title="Copy email address">
                    {email}
                    <span className={`stt-copied${copiedCount ? " is-on" : ""}`} aria-hidden="true">
                      {copiedLabel}
                    </span>
                  </button>
                  <span className="stt-sr" role="status">
                    {copiedCount ? "Email address copied" : ""}
                  </span>
                </div>
              )}

              {phone && (
                <div>
                  <span className="stt-k">Phone</span>
                  <a className="stt-v" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
                    {phone}
                  </a>
                </div>
              )}

              {links.length > 0 && (
                <nav className="stt-links" aria-label="Elsewhere">
                  {links.map((link, idx) => (
                    <a
                      key={idx}
                      className="stt-link"
                      href={link.href || "#"}
                      target={isExternal(link.href) ? "_blank" : undefined}
                      rel={isExternal(link.href) ? "noopener noreferrer" : undefined}
                      onClick={(e) => {
                        if (!link.href || link.href === "#") e.preventDefault();
                      }}
                    >
                      {link.label}
                      <Arrow />
                    </a>
                  ))}
                </nav>
              )}
            </div>

            {(regards || signature.length > 0 || signatureText) && (
              <div className="stt-regards">
                {regards && <p className="stt-regards-t">{regards}</p>}
                {signatureText ? (
                  <span className="stt-sign-text" role="img" aria-label={signatureLabel}>
                    {signatureText}
                  </span>
                ) : (
                  signature.length > 0 && (
                    <svg
                      ref={signatureSvgRef}
                      className="stt-sign"
                      viewBox="0 0 320 140"
                      role="img"
                      aria-label={signatureLabel}
                    >
                      {signature.map((dStr, idx) => (
                        <path key={idx} d={dStr} />
                      ))}
                    </svg>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Physically Simulated String SVG */}
      <svg
        ref={svgCordRef}
        className={`stt-cord${isLoose ? " is-loose" : ""}`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id={`${uid}s`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>
        <path ref={shadowPathRef} stroke="rgba(0,0,0,.32)" transform="translate(1.2 2.6)" filter={`url(#${uid}s)`} />
        <path ref={cordPathRef} stroke={cord} />
        <path ref={highlightPathRef} stroke="rgba(255,255,255,.2)" />
        <line ref={endLineRef} stroke="#9aa3c7" strokeLinecap="round" />
        <path
          ref={hitPathRef}
          className="stt-hit"
          onPointerDown={onCordDown}
          onPointerMove={onCordMove}
          onPointerUp={onCordUp}
          onPointerCancel={onCordUp}
        />
      </svg>
    </footer>
  );
}

export default StringTieFooter;
