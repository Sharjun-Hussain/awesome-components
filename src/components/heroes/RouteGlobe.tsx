import { useEffect, useRef, useState, type CSSProperties } from 'react'

export const meta = {
  title: 'Route Globe',
  description:
    'An animated dotted globe with great-circle flight routes arcing from a hub city, comet trails running along every route and drag-to-spin rotation.',
  fullWidth: true,
}

/* -------------------------------------------------------------------------- */
/*  Geography                                                                 */
/* -------------------------------------------------------------------------- */

const DEG = Math.PI / 180

/**
 * A 360 x 180 land mask, run-length encoded: each `value.length` segment fills
 * `length` cells (base 36) with `value`. Water is 0; 7 is Antarctica, which we
 * leave out so the sphere reads as a globe rather than a snowball.
 */
const LAND_GRID =
  '01rx.4c.08d.42.01.4l.0f.4p.083.4p.04.413.02.49.07o.47.06.4d.03.41f.0z.32.01.33.0m.34.015.36.04n.4l.08.41b.0u.38.02.34.01w.37.043.43.05.45.01.43.03.44.01.4d.02.41h.0w.37.029.35.03s.43.04.41.0g.41.06.4a.09.41e.0x.34.04.31.028.32.03p.44.08.42.07.43.02.45.02.4a.09.41d.02e.34.0w.3b.03n.47.01.43.05.43.02.42.01.46.01.45.0m.413.025.36.0r.3o.0n.38.02t.42.0m.46.01.41.0p.411.024.33.0r.3o.03i.48.09.42.04.44.01.45.02.43.02.42.01.43.0m.4z.023.33.0o.3w.01.35.04.34.0d.33.02k.46.01.49.01.43.03.45.01.42.04.49.03.41.0m.4x.022.34.0d.34.08.31c.0a.36.0z.31.01j.44.01.4e.05.43.01.43.03.4g.01.41.0h.4x.022.34.0c.34.01.32.01.31h.03.31.02.32.01.3d.01c.4a.011.4b.07.44.03.4k.0e.4t.02.41.01b.37.010.36.01.32e.011.4o.04.4f.03.4e.03.44.01.44.05.44.05.4a.0d.42.01.4r.016.3f.0r.34.03.36.01.32m.02.38.02.31.0c.41h.06.43.07.41.03.46.02.45.06.47.0g.4o.018.3m.0e.32.03.3a.02.35.01.331.0c.424.01.46.04.42.02.49.0a.4l.01b.3r.03.32.02.3p.02.332.01.33.06.41.02.427.09.4c.09.4i.01c.3k.02.36.03.3s.01.32z.01.37.04.429.01.41.0b.46.03.42.0a.4d.0h.39.0q.3a.03.3a.05.33w.06.31.08.41.03.421.02.44.04.43.01.48.0e.4b.0j.37.0q.3a.03.3b.02.33x.0a.42.09.41y.05.42.02.41.09.47.0e.4a.01e.3b.02.34d.0g.421.08.42.04.41.07.43.0h.47.01d.3c.03.34c.01.31.0f.420.0g.46.0n.46.01c.3c.04.33s.02.33.02.39.0m.4h.02.41g.0g.48.0o.43.01c.3d.04.33p.07.39.0r.48.02.42.0a.419.0h.49.03.42.01x.3d.07.32.01.33d.02.34.05.33.014.43.0g.419.0f.4a.01.44.01m.32.09.33.02.36.07.339.0i.33.014.42.01.43.0i.415.0g.4f.01k.34.0c.31.01.35.05.31.01.338.0h.36.011.42.0q.418.0b.4f.01k.33.0b.33.01.34.05.339.0i.37.0y.42.0t.41a.08.4i.01i.34.0a.32.01.33.07.337.0j.37.0x.41.0x.41d.02.4n.01c.33.02.33.0a.31.06.33.01.319.26.31u.0j.35.01u.41.03.41b.03.4n.01b.33.03.33.07.31i.2c.31.24.31r.01.31.0d.34.020.41a.03.4n.01b.32.03.36.02.31l.2i.316.25.3f.01.31.0d.32.022.41c.01.4m.01.41.01f.35.03.31a.23.38.2i.3j.23.3j.27.3e.01.31.0e.31.022.41.01.41u.02.42.01f.32.04.31c.2z.37.22.35.24.3h.28.3e.01.32.02h.42.01.41l.03.42.04.42.01.41.01g.31d.214.32.2j.35.2g.3b.02.32.02l.41i.01.43.06.46.01c.31g.22c.39.02.31.02l.41.01.41l.09.41.01.41.01e.31f.22e.35.03.31.02l.41n.01.41.02.41.01m.3x.01.33.03.3b.21.03.229.34.04.32.02k.41r.01o.3e.01.3g.03.32.02.3b.05.228.34.02r.41k.02.42.01r.3d.03.3e.09.39.03.229.35.06.21.02l.41i.01q.33.03.39.03.34.02.3c.0c.38.03.228.34.06.24.02j.41h.01q.3c.08.33.04.3a.0e.23.33.05.226.09.24.02k.41h.01q.3b.0a.34.03.38.21.04.25.04.26.31.21.05.224.02y.41e.01t.3a.07.32.05.33.01.35.02.21.02.2l.03.21w.01.27.0b.22.02m.41e.01t.39.08.32.06.31.03.33.03.2n.04.21u.03.21.02.23.0c.22.02n.41c.01u.39.0l.33.03.2m.05.21s.07.23.0c.21.02o.41b.01v.38.0e.32.06.32.04.2n.04.21t.01.22.04.23.09.23.02p.41a.01y.31.06.1a.0b.31.06.22.01.22.02.22d.05.23.07.25.02q.419.01y.11.03.1d.0p.22c.07.22.04.28.02r.417.01y.1h.0q.22c.06.21.04.23.01.22.02x.413.01z.1j.0o.22e.09.24.031.411.01z.1o.06.12.0c.22e.09.22.033.42.01.4x.01z.1q.04.17.03.11.04.22f.08.21.035.41.02.4w.01z.1t.01.1f.22e.03g.41.02.4h.04.42.06.42.01z.116.01.12.2d.02.220.03g.41.01.4g.0d.42.01y.119.01.2d.03.21z.03f.43.01.4e.0e.43.01v.11a.03.2d.04.21w.03i.41.03.4c.0f.42.01.41.01s.11c.02.2e.07.21r.03k.41.02.4c.0g.41.01t.11e.02.2d.01.21.07.21o.03l.41.03.4a.02b.11e.02.2e.03.23.0a.21g.02.21.03n.49.02a.11g.03.2k.09.21d.03.21.03p.48.0e.41.01.43.01r.11g.03.2l.0a.2l.01.2n.05.21.03q.48.0i.42.01o.11i.02.2k.0b.2h.05.2g.01.22.03z.49.07.43.0a.42.01n.11h.03.2j.0e.2e.06.2e.02p.41.01e.49.05.44.0e.43.01i.11h.04.2h.0f.2c.09.2c.03.22.041.49.02.45.0e.46.01.41.01e.11i.03.2g.0g.2b.0a.2c.03.21.045.4d.020.11j.03.2d.0i.2a.0b.2d.0d.22.03v.4b.01z.11k.04.2a.0k.29.0c.2e.0c.22.041.49.01v.11l.03.29.0m.26.0i.2b.0b.22.042.49.01u.11m.02.26.0p.26.0i.2b.0b.22.044.46.01v.11n.01.24.0s.25.0i.2b.0d.22.045.44.01u.11o.0w.25.0i.22.02.27.0f.21.045.42.0b.51.01k.11n.06.12.0p.24.0j.21.03.26.0d.21.02.21.044.43.07.54.01.55.02.51.01.41.01a.11n.01.16.0p.24.0i.21.05.23.0c.21.04c.42.02.41.03.54.01.5a.01b.11t.0p.23.01.21.0h.21.06.21.0c.21.06.21.046.44.02.41.5h.01b.11r.0r.21.02.21.0h.22.0n.21.01.21.049.41.02.5j.01a.11r.0u.22.0h.21.0m.21.01.23.04c.5j.01b.11o.0v.22.0i.22.0e.22.06.21.04d.5o.31.017.1a.05.118.01f.23.0d.23.04k.5n.32.018.11.0d.116.01c.22.03.22.0b.25.04k.5n.32.51.01p.111.01e.22.02.22.0a.24.04k.5p.31.52.01p.110.01g.22.02.22.07.27.04j.5t.01n.110.01i.23.01.21.05.29.0a.21.047.5u.01n.1y.01k.24.06.29.02.24.04.21.047.5v.01m.1x.01m.24.05.29.0e.21.042.510.01i.1x.01n.23.06.27.02.23.09.23.041.510.01.51.01h.1v.01o.25.04.27.02.23.0b.21.02.24.03w.515.01e.1t.01q.24.08.22.03.21.01.21.04.21.03.21.02.28.62.03s.517.01d.1s.01s.23.0g.21.0d.25.64.03q.51a.01b.1r.01t.22.0g.21.0b.21.03.23.65.02.61.01.62.03j.51a.01b.1r.01v.23.0p.21.03.23.67.07.61.03g.519.01c.1q.01w.26.0p.23.66.0b.61.03e.518.01c.1q.023.21.02.22.01.21.01.21.03.21.0d.21.62.03.62.03p.517.01d.1r.027.21.04.21.0m.62.0b.62.03c.516.01d.1r.032.61.03o.514.01f.1q.02k.61.09.61.03w.513.01f.1s.08.11.029.66.05.61.03x.511.01g.1s.08.11.028.66.06.62.03w.511.01f.1t.07.12.024.62.01.67.06.63.03w.510.01f.1s.07.13.022.6c.06.63.03y.5y.01f.1s.04.16.022.6e.03.65.0l.61.0b.61.031.5w.01f.1q.06.15.021.6i.01.65.0w.61.033.5u.01g.1o.08.15.021.6o.040.5u.01h.1m.09.15.020.6q.03z.5u.01h.1m.09.15.01x.6v.0f.61.03h.5t.01j.1l.08.15.01v.6y.0g.61.03g.5s.01k.1m.07.15.01u.610.03w.5p.01n.1l.09.14.01u.611.03u.5o.01q.1k.09.13.01u.613.03t.5n.01r.1i.0c.11.01w.613.03s.5m.01s.1i.028.614.03s.5m.01s.1i.029.613.03s.5m.01t.1g.02b.613.03r.5l.01v.1e.02c.612.03r.5m.01v.1e.02c.612.03r.5l.01x.1c.02e.611.03s.5j.01y.1b.02f.6a.08.6i.03s.5j.01z.19.02g.69.0b.62.01.6d.03t.5e.01.53.021.12.02n.63.0g.61.01.6e.03s.5g.05f.6c.0n.61.035.5g.05h.6a.0o.61.033.5h.05h.6a.0p.61.033.5e.05m.61.01.62.0s.63.031.5b.06k.63.031.5c.06l.62.031.59.05u.63.0o.62.01.61.032.5b.05s.63.0n.63.035.58.05v.61.0n.63.035.59.06h.63.036.58.06i.64.036.58.06j.62.037.59.09q.59.09r.58.03t.11.05z.56.09u.56.08.53.09k.54.09w.56.09w.56.09x.51.0289.72.09v.71.09x.71.05i.71.04d.73.037.76.018.74.06.74.0f.76.04c.73.035.7c.0m.71s.042.73.030.7q.0a.71z.03u.72.02.75.02n.76.02.7u.07.729.03m.73.01.76.01w.74.02.7a.02.718.05.72g.03g.77.01.76.01e.72.02.723.04.72r.03e.76.01c.754.01q.72.02.72.0i.75.03.7a.04.73.05.7c.019.755.01j.7a.01.73.02.77.01.71.0a.712.01b.752.01c.729.01a.753.01e.724.016.75c.012.72b.017.75g.0w.73.04.727.0t.75.08.75n.0v.73.0a.720.0q.78.0d.75b.01g.722.07.76.06.78.0g.75a.019.72i.0o.75m.01a.72m.04.763.016.78z.0b.75.01.77.0k.791.02.7v.01.71d4.'

const GRID_W = 360
const GRID_H = 180
let gridCache: Uint8Array | null = null

function landGrid() {
  if (gridCache) return gridCache
  const cells = new Uint8Array(GRID_W * GRID_H)
  let cursor = 0
  for (const run of LAND_GRID.split('.')) {
    if (!run) continue
    const value = Number(run[0])
    const length = parseInt(run.slice(1), 36)
    if (value) cells.fill(value, cursor, cursor + length)
    cursor += length
  }
  gridCache = cells
  return cells
}

function landAt(lon: number, lat: number) {
  const cells = landGrid()
  const x = Math.min(GRID_W - 1, Math.max(0, Math.floor((((lon + 180) % 360) + 360) % 360)))
  const y = Math.min(GRID_H - 1, Math.max(0, Math.floor(90 - lat)))
  return cells[y * GRID_W + x]
}

/* -------------------------------------------------------------------------- */
/*  Spherical maths                                                           */
/* -------------------------------------------------------------------------- */

function toVec(lon: number, lat: number): [number, number, number] {
  const phi = lon * DEG
  const theta = lat * DEG
  return [Math.cos(theta) * Math.sin(phi), Math.sin(theta), Math.cos(theta) * Math.cos(phi)]
}

/** Fibonacci-sphere dots, keeping only those on land. */
function landDots(count = 30000) {
  const out: number[] = []
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  for (let index = 0; index < count; index += 1) {
    const y = 1 - (2 * (index + 0.5)) / count
    const radius = Math.sqrt(1 - y * y)
    const angle = index * goldenAngle
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const lat = Math.asin(y) / DEG
    const lon = Math.atan2(x, z) / DEG
    const cell = landAt(lon, lat)
    if (cell && cell !== 7) out.push(x, y, z)
  }
  return new Float32Array(out)
}

/** Rotate a vector by yaw around Y, then tilt around X. */
function rotate(source: ArrayLike<number>, yaw: number, tilt: number, offset = 0) {
  const x = source[offset]
  const y = source[offset + 1]
  const z = source[offset + 2]
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const ct = Math.cos(tilt)
  const st = Math.sin(tilt)
  const rx = x * cy - z * sy
  const rz = x * sy + z * cy
  return [rx, y * ct - rz * st, y * st + rz * ct] as const
}

/** Spherical interpolation, used to draw the great-circle arcs. */
function slerp(from: ArrayLike<number>, to: ArrayLike<number>, t: number) {
  const dot = Math.max(
    -1,
    Math.min(1, from[0] * to[0] + from[1] * to[1] + from[2] * to[2]),
  )
  const angle = Math.acos(dot)
  if (angle < 1e-6) return [from[0], from[1], from[2]] as const
  const sine = Math.sin(angle)
  const a = Math.sin((1 - t) * angle) / sine
  const b = Math.sin(t * angle) / sine
  return [
    from[0] * a + to[0] * b,
    from[1] * a + to[1] * b,
    from[2] * a + to[2] * b,
  ] as const
}

/* -------------------------------------------------------------------------- */
/*  Drawing                                                                   */
/* -------------------------------------------------------------------------- */

type View = { cx: number; cy: number; r: number; yaw: number; tilt: number }

function drawGlobe(
  ctx: CanvasRenderingContext2D,
  dots: Float32Array,
  view: View,
  land: string,
  dotSize: number,
  glow: string,
) {
  const { cx, cy, r, yaw, tilt } = view

  const halo = ctx.createRadialGradient(cx, cy, r * 0.92, cx, cy, r * 1.22)
  halo.addColorStop(0, glow)
  halo.addColorStop(1, 'transparent')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(cx, cy, r * 1.22, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = land
  const cyaw = Math.cos(yaw)
  const syaw = Math.sin(yaw)
  const ctilt = Math.cos(tilt)
  const stilt = Math.sin(tilt)

  // The far side of the sphere, a barely-there dusting.
  ctx.globalAlpha = 0.09
  for (let index = 0; index < dots.length; index += 3) {
    const x = dots[index]
    const y = dots[index + 1]
    const z = dots[index + 2]
    const rx = x * cyaw - z * syaw
    const rz = x * syaw + z * cyaw
    const ry = y * ctilt - rz * stilt
    const rz2 = y * stilt + rz * ctilt
    if (rz2 >= 0) continue
    ctx.fillRect(cx + rx * r - dotSize * 0.35, cy - ry * r - dotSize * 0.35, dotSize * 0.7, dotSize * 0.7)
  }

  // The near side, split into four depth bands so the sphere gains volume.
  for (let band = 0; band < 4; band += 1) {
    const from = band / 4
    const to = (band + 1) / 4
    ctx.globalAlpha = 0.35 + 0.65 * to
    for (let index = 0; index < dots.length; index += 3) {
      const x = dots[index]
      const y = dots[index + 1]
      const z = dots[index + 2]
      const rx = x * cyaw - z * syaw
      const rz = x * syaw + z * cyaw
      const ry = y * ctilt - rz * stilt
      const rz2 = y * stilt + rz * ctilt
      if (rz2 < from || rz2 >= to || rz2 < 0) continue
      const size = dotSize * (0.7 + 0.3 * rz2)
      ctx.fillRect(cx + rx * r - size / 2, cy - ry * r - size / 2, size, size)
    }
  }

  ctx.globalAlpha = 1
}

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

export type GlobePlace = {
  name: string
  lon: number
  lat: number
  note?: string
}

export type GlobeTheme = {
  ground: string
  land: string
  arc: string
  glow: string
  text: string
  muted: string
}

/** Inzeedo's home base: Colombo. */
const DEFAULT_HUB: GlobePlace = { name: 'Colombo', lon: 79.86, lat: 6.93 }

const DEFAULT_PLACES: GlobePlace[] = [
  { name: 'Dubai', lon: 55.27, lat: 25.2, note: '4h 35m' },
  { name: 'Doha', lon: 51.53, lat: 25.29, note: '4h 45m' },
  { name: 'Singapore', lon: 103.82, lat: 1.35, note: '3h 55m' },
  { name: 'Kuala Lumpur', lon: 101.69, lat: 3.14, note: '3h 40m' },
  { name: 'Bangkok', lon: 100.5, lat: 13.76, note: '3h 30m' },
  { name: 'Tokyo', lon: 139.69, lat: 35.68, note: '8h 40m' },
  { name: 'London', lon: -0.13, lat: 51.5, note: '11h 30m' },
  { name: 'Frankfurt', lon: 8.68, lat: 50.11, note: '11h 05m' },
  { name: 'Sydney', lon: 151.21, lat: -33.87, note: '10h 10m' },
  { name: 'Melbourne', lon: 144.96, lat: -37.81, note: '10h 35m' },
]

const NIGHT: GlobeTheme = {
  ground: '#06080d',
  land: '#9fb4d6',
  arc: '#ffb547',
  glow: 'rgb(90 140 255 / 0.18)',
  text: '#eef2fb',
  muted: '#7c8aa5',
}

const GLOBE_CSS = `
.rg { position: relative; width: 100%; height: 100%; min-height: 22rem; overflow: hidden;
  font-family: ui-sans-serif, system-ui, sans-serif; }
.rg__canvas { position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: block;
  width: 100%; height: 100%; cursor: grab; touch-action: pan-y; }
.rg[data-dragging] .rg__canvas { cursor: grabbing; }
.rg__tip { pointer-events: none; position: absolute; translate: 12px -50%;
  display: flex; flex-direction: column; gap: 2px; padding: 7px 10px;
  border: 1px solid color-mix(in oklab, var(--rg-arc) 45%, transparent);
  border-radius: 8px;
  background: color-mix(in oklab, var(--rg-ground) 86%, transparent);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  font-size: 13px; white-space: nowrap; }
.rg__tip span { font: 0.6875rem ui-monospace, monospace; color: var(--rg-muted); }
.rg__sr { position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap; }
`

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

type RouteGlobeProps = {
  hub?: GlobePlace
  places?: GlobePlace[]
  theme?: GlobeTheme
  motion?: 'full' | 'reduced'
  className?: string
  style?: CSSProperties
}

type Route = { p: GlobePlace; v: readonly [number, number, number]; offset: number }
type Hit = { p: GlobePlace; x: number; y: number; front: boolean }
type Tip = { p: GlobePlace; x: number; y: number }

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

export function RouteGlobe({
  hub = DEFAULT_HUB,
  places = DEFAULT_PLACES,
  theme = NIGHT,
  motion = 'full',
  className = '',
  style,
}: RouteGlobeProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tip, setTip] = useState<Tip | null>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced =
      motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches
    const dots = landDots(window.innerWidth < 640 ? 18000 : 30000)
    const hubVec = toVec(hub.lon, hub.lat)
    const routes: Route[] = places.map((place, index) => ({
      p: place,
      v: toVec(place.lon, place.lat),
      offset: index / places.length,
    }))

    const view = {
      yaw: hub.lon * DEG - 0.35,
      tilt: 18 * DEG,
      vy: 0,
      vt: 0,
      drag: false,
      px: 0,
      py: 0,
      last: 0,
      idle: 0,
    }

    let width = 0
    let height = 0
    let dpr = 1
    let raf = 0
    let alive = true
    let visible = true
    const origin = performance.now()
    let hits: Hit[] = []

    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2)
      width = host.clientWidth
      height = host.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    }

    const project = (vector: ArrayLike<number>, scale: number, radius: number, cx: number, cy: number) => {
      const [x, y, z] = rotate(vector, view.yaw, view.tilt)
      return { x: cx + x * radius * scale, y: cy - y * radius * scale, z }
    }

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      const r = Math.min(width, height) * 0.4
      const cx = width / 2
      const cy = height / 2

      drawGlobe(
        ctx,
        dots,
        { cx, cy, r, yaw: view.yaw, tilt: view.tilt },
        theme.land,
        Math.max(1.4, r / 150),
        theme.glow,
      )

      const time = (now - origin) / 1000
      hits = []
      ctx.lineCap = 'round'

      for (const route of routes) {
        const dot = clamp(
          hubVec[0] * route.v[0] + hubVec[1] * route.v[1] + hubVec[2] * route.v[2],
          -1,
          1,
        )
        const lift = 0.06 + Math.acos(dot) * 0.12
        const points: { x: number; y: number; z: number }[] = []
        for (let step = 0; step <= 48; step += 1) {
          const t = step / 48
          points.push(
            project(
              slerp(hubVec, route.v, t),
              1 + Math.sin(Math.PI * t) * lift,
              r,
              cx,
              cy,
            ),
          )
        }

        // The full great circle, dim behind the sphere.
        ctx.strokeStyle = theme.arc
        ctx.lineWidth = 1.1
        for (let step = 0; step < 48; step += 1) {
          const a = points[step]
          const b = points[step + 1]
          const behind = a.z < 0 && Math.hypot(a.x - cx, a.y - cy) < r
          ctx.globalAlpha = behind ? 0.06 : 0.38
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }

        // The comet: a short bright head with a fading tail.
        const period = 3.6
        const phase = reduced ? 0.999 : (time / period + route.offset) % 1
        const visibleLength = Math.min(1, phase / 0.7)
        const head = Math.floor(visibleLength * 48)
        for (let step = Math.max(0, head - 10); step < head; step += 1) {
          const a = points[step]
          const b = points[step + 1]
          if (a.z < 0 && Math.hypot(a.x - cx, a.y - cy) < r) continue
          ctx.globalAlpha = (1 - (head - step) / 10) * 0.95
          ctx.lineWidth = 2.2
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }

        const end = points[48]
        const front = end.z > 0
        hits.push({ p: route.p, x: end.x, y: end.y, front })
        if (front) {
          ctx.globalAlpha = 1
          ctx.fillStyle = theme.arc
          ctx.beginPath()
          ctx.arc(end.x, end.y, 2.6, 0, Math.PI * 2)
          ctx.fill()
          if (phase > 0.7) {
            const pulse = (phase - 0.7) / 0.3
            ctx.globalAlpha = 1 - pulse
            ctx.lineWidth = 1.4
            ctx.beginPath()
            ctx.arc(end.x, end.y, 3 + pulse * 16, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      }

      // The hub marker, with a soft breathing ring.
      const home = project(hubVec, 1, r, cx, cy)
      if (home.z > 0) {
        ctx.globalAlpha = 1
        ctx.fillStyle = theme.text
        ctx.beginPath()
        ctx.arc(home.x, home.y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time * 3)
        ctx.strokeStyle = theme.text
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.arc(home.x, home.y, 9, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const advance = (now: number) => {
      const dt = view.last ? Math.min(0.05, (now - view.last) / 1000) : 0.016
      view.last = now

      if (!view.drag) {
        view.yaw += view.vy * dt
        view.tilt += view.vt * dt
        view.vy *= Math.pow(0.05, dt)
        view.vt *= Math.pow(0.05, dt)
        // A slow idle turn once the visitor has stopped dragging.
        if (now - view.idle > 2500) view.yaw += dt * 0.08
        view.tilt = clamp(view.tilt + (18 * DEG - view.tilt) * Math.min(1, dt * 0.4), -0.9, 0.9)
      }

      draw(now)
    }

    const tick = (now: number) => {
      raf = 0
      if (!alive || !visible || document.hidden) return
      advance(now)
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (reduced) {
        draw(performance.now())
        return
      }
      if (!raf && alive) {
        view.last = 0
        raf = requestAnimationFrame(tick)
      }
    }

    const onDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId)
      view.drag = true
      view.px = event.clientX
      view.py = event.clientY
      view.vy = 0
      view.vt = 0
      host.dataset.dragging = ''
    }

    const onMove = (event: PointerEvent) => {
      if (view.drag) {
        const r = Math.min(width, height) * 0.4
        const dx = event.clientX - view.px
        const dy = event.clientY - view.py
        view.px = event.clientX
        view.py = event.clientY
        view.yaw -= dx / r
        view.tilt = clamp(view.tilt + dy / r, -0.9, 0.9)
        view.vy = (-dx / r) * 30
        view.vt = (dy / r) * 30
        view.idle = performance.now()
        if (reduced) draw(performance.now())
        setTip(null)
        return
      }

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const hit = hits
        .filter((item) => item.front)
        .map((item) => ({ ...item, d: Math.hypot(item.x - x, item.y - y) }))
        .sort((a, b) => a.d - b.d)[0]
      setTip(hit && hit.d < 18 ? { p: hit.p, x: hit.x, y: hit.y } : null)
    }

    const onUp = () => {
      view.drag = false
      view.idle = performance.now()
      delete host.dataset.dragging
    }

    const onLeave = () => setTip(null)
    const onVisibility = () => {
      if (!document.hidden) start()
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    canvas.addEventListener('pointerleave', onLeave)

    const resizeObserver = new ResizeObserver(() => {
      size()
      draw(performance.now())
    })
    resizeObserver.observe(host)

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
    })
    intersectionObserver.observe(host)

    document.addEventListener('visibilitychange', onVisibility)

    size()
    draw(performance.now())
    start()

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [hub, places, theme, motion])

  return (
    <>
      <style>{GLOBE_CSS}</style>
      <div
        ref={hostRef}
        className={`rg ${className}`}
        style={
          {
            background: theme.ground,
            color: theme.text,
            '--rg-muted': theme.muted,
            '--rg-arc': theme.arc,
            '--rg-ground': theme.ground,
            ...style,
          } as CSSProperties
        }
      >
        <canvas
          ref={canvasRef}
          className="rg__canvas"
          role="img"
          aria-label={`A globe with ${places.length} flight routes from ${hub.name}`}
        />

        {tip && (
          <div className="rg__tip" style={{ left: tip.x, top: tip.y }} aria-hidden="true">
            <strong>{tip.p.name}</strong>
            {tip.p.note && (
              <span>
                {tip.p.note} from {hub.name}
              </span>
            )}
          </div>
        )}

        <ul className="rg__sr">
          {places.map((place) => (
            <li key={place.name}>
              {hub.name} to {place.name}
              {place.note ? `, ${place.note}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*  Inzeedo demo                                                              */
/* -------------------------------------------------------------------------- */

export default function RouteGlobeDemo() {
  return (
    <div
      className="relative h-screen min-h-full w-full"
      style={{ background: NIGHT.ground, color: NIGHT.text }}
    >
      <RouteGlobe theme={NIGHT} />

      <div className="pointer-events-none absolute top-6 left-6">
        <p
          className="font-mono text-[11px] tracking-[0.16em] uppercase"
          style={{ color: NIGHT.muted }}
        >
          Inzeedo &middot; 10 routes
        </p>
        <p className="mt-2 text-[1.5rem] font-semibold tracking-[-0.02em]">
          Where Inzeedo connects.
        </p>
      </div>

      <p
        className="pointer-events-none absolute right-6 bottom-6 font-mono text-[11px] tracking-[0.16em] uppercase"
        style={{ color: NIGHT.muted }}
      >
        inzeedo.lk
      </p>
    </div>
  )
}
