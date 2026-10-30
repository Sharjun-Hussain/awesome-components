import { useRef } from 'react'
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { cn } from '../../lib/cn'

export const meta = {
  title: 'Animated Video on Scroll',
  description:
    'A cinematic scroll-driven showcase: the headline drifts, the film unclips from a pill into a full frame, and the call to action floats up as you scroll.',
  category: 'heroes',
  fullWidth: true,
  thumbnail: true,
}

const VIDEO = new URL('./assets/scroll-video/inzeedo-scroll.mp4', import.meta.url).href

const BACKGROUND =
  'radial-gradient(40% 30% at 50% 50%, #0e19ae 0%, #0b1387 22.92%, #080f67 42.71%, #030526 88.54%)'

type AnimatedVideoOnScrollProps = {
  className?: string
  /** Compact poster for gallery cards. */
  thumbnail?: boolean
}

function Brand({ className }: { className?: string }) {
  return (
    <a
      href="https://inzeedo.lk"
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.24em] text-slate-200/70 uppercase transition-colors hover:text-white',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-[#84cc16] shadow-[0_0_10px_#84cc16]" />
      Inzeedo
    </a>
  )
}

function Cta({ className }: { className?: string }) {
  return (
    <a
      href="https://inzeedo.lk"
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-[#84cc16] bg-gray-950/10 px-4 py-2 text-sm font-medium shadow-[0px_4px_24px_#84cc16] transition-colors hover:bg-slate-50 hover:text-slate-950',
        className,
      )}
    >
      Get Started
    </a>
  )
}

function Poster({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-[210px] w-full min-w-[480px] flex-col items-center justify-center gap-2 overflow-hidden px-6 py-3 text-slate-50',
        className,
      )}
      style={{ background: BACKGROUND }}
    >
      <Brand className="absolute top-4 left-5" />
      <h1 className="text-[28px] leading-none font-medium tracking-tighter">Scroll &amp; Roll</h1>
      <div className="h-[82px] w-[282px] overflow-hidden rounded-full shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)]">
        <video
          src={VIDEO}
          className="size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="An Inzeedo brand film"
        />
      </div>
      <Cta className="scale-[0.82] px-4 py-1.5 text-[11px]" />
    </div>
  )
}

function ScrollingSection({ className }: { className?: string }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 400,
    restDelta: 0.001,
  })
  const progress = reducedMotion ? scrollYProgress : smoothProgress

  const outerY = useTransform(progress, [0, 1], [0, 192])
  const copyY = useTransform(progress, [0, 1], [90, -16])
  const ctaY = useTransform(progress, [0, 1], [-80, 16])
  const videoScale = useTransform(progress, [0, 1], [0.75, 1])

  const insetY = useTransform(progress, [0, 1], [40, 0])
  const insetX = useTransform(progress, [0, 1], [40, 0])
  const radius = useTransform(progress, [0, 1], [999, 24])
  const clipPath = useMotionTemplate`inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${radius}px)`

  return (
    <div
      ref={sectionRef}
      className={cn(
        'relative min-h-screen w-full overflow-hidden bg-stone-900 px-6 py-10 text-slate-50',
        className,
      )}
      style={{ background: BACKGROUND }}
    >
      <Brand className="absolute top-6 left-6 z-20" />

      <motion.div style={{ y: outerY, willChange: 'transform' }} className="relative pt-8">
        <motion.div
          style={{ y: copyY, willChange: 'transform' }}
          className="relative origin-top space-y-4 text-center"
        >
          <p className="text-[10px] font-medium tracking-[0.32em] text-slate-400 uppercase">
            Inzeedo / Scroll Film
          </p>
          <h1 className="text-5xl font-medium tracking-tighter md:text-6xl">Scroll &amp; Roll</h1>
          <p className="mx-auto max-w-[42ch] text-balance text-slate-400">
            A scroll-driven showcase by Inzeedo, made for your next hero, call to action or product
            story.
          </p>
        </motion.div>

        <motion.div
          style={{ clipPath, willChange: 'clip-path' }}
          className="mx-auto mt-10 h-fit w-full max-w-3xl"
        >
          <motion.div style={{ scale: videoScale, willChange: 'transform' }}>
            <video
              src={VIDEO}
              className="relative z-10 aspect-video w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label="An Inzeedo brand film"
            />
          </motion.div>
        </motion.div>

        <motion.div style={{ y: ctaY, willChange: 'transform' }} className="mt-10 text-center">
          <Cta />
        </motion.div>
      </motion.div>

      <div className="h-[40vh]" />
    </div>
  )
}

export default function AnimatedVideoOnScroll({
  className,
  thumbnail = false,
}: AnimatedVideoOnScrollProps) {
  return thumbnail ? <Poster className={className} /> : <ScrollingSection className={className} />
}
