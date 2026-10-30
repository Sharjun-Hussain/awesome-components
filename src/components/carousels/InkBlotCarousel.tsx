import React, { useState, useRef, useEffect, useMemo, useCallback, useId } from "react";
import "./InkBlotCarousel.exact.css";

export const meta = {
  title: "Inzeedo Ink Blot Hero Carousel",
  description: "Hero carousel featuring dynamic SVG displacement ink-wipe transition masks, procedural misty landscape synthesis, gesture swipe, keyboard navigation, and auto-play progress tracking.",
  category: "carousels",
  fullWidth: true,
  thumbnail: true,
};

export interface InkBlotSlide {
  title?: string;
  caption?: string;
  image?: string;
  alt?: string;
  palette?: "dawn" | "alpine" | "dusk" | "mist";
  seed?: number;
}

// Math & Utility Helpers
const wrapIndex = (idx: number, len: number) => (len ? ((idx % len) + len) % len : 0);

const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

const defaultOrigin = (dir: number, w: number, h: number, seed: number): [number, number] => [
  w * (dir >= 0 ? 0.62 + seed * 0.25 : 0.13 + seed * 0.25),
  h * (0.3 + seed * 0.4),
];

const easeInOutCubic = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};

const maxCornerDist = (x: number, y: number, w: number, h: number) =>
  Math.hypot(Math.max(x, w - x), Math.max(y, h - y));

// Procedural Ink Blot Satellite Droplet Coordinates
const generateInkDrops = (seed: number, count: number): [number, number, number][] => {
  let s = (seed >>> 0) || 1;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const drops: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = 40 + rand() * 140;
    drops.push([Math.cos(angle) * dist, Math.sin(angle) * dist, 0.25 + rand() * 0.4]);
  }
  return drops;
};

// Procedural Atmospheric Landscape Fallback Generator
const LANDSCAPE_PALETTES = {
  dawn: {
    top: "#e7b7a5",
    bottom: "#f8e8d6",
    sun: "#fff4df",
    far: "#d2b2bb",
    near: "#3a2a3b",
    mist: "255,240,232",
  },
  alpine: {
    top: "#7ea5c8",
    bottom: "#e3ecf2",
    sun: "#ffffff",
    far: "#a9bfd0",
    near: "#1c3044",
    mist: "236,244,250",
  },
  dusk: {
    top: "#2a2450",
    bottom: "#ef8d60",
    sun: "#ffd9a6",
    far: "#93607c",
    near: "#18121f",
    mist: "255,196,160",
  },
  mist: {
    top: "#c4d0cb",
    bottom: "#eef1ec",
    sun: "#ffffff",
    far: "#aebcb5",
    near: "#2c3a33",
    mist: "246,248,245",
  },
};

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 1831565813) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const val = parseInt(hex.replace("#", ""), 16);
  return [(val >> 16) & 255, (val >> 8) & 255, val & 255];
}

function mixRgb(hex1: string, hex2: string, ratio: number) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return `rgb(${Math.round(r1 + (r2 - r1) * ratio)},${Math.round(g1 + (g2 - g1) * ratio)},${Math.round(b1 + (b2 - b1) * ratio)})`;
}

function paintProceduralLandscape(seed: number, paletteKey: "dawn" | "alpine" | "dusk" | "mist" = "dawn", w = 1600, h = 1000): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const pal = LANDSCAPE_PALETTES[paletteKey] ?? LANDSCAPE_PALETTES.dawn;
  const rng = mulberry32(seed * 104729 + 7);

  // Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.72);
  skyGrad.addColorStop(0, pal.top);
  skyGrad.addColorStop(1, pal.bottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Atmospheric Sun Glow
  const sunX = w * (0.22 + rng() * 0.56);
  const sunY = h * (0.26 + rng() * 0.16);
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, w * 0.45);
  const sunRgb = hexToRgb(pal.sun).join(",");
  sunGlow.addColorStop(0, `rgba(${sunRgb},.85)`);
  sunGlow.addColorStop(0.08, `rgba(${sunRgb},.55)`);
  sunGlow.addColorStop(1, `rgba(${sunRgb},0)`);
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = pal.sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, h * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // Mountain Ridges
  const layers = 5;
  for (let l = 0; l < layers; l++) {
    const layerProg = l / (layers - 1);
    const baseY = h * (0.42 + layerProg * 0.4);
    const amp = h * (0.07 + layerProg * 0.1);
    const phases = [rng(), rng(), rng(), rng()].map((v) => v * Math.PI * 2);
    const freqs = [1.3 + rng(), 3.1 + rng() * 2, 7 + rng() * 4, 17 + rng() * 8];

    const ridgeY = (x: number) => {
      const normX = x / w;
      return (
        baseY -
        amp *
          (0.55 * Math.sin(normX * freqs[0] + phases[0]) +
            0.28 * Math.sin(normX * freqs[1] + phases[1]) +
            0.12 * Math.abs(Math.sin(normX * freqs[2] + phases[2])) +
            0.05 * Math.sin(normX * freqs[3] + phases[3]))
      );
    };

    // Valley Mist
    const mistGrad = ctx.createLinearGradient(0, baseY - amp * 1.4, 0, baseY + amp * 0.4);
    mistGrad.addColorStop(0, `rgba(${pal.mist},0)`);
    mistGrad.addColorStop(1, `rgba(${pal.mist},${(0.55 - layerProg * 0.35).toFixed(2)})`);
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, baseY - amp * 1.4, w, amp * 1.8);

    // Mountain Mass
    const mountainGrad = ctx.createLinearGradient(0, baseY - amp, 0, h);
    mountainGrad.addColorStop(0, mixRgb(pal.far, pal.near, Math.pow(layerProg, 1.3)));
    mountainGrad.addColorStop(1, mixRgb(pal.far, pal.near, Math.min(1, Math.pow(layerProg, 1.3) + 0.18)));
    ctx.fillStyle = mountainGrad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 6) {
      ctx.lineTo(x, ridgeY(x));
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Silhouetted Pine Trees on Forefront Ridges
    if (l >= layers - 2) {
      ctx.fillStyle = mixRgb(pal.far, pal.near, Math.min(1, Math.pow(layerProg, 1.3) + 0.08));
      for (let x = 0; x < w; x += 7 + rng() * 9) {
        if (rng() < 0.35) continue;
        const treeBase = ridgeY(x) + 2;
        const treeH = h * (0.025 + rng() * 0.035) * (0.6 + layerProg);
        const treeW = treeH * 0.32;
        ctx.beginPath();
        ctx.moveTo(x, treeBase - treeH);
        ctx.lineTo(x + treeW, treeBase);
        ctx.lineTo(x - treeW, treeBase);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // Vignette
  const vignette = ctx.createRadialGradient(w / 2, h * 0.45, h * 0.3, w / 2, h / 2, w * 0.78);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,.32)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // Subtle Texture Grain
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (rng() - 0.5) * 14;
    data[i] += grain;
    data[i + 1] += grain;
    data[i + 2] += grain;
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas.toDataURL("image/jpeg", 0.88);
}

// Hook to prepare slide images
function useSlideImages(slides: InkBlotSlide[]) {
  return useMemo(
    () =>
      slides.map((s, idx) =>
        s.image ? s.image : paintProceduralLandscape(s.seed ?? idx + 1, s.palette || "dawn")
      ),
    [slides]
  );
}

// Sub-component: Ink Blot Masking Transition Layer
interface InkLayerProps {
  toImage: string;
  x: number;
  y: number;
  w: number;
  h: number;
  duration: number;
  bleed: number;
  onDone: () => void;
}

function InkTransitionLayer({ toImage, x, y, w, h, duration, bleed, onDone }: InkLayerProps) {
  const uid = "ink" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const circlesRef = useRef<(SVGCircleElement | null)[]>([]);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const drops = useMemo(
    () => [[0, 0, 1] as [number, number, number]].concat(generateInkDrops(Math.round(x * 7 + y * 13), 7)),
    [x, y]
  );

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const maxRadius = maxCornerDist(x, y, w, h) * 1.3;
    const animDur = reduced ? 300 : duration;
    const startT = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - startT) / animDur);
      const eased = reduced ? 1 : easeInOutCubic(progress);

      drops.forEach((drop, idx) => {
        const circle = circlesRef.current[idx];
        if (circle) {
          const r = maxRadius * eased * (idx ? drop[2] * 1.6 : 1);
          circle.setAttribute("r", String(r));
        }
      });

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        onDoneRef.current();
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [drops, duration, h, w, x, y]);

  return (
    <svg className="ib-in" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        {/* Fractal Turbulence & Displacement Map creating organic ink fluid bleed */}
        <filter id={uid + "f"} x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={3} />
          <feDisplacementMap in="SourceGraphic" scale={bleed} xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation={1.5} />
        </filter>

        <mask id={uid + "m"} maskUnits="userSpaceOnUse" x={0} y={0} width={w} height={h}>
          <rect width={w} height={h} fill="black" />
          <g filter={`url(#${uid}f)`}>
            {drops.map((drop, idx) => (
              <circle
                key={idx}
                ref={(el) => { circlesRef.current[idx] = el; }}
                cx={x + drop[0]}
                cy={y + drop[1]}
                r={0}
                fill="white"
              />
            ))}
          </g>
        </mask>
      </defs>

      <image
        href={toImage}
        x={0}
        y={0}
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid slice"
        mask={`url(#${uid}m)`}
      />
    </svg>
  );
}

// Default Inzeedo Atmospheric Slides
const DEFAULT_SLIDES: InkBlotSlide[] = [
  {
    title: "First Light",
    caption: "Inzeedo Studio — Morning haze lifting off the eastern ridges.",
    palette: "dawn",
    seed: 3,
  },
  {
    title: "High Pass",
    caption: "Crisp mountain air, clear to the far horizons.",
    palette: "alpine",
    seed: 8,
  },
  {
    title: "Ember Hour",
    caption: "The golden warmth of sunset lingering on the valley floor.",
    palette: "dusk",
    seed: 14,
  },
  {
    title: "Still Valley",
    caption: "Quiet morning mist where creativity takes root.",
    palette: "mist",
    seed: 21,
  },
  {
    title: "Rose Ridge",
    caption: "Five mountain ridges and one endless exhale.",
    palette: "dawn",
    seed: 34,
  },
  {
    title: "Blue Hour",
    caption: "Pines going deep indigo against the snow.",
    palette: "alpine",
    seed: 55,
  },
];

export interface InkBlotCarouselProps {
  slides?: InkBlotSlide[];
  height?: string;
  duration?: number;
  bleed?: number;
  autoplay?: number;
  ink?: string;
  onChange?: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export function InkBlotCarousel({
  slides = DEFAULT_SLIDES,
  height = "100svh",
  duration = 2400,
  bleed = 90,
  autoplay = 6000,
  ink = "#ffffff",
  onChange,
  className = "",
  style,
  ariaLabel = "Inzeedo Hero Ink Blot Carousel",
}: InkBlotCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const transitionCounter = useRef(0);

  const totalSlides = slides.length;
  const slideImages = useSlideImages(slides);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionState, setTransitionState] = useState<{
    to: number;
    dir: number;
    x: number;
    y: number;
    w: number;
    h: number;
    id: number;
  } | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback(
    (dir: number, clickX?: number, clickY?: number) => {
      const el = containerRef.current;
      if (!el || transitionState || totalSlides < 2) return;

      const w = el.clientWidth;
      const h = el.clientHeight;
      transitionCounter.current += 1;
      const [defX, defY] = defaultOrigin(dir, w, h, (transitionCounter.current * 0.618) % 1);

      setTransitionState({
        to: wrapIndex(currentIndex + dir, totalSlides),
        dir,
        x: clickX ?? defX,
        y: clickY ?? defY,
        w,
        h,
        id: Date.now(),
      });
    },
    [currentIndex, totalSlides, transitionState]
  );

  const onTransitionDone = useCallback(() => {
    if (transitionState) {
      setCurrentIndex(transitionState.to);
      setTransitionState(null);
    }
  }, [transitionState]);

  useEffect(() => {
    onChange?.(currentIndex);
  }, [currentIndex, onChange]);

  // Preload images into browser memory
  useEffect(() => {
    slideImages.forEach((src) => {
      if (src) new Image().src = src;
    });
  }, [slideImages]);

  // Pause autoplay when document is hidden or out of view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let inView = true;

    const syncPause = () => setIsPaused(!inView || document.hidden);

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPause();
    });
    observer.observe(el);
    document.addEventListener("visibilitychange", syncPause);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPause);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") goToSlide(1);
    else if (e.key === "ArrowLeft") goToSlide(-1);
    else return;
    e.preventDefault();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || !containerRef.current) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const rect = containerRef.current.getBoundingClientRect();

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      goToSlide(dx < 0 ? 1 : -1);
    } else if (Math.abs(dx) < 8) {
      goToSlide(1, e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const stopNavPropagation = (e: React.PointerEvent) => e.stopPropagation();

  const activeIndex = transitionState ? transitionState.to : currentIndex;
  const activeSlide = slides[activeIndex] || {};

  return (
    <div
      ref={containerRef}
      className={["ib-root", className].filter(Boolean).join(" ")}
      style={
        {
          height,
          "--ib-ink": ink,
          "--ib-auto": `${autoplay}ms`,
          ...style,
        } as React.CSSProperties
      }
      data-paused={isPaused ? "1" : "0"}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* Base Slide Background */}
      <div className="ib-base">
        {slideImages[currentIndex] && (
          <img
            className="ib-img"
            src={slideImages[currentIndex]}
            alt={slides[currentIndex]?.alt || slides[currentIndex]?.title || ""}
            draggable={false}
          />
        )}
      </div>

      {/* Dynamic Animated Ink Blot Transition Layer */}
      {transitionState && slideImages[currentIndex] && slideImages[transitionState.to] && (
        <InkTransitionLayer
          key={transitionState.id}
          toImage={slideImages[transitionState.to]}
          x={transitionState.x}
          y={transitionState.y}
          w={transitionState.w}
          h={transitionState.h}
          duration={duration}
          bleed={bleed}
          onDone={onTransitionDone}
        />
      )}

      {/* Atmospheric Shadow Gradient */}
      <div className="ib-shade" aria-hidden="true" />

      {/* Slide Typography Line Mask */}
      <div className="ib-text" aria-hidden="true" key={"t" + activeIndex}>
        {activeSlide.title && (
          <span className="ib-line ib-title">
            <span>{activeSlide.title}</span>
          </span>
        )}
        {activeSlide.caption && (
          <span className="ib-line ib-cap">
            <span>{activeSlide.caption}</span>
          </span>
        )}
      </div>

      {/* Navigation Controls & Counter */}
      <div className="ib-nav" onPointerDown={stopNavPropagation} onPointerUp={stopNavPropagation}>
        <span className="ib-count" aria-hidden="true">
          {pad2(activeIndex + 1)} / {pad2(totalSlides)}
        </span>
        <button
          type="button"
          className="ib-btn"
          aria-label="Previous slide"
          onClick={() => goToSlide(-1)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <button
          type="button"
          className="ib-btn"
          aria-label="Next slide"
          onClick={() => goToSlide(1)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>

      {/* Autoplay Progress Line Tracker */}
      <div className="ib-track" aria-hidden="true">
        <div
          key={"f" + currentIndex}
          className="ib-fill"
          data-run={autoplay > 0 && totalSlides > 1 && !transitionState ? "1" : "0"}
          onAnimationEnd={() => goToSlide(1)}
        />
      </div>

      <div className="ib-sr" aria-live="polite">
        {`Slide ${activeIndex + 1} of ${totalSlides}${activeSlide.title ? ": " + activeSlide.title : ""}`}
      </div>
    </div>
  );
}

export default InkBlotCarousel;
