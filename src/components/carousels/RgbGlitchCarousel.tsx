import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import "./RgbGlitchCarousel.exact.css";

export const meta = {
  title: "Inzeedo RGB Glitch Hero Carousel",
  description: "Hero carousel featuring authentic multi-channel RGB chromatic displacement split glitch transitions, procedural landscape synthesis, gesture swipe, keyboard navigation, and auto-play progress tracking.",
  category: "carousels",
  fullWidth: true,
  thumbnail: true,
};

export interface RgbGlitchSlide {
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

const glitchAmp = (progress: number) => Math.sin(Math.PI * Math.min(1, Math.max(0, progress)));

const showsNext = (progress: number) => progress >= 0.5;

function coverRect(imgW: number, imgH: number, contW: number, contH: number): [number, number, number, number] {
  const scale = Math.max(contW / imgW, contH / imgH);
  return [(contW - imgW * scale) / 2, (contH - imgH * scale) / 2, imgW * scale, imgH * scale];
}

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
function useSlideImages(slides: RgbGlitchSlide[]) {
  return useMemo(
    () =>
      slides.map((s, idx) =>
        s.image ? s.image : paintProceduralLandscape(s.seed ?? idx + 1, s.palette || "dawn")
      ),
    [slides]
  );
}

// Sub-component: RGB Glitch Transition Canvas Layer
interface RgbLayerProps {
  from: string;
  to: string;
  w: number;
  h: number;
  duration: number;
  opts: { intensity?: number };
  onDone: () => void;
}

function RgbGlitchLayer({ from, to, w, h, duration, opts, onDone }: RgbLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      onDoneRef.current();
      return;
    }

    let isCancelled = false;
    let rafId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const pixelW = Math.round(w * dpr);
    const pixelH = Math.round(h * dpr);
    canvas.width = pixelW;
    canvas.height = pixelH;

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => img.decode().catch(() => {}).then(() => resolve(img));
        img.onerror = reject;
        img.src = src;
      });

    const splitChannels = (img: HTMLImageElement) =>
      ["#f00", "#0f0", "#00f"].map((color) => {
        const c = document.createElement("canvas");
        c.width = pixelW;
        c.height = pixelH;
        const cCtx = c.getContext("2d");
        if (cCtx) {
          const [sx, sy, sw, sh] = coverRect(img.naturalWidth, img.naturalHeight, pixelW, pixelH);
          cCtx.drawImage(img, sx, sy, sw, sh);
          cCtx.globalCompositeOperation = "multiply";
          cCtx.fillStyle = color;
          cCtx.fillRect(0, 0, pixelW, pixelH);
        }
        return c;
      });

    Promise.all([loadImage(from), loadImage(to)])
      .then(([imgFrom, imgTo]) => {
        if (isCancelled) return;
        const channelsFrom = splitChannels(imgFrom);
        const channelsTo = splitChannels(imgTo);
        const baseOffset = 26 * dpr * (opts.intensity ?? 1);
        const startTime = performance.now();

        const renderFrame = (now: number) => {
          if (isCancelled) return;
          const progress = Math.min(1, (now - startTime) / duration);
          const currentChannels = showsNext(progress) ? channelsTo : channelsFrom;
          const amp = glitchAmp(progress);
          const offset = amp * baseOffset;

          // Base black canvas
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, pixelW, pixelH);

          // Additive blend of R, G, B channels with chromatic shift
          ctx.globalCompositeOperation = "lighter";
          ctx.drawImage(currentChannels[0], -offset, 0);
          ctx.drawImage(currentChannels[1], 0, offset * 0.3);
          ctx.drawImage(currentChannels[2], offset, 0);

          // Horizontal glitch scanlines and slice displacement
          const sliceCount = 9;
          for (let i = 0; i < sliceCount; i++) {
            const sliceY = Math.random() * pixelH;
            const sliceH = (6 + Math.random() * 46) * dpr;
            const sliceOffset = (Math.random() - 0.5) * 160 * dpr * amp * (opts.intensity ?? 1);

            ctx.globalCompositeOperation = "source-over";
            ctx.fillRect(0, sliceY, pixelW, sliceH);

            ctx.globalCompositeOperation = "lighter";
            currentChannels.forEach((chan, cIdx) => {
              ctx.drawImage(
                chan,
                0,
                sliceY,
                pixelW,
                sliceH,
                sliceOffset + (cIdx - 1) * 14 * dpr * amp,
                sliceY,
                pixelW,
                sliceH
              );
            });
          }

          if (progress < 1) {
            rafId = requestAnimationFrame(renderFrame);
          } else {
            onDoneRef.current();
          }
        };

        rafId = requestAnimationFrame(renderFrame);
      })
      .catch(() => {
        if (!isCancelled) onDoneRef.current();
      });

    return () => {
      isCancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [duration, from, h, opts.intensity, prefersReduced, to, w]);

  if (prefersReduced) {
    return (
      <img
        className="rg-in rg-fade"
        src={to}
        alt=""
        aria-hidden="true"
        onAnimationEnd={onDone}
      />
    );
  }

  return <canvas ref={canvasRef} className="rg-in" aria-hidden="true" />;
}

// Default Inzeedo RGB Glitch Photography Slides
const DEFAULT_SLIDES: RgbGlitchSlide[] = [
  {
    title: "Above the Clouds",
    caption: "Inzeedo Vision — Valais, Switzerland at sunrise elevation 3,100m.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1800&auto=format&fit=crop",
  },
  {
    title: "Glass Lake",
    caption: "Inzeedo Spectrum — Lago di Braies, crystal reflections at noon.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1800&auto=format&fit=crop",
  },
  {
    title: "Gold Valley",
    caption: "Inzeedo Horizon — Late amber light pouring over the alpine ridge.",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1800&auto=format&fit=crop",
  },
  {
    title: "Snow Line",
    caption: "Inzeedo Cyber — Pines, river flats and the crisp high range.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1800&auto=format&fit=crop",
  },
  {
    title: "Blue Ridges",
    caption: "Inzeedo Frequency — Seven atmospheric layers of haze before dusk.",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1800&auto=format&fit=crop",
  },
  {
    title: "Falls Bridge",
    caption: "Inzeedo Cascade — Multnomah falls veiled in clean morning rain.",
    image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=1800&auto=format&fit=crop",
  },
  {
    title: "Morning Fog",
    caption: "Inzeedo Shift — Cloud pouring over the high pass at first light.",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1800&auto=format&fit=crop",
  },
  {
    title: "Green Cathedral",
    caption: "Inzeedo Biosphere — Beech trunks and late-summer light.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1800&auto=format&fit=crop",
  },
];

export interface RgbGlitchCarouselProps {
  slides?: RgbGlitchSlide[];
  height?: string;
  duration?: number;
  intensity?: number;
  autoplay?: number;
  ink?: string;
  onChange?: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export function RgbGlitchCarousel({
  slides = DEFAULT_SLIDES,
  height = "100svh",
  duration = 700,
  intensity = 1,
  autoplay = 6000,
  ink = "#ffffff",
  onChange,
  className = "",
  style,
  ariaLabel = "Inzeedo Hero RGB Glitch Carousel",
}: RgbGlitchCarouselProps) {
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
  const opts = useMemo(() => ({ intensity }), [intensity]);

  return (
    <div
      ref={containerRef}
      className={["rg-root", className].filter(Boolean).join(" ")}
      style={
        {
          height,
          "--rg-ink": ink,
          "--rg-auto": `${autoplay}ms`,
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
      <div className="rg-base">
        {slideImages[currentIndex] && (
          <img
            className="rg-img"
            src={slideImages[currentIndex]}
            alt={slides[currentIndex]?.alt || slides[currentIndex]?.title || ""}
            draggable={false}
          />
        )}
      </div>

      {/* Dynamic Animated RGB Split Glitch Canvas Layer */}
      {transitionState && slideImages[currentIndex] && slideImages[transitionState.to] && (
        <RgbGlitchLayer
          key={transitionState.id}
          from={slideImages[currentIndex]}
          to={slideImages[transitionState.to]}
          w={transitionState.w}
          h={transitionState.h}
          duration={duration}
          opts={opts}
          onDone={onCommitTransition}
        />
      )}

      {/* Atmospheric Shadow Gradient */}
      <div className="rg-shade" aria-hidden="true" />

      {/* Slide Typography Line Mask */}
      <div className="rg-text" aria-hidden="true" key={"t" + activeIndex}>
        {activeSlide.title && (
          <span className="rg-line rg-title">
            <span>{activeSlide.title}</span>
          </span>
        )}
        {activeSlide.caption && (
          <span className="rg-line rg-cap">
            <span>{activeSlide.caption}</span>
          </span>
        )}
      </div>

      {/* Navigation Controls & Counter */}
      <div className="rg-nav" onPointerDown={stopNavPropagation} onPointerUp={stopNavPropagation}>
        <span className="rg-count" aria-hidden="true">
          {pad2(activeIndex + 1)} / {pad2(totalSlides)}
        </span>
        <button
          type="button"
          className="rg-btn"
          aria-label="Previous slide"
          onClick={() => goToSlide(-1)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <button
          type="button"
          className="rg-btn"
          aria-label="Next slide"
          onClick={() => goToSlide(1)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>

      {/* Autoplay Progress Line Tracker */}
      <div className="rg-track" aria-hidden="true">
        <div
          key={"f" + currentIndex}
          className="rg-fill"
          data-run={autoplay > 0 && totalSlides > 1 && !transitionState ? "1" : "0"}
          onAnimationEnd={() => goToSlide(1)}
        />
      </div>

      <div className="rg-sr" aria-live="polite">
        {`Slide ${activeIndex + 1} of ${totalSlides}${activeSlide.title ? ": " + activeSlide.title : ""}`}
      </div>
    </div>
  );
}

export default RgbGlitchCarousel;
