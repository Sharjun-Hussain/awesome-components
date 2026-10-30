import { useState, useRef, useEffect, useId, useMemo } from "react";
import { cn } from "@/lib/utils";
import "./MorphingText.exact.css";

export const meta = {
  title: "Inzeedo Morphing Text",
  description: "Dynamic typographic morphing animation utilizing SVG feColorMatrix threshold filter and non-linear blur opacity interpolation, built with first-class accessibility and screen reader support.",
  category: "text",
  fullWidth: true,
  thumbnail: true,
};

function usePrefersReducedMotion() {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return matches;
}

export interface MorphingTextProps {
  words: string[];
  interval?: number;
  morphDuration?: number;
  accessibleText?: "list" | "first";
  announce?: boolean;
  className?: string;
}

export function MorphingText({
  words,
  interval = 2200,
  morphDuration = 900,
  accessibleText = "list",
  announce = false,
  className,
}: MorphingTextProps) {
  const filterId = `klyv-morph-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const prefersReducedMotion = usePrefersReducedMotion();
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const wordsKey = words.join("\0");
  const isMorphActive = !prefersReducedMotion && words.length > 1;

  useEffect(() => {
    const el1 = text1Ref.current;
    const el2 = text2Ref.current;
    if (!isMorphActive || !el1 || !el2) return;

    let textIndex = 0;
    let morphTime = 0;
    let holdCooldown = interval;
    let lastTime = performance.now();
    let rafId = 0;

    const settle = () => {
      el1.textContent = words[textIndex % words.length];
      el1.style.filter = "";
      el1.style.opacity = "1";
      el2.style.filter = "";
      el2.style.opacity = "0";
    };

    const blend = (fraction: number) => {
      el1.textContent = words[textIndex % words.length];
      el2.textContent = words[(textIndex + 1) % words.length];
      const invFraction = 1 - fraction;

      el2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      el2.style.opacity = `${Math.pow(fraction, 0.4)}`;

      el1.style.filter = `blur(${Math.min(8 / invFraction - 8, 100)}px)`;
      el1.style.opacity = `${Math.pow(invFraction, 0.4)}`;
    };

    const step = (now: number) => {
      const dt = Math.min(now - lastTime, 100);
      lastTime = now;

      if (holdCooldown > 0) {
        holdCooldown -= dt;
      } else {
        morphTime += dt;
        const progress = morphTime / morphDuration;
        if (progress >= 1) {
          textIndex = (textIndex + 1) % words.length;
          morphTime = 0;
          holdCooldown = interval;
          settle();
          setCurrentIndex(textIndex);
        } else {
          blend(progress);
        }
      }

      rafId = requestAnimationFrame(step);
    };

    settle();
    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      settle();
    };
  }, [isMorphActive, interval, morphDuration, wordsKey, words]);

  // Compute longest word to allocate full bounding box layout
  const longestWord = useMemo(
    () => words.reduce((acc, curr) => (curr.length > acc.length ? curr : acc), ""),
    [words]
  );

  const screenReaderText = accessibleText === "list" ? words.join(", ") : words[0] ?? "";

  return (
    <span className={cn("relative inline-block whitespace-nowrap align-baseline", className)}>
      {/* Accessible text for screen readers */}
      <span className="sr-only">{screenReaderText}</span>
      {announce && (
        <span className="sr-only" role="status" aria-live="polite">
          {words[currentIndex]}
        </span>
      )}

      {/* Sizing placeholder to reserve the widest word bounds */}
      <span aria-hidden="true" className="invisible">
        {prefersReducedMotion ? words[0] : longestWord}
      </span>

      {isMorphActive ? (
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{ filter: `url(#${filterId}) blur(0.4px)` }}
        >
          <span ref={text1Ref} className="absolute inset-x-0 top-0 text-center" />
          <span ref={text2Ref} className="absolute inset-x-0 top-0 text-center opacity-0" />
        </span>
      ) : (
        <span aria-hidden="true" className="absolute inset-x-0 top-0 text-center">
          {words[0]}
        </span>
      )}

      {/* SVG feColorMatrix threshold filter creates gooey font morph */}
      {isMorphActive && (
        <svg aria-hidden="true" className="absolute size-0">
          <defs>
            <filter id={filterId}>
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140"
              />
            </filter>
          </defs>
        </svg>
      )}
    </span>
  );
}

export interface MorphingTextDemoProps {
  words?: string[];
  prefix?: string;
  className?: string;
}

export function MorphingTextDemo({
  words = ["fast", "accessible", "considered", "yours"],
  prefix = "Interfaces that feel",
  className = "",
}: MorphingTextDemoProps) {
  return (
    <div className={cn("flex w-full items-center justify-center bg-background px-6 py-24", className)}>
      <div className="max-w-xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {prefix}{" "}
          <MorphingText
            words={words}
            className="text-primary font-bold"
          />
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          A screen reader hears “{words.join(", ")}” once, not a new word every two seconds.
        </p>
      </div>
    </div>
  );
}

export default MorphingTextDemo;
