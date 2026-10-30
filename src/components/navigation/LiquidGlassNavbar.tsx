import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'

export const meta = {
  title: 'Liquid Glass Navbar',
  description:
    'A pill navigation made of real liquid glass: a WebGL droplet glides between items, splits into beads, ripples on click and refracts the background through an SVG filter.',
  fullWidth: true,
}

/* -------------------------------------------------------------------------- */
/*  Inline styles, shaders and helpers extracted from the original component  */
/* -------------------------------------------------------------------------- */

const PAD = 14

const STYLE = `
.nimbus-nav{--n-tint:rgba(255,255,255,.14);--n-fg:#0B132B;--n-fg-soft:rgba(11,19,43,.6);--n-rim:rgba(255,255,255,.7);
  position:relative;display:inline-flex;align-items:center;gap:2px;padding:6px;border-radius:999px;isolation:isolate;
  font-family:ui-sans-serif,-apple-system,"SF Pro Text","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased;user-select:none;-webkit-tap-highlight-color:transparent}
.nimbus-nav[data-tone="dark"]{--n-tint:rgba(10,18,40,.26);--n-fg:#F1F7FF;--n-fg-soft:rgba(241,247,255,.66);--n-rim:rgba(255,255,255,.34)}
.nimbus-glass{position:absolute;inset:0;border-radius:inherit;z-index:-2;overflow:hidden;background:var(--n-tint);
  -webkit-backdrop-filter:blur(10px) saturate(1.2) brightness(1.08);backdrop-filter:blur(10px) saturate(1.2) brightness(1.08);
  box-shadow:inset 0 1px 1px var(--n-rim),inset 0 0 0 1px rgba(255,255,255,.2),0 12px 32px -14px rgba(0,40,90,.5),0 2px 6px rgba(0,40,90,.1)}
.nimbus-nav[data-refract="on"] .nimbus-glass{-webkit-backdrop-filter:url(#nimbus-refract) blur(2px) saturate(1.2) brightness(1.08);backdrop-filter:url(#nimbus-refract) blur(2px) saturate(1.2) brightness(1.08)}
.nimbus-water{position:absolute;left:-14px;top:-14px;z-index:-1;pointer-events:none}
.nimbus-nav[data-gl="off"] .nimbus-water{display:none}
.nimbus-drop{display:none;position:absolute;top:6px;bottom:6px;left:0;border-radius:999px;z-index:-1;pointer-events:none;will-change:transform,width;
  background:radial-gradient(120% 140% at 30% 0%,rgba(255,255,255,.75),rgba(255,255,255,0) 55%),rgba(255,255,255,.38);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.95),inset 0 -2px 6px rgba(0,162,255,.22),inset 0 0 0 1px rgba(255,255,255,.55),0 6px 16px -6px rgba(0,70,140,.45)}
.nimbus-nav[data-gl="off"] .nimbus-drop{display:block}
.nimbus-item{position:relative;z-index:1;display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 16px;border:0;border-radius:999px;background:none;color:var(--n-fg-soft);
  font-family:inherit;font-weight:500;font-size:14px;line-height:1;letter-spacing:-.01em;text-decoration:none;cursor:pointer;transition:color .25s}
.nimbus-item:hover,.nimbus-item[aria-current="page"]{color:var(--n-fg)}
.nimbus-item:focus-visible{outline:2px solid #00A2FF;outline-offset:2px}
.nv-ico{position:relative;display:inline-flex;flex:none}
.nv-ico svg{transition:transform .45s cubic-bezier(.3,1.6,.5,1)}
.nimbus-item[aria-current="page"] .nv-ico svg{transform:translateY(-1px) scale(1.08)}
.nv-door{fill:transparent}
.nv-ico[data-fx="pop"] svg{animation:nvPop .5s cubic-bezier(.3,1.6,.5,1) both}
@keyframes nvPop{0%{transform:scale(.72)}60%{transform:scale(1.2)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="plane"] svg{animation:nvPlane 1.15s cubic-bezier(.55,0,.3,1) both}
@keyframes nvPlane{0%{transform:none}12%{transform:translate(-3px,2px) rotate(7deg)}42%{transform:translate(64px,-26px) rotate(-24deg) scale(.9);opacity:0}43%{transform:translate(-60px,16px) rotate(-12deg) scale(.9);opacity:0}58%{opacity:1}80%{transform:translate(3px,-1px) rotate(2deg)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="plane"]::after{content:"";position:absolute;left:55%;top:48%;height:2px;width:46px;border-radius:2px;transform-origin:0 50%;
  background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.95));animation:nvTrail 1.15s ease-out both;pointer-events:none}
@keyframes nvTrail{0%,8%{opacity:0;transform:rotate(-22deg) scaleX(0)}30%{opacity:.9;transform:rotate(-22deg) scaleX(1)}55%,100%{opacity:0;transform:rotate(-22deg) translateX(30px) scaleX(.2)}}
.nv-ico[data-fx="drop"] svg{animation:nvDrop .95s cubic-bezier(.4,0,.3,1) both;transform-origin:50% 100%}
@keyframes nvDrop{0%{transform:translateY(-1px)}26%{transform:translateY(-13px) scale(.88,1.12)}46%{transform:translateY(3px) scale(1.3,.68)}62%{transform:translateY(-3px) scale(.92,1.08)}80%{transform:translateY(0) scale(1.04,.97)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="drop"]::before,.nv-ico[data-fx="drop"]::after{content:"";position:absolute;bottom:0;left:50%;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:currentColor;opacity:0;pointer-events:none}
.nv-ico[data-fx="drop"]::before{animation:nvSplashL .95s ease-out both}
.nv-ico[data-fx="drop"]::after{animation:nvSplashR .95s ease-out both}
@keyframes nvSplashL{0%,44%{opacity:0;transform:none}50%{opacity:.9;transform:translate(-5px,-6px)}75%,100%{opacity:0;transform:translate(-11px,1px) scale(.4)}}
@keyframes nvSplashR{0%,44%{opacity:0;transform:none}50%{opacity:.9;transform:translate(5px,-7px)}75%,100%{opacity:0;transform:translate(12px,1px) scale(.4)}}
.nv-ico[data-fx="spin"] svg{animation:nvSpin 1s cubic-bezier(.2,.75,.25,1) both}
@keyframes nvSpin{0%{transform:perspective(80px) rotateY(0)}100%{transform:perspective(80px) rotateY(360deg) translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="glow"] svg{animation:nvHop .8s cubic-bezier(.3,1.4,.5,1) both;transform-origin:50% 100%}
@keyframes nvHop{0%{transform:none}30%{transform:translateY(-5px) scale(1.04,.96)}55%{transform:translateY(0) scale(1.12,.88)}75%{transform:translateY(-2px) scale(.98,1.04)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="glow"] .nv-door{animation:nvDoor 1.3s ease both}
@keyframes nvDoor{0%{fill:transparent}30%{fill:#FFF3A8}100%{fill:rgba(126,232,255,.6)}}
.nv-ico[data-fx="wave"] svg{animation:nvWave .9s ease-in-out both;transform-origin:50% 92%}
@keyframes nvWave{0%{transform:none}20%{transform:rotate(-15deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(4deg)}100%{transform:translateY(-1px) scale(1.08)}}
.nimbus-nav[data-compact="true"] .nimbus-item{padding:0 13px}
.nimbus-nav[data-compact="true"] .nimbus-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:520px){.nimbus-nav:not([data-compact="false"]) .nimbus-item{padding:0 13px}.nimbus-nav:not([data-compact="false"]) .nimbus-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}}
@media (prefers-reduced-motion:reduce){.nv-ico svg,.nv-ico::before,.nv-ico::after,.nv-door{animation:none!important;transition:none}}
`

const VERTEX_SHADER = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`

const FRAGMENT_SHADER = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec4 uPill;
uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;uniform float uDark;uniform float uAmb;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5){d=smin(d,sdCap(p,uBlob[i],uSy[i]),13.);}}return d;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,h.y);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);
 w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}
float H(vec2 p){float dp=pillD(p);return lens(dp,uPill.w*.36)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=pillD(p);float dd=dropD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+uTime*.035));
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.11+.07*uDark);
 vec3 c=vec3(0.,.14,.36)*sh;float a=sh;
 float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
 c=mix(vec3(1.),irid,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 tint=mix(vec3(.80,.95,1.),vec3(.55,.82,1.),uDark);
 float rim=dm*(1.-smoothstep(0.,8.,-dd));
 float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float da=dm*(.26+.14*body)*(1.-.35*uDark);vec3 dc=mix(tint,vec3(1.),body*.6);
 float la=rim*.22;vec3 lc=mix(vec3(0.,.42,.78),vec3(.1,.55,.95),uDark);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 la=clamp(cres*.7+smoothstep(.6,1.,cs)*.28*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,.35)*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);
}`

type Fx = 'pop' | 'glow' | 'spin' | 'plane' | 'drop' | 'wave' | 'none'

export type LiquidNavItem = {
  label: string
  icon?: ReactNode
  fx?: Fx
  href?: string
}

type Spring = { x: number; v: number }
type Sat = { x: number; y: number; vx: number; vy: number; r: number; k: number }
type Ripple = { x: number; y: number; age: number; amp: number }
type Target = { x: number; cy: number; q: number; r: number }

type Uniforms = Record<
  | 'uRes'
  | 'uDpr'
  | 'uTime'
  | 'uPill'
  | 'uBlob'
  | 'uSy'
  | 'uRip'
  | 'uMouse'
  | 'uDark'
  | 'uAmb',
  WebGLUniformLocation | null
>

type GLContext = { gl: WebGLRenderingContext; u: Uniforms }

type NavState = {
  a: Spring
  b: Spring
  sy: { s: number; v: number }
  lead: number
  lagFrom: number
  sats: Sat[]
  rips: Ripple[]
  t: Target
  q: number
  mouse: { x: number; y: number; s: number; on: boolean }
  moving: boolean
  split: boolean
  ready: boolean
  w: number
  h: number
  visible: boolean
  reduce: boolean
  raf: number
  last: number
  time: number
  glc: GLContext | null
}

function makeState(): NavState {
  return {
    a: { x: 0, v: 0 },
    b: { x: 0, v: 0 },
    sy: { s: 1, v: 0 },
    lead: 0,
    lagFrom: 0,
    sats: [],
    rips: [],
    t: { x: 0, cy: 0, q: 0, r: 21 },
    q: 0,
    mouse: { x: 0, y: 0, s: 0, on: false },
    moving: false,
    split: false,
    ready: false,
    w: 0,
    h: 0,
    visible: true,
    reduce: false,
    raf: 0,
    last: 0,
    time: 0,
    glc: null,
  }
}

function initGL(canvas: HTMLCanvasElement): GLContext | null {
  const gl = canvas.getContext('webgl', {
    premultipliedAlpha: true,
    alpha: true,
    antialias: false,
  })
  if (!gl) return null

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
  }

  const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vertex || !fragment) return null

  const program = gl.createProgram()
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null

  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

  const position = gl.getAttribLocation(program, 'a')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const u = {} as Uniforms
  for (const name of [
    'uRes',
    'uDpr',
    'uTime',
    'uPill',
    'uBlob',
    'uSy',
    'uRip',
    'uMouse',
    'uDark',
    'uAmb',
  ] as const) {
    u[name] = gl.getUniformLocation(program, name)
  }

  return { gl, u }
}

function supportsRefraction() {
  if (typeof window === 'undefined' || typeof CSS === 'undefined') return false
  const ua = navigator.userAgent
  return /Chrome\/|Chromium\/|Edg\//.test(ua) && !/Firefox\//.test(ua) && CSS.supports('backdrop-filter', 'url(#a)')
}

/* -------------------------------------------------------------------------- */
/*  Icons                                                                     */
/* -------------------------------------------------------------------------- */

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

export const navIcons = {
  home: (
    <Icon>
      <path d="M3.5 11.2 12 4l8.5 7.2" />
      <path d="M6 9.6V20h12V9.6" />
      <path className="nv-door" d="M10 20v-5h4v5Z" />
    </Icon>
  ),
  globe: (
    <Icon>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17" />
    </Icon>
  ),
  plane: <Icon><path d="M21 12.2 3.6 5.4l2.7 6.8-2.7 6.4L21 12.2Zm-14.7 0H13" /></Icon>,
  drop: <Icon><path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5Z" /></Icon>,
  user: (
    <Icon>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20c1.2-3.4 4-5 7.2-5s6 1.6 7.2 5" />
    </Icon>
  ),
}

const DEFAULT_ITEMS: LiquidNavItem[] = [
  { label: 'Home', icon: navIcons.home, fx: 'glow' },
  { label: 'Explore', icon: navIcons.globe, fx: 'spin' },
  { label: 'Flights', icon: navIcons.plane, fx: 'plane' },
  { label: 'Weather', icon: navIcons.drop, fx: 'drop' },
  { label: 'Profile', icon: navIcons.user, fx: 'wave' },
]

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

type LiquidNavbarProps = {
  items?: LiquidNavItem[]
  defaultActive?: number
  active?: number
  onChange?: (index: number, item: LiquidNavItem) => void
  tone?: 'light' | 'dark'
  compact?: boolean
  sound?: boolean
  className?: string
  style?: CSSProperties
}

export function LiquidNavbar({
  items = DEFAULT_ITEMS,
  defaultActive = 0,
  active,
  onChange,
  tone = 'light',
  compact,
  sound = false,
  className,
  style,
}: LiquidNavbarProps) {
  const [innerActive, setInnerActive] = useState(defaultActive)
  const current = active ?? innerActive

  const navRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dropRef = useRef<HTMLSpanElement | null>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([])
  const audioRef = useRef<AudioContext | null>(null)
  const stateRef = useRef<NavState>(makeState())

  const [glMode, setGlMode] = useState<'on' | 'off'>('on')
  const [refract, setRefract] = useState(false)
  const [burst, setBurst] = useState({ i: -1, n: 0 })

  const toneRef = useRef(tone === 'dark' ? 1 : 0)

  /* ----------------------------- rendering ------------------------------- */

  const render = useCallback(() => {
    const d = stateRef.current
    const t = d.t
    const gap = Math.abs(d.a.x - d.b.x)
    const pinch = Math.min(gap / (2 * (d.q + t.r) || 1), 1)
    const radius = t.r * (1 - 0.3 * pinch)

    if (d.glc) {
      const { gl, u } = d.glc
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
      gl.uniform2f(u.uRes, d.w + PAD * 2, d.h + PAD * 2)
      gl.uniform1f(u.uDpr, dpr)
      gl.uniform1f(u.uTime, d.time)
      gl.uniform4f(u.uPill, PAD, PAD, d.w, d.h)

      const blobs = new Float32Array(24)
      const stretch = new Float32Array(6).fill(1)
      const lead = d.lead === 0 ? d.a : d.b
      const trail = d.lead === 0 ? d.b : d.a
      blobs.set(
        [
          lead.x,
          t.cy,
          d.q * (1 - 0.25 * pinch),
          t.r * (1 - 0.12 * pinch),
          trail.x,
          t.cy,
          d.q * (1 - 0.8 * pinch),
          t.r * (1 - 0.5 * pinch),
        ],
        0,
      )
      stretch[0] = stretch[1] = d.sy.s
      d.sats.slice(0, 4).forEach((sat, index) => {
        blobs.set([sat.x, sat.y, 0, sat.r], 8 + index * 4)
      })
      gl.uniform4fv(u.uBlob, blobs)
      gl.uniform1fv(u.uSy, stretch)

      const ripples = new Float32Array(24)
      d.rips.slice(-6).forEach((rip, index) => {
        ripples.set([rip.x, rip.y, rip.age, rip.amp], index * 4)
      })
      gl.uniform4fv(u.uRip, ripples)
      gl.uniform3f(u.uMouse, d.mouse.x, d.mouse.y, d.mouse.s)
      gl.uniform1f(u.uDark, toneRef.current)
      gl.uniform1f(u.uAmb, d.reduce ? 0 : 1)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    } else if (dropRef.current) {
      const left = Math.min(d.a.x, d.b.x) - d.q - radius - PAD
      const width = gap + 2 * (d.q + radius)
      dropRef.current.style.width = `${width}px`
      dropRef.current.style.transform = `translateX(${left}px) scaleY(${d.sy.s})`
    }
  }, [])

  /* ------------------------------ physics -------------------------------- */

  const update = useCallback((dt: number) => {
    const d = stateRef.current
    const t = d.t
    d.time += dt
    d.q += (t.q - d.q) * Math.min(1, dt * 12)

    const springs = [d.a, d.b]
    let settled = true

    if (d.reduce) {
      d.a.x = d.b.x = t.x
      d.a.v = d.b.v = 0
      d.sy.s = 1
      d.sats = []
    } else {
      springs.forEach((spring, index) => {
        const isLead = index === d.lead
        const stiffness = isLead ? 210 : 72
        const damping = isLead ? 25 : 13
        const lag = !isLead && performance.now() < d.lagFrom ? 0.08 : 1
        spring.v += (stiffness * (t.x - spring.x) - damping * spring.v) * dt * lag
        spring.x += spring.v * dt

        const min = PAD + 6 + d.q + t.r - 3
        const max = PAD + d.w - 6 - d.q - t.r + 3
        if (spring.x < min || spring.x > max) {
          d.sy.v -= Math.min(Math.abs(spring.v), 900) * 0.0016
          spring.x = Math.max(min, Math.min(max, spring.x))
          spring.v *= -0.25
        }
        if (Math.abs(t.x - spring.x) > 0.3 || Math.abs(spring.v) > 3) settled = false
      })

      const lead = springs[d.lead]
      const squeeze = 1 - 0.2 * Math.min(Math.abs(lead.v) / 1500, 1)
      d.sy.v += (280 * (squeeze - d.sy.s) - 9 * d.sy.v) * dt
      d.sy.s += d.sy.v * dt
      if (Math.abs(d.sy.s - 1) > 0.002 || Math.abs(d.sy.v) > 0.02) settled = false

      const gap = Math.abs(d.a.x - d.b.x)
      const shrink = t.r * (1 - 0.3 * Math.min(gap / (2 * (t.q + t.r) || 1), 1))
      if (!d.split && d.moving && gap - 2 * t.q - 2 * shrink > -6) {
        d.split = true
        const from = springs[1 - d.lead]
        const to = springs[d.lead]
        ;[0.3, 0.5, 0.72].forEach((part, index) => {
          d.sats.push({
            x: from.x + (to.x - from.x) * part + (Math.random() - 0.5) * 6,
            y: t.cy + (Math.random() - 0.5) * 10,
            vx: (from.v + to.v) * 0.45,
            vy: (Math.random() - 0.5) * 60,
            r: 5 + Math.random() * 3 - index * 0.5,
            k: 70 + Math.random() * 90,
          })
        })
      }

      d.sats = d.sats.filter((sat) => {
        sat.vx += (sat.k * (t.x - sat.x) - 9 * sat.vx) * dt
        sat.vy += (90 * (t.cy - sat.y) - 7 * sat.vy) * dt
        sat.x += sat.vx * dt
        sat.y += sat.vy * dt
        sat.x = Math.max(PAD + 8 + sat.r, Math.min(PAD + d.w - 8 - sat.r, sat.x))
        sat.y = Math.max(t.cy - t.r + sat.r, Math.min(t.cy + t.r - sat.r, sat.y))
        if (Math.abs(t.x - sat.x) < t.q + t.r * 0.5) sat.r -= dt * 26
        return sat.r > 0.6
      })
      if (d.sats.length) settled = false
    }

    if (d.moving && settled) {
      d.moving = false
      if (d.split || !d.reduce) {
        d.rips.push({ x: t.x, y: t.cy, age: 0, amp: d.split ? 1.2 : 0.7 })
      }
    }

    d.rips.forEach((rip) => {
      rip.age += dt
    })
    d.rips = d.rips.filter((rip) => rip.age < 2.4)

    const mouseTarget = d.mouse.on ? 1 : 0
    d.mouse.s += (mouseTarget - d.mouse.s) * Math.min(1, dt * 7)
  }, [])

  /* ------------------------------- loop ---------------------------------- */

  const startLoop = useCallback(() => {
    const d = stateRef.current
    if (d.raf) return
    d.last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min((now - d.last) / 1000, 1 / 30)
      d.last = now
      update(dt)
      render()
      const busy = d.moving || d.rips.length > 0 || d.sats.length > 0 || d.mouse.s > 0.01
      if (d.visible && (!d.reduce || busy)) {
        d.raf = requestAnimationFrame(tick)
      } else {
        d.raf = 0
      }
    }

    d.raf = requestAnimationFrame(tick)
  }, [render, update])

  /* ------------------------------ measure -------------------------------- */

  const measure = useCallback(() => {
    const nav = navRef.current
    const item = itemRefs.current[current]
    if (!nav || !item) return

    const d = stateRef.current
    d.w = nav.offsetWidth
    d.h = nav.offsetHeight

    const t = d.t
    t.r = item.offsetHeight / 2
    t.q = Math.max(0, item.offsetWidth / 2 - t.r)
    t.cy = PAD + item.offsetTop + item.offsetHeight / 2
    const center = PAD + item.offsetLeft + item.offsetWidth / 2

    if (!d.ready) {
      d.a.x = d.b.x = center
      d.q = t.q
      d.ready = true
    } else if (Math.abs(center - t.x) > 0.5) {
      d.lead = Math.abs(center - d.a.x) <= Math.abs(center - d.b.x) ? 0 : 1
      d.lagFrom = performance.now() + 70
      d.moving = true
      d.split = false
    }
    t.x = center

    const canvas = canvasRef.current
    if (canvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = d.w + PAD * 2
      const height = d.h + PAD * 2
      if (
        canvas.width !== Math.round(width * dpr) ||
        canvas.height !== Math.round(height * dpr)
      ) {
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
      }
    }

    startLoop()
  }, [current, startLoop])

  const measureRef = useRef(measure)
  useLayoutEffect(() => {
    measureRef.current = measure
  }, [measure])

  useLayoutEffect(() => {
    measure()
  }, [measure, items.length, compact])

  /* ------------------------------- setup --------------------------------- */

  useEffect(() => {
    setRefract(supportsRefraction())
    const d = stateRef.current
    d.reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    const canvas = canvasRef.current
    d.glc = canvas ? initGL(canvas) : null
    if (!d.glc) setGlMode('off')

    const onContextLost = (event: Event) => {
      event.preventDefault()
      d.glc = null
      setGlMode('off')
    }
    canvas?.addEventListener('webglcontextlost', onContextLost)

    const observer = new IntersectionObserver(([entry]) => {
      d.visible = entry.isIntersecting
      if (d.visible) startLoop()
    })
    if (navRef.current) observer.observe(navRef.current)

    const onVisibility = () => {
      d.visible = document.visibilityState === 'visible'
      if (d.visible) startLoop()
    }
    document.addEventListener('visibilitychange', onVisibility)

    // StrictMode replays effects (setup → cleanup → setup); make sure the loop
    // is running again after the replayed cleanup cancelled the first frame.
    startLoop()

    return () => {
      canvas?.removeEventListener('webglcontextlost', onContextLost)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(d.raf)
      d.raf = 0
    }
  }, [startLoop])

  useEffect(() => {
    let lastWidth = -1
    const observer = new ResizeObserver(() => {
      const width = navRef.current?.offsetWidth ?? 0
      if (width !== lastWidth) {
        lastWidth = width
        stateRef.current.ready = false
        measureRef.current()
      }
    })
    if (navRef.current) observer.observe(navRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    toneRef.current = tone === 'dark' ? 1 : 0
    startLoop()
  }, [tone, startLoop])

  /* ----------------------------- interaction ----------------------------- */

  const localPoint = (clientX: number, clientY: number) => {
    const rect = navRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: clientX - rect.left + PAD, y: clientY - rect.top + PAD }
  }

  const addRipple = (x: number, y: number, amp: number) => {
    const d = stateRef.current
    if (d.reduce) return
    d.rips.push({ x, y, age: 0, amp })
    startLoop()
  }

  const iconCenter = (index: number) => {
    const el = iconRefs.current[index]
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return localPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
  }

  const playSound = () => {
    if (!sound) return
    try {
      const Ctor = window.AudioContext
      const ctx = audioRef.current ?? new Ctor()
      audioRef.current = ctx
      const now = ctx.currentTime
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(420 + Math.random() * 80, now)
      oscillator.frequency.exponentialRampToValueAtTime(1500, now + 0.07)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)
      oscillator.connect(gain).connect(ctx.destination)
      oscillator.start(now)
      oscillator.stop(now + 0.18)
    } catch {
      /* audio is a nice-to-have */
    }
  }

  const select = (index: number) => {
    if (!items[index]) return
    const fx = items[index].fx ?? (items[index].icon ? 'pop' : 'none')
    setBurst((previous) => ({ i: index, n: previous.n + 1 }))
    playSound()

    const center = iconCenter(index)
    if (center && fx === 'drop') {
      window.setTimeout(() => addRipple(center.x, stateRef.current.t.cy, 1.4), 430)
    }
    if (center && fx === 'plane') {
      addRipple(center.x, center.y, 0.6)
    }

    if (index !== current) {
      if (active === undefined) setInnerActive(index)
      onChange?.(index, items[index])
    }
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const next =
      (current + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length
    select(next)
    itemRefs.current[next]?.focus()
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse') return
    const point = localPoint(event.clientX, event.clientY)
    const d = stateRef.current
    d.mouse.x = point.x
    d.mouse.y = point.y
    d.mouse.on = true
    startLoop()
  }

  const onPointerLeave = () => {
    stateRef.current.mouse.on = false
    startLoop()
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const point = localPoint(event.clientX, event.clientY)
    addRipple(point.x, point.y, 0.8)
  }

  return (
    <nav
      ref={navRef}
      className={['nimbus-nav', className].filter(Boolean).join(' ')}
      data-tone={tone}
      data-gl={glMode}
      data-compact={compact === undefined ? undefined : String(compact)}
      data-refract={refract ? 'on' : 'off'}
      aria-label="Main"
      onKeyDown={onKeyDown}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      style={style}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />

      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter
          id="nimbus-refract"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.02"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="soft"
            scale="60"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <span className="nimbus-glass" aria-hidden="true" />
      <canvas className="nimbus-water" ref={canvasRef} aria-hidden="true" />
      <span className="nimbus-drop" ref={dropRef} aria-hidden="true" />

      {items.map((item, index) => {
        const fx = item.fx ?? 'pop'
        const bursting = burst.i === index && fx !== 'none'

        const content = (
          <>
            {item.icon && (
              <span
                className="nv-ico"
                data-fx={bursting ? fx : undefined}
                ref={(el) => {
                  iconRefs.current[index] = el
                }}
                key={bursting ? burst.n : 0}
              >
                {item.icon}
              </span>
            )}
            <span className="nimbus-label">{item.label}</span>
          </>
        )

        const shared = {
          className: 'nimbus-item',
          'aria-current': index === current ? ('page' as const) : undefined,
          onClick: () => select(index),
          ref: (el: HTMLAnchorElement | HTMLButtonElement | null) => {
            itemRefs.current[index] = el
          },
        }

        return item.href ? (
          <a key={item.label + index} {...shared} href={item.href} aria-label={item.label}>
            {content}
          </a>
        ) : (
          <button key={item.label + index} {...shared} type="button" aria-label={item.label}>
            {content}
          </button>
        )
      })}
    </nav>
  )
}

/* -------------------------------------------------------------------------- */
/*  Demo                                                                      */
/* -------------------------------------------------------------------------- */

export default function LiquidGlassNavbarDemo() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        padding: '0 16px',
        background: '#DCEBF5',
      }}
    >
      <LiquidNavbar
        tone="light"
        defaultActive={0}
        items={[
          { label: 'Home', icon: navIcons.home, fx: 'glow' },
          { label: 'Explore', icon: navIcons.globe, fx: 'spin' },
          { label: 'Flights', icon: navIcons.plane, fx: 'plane' },
          { label: 'Weather', icon: navIcons.drop, fx: 'drop' },
          { label: 'Profile', icon: navIcons.user, fx: 'wave' },
        ]}
      />

      <span
        style={{
          font: "500 12px/1 ui-sans-serif, -apple-system, 'Segoe UI', system-ui, sans-serif",
          color: 'rgba(11,19,43,.5)',
        }}
      >
        by{' '}
        <a
          href="https://inzeedo.lk"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(11,19,43,.7)' }}
        >
          Inzeedo
        </a>
      </span>
    </div>
  )
}
