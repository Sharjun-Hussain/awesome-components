import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import './PushpinTearFooter.exact.css'

export const meta = {
  title: 'Inzeedo Pushpin Tear Footer',
  description:
    'Tactile rippled torn-paper footer with interactive physics pushpin, real-time procedural tear math, custom grain shadows, newsletter pill, dynamic clock, and Inzeedo branding.',
  category: 'footers',
  fullWidth: true,
  thumbnail: true,
}

/* -------------------------------------------------------------------------- */
/* Procedural Tear Physics & Math Constants                                   */
/* -------------------------------------------------------------------------- */

const RESOLUTION = 84
const INTRO_START_Y = 1.06
const FLAP_COUNT = 6

const clamp01 = (val: number): number =>
  Number.isFinite(val) ? (val < 0 ? 0 : val > 1 ? 1 : val) : 0

function mulberry32(seed: number) {
  let s = (Number.isFinite(seed) ? Math.floor(seed) : 0) >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const HORIZONTAL_STEPS = (() => {
  const rng = mulberry32(911)
  const steps: number[] = []
  for (let i = 0; i < RESOLUTION; i++) {
    const fraction = i / (RESOLUTION - 1)
    const jitter = i > 0 && i < RESOLUTION - 1 ? (rng() - 0.5) * (0.8 / RESOLUTION) : 0
    steps.push(-0.02 + fraction * 1.04 + jitter)
  }
  return steps
})()

function ridgeFloor(x: number): number {
  const dist = Math.abs(x - 0.5)
  return dist < 0.13 ? 0.39 : dist < 0.25 ? 0.43 : 0.5
}

function easeTear(t: number): number {
  const s = clamp01(t)
  if (s === 0 || s === 1) return s
  const c = 0.9
  return 1 + (c + 1) * Math.pow(s - 1, 3) + c * Math.pow(s - 1, 2)
}

function easeInOut(t: number): number {
  const s = clamp01(t)
  return s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2
}

export interface FlapDef {
  at: number
  span: number
  len: number
  skew: number
  dir: number
  jag: number[]
}

export interface TearData {
  ys: number[]
  rim: number[]
  lag: number[]
  flaps: FlapDef[]
}

function makeTear(seed: number, count = RESOLUTION): TearData {
  const rng = mulberry32(seed)
  const phases = [rng() * 6.283, rng() * 6.283, rng() * 6.283]
  const ys: number[] = []
  const rim: number[] = []
  const lag: number[] = []

  for (let i = 0; i < count; i++) {
    const x = HORIZONTAL_STEPS[Math.min(i, HORIZONTAL_STEPS.length - 1)]
    const edgeDist = Math.min(1, Math.abs(x - 0.5) * 2)
    const baseCurve = 0.43 + 0.3 * Math.pow(edgeDist, 1.35)
    const harmonicWaves =
      (0.022 * Math.sin(x * 7 + phases[0]) +
        0.016 * Math.sin(x * 13 + phases[1]) +
        0.01 * Math.sin(x * 29 + phases[2])) *
      (0.45 + 0.55 * edgeDist)
    const microJagMultiplier = rng() < 0.16 ? 2.3 : 1
    const microJag = (rng() - 0.5) * 0.022 * microJagMultiplier

    ys.push(Math.min(0.8, Math.max(ridgeFloor(x), baseCurve + harmonicWaves + microJag)))
    rim.push(1.2 + rng() * 3.6)
    lag.push(Math.min(0.48, edgeDist * 0.4 + 0.04 + 0.03 * Math.sin(x * 23 + phases[1]) + rng() * 0.012))
  }

  const flapCenters = [0.05, 0.19, 0.33, 0.67, 0.81, 0.95]
  const flippedPair = rng() < 0.5 ? [2, 4] : [1, 3]

  const flaps: FlapDef[] = flapCenters.map((fc, idx) => {
    const targetX = fc + (rng() - 0.5) * 0.05
    const span = 3 + Math.floor(rng() * 5)
    const at = Math.max(0, Math.min(count - 1 - span, Math.round(targetX * (count - 1))))
    const dir = flippedPair.includes(idx) ? -1 : 1
    const isOuterFlap = idx === 0 || idx === flapCenters.length - 1
    const len = dir < 0 ? 0.022 + rng() * 0.022 : isOuterFlap ? 0.085 + rng() * 0.04 : 0.045 + rng() * 0.05

    return {
      at,
      span,
      len,
      skew: (rng() - 0.5) * 1.1,
      dir,
      jag: [rng() - 0.5, rng() - 0.5, rng() - 0.5, rng() - 0.5],
    }
  })

  return { ys, rim, lag, flaps }
}

function introYs(tear: TearData, progress: number): number[] {
  return tear.ys.map((finalY, i) => INTRO_START_Y + (finalY - INTRO_START_Y) * easeTear((progress - tear.lag[i]) / 0.5))
}

function flapOpen(tear: TearData, flap: FlapDef, progress: number): number {
  return easeTear((progress - tear.lag[flap.at] - 0.18) / 0.32)
}

function morphYs(fromYs: number[], tear: TearData, progress: number): number[] {
  return tear.ys.map((targetY, i) => {
    const startY = fromYs[i] ?? targetY
    return startY + (targetY - startY) * easeInOut((progress - tear.lag[i] * 0.6) / 0.6)
  })
}

const n1 = (val: number): number => Math.round(val * 10) / 10

function flapPoly(ys: number[], flap: FlapDef, w: number, h: number, openProgress: number): [number, number][] {
  const endIdx = Math.min(ys.length - 1, flap.at + flap.span)
  const basePoints: [number, number][] = []
  for (let i = flap.at; i <= endIdx; i++) {
    basePoints.push([HORIZONTAL_STEPS[i] * w, ys[i] * h])
  }
  const pStart = basePoints[0]
  const pEnd = basePoints[basePoints.length - 1]
  const midX = (pStart[0] + pEnd[0]) / 2
  const midY = (pStart[1] + pEnd[1]) / 2
  const liftDistance = flap.len * h * Math.max(0, openProgress)
  const apex: [number, number] = [midX + flap.skew * liftDistance, midY + flap.dir * liftDistance]

  const makeBezierPoints = (
    from: [number, number],
    to: [number, number],
    j1: number,
    j2: number,
  ): [[number, number], [number, number]] => {
    const dx = to[0] - from[0]
    const dy = to[1] - from[1]
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    return [
      [from[0] + dx / 3 + nx * j1 * 0.22 * liftDistance, from[1] + dy / 3 + ny * j1 * 0.22 * liftDistance],
      [from[0] + (dx * 2) / 3 + nx * j2 * 0.22 * liftDistance, from[1] + (dy * 2) / 3 + ny * j2 * 0.22 * liftDistance],
    ]
  }

  return [
    ...basePoints,
    ...makeBezierPoints(pEnd, apex, flap.jag[0], flap.jag[1]),
    apex,
    ...makeBezierPoints(apex, pStart, flap.jag[2], flap.jag[3]),
  ]
}

function polyD(points: [number, number][]): string {
  if (!points.length) return ''
  return 'M' + points.map((p) => `${n1(p[0])} ${n1(p[1])}`).join('L') + 'Z'
}

function sheetD(ys: number[], w: number, h: number, rimOffsets?: number[]): string {
  let path = `M-20 -20L${w + 20} -20`
  for (let i = ys.length - 1; i >= 0; i--) {
    const x = n1(HORIZONTAL_STEPS[i] * w)
    const y = n1(ys[i] * h - (rimOffsets ? rimOffsets[i] : 0))
    path += `L${x} ${y}`
  }
  return path + 'Z'
}

function mixHex(hexA: string, hexB: string, weight: number): string {
  const parse = (hex: string) => {
    const sanitized = hex.replace('#', '')
    const full =
      sanitized.length === 3
        ? sanitized
            .split('')
            .map((c) => c + c)
            .join('')
        : sanitized.padEnd(6, '0').slice(0, 6)
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) || 0)
  }
  const rgbA = parse(hexA)
  const rgbB = parse(hexB)
  const w = clamp01(weight)
  return (
    '#' +
    rgbA
      .map((val, i) =>
        Math.round(val + (rgbB[i] - val) * w)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  )
}

/* -------------------------------------------------------------------------- */
/* Subcomponents: Icons, SVG Badges, Pushpin Vector                           */
/* -------------------------------------------------------------------------- */

const SVG_STROKE_DEFAULTS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.8',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function PushpinIcon({ name }: { name: string }) {
  const renderSvg = (children: ReactNode, isFilled = false) => (
    <svg
      viewBox="0 0 24 24"
      className="tpf-ico"
      aria-hidden="true"
      {...(isFilled ? { fill: 'currentColor' } : SVG_STROKE_DEFAULTS)}
    >
      {children}
    </svg>
  )

  switch (name) {
    case 'chevL':
      return renderSvg(<path d="M14.5 5.5 8 12l6.5 6.5" />)
    case 'arrow':
      return renderSvg(<path d="M5 12h13M13 6.5 18.5 12 13 17.5" />)
    case 'check':
      return renderSvg(<path d="m5.5 12.5 4 4 9-9.5" />)
    case 'copy':
      return renderSvg(
        <>
          <path d="M13.5 4.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5v-6.5" />
          <circle cx="18.5" cy="5.5" r="2.3" />
        </>,
      )
    case 'squiggle':
      return renderSvg(<path d="M3.5 15c1.8-3.2 3.6-3.2 5.4 0s3.6 3.2 5.4 0 3.6-3.2 5.4 0" />)
    case 'github':
      return renderSvg(
        <path
          fillRule="evenodd"
          d="M12 2.8a9.3 9.3 0 0 0-2.9 18.1c.5.1.6-.2.6-.5v-1.7c-2.6.6-3.1-1.1-3.1-1.1-.4-1.1-1-1.4-1-1.4-.9-.6.1-.6.1-.6.9.1 1.4 1 1.4 1 .8 1.4 2.2 1 2.7.8.1-.6.3-1 .6-1.2-2.1-.2-4.2-1-4.2-4.6 0-1 .4-1.8 1-2.5-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.6 1a8.8 8.8 0 0 1 4.6 0c1.8-1.2 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.5.6.7 1 1.5 1 2.5 0 3.6-2.2 4.4-4.2 4.6.3.3.6.8.6 1.6v2.4c0 .3.2.6.7.5A9.3 9.3 0 0 0 12 2.8z"
        />,
        true,
      )
    case '21st':
      return renderSvg(
        <>
          <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
          <path d="M7.6 10.2a1.9 1.9 0 0 1 3.7.4c0 1.6-3.7 2.6-3.7 4.6h3.8M14.2 10.4l1.9-1.4v6.4" />
        </>,
      )
    case 'linkedin':
      return renderSvg(
        <path
          fillRule="evenodd"
          d="M7 3.5h10A3.5 3.5 0 0 1 20.5 7v10a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 17V7A3.5 3.5 0 0 1 7 3.5zm.2 6.6v7h2.2v-7zm1.1-3.4a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm2.6 3.4v7h2.2v-3.7c0-1 .4-1.6 1.2-1.6s1.1.6 1.1 1.6v3.7h2.2v-4.3c0-2-1-2.9-2.5-2.9-.9 0-1.6.4-2 1v-.8z"
        />,
        true,
      )
    case 'doc':
      return renderSvg(
        <>
          <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8z" />
          <path d="M14 3.5V8h4.5M8.8 12.5h6.4M8.8 16h4.2" />
        </>,
      )
    case 'chat':
      return renderSvg(
        <path
          fillRule="evenodd"
          d="M12 3C7 3 3.2 6.6 3.2 11.2c0 2.5 1.1 4.6 2.9 6.1v3.4l3.2-1.8c.8.2 1.8.4 2.7.4 5 0 8.8-3.6 8.8-8.1S17 3 12 3zm-4 9.4a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6z"
        />,
        true,
      )
    case 'x':
      return renderSvg(
        <>
          <path d="M5 4.5h3.6l10.4 15H15.4z" />
          <path d="M18.6 4.5 13.4 10.4M5.4 19.5l5.4-6.2" />
        </>,
      )
    case 'ig':
      return renderSvg(
        <>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="3.8" />
          <circle cx="17.1" cy="6.9" r=".6" fill="currentColor" />
        </>,
      )
    case 'dribbble':
      return renderSvg(
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M5.2 7c4.5 2 9.8 2 13 .7M3.6 13c5-1.6 10.4-.4 14 4.6M9 3.9c3 3.6 5.2 9.3 5.7 15.6" />
        </>,
      )
    case 'globe':
      return renderSvg(
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5S9.5 6.1 12 3.5z" />
        </>,
      )
    case 'mail':
      return renderSvg(
        <>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
          <path d="m4.5 7 7.5 6 7.5-6" />
        </>,
      )
    case 'link':
      return renderSvg(
        <>
          <path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" />
          <path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" />
        </>,
      )
    case 'shield':
      return renderSvg(
        <path
          fillRule="evenodd"
          d="M6.5 2.5h11a4 4 0 0 1 4 4v11a4 4 0 0 1-4 4h-11a4 4 0 0 1-4-4v-11a4 4 0 0 1 4-4zM12 6.2 7.6 7.8v3.6c0 2.9 1.9 5.2 4.4 6.2 2.5-1 4.4-3.3 4.4-6.2V7.8zm-2 5.8 1.4 1.4 2.8-2.9"
        />,
        true,
      )
    default:
      return null
  }
}

function StarburstSeal() {
  let pathStr = ''
  for (let i = 0; i <= 24; i++) {
    const angle = (i / 24) * Math.PI * 2 - Math.PI / 2
    const radius = i % 2 ? 8.6 : 10
    pathStr += (i ? 'L' : 'M') + (12 + Math.cos(angle) * radius).toFixed(2) + ' ' + (12 + Math.sin(angle) * radius).toFixed(2)
  }
  return (
    <svg viewBox="0 0 24 24" className="tpf-seal" aria-hidden="true">
      <path d={pathStr + 'Z'} fill="currentColor" strokeLinejoin="round" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="m8.3 12.2 2.5 2.5 5-5.2"
        fill="none"
        stroke="var(--tpf-sheet)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BrandMarkSvg() {
  return (
    <svg
      viewBox="0 0 44 28"
      className="tpf-mark"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.5 4.5v19" />
      <path d="M5.5 15.2 15.6 6.4" />
      <path d="M10.4 11 17 23.5" />
      <path d="M37.5 6.6c-1.2-1.4-3-2.1-5-2.1-3 0-5 1.6-5 3.9 0 5.2 10.4 3.5 10.4 9.1 0 2.6-2.3 4.5-5.4 4.5-2.3 0-4.4-.9-5.7-2.5" />
      <circle cx="17" cy="5" r="3" fill="currentColor" stroke="none" className="tpf-mark-dot" />
    </svg>
  )
}

function LiveClock({ zone, label }: { zone: string; label: string }) {
  const [time, setTime] = useState(['--', '--'])

  useEffect(() => {
    let formatter: Intl.DateTimeFormat
    try {
      formatter = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: zone,
      })
    } catch {
      formatter = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
    }

    const tick = () => setTime(formatter.format(new Date()).split(':'))
    tick()
    const timer = window.setInterval(tick, 10000)
    return () => clearInterval(timer)
  }, [zone])

  return (
    <span className="tpf-clock">
      {label} {time[0]}
      <i aria-hidden="true">:</i>
      {time[1]}
    </span>
  )
}

function PushpinSvg({ base, id }: { base: string; id: string }) {
  const cHigh = mixHex(base, '#ffffff', 0.62)
  const cMid = base
  const cShade1 = mixHex(base, '#000000', 0.42)
  const cShade2 = mixHex(base, '#000000', 0.66)
  const tr = { transition: 'stop-color .7s ease' }

  const makeGradient = (gid: string) => (
    <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" style={{ ...tr, stopColor: cShade1 }} />
      <stop offset="0.24" style={{ ...tr, stopColor: cMid }} />
      <stop offset="0.4" style={{ ...tr, stopColor: cHigh }} />
      <stop offset="0.58" style={{ ...tr, stopColor: cMid }} />
      <stop offset="1" style={{ ...tr, stopColor: cShade2 }} />
    </linearGradient>
  )

  return (
    <svg viewBox="0 0 52 108" className="tpf-pin-svg" aria-hidden="true">
      <defs>
        {makeGradient(id + 'c')}
        {makeGradient(id + 'w')}
        {makeGradient(id + 'f')}
        <linearGradient id={id + 't'} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" style={{ ...tr, stopColor: cHigh }} />
          <stop offset="0.65" style={{ ...tr, stopColor: cMid }} />
          <stop offset="1" style={{ ...tr, stopColor: cShade1 }} />
        </linearGradient>
        <linearGradient id={id + 'n'} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#303848" />
          <stop offset="0.32" stopColor="#96a3ba" />
          <stop offset="0.5" stopColor="#f0f4fa" />
          <stop offset="0.7" stopColor="#758299" />
          <stop offset="1" stopColor="#1e2430" />
        </linearGradient>
        <radialGradient id={id + 'h'} cx="0.38" cy="0.32" r="0.62">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Needle */}
      <path d="M25 64 L27 64 L26.2 105.5 L25.8 105.5 Z" fill={`url(#${id}n)`} />
      <ellipse cx="26" cy="105.5" rx="0.5" ry="0.3" fill="#141820" />
      {/* Base flange */}
      <path d="M12.5 61 C12.5 58.5 39.5 58.5 39.5 61 L38 65.5 C38 67.5 14 67.5 14 65.5 Z" fill={`url(#${id}f)`} />
      <ellipse cx="26" cy="65.5" rx="12" ry="2.3" fill={`url(#${id}t)`} opacity="0.6" />
      {/* Body waist */}
      <path d="M16 33 C16 39 19.5 49 14.5 59 L37.5 59 C32.5 49 36 39 36 33 Z" fill={`url(#${id}w)`} />
      {/* Cap */}
      <path d="M14 28 C14 23 18.5 21 26 21 C33.5 21 38 23 38 28 L37 34 C37 36 15 36 15 34 Z" fill={`url(#${id}c)`} />
      <ellipse cx="26" cy="22" rx="12" ry="3.5" fill={`url(#${id}t)`} />
      {/* Specular highlights */}
      <ellipse cx="23.5" cy="22" rx="6.5" ry="1.6" fill={`url(#${id}h)`} />
      <path d="M22 25 Q23.5 38 23 54" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.45" />
    </svg>
  )
}

function CustomLink({
  href,
  className,
  label,
  children,
  style,
}: {
  href?: string
  className?: string
  label?: string
  children: ReactNode
  style?: CSSProperties
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (!href || href === '#') e.preventDefault()
  }
  const isExternal = Boolean(href && /^https?:/.test(href))

  return (
    <a
      href={href || '#'}
      className={className}
      aria-label={label}
      title={label}
      onClick={handleClick}
      style={style}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}

/* -------------------------------------------------------------------------- */
/* Main PushpinTearFooter Component                                          */
/* -------------------------------------------------------------------------- */

export interface FooterSocial {
  icon: string
  label: string
  href: string
}

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
  cta?: FooterLink
}

export interface PushpinTearFooterProps {
  brand?: string
  name?: string
  logo?: ReactNode
  logoHref?: string
  socials?: FooterSocial[]
  email?: string
  newsletter?: {
    label: string
    placeholder?: string
  }
  status?: {
    label: string
    href?: string
  }
  mark?: string
  timeZone?: string
  timeLabel?: string
  columns?: FooterColumn[]
  chat?: {
    label: string
    href?: string
  }
  sideLinks?: {
    icon: string
    label: string
    href: string
  }[]
  copyright?: string
  credit?: string
  handle?: {
    label: string
    href: string
  }
  sheet?: string
  paper?: string
  sheetInk?: string
  paperInk?: string
  seed?: number
  height?: string | number
  fontSans?: string
  onSubscribe?: (email: string) => void
  onRepin?: (seed: number) => void
  className?: string
}

export default function PushpinTearFooter({
  brand = 'inzeedo.',
  name = 'Inzeedo Studio',
  logo,
  logoHref = '#',
  socials = [
    { icon: 'github', label: 'GitHub', href: 'https://github.com' },
    { icon: '21st', label: '21st.dev', href: 'https://21st.dev' },
    { icon: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com' },
  ],
  email = 'hello@inzeedo.lk',
  newsletter = {
    label: 'Design systems & micro-interactions, monthly',
    placeholder: 'your@email.com',
  },
  status = {
    label: 'Available for digital projects',
    href: 'mailto:hello@inzeedo.lk',
  },
  mark = 'INZEEDO / 2026',
  timeZone = 'Asia/Colombo',
  timeLabel = 'CMB',
  columns = [
    {
      title: 'services',
      links: [
        { label: 'Creative Engineering', href: '#' },
        { label: 'Design Systems', href: '#' },
        { label: 'WebGL & Shaders', href: '#' },
        { label: 'Mobile Architecture', href: '#' },
      ],
      cta: { label: 'our work.', href: '#' },
    },
    {
      title: 'company',
      links: [
        { label: 'About Inzeedo', href: '#' },
        { label: 'Design Philosophy', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Colombo HQ', href: '#' },
      ],
      cta: { label: 'talk.', href: 'mailto:hello@inzeedo.lk' },
    },
  ],
  chat = { label: 'say hi', href: 'mailto:hello@inzeedo.lk' },
  sideLinks = [
    { icon: 'shield', label: 'privacy', href: '#' },
    { icon: 'doc', label: 'terms', href: '#' },
  ],
  copyright = '© 2026 Inzeedo Studio Ltd.',
  credit = 'crafted with precision by Inzeedo',
  handle = { label: '@inzeedo.lk', href: 'https://inzeedo.lk' },
  sheet = '#ff4a1c',
  paper = '#f1ede4',
  sheetInk = '#ffffff',
  paperInk = '#1b1712',
  seed = 23,
  height = '100svh',
  fontSans = '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
  onSubscribe,
  onRepin,
  className = '',
}: PushpinTearFooterProps) {
  const compId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const footerRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const sheetPathRef = useRef<SVGPathElement>(null)
  const rimPathRef = useRef<SVGPathElement>(null)
  const flapPathsRef = useRef<(SVGPathElement | null)[]>([])
  const flapGradsRef = useRef<(SVGLinearGradientElement | null)[]>([])
  const pinRef = useRef<HTMLButtonElement>(null)
  const timersRef = useRef<number[]>([])

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setPrefersReducedMotion(mq.matches)
    updateMotion()
    mq.addEventListener('change', updateMotion)
    return () => mq.removeEventListener('change', updateMotion)
  }, [])

  // 3-Stage Entrance Sequence & Pin Interaction States
  const [stage, setStage] = useState(0) // 0: hidden, 1: sheet, 2: pin drop, 3: paper & tear open
  const [isHit, setIsHit] = useState(false)
  const [inView, setInView] = useState(false)
  const [pinAction, setPinAction] = useState<'idle' | 'lift' | 'stab'>('idle')
  const [subscribed, setSubscribed] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [grainPatternUrl, setGrainPatternUrl] = useState('')

  const delayTimer = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms))
  }, [])

  // Physics simulation container ref
  const simRef = useRef({
    W: 0,
    H: 0,
    tear: makeTear(seed),
    prev: null as TearData | null,
    from: [] as number[],
    ys: [] as number[],
    mode: 'wait' as 'wait' | 'intro' | 'morph' | 'rest',
    t0: 0,
    dur: 1,
    raf: 0,
    px: -10000,
    py: -10000,
    lift: new Array(FLAP_COUNT).fill(0),
    still: false,
    busy: false,
    seed,
  })

  useEffect(() => {
    simRef.current.still = prefersReducedMotion
  }, [prefersReducedMotion])

  // Master render frame animation loop
  const scheduleFrame = useCallback(() => {
    const sim = simRef.current
    if (sim.raf || typeof requestAnimationFrame === 'undefined') return

    const tick = (timestamp: number) => {
      sim.raf = 0
      const { W, H, tear } = sim
      if (!W || !H) return

      let needsNextFrame = false
      let ys: number[]
      const flapProgress = new Array(FLAP_COUNT).fill(1)
      const prevFlapProgress = new Array(FLAP_COUNT).fill(0)

      if (sim.mode === 'wait') {
        ys = tear.ys.map(() => INTRO_START_Y)
        flapProgress.fill(0)
      } else if (sim.mode === 'intro') {
        const progress = (timestamp - sim.t0) / sim.dur
        ys = introYs(tear, Math.min(1, progress))
        tear.flaps.forEach((f, idx) => {
          flapProgress[idx] = flapOpen(tear, f, Math.min(1, progress))
        })
        if (progress >= 1) sim.mode = 'rest'
        else needsNextFrame = true
      } else if (sim.mode === 'morph') {
        const progress = (timestamp - sim.t0) / sim.dur
        ys = morphYs(sim.from, tear, Math.min(1, progress))
        flapProgress.fill(easeTear((progress - 0.5) / 0.5))
        prevFlapProgress.fill(1 - easeInOut(progress / 0.35))
        if (progress >= 1) sim.mode = 'rest'
        else needsNextFrame = true
      } else {
        ys = tear.ys
      }

      sim.ys = ys

      // Cursor hover lift physics on flaps
      tear.flaps.forEach((f, idx) => {
        const endIdx = Math.min(ys.length - 1, f.at + f.span)
        const flapCenterX = ((HORIZONTAL_STEPS[f.at] + HORIZONTAL_STEPS[endIdx]) / 2) * W
        const flapCenterY = ((ys[f.at] + ys[endIdx]) / 2) * H
        const mouseDist = Math.hypot(sim.px - flapCenterX, sim.py - flapCenterY)
        const targetLift = sim.still ? 0 : clamp01(1 - mouseDist / (0.2 * Math.max(W, 520)))

        sim.lift[idx] += (targetLift - sim.lift[idx]) * 0.14
        if (Math.abs(targetLift - sim.lift[idx]) > 0.003) needsNextFrame = true
        flapProgress[idx] *= 1 + 0.32 * sim.lift[idx]
      })

      // SVG path updates
      sheetPathRef.current?.setAttribute('d', sheetD(ys, W, H, tear.rim))
      rimPathRef.current?.setAttribute('d', sheetD(ys, W, H))

      const drawFlap = (slotIdx: number, flapDef: FlapDef | undefined, progressVal: number) => {
        const pathEl = flapPathsRef.current[slotIdx]
        const gradEl = flapGradsRef.current[slotIdx]
        if (!pathEl || !gradEl) return

        if (!flapDef || progressVal < 0.01) {
          pathEl.setAttribute('d', '')
          return
        }

        const poly = flapPoly(ys, flapDef, W, H, progressVal)
        pathEl.setAttribute('d', polyD(poly))

        const endIdx = Math.min(ys.length - 1, flapDef.at + flapDef.span)
        const apex = poly[flapDef.span + 3]
        if (apex) {
          gradEl.setAttribute('x1', String(((HORIZONTAL_STEPS[flapDef.at] + HORIZONTAL_STEPS[endIdx]) / 2) * W))
          gradEl.setAttribute('y1', String(((ys[flapDef.at] + ys[endIdx]) / 2) * H))
          gradEl.setAttribute('x2', String(apex[0]))
          gradEl.setAttribute('y2', String(apex[1]))
        }
      }

      for (let i = 0; i < FLAP_COUNT; i++) {
        drawFlap(i, tear.flaps[i], flapProgress[i])
        drawFlap(FLAP_COUNT + i, sim.prev?.flaps[i], prevFlapProgress[i])
      }

      if (needsNextFrame) {
        sim.raf = requestAnimationFrame(tick)
      }
    }

    sim.raf = requestAnimationFrame(tick)
  }, [])

  // ResizeObserver for canvas dimensions
  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const sim = simRef.current

    const observer = new ResizeObserver(() => {
      sim.W = el.clientWidth
      sim.H = el.clientHeight
      const svg = svgRef.current
      if (svg) {
        svg.setAttribute('width', String(sim.W))
        svg.setAttribute('height', String(sim.H))
        svg.setAttribute('viewBox', `0 0 ${sim.W} ${sim.H}`)
      }
      scheduleFrame()
    })

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (sim.raf) cancelAnimationFrame(sim.raf)
      sim.raf = 0
    }
  }, [scheduleFrame])

  // IntersectionObserver to trigger choreographed entrance sequence
  useEffect(() => {
    const el = footerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
      },
      { threshold: 0.22 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Procedural grain canvas generation for photorealistic paper texture
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 160
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imgData = ctx.createImageData(160, 160)
    const rng = mulberry32(42)
    for (let i = 0; i < imgData.data.length; i += 4) {
      const shade = rng() < 0.5 ? 0 : 255
      imgData.data[i] = shade
      imgData.data[i + 1] = shade
      imgData.data[i + 2] = shade
      imgData.data[i + 3] = Math.floor(rng() * 46)
    }
    ctx.putImageData(imgData, 0, 0)
    setGrainPatternUrl(canvas.toDataURL())
  }, [])

  // Staged entrance animation sequence
  useEffect(() => {
    if (!inView || stage > 0) return
    const sim = simRef.current

    if (prefersReducedMotion) {
      setStage(3)
      sim.mode = 'rest'
      scheduleFrame()
      return
    }

    // Stage 1: Sheet elements appear with staggered delays
    setStage(1)

    // Stage 2: Pushpin drops with physics bounce
    delayTimer(() => setStage(2), 640)

    // Stage 3: Pushpin stabs the paper, tearing the jagged edge open
    delayTimer(() => {
      setIsHit(true)
      setStage(3)
      sim.mode = 'intro'
      sim.t0 = performance.now()
      sim.dur = 1550
      scheduleFrame()
    }, 1140)

    // Clear hit impact class
    delayTimer(() => setIsHit(false), 1480)
  }, [inView, stage, prefersReducedMotion, delayTimer, scheduleFrame])

  // Cleanup pending timeouts
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((id) => clearTimeout(id))
    }
  }, [])

  // Prop seed change morph
  useEffect(() => {
    const sim = simRef.current
    if (seed !== sim.seed) {
      sim.seed = seed
      sim.prev = sim.tear
      sim.from = sim.ys.length ? sim.ys : sim.tear.ys
      sim.tear = makeTear(seed)
      if (sim.mode !== 'wait') {
        sim.mode = prefersReducedMotion ? 'rest' : 'morph'
        sim.t0 = performance.now()
        sim.dur = 1100
      }
      scheduleFrame()
    }
  }, [seed, prefersReducedMotion, scheduleFrame])

  // Mouse tilt & proximity tracking
  const handlePointerMove = (e: React.PointerEvent) => {
    const el = footerRef.current
    const sim = simRef.current
    if (!el || sim.still) return
    const rect = el.getBoundingClientRect()
    sim.px = e.clientX - rect.left
    sim.py = e.clientY - rect.top

    const tiltDeg = Math.max(-9, Math.min(9, (sim.px / rect.width - 0.5) * 18))
    pinRef.current?.style.setProperty('--tilt', `${tiltDeg.toFixed(2)}deg`)
    scheduleFrame()
  }

  const handlePointerLeave = () => {
    const sim = simRef.current
    sim.px = -10000
    sim.py = -10000
    pinRef.current?.style.setProperty('--tilt', '0deg')
    scheduleFrame()
  }

  // Interactive Re-pin Tear Action
  const handleRepin = () => {
    const sim = simRef.current
    if (sim.busy || stage < 3) return
    const nextSeed = sim.seed + 1

    const swapTear = () => {
      sim.seed = nextSeed
      sim.prev = sim.tear
      sim.from = sim.ys.length ? sim.ys : sim.tear.ys
      sim.tear = makeTear(nextSeed)
    }

    if (prefersReducedMotion) {
      swapTear()
      sim.prev = null
      sim.mode = 'rest'
      scheduleFrame()
      onRepin?.(nextSeed)
      return
    }

    sim.busy = true
    setPinAction('lift')

    delayTimer(() => {
      swapTear()
      sim.mode = 'morph'
      sim.t0 = performance.now()
      sim.dur = 1150
      scheduleFrame()
    }, 300)

    delayTimer(() => setPinAction('stab'), 1280)

    delayTimer(() => {
      setPinAction('idle')
      sim.busy = false
      onRepin?.(nextSeed)
    }, 1720)
  }

  const flashToast = (msg: string) => {
    setToastMessage(msg)
    delayTimer(() => setToastMessage(''), 1600)
  }

  const handleCopyEmail = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(email).then(
        () => flashToast('email copied'),
        () => flashToast(email),
      )
    } else {
      flashToast(email)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = emailInput.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      flashToast('check that email')
      return
    }
    setSubscribed(true)
    onSubscribe?.(trimmed)
  }

  // Color values
  const pinBase = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(sheet) ? sheet : '#ff4a1c'
  const paperBlend = mixHex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(paper) ? paper : '#f1ede4', '#ffffff', 0.35)

  const footerStyle: CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    // CSS Variables consumed by PushpinTearFooter.exact.css
    ['--tpf-sheet' as string]: sheet,
    ['--tpf-paper' as string]: paper,
    ['--tpf-on-sheet' as string]: sheetInk,
    ['--tpf-on-paper' as string]: paperInk ?? sheet,
    ['--tpf-rim' as string]: mixHex(paperBlend, '#ffffff', 0.6),
    ['--tpf-sans' as string]: fontSans,
  }

  // Staggered animation index generator
  const delayIndex = (idx: number) => ({ ['--i' as string]: idx } as CSSProperties)

  // Assembled class list matching the original 21st bundle
  const footerClasses = [
    'tpf',
    stage >= 1 && 's1',
    stage >= 2 && 's2',
    stage >= 3 && 's3',
    isHit && 'is-hit',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const visibleColumns = columns.slice(0, 2)
  const mailtoHref = `mailto:${email}`

  return (
    <footer
      ref={footerRef}
      className={footerClasses}
      style={footerStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* SVG Canvas with dynamic paper, shadow layers & torn polygons */}
      <svg ref={svgRef} className="tpf-stage" aria-hidden="true">
        <defs>
          <radialGradient id={compId + 'v'} cx="0.5" cy="0.78" r="0.75">
            <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#0d1c38" stopOpacity="0.07" />
          </radialGradient>
          <linearGradient id={compId + 'l'} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.13" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#001033" stopOpacity="0.12" />
          </linearGradient>

          {grainPatternUrl && (
            <pattern id={compId + 'g'} width="160" height="160" patternUnits="userSpaceOnUse">
              <image href={grainPatternUrl} width="160" height="160" />
            </pattern>
          )}

          <filter id={compId + 'd'} x="-5%" y="-5%" width="110%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#0a1a3a" floodOpacity="0.3" />
          </filter>
          <filter id={compId + 'f'} x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="-2" dy="4" stdDeviation="4" floodColor="#0a1a3a" floodOpacity="0.26" />
          </filter>

          {Array.from({ length: FLAP_COUNT * 2 }, (_, idx) => (
            <linearGradient
              key={idx}
              id={`${compId}fg${idx}`}
              ref={(el) => {
                flapGradsRef.current[idx] = el
              }}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor={mixHex(paperBlend, '#1c2a44', 0.34)} />
              <stop offset="0.5" stopColor={mixHex(paperBlend, '#1c2a44', 0.08)} />
              <stop offset="1" stopColor="#ffffff" />
            </linearGradient>
          ))}

          <path id={compId + 's'} ref={sheetPathRef} />
        </defs>

        {/* Paper bottom layer */}
        <rect className="tpf-paper" width="100%" height="100%" />
        <rect width="100%" height="100%" fill={`url(#${compId}v)`} style={{ mixBlendMode: 'multiply' }} />
        {grainPatternUrl && <rect width="100%" height="100%" fill={`url(#${compId}g)`} opacity="0.32" />}

        {/* Top colored sheet with torn rim & shadow */}
        <g className="tpf-sheet-g" filter={`url(#${compId}d)`}>
          <path ref={rimPathRef} className="tpf-rim" />
          <use href={`#${compId}s`} className="tpf-sheet" />
        </g>
        <use href={`#${compId}s`} fill={`url(#${compId}l)`} />
        {grainPatternUrl && <use href={`#${compId}s`} fill={`url(#${compId}g)`} opacity="0.5" />}

        {/* Flap polygons */}
        <g filter={`url(#${compId}f)`}>
          {Array.from({ length: FLAP_COUNT * 2 }, (_, idx) => (
            <path
              key={idx}
              ref={(el) => {
                flapPathsRef.current[idx] = el
              }}
              fill={`url(#${compId}fg${idx})`}
            />
          ))}
        </g>
      </svg>

      {/* Top Header Row (Back to top, Socials, Brand Logo, Email Copy) */}
      <div className="tpf-z tpf-top">
        <div className="tpf-row tpf-h" style={delayIndex(0)}>
          <button type="button" className="tpf-ib tpf-up" onClick={scrollToTop} aria-label="Back to top" title="Back to top">
            <PushpinIcon name="chevL" />
          </button>
          <span style={{ width: '0.6em' }} />
          {socials.map((soc, idx) => (
            <CustomLink key={idx} href={soc.href} className="tpf-ib" label={soc.label}>
              <PushpinIcon name={soc.icon} />
            </CustomLink>
          ))}
        </div>

        <CustomLink href={logoHref} className="tpf-logo tpf-h" label={`${name}, home`} style={delayIndex(1)}>
          {logo ?? <BrandMarkSvg />}
        </CustomLink>

        <div className="tpf-h" style={{ ...delayIndex(2), position: 'relative' }}>
          <button type="button" className="tpf-mail" onClick={handleCopyEmail} aria-label={`Copy ${email}`} title="Copy email">
            <span>{email}</span>
            <PushpinIcon name="copy" />
          </button>
          <span className={`tpf-toast${toastMessage ? ' on' : ''}`} role="status" aria-live="polite">
            {toastMessage}
          </span>
        </div>
      </div>

      {/* Newsletter Subscription Pill */}
      {newsletter && (
        <form className="tpf-z tpf-news tpf-h" style={delayIndex(3)} onSubmit={handleSubscribeSubmit}>
          <label htmlFor={`${compId}e`}>{newsletter.label}</label>
          <div className="tpf-pill" data-sent={subscribed}>
            <input
              id={`${compId}e`}
              type="email"
              placeholder={newsletter.placeholder ?? 'your@email.com'}
              autoComplete="email"
              value={emailInput}
              disabled={subscribed}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <span className="tpf-sent" aria-live="polite">
              {subscribed && (
                <>
                  <PushpinIcon name="check" /> you're on the list
                </>
              )}
            </span>
            <button type="submit" className="tpf-knob" aria-label="Subscribe" disabled={subscribed}>
              <PushpinIcon name={subscribed ? 'check' : 'arrow'} />
            </button>
          </div>
        </form>
      )}

      {/* Flank Labels: Serial mark and Live Clock */}
      {mark && (
        <span className="tpf-z tpf-flank tpf-h" style={{ ...delayIndex(4), left: '24%' }}>
          {mark}
        </span>
      )}
      {timeZone && (
        <span className="tpf-z tpf-flank tpf-h" style={{ ...delayIndex(4), left: '76%' }} title={`Local time · ${timeZone}`}>
          <LiveClock zone={timeZone} label={timeLabel} />
        </span>
      )}

      {/* Live Status Badge */}
      {status && (
        <>
          <CustomLink href={status.href ?? mailtoHref} className="tpf-z tpf-status tpf-h" style={delayIndex(5)}>
            <i className="tpf-live" aria-hidden="true" />
            <span>{status.label}</span>
          </CustomLink>
          <span className="tpf-z tpf-badge" aria-hidden="true">
            <span className="tpf-h" style={{ ...delayIndex(6), display: 'block', width: '100%', height: '100%' }}>
              <StarburstSeal />
            </span>
          </span>
        </>
      )}

      {/* Navigation Columns */}
      {visibleColumns.map((col, idx) => (
        <nav
          key={idx}
          className={`tpf-z tpf-col tpf-h ${idx ? 'r' : 'l'}`}
          style={delayIndex(6 + idx)}
          aria-label={col.title}
        >
          <h3>
            {col.title}
            <PushpinIcon name="squiggle" />
          </h3>
          <ul>
            {col.links.map((link, lIdx) => (
              <li key={lIdx}>
                <CustomLink href={link.href}>{link.label}</CustomLink>
              </li>
            ))}
          </ul>
          {col.cta ? (
            <CustomLink href={col.cta.href} className="tpf-big">
              {col.cta.label}
            </CustomLink>
          ) : idx ? (
            <CustomLink href={mailtoHref} className="tpf-big">
              talk.
            </CustomLink>
          ) : null}
        </nav>
      ))}

      {/* Interactive 3D Physics Pushpin */}
      <button
        ref={pinRef}
        type="button"
        className="tpf-pin"
        data-pin={pinAction}
        onClick={handleRepin}
        aria-label="Re-pin: tear a new edge"
        title="Pull the pin"
      >
        <span className="tpf-shadow" aria-hidden="true" />
        <span className="tpf-tilt">
          <span className="tpf-drop">
            <span className="tpf-body">
              <PushpinSvg base={pinBase} id={`${compId}p`} />
            </span>
          </span>
        </span>
      </button>

      {/* Lower Paper Brand Headline */}
      <div className="tpf-z tpf-brand tpf-ink">
        <div className="tpf-brand-top tpf-p" style={delayIndex(0)}>
          <span className="tpf-eye">{name}</span>
          {chat && (
            <CustomLink href={chat.href ?? mailtoHref} className="tpf-bub" label={chat.label}>
              <span className="tpf-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <b>{chat.label}</b>
            </CustomLink>
          )}
        </div>
        <CustomLink href={logoHref} className="tpf-word" label={name}>
          <span>{brand}</span>
        </CustomLink>
      </div>

      {/* Side Links */}
      {sideLinks.slice(0, 2).map((item, idx) => (
        <CustomLink
          key={idx}
          href={item.href}
          className={`tpf-z tpf-side tpf-ink tpf-p ${idx ? 'r' : 'l'}`}
          label={item.label}
          style={{ ...delayIndex(1 + idx), left: idx ? '71.5%' : '29.5%' }}
        >
          <span>{item.label}</span>
          <PushpinIcon name={item.icon} />
        </CustomLink>
      ))}

      {/* Bottom Legal Footer */}
      <div className="tpf-z tpf-foot tpf-ink">
        <span className="tpf-p" style={delayIndex(3)}>
          {copyright}
        </span>
        {credit && (
          <span className="tpf-credit tpf-p" style={delayIndex(4)}>
            {credit}
          </span>
        )}
        <CustomLink href={handle.href} className="tpf-handle tpf-p" style={delayIndex(5)}>
          {handle.label}
        </CustomLink>
      </div>
    </footer>
  )
}
