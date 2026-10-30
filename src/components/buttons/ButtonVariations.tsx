import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Droplets,
  Loader2,
  MousePointer2,
  Sparkles,
  Zap,
} from 'lucide-react'
import { cn } from '../../lib/cn'

export const meta = {
  title: 'Button Variations',
  description:
    'Fifteen button treatments in one place — solid, gradient, glass, neon, 3D, liquid fill, magnetic and more, all with Inzeedo polish.',
  category: 'buttons',
  fullWidth: true,
  thumbnail: true,
}

type ButtonVariationsProps = {
  className?: string
  thumbnail?: boolean
}

function Brand() {
  return (
    <a
      href="https://inzeedo.lk"
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-2.5"
    >
      <span className="grid size-7 place-items-center rounded-lg border border-white/10 bg-white/[0.04]">
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
      <span className="text-[13px] font-semibold tracking-tight text-white">
        Inzeedo
        <span className="ml-1.5 font-mono text-[8px] font-normal tracking-[0.22em] text-white/35 uppercase">
          buttons
        </span>
      </span>
    </a>
  )
}

function Tile({
  index,
  name,
  hint,
  children,
}: {
  index: string
  name: string
  hint: string
  children: ReactNode
}) {
  return (
    <div className="group/tile relative flex min-h-[172px] flex-col justify-between gap-6 bg-[#07080c] p-6 transition-colors hover:bg-[#090b11]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-zinc-200">{name}</p>
          <p className="mt-1 text-[11px] leading-4 text-zinc-500">{hint}</p>
        </div>
        <span className="font-mono text-[9px] tracking-[0.18em] text-zinc-600">{index}</span>
      </div>
      <div className="flex items-center justify-center pb-1">{children}</div>
    </div>
  )
}

function MagneticButton() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLAnchorElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12
    setOffset({ x, y })
  }

  return (
    <a
      ref={ref}
      href="https://inzeedo.lk"
      target="_blank"
      rel="noreferrer"
      onPointerMove={handleMove}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-indigo-300/30 bg-indigo-400/10 px-5 text-[13px] font-medium text-indigo-100 transition-[transform,background-color,box-shadow] duration-200 ease-out hover:bg-indigo-400/20 hover:shadow-[0_12px_30px_-12px_rgba(129,140,248,0.9)]"
    >
      <MousePointer2 className="size-3.5 text-indigo-300" />
      Pull me closer
    </a>
  )
}

function LoadingButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  const run = () => {
    if (state === 'loading') return
    setState('loading')
    timers.current.push(window.setTimeout(() => setState('done'), 1500))
    timers.current.push(window.setTimeout(() => setState('idle'), 3600))
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={state === 'loading'}
      className={cn(
        'inline-flex h-10 min-w-[142px] items-center justify-center gap-2 rounded-full px-5 text-[13px] font-semibold transition-colors',
        state === 'done'
          ? 'bg-emerald-400 text-emerald-950'
          : 'bg-white text-zinc-950 hover:bg-cyan-50',
      )}
    >
      {state === 'loading' ? (
        <Loader2 className="size-4 animate-spin" />
      ) : state === 'done' ? (
        <Check className="size-4" />
      ) : (
        <Zap className="size-4" />
      )}
      {state === 'idle' ? 'Sync signal' : state === 'loading' ? 'Syncing…' : 'Synced'}
    </button>
  )
}

function Poster({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-[290px] w-full min-w-[480px] flex-col overflow-hidden bg-[#05060a] px-7 py-5 text-zinc-100',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(56,189,248,0.15),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />

      <div className="relative flex items-center justify-between">
        <Brand />
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[8px] tracking-[0.2em] text-cyan-300 uppercase">
          15 variants
        </span>
      </div>

      <div className="relative mt-6">
        <h2 className="text-[26px] leading-[1.08] font-semibold tracking-tight">
          Buttons,
          <br />
          <span className="bg-gradient-to-r from-cyan-200 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
            fifteen ways.
          </span>
        </h2>
        <p className="mt-2 max-w-[40ch] text-[11px] leading-relaxed text-zinc-400">
          A complete set of Inzeedo button treatments, from quiet outlines to glowing 3D presses.
        </p>
      </div>

      <div className="relative mt-auto flex flex-wrap items-center gap-2">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3.5 text-[11px] font-semibold text-zinc-950">
          Solid
          <ArrowRight className="size-3" />
        </span>
        <span className="inline-flex h-8 items-center rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 p-px">
          <span className="inline-flex h-full items-center rounded-full bg-[#0a0c12] px-3.5 text-[11px] font-medium text-white">
            Gradient
          </span>
        </span>
        <span className="inline-flex h-8 items-center rounded-full border border-white/15 px-3.5 text-[11px] font-medium text-zinc-300">
          Outline
        </span>
        <span className="inline-flex h-8 items-center rounded-full border border-cyan-400/50 bg-cyan-400/[0.06] px-3.5 text-[11px] font-medium text-cyan-200 shadow-[0_0_16px_-4px_rgba(34,211,238,0.7)]">
          Neon
        </span>
        <span className="inline-flex h-8 items-center rounded-lg bg-indigo-500 px-3.5 text-[11px] font-semibold text-white shadow-[0_4px_0_#3730a3]">
          3D
        </span>
      </div>
    </div>
  )
}

export default function ButtonVariations({ className, thumbnail = false }: ButtonVariationsProps) {
  if (thumbnail) return <Poster className={className} />

  return (
    <div
      className={cn(
        'bv-root relative w-full overflow-hidden bg-[#05060a] px-5 py-12 text-zinc-100 antialiased sm:px-8 md:py-16',
        className,
      )}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .bv-root * { animation-duration: 0.01ms !important; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_-10%,rgba(56,189,248,0.13),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(35%_30%_at_12%_30%,rgba(129,140,248,0.08),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_65%_at_50%_30%,black,transparent_100%)]" />

      <div className="relative mx-auto max-w-5xl">
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Brand />
              <span className="h-3.5 w-px bg-white/10" />
              <span className="font-mono text-[9px] tracking-[0.24em] text-zinc-500 uppercase">
                interface kit
              </span>
            </div>
            <h1 className="mt-5 text-[30px] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-white sm:text-4xl md:text-[42px]">
              Buttons, thirteen ways.
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-6 text-zinc-400">
              One palette, thirteen personalities. Every treatment is keyboard accessible, motion
              aware, and ready to drop into an Inzeedo surface.
            </p>
          </div>

          <a
            href="https://inzeedo.lk"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-[12px] font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white md:self-auto"
          >
            inzeedo.lk
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] shadow-[0_40px_120px_-40px_rgba(34,211,238,0.25)] sm:mt-12">
          <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
            <Tile index="01" name="Solid" hint="Confident, high-contrast primary action.">
              <a
                href="https://inzeedo.lk"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-zinc-950 transition-colors hover:bg-cyan-50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080c] focus-visible:outline-none"
              >
                Start building
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Tile>

            <Tile index="02" name="Gradient edge" hint="A luminous one-pixel gradient frame.">
              <a
                href="https://inzeedo.lk"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex h-10 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 p-px shadow-[0_10px_35px_-14px_rgba(99,102,241,0.9)] transition-shadow hover:shadow-[0_14px_45px_-10px_rgba(99,102,241,1)] focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080c] focus-visible:outline-none"
              >
                <span className="inline-flex h-full items-center gap-2 rounded-full bg-[#0a0c12] px-5 text-[13px] font-medium text-white">
                  <Sparkles className="size-3.5 text-cyan-300" />
                  Get early access
                </span>
              </a>
            </Tile>

            <Tile index="03" name="Outline" hint="Quiet by default, inverts on hover.">
              <a
                href="https://inzeedo.lk"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-5 text-[13px] font-medium text-zinc-200 transition-colors hover:border-white hover:bg-white hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080c] focus-visible:outline-none"
              >
                View docs
                <ArrowUpRight className="size-3.5" />
              </a>
            </Tile>

            <Tile index="04" name="Glass" hint="Frosted surface lit from both sides.">
              <a
                href="https://inzeedo.lk"
                target="_blank"
                rel="noreferrer"
                className="group relative inline-flex h-10 items-center overflow-hidden rounded-full border border-white/20 bg-white/[0.07] px-5 text-[13px] font-medium text-white backdrop-blur-md transition-colors hover:border-white/35 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080c] focus-visible:outline-none"
              >
                <span className="pointer-events-none absolute -left-8 top-1/2 size-16 -translate-y-1/2 rounded-full bg-cyan-400/45 blur-xl transition-opacity group-hover:opacity-100" />
                <span className="pointer-events-none absolute -right-8 top-1/2 size-16 -translate-y-1/2 rounded-full bg-fuchsia-400/45 blur-xl" />
                <span className="relative inline-flex items-center gap-2">
                  Glass surface
                  <ArrowRight className="size-3.5 text-white/70" />
                </span>
              </a>
            </Tile>

            <Tile index="05" name="Soft press" hint="Neumorphic depth with an inset release.">
              <a
                href="https://inzeedo.lk"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0e1219] px-5 text-[13px] font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_24px_-12px_rgba(0,0,0,0.95)] transition-transform active:translate-y-0.5 active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.85)] focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080c] focus-visible:outline-none"
              >
                Press gently
              </a>
            </Tile>

            <Tile index="06" name="3D press" hint="Chunky depth that compresses on click.">
              <a
                href="https://inzeedo.lk"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-500 px-5 text-[13px] font-semibold text-white shadow-[0_5px_0_#3730a3] transition-all hover:bg-indigo-400 active:translate-y-1 active:shadow-[0_1px_0_#3730a3] focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080c] focus-visible:outline-none"
              >
                Deploy now
                <ArrowRight className="size-3.5" />
              </a>
            </Tile>

            <Tile index="07" name="Neon" hint="A terminal glow with an inset halo.">
              <a
                href="https://inzeedo.lk"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-400/60 bg-cyan-400/[0.06] px-5 font-mono text-[12px] tracking-[0.08em] text-cyan-200 uppercase shadow-[0_0_18px_-4px_rgba(34,211,238,0.7),inset_0_0_16px_rgba(34,211,238,0.12)] transition-all hover:border-cyan-300 hover:bg-cyan-400/15 hover:shadow-[0_0_28px_-2px_rgba(34,211,238,0.85),inset_0_0_20px_rgba(34,211,238,0.2)] focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080c] focus-visible:outline-none"
              >
                <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_2px_rgba(34,211,238,0.9)]" />
                Live signal
              </a>
            </Tile>

            <Tile index="08" name="Shimmer" hint="A single sweep of light on hover.">
              <a
                href="https://inzeedo.lk"
                target="_blank"
                rel="noreferrer"
                className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-white/[0.06] px-5 text-[13px] font-medium text-white ring-1 ring-white/12 transition-all hover:ring-white/25 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080c] focus-visible:outline-none"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative inline-flex items-center gap-2">
                  Explore the kit
                  <ArrowRight className="size-3.5" />
                </span>
              </a>
            </Tile>

            <Tile index="09" name="Loading" hint="Click to run a live confirmation cycle.">
              <LoadingButton />
            </Tile>

            <Tile index="10" name="Magnetic" hint="Follows the cursor, then snaps back.">
              <MagneticButton />
            </Tile>

            <Tile index="11" name="Liquid fill" hint="Color rises from the base on hover.">
              <a
                href="https://inzeedo.lk"
                target="_blank"
                rel="noreferrer"
                className="group relative inline-flex h-10 items-center overflow-hidden rounded-full border border-emerald-300/30 px-5 text-[13px] font-medium text-emerald-200 transition-colors hover:border-emerald-300/70 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080c] focus-visible:outline-none"
              >
                <span className="absolute inset-0 translate-y-full bg-gradient-to-t from-emerald-400 to-teal-300 transition-transform duration-300 ease-out group-hover:translate-y-0" />
                <span className="relative inline-flex items-center gap-2 transition-colors duration-300 group-hover:text-emerald-950">
                  <Droplets className="size-3.5" />
                  Flow state
                </span>
              </a>
            </Tile>

            <Tile index="12" name="Swipe" hint="Label and arrow swap on a vertical track.">
              <a
                href="https://inzeedo.lk"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex h-10 items-center overflow-hidden rounded-lg bg-zinc-100 px-5 text-[13px] font-semibold text-zinc-900 transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080c] focus-visible:outline-none"
              >
                <span className="relative flex h-5 flex-col overflow-hidden">
                  <span className="flex items-center gap-2 transition-transform duration-300 ease-out group-hover:-translate-y-5">
                    Connect
                    <ArrowRight className="size-3.5" />
                  </span>
                  <span className="flex items-center gap-2 transition-transform duration-300 ease-out group-hover:-translate-y-5">
                    With Inzeedo
                    <ArrowRight className="size-3.5" />
                  </span>
                </span>
              </a>
            </Tile>

            <Tile index="13" name="Underline" hint="Text-only action with a drawn rule.">
              <a
                href="https://inzeedo.lk"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex flex-col items-start focus-visible:outline-none"
              >
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-200 transition-colors group-hover:text-white">
                  Read the manifesto
                  <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
                <span className="mt-1.5 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-cyan-300 via-indigo-300 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            </Tile>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 text-[11px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Motion respects <span className="font-mono text-zinc-400">prefers-reduced-motion</span>
            . Every variant links to the same destination.
          </p>
          <a
            href="https://inzeedo.lk"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Built for Inzeedo
            <ArrowRight className="size-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
