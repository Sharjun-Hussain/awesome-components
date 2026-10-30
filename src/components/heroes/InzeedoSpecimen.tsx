import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'

export const meta = {
  title: 'Inzeedo Specimen',
  description:
    'A full-screen, scroll-driven typeface specimen: a sculpted WebGL flower, six editorial scenes, interactive glyph grid and a live ligature toggle.',
  fullWidth: true,
  thumbnail: true,
}

/* -------------------------------------------------------------------------- */
/*  Typeface & palette                                                        */
/* -------------------------------------------------------------------------- */

const FONT_STACK =
  '"Federant", "Uncial Antiqua", "Cinzel Decorative", "Iowan Old Style", "Palatino Linotype", Georgia, serif'
const SANS_STACK =
  '"Helvetica Neue", Helvetica, Arial, ui-sans-serif, system-ui, sans-serif'

const INK = '#050505'
const BONE = '#b6b095'
const CRIMSON = '#e3131b'

const NAME = 'Inzeedo'
const STUDIO = 'Inzeedo'
const YEAR = '2026'

const FONT_URL = new URL('./assets/federant/federant-latin.woff2', import.meta.url).href

const DESCRIPTION =
  'Inzeedo is a vintage serif with organic curves and intricate accents — a display face for branding, invitations and editorial work.'

const SPECS = [
  'Contains 192 glyphs',
  'OTF / TTF / WOFF2',
  'Uppercase & Lowercase',
  '3 ligatures in 1 OpenType feature',
  'Multilingual support',
]

const TAGLINE = [
  { text: 'Bloom' },
  { text: 'like', small: true },
  { text: 'flowers' },
  { text: 'in the sun', small: true },
]

const MULTILINGUAL = 'Múlti·lïngüäl'
const LIGATURE_WORD = 'Affluent'

const LINKS = [
  { label: 'INZEEDO.LK', href: 'https://inzeedo.lk' },
  { label: 'INZEEDO / TYPE', href: 'https://inzeedo.lk' },
]

const UPPER_LEFT = ['ABCD', 'EFGHI', 'JKLM']
const UPPER_RIGHT = ['NOPQ', 'RSTUV', 'WXYZ']
const LOWER_LEFT = ['abcdefg', 'hijklm']
const LOWER_RIGHT = ['nopqrst', 'uvwxyz']
const ACCENT_LEFT = ['ÀÁÂÃÄÅÆÇÈ', 'ÉÊËÌÍÎÏÑÒ', 'ÓÔÕÖØÙÚÛÜ']
const ACCENT_RIGHT = ['àáâãäåæçè', 'éêëìíîïñò', 'óôõöøùúûü']
const FIGURES = ['0', '123', '4567', '888999']
const PUNCTUATION = `@#$%&*_-+×÷=±/\\|(){}[].,:;'"“”^~°!?¡¿©®™`
const SCENES = ['Cover', 'Crown', 'Specimen', 'Fancy', 'Bloom', 'Ligatures']

const COMPONENT_CSS = `
@font-face{font-family:"Federant";font-style:normal;font-weight:400;font-display:swap;src:url("${FONT_URL}") format("woff2")}
.lys-stage{container-type:size;container-name:lys}
.lys-char{display:inline-block;animation:lys-in 1.3s cubic-bezier(.2,.8,.2,1) both}
@keyframes lys-in{from{opacity:0;transform:translateY(0.35em) rotate(4deg);filter:blur(10px)}to{opacity:1;transform:none;filter:blur(0)}}
.lys-g{display:inline-block;transition:color .25s,transform .25s cubic-bezier(.2,.8,.2,1);cursor:default}
.lys-g:hover{color:var(--lys-red);transform:translateY(-0.08em) scale(1.35)}
.lys-edit{outline:none;cursor:text;border-bottom:1px dashed transparent;transition:border-color .3s}
.lys-edit:hover,.lys-edit:focus{border-bottom-color:var(--lys-red)}
.lys-nav button{display:flex;align-items:center;gap:10px;justify-content:flex-end;background:none;border:0;padding:5px 0;cursor:pointer;color:inherit;font:inherit}
.lys-nav .lys-tick{display:block;height:1px;width:14px;background:currentColor;opacity:.45;transition:width .4s cubic-bezier(.2,.8,.2,1),opacity .3s,background-color .3s}
.lys-nav .lys-lab{opacity:0;transform:translateX(6px);transition:opacity .3s,transform .3s}
.lys-nav button:hover .lys-lab,.lys-nav button:focus-visible .lys-lab{opacity:1;transform:none}
.lys-nav button[aria-current=step] .lys-tick{width:34px;opacity:1;background:var(--lys-red)}
@container lys (orientation: portrait){.lys-bloom{left:7cqw!important;top:auto!important;bottom:13cqh}.lys-fin{flex-direction:column!important;gap:4cqh!important;top:44cqh!important}.lys-spec{grid-template-columns:1fr 1fr!important}.lys-spec-mid{display:none!important}}
@container lys (max-width: 720px){.lys-hide-sm{display:none!important}}
@container lys (max-width: 1020px){.lys-hide-md{display:none!important}}
@media (max-width: 1023px){.lys-stage{top:4rem;height:calc(100svh - 4rem)!important}}
@media (prefers-reduced-motion: reduce){.lys-char{animation:none}.lys-g{transition:none}}
`

/* -------------------------------------------------------------------------- */
/*  Small maths                                                               */
/* -------------------------------------------------------------------------- */

type Vec3 = [number, number, number]

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s]
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const norm = (a: Vec3): Vec3 => {
  const length = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / length, a[1] / length, a[2] / length]
}

const clamp01 = (n: number) => (n <= 0 ? 0 : n > 1 ? 1 : n)

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

const progressFrom = (top: number, height: number, viewport: number) => {
  const span = height - viewport
  return span <= 0 ? 0 : clamp01(-top / span)
}

const sceneCoord = (progress: number, count: number, blend: number) => {
  if (count <= 1) return 0
  const raw = clamp01(progress) * (count - 1)
  const base = Math.min(Math.floor(raw), count - 2)
  const half = blend / 2
  return base + easeInOut(clamp01((raw - base - half) / (1 - 2 * half)))
}

const reveal = (progress: number, scene: number, delay: number) => {
  const distance = progress - scene
  const offset = distance < 0 ? delay : 1 - delay
  return clamp01((0.6 - Math.abs(distance) - offset * 0.2) / 0.25)
}

/** Seeded PRNG so the flower is identical on every load. */
const rng = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (state + 1831565813) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* -------------------------------------------------------------------------- */
/*  Flower geometry                                                           */
/* -------------------------------------------------------------------------- */

type Curve = {
  pts: Vec3[]
  kind: number
  w: number
  t: number
  lat: Vec3
  twist: number
  bulb: boolean
  phase: number
  stagger: number
  base: Vec3
}

const ORIGIN: Vec3 = [0, 0.25, 0]

function buildCurves(florets: number, seed: number) {
  const count = Math.max(3, Math.min(8, Math.round(florets)))
  const random = rng(seed)
  const curves: Curve[] = []
  const up: Vec3 = [0, 1, 0]

  for (let floret = 0; floret < count; floret++) {
    const angle = (floret / count) * Math.PI * 2 + (random() - 0.5) * 0.3
    const tilt = 1.05 + (random() - 0.5) * 0.25
    const radial: Vec3 = [Math.cos(angle), 0, Math.sin(angle)]
    const axis = norm([
      Math.sin(tilt) * radial[0],
      Math.cos(tilt),
      Math.sin(tilt) * radial[2],
    ])
    const base: Vec3 = [radial[0] * 0.13, 0.07, radial[2] * 0.13]
    const lat = norm(cross(axis, Math.abs(axis[1]) > 0.9 ? [1, 0, 0] : up))
    const bitangent = cross(axis, lat)
    const shared = { base, stagger: floret / count }

    // Stem rising from the heart of the flower.
    const stem: Vec3[] = []
    for (let i = 0; i <= 10; i++) {
      const t = i / 10
      stem.push([radial[0] * 0.13 * t, 0.07 * Math.sin((t * Math.PI) / 2), radial[2] * 0.13 * t])
    }
    curves.push({
      pts: stem,
      kind: 2,
      w: 0.022,
      t: 0,
      lat,
      twist: 0,
      bulb: false,
      phase: 0,
      ...shared,
    })

    // Six curled petals per floret.
    for (let petal = 0; petal < 6; petal++) {
      const around = (petal / 6) * Math.PI * 2 + random() * 0.7 + (random() - 0.5) * 0.35
      const direction = add(mul(lat, Math.cos(around)), mul(bitangent, Math.sin(around)))
      const binormal = norm(cross(direction, axis))
      const phase = random() * Math.PI * 2
      const spread = 1.35 + random() * 0.3
      const start = 0.45 + random() * 0.2
      const end = 2.75 + random() * 0.45
      const pts: Vec3[] = [base]
      let point = base
      const segments = 48
      for (let i = 1; i <= segments; i++) {
        const t = i / segments
        const curl = start + (end - start) * t ** 1.2
        point = add(point, mul(add(mul(direction, Math.sin(curl)), mul(axis, Math.cos(curl))), spread / segments))
        pts.push(point)
      }
      for (let i = 1; i <= segments; i++) {
        const t = i / segments
        pts[i] = add(pts[i], mul(binormal, Math.sin(t * Math.PI * 2.4 + phase) * 0.05 * t))
      }
      curves.push({
        pts,
        kind: 0,
        w: 0.075 + random() * 0.02,
        t: 0.02,
        lat: binormal,
        twist: 0.2 + random() * 0.35,
        bulb: false,
        phase,
        ...shared,
      })

      // Fine tendril that dips away from the petal.
      const around2 = around + 0.52
      const direction2 = add(mul(lat, Math.cos(around2)), mul(bitangent, Math.sin(around2)))
      const outward = norm([direction2[0], 0, direction2[2]])
      const droop = norm(add(axis, mul(direction2, 0.25)))
      const down = norm(add(add(mul(radial, 0.85), mul(outward, 0.5)), [0, -0.95, 0]))
      const length = 1.75 + random() * 0.45
      const tendril: Vec3[] = [base]
      point = base
      for (let i = 1; i <= 44; i++) {
        const t = i / 44
        const tip = t ** 1.15
        point = add(point, mul(norm(add(mul(droop, 1 - tip), mul(down, tip))), length / 44))
        tendril.push(point)
      }
      curves.push({
        pts: tendril,
        kind: 1,
        w: 0.012,
        t: 0,
        lat: binormal,
        twist: 0,
        bulb: true,
        phase: phase + 1.3,
        ...shared,
      })
    }

    // A longer leaf blade sweeping down from the crown.
    {
      const downAxis = norm(add(mul(radial, 0.9), [0, -0.35, 0]))
      const leaf: Vec3[] = [base]
      let point = base
      const length = 2.2 + random() * 0.3
      for (let i = 1; i <= 44; i++) {
        const t = i / 44
        point = add(point, mul(norm(add(mul(axis, 1 - t), mul(downAxis, t))), length / 44))
        leaf.push(point)
      }
      curves.push({
        pts: leaf,
        kind: 1,
        w: 0.009,
        t: 0,
        lat,
        twist: 0,
        bulb: false,
        phase: random() * 6,
        ...shared,
      })
    }
  }

  // Long central stem.
  const stalk: Vec3[] = []
  for (let i = 0; i <= 40; i++) {
    const t = i / 40
    stalk.push([Math.sin(t * 2.2) * 0.07, 0.04 - t * 4.6, Math.sin(t * 1.3) * 0.03])
  }
  curves.push({
    pts: stalk,
    kind: 2,
    w: 0.05,
    t: 0,
    lat: [1, 0, 0],
    twist: 0,
    bulb: false,
    phase: 0,
    stagger: 0,
    base: [0, 0, 0],
  })

  let radius = 0
  for (const curve of curves) {
    if (curve.kind === 2) continue
    for (const point of curve.pts) {
      radius = Math.max(radius, Math.hypot(point[0] - ORIGIN[0], point[1] - ORIGIN[1], point[2] - ORIGIN[2]))
    }
  }

  return { curves, radius }
}

const STRIDE = 13

function buildMesh(curves: Curve[]) {
  const data: number[] = []
  const index: number[] = []
  let vertexCount = 0

  const push = (position: Vec3, normal: Vec3, across: number, curve: Curve) => {
    data.push(
      position[0],
      position[1],
      position[2],
      normal[0],
      normal[1],
      normal[2],
      across,
      curve.phase,
      curve.kind,
      curve.stagger,
      curve.base[0],
      curve.base[1],
      curve.base[2],
    )
    return vertexCount++
  }

  const tangent = (pts: Vec3[], i: number) =>
    norm(sub(pts[Math.min(i + 1, pts.length - 1)], pts[Math.max(i - 1, 0)]))

  for (const curve of curves) {
    const length = curve.pts.length
    if (curve.kind === 0) {
      const rings: number[][] = []
      let firstRing: Vec3[] = []
      let secondRing: Vec3[] = []
      let firstTangent: Vec3 = [0, 1, 0]
      let lastTangent: Vec3 = [0, 1, 0]

      for (let i = 0; i < length; i++) {
        const t = i / (length - 1)
        const tan = tangent(curve.pts, i)
        let across = norm(cross(tan, curve.lat))
        let normal = cross(across, tan)
        const twist = curve.twist * Math.sin(Math.PI * t)
        const cos = Math.cos(twist)
        const sin = Math.sin(twist)
        const rotated = add(mul(normal, cos), mul(across, sin))
        across = sub(mul(across, cos), mul(normal, sin))
        normal = rotated

        const width =
          curve.w *
          (0.42 + 0.58 * Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.9)) ** 0.6) *
          (1 + 0.1 * Math.sin(t * 34 + curve.phase))
        const p = curve.pts[i]
        const a = add(add(p, mul(normal, width)), mul(across, curve.t))
        const b = add(sub(p, mul(normal, width)), mul(across, curve.t))
        const c = sub(sub(p, mul(normal, width)), mul(across, curve.t))
        const d = sub(add(p, mul(normal, width)), mul(across, curve.t))
        const n1 = mul(normal, -1)
        const n2 = mul(across, -1)

        rings.push([
          push(a, across, t, curve),
          push(b, across, t, curve),
          push(b, n1, t, curve),
          push(c, n1, t, curve),
          push(c, n2, t, curve),
          push(d, n2, t, curve),
          push(d, normal, t, curve),
          push(a, normal, t, curve),
        ])

        if (i === 0) {
          firstRing = [a, b, c, d]
          firstTangent = tan
        }
        if (i === length - 1) {
          secondRing = [a, b, c, d]
          lastTangent = tan
        }
      }

      for (let i = 0; i < length - 1; i++) {
        const current = rings[i]
        const next = rings[i + 1]
        for (let side = 0; side < 4; side++) {
          const corner = side * 2
          index.push(
            current[corner],
            current[corner + 1],
            next[corner],
            current[corner + 1],
            next[corner + 1],
            next[corner],
          )
        }
      }

      const cap = (ring: Vec3[], normal: Vec3, across: number) => {
        const quad = ring.map((point) => push(point, normal, across, curve))
        index.push(quad[0], quad[1], quad[2], quad[0], quad[2], quad[3])
      }
      cap(firstRing, mul(firstTangent, -1), 0)
      cap(secondRing, lastTangent, 1)
    } else {
      const sides = curve.kind === 2 ? 10 : 6
      let normal = norm(cross(tangent(curve.pts, 0), curve.kind === 2 ? [0, 0, 1] : curve.lat))
      const ringStarts: number[] = []

      for (let i = 0; i < length; i++) {
        const t = i / (length - 1)
        const tan = tangent(curve.pts, i)
        normal = norm(sub(normal, mul(tan, dot(normal, tan))))
        const bitangent = cross(tan, normal)
        let width = curve.w * (curve.kind === 1 ? 1 - 0.35 * t : 1)
        if (curve.bulb && t > 0.9) {
          width = curve.w * (0.65 + 2.1 * Math.sin(((t - 0.9) / 0.1) * Math.PI * 0.92))
        }
        if (curve.kind === 1 && i === length - 1) width *= 0.3
        ringStarts.push(vertexCount)
        for (let side = 0; side <= sides; side++) {
          const angle = (side / sides) * Math.PI * 2
          const offset = add(mul(normal, Math.cos(angle)), mul(bitangent, Math.sin(angle)))
          push(add(curve.pts[i], mul(offset, width)), offset, t, curve)
        }
      }

      for (let i = 0; i < length - 1; i++) {
        for (let side = 0; side < sides; side++) {
          const a = ringStarts[i] + side
          const b = ringStarts[i + 1] + side
          index.push(a, a + 1, b, a + 1, b + 1, b)
        }
      }
    }
  }

  return {
    data: new Float32Array(data),
    index: new Uint16Array(index),
    vertices: vertexCount,
  }
}

/* -------------------------------------------------------------------------- */
/*  Camera, colour and scenes                                                 */
/* -------------------------------------------------------------------------- */

function perspective(fov: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fov / 2)
  const out = new Float32Array(16)
  out[0] = f / aspect
  out[5] = f
  out[10] = (far + near) / (near - far)
  out[11] = -1
  out[14] = (2 * far * near) / (near - far)
  return out
}

function lookAt(eye: Vec3, target: Vec3) {
  const z = norm(sub(eye, target))
  const x = norm(cross([0, 1, 0], z))
  const y = cross(z, x)
  const out = new Float32Array(16)
  out[0] = x[0]
  out[4] = x[1]
  out[8] = x[2]
  out[1] = y[0]
  out[5] = y[1]
  out[9] = y[2]
  out[2] = z[0]
  out[6] = z[1]
  out[10] = z[2]
  out[12] = -dot(x, eye)
  out[13] = -dot(y, eye)
  out[14] = -dot(z, eye)
  out[15] = 1
  return out
}

function multiply(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      out[row * 4 + col] =
        a[col] * b[row * 4] +
        a[4 + col] * b[row * 4 + 1] +
        a[8 + col] * b[row * 4 + 2] +
        a[12 + col] * b[row * 4 + 3]
    }
  }
  return out
}

function rotateY(angle: number) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return new Float32Array([cos, 0, -sin, 0, 0, 1, 0, 0, sin, 0, cos, 0, 0, 0, 0, 1])
}

function rotateX(angle: number) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return new Float32Array([1, 0, 0, 0, 0, cos, sin, 0, 0, -sin, cos, 0, 0, 0, 0, 1])
}

function hexToLinear(hex: string): Vec3 {
  let value = hex.replace('#', '').trim()
  if (value.length === 3) value = value.split('').map((c) => c + c).join('')
  const parsed = parseInt(value.slice(0, 6), 16)
  if (Number.isNaN(parsed)) return [0.8, 0.02, 0.03]
  const channel = (n: number) => (n / 255) ** 2.2
  return [channel((parsed >> 16) & 255), channel((parsed >> 8) & 255), channel(parsed & 255)]
}

type Pose = { spin: number; el: number; size: number; ox: number; oy: number; stem: number }
type Portrait = { size: number; oy?: number; ox?: number }

const POSES: Pose[] = [
  { spin: 0.2, el: 9, size: 0.86, ox: 0, oy: 0.3, stem: 1 },
  { spin: 1.4, el: 88, size: 0.58, ox: 0, oy: 0, stem: 0 },
  { spin: 2.3, el: 12, size: 0.27, ox: 0, oy: 0.4, stem: 0.3 },
  { spin: 3.1, el: -30, size: 0.86, ox: 0, oy: -0.34, stem: 0.06 },
  { spin: 4.1, el: 16, size: 1.02, ox: 0.66, oy: 0.2, stem: 1 },
  { spin: 5, el: -74, size: 0.86, ox: 0, oy: 1.02, stem: 0.04 },
]

const PORTRAIT_POSES: Portrait[] = [
  { size: 0.9, oy: 0.36 },
  { size: 0.56 },
  { size: 0.34, oy: 0.44 },
  { size: 0.95, oy: -0.2 },
  { size: 0.86, ox: 0.5, oy: 0.46 },
  { size: 0.96, oy: 1 },
]

function poseAt(coord: number, portrait: boolean): Pose {
  const index = Math.max(0, Math.min(POSES.length - 1, Math.floor(coord)))
  const next = Math.min(POSES.length - 1, index + 1)
  const t = coord - index
  const from = { ...POSES[index], ...(portrait ? PORTRAIT_POSES[index] : {}) }
  const to = { ...POSES[next], ...(portrait ? PORTRAIT_POSES[next] : {}) }
  const mix = (a: number, b: number) => a + (b - a) * t
  return {
    spin: mix(from.spin, to.spin),
    el: mix(from.el, to.el),
    size: mix(from.size, to.size),
    ox: mix(from.ox, to.ox),
    oy: mix(from.oy, to.oy),
    stem: mix(from.stem, to.stem),
  }
}

/* -------------------------------------------------------------------------- */
/*  Shaders                                                                   */
/* -------------------------------------------------------------------------- */

const VERTEX_SHADER = `
attribute vec3 a_pos;
attribute vec3 a_nrm;
attribute vec4 a_aux;
attribute vec3 a_base;
uniform mat4 u_vp;
uniform mat4 u_model;
uniform vec2 u_offset;
uniform float u_time;
uniform float u_bloom;
uniform float u_sway;
uniform float u_stem;
varying vec3 v_n;
varying vec3 v_w;
varying float v_s;
void main() {
  vec3 p = a_pos;
  float k = a_aux.z;
  if (k < 1.5) {
    float g = clamp(u_bloom * 1.6 - a_aux.w * 0.6, 0.0, 1.0);
    g = 1.0 - pow(1.0 - g, 3.0);
    p = a_base + (p - a_base) * g;
    float amp = (k < 0.5 ? 0.03 : 0.06) * u_sway * a_aux.x * a_aux.x;
    p += amp * vec3(sin(u_time * 0.9 + a_aux.y), 0.5 * sin(u_time * 1.3 + a_aux.y * 1.7), cos(u_time * 0.7 + a_aux.y * 1.3));
  } else if (p.y < 0.0) {
    p.y *= u_stem;
  }
  vec4 w = u_model * vec4(p, 1.0);
  v_w = w.xyz;
  v_n = (u_model * vec4(a_nrm, 0.0)).xyz;
  v_s = a_aux.x;
  gl_Position = u_vp * w;
  gl_Position.xy += u_offset * gl_Position.w;
}
`

const FRAGMENT_SHADER = `
precision highp float;
uniform vec3 u_eye;
uniform vec3 u_red;
uniform vec3 u_hot;
uniform float u_alpha;
varying vec3 v_n;
varying vec3 v_w;
varying float v_s;
float studio(vec3 r) {
  float key = pow(max(dot(r, normalize(vec3(-0.45, 0.85, 0.35))), 0.0), 14.0) * 2.6;
  float strip = smoothstep(0.55, 0.8, r.x) * smoothstep(-0.7, 0.3, r.y) * 1.4;
  float rim = smoothstep(0.55, 0.95, -r.z) * smoothstep(-0.2, 0.5, r.y) * 0.9;
  float hz = exp(-abs(r.y - 0.05) * 7.0) * 0.4;
  return key + strip + rim + hz;
}
void main() {
  vec3 n = normalize(v_n);
  vec3 v = normalize(u_eye - v_w);
  if (dot(n, v) < 0.0) n = -n;
  vec3 r = reflect(-v, n);
  float e = studio(r);
  float fr = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  float dif = max(dot(n, normalize(vec3(-0.3, 0.8, 0.6))), 0.0);
  vec3 col = u_red * (0.04 + 0.22 * dif);
  col += u_red * e * 1.15;
  col += u_hot * pow(e, 3.0) * 0.3;
  col += u_red * fr * 1.1;
  col *= 0.8 + 0.2 * smoothstep(0.0, 0.25, v_s);
  col = col / (1.0 + col);
  col = pow(col, vec3(1.0 / 2.2));
  gl_FragColor = vec4(col * u_alpha, u_alpha);
}
`

/* -------------------------------------------------------------------------- */
/*  Built geometry                                                            */
/* -------------------------------------------------------------------------- */

const { curves: FLOWER_CURVES, radius: FLOWER_RADIUS } = buildCurves(6, 7)
const FLOWER_MESH = buildMesh(FLOWER_CURVES)

/* -------------------------------------------------------------------------- */
/*  UI fragments                                                              */
/* -------------------------------------------------------------------------- */

const sans: CSSProperties = { fontFamily: SANS_STACK }
const serif: CSSProperties = { fontFamily: FONT_STACK, fontWeight: 400 }
const hidden: CSSProperties = { opacity: 0 }

function revealProps(scene: number, fx: 'rise' | 'fade' | 'clip' | 'draw' | 'line', delay = 0) {
  return { 'data-sc': scene, 'data-fx': fx, 'data-d': delay }
}

function Glyphs({ rows, size, lh = 1.02 }: { rows: string[]; size: CSSProperties['fontSize']; lh?: number }) {
  return (
    <>
      {rows.map((row) => (
        <div key={row} style={{ fontSize: size, lineHeight: lh, whiteSpace: 'nowrap' }}>
          {Array.from(row).map((glyph, index) => (
            <span key={index} className="lys-g" data-g={glyph}>
              {glyph}
            </span>
          ))}
        </div>
      ))}
    </>
  )
}

function SideLabel({ label, side }: { label: string; side: 'l' | 'r' }) {
  return (
    <span
      className="lys-hide-sm"
      style={{
        ...sans,
        position: 'absolute',
        top: '50%',
        [side === 'l' ? 'right' : 'left']: 'calc(100% + 16px)',
        fontSize: 8,
        letterSpacing: '0.25em',
        opacity: 0.55,
        lineHeight: 1,
        transform: `translate(${side === 'l' ? '50%' : '-50%'},-50%) rotate(${side === 'l' ? -90 : 90}deg)`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function FootLink({ link }: { link: { label: string; href?: string } }) {
  const style: CSSProperties = { color: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap' }
  if (!link.href) return <span style={style}>{link.label}</span>
  return (
    <a href={link.href} target="_blank" rel="noreferrer" style={style}>
      {link.label}
    </a>
  )
}

function Mark({ color, accent }: { color: string; accent: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden style={{ flex: 'none' }}>
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <path
          key={angle}
          d="M20 20 C 22 12, 30 8, 33 12 C 35 15, 31 17, 29 14"
          fill="none"
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
          transform={`rotate(${angle} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="2.6" fill={accent} />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  GL helpers                                                                */
/* -------------------------------------------------------------------------- */

type Uniforms = Record<string, WebGLUniformLocation | null>

function useSpecimen() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const bloomRef = useRef<HTMLDivElement | null>(null)
  const wordRef = useRef<HTMLDivElement | null>(null)
  const [reduced, setReduced] = useState(false)
  const [activeScene, setActiveScene] = useState(0)
  const [glyph, setGlyph] = useState<string | null>(null)
  const [ligatures, setLigatures] = useState(true)
  const settings = useRef({ reduced: false })

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    settings.current.reduced = reduced
  }, [reduced])

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const canvas = canvasRef.current
    const bloom = bloomRef.current
    const word = wordRef.current
    if (!section || !stage || !canvas || !bloom || !word) return

    const chars = Array.from(word.querySelectorAll<HTMLElement>('[data-ch]'))

    let gl: WebGLRenderingContext | null = null
    let ctx2d: CanvasRenderingContext2D | null = null
    let program: WebGLProgram | null = null
    let positionBuffer: WebGLBuffer | null = null
    let indexBuffer: WebGLBuffer | null = null
    const uniforms: Uniforms = {}

    const compile = (type: number, source: string) => {
      const shader = gl!.createShader(type)
      if (!shader) return null
      gl!.shaderSource(shader, source)
      gl!.compileShader(shader)
      return gl!.getShaderParameter(shader, gl!.COMPILE_STATUS) ? shader : null
    }

    const initGL = () => {
      gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true })
      if (!gl) return false
      const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER)
      const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
      if (!vertex || !fragment) return false
      program = gl.createProgram()
      if (!program) return false
      gl.attachShader(program, vertex)
      gl.attachShader(program, fragment)
      gl.linkProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false
      gl.useProgram(program)

      positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, FLOWER_MESH.data, gl.STATIC_DRAW)
      indexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, FLOWER_MESH.index, gl.STATIC_DRAW)

      const attribute = (name: string, size: number, offset: number) => {
        const location = gl!.getAttribLocation(program!, name)
        if (location < 0) return
        gl!.enableVertexAttribArray(location)
        gl!.vertexAttribPointer(location, size, gl!.FLOAT, false, STRIDE * 4, offset * 4)
      }
      attribute('a_pos', 3, 0)
      attribute('a_nrm', 3, 3)
      attribute('a_aux', 4, 6)
      attribute('a_base', 3, 10)

      for (const name of ['u_vp', 'u_model', 'u_offset', 'u_time', 'u_bloom', 'u_sway', 'u_stem', 'u_eye', 'u_red', 'u_hot', 'u_alpha']) {
        uniforms[name] = gl.getUniformLocation(program, name)
      }
      gl.enable(gl.DEPTH_TEST)
      gl.clearColor(0, 0, 0, 0)
      return true
    }

    if (!initGL()) {
      gl = null
      ctx2d = canvas.getContext('2d')
    }

    const onLost = (event: Event) => {
      event.preventDefault()
      gl = null
    }
    const onRestored = () => {
      if (!initGL()) gl = null
    }
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    let width = 1
    let height = 1
    let dpr = 1
    let centers: { x: number; y: number; w: number }[] = []

    const measure = () => {
      const rect = stage.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const pixelWidth = Math.round(width * dpr)
      const pixelHeight = Math.round(height * dpr)
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
      }
      const previous = chars.map((el) => el.style.transform)
      chars.forEach((el) => {
        el.style.transform = 'none'
      })
      centers = chars.map((el) => {
        const box = el.getBoundingClientRect()
        return { x: box.left + box.width / 2 - rect.left, y: box.top + box.height / 2 - rect.top, w: box.width }
      })
      chars.forEach((el, i) => {
        el.style.transform = previous[i]
      })
    }
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(stage)
    measure()

    const fontSet = document.fonts
    const onFonts = () => measure()
    fontSet?.addEventListener('loadingdone', onFonts)
    void fontSet?.ready.then(onFonts)

    const revealItems = Array.from(stage.querySelectorAll<HTMLElement>('[data-sc]')).map((el) => ({
      el,
      scene: Number(el.dataset.sc),
      fx: el.dataset.fx ?? 'rise',
      delay: Number(el.dataset.d) || 0,
      last: -1,
    }))

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    let spin = 0
    let spinVelocity = 0
    let drag: { id: number; x: number } | null = null

    const onMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect()
      pointer.tx = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.ty = ((event.clientY - rect.top) / rect.height) * 2 - 1
      if (drag && drag.id === event.pointerId) {
        spinVelocity += (event.clientX - drag.x) * 0.0022
        drag.x = event.clientX
      }
    }
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      if ((event.target as HTMLElement).closest('a,button,[contenteditable],.lys-g')) return
      drag = { id: event.pointerId, x: event.clientX }
      stage.style.cursor = 'grabbing'
    }
    const onUp = () => {
      drag = null
      stage.style.cursor = ''
    }
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

    let frameId = 0
    let running = false
    let visible = true
    let rafTicks = 0
    let lastTime = performance.now()
    const startedAt = lastTime
    let clock = 0
    let progress = -1
    let sceneIndex = -1

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now
      const animated = !settings.current.reduced
      if (animated) clock += dt

      const rect = section.getBoundingClientRect()
      const target = progressFrom(rect.top, rect.height, height)
      progress = progress < 0 || settings.current.reduced ? target : progress + (target - progress) * (1 - Math.exp(-dt * 9))

      const coord = sceneCoord(progress, POSES.length, 0.34)
      const rounded = Math.round(coord)
      if (rounded !== sceneIndex) {
        sceneIndex = rounded
        setActiveScene(rounded)
      }

      const portrait = height > width * 1.05
      const pose = poseAt(coord, portrait)

      pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 4))
      pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 4))
      if (animated) {
        spin += spinVelocity + dt * 0.1
        spinVelocity *= Math.exp(-dt * 3)
      } else {
        spin += spinVelocity
        spinVelocity = 0
      }
      const pointerSpin = animated ? pointer.x : 0
      const pointerTilt = animated ? pointer.y : 0

      const fov = (30 * Math.PI) / 180
      const base = Math.min(width, height)
      const distance = (FLOWER_RADIUS * height) / (pose.size * base * Math.tan(fov / 2))
      const elevation = Math.max(-88, Math.min(88, pose.el + pointerTilt * 9)) * (Math.PI / 180)
      const eye: Vec3 = [ORIGIN[0], ORIGIN[1] + Math.sin(elevation) * distance, ORIGIN[2] + Math.cos(elevation) * distance]

      const projection = perspective(fov, width / height, Math.max(0.05, distance - 6), distance + 8)
      const viewProjection = multiply(projection, lookAt(eye, ORIGIN))
      const model = multiply(rotateY(pose.spin + spin + pointerSpin * 0.35), rotateX(pointerTilt * 0.05))
      const bloomProgress = settings.current.reduced ? 1 : clamp01((now - startedAt) / 2600)

      const bloomX = (0.5 + pose.ox / 2) * width
      const bloomY = (0.5 - pose.oy / 2) * height
      const bloomSize = pose.size * base * 1.25
      bloom.style.transform = `translate(${(bloomX - bloomSize).toFixed(1)}px,${(bloomY - bloomSize).toFixed(1)}px)`
      bloom.style.width = bloom.style.height = `${(bloomSize * 2).toFixed(1)}px`

      if (gl && program) {
        const context = gl
        context.viewport(0, 0, canvas.width, canvas.height)
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)
        const red = hexToLinear(CRIMSON)
        context.uniformMatrix4fv(uniforms.u_vp, false, viewProjection)
        context.uniformMatrix4fv(uniforms.u_model, false, model)
        context.uniform2f(uniforms.u_offset, pose.ox, pose.oy)
        context.uniform1f(uniforms.u_time, clock)
        context.uniform1f(uniforms.u_bloom, bloomProgress)
        context.uniform1f(uniforms.u_sway, animated ? 1 : 0)
        context.uniform1f(uniforms.u_stem, pose.stem)
        context.uniform3f(uniforms.u_eye, eye[0], eye[1], eye[2])
        context.uniform3f(uniforms.u_red, red[0] * 2.2, red[1] * 2.2, red[2] * 2.2)
        context.uniform3f(uniforms.u_hot, 1, 0.55 + red[1], 0.5 + red[2])
        context.uniform1f(uniforms.u_alpha, 1)
        context.drawElements(context.TRIANGLES, FLOWER_MESH.index.length, context.UNSIGNED_SHORT, 0)
      } else if (ctx2d) {
        const matrix = multiply(viewProjection, model)
        const pen = ctx2d
        pen.setTransform(dpr, 0, 0, dpr, 0, 0)
        pen.clearRect(0, 0, width, height)
        pen.lineCap = 'round'
        pen.strokeStyle = CRIMSON
        pen.shadowColor = CRIMSON
        pen.shadowBlur = 12
        for (const curve of FLOWER_CURVES) {
          pen.beginPath()
          curve.pts.forEach((point, i) => {
            const y = curve.kind === 2 && point[1] < 0 ? point[1] * pose.stem : point[1]
            const x = matrix[0] * point[0] + matrix[4] * y + matrix[8] * point[2] + matrix[12]
            const py = matrix[1] * point[0] + matrix[5] * y + matrix[9] * point[2] + matrix[13]
            const w = matrix[3] * point[0] + matrix[7] * y + matrix[11] * point[2] + matrix[15]
            const sx = ((x / w + pose.ox) * 0.5 + 0.5) * width
            const sy = (0.5 - (py / w + pose.oy) * 0.5) * height
            if (i === 0) pen.moveTo(sx, sy)
            else pen.lineTo(sx, sy)
          })
          pen.lineWidth = curve.kind === 0 ? (base * pose.size) / 22 : curve.kind === 1 ? 1.2 : 3
          pen.stroke()
        }
      }

      // Scene reveals.
      const noMotion = settings.current.reduced
      for (const item of revealItems) {
        const value = reveal(coord, item.scene, item.delay)
        const roundedValue = Math.round(value * 500) / 500
        if (roundedValue === item.last) continue
        item.last = roundedValue
        const style = item.el.style
        const direction = coord < item.scene ? 1 : -1
        style.visibility = roundedValue <= 0 ? 'hidden' : ''
        if (item.fx === 'draw') {
          style.setProperty('--v', String(roundedValue))
          style.opacity = String(Math.min(1, roundedValue * 3))
          continue
        }
        if (item.fx === 'line') {
          style.transform = `scaleX(${roundedValue})`
          style.opacity = String(Math.min(1, roundedValue * 2))
          continue
        }
        style.opacity = String(roundedValue)
        if (noMotion || item.fx === 'fade') continue
        if (item.fx === 'clip') {
          const offset = ((1 - roundedValue) * 100).toFixed(1)
          style.clipPath = direction > 0 ? `inset(0 0 ${offset}% 0)` : `inset(${offset}% 0 0 0)`
          style.transform = `translateY(${((1 - roundedValue) * 0.4 * direction).toFixed(3)}em)`
        } else {
          style.transform = `translateY(${((1 - roundedValue) * 34 * direction).toFixed(1)}px)`
          style.filter = roundedValue > 0.995 ? '' : `blur(${((1 - roundedValue) * 8).toFixed(1)}px)`
        }
      }

      // The display word drifts together as the cover hands over to the flower.
      const converge = easeInOut(clamp01(coord))
      const fadeOut = clamp01(coord - 1)
      const portraitStart = poseAt(1, portrait)
      const startSize = portraitStart.size * base * 0.5
      const startY = (0.5 - portraitStart.oy / 2) * height

      chars.forEach((el, i) => {
        const box = centers[i]
        if (!box) return
        if ((i === 0 || i === chars.length - 1) && chars.length > 1) {
          const direction = i === 0 ? -1 : 1
          const toCenter = (width / 2 + direction * (startSize + box.w * 0.55 + base * 0.02) - box.x) * converge
          const toY = (startY - box.y) * converge - fadeOut * 60
          const opacity = coord < 1 ? 1 : 1 - smoothstep(0.1, 0.45, fadeOut)
          el.style.transform = `translate(${toCenter.toFixed(1)}px,${toY.toFixed(1)}px)`
          el.style.opacity = String(opacity)
          el.style.filter = noMotion || fadeOut < 0.05 ? '' : `blur(${(fadeOut * 14).toFixed(1)}px)`
        } else {
          const toX = (width / 2 - box.x) * converge * 0.75
          const toY = (startY - box.y) * converge
          const opacity = 1 - smoothstep(0, 0.4, converge)
          el.style.transform = noMotion
            ? ''
            : `translate(${toX.toFixed(1)}px,${toY.toFixed(1)}px) scale(${(1 - converge * 0.7).toFixed(3)})`
          el.style.opacity = String(opacity)
          el.style.filter = noMotion || converge < 0.02 ? '' : `blur(${(converge * 12).toFixed(1)}px)`
        }
        el.style.visibility = coord > 1.6 ? 'hidden' : ''
      })
    }

    const tick = (now: number) => {
      rafTicks++
      frameId = requestAnimationFrame(tick)
      draw(now)
    }
    const start = () => {
      if (running || !visible || document.hidden) return
      running = true
      lastTime = performance.now()
      frameId = requestAnimationFrame(tick)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(frameId)
    }

    // Paint one immediate frame so the specimen is present even before the
    // first animation tick. If animation frames are throttled (background tabs,
    // screenshot runners) a delayed redraw still lands on the bloomed flower.
    draw(performance.now())
    const fallbackDraw = window.setTimeout(() => {
      if (!rafTicks) draw(performance.now())
    }, 2800)

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    observer.observe(section)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)
    start()

    return () => {
      stop()
      window.clearTimeout(fallbackDraw)
      observer.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      fontSet?.removeEventListener('loadingdone', onFonts)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      if (gl) {
        if (positionBuffer) gl.deleteBuffer(positionBuffer)
        if (indexBuffer) gl.deleteBuffer(indexBuffer)
        if (program) gl.deleteProgram(program)
      }
    }
  }, [])

  const jump = (index: number) => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return
    const rect = section.getBoundingClientRect()
    const scrollable = rect.height - stage.clientHeight
    const top = (index / (POSES.length - 1)) * scrollable + rect.top
    let parent = section.parentElement
    while (parent && parent !== document.body) {
      const overflow = getComputedStyle(parent).overflowY
      if ((overflow === 'auto' || overflow === 'scroll') && parent.scrollHeight > parent.clientHeight) break
      parent = parent.parentElement
    }
    const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth'
    if (parent && parent !== document.body) parent.scrollBy({ top, behavior })
    else window.scrollBy({ top, behavior })
  }

  return {
    sectionRef,
    stageRef,
    canvasRef,
    bloomRef,
    wordRef,
    reduced,
    activeScene,
    glyph,
    setGlyph,
    ligatures,
    setLigatures,
    jump,
  }
}

/* -------------------------------------------------------------------------- */
/*  Specimen                                                                  */
/* -------------------------------------------------------------------------- */

export default function InzeedoSpecimen({ thumbnail = false }: { thumbnail?: boolean }) {
  const {
    sectionRef,
    stageRef,
    canvasRef,
    bloomRef,
    wordRef,
    activeScene,
    glyph,
    setGlyph,
    ligatures,
    setLigatures,
    jump,
  } = useSpecimen()

  const chars = Array.from(NAME)
  const multilingual = MULTILINGUAL.split('·')

  const onPointerOver = (event: ReactPointerEvent<HTMLDivElement>) => {
    const value = (event.target as HTMLElement).dataset?.g
    if (value) setGlyph(value)
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{
        height: thumbnail ? '100svh' : `calc(100svh * ${(1 + (POSES.length - 1) * 1.2).toFixed(3)})`,
        background: INK,
      }}
      aria-label={`${NAME} typeface specimen`}
    >
      <style>{COMPONENT_CSS}</style>
      <div
        ref={stageRef}
        className="lys-stage sticky top-0 w-full overflow-hidden select-none"
        style={
          {
            height: '100svh',
            color: BONE,
            background: INK,
            '--lys-red': CRIMSON,
            ...(thumbnail ? { position: 'relative', top: 0 } : null),
          } as CSSProperties
        }
        onPointerOver={onPointerOver}
        onPointerLeave={() => setGlyph(null)}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(120% 90% at 50% 45%, transparent 55%, ${BONE}14 100%)` }}
        />
        <div
          ref={bloomRef}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 rounded-full"
          style={{
            background: `radial-gradient(closest-side, ${CRIMSON}3d, ${CRIMSON}12 45%, transparent 100%)`,
            willChange: 'transform',
          }}
        />
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 block"
          style={{ width: '100%', height: '100%', maxWidth: 'none' }}
        />

        {/* Scene 01 — cover */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute flex items-start justify-between gap-6" style={{ left: '5cqw', right: '5cqw', top: '5cqh' }}>
            <div
              {...revealProps(0, 'clip', 0)}
              style={{
                ...serif,
                ...hidden,
                fontSize: 'clamp(20px, 3.3cqw, 46px)',
                lineHeight: 0.88,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {NAME}
              <br />
              Typeface
            </div>
            <p
              {...revealProps(0, 'rise', 0.2)}
              className="lys-hide-md"
              style={{
                ...serif,
                ...hidden,
                maxWidth: '25cqw',
                fontSize: 'clamp(10px, 0.95cqw, 13px)',
                lineHeight: 1.35,
                margin: 0,
                textAlign: 'justify',
              }}
            >
              {DESCRIPTION}
            </p>
            <ul
              {...revealProps(0, 'rise', 0.35)}
              className="lys-hide-md"
              style={{
                ...serif,
                ...hidden,
                listStyle: 'none',
                margin: 0,
                padding: 0,
                fontSize: 'clamp(10px, 0.95cqw, 13px)',
                lineHeight: 1.35,
              }}
            >
              {SPECS.map((spec) => (
                <li key={spec}>{spec}</li>
              ))}
            </ul>
            <div
              {...revealProps(0, 'clip', 0.5)}
              className="lys-hide-sm"
              style={{
                ...serif,
                ...hidden,
                fontSize: 'clamp(18px, 2.6cqw, 38px)',
                lineHeight: 0.9,
                textAlign: 'right',
                textTransform: 'uppercase',
              }}
            >
              Fancy
              <br />
              Vintage
              <br />
              Serif
            </div>
          </div>

          <div
            ref={wordRef}
            className="absolute whitespace-nowrap"
            style={{
              ...serif,
              left: '50%',
              top: '61%',
              transform: 'translate(-50%, -50%)',
              fontSize: 'min(21cqw, 33cqh)',
              lineHeight: 1,
            }}
          >
            <span
              {...revealProps(0, 'rise', 0.6)}
              style={{ ...hidden, position: 'absolute', right: '0.04em', bottom: '84%', fontSize: '0.36em' }}
            >
              Font
            </span>
            <h2
              style={{ margin: 0, font: 'inherit', fontFeatureSettings: '"liga" 1' }}
              aria-label={NAME}
            >
              {chars.map((char, index) => (
                <span
                  key={index}
                  data-ch
                  className="inline-block"
                  style={{ willChange: 'transform' }}
                  aria-hidden
                >
                  <span className="lys-char" style={{ animationDelay: `${0.15 + index * 0.07}s` }}>
                    {char === ' ' ? '\u00a0' : char}
                  </span>
                </span>
              ))}
            </h2>
          </div>

          <div className="absolute flex items-end justify-between gap-6" style={{ left: '5cqw', right: '5cqw', bottom: '5cqh' }}>
            <div {...revealProps(0, 'rise', 0.3)} className="flex items-center gap-3" style={hidden}>
              <Mark color={BONE} accent={CRIMSON} />
              <span
                style={{
                  ...sans,
                  fontSize: 'clamp(20px, 2.4cqw, 34px)',
                  letterSpacing: '-0.02em',
                  fontWeight: 300,
                }}
              >
                {YEAR}
              </span>
              <span
                style={{
                  ...sans,
                  fontSize: 9,
                  lineHeight: 1.2,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${BONE}80`,
                  paddingBottom: 6,
                  paddingRight: '6cqw',
                }}
              >
                Manufactured by
                <br />
                {STUDIO}
              </span>
            </div>
            <div
              {...revealProps(0, 'rise', 0.5)}
              className="lys-hide-sm flex gap-5"
              style={{
                ...sans,
                ...hidden,
                color: CRIMSON,
                fontSize: 8,
                lineHeight: 1.25,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              <span>
                {NAME}
                <br />
                Typeface
              </span>
              <span>
                Fancy
                <br />
                Vintage serif
              </span>
              <span>
                Designed by
                <br />
                {STUDIO}
              </span>
              <span>
                {YEAR}
                <br />
                Specimen
              </span>
            </div>
          </div>
        </div>

        {/* Scene 02 — crown */}
        <div className="pointer-events-none absolute inset-0">
          <div
            {...revealProps(1, 'fade', 0.5)}
            className="absolute"
            style={{
              ...serif,
              ...hidden,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%,-50%)',
              fontSize: 'clamp(10px, 1.1cqw, 14px)',
            }}
          >
            {NAME}
          </div>
          <div
            {...revealProps(1, 'rise', 0.7)}
            className="absolute"
            style={{
              ...sans,
              ...hidden,
              left: '5cqw',
              bottom: '5cqh',
              fontSize: 9,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ color: CRIMSON }}>02</span>
            {' — The crown, from above'}
          </div>
        </div>

        {/* Scene 03 — specimen */}
        <div className="pointer-events-none absolute inset-0" style={serif}>
          <div
            className="lys-spec pointer-events-auto absolute grid items-center"
            style={{
              left: '6cqw',
              right: '6cqw',
              top: '12cqh',
              bottom: '20cqh',
              gridTemplateColumns: '1fr min(30cqw, 34cqh) 1fr',
              columnGap: '2cqw',
            }}
          >
            <div className="relative flex flex-col gap-[2.4cqh]">
              <div {...revealProps(2, 'clip', 0)} style={hidden} className="relative">
                <SideLabel label="UPPERCASE" side="l" />
                <Glyphs rows={UPPER_LEFT} size="min(9cqw, 7.4cqh)" />
              </div>
              <div {...revealProps(2, 'clip', 0.15)} style={hidden} className="relative">
                <SideLabel label="LOWERCASE" side="l" />
                <Glyphs rows={LOWER_LEFT} size="min(6.6cqw, 5.4cqh)" />
              </div>
              <div {...revealProps(2, 'clip', 0.3)} style={hidden} className="relative">
                <SideLabel label="ACCENTS" side="l" />
                <Glyphs rows={ACCENT_LEFT} size="min(3.8cqw, 3.2cqh)" lh={1.3} />
              </div>
            </div>

            <div className="lys-spec-mid relative h-full text-center">
              <div
                {...revealProps(2, 'rise', 0.35)}
                className="absolute w-full"
                style={{ ...hidden, top: '34%', fontSize: 'min(2.6cqw, 3.6cqh)', lineHeight: 1 }}
              >
                {NAME}
                <div style={{ fontSize: '0.5em' }}>Typeface</div>
              </div>
              <div
                {...revealProps(2, 'rise', 0.45)}
                className="absolute w-full"
                style={{ ...hidden, top: '52%', lineHeight: 1.05 }}
              >
                <div
                  style={{
                    fontSize: glyph ? 'min(9cqw, 12cqh)' : 'min(2.8cqw, 3.8cqh)',
                    color: glyph ? CRIMSON : undefined,
                    transition: 'font-size .35s cubic-bezier(.2,.8,.2,1)',
                  }}
                >
                  {glyph ?? '& ?'}
                </div>
                <div
                  style={{
                    ...sans,
                    fontSize: 8,
                    letterSpacing: '0.25em',
                    opacity: 0.6,
                    minHeight: '1.3em',
                  }}
                >
                  {glyph ? `U+${(glyph.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}` : 'HOVER A GLYPH'}
                </div>
                {!glyph && <Glyphs rows={FIGURES} size="min(2.2cqw, 3cqh)" />}
              </div>
            </div>

            <div className="relative flex flex-col items-end gap-[2.4cqh] text-right">
              <div {...revealProps(2, 'clip', 0.1)} style={hidden} className="relative">
                <SideLabel label="UPPERCASE" side="r" />
                <Glyphs rows={UPPER_RIGHT} size="min(9cqw, 7.4cqh)" />
              </div>
              <div {...revealProps(2, 'clip', 0.25)} style={hidden} className="relative">
                <SideLabel label="LOWERCASE" side="r" />
                <Glyphs rows={LOWER_RIGHT} size="min(6.6cqw, 5.4cqh)" />
              </div>
              <div {...revealProps(2, 'clip', 0.4)} style={hidden} className="relative">
                <SideLabel label="ACCENTS" side="r" />
                <Glyphs rows={ACCENT_RIGHT} size="min(3.8cqw, 3.2cqh)" lh={1.3} />
              </div>
            </div>
          </div>

          <div
            {...revealProps(2, 'line', 0.5)}
            className="absolute"
            style={{ ...hidden, left: '6cqw', right: '6cqw', bottom: '15.5cqh', height: 1, background: `${BONE}40`, transformOrigin: 'left' }}
          />
          <div
            {...revealProps(2, 'rise', 0.6)}
            className="pointer-events-auto absolute text-center"
            style={{
              ...hidden,
              left: '6cqw',
              right: '6cqw',
              bottom: '8cqh',
              fontSize: 'min(4.2cqw, 3.4cqh)',
              overflowWrap: 'anywhere',
            }}
          >
            <Glyphs rows={[PUNCTUATION]} size="inherit" />
          </div>
        </div>

        {/* Scene 04 — fancy */}
        <div className="pointer-events-none absolute inset-0" style={serif}>
          <div
            className="absolute text-center"
            style={{
              left: '50%',
              top: '13cqh',
              transform: 'translateX(-50%)',
              fontSize: 'min(16cqw, 12.5cqh)',
              lineHeight: 0.9,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              {...revealProps(3, 'fade', 0.3)}
              style={{ ...hidden, position: 'absolute', right: '100%', top: '0.35em', fontSize: '0.12em', marginRight: '1.2em', textTransform: 'none' }}
            >
              {NAME}
            </span>
            <span
              {...revealProps(3, 'fade', 0.4)}
              style={{ ...hidden, position: 'absolute', left: '100%', top: '0.35em', fontSize: '0.12em', marginLeft: '1.2em', textTransform: 'none' }}
            >
              Typeface
            </span>
            <div {...revealProps(3, 'clip', 0)} style={hidden}>
              Fancy
            </div>
            <div {...revealProps(3, 'clip', 0.15)} style={hidden}>
              Vintage
            </div>
            <div {...revealProps(3, 'clip', 0.3)} style={hidden}>
              Serif
            </div>
          </div>
          <div className="absolute flex justify-center" style={{ left: 0, right: 0, bottom: '5cqh' }}>
            <div
              {...revealProps(3, 'rise', 0.6)}
              style={{
                ...sans,
                ...hidden,
                fontSize: 9,
                letterSpacing: '0.9em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                paddingLeft: '0.9em',
              }}
            >
              {STUDIO}
            </div>
          </div>
        </div>

        {/* Scene 05 — bloom */}
        <div className="pointer-events-none absolute inset-0" style={serif}>
          <div
            className="lys-bloom pointer-events-auto absolute"
            style={{ left: '9cqw', top: '34cqh', fontSize: 'min(9.5cqw, 13cqh)', lineHeight: 0.82 }}
          >
            {TAGLINE.map((line, index) => (
              <div
                key={index}
                {...revealProps(4, 'clip', index * 0.14)}
                style={{
                  ...hidden,
                  fontSize: line.small ? '0.4em' : undefined,
                  lineHeight: line.small ? 1.1 : undefined,
                  marginLeft: line.small
                    ? index < 2
                      ? '5.2em'
                      : '4.2em'
                    : index > 1
                      ? '0.45em'
                      : 0,
                  marginTop: line.small ? '-0.1em' : 0,
                  marginBottom: line.small ? '0.25em' : 0,
                }}
              >
                <span className="lys-edit" contentEditable spellCheck={false} suppressContentEditableWarning>
                  {line.text}
                </span>
              </div>
            ))}
            <div
              {...revealProps(4, 'rise', 0.7)}
              style={{
                ...sans,
                ...hidden,
                fontSize: 9,
                letterSpacing: '0.25em',
                marginTop: '3cqh',
                opacity: 0.7,
                textTransform: 'uppercase',
              }}
            >
              {NAME} — click the words, type your own
            </div>
          </div>
        </div>

        {/* Scene 06 — ligatures */}
        <div className="pointer-events-none absolute inset-0" style={serif}>
          <div className="lys-fin absolute flex items-center justify-around" style={{ left: '4cqw', right: '4cqw', top: '50cqh' }}>
            <div className="pointer-events-auto relative text-center">
              <div
                {...revealProps(5, 'fade', 0.1)}
                style={{ ...hidden, fontSize: 'clamp(9px, 0.9cqw, 12px)', marginBottom: '1.2cqh' }}
              >
                3 ligatures in 1 OpenType feature
              </div>
              <button
                type="button"
                {...revealProps(5, 'clip', 0)}
                onClick={() => setLigatures((value) => !value)}
                aria-pressed={ligatures}
                title="Toggle ligatures"
                className="relative block"
                style={{
                  ...hidden,
                  font: 'inherit',
                  color: 'inherit',
                  background: 'none',
                  border: 0,
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: 'min(10cqw, 13cqh)',
                  lineHeight: 1,
                  fontFeatureSettings: ligatures ? '"liga" 1, "dlig" 1' : '"liga" 0',
                  fontVariantLigatures: ligatures ? 'common-ligatures discretionary-ligatures' : 'none',
                  letterSpacing: ligatures ? '0' : '0.02em',
                  transition: 'letter-spacing .4s',
                }}
              >
                {LIGATURE_WORD}
                <svg
                  {...revealProps(5, 'draw', 0.2)}
                  aria-hidden
                  viewBox="0 0 100 100"
                  style={{
                    ...hidden,
                    position: 'absolute',
                    left: '44%',
                    top: '50%',
                    width: '1.3em',
                    height: '1.3em',
                    transform: 'translate(-50%,-46%)',
                    overflow: 'visible',
                    pointerEvents: 'none',
                  }}
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke={CRIMSON}
                    strokeWidth="1.3"
                    pathLength={1}
                    strokeDasharray="1"
                    style={{ strokeDashoffset: 'calc(1 - var(--v, 0))' }}
                  />
                  <path
                    d="M2 50H98M50 50V98"
                    fill="none"
                    stroke={CRIMSON}
                    strokeWidth="1.3"
                    pathLength={1}
                    strokeDasharray="1"
                    style={{ strokeDashoffset: 'calc(1 - var(--v, 0))' }}
                  />
                </svg>
              </button>
              <div
                {...revealProps(5, 'rise', 0.4)}
                className="flex justify-center gap-[3cqw]"
                style={{ ...hidden, marginTop: '2.4cqh' }}
              >
                {['ff', 'fi', 'fl'].map((ligature) => (
                  <div key={ligature} className="grid items-baseline" style={{ gridTemplateColumns: 'auto auto', columnGap: 8 }}>
                    <span style={{ fontSize: 9, opacity: 0.7 }}>Ligature</span>
                    <span style={{ fontSize: 'min(2.4cqw, 3.4cqh)', fontFeatureSettings: '"liga" 1' }}>{ligature}</span>
                    <span style={{ fontSize: 9, opacity: 0.7 }}>Components</span>
                    <span style={{ fontSize: 'min(2.4cqw, 3.4cqh)', fontVariantLigatures: 'none', letterSpacing: '0.12em' }}>
                      {ligature}
                    </span>
                  </div>
                ))}
              </div>
              <div {...revealProps(5, 'fade', 0.6)} style={{ ...hidden, fontSize: 10, marginTop: '1.6cqh', opacity: 0.7 }}>
                {NAME}
              </div>
            </div>

            <div className="pointer-events-auto relative">
              <div {...revealProps(5, 'fade', 0.3)} style={{ ...hidden, fontSize: 'clamp(10px, 1cqw, 13px)' }}>
                {NAME}
              </div>
              <div
                {...revealProps(5, 'clip', 0.35)}
                style={{ ...hidden, fontSize: 'min(7cqw, 9.5cqh)', lineHeight: 1, whiteSpace: 'nowrap' }}
              >
                <span className="lys-edit" contentEditable spellCheck={false} suppressContentEditableWarning>
                  {multilingual.map((part, index) => (
                    <span key={index}>
                      {index > 0 && <span style={{ color: CRIMSON }}>·</span>}
                      {part}
                    </span>
                  ))}
                </span>
              </div>
              <div
                {...revealProps(5, 'fade', 0.5)}
                style={{ ...hidden, fontSize: 'clamp(10px, 1cqw, 13px)', textAlign: 'right' }}
              >
                Font
              </div>
            </div>
          </div>

          <div
            {...revealProps(5, 'rise', 0.75)}
            className="pointer-events-auto absolute flex items-center justify-between gap-4"
            style={{
              ...sans,
              ...hidden,
              left: '5cqw',
              right: '5cqw',
              bottom: '4.5cqh',
              fontSize: 'clamp(10px, 1.5cqw, 20px)',
              letterSpacing: '0.04em',
              color: BONE,
            }}
          >
            <FootLink link={LINKS[0]} />
            <Mark color={CRIMSON} accent={BONE} />
            <FootLink link={LINKS[1]} />
          </div>
        </div>

        {/* Frame navigation */}
        <nav
          aria-label="Specimen frames"
          className="lys-nav lys-hide-sm absolute flex flex-col items-end"
          style={{
            ...sans,
            right: '2cqw',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 9,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          {SCENES.map((scene, index) => (
            <button
              key={scene}
              type="button"
              onClick={() => jump(index)}
              aria-current={activeScene === index ? 'step' : undefined}
            >
              <span className="lys-lab">
                {String(index + 1).padStart(2, '0')} {scene}
              </span>
              <span className="lys-tick" />
            </button>
          ))}
        </nav>

        {/* Film grain */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0"
          width="100%"
          height="100%"
          style={{ opacity: 0.09, mixBlendMode: 'screen' }}
        >
          <filter id="lys-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#lys-grain)" />
        </svg>
      </div>
    </section>
  )
}
