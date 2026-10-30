import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import "./PerspectiveTunnelHero.exact.css";

export const meta = {
  title: "Inzeedo Perspective Tunnel Hero",
  description: "Spatial 3D perspective warp corridor hero with interactive camera parallax, trackpad/wheel scrub travel, Fibonacci golden angle card distribution, and atmospheric radial orbit staging.",
  category: "heroes",
  fullWidth: true,
  thumbnail: true,
};

export interface TunnelItem {
  src: string;
  title: string;
}

export interface TunnelCardData {
  item: TunnelItem;
  angleCos: number;
  angleSin: number;
  radiusFactorX: number;
  radiusFactorY: number;
  rotationZ: number;
  index: number;
}

const DEFAULT_ITEMS: TunnelItem[] = [
  {
    src: "https://cdn.21st.dev/assets/mirror/c3/c3fbd2afa140223999a441b32ed986f61d473930002708df805a81532a326aac.jpg",
    title: "Chroma I",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/9d/9d8b2f675a5814476ada3736ce439bcda23c5c389e0ebf9b25d8a0c09f3bbcfe.jpg",
    title: "Prism III",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/8b/8bb738bf2f00d7f7ed3c3ec034adb9938ad38f4be4ac191d632a6a11ad525574.jpg",
    title: "Ether IV",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/ac/ac5ac700b188d7ef16ee9dab868098b59f15c440db3f71d4e8c03262a3287577.jpg",
    title: "Quantum V",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/ef/ef25eff6ce655fba459b3b7e7711524dc92499aa18f6c7dbea9a0fcc56a8f908.jpg",
    title: "Nebula VI",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/f2/f28b370a5dcbf76240f1504579c4b05fc0ff0bb990a42aff8dc2f73a5dc46072.jpg",
    title: "Cyber VII",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/f2/f26a1eac85704dda924820392dedfb72d51d8261d35354f83b35d683617295f3.jpg",
    title: "Flux VIII",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/77/7755d23eaaa0aa5b403343f44afa7a29b2d06d3065fe54c602b14ba01d00f2aa.jpg",
    title: "Aether IX",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/65/657317761fe9058a1d43711b13c543a71eb5199b7a5d9abf4c28479674e39cf7.jpg",
    title: "Chroma X",
  },
];

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

function useCameraParallax(enabled: boolean) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, SPRING_CONFIG);
  const smoothY = useSpring(mouseY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, mouseX, mouseY]);

  return { x: smoothX, y: smoothY };
}

interface TunnelCardProps {
  card: TunnelCardData;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  total: number;
  stage: { width: number; height: number; isMobile: boolean };
}

function TunnelCard({ card, progress, pointer, total, stage }: TunnelCardProps) {
  const S = (card.index / total) * 0.45;
  const p = S + 0.55;

  const y = useTransform(progress, [S, p], [0, 1]);
  const m = stage.isMobile ? -1200 : -1700;
  const v = stage.isMobile ? 350 : 500;

  const b = useTransform(y, [0, 1], [m, v]);
  const E = useTransform(y, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

  const cardWidth = stage.isMobile
    ? Math.max(130, Math.min(180, stage.width * 0.38))
    : Math.max(180, Math.min(270, stage.width * 0.18));

  const N = card.angleCos * (stage.width * card.radiusFactorX);
  const L = card.angleSin * (stage.height * card.radiusFactorY);
  const H = stage.isMobile ? 20 : 45;

  const Y = useTransform(
    [b, pointer.x, pointer.y] as const,
    ([J, X, F]: readonly number[]) => {
      const q = N - X * H;
      const et = L - F * H;
      return `translate3d(calc(-50% + ${q}px), calc(-50% + ${et}px), ${J}px) rotateZ(${card.rotationZ}deg)`;
    }
  );

  return (
    <motion.div
      style={{
        width: cardWidth,
        transform: Y,
        opacity: E,
        zIndex: card.index + 1,
      }}
      className="pointer-events-auto absolute left-1/2 top-1/2 aspect-[4/5] will-change-transform select-none cursor-pointer"
    >
      <div className="group relative h-full w-full overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-900 shadow-2xl shadow-neutral-950/20 dark:shadow-black/90 ring-1 ring-black/10 dark:ring-white/15 transition-all duration-500 hover:ring-indigo-500/70 dark:hover:ring-indigo-400/70 hover:shadow-indigo-500/25">
        <img
          src={card.item.src}
          alt={card.item.title}
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-4 sm:p-5">
          <span className="text-xs sm:text-sm font-mono tracking-widest uppercase text-white/95 drop-shadow-md">
            {card.item.title}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export interface PerspectiveTunnelHeroProps {
  items?: TunnelItem[];
  className?: string;
}

export function PerspectiveTunnelHero({
  items = DEFAULT_ITEMS,
  className = "",
}: PerspectiveTunnelHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const [stage, setStage] = useState({
    width: 1440,
    height: 900,
    isMobile: false,
  });

  useEffect(() => {
    const updateDimensions = () => {
      setStage({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 1e-4,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const current = rawProgress.get();
      const delta = e.deltaY * 0.0008;
      const next = Math.min(1, Math.max(0, current + delta));
      rawProgress.set(next);
    };

    // Touch support for smooth mobile interaction
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const delta = (touchStartY - touchY) * 0.002;
      touchStartY = touchY;
      const current = rawProgress.get();
      const next = Math.min(1, Math.max(0, current + delta));
      rawProgress.set(next);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [rawProgress]);

  const pointer = useCameraParallax(!reducedMotion);

  // Exact scale and opacity interpolation mappings
  const heroScale = useTransform(smoothProgress, [0, 0.5, 1], [0.7, 1, 1.35]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.12, 0.85, 1], [0.25, 1, 1, 0]);
  const hintOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0]);

  // Fibonacci golden angle distribution matching bundle t0 formula
  const tunnelCards: TunnelCardData[] = React.useMemo(() => {
    return items.map((item, idx) => {
      const angle = idx * 137.5 * (Math.PI / 180);
      const radX = 0.28 + (idx % 3) * 0.08;
      const radY = 0.26 + (idx % 2) * 0.09;
      return {
        item,
        angleCos: Math.cos(angle),
        angleSin: Math.sin(angle),
        radiusFactorX: radX,
        radiusFactorY: radY,
        rotationZ: (idx % 2 === 0 ? 1 : -1) * (3 + (idx % 5) * 2),
        index: idx,
      };
    });
  }, [items]);

  return (
    <div
      ref={containerRef}
      className={`relative h-[100svh] w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white select-none flex items-center justify-center ${className}`}
      style={{
        perspective: stage.isMobile ? "900px" : "1200px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Background Dot Matrix Grid */}
      <div className="pointer-events-none absolute inset-0 pth-grid opacity-70 dark:opacity-65" />

      {/* Atmospheric Center Glow */}
      <div className="pointer-events-none absolute inset-0 pth-radial-core" />

      {/* Orbital Circles */}
      <div className="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-indigo-500/15 dark:border-indigo-400/10" />
      <div className="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-neutral-300/60 dark:border-white/10" />

      {/* Center Cinematic Hero Typography */}
      <motion.div
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="pointer-events-none z-0 flex flex-col items-center text-center px-6 max-w-xl"
      >
        <p className="text-xs font-mono uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400 mb-4">
          Warp Drive Sequence
        </p>
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-[0.9] bg-gradient-to-b from-neutral-950 via-neutral-800 to-neutral-400 dark:from-white dark:via-white dark:to-white/40 bg-clip-text text-transparent">
          INTO THE
          <br />
          ETHER.
        </h1>
        <p className="mt-4 max-w-[36ch] text-sm sm:text-base font-light text-neutral-600 dark:text-neutral-400">
          Scroll your trackpad or mouse wheel to fly through the spatial 3D corridor.
        </p>
      </motion.div>

      {/* Bottom Scroll Prompt */}
      <motion.div
        style={{ opacity: hintOpacity }}
        className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400"
      >
        <span>Scroll to Explore</span>
        <div className="h-6 w-px bg-gradient-to-b from-indigo-500 to-transparent" />
      </motion.div>

      {/* 3D Perspective Card Tunnel Corridor */}
      <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
        {tunnelCards.map((card) => (
          <TunnelCard
            key={card.index}
            card={card}
            progress={smoothProgress}
            pointer={pointer}
            total={tunnelCards.length}
            stage={stage}
          />
        ))}
      </div>
    </div>
  );
}

export default PerspectiveTunnelHero;
