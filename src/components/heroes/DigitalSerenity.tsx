import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { cn } from '../../lib/cn'

export const meta = {
  title: 'Digital Serenity',
  description:
    'A meditative full-screen hero: a slowly drawn technical grid, pulsing nodes, blurred word-by-word reveals and a soft glow that follows the cursor.',
  category: 'heroes',
  fullWidth: true,
  thumbnail: true,
}

type DigitalSerenityProps = {
  className?: string
  /** Compact static poster for gallery cards. */
  thumbnail?: boolean
}

const STYLE = `
.ds-root { font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'; }
.ds-word {
  display: inline-block;
  opacity: 0;
  margin: 0 0.1em;
  animation: ds-word-appear 0.8s ease-out forwards;
  transition: color 0.3s ease, transform 0.3s ease;
}
.ds-word:hover { color: #cbd5e1; transform: translateY(-2px); }
.ds-grid-line {
  stroke: #94a3b8;
  stroke-width: 0.5;
  opacity: 0;
  stroke-dasharray: 5 5;
  stroke-dashoffset: 1000;
  animation: ds-grid-draw 2s ease-out forwards;
}
.ds-dot {
  fill: #cbd5e1;
  opacity: 0;
  animation: ds-pulse-glow 3s ease-in-out infinite;
}
.ds-corner {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(203, 213, 225, 0.2);
  opacity: 0;
  animation: ds-word-appear 1s ease-out forwards;
}
.ds-underline { position: relative; }
.ds-underline::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #cbd5e1, transparent);
  animation: ds-underline-grow 2s ease-out 2s forwards;
}
.ds-float {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #cbd5e1;
  border-radius: 9999px;
  opacity: 0;
  animation: ds-float 5s ease-in-out infinite;
}
.ds-ripple {
  position: absolute;
  width: 4px;
  height: 4px;
  margin: -2px 0 0 -2px;
  background: rgba(203, 213, 225, 0.6);
  border-radius: 9999px;
  pointer-events: none;
  animation: ds-pulse-glow 1s ease-out forwards;
}
@keyframes ds-word-appear {
  0% { opacity: 0; transform: translateY(30px) scale(0.8); filter: blur(10px); }
  50% { opacity: 0.8; transform: translateY(10px) scale(0.95); filter: blur(2px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
@keyframes ds-grid-draw {
  0% { stroke-dashoffset: 1000; opacity: 0; }
  50% { opacity: 0.3; }
  100% { stroke-dashoffset: 0; opacity: 0.15; }
}
@keyframes ds-pulse-glow {
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.1); }
}
@keyframes ds-underline-grow {
  to { width: 100%; }
}
@keyframes ds-float {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
  25% { transform: translateY(-10px) translateX(5px); opacity: 0.6; }
  50% { transform: translateY(-5px) translateX(-3px); opacity: 0.4; }
  75% { transform: translateY(-15px) translateX(7px); opacity: 0.8; }
}
@media (prefers-reduced-motion: reduce) {
  .ds-word, .ds-corner { animation: none; opacity: 1; }
  .ds-grid-line { animation: none; opacity: 0.15; stroke-dashoffset: 0; }
  .ds-dot { animation: none; opacity: 0.25; }
  .ds-underline::after { animation: none; width: 100%; }
  .ds-float { animation: none; opacity: 0.3; }
}
`

function Grid({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="ds-grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(100, 116, 139, 0.1)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ds-grid-pattern)" />
      <line x1="0" y1="20%" x2="100%" y2="20%" className="ds-grid-line" style={{ animationDelay: '0.5s' }} />
      <line x1="0" y1="80%" x2="100%" y2="80%" className="ds-grid-line" style={{ animationDelay: '1s' }} />
      <line x1="20%" y1="0" x2="20%" y2="100%" className="ds-grid-line" style={{ animationDelay: '1.5s' }} />
      <line x1="80%" y1="0" x2="80%" y2="100%" className="ds-grid-line" style={{ animationDelay: '2s' }} />
      <line
        x1="50%"
        y1="0"
        x2="50%"
        y2="100%"
        className="ds-grid-line"
        style={{ animationDelay: '2.5s', opacity: 0.05 }}
      />
      <line
        x1="0"
        y1="50%"
        x2="100%"
        y2="50%"
        className="ds-grid-line"
        style={{ animationDelay: '3s', opacity: 0.05 }}
      />
      <circle cx="20%" cy="20%" r="2" className="ds-dot" style={{ animationDelay: '3s' }} />
      <circle cx="80%" cy="20%" r="2" className="ds-dot" style={{ animationDelay: '3.2s' }} />
      <circle cx="20%" cy="80%" r="2" className="ds-dot" style={{ animationDelay: '3.4s' }} />
      <circle cx="80%" cy="80%" r="2" className="ds-dot" style={{ animationDelay: '3.6s' }} />
      {!compact && <circle cx="50%" cy="50%" r="1.5" className="ds-dot" style={{ animationDelay: '4s' }} />}
    </svg>
  )
}

function Corners() {
  const spots = [
    { cls: 'top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8', dot: 'top-0 left-0', delay: '4s' },
    { cls: 'top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8', dot: 'top-0 right-0', delay: '4.2s' },
    {
      cls: 'bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8',
      dot: 'bottom-0 left-0',
      delay: '4.4s',
    },
    {
      cls: 'bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8',
      dot: 'bottom-0 right-0',
      delay: '4.6s',
    },
  ]
  return (
    <>
      {spots.map((spot) => (
        <div key={spot.cls} className={cn('ds-corner', spot.cls)} style={{ animationDelay: spot.delay }}>
          <div className={cn('absolute size-2 rounded-full bg-slate-300 opacity-30', spot.dot)} />
        </div>
      ))}
    </>
  )
}

function Signature({ className }: { className?: string }) {
  return (
    <a
      href="https://inzeedo.lk"
      target="_blank"
      rel="noreferrer"
      className={cn(
        'group inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.35em] text-slate-400 uppercase transition-colors hover:text-slate-100',
        className,
      )}
    >
      <span className="size-1 rounded-full bg-slate-300/70 transition-shadow group-hover:shadow-[0_0_10px_rgba(203,213,225,0.8)]" />
      Inzeedo
    </a>
  )
}

function Words({
  children,
  start = 0,
  step = 150,
  play = true,
}: {
  children: string[]
  start?: number
  step?: number
  play?: boolean
}) {
  return (
    <>
      {children.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={cn('ds-word', !play && 'opacity-100')}
          style={play ? { animationDelay: `${start + index * step}ms` } : { animation: 'none' }}
        >
          {word}
        </span>
      ))}
    </>
  )
}

function Poster({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'ds-root relative flex h-[290px] w-full min-w-[480px] flex-col items-center justify-center gap-4 overflow-hidden bg-gradient-to-br from-slate-900 via-black to-slate-800 px-8 text-slate-100',
        className,
      )}
    >
      <style>{STYLE}</style>
      <Grid compact />
      <Corners />
      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="font-mono text-[9px] tracking-[0.24em] text-slate-300/80 uppercase">
          Stillness speaks.
        </p>
        <div className="mt-3 h-px w-14 bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-40" />
        <h1 className="mt-4 text-2xl leading-tight font-extralight tracking-tight text-slate-50">
          Find your center,
        </h1>
        <p className="mt-1 max-w-[34ch] text-[13px] font-thin leading-relaxed tracking-wide text-slate-300">
          where peace resides and clarity awakens within the soul.
        </p>
        <div className="mt-5 flex gap-1.5">
          <span className="size-1 rounded-full bg-slate-300/40" />
          <span className="size-1 rounded-full bg-slate-300/70" />
          <span className="size-1 rounded-full bg-slate-300/40" />
        </div>
        <Signature className="mt-5 scale-90" />
      </div>
    </div>
  )
}

export default function DigitalSerenity({
  className,
  thumbnail = false,
}: DigitalSerenityProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const rippleId = useRef(0)

  useEffect(() => {
    if (thumbnail) return
    const section = sectionRef.current
    const glow = glowRef.current
    if (!section || !glow) return

    const move = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect()
      glow.style.left = `${event.clientX - rect.left}px`
      glow.style.top = `${event.clientY - rect.top}px`
      glow.style.opacity = '1'
    }
    const leave = () => {
      glow.style.opacity = '0'
    }

    section.addEventListener('pointermove', move)
    section.addEventListener('pointerleave', leave)
    return () => {
      section.removeEventListener('pointermove', move)
      section.removeEventListener('pointerleave', leave)
    }
  }, [thumbnail])

  if (thumbnail) return <Poster className={className} />

  const addRipple = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const id = rippleId.current++
    setRipples((current) => [...current, { id, x: event.clientX - rect.left, y: event.clientY - rect.top }])
    window.setTimeout(() => {
      setRipples((current) => current.filter((ripple) => ripple.id !== id))
    }, 1000)
  }

  return (
    <div
      ref={sectionRef}
      onPointerDown={addRipple}
      className={cn(
        'ds-root relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-black to-slate-800 text-slate-100',
        className,
      )}
    >
      <style>{STYLE}</style>
      <Grid />
      <Corners />

      <div className="ds-float" style={{ top: '25%', left: '15%', animationDelay: '0.5s' }} />
      <div className="ds-float" style={{ top: '60%', left: '85%', animationDelay: '1s' }} />
      <div className="ds-float" style={{ top: '40%', left: '10%', animationDelay: '1.5s' }} />
      <div className="ds-float" style={{ top: '75%', left: '90%', animationDelay: '2s' }} />

      <div
        ref={glowRef}
        className="pointer-events-none absolute top-0 left-0 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(156,163,175,0.09),rgba(107,114,128,0.06),transparent_70%)] opacity-0 blur-xl sm:h-80 sm:w-80 sm:blur-2xl md:h-96 md:w-96 md:blur-3xl"
        style={{ left: 0, top: 0, transition: 'left 70ms linear, top 70ms linear, opacity 300ms ease-out' }}
      />

      {ripples.map((ripple) => (
        <span key={ripple.id} className="ds-ripple" style={{ left: ripple.x, top: ripple.y }} />
      ))}

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-6 py-10 text-center sm:px-8 sm:py-12 md:px-16 md:py-20">
        <div>
          <h2 className="font-mono text-xs font-light tracking-[0.2em] text-slate-300 uppercase opacity-80 sm:text-sm">
            <Words start={200} step={300}>{['Stillness', 'speaks.']}</Words>
          </h2>
          <div className="mx-auto mt-4 h-px w-12 bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-30 sm:w-16" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <h1 className="ds-underline text-3xl leading-tight font-extralight tracking-tight text-slate-50 sm:text-4xl md:text-5xl lg:text-6xl">
            <div className="mb-4 md:mb-6">
              <Words start={700}>{['Find', 'your', 'center,']}</Words>
            </div>
            <div className="text-xl leading-relaxed font-thin tracking-wide text-slate-300 sm:text-2xl md:text-3xl">
              <Words start={1400}>
                {['where', 'peace', 'resides', 'and', 'clarity', 'awakens', 'within', 'the', 'soul.']}
              </Words>
            </div>
          </h1>
          <div
            className="absolute top-1/2 -left-6 h-px w-3 -translate-y-1/2 bg-slate-300 opacity-0 sm:-left-8 sm:w-4"
            style={{ animation: 'ds-word-appear 1s ease-out 3.2s forwards' }}
          />
          <div
            className="absolute top-1/2 -right-6 h-px w-3 -translate-y-1/2 bg-slate-300 opacity-0 sm:-right-8 sm:w-4"
            style={{ animation: 'ds-word-appear 1s ease-out 3.4s forwards' }}
          />
        </div>

        <div>
          <div className="mx-auto mb-4 h-px w-12 bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-30 sm:w-16" />
          <h2 className="font-mono text-xs font-light tracking-[0.2em] text-slate-300 uppercase opacity-80 sm:text-sm">
            <Words start={3000} step={200}>{['Observe,', 'accept,', 'let', 'go.']}</Words>
          </h2>
          <div
            className="mt-6 flex justify-center gap-4 opacity-0"
            style={{ animation: 'ds-word-appear 1s ease-out 4.2s forwards' }}
          >
            <span className="size-1 rounded-full bg-slate-300 opacity-40" />
            <span className="size-1 rounded-full bg-slate-300 opacity-60" />
            <span className="size-1 rounded-full bg-slate-300 opacity-40" />
          </div>
          <Signature className="mt-6" />
        </div>
      </div>
    </div>
  )
}
