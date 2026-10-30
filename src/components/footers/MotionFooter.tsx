import React, { useEffect, useRef, forwardRef, type ElementType, type ComponentPropsWithRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/cn'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export const meta = {
  title: 'Inzeedo Cinematic Motion Footer',
  description:
    'High-end GSAP scroll-triggered curtain reveal footer with 3D magnetic buttons, animated aurora glow, angled marquee ribbons, and Inzeedo branding.',
  category: 'footers',
  fullWidth: true,
  thumbnail: true,
}

/* -------------------------------------------------------------------------- */
/* Component Styles                                                           */
/* -------------------------------------------------------------------------- */

const FOOTER_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  
  --pill-bg-1: color-mix(in oklch, var(--foreground) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);
  
  --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--background) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in oklch, var(--destructive) 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--destructive) 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

.footer-bg-grid {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%, 
    color-mix(in oklch, var(--primary) 15%, transparent) 0%, 
    color-mix(in oklch, var(--secondary) 15%, transparent) 40%, 
    transparent 70%
  );
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 
      0 10px 30px -10px var(--pill-shadow), 
      inset 0 1px 1px var(--pill-highlight), 
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 
      0 20px 40px -10px var(--pill-shadow-hover), 
      inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--foreground);
}

.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground) 5%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--foreground) 10%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground) 15%, transparent));
}
`

/* -------------------------------------------------------------------------- */
/* 3D Magnetic Interactive Button                                             */
/* -------------------------------------------------------------------------- */

type MagneticButtonProps<T extends ElementType = 'button'> = {
  as?: T
  className?: string
  children: React.ReactNode
} & ComponentPropsWithRef<T>

const MagneticButton = forwardRef<HTMLElement, MagneticButtonProps<ElementType>>(
  ({ className, children, as: Tag = 'button', ...props }, ref) => {
    const internalRef = useRef<HTMLElement>(null)

    useEffect(() => {
      if (typeof window === 'undefined') return
      const element = internalRef.current
      if (!element) return

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect()
          const centerX = rect.width / 2
          const centerY = rect.height / 2
          const distanceX = e.clientX - rect.left - centerX
          const distanceY = e.clientY - rect.top - centerY

          gsap.to(element, {
            x: distanceX * 0.4,
            y: distanceY * 0.4,
            rotationX: -distanceY * 0.15,
            rotationY: distanceX * 0.15,
            scale: 1.05,
            ease: 'power2.out',
            duration: 0.4,
          })
        }

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: 'elastic.out(1, 0.3)',
            duration: 1.2,
          })
        }

        element.addEventListener('mousemove', handleMouseMove)
        element.addEventListener('mouseleave', handleMouseLeave)

        return () => {
          element.removeEventListener('mousemove', handleMouseMove)
          element.removeEventListener('mouseleave', handleMouseLeave)
        }
      }, element)

      return () => ctx.revert()
    }, [])

    return (
      <Tag
        ref={(node: HTMLElement | null) => {
          internalRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node
        }}
        className={cn('cursor-pointer', className)}
        {...props}
      >
        {children}
      </Tag>
    )
  },
)

MagneticButton.displayName = 'MagneticButton'

/* -------------------------------------------------------------------------- */
/* Marquee Content Pill Stream                                                */
/* -------------------------------------------------------------------------- */

function MarqueeItems() {
  return (
    <div className="flex items-center space-x-12 px-6">
      <span>Accountability Redefined</span>
      <span className="text-primary/60">✦</span>
      <span>Transparent Tracking</span>
      <span className="text-secondary/60">✦</span>
      <span>Engineered by Inzeedo</span>
      <span className="text-primary/60">✦</span>
      <span>Global Partner Reach</span>
      <span className="text-secondary/60">✦</span>
      <span>inzeedo.lk</span>
      <span className="text-primary/60">✦</span>
      <span>Next-Gen Systems</span>
      <span className="text-secondary/60">✦</span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* The Cinematic Reveal Footer Component                                      */
/* -------------------------------------------------------------------------- */

function CinematicFooter({ thumbnail = false }: { thumbnail?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const giantTextRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || thumbnail) return

    const ctx = gsap.context(() => {
      // Background giant text parallax zoom & fade
      gsap.fromTo(
        giantTextRef.current,
        { y: '10vh', scale: 0.8, opacity: 0 },
        {
          y: '0vh',
          scale: 1,
          opacity: 1,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'bottom bottom',
            scrub: 1,
          },
        },
      )

      // Content elements rise up smoothly
      gsap.fromTo(
        [titleRef.current, actionsRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 40%',
            end: 'bottom bottom',
            scrub: 1,
          },
        },
      )
    }, containerRef)

    return () => ctx.revert()
  }, [thumbnail])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FOOTER_STYLES }} />

      <div
        ref={containerRef}
        className={cn('relative w-full', thumbnail ? 'h-[440px]' : 'h-screen')}
        style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
      >
        <footer
          className={cn(
            'flex w-full flex-col justify-between overflow-hidden bg-background text-foreground cinematic-footer-wrapper',
            thumbnail ? 'relative h-full' : 'fixed bottom-0 left-0 h-screen',
          )}
        >
          {/* Animated Atmospheric Background Glow */}
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />

          {/* Perspective Grid Background */}
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Giant INZEEDO Background Watermark */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none font-black"
          >
            INZEEDO
          </div>

          {/* Angled Rotating Marquee Banner */}
          <div className="absolute top-10 left-0 w-full overflow-hidden border-y border-border/50 bg-background/60 backdrop-blur-md py-3.5 z-10 -rotate-2 scale-110 shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-muted-foreground uppercase">
              <MarqueeItems />
              <MarqueeItems />
            </div>
          </div>

          {/* Main Hero Callout Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto">
            <h2
              ref={titleRef}
              className="text-5xl md:text-8xl font-black footer-text-glow tracking-tighter mb-10 text-center"
            >
              Ready to begin?
            </h2>

            <div ref={actionsRef} className="flex flex-col items-center gap-6 w-full">
              {/* Primary Download & Access Actions */}
              <div className="flex flex-wrap justify-center gap-4 w-full">
                {/* Apple Store Pill */}
                <MagneticButton
                  as="a"
                  href="https://inzeedo.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-glass-pill px-8 md:px-10 py-4 md:py-5 rounded-full text-foreground font-bold text-sm md:text-base flex items-center gap-3 group"
                >
                  <svg
                    className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.79 3.59-.76 1.56.04 2.87.67 3.55 1.76-3.13 1.77-2.62 5.92.35 7.14-.65 1.58-1.57 3.1-2.57 4.03zm-3.21-14.7c-.55 1.4-1.89 2.37-3.25 2.28.09-1.5 1.05-2.82 2.38-3.4 1.25-.57 2.66-.41 3.25.04-.15.35-.26.72-.38 1.08z" />
                  </svg>
                  <span>Download iOS</span>
                </MagneticButton>

                {/* Google Play Pill */}
                <MagneticButton
                  as="a"
                  href="https://inzeedo.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-glass-pill px-8 md:px-10 py-4 md:py-5 rounded-full text-foreground font-bold text-sm md:text-base flex items-center gap-3 group"
                >
                  <svg
                    className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0222 3.503C15.5902 8.242 13.8533 7.85 12 7.85c-1.8533 0-3.5902.392-5.1369 1.1004L4.841 5.4475a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3436-4.1021-2.6893-7.5743-6.1185-9.4396" />
                  </svg>
                  <span>Download Android</span>
                </MagneticButton>
              </div>

              {/* Auxiliary Quick Links */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-5 w-full mt-2">
                <MagneticButton
                  as="a"
                  href="https://inzeedo.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-glass-pill px-6 py-2.5 rounded-full text-muted-foreground font-medium text-xs md:text-sm hover:text-foreground"
                >
                  Privacy Policy
                </MagneticButton>
                <MagneticButton
                  as="a"
                  href="https://inzeedo.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-glass-pill px-6 py-2.5 rounded-full text-muted-foreground font-medium text-xs md:text-sm hover:text-foreground"
                >
                  Terms of Service
                </MagneticButton>
                <MagneticButton
                  as="a"
                  href="https://inzeedo.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-glass-pill px-6 py-2.5 rounded-full text-muted-foreground font-medium text-xs md:text-sm hover:text-foreground"
                >
                  inzeedo.lk
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Crafted By */}
          <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-muted-foreground text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1">
              &copy; 2026 Inzeedo. All rights reserved.
            </div>

            <div className="footer-glass-pill px-6 py-3 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default border-border/50">
              <span className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest">
                Crafted with
              </span>
              <span className="animate-footer-heartbeat text-sm md:text-base text-rose-500">
                ❤
              </span>
              <span className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest">
                by
              </span>
              <a
                href="https://inzeedo.lk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground font-black text-xs md:text-sm tracking-normal ml-1 hover:underline"
              >
                Inzeedo
              </a>
            </div>

            {/* Scroll-To-Top Button */}
            <MagneticButton
              as="button"
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-muted-foreground hover:text-foreground group order-3"
              aria-label="Scroll to top"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Full Page Demo with Scroll Trigger Reveal Section                          */
/* -------------------------------------------------------------------------- */

export default function MotionFooterDemo({ thumbnail = false }: { thumbnail?: boolean }) {
  if (thumbnail) {
    return <CinematicFooter thumbnail={true} />
  }

  return (
    <div className="relative w-full bg-background min-h-screen font-sans selection:bg-white/20 overflow-x-hidden">
      {/* Scrollable Upper Content Container */}
      <main className="relative z-10 w-full min-h-[110vh] bg-background flex flex-col items-center justify-center text-foreground border-b border-border/40 shadow-2xl rounded-b-[40px] px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.04)_0%,transparent_60%)] pointer-events-none" />

        <div className="max-w-2xl text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#20e3b2] font-mono">
            INZEEDO MOTION DESIGN
          </span>
          <h1 className="text-4xl md:text-6xl font-extralight tracking-tight text-foreground">
            Cinematic Scroll Footer
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Scroll down to watch the fixed background curtain unclip and reveal the full
            animated footer underneath.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">
            Scroll down to reveal
          </span>
          <div className="w-[1px] h-28 bg-gradient-to-b from-foreground/40 to-transparent animate-pulse" />
        </div>
      </main>

      {/* The Revealed Motion Footer */}
      <CinematicFooter />
    </div>
  )
}
