import { useRef, useState, useEffect, useCallback } from "react";
import "./OnformStudioFooter.exact.css";

export const meta = {
  title: "Inzeedo ONFORM Studio Footer",
  description: "Exact closing scene footer from onform.studio featuring curved edge transition, looping deep ocean video backdrop, responsive typographic hierarchy, dynamic Amsterdam local time, and physics spring letter wave ripple effect.",
  category: 'footers',
  fullWidth: true,
  thumbnail: true,
};

interface LetterState {
  char: string;
  y: number;
  velocity: number;
}

export interface OnformStudioFooterProps {
  eyebrow?: string;
  headingLine1?: string;
  headingLine2?: string;
  asideText?: string;
  ctaText?: string;
  ctaHref?: string;
  email?: string;
  locationLine1?: string;
  locationLine2?: string;
  navLinks?: { label: string; href: string }[];
  wordmarkText?: string;
  copyrightYear?: number | string;
  copyrightName?: string;
  legalLinks?: { label: string; href: string }[];
  timeZone?: string;
  videoSrc?: string;
  videoPoster?: string;
  className?: string;
}

export function OnformStudioFooter({
  eyebrow = "Have something in mind?",
  headingLine1 = "Let’s give your",
  headingLine2 = "brand form.",
  asideText = "Thoughtful websites and digital identities. Built around you.",
  ctaText = "Start a conversation",
  ctaHref = "/contact/",
  email = "hello@onform.studio",
  locationLine1 = "Based in Europe.",
  locationLine2 = "Working worldwide.",
  navLinks = [
    { label: "Work", href: "#work" },
    { label: "Studio", href: "#studio" },
    { label: "Pricing", href: "#pricing" },
  ],
  wordmarkText = "ONFORM",
  copyrightYear = 2026,
  copyrightName = "ONFORM",
  legalLinks = [
    { label: "Privacy Policy", href: "/privacy/" },
    { label: "Terms of Service", href: "/terms/" },
  ],
  timeZone = "Europe/Amsterdam",
  videoSrc = "https://www.onform.studio/assets/onform/footer-ocean-loop-v3.mp4",
  videoPoster = "https://www.onform.studio/assets/onform/footer-ocean-loop-v3.jpg",
  className = "",
}: OnformStudioFooterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wordmarkRef = useRef<HTMLAnchorElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Local Time tracking (defaults to Europe/Amsterdam)
  const formatTime = useCallback(() => {
    try {
      const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
        hour12: true,
      });
      return formatter.format(new Date()).toUpperCase();
    } catch {
      return new Date().toLocaleTimeString();
    }
  }, [timeZone]);

  const [localTime, setLocalTime] = useState(formatTime);

  useEffect(() => {
    const updateClock = () => setLocalTime(formatTime());
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, [formatTime]);

  // Video lazy loading & playback synchronization
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      video.pause();
      return;
    }

    let isVisible = false;

    const syncVideo = () => {
      if (!isVisible || document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          syncVideo();
        });
      },
      { rootMargin: "200px" }
    );

    observer.observe(video);
    document.addEventListener("visibilitychange", syncVideo);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncVideo);
    };
  }, []);

  // Split wordmark into letters array for interactive physics wave
  const lettersState = useRef<LetterState[]>([]);
  useEffect(() => {
    lettersState.current = [...wordmarkText].map((char) => ({
      char,
      y: 0,
      velocity: 0,
    }));
  }, [wordmarkText]);

  // Exact letter ripple physics loop replicating ONFORM's attachLetterRipple
  useEffect(() => {
    const mark = wordmarkRef.current;
    if (!mark) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let active = false;
    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;
    let previous = 0;
    let waveAt = 0;
    let origin = -1;

    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      active = false;
      origin = -1;
      lettersState.current.forEach((letter, i) => {
        letter.y = 0;
        letter.velocity = 0;
        const el = letterRefs.current[i];
        if (el) el.style.removeProperty("transform");
      });
      mark.classList.remove("is-rippling");
    };

    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.032);
      previous = now;
      const rect = mark.getBoundingClientRect();
      const letters = lettersState.current;
      const amplitude = Math.min(16, rect.height * 0.085);
      const width = rect.width / (letters.length || 1);

      const nearby = !active
        ? -1
        : Math.max(0, Math.min(letters.length - 1, Math.floor((pointerX - rect.left) / width)));

      if (nearby !== origin && active) {
        origin = nearby;
        waveAt = now;
      }

      const vertical = active
        ? Math.max(0, 1 - Math.abs(pointerY - (rect.top + rect.height / 2)) / (rect.height * 0.9))
        : 0;

      let moving = false;

      letters.forEach((letter, i) => {
        const distance = (rect.left + (i + 0.5) * width - pointerX) / width;
        let target = active ? -amplitude * Math.exp((-distance * distance) / 1.6) * vertical : 0;
        const age = (now - waveAt) / 1000 - Math.abs(i - origin) * 0.055;
        if (active && age > 0 && age < 0.65) {
          target -= Math.sin((age * Math.PI) / 0.65) * amplitude * 0.16 * Math.exp(-Math.abs(i - origin) * 0.5);
        }

        // Critically damped harmonic spring
        letter.velocity += ((target - letter.y) * 210 - letter.velocity * 29) * dt;
        letter.y += letter.velocity * dt;

        if (Math.abs(letter.y - target) > 0.025 || Math.abs(letter.velocity) > 0.08) {
          moving = true;
        }

        const el = letterRefs.current[i];
        if (el) {
          if (!active && Math.abs(letter.y) < 0.025 && Math.abs(letter.velocity) < 0.08) {
            letter.y = 0;
            letter.velocity = 0;
            el.style.removeProperty("transform");
          } else {
            el.style.transform = `translate3d(0,${letter.y.toFixed(3)}px,0)`;
          }
        }
      });

      if (moving || (active && now - waveAt < 1000)) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
        if (!active) mark.classList.remove("is-rippling");
      }
    };

    const start = () => {
      if (!frame && !reduced.matches && fine.matches) {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !fine.matches || reduced.matches) return;
      active = true;
      pointerX = e.clientX;
      pointerY = e.clientY;
      mark.classList.add("is-rippling");
      start();
    };

    const onPointerLeave = () => {
      active = false;
      start();
    };

    const onFocus = () => {
      if (!mark.matches(":focus-visible") || reduced.matches || !fine.matches) return;
      const rect = mark.getBoundingClientRect();
      active = true;
      pointerX = rect.left + rect.width * 0.5;
      pointerY = rect.top + rect.height * 0.5;
      mark.classList.add("is-rippling");
      start();
    };

    const onBlur = () => {
      active = false;
      start();
    };

    mark.addEventListener("pointerenter", onPointerMove);
    mark.addEventListener("pointermove", onPointerMove);
    mark.addEventListener("pointerleave", onPointerLeave);
    mark.addEventListener("focus", onFocus);
    mark.addEventListener("blur", onBlur);
    window.addEventListener("blur", clear);
    window.addEventListener("pagehide", clear);

    return () => {
      mark.removeEventListener("pointerenter", onPointerMove);
      mark.removeEventListener("pointermove", onPointerMove);
      mark.removeEventListener("pointerleave", onPointerLeave);
      mark.removeEventListener("focus", onFocus);
      mark.removeEventListener("blur", onBlur);
      window.removeEventListener("blur", clear);
      window.removeEventListener("pagehide", clear);
      cancelAnimationFrame(frame);
    };
  }, [wordmarkText]);

  return (
    <div ref={containerRef} className={`onform-footer-scene ${className}`}>
      {/* Background Looping Ocean Video */}
      <div className="onform-footer__media" aria-hidden="true">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={videoPoster}
          width="1920"
          height="1080"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>

      {/* Signature Curving Top Edge Transition */}
      <div className="footer-curve" aria-hidden="true">
        <div />
      </div>

      {/* Main Footer Content */}
      <footer className="contact-footer onform-footer" id="contact" aria-labelledby="contact-title">
        <div className="contact-footer__inner">
          <p className="onform-footer__eyebrow">{eyebrow}</p>
          <div className="onform-footer__grid">
            <div className="contact-footer__heading">
              <h2 id="contact-title">
                <span className="motion-mask">
                  <span className="motion-line">{headingLine1}</span>
                </span>
                <span className="motion-mask">
                  <span className="motion-line">{headingLine2}</span>
                </span>
              </h2>
            </div>
            <div className="onform-footer__aside">
              <p>{asideText}</p>
              <div>
                <a className="onform-footer__contact" aria-label={ctaText} href={ctaHref}>
                  <span>{ctaText}</span>
                  <span aria-hidden="true">
                    <svg
                      className="onform-vector-arrow"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="M5 19 19 5M5 5h14v14"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>
                <a className="onform-footer__email" href={`mailto:${email}`}>
                  {email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Middle Links & Location */}
        <div className="footer-bottom">
          <p className="onform-footer__location">
            <span>{locationLine1}</span>
            {locationLine2}
          </p>
          <nav className="onform-footer__navigation" aria-label="Footer navigation">
            {navLinks.map((link, i) => (
              <a key={i} href={link.href}>
                {link.label}
              </a>
            ))}
            <a href="#top">
              Back to top{" "}
              <svg
                className="onform-vector-arrow"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M5 19 19 5M5 5h14v14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </nav>
        </div>

        {/* Huge Interactive Physics-Rippling Wordmark */}
        <a
          ref={wordmarkRef}
          className="onform-footer__wordmark"
          href="#top"
          aria-label={`${wordmarkText} home`}
        >
          {[...wordmarkText].map((char, index) => (
            <span
              key={index}
              ref={(el) => {
                letterRefs.current[index] = el;
              }}
              className="onform-footer__letter"
              aria-hidden="true"
            >
              {char}
            </span>
          ))}
        </a>

        {/* Bottom Legal, Nav & Live Amsterdam Clock */}
        <div className="onform-footer__legal">
          <p>© {copyrightYear} {copyrightName}</p>
          <nav className="onform-legal-links" aria-label="Legal navigation">
            {legalLinks.map((link, i) => (
              <a key={i} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <p>
            Local time <span data-local-time>{localTime}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default OnformStudioFooter;
