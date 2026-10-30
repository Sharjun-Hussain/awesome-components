import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import "./LensZoomCarousel.exact.css";

export const meta = {
  title: "Inzeedo Lens Zoom Hero Carousel",
  description: "Hero carousel featuring optical lens focal zoom depth transitions with chromatic refraction ghosting, procedural misty landscape synthesis, gesture swipe, keyboard navigation, and auto-play progress tracking.",
  category: "carousels",
  fullWidth: true,
  thumbnail: true,
};

export interface LensZoomSlide {
  title?: string;
  caption?: string;
  image?: string;
  alt?: string;
  palette?: "dawn" | "alpine" | "dusk" | "mist";
  seed?: number;
}

// Math & Utility Helpers
const wrapIndex = (idx: number, len: number) => (len ? ((idx % len) + len) % len : 0);

const ghostScale = (baseScale: number, step: number) =>
  baseScale + (baseScale - 1) * 0.6 * (step + 1);

const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

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
function useSlideImages(slides: LensZoomSlide[]) {
  return useMemo(
    () =>
      slides.map((s, idx) =>
        s.image ? s.image : paintProceduralLandscape(s.seed ?? idx + 1, s.palette || "dawn")
      ),
    [slides]
  );
}

// Default Inzeedo Lens Zoom Slides
const DEFAULT_SLIDES: LensZoomSlide[] = [
  {
    title: "Above the Clouds",
    caption: "Inzeedo Optics — Valais, Switzerland at sunrise elevation 3,100m.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1800&auto=format&fit=crop",
  },
  {
    title: "Glass Lake",
    caption: "Inzeedo Focus — Lago di Braies, crystal reflections at noon.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1800&auto=format&fit=crop",
  },
  {
    title: "Gold Valley",
    caption: "Inzeedo Atmosphere — Late amber light pouring over the alpine ridge.",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1800&auto=format&fit=crop",
  },
  {
    title: "Snow Line",
    caption: "Inzeedo Clarity — Pines, river flats and the crisp high range.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1800&auto=format&fit=crop",
  },
  {
    title: "Blue Ridges",
    caption: "Inzeedo Depth — Seven atmospheric layers of haze before dusk.",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1800&auto=format&fit=crop",
  },
  {
    title: "Falls Bridge",
    caption: "Inzeedo Horizon — Multnomah falls veiled in clean morning rain.",
    image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=1800&auto=format&fit=crop",
  },
];

export interface LensZoomCarouselProps {
  slides?: LensZoomSlide[];
  height?: string;
  duration?: number;
  depth?: number;
  autoplay?: number;
  ink?: string;
  onChange?: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export function LensZoomCarousel({
  slides = DEFAULT_SLIDES,
  height = "100svh",
  duration = 1050,
  depth = 1.35,
  autoplay = 6000,
  ink = "#ffffff",
  onChange,
  className = "",
  style,
  ariaLabel = "Inzeedo Hero Lens Zoom Carousel",
}: LensZoomCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const totalSlides = slides.length;
  const slideImages = useSlideImages(slides);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionState, setTransitionState] = useState<{
    to: number;
    dir: number;
    id: number;
  } | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback(
    (dir: number) => {
      if (transitionState || totalSlides < 2) return;
      setTransitionState({
        to: wrapIndex(currentIndex + dir, totalSlides),
        dir,
        id: Date.now(),
      });
    },
    [currentIndex, totalSlides, transitionState]
  );

  const onCommitTransition = useCallback(() => {
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
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      goToSlide(dx < 0 ? 1 : -1);
    }
  };

  const stopNavPropagation = (e: React.PointerEvent) => e.stopPropagation();

  const activeIndex = transitionState ? transitionState.to : currentIndex;
  const activeSlide = slides[activeIndex] || {};
  const effectiveDepth = transitionState
    ? transitionState.dir >= 0
      ? depth
      : 1 / depth
    : depth;

  return (
    <div
      ref={containerRef}
      className={["lz-root", className].filter(Boolean).join(" ")}
      style={
        {
          height,
          "--lz-ink": ink,
          "--lz-d": `${duration}ms`,
          "--lz-auto": `${autoplay}ms`,
          ...style,
        } as React.CSSProperties
      }
      data-moving={transitionState ? "1" : "0"}
      data-paused={isPaused ? "1" : "0"}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* Base Slide Background with Zoom Out / Brightness shift when moving */}
      <div className="lz-base">
        {slideImages[currentIndex] && (
          <img
            className="lz-img"
            src={slideImages[currentIndex]}
            alt={slides[currentIndex]?.alt || slides[currentIndex]?.title || ""}
            draggable={false}
          />
        )}
      </div>

      {/* Optical Lens Zoom Transition with Chromatic Refraction Ghosts */}
      {transitionState && (
        <div
          key={transitionState.id}
          className="lz-in"
          style={
            {
              "--lz-depth": String(effectiveDepth),
            } as React.CSSProperties
          }
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget) {
              onCommitTransition();
            }
          }}
          aria-hidden="true"
        >
          {slideImages[transitionState.to] && (
            <img
              className="lz-img lz-main"
              src={slideImages[transitionState.to]}
              alt=""
              draggable={false}
            />
          )}

          {slideImages[transitionState.to] &&
            [1, 0].map((step) => (
              <img
                key={step}
                className="lz-img lz-ghost"
                src={slideImages[transitionState.to]}
                alt=""
                draggable={false}
                style={
                  {
                    "--lz-g": String(ghostScale(effectiveDepth, step)),
                    animationDelay: `${step * 40}ms`,
                  } as React.CSSProperties
                }
              />
            ))}
        </div>
      )}

      {/* Atmospheric Shadow Gradient */}
      <div className="lz-shade" aria-hidden="true" />

      {/* Slide Typography Line Mask */}
      <div className="lz-text" aria-hidden="true" key={"t" + activeIndex}>
        {activeSlide.title && (
          <span className="lz-line lz-title">
            <span>{activeSlide.title}</span>
          </span>
        )}
        {activeSlide.caption && (
          <span className="lz-line lz-cap">
            <span>{activeSlide.caption}</span>
          </span>
        )}
      </div>

      {/* Navigation Controls & Counter */}
      <div className="lz-nav" onPointerDown={stopNavPropagation} onPointerUp={stopNavPropagation}>
        <span className="lz-count" aria-hidden="true">
          {pad2(activeIndex + 1)} / {pad2(totalSlides)}
        </span>
        <button
          type="button"
          className="lz-btn"
          aria-label="Previous slide"
          onClick={() => goToSlide(-1)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <button
          type="button"
          className="lz-btn"
          aria-label="Next slide"
          onClick={() => goToSlide(1)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>

      {/* Autoplay Progress Line Tracker */}
      <div className="lz-track" aria-hidden="true">
        <div
          key={"f" + currentIndex}
          className="lz-fill"
          data-run={autoplay > 0 && totalSlides > 1 && !transitionState ? "1" : "0"}
          onAnimationEnd={() => goToSlide(1)}
        />
      </div>

      <div className="lz-sr" aria-live="polite">
        {`Slide ${activeIndex + 1} of ${totalSlides}${activeSlide.title ? ": " + activeSlide.title : ""}`}
      </div>
    </div>
  );
}

export default LensZoomCarousel;
