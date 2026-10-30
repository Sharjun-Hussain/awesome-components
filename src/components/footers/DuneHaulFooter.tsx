import React, { useState, useRef, useEffect, useMemo, useCallback, useId } from "react";
import "./DuneHaulFooter.exact.css";

export const meta = {
  title: "Inzeedo Dune Haul Footer",
  description: "Desert canyon highway animated footer with 3D semi-truck logistics simulation, procedural sand dunes, road paving reveal, realistic dual air horn audio, and dynamic day/dusk/night lighting.",
  category: 'footers',
  fullWidth: true,
  thumbnail: true,
};

// Types & Interfaces
export interface DuneColorPalette {
  sky: [string, string];
  glow: string;
  far: [string, string, string];
  mid: [string, string, string];
  ground: [string, string, string];
  front: [string, string, string];
  near: [string, string, string];
  shrub: [string, string];
  specks: string[];
  road: string;
  roadEdge: string;
  roadShade: string;
  truck: {
    trailer: string;
    trailerTop: string;
    trailerSide: string;
    cab: string;
    cabTop: string;
    cabSide: string;
    glass: string;
    wheel: string;
    lights: string;
  };
  card: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentInk: string;
  night: boolean;
}

export const DUNE_PALETTES: Record<string, DuneColorPalette> = {
  apricot: {
    sky: ["#f6f3f0", "#fbe7d6"],
    glow: "#ffd9b8",
    far: ["#fbe3d0", "#f5c8a6", "#eeb086"],
    mid: ["#fad2b2", "#f3b282", "#e8925b"],
    ground: ["#f9c59a", "#f29c5d", "#e5732f"],
    front: ["#f8b078", "#ef8442", "#dc5f1e"],
    near: ["#f69a5a", "#e96a27", "#cf4b12"],
    shrub: ["#f6a065", "#df5f26"],
    specks: ["#ffffff", "#fff1e8", "#ffd5c4", "#ffbfa0"],
    road: "#fadcc4",
    roadEdge: "#ea8d52",
    roadShade: "#d8662b",
    truck: {
      trailer: "#fbe1cb",
      trailerTop: "#fff2e6",
      trailerSide: "#f0bb93",
      cab: "#f6c29b",
      cabTop: "#fcdcc2",
      cabSide: "#e79c6c",
      glass: "#7d3a1d",
      wheel: "#45210f",
      lights: "#fff7e3",
    },
    card: "#ffffff",
    ink: "#1d1712",
    muted: "#6f655e",
    line: "#eee8e3",
    accent: "#ee6a2a",
    accentInk: "#ffffff",
    night: false,
  },
  rose: {
    sky: ["#f8f3f4", "#fbe4e6"],
    glow: "#ffd3dc",
    far: ["#f9e0e4", "#f1c4cc", "#e7aab6"],
    mid: ["#f6d0d6", "#eeafbb", "#e08e9f"],
    ground: ["#f5c3cb", "#ec9cac", "#dc7189"],
    front: ["#f3b0bd", "#e78399", "#d35d7b"],
    near: ["#f09cae", "#e06b88", "#c64a6d"],
    shrub: ["#f29ab0", "#d45877"],
    specks: ["#ffffff", "#fff0f3", "#ffd6e0", "#ffbfce"],
    road: "#fae0e5",
    roadEdge: "#e390a3",
    roadShade: "#ce6880",
    truck: {
      trailer: "#fce3e8",
      trailerTop: "#fff4f6",
      trailerSide: "#f2bdc8",
      cab: "#f8c5cf",
      cabTop: "#fcdee4",
      cabSide: "#ea9faa",
      glass: "#7a2a3e",
      wheel: "#441a24",
      lights: "#fff7e3",
    },
    card: "#ffffff",
    ink: "#1c1417",
    muted: "#6e5f64",
    line: "#ede4e6",
    accent: "#d94b6c",
    accentInk: "#ffffff",
    night: false,
  },
  sage: {
    sky: ["#f4f6f3", "#e6ebe4"],
    glow: "#d7e6d4",
    far: ["#e2ebe0", "#c6d9c2", "#a6c3a1"],
    mid: ["#d5e3d2", "#b5cbb1", "#92b48e"],
    ground: ["#c5d8c1", "#a2be9e", "#7b9f76"],
    front: ["#b5ceb1", "#90af8b", "#698e64"],
    near: ["#a3c19e", "#7c9d77", "#577a52"],
    shrub: ["#95b590", "#5c8157"],
    specks: ["#ffffff", "#f0f6ef", "#d8e9d6", "#bfdcbc"],
    road: "#e2ede0",
    roadEdge: "#99b793",
    roadShade: "#6e9167",
    truck: {
      trailer: "#e4eee1",
      trailerTop: "#f4f9f2",
      trailerSide: "#bed1bb",
      cab: "#cadbc6",
      cabTop: "#e0ece0",
      cabSide: "#a4bba0",
      glass: "#273f23",
      wheel: "#172715",
      lights: "#fff7e3",
    },
    card: "#ffffff",
    ink: "#141913",
    muted: "#5e665d",
    line: "#e3e8e2",
    accent: "#5a8c54",
    accentInk: "#ffffff",
    night: false,
  },
  dusk: {
    sky: ["#0e1424", "#281b3c"],
    glow: "#6d3a66",
    far: ["#2d1b3f", "#3e2354", "#522968"],
    mid: ["#3a1d48", "#502660", "#672d76"],
    ground: ["#481f50", "#5e2667", "#762c7b"],
    front: ["#502253", "#692969", "#832d7a"],
    near: ["#562351", "#722964", "#8c2e71"],
    shrub: ["#4c2452", "#752d6a"],
    specks: ["#e8d3ff", "#c9a6ff", "#ffd4b8", "#8aa5ff"],
    road: "#4b2d5a",
    roadEdge: "#8b4f88",
    roadShade: "#23112b",
    truck: {
      trailer: "#3b2a52",
      trailerTop: "#624a85",
      trailerSide: "#2c1d3f",
      cab: "#6c3d70",
      cabTop: "#9a599f",
      cabSide: "#4a244e",
      glass: "#0e0618",
      wheel: "#0b0612",
      lights: "#ffe394",
    },
    card: "#181024",
    ink: "#f5efff",
    muted: "#a899bc",
    line: "#2a1e3c",
    accent: "#ff8259",
    accentInk: "#1a0b1c",
    night: true,
  },
};

// Math & 3D Road Projection
const WORLD_W = 1440;
const WORLD_H = 900;
const HORIZON_Y = 572;
const FOCAL_LEN = 328;

function dhfRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 1831565813) >>> 0;
    let m = s;
    m = Math.imul(m ^ (m >>> 15), m | 1);
    m ^= m + Math.imul(m ^ (m >>> 7), m | 61);
    return ((m ^ (m >>> 14)) >>> 0) / 4294967296;
  };
}

interface Dome {
  cx: number;
  wl: number;
  wr: number;
  top: number;
  base: number;
}

function dhfDomeY(dome: Dome, x: number) {
  const norm = (x - dome.cx) / (x < dome.cx ? dome.wl : dome.wr);
  return dome.base - (dome.base - dome.top) * Math.exp(-norm * norm * 1.15);
}

function dhfDomePath(dome: Dome) {
  const left = dome.cx - dome.wl * 2.6;
  const right = dome.cx + dome.wr * 2.6;
  const segments = 48;
  let d = `M${left.toFixed(1)} ${WORLD_H + 80}`;
  for (let i = 0; i <= segments; i++) {
    const x = left + ((right - left) * i) / segments;
    d += `L${x.toFixed(1)} ${dhfDomeY(dome, x).toFixed(1)}`;
  }
  return d + `L${right.toFixed(1)} ${WORLD_H + 80}Z`;
}

function dhfCrestPath(dome: Dome) {
  const left = dome.cx - dome.wl * 1.7;
  const right = dome.cx + dome.wr * 1.7;
  let d = "";
  for (let i = 0; i <= 32; i++) {
    const x = left + ((right - left) * i) / 32;
    d += (i ? "L" : "M") + x.toFixed(1) + " " + (dhfDomeY(dome, x) + 1).toFixed(1);
  }
  return d;
}

function dhfProject(x: number, z: number): [number, number] {
  const scale = FOCAL_LEN / Math.max(0.05, z);
  return [WORLD_W / 2 + x * scale, HORIZON_Y + scale];
}

interface RoadPoint {
  X: number;
  Z: number;
  nX: number;
  nZ: number;
  s: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

function dhfRoad(points: [number, number][], subs = 36): RoadPoint[] {
  const res: RoadPoint[] = [];
  const getP = (idx: number) => points[Math.max(0, Math.min(points.length - 1, idx))];

  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [getP(i - 1), getP(i), getP(i + 1), getP(i + 2)];
    for (let s = i === 0 ? 0 : 1; s <= subs; s++) {
      const t = s / subs;
      const t2 = t * t;
      const t3 = t2 * t;
      const cr = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      const X = cr(p0[0], p1[0], p2[0], p3[0]);
      const Z = cr(p0[1], p1[1], p2[1], p3[1]);
      const [projX, projY] = dhfProject(X, Z);
      res.push({ X, Z, nX: 0, nZ: 0, s: 0, x: projX, y: projY, dx: 0, dy: 1 });
    }
  }

  for (let i = 0; i < res.length; i++) {
    const prev = res[Math.max(0, i - 1)];
    const next = res[Math.min(res.length - 1, i + 1)];
    const distXZ = Math.hypot(next.X - prev.X, next.Z - prev.Z) || 1;
    res[i].nX = (next.Z - prev.Z) / distXZ;
    res[i].nZ = -(next.X - prev.X) / distXZ;
    const distXY = Math.hypot(next.x - prev.x, next.y - prev.y) || 1;
    res[i].dx = (next.x - prev.x) / distXY;
    res[i].dy = (next.y - prev.y) / distXY;
    if (i > 0) {
      res[i].s = res[i - 1].s + Math.hypot(res[i].X - res[i - 1].X, res[i].Z - res[i - 1].Z);
    }
  }
  return res;
}

function dhfAt(road: RoadPoint[], distance: number): RoadPoint {
  const last = road[road.length - 1];
  if (distance <= 0) return road[0];
  if (distance >= last.s) return last;

  let low = 0;
  let high = road.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (road[mid].s <= distance) low = mid;
    else high = mid;
  }

  const p1 = road[low];
  const p2 = road[high];
  const t = (distance - p1.s) / (p2.s - p1.s || 1);
  const lerp = (a: number, b: number) => a + (b - a) * t;

  const dx = lerp(p1.dx, p2.dx);
  const dy = lerp(p1.dy, p2.dy);
  const dLen = Math.hypot(dx, dy) || 1;
  const nX = lerp(p1.nX, p2.nX);
  const nZ = lerp(p1.nZ, p2.nZ);
  const nLen = Math.hypot(nX, nZ) || 1;

  return {
    X: lerp(p1.X, p2.X),
    Z: lerp(p1.Z, p2.Z),
    nX: nX / nLen,
    nZ: nZ / nLen,
    s: distance,
    x: lerp(p1.x, p2.x),
    y: lerp(p1.y, p2.y),
    dx: dx / dLen,
    dy: dy / dLen,
  };
}

function dhfBand(road: RoadPoint[], offsetLeft: number, offsetRight: number, maxS: number): string {
  if (maxS <= 0) return "";
  const leftPts: string[] = [];
  const rightPts: string[] = [];

  const pushPt = (pt: RoadPoint) => {
    const l = dhfProject(pt.X + pt.nX * offsetLeft, pt.Z + pt.nZ * offsetLeft);
    const r = dhfProject(pt.X + pt.nX * offsetRight, pt.Z + pt.nZ * offsetRight);
    leftPts.push(`${l[0].toFixed(1)} ${l[1].toFixed(1)}`);
    rightPts.push(`${r[0].toFixed(1)} ${r[1].toFixed(1)}`);
  };

  for (const p of road) {
    if (p.s > maxS) {
      pushPt(dhfAt(road, maxS));
      break;
    }
    pushPt(p);
  }
  return leftPts.length < 2 ? "" : `M${leftPts.join("L")}L${rightPts.reverse().join("L")}Z`;
}

function dhfPace(z: number) {
  return Math.pow(Math.max(0.2, z), 1.15);
}

function dhfTripCost(road: RoadPoint[]) {
  let cost = 0;
  for (let i = 1; i < road.length; i++) {
    cost += (road[i].s - road[i - 1].s) / dhfPace((road[i].Z + road[i - 1].Z) / 2);
  }
  return cost;
}

function dhfAtTime(road: RoadPoint[], progress: number) {
  const target = dhfTripCost(road) * Math.min(1, Math.max(0, progress));
  let acc = 0;
  for (let i = 1; i < road.length; i++) {
    const step = (road[i].s - road[i - 1].s) / dhfPace((road[i].Z + road[i - 1].Z) / 2);
    if (acc + step >= target) {
      return road[i - 1].s + ((target - acc) / (step || 1)) * (road[i].s - road[i - 1].s);
    }
    acc += step;
  }
  return road[road.length - 1].s;
}

function dhfHull(pts: [number, number][]): [number, number][] {
  const sorted = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 3) return sorted;
  const cross = (a: [number, number], b: [number, number], c: [number, number]) =>
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

  const lower: [number, number][] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: [number, number][] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

function dhfPoly(pts: [number, number][]) {
  return pts.length ? `M${pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join("L")}Z` : "";
}

function dhfBox(bounds: [number, number, number, number], offset: [number, number], scaleZ: number) {
  const [minX, minY, maxX, maxY] = bounds;
  const midX = (minX + maxX) / 2;
  const remap = (x: number, y: number): [number, number] => [
    midX + (x - midX) * scaleZ + offset[0],
    maxY + (y - maxY) * scaleZ + offset[1],
  ];
  const front: [number, number][] = [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ];
  const rear: [number, number][] = [remap(minX, minY), remap(maxX, minY), remap(maxX, maxY), remap(minX, maxY)];
  const top = [front[0], front[1], rear[1], rear[0]];
  const side = offset[0] < 0 ? [front[0], rear[0], rear[3], front[3]] : [front[1], rear[1], rear[2], front[2]];

  return {
    hull: dhfHull(front.concat(rear)),
    top,
    side,
    front,
    rear,
  };
}

function dhfTruck(dx: number, dy: number) {
  const yaw = 64 * (0.42 + 0.58 * Math.min(1, Math.abs(dx) * 1.25));
  const back: [number, number] = [-dx * yaw, -dy * yaw - 6];
  const cabOff: [number, number] = [back[0] * 0.3, back[1] * 0.3];
  const trailerOff: [number, number] = [back[0] * 0.34, back[1] * 0.34];

  const cab = dhfBox([-20, -40, 20, -7], cabOff, 0.96);
  const trailer = dhfBox([-23 + trailerOff[0], -62 + trailerOff[1], 23 + trailerOff[0], -13 + trailerOff[1]], [back[0] * 0.66, back[1] * 0.66], 0.9);

  const along = (edge: [number, number][], factor: number): [number, number] => [
    edge[3][0] + (edge[2][0] - edge[3][0]) * factor,
    edge[3][1] + (edge[2][1] - edge[3][1]) * factor + 4.5,
  ];

  const len = Math.hypot(back[0], back[1]) || 1;
  const axis: [number, number] = [(back[0] / len) * Math.max(0.28, len / 64), (back[1] / len) * Math.max(0.28, len / 64)];
  const wheels = [along(trailer.side, 0.5), along(trailer.side, 0.84)];
  const cabWheels = [along(cab.side, 0.6)];

  return { cab, trailer, back, wheels, cabWheels, axis };
}

function dhfWheel(pos: [number, number], axis: [number, number], radius: number) {
  let d = "";
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const x = pos[0] + axis[0] * radius * Math.cos(angle);
    const y = pos[1] + axis[1] * radius * Math.cos(angle) + radius * Math.sin(angle);
    d += (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
  }
  return d + "Z";
}

function dhfFit(viewW: number, viewH: number) {
  const scale = Math.max(viewW / WORLD_W, viewH / WORLD_H);
  return {
    scale,
    ox: (viewW - WORLD_W * scale) / 2,
    oy: viewH - WORLD_H * scale,
  };
}

function dhfEaseOut(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - c, 3);
}

// Highway path nodes
const ROAD_CONTROL_NODES: [number, number][] = [
  [12.6, 27],
  [8, 12],
  [4.6, 6],
  [3.25, 3.65],
  [1.25, 2.3],
  [-0.2, 1.5],
  [-0.5, 0.9],
  [-0.4, 0.55],
];

const ROAD_WIDTH = 0.86;
const TRUCK_SCALE_FACTOR = 0.0078;
const TRUCK_LATERAL_OFFSET = 0.2;

interface LayerConfig {
  key: string;
  depth: number;
  specks: number;
  speckR: number;
  domes: Dome[];
}

const DUNE_LAYERS: LayerConfig[] = [
  {
    key: "far",
    depth: 0.12,
    specks: 26,
    speckR: 2.6,
    domes: [
      { cx: -60, wl: 260, wr: 300, top: 392, base: 640 },
      { cx: 1500, wl: 300, wr: 260, top: 398, base: 640 },
      { cx: 610, wl: 250, wr: 230, top: 512, base: 640 },
      { cx: 1040, wl: 230, wr: 300, top: 520, base: 640 },
    ],
  },
  {
    key: "mid",
    depth: 0.26,
    specks: 60,
    speckR: 3,
    domes: [
      { cx: 300, wl: 420, wr: 330, top: 452, base: 720 },
      { cx: 1210, wl: 330, wr: 420, top: 476, base: 720 },
    ],
  },
  {
    key: "ground",
    depth: 0.44,
    specks: 340,
    speckR: 3.4,
    domes: [{ cx: 860, wl: 560, wr: 640, top: 582, base: 800 }],
  },
  {
    key: "front",
    depth: 0.7,
    specks: 120,
    speckR: 4,
    domes: [
      { cx: 40, wl: 300, wr: 360, top: 618, base: 960 },
      { cx: 1440, wl: 330, wr: 320, top: 600, base: 960 },
    ],
  },
  {
    key: "near",
    depth: 1,
    specks: 90,
    speckR: 4.6,
    domes: [
      { cx: 150, wl: 260, wr: 250, top: 790, base: 1040 },
      { cx: 1380, wl: 280, wr: 260, top: 770, base: 1040 },
    ],
  },
];

const DESERT_SHRUBS = [
  { x: 560, y: 524, r: 26 },
  { x: 930, y: 550, r: 20 },
];

const SHRUB_PETAL_OFFSETS: [number, number, number][] = [
  [0, 0.05, 0.86],
  [-0.52, 0.22, 0.58],
  [0.54, 0.2, 0.6],
  [-0.24, -0.4, 0.56],
  [0.28, -0.36, 0.54],
];

function generateSpecks(seed: number) {
  const rng = dhfRng(seed);
  return DUNE_LAYERS.map((layer) =>
    layer.domes.map((dome) => {
      const specks: [number, number, number, number, number][] = [];
      const left = dome.cx - dome.wl * 2;
      const right = dome.cx + dome.wr * 2;
      const bottom = Math.min(WORLD_H + 10, dome.base + 120);
      let attempts = 0;
      while (specks.length < layer.specks && attempts++ < layer.specks * 30) {
        const x = left + rng() * (right - left);
        const y = dome.top + Math.sqrt(rng()) * (bottom - dome.top);
        if (y < dhfDomeY(dome, x) + 3) continue;
        const normY = Math.min(1, Math.max(0.15, (y - 380) / (WORLD_H - 380)));
        const r = layer.speckR * normY * (0.45 + rng() * 0.75);
        specks.push([x, y, Math.max(0.5, r), Math.floor(rng() * 4), 0.35 + rng() * 0.6]);
      }
      return specks;
    })
  );
}

function generateStars(seed: number) {
  const rng = dhfRng(seed * 7 + 3);
  return Array.from({ length: 70 }, () => [rng() * 100, rng() * 52, 0.8 + rng() * 1.6, rng() * 6]);
}

// Web Audio API Semi-Truck Dual Air Horn
let audioCtx: AudioContext | null = null;

function playTruckAirHorn() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtx) audioCtx = new AudioCtx();
    const ctx = audioCtx;
    if (ctx.state === "suspended") ctx.resume();

    const startTime = ctx.currentTime + 0.01;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1500;
    filter.Q.value = 0.8;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.16;
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    const blast = (at: number, dur: number, vol: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(vol, at + 0.018);
      g.gain.setValueAtTime(vol * 0.9, at + dur - 0.05);
      g.gain.linearRampToValueAtTime(0, at + dur);
      g.connect(filter);

      // Chords: 311Hz (Eb4), 392Hz (G4), 466Hz (Bb4)
      for (const freq of [311, 392, 466]) {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq * 1.012, at);
        osc.frequency.linearRampToValueAtTime(freq, at + 0.06);
        osc.frequency.linearRampToValueAtTime(freq * 0.985, at + dur);
        osc.connect(g);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      }
    };

    blast(startTime, 0.34, 0.7);
    blast(startTime + 0.44, 0.2, 0.5);
  } catch {
    // audio suspended or blocked
  }
}

// Sub-components: Truck Vector Face
function TruckFace({ colors }: { colors: DuneColorPalette["truck"] }) {
  return (
    <g>
      <rect x="-19" y="-8" width="9" height="10" rx="3" fill={colors.wheel} />
      <rect x="10" y="-8" width="9" height="10" rx="3" fill={colors.wheel} />
      <rect x="-20" y="-40" width="40" height="33" rx="5" fill={colors.cab} />
      <path
        d="M-16 -36 H16 Q17.5 -36 17.2 -34.4 L15.6 -26 Q15.3 -24.6 13.8 -24.6 H-13.8 Q-15.3 -24.6 -15.6 -26 L-17.2 -34.4 Q-17.5 -36 -16 -36 Z"
        fill={colors.glass}
      />
      <path d="M-12 -35 L-6 -35 L-11 -25.6 L-14 -25.6 Z" fill="#fff" opacity="0.22" />
      <rect x="-8" y="-21" width="16" height="9" rx="1.6" fill={colors.cabSide} />
      <path d="M-6 -19 H6 M-6 -16.5 H6 M-6 -14 H6" stroke={colors.cab} strokeWidth="1" />
      <rect x="-17" y="-19" width="7" height="5" rx="2" fill={colors.lights} />
      <rect x="10" y="-19" width="7" height="5" rx="2" fill={colors.lights} />
      <rect x="-21" y="-10" width="42" height="4.5" rx="2" fill={colors.cabSide} />
    </g>
  );
}

// Sub-component: Brand Truck Round Logo Mark
function TruckMark() {
  return (
    <svg className="dhf-mark" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="var(--dhf-accent)" />
      <g fill="none" stroke="var(--dhf-accent-ink)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        <rect x="8.5" y="8" width="15" height="14" rx="3" />
        <path d="M11.5 12.5h9" />
        <path d="M11 23.5v1.5M21 23.5v1.5" />
      </g>
      <g className="dhf-mark-lamps" fill="var(--dhf-accent-ink)">
        <circle cx="12.3" cy="18" r="1.4" />
        <circle cx="19.7" cy="18" r="1.4" />
      </g>
    </svg>
  );
}

// Sub-component: Social Icons
function SocialIcon({ icon }: { icon: string }) {
  const p = { viewBox: "0 0 24 24", width: 18, height: 18, "aria-hidden": true, fill: "currentColor" };
  if (icon === "facebook") {
    return (
      <svg {...p}>
        <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
      </svg>
    );
  }
  if (icon === "x") {
    return (
      <svg {...p}>
        <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
      </svg>
    );
  }
  if (icon === "instagram") {
    return (
      <svg {...p} fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (icon === "linkedin") {
    return (
      <svg {...p}>
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
      </svg>
    );
  }
  if (icon === "github") {
    return (
      <svg {...p}>
        <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3z" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1 31.6 31.6 0 0 0 .5-5.8 31.6 31.6 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  );
}

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  x: "X",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  github: "GitHub",
  youtube: "YouTube",
};

// Default Inzeedo Branding Configurations
const DEFAULT_COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Our Story", href: "https://inzeedo.lk" },
      { label: "How It Works", href: "https://inzeedo.lk" },
      { label: "Case Studies", href: "https://inzeedo.lk" },
    ],
  },
  {
    title: "Studio",
    links: [
      { label: "Design Systems", href: "https://inzeedo.lk" },
      { label: "Interactive Web", href: "https://inzeedo.lk" },
      { label: "Creative Code", href: "https://inzeedo.lk" },
    ],
  },
  {
    title: "Legal Pages",
    links: [
      { label: "Privacy Policy", href: "https://inzeedo.lk/privacy" },
      { label: "Terms & Conditions", href: "https://inzeedo.lk/terms" },
    ],
  },
];

const DEFAULT_SOCIALS = [
  { icon: "github", href: "https://github.com/inzeedo" },
  { icon: "x", href: "https://x.com/inzeedo" },
  { icon: "instagram", href: "https://instagram.com/inzeedo" },
  { icon: "linkedin", href: "https://linkedin.com/company/inzeedo" },
];

export interface DuneHaulFooterProps {
  name?: string;
  brandHref?: string;
  logo?: React.ReactNode;
  columns?: { title: string; links: { label: string; href?: string }[] }[];
  socials?: { icon: string; href?: string; label?: string }[];
  copyright?: string;
  preset?: "auto" | "apricot" | "rose" | "sage" | "dusk";
  palette?: Partial<DuneColorPalette>;
  seed?: number;
  tripSeconds?: number;
  honk?: string;
  greet?: boolean;
  sound?: boolean;
  parallax?: boolean;
  maxWidth?: string;
  fontFamily?: string;
  height?: string;
  sceneMinHeight?: string;
  className?: string;
}

export function DuneHaulFooter({
  name = "Inzeedo Haul",
  brandHref = "https://inzeedo.lk",
  logo,
  columns = DEFAULT_COLUMNS,
  socials = DEFAULT_SOCIALS,
  copyright,
  preset = "auto",
  palette,
  seed = 11,
  tripSeconds = 11,
  honk = "HONK!",
  greet = true,
  sound = true,
  parallax = true,
  maxWidth = "1040px",
  fontFamily = '"Inter", "Inter Variable", "Geist", "Helvetica Neue", Arial, system-ui, sans-serif',
  height = "780px",
  sceneMinHeight = "300px",
  className = "",
}: DuneHaulFooterProps) {
  const containerRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const roadPathsRef = useRef<(SVGPathElement | null)[]>([]);
  const truckGroupRef = useRef<SVGGElement>(null);
  const truckElementsRef = useRef<Record<string, SVGElement | null>>({});
  const dustPuffsRef = useRef<(SVGCircleElement | null)[]>([]);
  const hitButtonRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const lastHonkTime = useRef(-Infinity);
  const lastSoundTime = useRef(-Infinity);
  const enterTimeRef = useRef<number | null>(null);

  const [isInView, setIsInView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const uid = "dhf" + useId().replace(/[^A-Za-z0-9_-]/g, "");

  const activeTheme = preset === "auto" ? (isDarkMode ? DUNE_PALETTES.dusk : DUNE_PALETTES.apricot) : DUNE_PALETTES[preset] || DUNE_PALETTES.apricot;

  const colors: DuneColorPalette = {
    ...activeTheme,
    ...(palette || {}),
    truck: {
      ...activeTheme.truck,
      ...((palette && palette.truck) || {}),
    },
  };

  const specks = useMemo(() => generateSpecks(seed), [seed]);
  const stars = useMemo(() => generateStars(seed), [seed]);
  const road = useMemo(() => dhfRoad(ROAD_CONTROL_NODES, 36), []);

  const configRef = useRef({ tripSeconds, greet, sound, parallax, night: colors.night });
  useEffect(() => {
    configRef.current = { tripSeconds, greet, sound, parallax, night: colors.night };
  }, [tripSeconds, greet, sound, parallax, colors.night]);

  // Detect dark mode automatically if preset === 'auto'
  useEffect(() => {
    if (preset !== "auto") return;
    const checkDark = () => {
      const el = containerRef.current;
      setIsDarkMode(document.documentElement.classList.contains("dark") || !!(el && el.closest(".dark")));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [preset]);

  // Viewport Intersection Trigger
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          if (enterTimeRef.current === null) {
            enterTimeRef.current = reduced ? -Infinity : performance.now();
          }
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Honk trigger function
  const triggerHonk = useCallback((userTriggered: boolean) => {
    const now = performance.now();
    if (now - lastHonkTime.current < 450) return;
    lastHonkTime.current = now;
    lastSoundTime.current = now;

    if (userTriggered && configRef.current.sound) {
      playTruckAirHorn();
    }

    const bubbleEl = bubbleRef.current;
    if (bubbleEl && bubbleEl.animate) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      bubbleEl.getAnimations().forEach((a) => a.cancel());
      bubbleEl.animate(
        reduced
          ? [
              { opacity: 0 },
              { opacity: 1, offset: 0.1 },
              { opacity: 1, offset: 0.8 },
              { opacity: 0 },
            ]
          : [
              { opacity: 0, transform: "translate(-50%, 6px) scale(.4) rotate(-12deg)" },
              { opacity: 1, transform: "translate(-50%, -4px) scale(1.12) rotate(4deg)", offset: 0.14 },
              { opacity: 1, transform: "translate(-50%, 0) scale(1) rotate(-2deg)", offset: 0.26 },
              { opacity: 1, transform: "translate(-50%, -2px) scale(1) rotate(0deg)", offset: 0.8 },
              { opacity: 0, transform: "translate(-50%, -14px) scale(.9) rotate(0deg)" },
            ],
        { duration: 1300, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    }
  }, []);

  // Animation Loop for Highway Road & Truck Simulation
  useEffect(() => {
    const cont = containerRef.current;
    const scene = sceneRef.current;
    const truckGrp = truckGroupRef.current;
    if (!cont || !scene || !truckGrp) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const totalRoadLength = road[road.length - 1].s;
    const totalCost = dhfTripCost(road);
    const truckParts = truckElementsRef.current;

    let sceneW = scene.clientWidth;
    let sceneH = scene.clientHeight;
    let fit = dhfFit(sceneW, sceneH);

    let rafId = 0;
    let isIntersecting = false;
    let prevTime = performance.now();
    let curDist = reduced ? dhfAtTime(road, 0.62) : -1;
    let nextSpawnTime = 0;
    let greeted = false;
    let pavedDist = -1;

    let mouseNormX = 0;
    let mouseNormY = 0;
    let smoothNormX = 0;
    let smoothNormY = 0;
    let scrollRatio = 1;

    const layerOffsets = DUNE_LAYERS.map(() => [0, 0]);
    const dustPuffs = Array.from({ length: dustPuffsRef.current.length }, () => ({
      x: 0,
      y: 0,
      r: 0,
      born: -1e9,
      life: 900,
    }));
    let nextPuffIdx = 0;
    let puffEmitTime = 0;

    const paveRoad = (dist: number) => {
      if (Math.abs(dist - pavedDist) < 0.5) return;
      pavedDist = dist;
      const halfW = ROAD_WIDTH / 2;
      [
        [-halfW * 1.1, halfW * 1.1],
        [-halfW, halfW],
        [-halfW * 0.9, -halfW * 0.86],
        [halfW * 0.86, halfW * 0.9],
        [-halfW, -halfW * 0.95],
      ].forEach((band, idx) => {
        const pathEl = roadPathsRef.current[idx];
        if (pathEl) pathEl.setAttribute("d", dhfBand(road, band[0], band[1], dist));
      });
    };

    const setPartPath = (key: string, d: string) => {
      const el = truckParts[key];
      if (el) el.setAttribute("d", d);
    };

    const animateFrame = () => {
      rafId = 0;
      const now = performance.now();
      const dt = Math.min(0.05, (now - prevTime) / 1000);
      prevTime = now;

      const conf = configRef.current;
      const enterT = enterTimeRef.current;
      const elapsed = enterT === null ? -1 : now - enterT;

      paveRoad(
        enterT === null
          ? 0
          : elapsed === Infinity || enterT === -Infinity || elapsed > 2400
            ? totalRoadLength + 1
            : dhfAtTime(road, dhfEaseOut((elapsed - 800) / 1600))
      );

      const canRun = enterT !== null && (enterT === -Infinity || elapsed > 1900);
      if (canRun && !reduced) {
        if (curDist < 0) {
          if (now >= nextSpawnTime) curDist = 0;
        } else {
          const pt = dhfAt(road, curDist);
          const speedBoost = 1 + 0.9 * Math.exp(-(now - lastSoundTime.current) / 900);
          curDist += ((totalCost / conf.tripSeconds) * dhfPace(pt.Z) * speedBoost * dt);
          if (curDist > totalRoadLength) {
            curDist = -1;
            nextSpawnTime = now + 1800;
          }
        }
      }

      let truckActive = false;
      if (curDist >= 0) {
        const curPt = dhfAt(road, curDist);
        const [projX, projY] = dhfProject(
          curPt.X + curPt.nX * TRUCK_LATERAL_OFFSET,
          curPt.Z + curPt.nZ * TRUCK_LATERAL_OFFSET
        );
        const truckScale = (FOCAL_LEN / curPt.Z) * TRUCK_SCALE_FACTOR;
        const sinceHonk = now - lastHonkTime.current;
        const bounce = reduced ? 0 : Math.sin(Math.min(1, sinceHonk / 380) * Math.PI) * 3.5;
        const vibration = reduced ? 0 : Math.sin(now / 55) * 0.25;
        const fadeIn = Math.min(1, curDist / 2.5);

        truckGrp.setAttribute("transform", `translate(${projX.toFixed(2)} ${projY.toFixed(2)}) scale(${truckScale.toFixed(4)})`);
        truckGrp.style.opacity = String(fadeIn);

        const truckGeom = dhfTruck(curPt.dx, curPt.dy);
        const liftY = -bounce + vibration;
        const liftPoly = (poly: [number, number][]): [number, number][] =>
          poly.map((p) => [p[0], p[1] + liftY]);

        setPartPath("tHull", dhfPoly(liftPoly(truckGeom.trailer.hull)));
        setPartPath("tTop", dhfPoly(liftPoly(truckGeom.trailer.top)));
        setPartPath("tFront", dhfPoly(liftPoly(truckGeom.trailer.front)));
        setPartPath("tSide", dhfPoly(liftPoly(truckGeom.trailer.side)));
        setPartPath("cHull", dhfPoly(liftPoly(truckGeom.cab.hull)));
        setPartPath("cTop", dhfPoly(liftPoly(truckGeom.cab.top)));
        setPartPath("cSide", dhfPoly(liftPoly(truckGeom.cab.side)));

        const rearEdge = truckGeom.trailer.rear;
        setPartPath(
          "shadow",
          dhfPoly(
            dhfHull([
              [-24, 2],
              [24, 2],
              [rearEdge[2][0] + 2, rearEdge[2][1] + 15],
              [rearEdge[3][0] - 2, rearEdge[3][1] + 15],
            ])
          )
        );

        const wheelsD = (pts: [number, number][], r: number) =>
          pts.map((p) => dhfWheel([p[0], p[1] + liftY], truckGeom.axis, r)).join("");

        setPartPath("wheels", wheelsD(truckGeom.wheels, 6.5));
        setPartPath("hubs", wheelsD(truckGeom.wheels, 2.6));
        setPartPath("cWheels", wheelsD(truckGeom.cabWheels, 6.5));
        setPartPath("cHubs", wheelsD(truckGeom.cabWheels, 2.6));

        if (truckParts.face) {
          truckParts.face.setAttribute("transform", `translate(0 ${liftY.toFixed(2)})`);
        }

        const headlampFade = Math.exp(-sinceHonk / 260);
        if (truckParts.beams) {
          (truckParts.beams as HTMLElement).style.opacity = String(conf.night ? 0.85 : headlampFade * 0.9);
        }
        if (truckParts.flare) {
          (truckParts.flare as HTMLElement).style.opacity = String(Math.max(conf.night ? 0.8 : 0, headlampFade));
        }

        // Dust particle puffs behind wheels
        if (!reduced && canRun && now > puffEmitTime && truckScale > 0.25) {
          puffEmitTime = now + 140;
          const puff = dustPuffs[nextPuffIdx++ % dustPuffs.length];
          const wheelPos = nextPuffIdx % 2 ? rearEdge[3] : rearEdge[2];
          puff.x = projX + wheelPos[0] * truckScale;
          puff.y = projY + (wheelPos[1] + 10) * truckScale;
          puff.r = 3.2 * truckScale;
          puff.born = now;
        }

        // Greet on approach
        if (conf.greet && !greeted && !reduced && curPt.Z < 3.4) {
          greeted = true;
          triggerHonk(false);
        }

        // Position invisible click button and speech bubble over truck
        const groundOffset = layerOffsets[2];
        const screenX = fit.ox + projX * fit.scale + groundOffset[0];
        const screenY = fit.oy + projY * fit.scale + groundOffset[1];
        const clickArea = Math.max(40, 64 * truckScale * fit.scale);

        if (hitButtonRef.current) {
          hitButtonRef.current.style.transform = `translate(${(screenX - clickArea / 2).toFixed(1)}px, ${(screenY - clickArea * 0.95).toFixed(1)}px)`;
          hitButtonRef.current.style.width = `${clickArea.toFixed(1)}px`;
          hitButtonRef.current.style.height = `${clickArea.toFixed(1)}px`;
          hitButtonRef.current.style.visibility = fadeIn > 0.5 && screenY < sceneH + 10 ? "visible" : "hidden";
        }

        if (bubbleRef.current) {
          bubbleRef.current.style.left = `${screenX.toFixed(1)}px`;
          bubbleRef.current.style.top = `${(screenY - 74 * truckScale * fit.scale - 10).toFixed(1)}px`;
        }
        truckActive = true;
      }

      if (!truckActive) {
        truckGrp.style.opacity = "0";
        if (hitButtonRef.current) hitButtonRef.current.style.visibility = "hidden";
      }

      // Render dust particle puffs
      dustPuffs.forEach((puff, idx) => {
        const el = dustPuffsRef.current[idx];
        if (!el) return;
        const progress = (now - puff.born) / puff.life;
        if (progress < 0 || progress > 1) {
          el.style.opacity = "0";
          return;
        }
        el.setAttribute("cx", (puff.x + progress * puff.r * 1.5).toFixed(1));
        el.setAttribute("cy", (puff.y - progress * puff.r * 2).toFixed(1));
        el.setAttribute("r", (puff.r * (0.6 + progress * 1.8)).toFixed(2));
        el.style.opacity = ((1 - progress) * 0.4).toFixed(3);
      });

      // Parallax shifts on canyon sand layers
      if (conf.parallax && !reduced) {
        const bounds = cont.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        scrollRatio = Math.min(1, Math.max(0, (vh - bounds.top) / Math.max(1, bounds.height)));
        smoothNormX += (mouseNormX - smoothNormX) * Math.min(1, dt * 4);
        smoothNormY += (mouseNormY - smoothNormY) * Math.min(1, dt * 4);
      } else {
        scrollRatio = 1;
        smoothNormX = 0;
        smoothNormY = 0;
      }

      DUNE_LAYERS.forEach((layer, idx) => {
        const layerEl = layerRefs.current[idx];
        if (!layerEl) return;
        const shiftX = -smoothNormX * layer.depth * 22;
        const shiftY = (1 - scrollRatio) * layer.depth * 140 - smoothNormY * layer.depth * 8;
        layerOffsets[idx][0] = shiftX;
        layerOffsets[idx][1] = shiftY;
        layerEl.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0)`;
      });

      if (isIntersecting) {
        rafId = requestAnimationFrame(animateFrame);
      }
    };

    const wakeLoop = () => {
      if (!rafId && isIntersecting) {
        prevTime = performance.now();
        rafId = requestAnimationFrame(animateFrame);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = scene.getBoundingClientRect();
      mouseNormX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      mouseNormY = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    };

    const onPointerLeave = () => {
      mouseNormX = 0;
      mouseNormY = 0;
    };

    cont.addEventListener("pointermove", onPointerMove);
    cont.addEventListener("pointerleave", onPointerLeave);

    const resizeObserver = new ResizeObserver(() => {
      sceneW = scene.clientWidth;
      sceneH = scene.clientHeight;
      fit = dhfFit(sceneW, sceneH);
      wakeLoop();
    });
    resizeObserver.observe(scene);

    const interObserver = new IntersectionObserver((entries) => {
      isIntersecting = entries.some((e) => e.isIntersecting);
      if (isIntersecting) wakeLoop();
    });
    interObserver.observe(cont);

    rafId = requestAnimationFrame(animateFrame);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      interObserver.disconnect();
      cont.removeEventListener("pointermove", onPointerMove);
      cont.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [road, triggerHonk]);

  const copyrightText = copyright ?? `© 2026 ${name}. All rights reserved.`;
  const prefixId = (val: string) => `${uid}-${val}`;
  const layerGradients = [colors.far, colors.mid, colors.ground, colors.front, colors.near];

  return (
    <footer
      ref={containerRef}
      className={`dhf-root${isInView ? " dhf-in" : ""}${colors.night ? " dhf-night" : ""}${className ? " " + className : ""}`}
      style={
        {
          minHeight: height,
          "--dhf-card": colors.card,
          "--dhf-ink": colors.ink,
          "--dhf-muted": colors.muted,
          "--dhf-line": colors.line,
          "--dhf-accent": colors.accent,
          "--dhf-accent-ink": colors.accentInk,
          "--dhf-max": maxWidth,
          "--dhf-scene-min": sceneMinHeight,
          "--dhf-sans": fontFamily,
          background: `linear-gradient(180deg, ${colors.sky[0]} 0%, ${colors.sky[0]} 22%, ${colors.sky[1]} 62%)`,
        } as React.CSSProperties
      }
    >
      {/* 3D Desert Canyon Landscape Scene */}
      <div ref={sceneRef} className="dhf-scene" aria-hidden="true">
        <div className="dhf-glow" style={{ background: `radial-gradient(closest-side, ${colors.glow}, transparent)` }} />

        {colors.night && (
          <div className="dhf-stars">
            {stars.map((star, idx) => (
              <i
                key={idx}
                style={{
                  left: `${star[0]}%`,
                  top: `${star[1]}%`,
                  width: `${star[2]}px`,
                  height: `${star[2]}px`,
                  animationDelay: `-${star[3]}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Parallax Dune Layers */}
        {DUNE_LAYERS.map((layer, layerIdx) => {
          const grad = layerGradients[layerIdx];
          return (
            <div key={layer.key} className={`dhf-layer dhf-layer-${layer.key}`} style={{ "--dhf-i": layerIdx } as React.CSSProperties}>
              <div ref={(el) => { layerRefs.current[layerIdx] = el; }} className="dhf-drift">
                <svg viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} preserveAspectRatio="xMidYMax slice">
                  <defs>
                    <radialGradient
                      id={prefixId("d" + layerIdx)}
                      cx="0.4"
                      cy="0.08"
                      r="0.8"
                      fx="0.36"
                      fy="0.04"
                    >
                      <stop offset="0" stopColor={grad[0]} />
                      <stop offset="0.42" stopColor={grad[1]} />
                      <stop offset="1" stopColor={grad[2]} />
                    </radialGradient>

                    {layerIdx === 1 && (
                      <linearGradient id={prefixId("haze")} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor={colors.sky[1]} stopOpacity="0" />
                        <stop offset="0.55" stopColor={colors.sky[1]} stopOpacity={colors.night ? 0.35 : 0.6} />
                        <stop offset="1" stopColor={colors.sky[1]} stopOpacity="0" />
                      </linearGradient>
                    )}
                  </defs>

                  {layerIdx === 1 && (
                    <rect x="-300" y="430" width={WORLD_W + 600} height="230" fill={`url(#${prefixId("haze")})`} />
                  )}

                  {/* Desert Shrubs */}
                  {layerIdx === 0 &&
                    DESERT_SHRUBS.map((shrub, sIdx) => (
                      <g key={sIdx} className="dhf-shrub" style={{ "--dhf-sd": sIdx } as React.CSSProperties}>
                        <defs>
                          <radialGradient
                            id={prefixId("s" + sIdx)}
                            gradientUnits="userSpaceOnUse"
                            cx={shrub.x - shrub.r * 0.35}
                            cy={shrub.y - shrub.r * 0.55}
                            r={shrub.r * 1.5}
                          >
                            <stop offset="0" stopColor={colors.shrub[0]} />
                            <stop offset="1" stopColor={colors.shrub[1]} />
                          </radialGradient>
                        </defs>
                        {SHRUB_PETAL_OFFSETS.map((offset, pIdx) => (
                          <circle
                            key={pIdx}
                            cx={shrub.x + offset[0] * shrub.r}
                            cy={shrub.y + offset[1] * shrub.r}
                            r={offset[2] * shrub.r}
                            fill={`url(#${prefixId("s" + sIdx)})`}
                          />
                        ))}
                        {SHRUB_PETAL_OFFSETS.map((offset, pIdx) => (
                          <circle
                            key={"f" + pIdx}
                            cx={shrub.x + (offset[0] * 0.8 + 0.12) * shrub.r}
                            cy={shrub.y + (offset[1] * 0.7 - 0.1) * shrub.r}
                            r={shrub.r * 0.06}
                            fill={colors.specks[pIdx % colors.specks.length]}
                            opacity="0.7"
                          />
                        ))}
                      </g>
                    ))}

                  {/* Sand Dune Hills and Ridge Crests */}
                  {layer.domes.map((dome, dIdx) => (
                    <g key={dIdx}>
                      <path d={dhfDomePath(dome)} fill={`url(#${prefixId("d" + layerIdx)})`} />
                      <path
                        d={dhfCrestPath(dome)}
                        fill="none"
                        stroke={grad[0]}
                        strokeWidth={1.5 + layerIdx * 0.5}
                        strokeLinecap="round"
                        opacity={colors.night ? 0.35 : 0.7}
                      />
                      {specks[layerIdx][dIdx].map((sp, spIdx) => (
                        <circle
                          key={spIdx}
                          cx={sp[0].toFixed(1)}
                          cy={sp[1].toFixed(1)}
                          r={sp[2].toFixed(2)}
                          fill={colors.specks[sp[3] % colors.specks.length]}
                          opacity={(sp[4] * (colors.night ? 0.55 : 1)).toFixed(2)}
                        />
                      ))}
                    </g>
                  ))}

                  {/* Highway Road, 3D Truck & Particle Smoke Layer */}
                  {layerIdx === 2 && (
                    <g>
                      <defs>
                        <linearGradient id={prefixId("fade")} gradientUnits="userSpaceOnUse" x1="0" y1="586" x2="0" y2="640">
                          <stop offset="0" stopColor="#fff" stopOpacity="0" />
                          <stop offset="1" stopColor="#fff" stopOpacity="1" />
                        </linearGradient>
                        <mask id={prefixId("mask")} maskUnits="userSpaceOnUse" x="-300" y="0" width={WORLD_W + 600} height={WORLD_H + 200}>
                          <rect x="-300" y="560" width={WORLD_W + 600} height={WORLD_H} fill={`url(#${prefixId("fade")})`} />
                        </mask>
                        <linearGradient id={prefixId("road")} gradientUnits="userSpaceOnUse" x1="0" y1="586" x2="0" y2="900">
                          <stop offset="0" stopColor={colors.road} stopOpacity="0.85" />
                          <stop offset="1" stopColor={colors.road} />
                        </linearGradient>
                        <linearGradient id={prefixId("beam")} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor={colors.truck.lights} stopOpacity="0.85" />
                          <stop offset="1" stopColor={colors.truck.lights} stopOpacity="0" />
                        </linearGradient>
                        <filter id={prefixId("soft")} x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" />
                        </filter>
                      </defs>

                      <g mask={`url(#${prefixId("mask")})`}>
                        <path ref={(el) => { roadPathsRef.current[0] = el; }} fill={colors.roadShade} opacity={colors.night ? 0.6 : 0.32} />
                        <path ref={(el) => { roadPathsRef.current[1] = el; }} fill={`url(#${prefixId("road")})`} />
                        <path ref={(el) => { roadPathsRef.current[2] = el; }} fill={colors.roadEdge} opacity="0.75" />
                        <path ref={(el) => { roadPathsRef.current[3] = el; }} fill={colors.roadEdge} opacity="0.75" />
                        <path ref={(el) => { roadPathsRef.current[4] = el; }} fill="#fff" opacity={colors.night ? 0.08 : 0.35} />
                      </g>

                      {/* Dust particle puffs */}
                      {Array.from({ length: 10 }, (_, i) => (
                        <circle
                          key={i}
                          ref={(el) => { dustPuffsRef.current[i] = el; }}
                          fill={colors.road}
                          filter={`url(#${prefixId("soft")})`}
                          style={{ opacity: 0 }}
                        />
                      ))}

                      {/* 3D Semi-Truck Vector Mesh */}
                      <g ref={truckGroupRef} style={{ opacity: 0 }}>
                        <path ref={(el) => { truckElementsRef.current.shadow = el; }} fill={colors.roadShade} opacity="0.32" filter={`url(#${prefixId("soft")})`} />
                        <path
                          ref={(el) => { truckElementsRef.current.beams = el; }}
                          d="M-16 -16 L-60 70 L60 70 L16 -16 Z"
                          fill={`url(#${prefixId("beam")})`}
                          style={{ opacity: 0, mixBlendMode: "screen" }}
                        />
                        <path ref={(el) => { truckElementsRef.current.wheels = el; }} fill={colors.truck.wheel} />
                        <path ref={(el) => { truckElementsRef.current.hubs = el; }} fill={colors.truck.cabSide} />
                        <path ref={(el) => { truckElementsRef.current.tHull = el; }} fill={colors.truck.trailerSide} />
                        <path ref={(el) => { truckElementsRef.current.tSide = el; }} fill={colors.truck.trailerSide} />
                        <path ref={(el) => { truckElementsRef.current.tFront = el; }} fill={colors.truck.trailer} />
                        <path ref={(el) => { truckElementsRef.current.tTop = el; }} fill={colors.truck.trailerTop} />
                        <path ref={(el) => { truckElementsRef.current.cWheels = el; }} fill={colors.truck.wheel} />
                        <path ref={(el) => { truckElementsRef.current.cHubs = el; }} fill={colors.truck.cabSide} />
                        <path ref={(el) => { truckElementsRef.current.cHull = el; }} fill={colors.truck.cabSide} />
                        <path ref={(el) => { truckElementsRef.current.cSide = el; }} fill={colors.truck.cabSide} />
                        <path ref={(el) => { truckElementsRef.current.cTop = el; }} fill={colors.truck.cabTop} />
                        <g ref={(el) => { truckElementsRef.current.face = el; }}>
                          <TruckFace colors={colors.truck} />
                          <path
                            ref={(el) => { truckElementsRef.current.flare = el; }}
                            d="M-19 -15 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M9 -15 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0"
                            fill={colors.truck.lights}
                            filter={`url(#${prefixId("soft")})`}
                            style={{ opacity: 0 }}
                          />
                        </g>
                      </g>
                    </g>
                  )}
                </svg>
              </div>
            </div>
          );
        })}

        {/* Film grain texture */}
        <svg className="dhf-grain" aria-hidden="true">
          <defs>
            <filter id={prefixId("grain")}>
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter={`url(#${prefixId("grain")})`} />
        </svg>
      </div>

      {/* Floating Modern Content Card */}
      <div className="dhf-wrap">
        <div className="dhf-card">
          <div className="dhf-top">
            <a className="dhf-brand dhf-r" style={{ "--d": 0 } as React.CSSProperties} href={brandHref}>
              {logo ?? <TruckMark />}
              <span>{name}</span>
            </a>

            <div className="dhf-cols">
              {columns.map((col, idx) => (
                <nav key={col.title} className="dhf-col" aria-label={col.title}>
                  <h3 className="dhf-r" style={{ "--d": 1 + idx } as React.CSSProperties}>
                    {col.title}
                  </h3>
                  <ul>
                    {col.links.map((link, lIdx) => (
                      <li key={link.label} className="dhf-r" style={{ "--d": 1.6 + idx + lIdx * 0.45 } as React.CSSProperties}>
                        <a className="dhf-link" href={link.href || "#"}>
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          <div className="dhf-rule" />

          <div className="dhf-bar">
            <p className="dhf-r" style={{ "--d": 4.5 } as React.CSSProperties}>
              {copyrightText}
            </p>

            {socials.length > 0 && (
              <ul className="dhf-social">
                {socials.map((soc, idx) => (
                  <li key={soc.icon + idx} className="dhf-r" style={{ "--d": 4.6 + idx * 0.4 } as React.CSSProperties}>
                    <a href={soc.href || "#"} aria-label={soc.label || SOCIAL_LABELS[soc.icon]}>
                      <SocialIcon icon={soc.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="dhf-spacer" />

      {/* Interactive Truck Hit Area & Speech Bubble */}
      <button
        ref={hitButtonRef}
        type="button"
        className="dhf-hit"
        aria-label="Honk the truck's horn"
        onClick={() => triggerHonk(true)}
      />
      <div ref={bubbleRef} className="dhf-bubble" aria-hidden="true">
        {honk}
      </div>
    </footer>
  );
}

export default DuneHaulFooter;
