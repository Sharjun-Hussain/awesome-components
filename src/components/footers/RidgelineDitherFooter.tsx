import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import './RidgelineDitherFooter.exact.css'

export const meta = {
  title: 'Inzeedo Ridgeline Dither Footer',
  description:
    'Atmospheric dithered topography footer with layered mountain ridgelines, real-time procedural Bayer dithering, moving mist, elevation probe altimeter, and Inzeedo branding.',
  category: 'footers',
  fullWidth: true,
  thumbnail: true,
}

/* -------------------------------------------------------------------------- */
/* Color Presets & Topography Palettes                                        */
/* -------------------------------------------------------------------------- */

export interface PresetTheme {
  paper: string
  ink: string
  muted: string
  line: string
  heart: string
  tones: string[]
}

export const RIDGELINE_PRESETS: Record<string, PresetTheme> = {
  evergreen: {
    paper: '#f3f8f5',
    ink: '#14211a',
    muted: '#67776e',
    line: '#dce8e1',
    heart: '#e5484d',
    tones: ['#f3f8f5', '#d4ecdf', '#a5d7bb', '#69b38a', '#2e7c52', '#145131', '#0a2d1a'],
  },
  glacier: {
    paper: '#f2f6fa',
    ink: '#121b26',
    muted: '#637184',
    line: '#dae3ed',
    heart: '#e5484d',
    tones: ['#f2f6fa', '#d6e6f4', '#a8cae7', '#6b9ecc', '#34679a', '#1a3e66', '#0b2140'],
  },
  dusk: {
    paper: '#f8f4f7',
    ink: '#21151f',
    muted: '#7a6876',
    line: '#ecdfe8',
    heart: '#e5484d',
    tones: ['#f8f4f7', '#efdbe7', '#d9b2cb', '#b1789f', '#7a4975', '#4a2750', '#25102c'],
  },
  sepia: {
    paper: '#f7f2ea',
    ink: '#231a10',
    muted: '#7b6d5c',
    line: '#e9dfcf',
    heart: '#d6452f',
    tones: ['#f7f2ea', '#efdfc6', '#ddbb8d', '#bb8a55', '#8a5a2e', '#5a3518', '#2f1a0b'],
  },
  night: {
    paper: '#08100c',
    ink: '#e2eee7',
    muted: '#7d9286',
    line: '#18271f',
    heart: '#ff6369',
    tones: ['#08100c', '#0c1c14', '#123224', '#1a4b33', '#256a48', '#3a8c63', '#62b388'],
  },
}

/* -------------------------------------------------------------------------- */
/* Procedural Math, Hash, Perlin Noise & Bayer Matrix 8x8                     */
/* -------------------------------------------------------------------------- */

function parseHex(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || '').trim())
  if (!match) return null
  const full = match[1].length === 3 ? match[1].split('').map((c) => c + c).join('') : match[1]
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)]
}

function packRgba(rgb: [number, number, number]): number {
  return ((255 << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0
}

// 8x8 Bayer threshold matrix for ordered dithering
const BAYER_8X8 = [
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64)

function applyDither(val: number, steps: number, threshold: number): number {
  const clamped = val < 0 ? 0 : val > 1 ? 1 : val
  const idx = Math.floor(clamped * (steps - 1) + threshold)
  return idx > steps - 1 ? steps - 1 : idx
}

function hashCoords(x: number, y: number, seed: number): number {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

function valueNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const n00 = hashCoords(xi, yi, seed)
  const n10 = hashCoords(xi + 1, yi, seed)
  const n01 = hashCoords(xi, yi + 1, seed)
  const n11 = hashCoords(xi + 1, yi + 1, seed)
  return n00 + (n10 - n00) * u + (n01 - n00) * v + (n00 - n10 - n01 + n11) * u * v
}

function fbmNoise(x: number, y: number, seed: number, octaves: number): number {
  let total = 0
  let amp = 0.5
  let maxAmp = 0
  let curX = x
  let curY = y
  for (let i = 0; i < octaves; i++) {
    total += valueNoise(curX, curY, seed + i * 31) * amp
    maxAmp += amp
    curX *= 2.03
    curY *= 2.03
    amp *= 0.5
  }
  return maxAmp > 0 ? total / maxAmp : 0
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = edge1 === edge0 ? (x < edge0 ? 0 : 1) : Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function easeOutCubic(t: number): number {
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t
  return 1 - Math.pow(1 - clamped, 3)
}

function generateRidgeline(
  width: number,
  height: number,
  ridgeIdx: number,
  totalRidges: number,
  seed: number,
  pad: number,
): Float32Array {
  const normIdx = totalRidges > 1 ? ridgeIdx / (totalRidges - 1) : 1
  const totalPoints = width + pad * 2
  const points = new Float32Array(totalPoints)
  const baseElevation = height * (0.38 + 0.66 * Math.pow(normIdx, 1.4))
  const amplitude = height * (0.2 + 0.24 * normIdx)
  const freqScale = 6 - 3.8 * normIdx
  const valleyFalloffL = height * 0.5 * Math.pow(normIdx, 3) * (0.55 + 0.6 * hashCoords(ridgeIdx, 11, seed))
  const valleyFalloffR = height * 0.5 * Math.pow(normIdx, 3) * (0.55 + 0.6 * hashCoords(ridgeIdx, 13, seed))
  const floorThreshold = height * 0.17
  const ridgeTilt = (hashCoords(ridgeIdx, 7, seed) - 0.5) * height * 0.34 * (0.4 + normIdx)
  const ridgeSeed = (seed | 0) * 13 + ridgeIdx * 101

  for (let i = 0; i < totalPoints; i++) {
    const nx = (i - pad) / width
    const n1 = 1 - Math.abs(valueNoise(nx * freqScale + ridgeIdx * 3.7, 0.5, ridgeSeed) * 2 - 1)
    const n2 = 1 - Math.abs(valueNoise(nx * freqScale * 2.3, 3.5, ridgeSeed + 1) * 2 - 1)
    const n3 = fbmNoise(nx * freqScale * 4.1, 9.5, ridgeSeed + 2, 3)
    const jagged = n1 * n1 * 0.62 + n2 * 0.24 + n3 * 0.14
    const edgeDist = Math.min(1.2, Math.abs(nx * 2 - 1))
    const valley = (nx < 0.5 ? valleyFalloffL : valleyFalloffR) * edgeDist * edgeDist * Math.sqrt(edgeDist)
    let y = baseElevation - jagged * amplitude + ridgeTilt * (nx - 0.5) * 2 - valley

    if (y < floorThreshold) {
      y = floorThreshold - (floorThreshold - y) * 0.25
    }
    points[i] = y
  }
  return points
}

function calculateAltitudeMeters(y: number, height: number, ridgeIdx: number, totalRidges: number): number {
  const normY = height > 0 ? 1 - Math.min(1, Math.max(0, y / height)) : 0
  return Math.round(420 + normY * 2600 + (totalRidges - 1 - ridgeIdx) * 140)
}

/* -------------------------------------------------------------------------- */
/* Subcomponents: Mountain Mark Svg & Social Media Icons                      */
/* -------------------------------------------------------------------------- */

function MountainMarkSvg() {
  return (
    <svg className="rdf-mark" viewBox="0 0 30 21" aria-hidden="true">
      <path fill="currentColor" d="M0 21 L10.5 3 L16 12.2 L20.5 6.5 L30 21 Z" />
      <rect className="rdf-mist-a" x="-2" y="12.6" width="19" height="1.7" />
      <rect className="rdf-mist-b" x="13" y="16.4" width="19" height="1.7" />
    </svg>
  )
}

function SocialIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="3" y="9" width="3.6" height="12" />
          <circle cx="4.8" cy="4.8" r="2.1" />
          <path d="M10 9h3.4v1.7c.6-1 1.9-2 3.9-2 3.3 0 4.3 2.1 4.3 5.3V21h-3.6v-6.2c0-1.5-.3-2.9-2.1-2.9s-2.3 1.3-2.3 2.8V21H10z" />
        </svg>
      )
    case 'github':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.4 9.4 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.1 10.1 0 0 0 22 12.23C22 6.58 17.52 2 12 2z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.9C18.2 4.9 12 4.9 12 4.9s-6.2 0-7.8.4a2.6 2.6 0 0 0-1.8 1.9C2 8.8 2 12 2 12s0 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.9c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.9c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15.1V8.9l5.2 3.1L10 15.1z" />
        </svg>
      )
    case 'x':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.75 3h3.07l-6.71 7.67L22 21h-6.18l-4.84-6.33L5.44 21H2.37l7.18-8.2L2 3h6.33l4.37 5.78L17.75 3zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2z" />
        </svg>
      )
  }
}

/* -------------------------------------------------------------------------- */
/* Main RidgelineDitherFooter Component                                       */
/* -------------------------------------------------------------------------- */

export interface FooterSocialItem {
  icon: string
  href?: string
  label?: string
}

export interface FooterLinkItem {
  label: string
  href?: string
  badge?: string
}

export interface FooterNavColumn {
  title: string
  links: FooterLinkItem[]
}

export interface RidgelineDitherFooterProps {
  name?: string
  brandHref?: string
  logo?: ReactNode
  tagline?: string
  columns?: FooterNavColumn[]
  socials?: FooterSocialItem[]
  copyright?: string
  credit?: {
    label: string
    href?: string
  }
  preset?: 'evergreen' | 'glacier' | 'dusk' | 'sepia' | 'night' | 'auto'
  palette?: Partial<PresetTheme>
  seed?: number
  ridges?: number
  pixel?: number
  mist?: number
  drift?: number
  radius?: number
  interactive?: boolean
  altimeter?: boolean
  maxWidth?: string
  fontFamily?: string
  monoFamily?: string
  height?: string
  sceneMinHeight?: string
  className?: string
}

const DEFAULT_COLUMNS: FooterNavColumn[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Cloud Architecture' },
      { label: 'Creative Engineering', badge: 'New' },
      { label: 'Design Systems' },
      { label: 'Security & Edge' },
    ],
  },
  {
    title: 'Studio',
    links: [{ label: 'About Inzeedo' }, { label: 'Careers', badge: 'Hiring' }, { label: 'Colombo HQ' }],
  },
  {
    title: 'Legal',
    links: [{ label: 'Privacy Policy' }, { label: 'Terms of Service' }, { label: 'Compliance' }],
  },
]

const DEFAULT_SOCIALS: FooterSocialItem[] = [
  { icon: 'x', href: 'https://x.com' },
  { icon: 'instagram', href: 'https://instagram.com' },
  { icon: 'linkedin', href: 'https://linkedin.com' },
  { icon: 'github', href: 'https://github.com' },
]

export default function RidgelineDitherFooter({
  name = 'Inzeedo',
  brandHref = 'https://inzeedo.lk',
  logo,
  tagline = 'Expedition-grade digital engineering and high-fidelity interface design crafted for ambitious global brands.',
  columns = DEFAULT_COLUMNS,
  socials = DEFAULT_SOCIALS,
  copyright,
  credit = { label: 'Inzeedo Labs', href: 'https://inzeedo.lk' },
  preset = 'glacier',
  palette,
  seed = 23,
  ridges = 7,
  pixel = 2,
  mist = 0.8,
  drift = 1,
  radius = 130,
  interactive = true,
  altimeter = true,
  maxWidth = '100%',
  fontFamily = '"Inter", "Inter Variable", "Geist", "Helvetica Neue", Arial, system-ui, sans-serif',
  monoFamily = '"JetBrains Mono", "Geist Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace',
  height = '680px',
  sceneMinHeight = '260px',
  className = '',
}: RidgelineDitherFooterProps) {
  const rootRef = useRef<HTMLElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const altProbeRef = useRef<HTMLDivElement>(null)
  const altTextRef = useRef<HTMLSpanElement>(null)
  const animStartTimeRef = useRef<number | null>(null)

  const [inView, setInView] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Color selection
  const selectedTheme =
    preset === 'auto'
      ? isDark
        ? RIDGELINE_PRESETS.night
        : RIDGELINE_PRESETS.evergreen
      : RIDGELINE_PRESETS[preset] || RIDGELINE_PRESETS.glacier
  const activePalette = { ...selectedTheme, ...(palette || {}) }
  const toneList =
    activePalette.tones && activePalette.tones.length >= 2 ? activePalette.tones : selectedTheme.tones
  const deepTone = toneList[Math.max(1, toneList.length - 2)]
  const accentTone = toneList[Math.max(1, toneList.length - 3)]
  const ridgeCount = Math.max(2, Math.min(9, Math.round(ridges)))

  // Simulation parameters ref
  const paramsRef = useRef({ mist, drift, radius, interactive, altimeter })
  useEffect(() => {
    paramsRef.current = { mist, drift, radius, interactive, altimeter }
  }, [mist, drift, radius, interactive, altimeter])

  // Detect dark mode when preset is auto
  useEffect(() => {
    if (preset !== 'auto') return
    const checkDark = () => {
      const el = rootRef.current
      setIsDark(document.documentElement.classList.contains('dark') || Boolean(el && el.closest('.dark')))
    }
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [preset])

  // IntersectionObserver to trigger entrance choreography
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          if (animStartTimeRef.current === null) {
            animStartTimeRef.current = prefersReducedMotion ? -Infinity : performance.now()
          }
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Master Canvas Rendering Engine: Procedural Ridges, Mist & 8x8 Bayer Dithering
  useEffect(() => {
    const rootEl = rootRef.current
    const sceneEl = sceneRef.current
    const canvasEl = canvasRef.current
    if (!rootEl || !sceneEl || !canvasEl) return

    const ctx = canvasEl.getContext('2d')
    if (!ctx) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const packedTones = new Uint32Array(toneList.map((hex) => packRgba(parseHex(hex) || [128, 128, 128])))
    const numTones = packedTones.length

    let scaleFactor = 2
    let bufWidth = 1
    let bufHeight = 1
    let padOffset = 2
    let imgData: ImageData | null = null
    let pixelBuffer = new Uint32Array(0)
    let baseRidges: Float32Array[] = []
    let ridgeSlopes: Float32Array[] = []
    let curRidgeY = new Float32Array(0)
    let curSlope = new Float32Array(0)
    let curShadow = new Float32Array(0)
    let mistBuffer = new Float32Array(0)
    let mistW = 1
    let mistH = 1
    let minFloorY = 0
    let maxCeilY = 1
    let rafId = 0
    let isIntersecting = true
    let needsDraw = true
    let lastRenderTime = 0
    let lastFrameTime = performance.now()
    let mouseTargetX = 0
    let mouseTargetY = 0
    let mouseCurX = 0
    let mouseCurY = 0
    let isMouseInside = false
    let mouseFactor = 0
    let horizontalPan = 0
    let smoothPan = 0
    let impulseSpeed = 0
    let impulseOffset = 0
    let altimeterVisible = false
    let cachedAltStr = ''

    const updateLayout = () => {
      const rect = sceneEl.getBoundingClientRect()
      scaleFactor = Math.max(1, Math.round(pixel))
      bufWidth = Math.max(8, Math.ceil(rect.width / scaleFactor))
      bufHeight = Math.max(8, Math.ceil(rect.height / scaleFactor))
      canvasEl.width = bufWidth
      canvasEl.height = bufHeight
      canvasEl.style.width = `${bufWidth * scaleFactor}px`
      canvasEl.style.height = `${bufHeight * scaleFactor}px`

      imgData = ctx.createImageData(bufWidth, bufHeight)
      pixelBuffer = new Uint32Array(imgData.data.buffer)
      padOffset = Math.ceil(bufWidth * 0.045) + 3
      minFloorY = Math.max(bufHeight * 0.17, 92 / scaleFactor)
      maxCeilY = Math.max(bufHeight * 0.3, 128 / scaleFactor)

      baseRidges = []
      ridgeSlopes = []

      for (let r = 0; r < ridgeCount; r++) {
        const ridge = generateRidgeline(bufWidth, bufHeight, r, ridgeCount, seed, padOffset)
        for (let i = 0; i < ridge.length; i++) {
          if (ridge[i] < minFloorY) {
            ridge[i] = minFloorY - (minFloorY - ridge[i]) * 0.2
          }
        }
        const slopes = new Float32Array(ridge.length)
        for (let i = 0; i < ridge.length; i++) {
          slopes[i] = 0.45 + 1.1 * fbmNoise(((i - padOffset) / bufWidth) * 4, r * 5.3, seed + 9, 2)
        }
        baseRidges.push(ridge)
        ridgeSlopes.push(slopes)
      }

      curRidgeY = new Float32Array(ridgeCount * bufWidth)
      curSlope = new Float32Array(ridgeCount * bufWidth)
      curShadow = new Float32Array(ridgeCount * bufWidth)
      mistW = (bufWidth >> 1) + 2
      mistH = (bufHeight >> 1) + 2
      mistBuffer = new Float32Array(mistW * mistH)
      needsDraw = true
    }

    const render = (time: number) => {
      if (!imgData) return
      const p = paramsRef.current
      const deltaMs = Math.min(64, time - lastFrameTime)
      lastFrameTime = time
      const canInteract = p.interactive && !prefersReduced
      const animElapsed = animStartTimeRef.current === null ? -1 : time - animStartTimeRef.current

      const posDamping = 1 - Math.pow(0.82, deltaMs / 16.7)
      const factorDamping = 1 - Math.pow(0.93, deltaMs / 16.7)

      mouseCurX += (mouseTargetX - mouseCurX) * posDamping
      mouseCurY += (mouseTargetY - mouseCurY) * posDamping
      mouseFactor += ((isMouseInside && p.interactive ? 1 : 0) - mouseFactor) * factorDamping
      smoothPan += ((canInteract ? horizontalPan : 0) - smoothPan) * factorDamping

      impulseSpeed *= Math.pow(0.965, deltaMs / 16.7)
      impulseOffset += (impulseSpeed * deltaMs) / 1000

      const mistDrift = (prefersReduced ? 0 : (time / 1000) * 0.045 * Math.max(0, p.drift)) + impulseOffset
      const mistScaleX = 9 / bufWidth
      const mistScaleY = 4.4 / bufHeight

      for (let y = 0; y < mistH; y++) {
        const ny = y * mistScaleY
        for (let x = 0; x < mistW; x++) {
          const nx = x * mistScaleX + mistDrift
          const warp = valueNoise(nx * 0.45 - mistDrift * 0.6, ny * 0.8, 77) * 0.6
          const mistNoise = fbmNoise(nx + warp, ny + warp * 0.4, 31, 3)
          mistBuffer[y * mistW + x] = smoothstep(0.3, 0.74, mistNoise)
        }
      }

      const ridgeNormY = new Float32Array(ridgeCount)
      const ridgeIntro = new Float32Array(ridgeCount)
      const ridgeDepth = new Float32Array(ridgeCount)
      const ridgeShadowHeight = new Float32Array(ridgeCount)

      for (let r = 0; r < ridgeCount; r++) {
        ridgeNormY[r] = r / (ridgeCount - 1)
        ridgeIntro[r] = animElapsed < 0 ? 0 : easeOutCubic((animElapsed - 380 - r * 170) / 1300)
        ridgeDepth[r] = 0.16 + 0.76 * Math.pow(ridgeNormY[r], 1.6)
        ridgeShadowHeight[r] = bufHeight * (0.08 + 0.42 * ridgeNormY[r])

        const entranceYOffset = (1 - ridgeIntro[r]) * bufHeight * 0.09
        const panJitter = Math.round(smoothPan * (0.25 + ridgeNormY[r]) * 0.75 * (padOffset - 3))
        const ridgePoints = baseRidges[r]
        const maxIdx = ridgePoints.length - 1

        for (let x = 0; x < bufWidth; x++) {
          const sampleIdx = x + padOffset + panJitter
          curRidgeY[r * bufWidth + x] = ridgePoints[sampleIdx] + entranceYOffset
          curSlope[r * bufWidth + x] =
            ridgePoints[Math.min(maxIdx, sampleIdx + 2)] - ridgePoints[Math.max(0, sampleIdx - 2)]
          curShadow[r * bufWidth + x] = ridgeShadowHeight[r] * ridgeSlopes[r][sampleIdx]
        }
      }

      const introFade = animElapsed < 0 ? 1 : 1 - easeOutCubic((animElapsed - 900) / 1800)
      const mistMultiplier = Math.max(0, Math.min(1, p.mist))
      const interactRadius = Math.max(1, p.radius / scaleFactor)
      const radiusSq = interactRadius * interactRadius

      for (let y = 0; y < bufHeight; y++) {
        const vFade = smoothstep(0, maxCeilY, y)
        const mistYIdx = (y >> 1) * mistW
        const bayerYIdx = (y & 7) * 8
        const mouseDeltaY = (y - mouseCurY) * 1.5

        for (let x = 0; x < bufWidth; x++) {
          let visibleRidge = -1
          for (let r = ridgeCount - 1; r >= 0; r--) {
            if (y >= curRidgeY[r * bufWidth + x]) {
              visibleRidge = r
              break
            }
          }

          let toneLevel = 0
          let mistFalloff = 0.3

          if (visibleRidge >= 0) {
            const normR = ridgeNormY[visibleRidge]
            const distFromTop = y - curRidgeY[visibleRidge * bufWidth + x]
            const shadowH = curShadow[visibleRidge * bufWidth + x]
            const shadowGrad = 1 - smoothstep(0, shadowH, distFromTop) * (0.88 - 0.45 * normR)
            toneLevel = ridgeDepth[visibleRidge] * shadowGrad

            const slopeShade = curSlope[visibleRidge * bufWidth + x] * 0.06
            const clampedSlope = slopeShade < -0.2 ? -0.2 : slopeShade > 0.2 ? 0.2 : slopeShade
            toneLevel += clampedSlope * (1 - smoothstep(0, shadowH * 0.5, distFromTop))
            toneLevel +=
              (hashCoords(x + Math.round(curRidgeY[visibleRidge * bufWidth + x] * 7), distFromTop | 0, visibleRidge) -
                0.5) *
              0.07 *
              normR
            toneLevel *= ridgeIntro[visibleRidge]
            mistFalloff = 0.95 - 0.5 * normR
          } else {
            toneLevel = 0.05 * smoothstep(bufHeight * 0.15, bufHeight * 0.6, y)
          }

          let mistVal = mistBuffer[mistYIdx + (x >> 1)] * mistMultiplier * mistFalloff

          if (mouseFactor > 0.01) {
            const mouseDeltaX = x - mouseCurX
            const distSqRatio = (mouseDeltaX * mouseDeltaX + mouseDeltaY * mouseDeltaY) / radiusSq
            if (distSqRatio < 4) {
              const mouseAttraction = mouseFactor * Math.exp(-distSqRatio)
              mistVal *= 1 - mouseAttraction * 0.92
              if (visibleRidge >= 0) {
                toneLevel += mouseAttraction * 0.16 * ridgeIntro[visibleRidge]
              }
            }
          }

          if (toneLevel > 0.93) toneLevel = 0.93
          mistVal += introFade * 0.55
          if (mistVal > 1) mistVal = 1
          toneLevel = (toneLevel * (1 - mistVal) + 0.09 * mistVal * (1 - introFade)) * vFade

          // 8x8 Bayer Ordered Dither Lookup
          const bayerThreshold = BAYER_8X8[bayerYIdx + (x & 7)]
          const colorIdx = applyDither(toneLevel, numTones, bayerThreshold)
          pixelBuffer[y * bufWidth + x] = packedTones[colorIdx]
        }
      }

      ctx.putImageData(imgData, 0, 0)

      // Dynamic Altimeter Pinpoint Tracker
      const altProbe = altProbeRef.current
      const altText = altTextRef.current
      let probeHit = false

      if (altProbe && altText && p.altimeter && isMouseInside && animElapsed > 1600) {
        const probeX = Math.max(0, Math.min(bufWidth - 1, Math.round(mouseCurX)))
        for (let r = ridgeCount - 1; r >= 0; r--) {
          const ridgeY = curRidgeY[r * bufWidth + probeX]
          if (mouseCurY >= ridgeY - 6) {
            probeHit = true
            altProbe.style.transform = `translate(${(probeX * scaleFactor).toFixed(1)}px, ${(ridgeY * scaleFactor).toFixed(1)}px)`
            const altStr = `${calculateAltitudeMeters(ridgeY, bufHeight, r, ridgeCount).toLocaleString('en-US')} m`
            if (altStr !== cachedAltStr) {
              cachedAltStr = altStr
              altText.textContent = altStr
            }
            break
          }
        }
      }

      if (altProbe && probeHit !== altimeterVisible) {
        altimeterVisible = probeHit
        altProbe.style.opacity = probeHit ? '1' : '0'
      }

      const hasPhysicsMotion =
        Math.abs(mouseTargetX - mouseCurX) + Math.abs(mouseTargetY - mouseCurY) > 0.05 ||
        Math.abs((isMouseInside && p.interactive ? 1 : 0) - mouseFactor) > 0.005 ||
        Math.abs((canInteract ? horizontalPan : 0) - smoothPan) > 0.001 ||
        Math.abs(impulseSpeed) > 0.002

      needsDraw = (animElapsed >= 0 && animElapsed < 3400) || animElapsed < 0 || hasPhysicsMotion || (!prefersReduced && p.drift > 0)
    }

    const checkIsBusy = () => {
      const animElapsed = animStartTimeRef.current === null ? -1 : performance.now() - animStartTimeRef.current
      return animElapsed >= 0 && animElapsed < 3400 || isMouseInside || Math.abs(impulseSpeed) > 0.002 || Math.abs(horizontalPan - smoothPan) > 0.001
    }

    const animLoop = (now: number) => {
      rafId = 0
      if (!isIntersecting) return

      if (animStartTimeRef.current === null) {
        rafId = requestAnimationFrame(animLoop)
        return
      }

      if (checkIsBusy() || now - lastRenderTime > 32) {
        render(now)
        lastRenderTime = now
      }

      if (needsDraw) {
        rafId = requestAnimationFrame(animLoop)
      }
    }

    const wakeAnimation = () => {
      needsDraw = true
      if (!rafId && isIntersecting) {
        rafId = requestAnimationFrame(animLoop)
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      const p = paramsRef.current
      if (!p.interactive && !p.altimeter) return

      const rootRect = rootEl.getBoundingClientRect()
      horizontalPan = rootRect.width > 0 ? ((e.clientX - rootRect.left) / rootRect.width) * 2 - 1 : 0

      const sceneRect = sceneEl.getBoundingClientRect()
      const mx = (e.clientX - sceneRect.left) / scaleFactor
      const my = (e.clientY - sceneRect.top) / scaleFactor
      const wasInside = isMouseInside

      isMouseInside = mx >= 0 && my >= 0 && mx < bufWidth && my < bufHeight
      mouseTargetX = mx
      mouseTargetY = my

      if (isMouseInside && !wasInside) {
        mouseCurX = mouseTargetX
        mouseCurY = mouseTargetY
      }
      wakeAnimation()
    }

    const handlePointerLeave = () => {
      horizontalPan = 0
      isMouseInside = false
      wakeAnimation()
    }

    const handlePointerDown = (e: PointerEvent) => {
      if (!paramsRef.current.interactive || prefersReduced || !isMouseInside) return
      if ((e.target as HTMLElement).closest('a, button')) return
      impulseSpeed += mouseTargetX < bufWidth / 2 ? 1.4 : -1.4
      wakeAnimation()
    }

    updateLayout()
    render(performance.now())
    wakeAnimation()

    rootEl.addEventListener('pointermove', handlePointerMove)
    rootEl.addEventListener('pointerleave', handlePointerLeave)
    rootEl.addEventListener('pointerdown', handlePointerDown)

    const resizeObserver = new ResizeObserver(() => {
      updateLayout()
      render(performance.now())
      wakeAnimation()
    })
    resizeObserver.observe(sceneEl)

    const visibilityObserver = new IntersectionObserver((entries) => {
      isIntersecting = entries[0] ? entries[0].isIntersecting : true
      if (isIntersecting) {
        lastFrameTime = performance.now()
        wakeAnimation()
      }
    })
    visibilityObserver.observe(rootEl)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      rootEl.removeEventListener('pointermove', handlePointerMove)
      rootEl.removeEventListener('pointerleave', handlePointerLeave)
      rootEl.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [seed, ridgeCount, pixel, toneList])

  const [currentYear] = useState(() => new Date().getFullYear())
  const copyrightText = copyright ?? `© ${currentYear} ${name}, Inc. All rights reserved.`

  const rootStyle: CSSProperties = {
    minHeight: height,
    ['--rdf-scene-min' as string]: sceneMinHeight,
    ['--rdf-paper' as string]: activePalette.paper,
    ['--rdf-ink' as string]: activePalette.ink,
    ['--rdf-muted' as string]: activePalette.muted,
    ['--rdf-line' as string]: activePalette.line,
    ['--rdf-heart' as string]: activePalette.heart,
    ['--rdf-deep' as string]: deepTone,
    ['--rdf-accent' as string]: accentTone,
    ['--rdf-n' as string]: columns.length,
    ['--rdf-max' as string]: maxWidth,
    ['--rdf-sans' as string]: fontFamily,
    ['--rdf-mono' as string]: monoFamily,
  }

  const delayStyle = (delayMs: number) => ({ ['--d' as string]: delayMs } as CSSProperties)

  return (
    <footer
      ref={rootRef}
      className={`rdf-root${inView ? ' rdf-in' : ''}${className ? ` ${className}` : ''}`}
      style={rootStyle}
    >
      <div className="rdf-frame">
        {/* Top Header & Columns */}
        <div className="rdf-top">
          {/* Brand Info */}
          <div className="rdf-brand">
            <a className="rdf-logo rdf-r" style={delayStyle(140)} href={brandHref}>
              {logo ?? <MountainMarkSvg />}
              <span>{name}</span>
            </a>

            {tagline ? (
              <p className="rdf-tag rdf-r" style={delayStyle(230)}>
                {tagline}
              </p>
            ) : null}

            {socials.length ? (
              <ul className="rdf-social">
                {socials.map((soc, idx) => (
                  <li key={soc.icon + idx} className="rdf-r" style={delayStyle(320 + idx * 60)}>
                    <a href={soc.href || '#'} aria-label={soc.label || soc.icon}>
                      <SocialIcon icon={soc.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Navigation Columns */}
          {columns.map((col, cIdx) => (
            <nav key={col.title} className="rdf-col" aria-label={col.title}>
              <h3 className="rdf-r" style={delayStyle(260 + cIdx * 110)}>
                {col.title}
              </h3>
              <ul>
                {col.links.map((link, lIdx) => (
                  <li key={link.label} className="rdf-r" style={delayStyle(330 + cIdx * 110 + lIdx * 55)}>
                    <a className="rdf-link" href={link.href || '#'}>
                      {link.label}
                      {link.badge ? <span className="rdf-badge">{link.badge}</span> : null}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="rdf-bar rdf-r" style={delayStyle(1250)}>
          <p>{copyrightText}</p>
          {credit ? (
            <a className="rdf-credit" href={credit.href || '#'}>
              Made with
              <svg className="rdf-heart" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3 1.7-1.9 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"
                />
              </svg>
              <span className="rdf-sr">love</span>
              by {credit.label}
            </a>
          ) : null}
        </div>

        {/* Dynamic Dither Canvas Scene */}
        <div ref={sceneRef} className="rdf-scene">
          <canvas ref={canvasRef} aria-hidden="true" />
          {/* Interactive Altimeter Probe Tooltip */}
          <div ref={altProbeRef} className="rdf-alt" aria-hidden="true">
            <b />
            <i />
            <span ref={altTextRef} />
          </div>
        </div>
      </div>
    </footer>
  )
}
