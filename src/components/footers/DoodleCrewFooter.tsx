import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import './DoodleCrewFooter.exact.css'

export const meta = {
  title: 'Inzeedo Doodle Crew Footer',
  description:
    'Playful hand-drawn footer with dynamic interactive character crew, procedural line boiling, physics floaters, gaze tracking, speech bubbles, and Inzeedo branding.',
  category: 'footers',
  fullWidth: true,
  thumbnail: true,
}

/* -------------------------------------------------------------------------- */
/* Math, Procedural Layout & Timeline Utilities                              */
/* -------------------------------------------------------------------------- */

const hash = (n: number): number => {
  const d = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return d - Math.floor(d)
}

const clamp = (val: number, min: number, max: number): number =>
  val < min ? min : val > max ? max : val

interface WordLayout {
  x: number[]
  w: number[]
  width: number
}

const layoutWord = (advances: number[], tracking: number, capHeight: number): WordLayout => {
  const x: number[] = []
  const w: number[] = []
  let cursor = 0
  const letterSpacing = (Number.isFinite(tracking) ? tracking : 0) * capHeight

  for (let i = 0; i < advances.length; i++) {
    const advance = Number.isFinite(advances[i]) && advances[i] > 0 ? advances[i] : 0
    x.push(cursor)
    w.push(advance)
    cursor += advance + (i < advances.length - 1 ? letterSpacing : 0)
  }
  return { x, w, width: Math.max(0, cursor) }
}

const seatPoint = (
  seat: 'top' | 'behind' | 'front',
  letterX: number,
  letterW: number,
  cap: number,
  offset = 0,
  scale = 1,
): { x: number; y: number } => {
  const cx = letterX + letterW * (0.5 + (Number.isFinite(offset) ? offset : 0))
  if (seat === 'top') return { x: cx, y: -cap }
  if (seat === 'behind') return { x: cx, y: -cap + 30 * scale }
  return { x: cx, y: 0 }
}

const lookAt = (
  fromX: number,
  fromY: number,
  targetX: number,
  targetY: number,
  maxR: number,
  distFalloff = 220,
): { x: number; y: number } => {
  const dx = targetX - fromX
  const dy = targetY - fromY
  const dist = Math.hypot(dx, dy)
  if (!Number.isFinite(dist) || dist < 1e-6 || maxR <= 0) return { x: 0, y: 0 }
  const factor = (maxR * Math.min(1, dist / Math.max(1e-6, distFalloff))) / dist
  return { x: dx * factor, y: dy * factor }
}

export interface Floater {
  kind: string
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  fall: number
  phase: number
  pop: number
}

const stepFloater = (
  f: Floater,
  dt: number,
  time: number,
  w: number,
  h: number,
  mouseX: number,
  mouseY: number,
  mouseRadius: number,
  rnd: () => number,
): Floater => {
  const safeDt = clamp(Number.isFinite(dt) ? dt : 0, 0, 0.05)
  const padding = 40

  if (f.pop > 0) {
    f.pop -= safeDt
    if (f.pop <= 0) {
      f.pop = 0
      f.x = rnd() * w
      f.y = -padding
      f.vx = 0
      f.vy = f.fall
    }
    return f
  }

  const sway = Math.sin(time * 0.7 + f.phase) * 14
  if (Number.isFinite(mouseX) && Number.isFinite(mouseY) && mouseRadius > 0) {
    const dx = f.x - mouseX
    const dy = f.y - mouseY
    const dist = Math.hypot(dx, dy)
    if (dist < mouseRadius && dist > 0.01) {
      const repulse = Math.pow(1 - dist / mouseRadius, 2) * 2400
      f.vx += (dx / dist) * repulse * safeDt
      f.vy += (dy / dist) * repulse * safeDt
      f.vr += (dx > 0 ? 1 : -1) * repulse * 0.004 * safeDt
    }
  }

  const blend = Math.min(1, safeDt * 2.4)
  f.vx += (sway - f.vx) * blend
  f.vy += (f.fall - f.vy) * blend
  f.vr += (Math.sin(f.phase * 3) * 18 - f.vr) * Math.min(1, safeDt * 0.8)

  f.x += f.vx * safeDt
  f.y += f.vy * safeDt
  f.rot = (f.rot + f.vr * safeDt) % 360

  if (f.y > h + padding) {
    f.y = -padding
    f.x = rnd() * w
  } else if (f.y < -padding * 3) {
    f.y = h + padding
  }

  if (f.x < -padding) f.x = w + padding
  else if (f.x > w + padding) f.x = -padding

  return f
}

interface TimelineDelays {
  ground: number
  letter: (idx: number) => number
  crewStart: number
  member: (idx: number) => number
  doodles: number
  word: (idx: number) => number
  action: (idx: number) => number
  total: number
}

const buildTimeline = (
  letterCount: number,
  crewCount: number,
  wordCount: number,
  actionCount: number,
): TimelineDelays => {
  const letters = Math.max(0, Math.floor(letterCount) || 0)
  const crew = Math.max(0, Math.floor(crewCount) || 0)
  const words = Math.max(0, Math.floor(wordCount) || 0)
  const actions = Math.max(0, Math.floor(actionCount) || 0)

  const letterDelay = (i: number) => 160 + i * 80
  const crewStart = letterDelay(Math.max(0, letters - 1)) + 420
  const memberDelay = (i: number) => crewStart + i * 130
  const doodlesDelay = crewStart + Math.max(0, crew - 1) * 130 * 0.5
  const wordsStart = crewStart + 260
  const wordDelay = (i: number) => wordsStart + i * 45
  const actionsStart = wordDelay(words) + 120
  const actionDelay = (i: number) => actionsStart + i * 110

  const total = Math.max(
    memberDelay(Math.max(0, crew - 1)) + 720,
    actionDelay(Math.max(0, actions - 1)) + 600,
    letterDelay(Math.max(0, letters - 1)) + 560,
  )

  return {
    ground: 60,
    letter: letterDelay,
    crewStart,
    member: memberDelay,
    doodles: doodlesDelay,
    word: wordDelay,
    action: actionDelay,
    total,
  }
}

/* -------------------------------------------------------------------------- */
/* Theme Presets                                                              */
/* -------------------------------------------------------------------------- */

export interface ThemeColors {
  background: string
  ink: string
  accent: string
}

export const DOODLE_PRESETS: Record<string, ThemeColors> = {
  auto: {
    background: 'var(--color-background, #ffffff)',
    ink: 'var(--color-foreground, #0d0d0d)',
    accent: '#ff6b2c',
  },
  paper: {
    background: '#ffffff',
    ink: '#0d0d0d',
    accent: '#ff6b2c',
  },
  night: {
    background: '#0e0e10',
    ink: '#f4f1ea',
    accent: '#ff8a3d',
  },
  riso: {
    background: '#f4f2ff',
    ink: '#2433c9',
    accent: '#ff4f8b',
  },
  sunny: {
    background: '#ffd94a',
    ink: '#141414',
    accent: '#e8402a',
  },
}

/* -------------------------------------------------------------------------- */
/* Character Art Vector Definitions                                           */
/* -------------------------------------------------------------------------- */

const PALETTE_DOODLES = {
  flame: '#ff7a1a',
  flameCore: '#ffd23f',
  gold: '#ffd23f',
  heart: '#ff5c7a',
  bread: '#f2c48d',
  leaf: '#5fb247',
}

interface EyeDef {
  x: number
  y: number
  r: number
  pupil: number
  max: number
}

interface CharacterArt {
  k: number
  box: { l: number; r: number; t: number; b: number }
  seat: 'top' | 'behind' | 'front'
  eyes: EyeDef[]
  idle?: string
  body: (hatchUrl: string) => ReactNode
  front?: () => ReactNode
}

export const CHARACTERS: Record<string, CharacterArt> = {
  yeti: {
    k: 1,
    box: { l: -72, r: 60, t: -140, b: 6 },
    seat: 'front',
    eyes: [
      { x: -15, y: -86, r: 8, pupil: 3.6, max: 3.6 },
      { x: 13, y: -88, r: 8, pupil: 3.6, max: 3.6 },
    ],
    body: (hatch) => (
      <>
        <ellipse className="dcf-shadow" cx="0" cy="2" rx="54" ry="5" />
        <path d="M-40 -92 C-62 -92 -70 -76 -68 -56 L-66 -30 C-64 -18 -54 -16 -44 -20 Z" />
        <path d="M-40 -92 C-62 -92 -70 -76 -68 -56 L-66 -30 C-64 -18 -54 -16 -44 -20 Z" fill={hatch} stroke="none" />
        <path className="n" d="M-67 -64 C-58 -59 -50 -59 -43 -64" />
        <path d="M-30 -104 C-40 -112 -44 -124 -40 -138 C-32 -129 -22 -122 -13 -114 Z" />
        <path d="M18 -114 C26 -124 36 -130 47 -133 C45 -120 41 -110 32 -101 Z" />
        <path className="n" d="M-38 -124 L-28 -119 M39 -125 L33 -116" />
        <path d="M-44 -2 C-54 -28 -54 -66 -42 -90 C-32 -110 -14 -118 2 -118 C22 -118 40 -108 48 -88 C58 -64 58 -28 48 -2 C30 4 -26 4 -44 -2 Z" />
        <path d="M40 -96 C54 -66 54 -30 46 -4 C40 -2 34 -1 30 0 C40 -30 42 -64 33 -101 Z" fill={hatch} stroke="none" />
        <path className="n" d="M-7 -117 C-5 -126 1 -128 3 -120 C5 -127 11 -126 11 -116" />
        <path className="n thin" d="M-14 -24 l-3 4 M8 -40 l3 4 M14 -46 l3 3 M20 -30 l3 3" />
        <path className="n" d="M-48 -62 C-22 -50 10 -32 49 -26 M-50 -52 C-24 -40 8 -22 49 -16" />
        <rect x="-12" y="-46" width="15" height="13" rx="2.5" transform="rotate(26 -4.5 -39.5)" />
        <path d="M-46 -60 C-62 -50 -63 -29 -51 -19 C-45 -15 -38 -19 -40 -28 C-43 -36 -40 -46 -36 -52" />
        <path d="M46 -58 C61 -46 61 -26 51 -18 C45 -14 38 -18 40 -26 C43 -34 41 -44 37 -50" />
        <path d="M-37 -2 C-41 -14 -23 -19 -16 -7 C-14 0 -26 4 -37 -2 Z" />
        <path d="M37 -2 C41 -14 23 -19 16 -7 C14 0 26 4 37 -2 Z" />
        <path className="n thin" d="M-30 -4 l1 -4 M-24 -3 l1 -4 M30 -4 l-1 -4 M24 -3 l-1 -4" />
        <path className="n" d="M-23 -98 L-9 -96 M6 -98 L20 -100" />
        <path className="n" d="M-12 -70 C-6 -64 6 -64 12 -71" />
        <path d="M3 -66.5 L5.5 -60 L8 -67.5 Z" />
      </>
    ),
  },
  kid: {
    k: 1.28,
    box: { l: -30, r: 30, t: -88, b: 42 },
    seat: 'top',
    eyes: [
      { x: -6, y: -58, r: 0, pupil: 2.5, max: 1.8 },
      { x: 6.5, y: -58, r: 0, pupil: 2.5, max: 1.8 },
    ],
    body: (hatch) => (
      <>
        <path d="M-15 -6 L-3 -6 C-3 8 -5 20 -6 30 L-15 30 C-15 18 -16 6 -15 -6 Z" />
        <path d="M3 -6 L15 -6 C17 6 19 16 22 27 L12 30 C10 18 6 6 3 -6 Z" />
        <path d="M3 -6 L15 -6 C17 6 19 16 22 27 L12 30 C10 18 6 6 3 -6 Z" fill={hatch} stroke="none" />
        <path className="k" d="M-17 30 C-20 34 -20 40 -14 41 L-2 41 C2 40 0 34 -5 30 Z" />
        <path className="k" d="M11 29 C8 34 10 40 16 40 L26 38 C29 36 27 30 22 27 Z" />
        <path d="M-20 -4 C-22 -20 -18 -38 -10 -44 L10 -44 C18 -38 22 -20 20 -4 Z" />
        <path className="n thick" d="M-19.5 -14 L19.5 -14 M-18.5 -26 L18.5 -26 M-14 -36 L14 -36" />
        <path className="n" d="M-18 -36 C-28 -28 -30 -14 -26 -5" />
        <circle cx="-26" cy="-3" r="4" />
        <path className="n" d="M18 -36 C27 -30 30 -18 28 -7" />
        <circle cx="28" cy="-4" r="4" />
        <circle cx="-17" cy="-58" r="4" />
        <circle cx="17" cy="-58" r="4" />
        <circle cx="0" cy="-60" r="17" />
        <path className="n thin" d="M-11 -52 l2 -2 M-8 -52 l2 -2 M8 -52 l2 -2 M11 -52 l2 -2" />
        <path className="n" d="M-5 -50 C-2 -47 2 -47 5 -50" />
        <path d="M-15 -70 C-14 -87 14 -87 15 -70 Z" />
        <path d="M-27 -68 C-16 -75 16 -75 27 -68 C18 -63 -18 -63 -27 -68 Z" />
        <path className="n thick" d="M-14.5 -74 C-6 -77 6 -77 14.5 -74" />
      </>
    ),
  },
  bird: {
    k: 1.22,
    box: { l: -34, r: 30, t: -62, b: 2 },
    seat: 'top',
    eyes: [
      { x: 3, y: -30, r: 4.6, pupil: 2.3, max: 2 },
      { x: 12, y: -31, r: 4.6, pupil: 2.3, max: 2 },
    ],
    idle: 'dcf-peck',
    body: (hatch) => (
      <>
        <path className="n" d="M-5 0 L-5 -7 M-9 0 L-1 0 M5 0 L5 -7 M1 0 L9 0" />
        <path d="M-17 -16 C-26 -18 -31 -14 -33 -9 C-26 -10 -20 -8 -15 -10 Z" />
        <path d="M-18 -14 C-20 -30 -10 -40 2 -40 C16 -40 22 -28 20 -16 C18 -6 8 -4 0 -4 C-10 -4 -17 -8 -18 -14 Z" />
        <path d="M-11 -25 C-3 -26 1 -18 -3 -13 C-9 -12 -15 -17 -11 -25 Z" fill={hatch} />
        <path className="o" d="M19 -30 L29 -27 L19 -23 Z" />
        <path className="a" d="M-3 -38 L4 -59 L12 -37 Z" />
        <path className="n thin" d="M-1 -44 L10 -46 M1 -51 L8 -52" />
        <circle cx="4" cy="-60" r="2.8" />
      </>
    ),
  },
  cat: {
    k: 1.06,
    box: { l: -30, r: 52, t: -110, b: 4 },
    seat: 'front',
    eyes: [{ x: 10, y: -76, r: 6, pupil: 2.8, max: 2.6 }],
    body: (hatch) => (
      <>
        <ellipse className="dcf-shadow" cx="4" cy="2" rx="32" ry="4" />
        <g className="dcf-tail">
          <path d="M18 -4 C42 -4 52 -24 46 -44 C44 -51 36 -53 34 -46 C40 -30 34 -16 16 -14 Z" />
          <path className="n thin" d="M40 -16 l5 4 M45 -30 l6 1 M43 -42 l6 -3" />
        </g>
        <path d="M-22 0 C-28 -18 -24 -42 -14 -52 L14 -52 C24 -42 28 -18 22 0 C10 3 -10 3 -22 0 Z" />
        <path d="M14 -46 C24 -36 26 -16 22 0 C18 1 14 2 12 2 C16 -14 16 -32 10 -46 Z" fill={hatch} stroke="none" />
        <path className="n" d="M-8 -30 L-9 -1 M8 -30 L9 -1" />
        <path d="M-16 1 C-16 -5 -3 -5 -3 1 Z M3 1 C3 -5 16 -5 16 1 Z" />
        <path className="a" d="M-18 -55 C-6 -49 6 -49 18 -55 L17 -46 C6 -40 -6 -40 -17 -46 Z" />
        <path className="a" d="M9 -45 L18 -32 L6 -37 Z" />
        <path d="M-22 -86 L-25 -107 L-7 -96 Z" />
        <path d="M8 -96 L23 -108 L22 -86 Z" />
        <path className="n thin" d="M-20 -92 L-21 -101 M18 -101 L18 -92" />
        <path d="M-26 -70 C-28 -88 -16 -98 0 -98 C16 -98 28 -88 26 -70 C24 -56 12 -50 0 -50 C-12 -50 -24 -56 -26 -70 Z" />
        <path className="n thin" d="M-4 -97 L-3 -90 M3 -97 L3 -91" />
        <path className="n" d="M-26 -80 C-14 -83 4 -87 25 -93" />
        <ellipse className="k" cx="-10" cy="-76" rx="7.5" ry="6.5" />
        <path className="k" d="M-2.5 -68 L2.5 -68 L0 -64.5 Z" />
        <path className="n" d="M0 -64.5 C-1 -60.5 -5 -60.5 -6 -62.5 M0 -64.5 C1 -60.5 5 -60.5 6 -62.5" />
        <path className="n thin" d="M-15 -66 L-29 -68 M-15 -63 L-28 -59 M15 -66 L29 -68 M15 -63 L28 -59" />
      </>
    ),
  },
  ghost: {
    k: 1.3,
    box: { l: -26, r: 26, t: -70, b: 0 },
    seat: 'behind',
    eyes: [
      { x: -8, y: -44, r: 6.5, pupil: 3.2, max: 3 },
      { x: 9, y: -44, r: 6.5, pupil: 3.2, max: 3 },
    ],
    idle: 'dcf-bob',
    body: (hatch) => (
      <>
        <path d="M-23 -14 L-23 -40 C-23 -59 -12 -67 0 -67 C12 -67 23 -59 23 -40 L23 -14 C12 -10 -12 -10 -23 -14 Z" />
        <path d="M13 -61 C21 -54 23 -46 23 -36 L23 -15 L15 -13 L15 -36 C15 -46 15 -54 13 -61 Z" fill={hatch} stroke="none" />
        <path className="n thin" d="M-16 -56 C-12 -61 -6 -63 -2 -63" />
        <path className="k" d="M-5 -33 C-3 -27 4 -27 6 -33 Z" />
        <path className="n thin" d="M-17 -35 l3 -2 M-14 -34 l3 -2 M14 -35 l3 -2 M17 -34 l3 -2" />
      </>
    ),
    front: () => (
      <>
        <path d="M-25 -32 C-27 -38 -21 -42 -17 -38 C-15 -42 -10 -41 -10 -36 L-11 -30 C-15 -28 -22 -28 -25 -32 Z" />
        <path d="M25 -32 C27 -38 21 -42 17 -38 C15 -42 10 -41 10 -36 L11 -30 C15 -28 22 -28 25 -32 Z" />
      </>
    ),
  },
  mushroom: {
    k: 1.12,
    box: { l: -27, r: 27, t: -56, b: 4 },
    seat: 'front',
    eyes: [
      { x: -4.5, y: -16, r: 0, pupil: 1.9, max: 1.3 },
      { x: 4.5, y: -16, r: 0, pupil: 1.9, max: 1.3 },
    ],
    idle: 'dcf-sway',
    body: (hatch) => (
      <>
        <ellipse className="dcf-shadow" cx="0" cy="2" rx="18" ry="3" />
        <path className="n" d="M-10 -15 L-17 -9 M10 -15 L17 -11" />
        <path d="M-10 0 C-12 -10 -10 -22 -8 -28 L8 -28 C10 -22 12 -10 10 0 C4 2 -4 2 -10 0 Z" />
        <path d="M5 -27 C9 -20 11 -10 10 0 C8 1 6 1.5 4 1.5 C6 -8 6 -18 2 -27 Z" fill={hatch} stroke="none" />
        <path className="r" d="M-25 -28 C-27 -45 -12 -55 0 -55 C12 -55 27 -45 25 -28 C14 -23 -14 -23 -25 -28 Z" />
        <circle cx="-12" cy="-40" r="4.2" />
        <circle cx="6" cy="-46" r="3.4" />
        <circle cx="15" cy="-34" r="3" />
        <circle cx="-2" cy="-33" r="2.4" />
        <path className="n" d="M-2 -10 C-1 -8 1 -8 2 -10" />
      </>
    ),
  },
}

/* -------------------------------------------------------------------------- */
/* Floating Doodle Shapes                                                     */
/* -------------------------------------------------------------------------- */

function DoodleShape({ kind }: { kind: string }) {
  switch (kind) {
    case 'flame':
      return (
        <>
          <path fill={PALETTE_DOODLES.flame} d="M0 14 C-9 14 -12 6 -10 0 C-8 -5 -4 -6 -4 -12 C1 -9 3 -5 2 -1 C4 -3 5 -6 5 -8 C10 -3 11 4 8 9 C6 12 3 14 0 14 Z" />
          <path fill={PALETTE_DOODLES.flameCore} d="M0 11.5 C-4 11.5 -6 8 -5 5 C-4 2 -1 1 -1 -3 C2 -1 4 3 3 6 C4 5 5 4 5 3 C7 6 5 11.5 0 11.5 Z" />
        </>
      )
    case 'sandwich':
      return (
        <>
          <path fill={PALETTE_DOODLES.bread} d="M-13 5 L13 5 L12.5 9.5 C4 11 -4 11 -12.5 9.5 Z" />
          <path fill={PALETTE_DOODLES.gold} d="M-12 2 L12 2 L11 5 L5 5 L3 9 L1 5 L-12 5 Z" />
          <path fill="none" stroke={PALETTE_DOODLES.leaf} strokeWidth="2.6" d="M-13 1 q2.2 2.4 4.4 0 q2.2 2.4 4.4 0 q2.2 2.4 4.4 0 q2.2 2.4 4.4 0 q2.2 2.4 4.4 0 q2.2 2.4 4.4 0" />
          <path fill={PALETTE_DOODLES.bread} d="M-13 -1 C-14 -8 -10 -11 -6 -10 C-3 -13.5 3 -13.5 6 -10 C10 -11 14 -8 13 -1 Z" />
          <path fill="none" strokeWidth="1.2" d="M-6 -6 l1.5 -1 M0 -8 l1.5 -1 M6 -6 l1.5 -1" />
        </>
      )
    case 'star':
      return <path fill={PALETTE_DOODLES.gold} d="M0 -13 L3.6 -4.4 L13 -4 L5.8 2.2 L8.2 12 L0 6.6 L-8.2 12 L-5.8 2.2 L-13 -4 L-3.6 -4.4 Z" />
    case 'heart':
      return <path fill={PALETTE_DOODLES.heart} d="M0 11 C-6 6 -13 1 -13 -5 C-13 -10 -8 -13 -4 -11 C-2 -10 -1 -8 0 -6 C1 -8 2 -10 4 -11 C8 -13 13 -10 13 -5 C13 1 6 6 0 11 Z" />
    case 'bolt':
      return <path fill={PALETTE_DOODLES.gold} d="M3 -14 L-8 2 L-1 2 L-4 14 L8 -3 L1 -3 Z" />
    case 'sparkle':
      return <path fill="#8fdcff" d="M0 -13 C1 -4 4 -1 13 0 C4 1 1 4 0 13 C-1 4 -4 1 -13 0 C-4 -1 -1 -4 0 -13 Z" />
    case 'spiral':
      return <path fill="none" d="M0 0 C2 -2 4 0 3 3 C1 6 -4 5 -5 1 C-6 -4 -1 -8 4 -7 C9 -5 10 2 7 6" />
    case 'plane':
      return (
        <>
          <path className="dcf-paperfill" d="M-13 -1 L13 -10 L4 12 L0 3 Z" />
          <path fill="none" d="M0 3 L13 -10 M0 3 L-2 9 L2 5" />
        </>
      )
    default:
      return null
  }
}

function DoodleIcon({ kind, size = 18 }: { kind: string; size?: number }) {
  return (
    <svg className="dcf-icon" viewBox="-16 -16 32 32" width={size} height={size} aria-hidden="true">
      <DoodleShape kind={kind} />
    </svg>
  )
}

function SquiggleLink({ link, className }: { link: { label: string; href?: string }; className?: string }) {
  if (link.href) {
    return (
      <a className={className} href={link.href}>
        <span>{link.label}</span>
        <svg className="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength={1} d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4" />
        </svg>
      </a>
    )
  }
  return <span className={className}>{link.label}</span>
}

/* -------------------------------------------------------------------------- */
/* Font Advance Measurement                                                   */
/* -------------------------------------------------------------------------- */

const FONT_REFERENCE_SIZE = 200

const estimateFontAdvances = (text: string) => ({
  advances: Array.from(text).map(
    (char) => (char === ' ' ? 0.3 : /[IJ1]/.test(char) ? 0.42 : /[MW]/.test(char) ? 0.98 : 0.76) * FONT_REFERENCE_SIZE,
  ),
  cap: 0.73 * FONT_REFERENCE_SIZE,
})

const measureFontAdvances = (text: string, font: string) => {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.font = `900 ${FONT_REFERENCE_SIZE}px ${font}`
  const chars = Array.from(text)
  const advances: number[] = []
  let prevWidth = 0

  for (let i = 0; i < chars.length; i++) {
    const curWidth = ctx.measureText(chars.slice(0, i + 1).join('')).width
    advances.push(curWidth - prevWidth)
    prevWidth = curWidth
  }

  const metrics = ctx.measureText(text.replace(/\s/g, '') || 'H')
  const cap = metrics.actualBoundingBoxAscent > 0 ? metrics.actualBoundingBoxAscent : 0.73 * FONT_REFERENCE_SIZE
  return { advances, cap }
}

/* -------------------------------------------------------------------------- */
/* Main DoodleCrewFooter Component                                            */
/* -------------------------------------------------------------------------- */

export interface CrewMember {
  kind: 'yeti' | 'kid' | 'bird' | 'cat' | 'ghost' | 'mushroom'
  letter: number
  seat?: 'top' | 'behind' | 'front'
  offset?: number
  scale?: number
  flip?: boolean
  name?: string
  says?: string
}

export interface FooterAction {
  label: string
  href?: string
  icon?: string
  variant?: 'outline' | 'solid'
  onClick?: () => void
}

export interface DoodleCrewFooterProps {
  wordmark?: string
  brand?: string
  blurb?: string
  tagline?: string
  columns?: {
    title: string
    links: { label: string; href?: string }[]
  }[]
  actions?: FooterAction[]
  copyright?: string
  legal?: { label: string; href?: string }[]
  socials?: { label: string; href?: string }[]
  backToTop?: boolean
  crew?: CrewMember[]
  doodles?: string[]
  doodleCount?: number
  preset?: 'auto' | 'paper' | 'night' | 'riso' | 'sunny'
  palette?: Partial<ThemeColors>
  fontFamily?: string
  serifFamily?: string
  tracking?: number
  interactive?: boolean
  height?: string
  className?: string
}

const DEFAULT_CREW: CrewMember[] = [
  { kind: 'yeti', letter: 0, seat: 'front', offset: -0.32, name: 'Bruno', says: 'Need awesome components? We build them.' },
  { kind: 'bird', letter: 1, seat: 'top', offset: 0.02, name: 'Pip', says: 'Say hello to inzeedo.lk!' },
  { kind: 'mushroom', letter: 2, seat: 'front', offset: 0.12, scale: 0.95, name: 'Morel', says: 'Crafted with precision.' },
  { kind: 'kid', letter: 4, seat: 'top', offset: -0.05, name: 'Juno', says: 'Building interfaces that feel magical.' },
  { kind: 'ghost', letter: 5, seat: 'behind', offset: 0, name: 'Boo', says: 'Boo! Inzeedo Studio is here.' },
  { kind: 'cat', letter: 6, seat: 'front', offset: 0.38, flip: true, name: 'Patch', says: 'Creative code & design systems.' },
]

const DEFAULT_COLUMNS = [
  {
    title: 'Platform',
    links: [{ label: 'Design System', href: '#' }, { label: 'Motion Lab', href: '#' }, { label: 'WebGL Shaders', href: '#' }, { label: 'Releases', href: '#' }],
  },
  {
    title: 'Company',
    links: [{ label: 'About Inzeedo', href: '#' }, { label: 'Philosophy', href: '#' }, { label: 'Careers', href: '#' }, { label: 'Colombo HQ', href: '#' }],
  },
  {
    title: 'Resources',
    links: [{ label: 'Component Gallery', href: '#' }, { label: 'Documentation', href: '#' }, { label: 'Showcase', href: '#' }, { label: 'Brand Kit', href: '#' }],
  },
  {
    title: 'Connect',
    links: [{ label: 'hello@inzeedo.lk', href: 'mailto:hello@inzeedo.lk' }, { label: 'Discord', href: '#' }, { label: 'GitHub', href: '#' }, { label: 'X (Twitter)', href: '#' }],
  },
]

const DEFAULT_ACTIONS: FooterAction[] = [
  { label: 'Explore Components', href: '#', icon: 'sandwich', variant: 'outline' },
  { label: 'Work with Inzeedo', href: 'mailto:hello@inzeedo.lk', icon: 'bolt', variant: 'solid' },
]

const DEFAULT_DOODLE_TYPES = ['flame', 'sandwich', 'star', 'flame', 'heart', 'sandwich', 'bolt', 'sparkle']

export default function DoodleCrewFooter({
  wordmark = 'INZEEDO',
  brand = 'inzeedo.',
  blurb = 'We engineer expressive interfaces, high-fidelity design systems, and delightful interactive software.',
  tagline = 'A handcrafted world of fluid motion and playful physics.',
  columns = DEFAULT_COLUMNS,
  actions = DEFAULT_ACTIONS,
  copyright = '© 2026 Inzeedo Studio Ltd. Handcrafted in Colombo with care.',
  legal = [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }, { label: 'Cookies', href: '#' }],
  socials = [{ label: 'GitHub', href: 'https://github.com' }, { label: 'LinkedIn', href: 'https://linkedin.com' }, { label: 'Discord', href: '#' }, { label: 'X', href: 'https://x.com' }],
  backToTop = true,
  crew = DEFAULT_CREW,
  doodles = DEFAULT_DOODLE_TYPES,
  doodleCount = 12,
  preset = 'auto',
  palette,
  fontFamily = '"Arial Black", "Inter Display", Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
  serifFamily = '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif',
  tracking = -0.02,
  interactive = true,
  height = '760px',
  className = '',
}: DoodleCrewFooterProps) {
  const compId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const uppercaseWord = wordmark.toUpperCase()
  const charactersList = useMemo(() => Array.from(uppercaseWord), [uppercaseWord])
  const colors = { ...(DOODLE_PRESETS[preset] || DOODLE_PRESETS.auto), ...(palette || {}) }

  const rootRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const filterTargetsRef = useRef<(SVGGElement | null)[]>([])
  const eyeRefs = useRef<Record<number, { pupil: SVGGElement | null; blink: SVGGElement | null }[]>>({})
  const floaterElsRef = useRef<(HTMLDivElement | null)[]>([])

  const [measuredFont, setMeasuredFont] = useState(() => estimateFontAdvances(uppercaseWord))
  const [isPlaying, setIsPlaying] = useState(false)
  const [prefersReduced, setPrefersReduced] = useState(false)
  const [activeSpeechIdx, setActiveSpeechIdx] = useState(-1)
  const [hopIdx, setHopIdx] = useState(-1)
  const resetSpeechTimerRef = useRef(0)

  // Measure font advances accurately
  useLayoutEffect(() => {
    const updateMetrics = () => {
      const res = measureFontAdvances(uppercaseWord, fontFamily)
      if (res) setMeasuredFont(res)
    }
    updateMetrics()

    if (typeof document !== 'undefined' && document.fonts) {
      let isSubscribed = true
      document.fonts.ready.then(() => isSubscribed && updateMetrics())
      document.fonts.addEventListener('loadingdone', updateMetrics)
      return () => {
        isSubscribed = false
        document.fonts.removeEventListener('loadingdone', updateMetrics)
      }
    }
  }, [uppercaseWord, fontFamily])

  const wordLayout = useMemo(
    () => layoutWord(measuredFont.advances, tracking, FONT_REFERENCE_SIZE),
    [measuredFont, tracking],
  )
  const capHeight = measuredFont.cap

  // Compute placed crew members
  const placedCrew = useMemo(() => {
    return crew
      .map((member, idx) => {
        const art = CHARACTERS[member.kind]
        if (!art || !charactersList.length) return null
        const clampedLetterIdx = clamp(Math.floor(member.letter) || 0, 0, charactersList.length - 1)
        const scale = (capHeight / 144) * art.k * (member.scale ?? 1)
        const seat = member.seat || art.seat
        const pos = seatPoint(
          seat,
          wordLayout.x[clampedLetterIdx],
          wordLayout.w[clampedLetterIdx],
          capHeight,
          member.offset ?? 0,
          scale,
        )
        return {
          idx,
          m: member,
          art,
          seat,
          scale,
          ...pos,
          flip: member.flip ? -1 : 1,
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
  }, [crew, charactersList.length, wordLayout, capHeight])

  // Compute SVG viewBox
  const viewBox = useMemo(() => {
    let minX = 0
    let maxX = wordLayout.width
    let minY = -capHeight
    let maxY = 30

    for (const member of placedCrew) {
      const boxSides = member.flip > 0 ? [member.art.box.l, member.art.box.r] : [-member.art.box.r, -member.art.box.l]
      minX = Math.min(minX, member.x + boxSides[0] * member.scale)
      maxX = Math.max(maxX, member.x + boxSides[1] * member.scale)
      minY = Math.min(minY, member.y + member.art.box.t * member.scale)
      maxY = Math.max(maxY, member.y + member.art.box.b * member.scale)
    }

    const pad = 24
    return {
      x: minX - pad,
      y: minY - pad,
      w: maxX - minX + pad * 2,
      h: maxY - minY + pad * 2,
    }
  }, [wordLayout, placedCrew, capHeight])

  const taglineWords = tagline.split(/\s+/).filter(Boolean)
  const timeline = buildTimeline(charactersList.length, placedCrew.length, taglineWords.length, actions.length)

  // Ground doodles & pebbles
  const groundScene = useMemo(() => {
    const startX = viewBox.x + 6
    const endX = viewBox.x + viewBox.w - 6
    let groundPath = `M${startX.toFixed(1)} 6`
    const segments = 14

    for (let s = 1; s <= segments; s++) {
      const curX = startX + ((endX - startX) * s) / segments
      const prevX = curX - (endX - startX) / segments / 2
      const cpY = 6 + (hash(s * 3.1) - 0.5) * 5
      const endY = 6 + (hash(s * 7.7) - 0.5) * 2
      groundPath += ` Q${prevX.toFixed(1)} ${cpY.toFixed(1)} ${curX.toFixed(1)} ${endY.toFixed(1)}`
    }

    let grassTufts = ''
    for (let g = 0; g < 22; g++) {
      const gx = startX + 20 + hash(g * 11.3) * (endX - startX - 40)
      const scale = 0.7 + hash(g * 5.9) * 0.6
      grassTufts += `M${gx.toFixed(1)} 6 l${(2 * scale).toFixed(1)} ${(-9 * scale).toFixed(1)} M${(gx + 3 * scale).toFixed(1)} 6 l${(1 * scale).toFixed(1)} ${(-12 * scale).toFixed(1)} M${(gx + 6 * scale).toFixed(1)} 6 l${(-1 * scale).toFixed(1)} ${(-7 * scale).toFixed(1)} `
    }

    const pebbles = Array.from({ length: 9 }, (_, pIdx) => ({
      x: startX + 40 + hash(pIdx * 17.1) * (endX - startX - 80),
      y: 14 + hash(pIdx * 2.3) * 8,
      r: 2 + hash(pIdx * 9.4) * 2.6,
    }))

    return { d: groundPath, tufts: grassTufts, pebbles }
  }, [viewBox])

  // Physics floaters init
  const floaterPrototypes = useMemo(() => {
    const list = doodles.length ? doodles : []
    const count = list.length ? clamp(Math.floor(doodleCount) || 0, 0, 40) : 0
    return Array.from({ length: count }, (_, i) => ({
      kind: list[i % list.length],
      size: 22 + hash(i * 4.7) * 14,
      seed: i,
    }))
  }, [doodles, doodleCount])

  // Simulation engine state
  const simRef = useRef({
    floaters: [] as Floater[],
    w: 0,
    h: 0,
    px: NaN,
    py: NaN,
    inside: false,
    visible: false,
    gaze: [] as {
      x: number
      y: number
      tx: number
      ty: number
      next: number
      blinkAt: number
      blink: number
      [key: string]: unknown
    }[],
    seed: 1,
    start: 0,
  })

  const paintDoodles = () => {
    const sim = simRef.current
    const responsiveScale = clamp(sim.w / 1100, 0.5, 1)

    for (let i = 0; i < sim.floaters.length; i++) {
      const el = floaterElsRef.current[i]
      const f = sim.floaters[i]
      if (!el || !f) continue

      let scale = responsiveScale
      let opacity = 1

      if (f.pop > 0) {
        const popProgress = 1.4 - f.pop
        scale = responsiveScale * (1 + Math.min(1, popProgress / 0.3) * 0.7)
        opacity = Math.max(0, 1 - popProgress / 0.3)
      }

      el.style.transform = `translate3d(${f.x.toFixed(1)}px, ${f.y.toFixed(1)}px, 0) rotate(${f.rot.toFixed(1)}deg) scale(${scale.toFixed(3)})`
      el.style.opacity = String(opacity)
    }
  }

  // ResizeObserver for floaters world bounds
  useLayoutEffect(() => {
    const el = worldRef.current
    if (!el) return
    const sim = simRef.current

    const updateSize = () => {
      const rect = el.getBoundingClientRect()
      const prevW = sim.w
      const prevH = sim.h
      sim.w = rect.width
      sim.h = rect.height

      if (sim.floaters.length !== floaterPrototypes.length || !prevW) {
        sim.floaters = floaterPrototypes.map((proto, idx) => ({
          kind: proto.kind,
          x: (0.04 + (0.92 * (idx + hash(idx * 9.1) * 0.8)) / Math.max(1, floaterPrototypes.length)) * rect.width,
          y: (0.02 + hash(idx * 3.3) * 0.56) * rect.height,
          vx: 0,
          vy: 0,
          rot: (hash(idx * 1.7) - 0.5) * 50,
          vr: (hash(idx * 6.1) - 0.5) * 30,
          fall: 9 + hash(idx * 2.9) * 16,
          phase: hash(idx * 8.3) * Math.PI * 2,
          pop: 0,
        }))
      } else if (prevW && prevH) {
        for (const f of sim.floaters) {
          f.x *= rect.width / prevW
          f.y *= rect.height / prevH
        }
      }
      paintDoodles()
    }

    updateSize()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(updateSize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [floaterPrototypes])

  // Reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setPrefersReduced(mq.matches)
    updateMotion()
    mq.addEventListener('change', updateMotion)
    return () => mq.removeEventListener('change', updateMotion)
  }, [])

  // IntersectionObserver to start animations
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const sim = simRef.current

    if (typeof IntersectionObserver === 'undefined') {
      sim.visible = true
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          sim.visible = entry.isIntersecting
          if (entry.isIntersecting && entry.intersectionRatio > 0.12) {
            setIsPlaying(true)
          }
        }
      },
      { threshold: [0, 0.12, 0.3] },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isPlaying && !simRef.current.start) {
      simRef.current.start = performance.now()
    }
  }, [isPlaying])

  // Master physics & procedural gaze/boil animation loop
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sim = simRef.current
    let rafId = 0
    let lastTime = performance.now()
    let lastBoilTime = 0
    let boilFrame = 0

    const randomVal = () => {
      sim.seed = (sim.seed * 16807) % 2147483647
      return sim.seed / 2147483647
    }

    const getSvgCoords = (svgEl: SVGSVGElement, screenX: number, screenY: number) => {
      const ctm = svgEl.getScreenCTM()
      if (!ctm) return null
      const inv = ctm.inverse()
      return {
        x: inv.a * screenX + inv.c * screenY + inv.e,
        y: inv.b * screenX + inv.d * screenY + inv.f,
      }
    }

    const onFrame = (now: number) => {
      rafId = requestAnimationFrame(onFrame)
      if (!sim.visible || document.hidden) {
        lastTime = now
        return
      }

      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now
      const timeSec = now / 1000

      const svgEl = svgRef.current
      const worldEl = worldRef.current
      let mouseSvgPos: { x: number; y: number } | null = null

      if (svgEl && sim.inside && interactive) {
        mouseSvgPos = getSvgCoords(svgEl, sim.px, sim.py)
      }

      // Procedural character gaze tracking
      for (let i = 0; i < placedCrew.length; i++) {
        const member = placedCrew[i]
        const gaze =
          sim.gaze[i] ||
          (sim.gaze[i] = {
            x: 0,
            y: 0,
            tx: 0,
            ty: 0,
            next: 0,
            blinkAt: timeSec + 1 + hash(i * 3.7) * 3,
            blink: 0,
          })

        if (!mouseSvgPos && timeSec > gaze.next) {
          const peer = placedCrew[(i + 1 + Math.floor(randomVal() * Math.max(1, placedCrew.length - 1))) % placedCrew.length]
          if (peer && randomVal() < 0.45) {
            gaze.tx = peer.x
            gaze.ty = peer.y - 60 * peer.scale
          } else {
            gaze.tx = member.x + (randomVal() - 0.5) * 900
            gaze.ty = member.y - 80 * member.scale + (randomVal() - 0.5) * 500
          }
          gaze.next = timeSec + 1.4 + randomVal() * 2.6
        }

        if (timeSec > gaze.blinkAt) {
          gaze.blink = 0.16
          gaze.blinkAt = timeSec + 2.2 + randomVal() * 4
        }
        gaze.blink = Math.max(0, gaze.blink - dt)

        const eyeScaleY = gaze.blink > 0 ? 0.12 + (Math.abs(gaze.blink - 0.08) / 0.08) * 0.88 : 1
        const charEyes = eyeRefs.current[i] || []

        for (let eIdx = 0; eIdx < member.art.eyes.length; eIdx++) {
          const eyeDef = member.art.eyes[eIdx]
          const eyeWorldX = member.x + eyeDef.x * member.scale * member.flip
          const eyeWorldY = member.y + eyeDef.y * member.scale
          const targetX = mouseSvgPos ? mouseSvgPos.x : gaze.tx
          const targetY = mouseSvgPos ? mouseSvgPos.y : gaze.ty

          const lookOffset = lookAt(eyeWorldX, eyeWorldY, targetX, targetY, eyeDef.max, 220)
          const domEye = charEyes[eIdx]
          if (!domEye) continue

          const offsetKey = `_offset_${eIdx}`
          const curOffset = (gaze[offsetKey] as { x: number; y: number }) || { x: 0, y: 0 }
          const lerpFactor = Math.min(1, dt * (mouseSvgPos ? 14 : 6))
          const nextX = curOffset.x + (lookOffset.x * member.flip - curOffset.x) * lerpFactor
          const nextY = curOffset.y + (lookOffset.y - curOffset.y) * lerpFactor
          gaze[offsetKey] = { x: nextX, y: nextY }

          domEye.pupil?.setAttribute('transform', `translate(${nextX.toFixed(2)} ${nextY.toFixed(2)})`)
          domEye.blink?.setAttribute(
            'transform',
            `translate(0 ${(eyeDef.y * (1 - eyeScaleY)).toFixed(2)}) scale(1 ${eyeScaleY.toFixed(3)})`,
          )
        }
      }

      // Physics floater particles step
      if (
        worldEl &&
        sim.floaters.length &&
        (isPlaying && sim.start ? now - sim.start > timeline.doodles || prefersReduced : false)
      ) {
        const wRect = worldEl.getBoundingClientRect()
        const relativeMouseX = sim.inside && interactive ? sim.px - wRect.left : NaN
        const relativeMouseY = sim.inside && interactive ? sim.py - wRect.top : NaN

        if (!prefersReduced) {
          for (const floater of sim.floaters) {
            stepFloater(floater, dt, timeSec, sim.w, sim.h, relativeMouseX, relativeMouseY, 110, randomVal)
          }
        }
        paintDoodles()
      }

      // Procedural line boiling jitter
      if (!prefersReduced && now - lastBoilTime > 125) {
        lastBoilTime = now
        boilFrame = (boilFrame + 1) % 3
        const filterStr = `url(#${compId}-boil${boilFrame})`
        for (const target of filterTargetsRef.current) {
          target?.setAttribute('filter', filterStr)
        }
      }
    }

    rafId = requestAnimationFrame(onFrame)
    return () => cancelAnimationFrame(rafId)
  }, [placedCrew, isPlaying, prefersReduced, interactive, compId, timeline.doodles])

  useEffect(() => {
    return () => window.clearTimeout(resetSpeechTimerRef.current)
  }, [])

  const handlePointerMove = (e: React.PointerEvent) => {
    const sim = simRef.current
    sim.px = e.clientX
    sim.py = e.clientY
    sim.inside = true
  }

  const handlePointerLeave = () => {
    simRef.current.inside = false
  }

  const pokeCharacter = (charIdx: number) => {
    if (!interactive) return
    setActiveSpeechIdx(charIdx)
    setHopIdx(-1)
    requestAnimationFrame(() => setHopIdx(charIdx))
    window.clearTimeout(resetSpeechTimerRef.current)
    resetSpeechTimerRef.current = window.setTimeout(() => {
      setActiveSpeechIdx(-1)
      setHopIdx(-1)
    }, 2600)
  }

  const popFloater = (idx: number) => {
    if (!interactive) return
    const floater = simRef.current.floaters[idx]
    if (floater && floater.pop <= 0) {
      floater.pop = 1.4
      paintDoodles()
    }
  }

  const scrollToTop = () => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
  }

  const hatchPatternUrl = `url(#${compId}-hatch)`
  const rootStyle: CSSProperties = {
    ['--dcf-bg' as string]: colors.background,
    ['--dcf-ink' as string]: colors.ink,
    ['--dcf-accent' as string]: colors.accent,
    ['--dcf-serif' as string]: serifFamily,
    ['--dcf-display' as string]: fontFamily,
    minHeight: height,
  }

  const calcPercent = (val: number, min: number, totalSpan: number): string =>
    `${(((val - min) / totalSpan) * 100).toFixed(3)}%`

  // Render individual character SVG group
  const renderCrewMemberGroup = (member: (typeof placedCrew)[0], partType: 'body' | 'front') => {
    return (
      <g
        key={`${member.idx}-${partType}`}
        transform={`translate(${member.x.toFixed(2)} ${member.y.toFixed(2)}) scale(${(member.scale * member.flip).toFixed(4)} ${member.scale.toFixed(4)})`}
      >
        <g className={`dcf-arrive dcf-arrive-${member.seat}`} style={{ ['--d' as string]: `${timeline.member(member.idx)}ms` }}>
          <g className={`dcf-hopper${hopIdx === member.idx ? ' is-hop' : ''}`}>
            <g
              className={`dcf-art${member.art.idle ? ` ${member.art.idle}` : ''}`}
              style={{ ['--i' as string]: member.idx }}
            >
              {partType === 'body' ? (
                <>
                  {member.art.body(hatchPatternUrl)}
                  {member.art.eyes.map((eye, eyeIdx) => (
                    <g
                      key={eyeIdx}
                      ref={(el) => {
                        if (!eyeRefs.current[member.idx]) eyeRefs.current[member.idx] = []
                        eyeRefs.current[member.idx][eyeIdx] = {
                          ...(eyeRefs.current[member.idx][eyeIdx] || { pupil: null }),
                          blink: el,
                        }
                      }}
                    >
                      {eye.r > 0 && <circle cx={eye.x} cy={eye.y} r={eye.r} />}
                      <g
                        ref={(el) => {
                          if (!eyeRefs.current[member.idx]) eyeRefs.current[member.idx] = []
                          eyeRefs.current[member.idx][eyeIdx] = {
                            ...(eyeRefs.current[member.idx][eyeIdx] || { blink: null }),
                            pupil: el,
                          }
                        }}
                      >
                        <circle className="k" cx={eye.x} cy={eye.y} r={eye.pupil} />
                        <circle
                          className="dcf-glint"
                          cx={eye.x + eye.pupil * 0.35}
                          cy={eye.y - eye.pupil * 0.4}
                          r={eye.pupil * 0.32}
                        />
                      </g>
                    </g>
                  ))}
                </>
              ) : (
                member.art.front?.()
              )}
            </g>
          </g>
        </g>
      </g>
    )
  }

  return (
    <footer
      ref={rootRef}
      className={`dcf${className ? ` ${className}` : ''}`}
      data-play={isPlaying || prefersReduced ? '1' : '0'}
      data-interactive={interactive ? '1' : '0'}
      style={rootStyle}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Top Header Row: Brand Logo, Blurb & Nav Columns */}
      <div className="dcf-top dcf-rise" style={{ ['--d' as string]: '0ms' }}>
        <div className="dcf-brand">
          <span className="dcf-logo" aria-hidden="true">
            <svg viewBox="-60 -150 120 120" width="30" height="30">
              <g className="dcf-art">
                <path d="M-30 -104 C-40 -112 -44 -124 -40 -138 C-32 -129 -22 -122 -13 -114 Z" />
                <path d="M18 -114 C26 -124 36 -130 47 -133 C45 -120 41 -110 32 -101 Z" />
                <path d="M-44 -30 C-54 -56 -54 -70 -42 -90 C-32 -110 -14 -118 2 -118 C22 -118 40 -108 48 -88 C58 -68 56 -54 48 -30 Z" />
                <circle className="k" cx="-15" cy="-84" r="5.5" />
                <circle className="k" cx="13" cy="-86" r="5.5" />
                <path className="n" d="M-12 -66 C-6 -60 6 -60 12 -67" />
              </g>
            </svg>
          </span>
          <span className="dcf-brandname">{brand}</span>
        </div>

        {blurb && <p className="dcf-blurb">{blurb}</p>}

        {columns.length > 0 && (
          <nav className="dcf-cols" aria-label="Footer Navigation">
            {columns.map((col) => (
              <div key={col.title} className="dcf-col">
                <h3 className="dcf-coltitle">{col.title}</h3>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <SquiggleLink link={link} className="dcf-link" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}
      </div>

      {/* Main Handcrafted Character World */}
      <div className="dcf-world" ref={worldRef}>
        <div className="dcf-stage">
          <h2 className="dcf-sr">{wordmark}</h2>
          <svg
            ref={svgRef}
            className="dcf-svg"
            viewBox={`${viewBox.x.toFixed(1)} ${viewBox.y.toFixed(1)} ${viewBox.w.toFixed(1)} ${viewBox.h.toFixed(1)}`}
            aria-hidden="false"
            role="group"
            aria-label={`${wordmark} — meet the Inzeedo crew`}
          >
            <defs>
              {/* Slanted Ink Hatch Pattern */}
              <pattern id={`${compId}-hatch`} width="4.6" height="4.6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
                <line x1="0" y1="0" x2="0" y2="4.6" style={{ stroke: 'var(--dcf-ink)' }} strokeWidth="1.25" />
              </pattern>

              {/* 3-Phase Line Boiling Filter */}
              {[0, 1, 2].map((step) => (
                <filter key={step} id={`${compId}-boil${step}`} x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={step * 7 + 3} result="n" />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              ))}

              {/* Textured Ink Edge Filter */}
              <filter id={`${compId}-ink`} x="-4%" y="-6%" width="108%" height="112%">
                <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="11" result="edge" />
                <feDisplacementMap in="SourceGraphic" in2="edge" scale="5" xChannelSelector="R" yChannelSelector="G" result="rough" />
                <feTurbulence type="fractalNoise" baseFrequency="0.018 0.32" numOctaves="2" seed="4" result="streak" />
                <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -16 5.6" result="streakA" />
                <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed="9" result="speck" />
                <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -24 7.0" result="speckA" />
                <feComposite in="streakA" in2="speckA" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="holes" />
                <feComposite in="rough" in2="holes" operator="out" />
              </filter>
            </defs>

            {/* Behind Layer: Ground line, grass tufts, pebbles, behind characters */}
            <g
              ref={(el) => {
                filterTargetsRef.current[0] = el
              }}
            >
              <g className="dcf-ground">
                <path className="dcf-draw" pathLength={1} d={groundScene.d} style={{ ['--d' as string]: `${timeline.ground}ms` }} />
                <path className="dcf-tufts dcf-fade" d={groundScene.tufts} style={{ ['--d' as string]: `${timeline.ground + 500}ms` }} />
                {groundScene.pebbles.map((peb, pIdx) => (
                  <ellipse
                    key={pIdx}
                    className="dcf-pebble dcf-fade"
                    cx={peb.x}
                    cy={peb.y}
                    rx={peb.r * 1.5}
                    ry={peb.r}
                    style={{ ['--d' as string]: `${timeline.ground + 600}ms` }}
                  />
                ))}
              </g>
              {placedCrew.filter((c) => c.seat === 'behind').map((c) => renderCrewMemberGroup(c, 'body'))}
            </g>

            {/* Wordmark Letters Layer */}
            {charactersList.map((char, cIdx) =>
              char === ' ' ? null : (
                <g
                  key={cIdx}
                  className="dcf-letter"
                  style={{
                    ['--d' as string]: `${timeline.letter(cIdx)}ms`,
                    ['--r' as string]: `${((hash(cIdx * 2.3) - 0.5) * 9).toFixed(2)}deg`,
                  }}
                >
                  <g className="dcf-glyph">
                    <text
                      x={wordLayout.x[cIdx]}
                      y={0}
                      fontSize={FONT_REFERENCE_SIZE}
                      fontWeight={900}
                      style={{ fontFamily }}
                      filter={`url(#${compId}-ink)`}
                    >
                      {char}
                    </text>
                  </g>
                  {/* Dust particles upon letter drop */}
                  <path
                    className="dcf-dust"
                    d={`M${wordLayout.x[cIdx] - 6} -6 l-16 -6 M${wordLayout.x[cIdx] - 4} -16 l-12 -12 M${wordLayout.x[cIdx] + wordLayout.w[cIdx] + 6} -6 l16 -6 M${wordLayout.x[cIdx] + wordLayout.w[cIdx] + 4} -16 l12 -12`}
                  />
                </g>
              ),
            )}

            {/* Foreground Crew Layer */}
            <g
              ref={(el) => {
                filterTargetsRef.current[1] = el
              }}
            >
              {placedCrew.filter((c) => c.seat === 'behind').map((c) => renderCrewMemberGroup(c, 'front'))}
              {placedCrew.filter((c) => c.seat !== 'behind').map((c) => renderCrewMemberGroup(c, 'body'))}
            </g>

            {/* Interactive Hit Rectangles to poke characters */}
            {interactive &&
              placedCrew.map((member) => {
                const boxSides =
                  member.flip > 0
                    ? [member.art.box.l, member.art.box.r]
                    : [-member.art.box.r, -member.art.box.l]
                const topY = member.art.box.t
                const bottomY = member.seat === 'behind' ? -30 : member.art.box.b

                return (
                  <rect
                    key={`hit-${member.idx}`}
                    className="dcf-hit"
                    x={member.x + boxSides[0] * member.scale}
                    y={member.y + topY * member.scale}
                    width={(boxSides[1] - boxSides[0]) * member.scale}
                    height={(bottomY - topY) * member.scale}
                    rx={12}
                    role="button"
                    tabIndex={0}
                    aria-label={`${member.m.name || member.m.kind}${member.m.says ? `: ${member.m.says}` : ''}`}
                    onClick={() => pokeCharacter(member.idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        pokeCharacter(member.idx)
                      }
                    }}
                  />
                )
              })}
          </svg>

          {/* Interactive Speech Bubbles */}
          <div className="dcf-bubbles" aria-live="polite">
            {placedCrew.map((member) =>
              activeSpeechIdx === member.idx && member.m.says ? (
                <div
                  key={`bubble-${member.idx}`}
                  className={`dcf-bubble${member.x > viewBox.x + viewBox.w * 0.72 ? ' is-left' : ''}`}
                  style={{
                    left: calcPercent(member.x, viewBox.x, viewBox.w),
                    top: calcPercent(member.y + member.art.box.t * member.scale - 6, viewBox.y, viewBox.h),
                  }}
                >
                  {member.m.says}
                </div>
              ) : null,
            )}
          </div>
        </div>

        {/* Floating Physics Doodles */}
        {floaterPrototypes.length > 0 && (
          <div className="dcf-doodles" aria-hidden="true">
            {floaterPrototypes.map((proto, idx) => (
              <div
                key={idx}
                className="dcf-doodle"
                ref={(el) => {
                  floaterElsRef.current[idx] = el
                }}
                style={{
                  width: proto.size,
                  height: proto.size,
                  marginLeft: -proto.size / 2,
                  marginTop: -proto.size / 2,
                }}
                onPointerDown={() => popFloater(idx)}
              >
                <span className="dcf-doodle-in" style={{ ['--d' as string]: `${timeline.doodles + idx * 70}ms` }}>
                  <svg viewBox="-16 -16 32 32" width={proto.size} height={proto.size}>
                    <DoodleShape kind={proto.kind} />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CTA Tagline & Action Buttons */}
        <div className="dcf-cta">
          <p className="dcf-tagline">
            {taglineWords.map((word, wIdx) => (
              <span key={wIdx} className="dcf-word" style={{ ['--d' as string]: `${timeline.word(wIdx)}ms` }}>
                {word}{' '}
              </span>
            ))}
          </p>

          {actions.length > 0 && (
            <div className="dcf-actions">
              {actions.map((act, aIdx) => {
                const btnContent = (
                  <>
                    {act.icon && <DoodleIcon kind={act.icon} />}
                    <span>{act.label}</span>
                  </>
                )
                const btnClasses = `dcf-btn dcf-pop ${act.variant === 'outline' ? 'is-outline' : 'is-solid'}`
                const delayStyle = { ['--d' as string]: `${timeline.action(aIdx)}ms` }

                return act.href ? (
                  <a key={act.label} className={btnClasses} style={delayStyle} href={act.href} onClick={act.onClick}>
                    {btnContent}
                  </a>
                ) : (
                  <button key={act.label} type="button" className={btnClasses} style={delayStyle} onClick={act.onClick}>
                    {btnContent}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Legal, Social Links & Back To Top Bar */}
      <div className="dcf-bar dcf-rise" style={{ ['--d' as string]: '120ms' }}>
        <p className="dcf-copy">{copyright}</p>

        {legal.length > 0 && (
          <ul className="dcf-inline">
            {legal.map((item) => (
              <li key={item.label}>
                <SquiggleLink link={item} className="dcf-link" />
              </li>
            ))}
          </ul>
        )}

        {socials.length > 0 && (
          <ul className="dcf-inline dcf-socials">
            {socials.map((item) => (
              <li key={item.label}>
                <SquiggleLink link={item} className="dcf-link" />
              </li>
            ))}
          </ul>
        )}

        {backToTop && (
          <button type="button" className="dcf-totop" onClick={scrollToTop}>
            <span>Back to top</span>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M12 20 C11 14 12.5 9 12 4 M6 10 C8 8 10 6 12 4 C14 6 16 8 18.5 9.5" />
            </svg>
          </button>
        )}
      </div>
    </footer>
  )
}
