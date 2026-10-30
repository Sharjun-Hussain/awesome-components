import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  Menu,
  Sparkles,
  X,
} from 'lucide-react'
import { cn } from '../../lib/cn'

export const meta = {
  title: 'Pulse Beam Hero',
  description:
    'A SaaS hero backdrop of animated pulse beams: gradient signals travel from the edges of the stack into a glowing core behind the headline.',
  category: 'heroes',
  fullWidth: true,
  thumbnail: true,
}

type PulseBeamHeroProps = {
  className?: string
  thumbnail?: boolean
}

const BEAMS = [
  { d: 'M 24 74 H 318 V 360 H 600', delay: 0 },
  { d: 'M 24 212 H 208 V 360 H 600', delay: 1.4 },
  { d: 'M 1176 74 H 882 V 360 H 600', delay: 0.7 },
  { d: 'M 1176 212 H 992 V 360 H 600', delay: 2.1 },
  { d: 'M 600 8 V 360', delay: 2.8 },
]

const NODES = [
  { cx: 24, cy: 74 },
  { cx: 24, cy: 212 },
  { cx: 1176, cy: 74 },
  { cx: 1176, cy: 212 },
  { cx: 600, cy: 8 },
]

const LINKS = ['Product', 'Platform', 'Pricing', 'Docs']

function Brand({ className }: { className?: string }) {
  return (
    <a
      href="https://inzeedo.lk"
      target="_blank"
      rel="noreferrer"
      className={cn('group inline-flex items-center gap-2.5', className)}
    >
      <span className="relative grid size-8 place-items-center rounded-xl border border-white/10 bg-white/5">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="2.4" fill="#67e8f9" />
          <path
            d="M7 6.6a8 8 0 0 0 0 10.8"
            stroke="#67e8f9"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M17 6.6a8 8 0 0 1 0 10.8"
            stroke="#c084fc"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-white">
        Inzeedo
        <span className="ml-1.5 font-mono text-[9px] font-normal tracking-[0.22em] text-white/35 uppercase">
          pulse
        </span>
      </span>
    </a>
  )
}

function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-30 mx-auto w-full max-w-6xl px-5 sm:px-8">
      <div className="flex h-16 items-center justify-between gap-6 border-b border-white/[0.06]">
        <Brand />

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <a
              key={link}
              href="https://inzeedo.lk"
              target="_blank"
              rel="noreferrer"
              className="text-[13px] text-slate-400 transition-colors hover:text-white"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href="https://inzeedo.lk"
            target="_blank"
            rel="noreferrer"
            className="text-[13px] text-slate-300 transition-colors hover:text-white"
          >
            Sign in
          </a>
          <a
            href="https://inzeedo.lk"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-[12px] font-semibold text-slate-950 transition-colors hover:bg-cyan-100"
          >
            Get started
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-200 md:hidden"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="absolute inset-x-4 top-[60px] z-40 rounded-xl border border-white/10 bg-[#070b13]/95 p-3 shadow-2xl backdrop-blur-xl md:hidden">
          {LINKS.map((link) => (
            <a
              key={link}
              href="https://inzeedo.lk"
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
            >
              {link}
            </a>
          ))}
          <a
            href="https://inzeedo.lk"
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-950"
          >
            Get started
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      )}
    </header>
  )
}

function BeamDefs() {
  return (
    <defs>
      <linearGradient id="pb-beam-left" x1="0" y1="0" x2="620" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
        <stop offset="0.15" stopColor="#22d3ee" />
        <stop offset="0.6" stopColor="#818cf8" />
        <stop offset="0.85" stopColor="#c084fc" />
        <stop offset="1" stopColor="#c084fc" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="pb-beam-right" x1="1200" y1="0" x2="580" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#c084fc" stopOpacity="0" />
        <stop offset="0.15" stopColor="#c084fc" />
        <stop offset="0.6" stopColor="#818cf8" />
        <stop offset="0.85" stopColor="#22d3ee" />
        <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="pb-beam-top" x1="600" y1="0" x2="600" y2="360" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
        <stop offset="0.2" stopColor="#22d3ee" />
        <stop offset="0.7" stopColor="#818cf8" />
        <stop offset="1" stopColor="#c084fc" stopOpacity="0" />
      </linearGradient>
      <filter id="pb-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
      <radialGradient id="pb-core" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#e0f2fe" />
        <stop offset="0.45" stopColor="#67e8f9" />
        <stop offset="1" stopColor="#818cf8" stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}

function BeamStage({ className }: { className?: string }) {
  const reduced = useReducedMotion()

  return (
    <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 z-0 w-full', className)}>
      <svg viewBox="0 0 1200 400" className="block w-full" aria-hidden="true">
        <BeamDefs />

        {/* faint track */}
        {BEAMS.map((beam) => (
          <path
            key={`track-${beam.d}`}
            d={beam.d}
            fill="none"
            stroke="rgba(148, 163, 184, 0.14)"
            strokeWidth="1"
          />
        ))}

        {/* travelling pulses */}
        {BEAMS.map((beam, index) => {
          const gradientId = beam.d.startsWith('M 1176')
            ? 'pb-beam-right'
            : beam.d === 'M 600 8 V 360'
              ? 'pb-beam-top'
              : 'pb-beam-left'

          return (
            <g key={`beam-${beam.d}`}>
              <motion.path
                d={beam.d}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="0.14 0.86"
                pathLength={1}
                opacity={0.16}
                filter="url(#pb-glow)"
                initial={false}
                animate={reduced ? undefined : { strokeDashoffset: [0, -1] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'linear', delay: beam.delay }}
              />
              <motion.path
                d={beam.d}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.14 0.86"
                pathLength={1}
                initial={false}
                animate={reduced ? undefined : { strokeDashoffset: [0, -1] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'linear', delay: beam.delay }}
              />
              <circle
                cx={NODES[index].cx}
                cy={NODES[index].cy}
                r="6"
                fill="#080d16"
                stroke="#334155"
                strokeWidth="1"
              />
              <circle cx={NODES[index].cx} cy={NODES[index].cy} r="2.2" fill="#67e8f9" opacity="0.9" />
            </g>
          )
        })}

        {/* endpoint labels */}
        <g
          fill="#64748b"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="11"
          letterSpacing="2.4"
          className="hidden md:block"
        >
          <text x="42" y="68">INGEST</text>
          <text x="42" y="206">ROUTE</text>
          <text x="1158" y="68" textAnchor="end">OBSERVE</text>
          <text x="1158" y="206" textAnchor="end">SCALE</text>
          <text x="614" y="20">PULSE</text>
        </g>

        {/* hub */}
        <g>
          <circle cx="600" cy="360" r="44" fill="url(#pb-core)" opacity="0.12" />
          <circle cx="600" cy="360" r="30" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
          <motion.circle
            cx="600"
            cy="360"
            r="30"
            fill="none"
            stroke="rgba(103,232,249,0.35)"
            strokeWidth="1"
            strokeDasharray="2 8"
            initial={false}
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '600px 360px' }}
          />
          {!reduced &&
            [0, 1.2, 2.4].map((delay) => (
              <motion.circle
                key={delay}
                cx="600"
                cy="360"
                r="10"
                fill="none"
                stroke="#67e8f9"
                strokeWidth="1"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0.5, 0], scale: [0.6, 3] }}
                transition={{ duration: 3.6, repeat: Infinity, delay, ease: 'easeOut' }}
                style={{ transformOrigin: '600px 360px' }}
              />
            ))}
          <circle cx="600" cy="360" r="8" fill="#0b1220" stroke="#67e8f9" strokeWidth="1.5" />
          <circle cx="600" cy="360" r="3" fill="#e0f2fe" />
        </g>
      </svg>
    </div>
  )
}

function Poster({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-[290px] w-full min-w-[480px] flex-col overflow-hidden bg-[#05070c] px-7 py-5 text-slate-100',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(56,189,248,0.16),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="relative flex items-center justify-between">
        <Brand />
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[8px] tracking-[0.2em] text-cyan-300 uppercase">
          live
        </span>
      </div>

      <div className="relative mt-5 text-center">
        <p className="font-mono text-[8px] tracking-[0.24em] text-slate-500 uppercase">
          Inzeedo pulse 2.0
        </p>
        <h2 className="mt-1.5 text-[24px] leading-[1.08] font-semibold tracking-tight">
          One pulse for
          <br />
          <span className="bg-gradient-to-r from-cyan-200 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
            your entire stack.
          </span>
        </h2>
      </div>

      <div className="relative mt-auto">
        <svg viewBox="0 0 520 96" className="w-full" aria-hidden="true">
          <defs>
            <linearGradient id="pb-poster-beam" x1="0" y1="0" x2="520" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="0.5" stopColor="#818cf8" />
              <stop offset="1" stopColor="#c084fc" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 10 20 H 190 V 88 H 260" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
          <path d="M 510 20 H 330 V 88 H 260" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
          <path d="M 10 20 H 190 V 88 H 260" fill="none" stroke="url(#pb-poster-beam)" strokeWidth="2" strokeDasharray="30 300" strokeLinecap="round" />
          <path d="M 510 20 H 330 V 88 H 260" fill="none" stroke="url(#pb-poster-beam)" strokeWidth="2" strokeDasharray="30 300" strokeLinecap="round" />
          <circle cx="260" cy="88" r="26" fill="#22d3ee" opacity="0.1" />
          <circle cx="260" cy="88" r="9" fill="#0b1220" stroke="#67e8f9" strokeWidth="1.5" />
          <circle cx="260" cy="88" r="3.4" fill="#e0f2fe" />
        </svg>
        <div className="mt-1 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-950">
            Start building free
            <ArrowRight className="size-3" />
          </span>
        </div>
      </div>
    </div>
  )
}

export default function PulseBeamHero({ className, thumbnail = false }: PulseBeamHeroProps) {
  if (thumbnail) return <Poster className={className} />

  return (
    <div
      className={cn(
        'relative flex min-h-screen w-full flex-col overflow-hidden bg-[#05070c] text-slate-100 antialiased',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_-5%,rgba(56,189,248,0.14),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_30%_at_15%_30%,rgba(129,140,248,0.09),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_30%_at_85%_30%,rgba(192,132,252,0.08),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_35%,black,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <BeamStage className="opacity-80 [mask-image:linear-gradient(to_top,black_50%,transparent_100%)]" />

      <Nav />

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-4xl text-center">
          <a
            href="https://inzeedo.lk"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pr-2.5 pl-1.5 text-[11px] text-slate-300 backdrop-blur-sm transition-colors hover:border-white/20 hover:text-white"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400/15 to-violet-400/15 px-2 py-0.5 text-[10px] font-medium tracking-wide text-cyan-200 uppercase">
              <Sparkles className="size-3" />
              New
            </span>
            <span className="hidden whitespace-nowrap min-[380px]:inline">
              Pulse 2.0 is live — real-time spend routing
            </span>
            <span className="whitespace-nowrap min-[380px]:hidden">Pulse 2.0 is live</span>
            <ArrowRight className="size-3 text-slate-500 transition-transform group-hover:translate-x-0.5" />
          </a>

          <h1 className="mt-6 text-[34px] leading-[1.04] font-semibold tracking-[-0.035em] text-balance text-white min-[420px]:text-[40px] sm:text-5xl md:text-[64px]">
            One pulse for
            <br />
            <span className="bg-gradient-to-r from-cyan-200 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
              your entire stack.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-balance text-slate-400">
            Inzeedo unifies deploys, observability and cloud spend into a single live signal — so
            your team ships faster, with fewer surprises.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="https://inzeedo.lk"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 shadow-[0_10px_40px_-12px_rgba(255,255,255,0.4)] transition-colors hover:bg-cyan-50 sm:w-auto"
            >
              Start building free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="https://inzeedo.lk"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-slate-200 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/[0.08] sm:w-auto"
            >
              <Calendar className="size-4 text-slate-400" />
              Book a demo
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3 text-cyan-300" />
              No credit card required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3 text-cyan-300" />
              SOC 2 Type II
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3 text-cyan-300" />
              99.99% uptime SLA
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
