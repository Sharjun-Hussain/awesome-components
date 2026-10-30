import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import "./FruitStickerFooter.exact.css";

export const meta = {
  title: "Inzeedo Fruit Sticker Footer",
  description: "Playful interactive footer featuring physics-driven draggable fruit vinyl stickers (strawberry, banana, chili, orange, cherry, lemon, watermelon, pear), animated multi-lingual farewell cursive script, and 3D peel/slap interactions.",
  category: 'footers',
  fullWidth: true,
  thumbnail: true,
};

// Types & Interfaces
export interface FruitStickerConfig {
  fruit: string;
  x: number;
  y: number;
  size?: number;
  rotate?: number;
  shape?: "round" | "oval";
  behind?: boolean;
  color?: string;
}

export interface FruitFooterLink {
  label: string;
  href?: string;
}

// Cursive script drawing font generator
const SCRIPT_TOP = -230;
const SCRIPT_BOTTOM = 125;
const ENTRY_M = "M0,-14C6,-20 ";
const outCurve = (m: number) => ` ${m - 7},-7 ${m},-14`;
const outFlatCurve = (m: number) => ` ${m - 6},-12 ${m},-14`;
const loopUp = (m: number) =>
  `${ENTRY_M}${m + 18},-40 ${m + 38},-108C${m + 52},-152 ${m + 48},-200 ${m + 26},-198C${m + 4},-196 ${m - 2},-150 ${m},-110`;
const loopDown = (m: number, x: number) =>
  `C${m},-30 ${m - 1},30 ${m - 6},62C${m - 12},94 ${m - 42},104 ${m - 48},82C${m - 54},58 ${m - 14},8 ${m + 12},-6C${x - 12},-12${outFlatCurve(x)}`;
const entryStroke = (m: number) => `${ENTRY_M}${m - 4},-50 ${m},-96`;
const archCurve = (m: number, x: number) =>
  `C${m + 4},-60 ${m + 14},-98 ${(m + x) / 2 + 2},-98C${x + 6},-98 ${x + 4},-70 ${x + 1},-44`;
const stemDown = (m: number, x: number) =>
  `C${m - 2},-18 ${m - 4},-24 ${m - 2},-12C${m},-2 ${m + 8},-1 ${m + 14},-4C${x - 12},-6${outCurve(x)}`;
const stemStraight = (m: number, y1: number, y2: number) => `M${m},${y1}L${m},${y2}`;

// Cursive Letter Definitions
const GLYPH_MAP: Record<string, [number, string]> = {
  a: [76, `${ENTRY_M}24,-52 38,-72C50,-88 64,-88 64,-70C64,-44 48,-18 36,-12C20,-4 10,-20 18,-44C24,-64 46,-74 58,-72M58,-74${stemDown(56, 76)}`],
  b: [80, `${loopUp(20)}C${20 - 2},-70 20,-30 24,-14C28,-2 46,-2 52,-10C58,-18 64,-44 64,-60C64,-72 54,-72 50,-62C48,-56 50,-48 58,-48C66,-48 74,-28 80,-14`],
  c: [64, `${ENTRY_M}20,-40 34,-64C46,-84 60,-84 60,-70C60,-58 48,-48 40,-44C26,-36 20,-20 28,-10C34,-2 48,-2 54,-8C58,-12 60,-14 64,-14`],
  d: [80, `${ENTRY_M}26,-52 40,-72C52,-88 66,-88 66,-70C66,-44 50,-18 38,-12C22,-4 12,-20 20,-44C26,-64 48,-74 60,-72M62,-72C60,-110 56,-160 52,-194C50,-204 60,-204 62,-192C66,-150 62,-70 ${stemDown(60, 80)}`],
  e: [60, `${ENTRY_M}18,-36 30,-58C40,-76 54,-76 52,-58C50,-40 32,-30 24,-24C16,-18 20,-4 32,-4C44,-4 52,-10 60,-14`],
  f: [80, `${loopUp(24)}C24,-70 24,-10 24,30C24,70 18,102 12,88C8,74 24,14 42,-14C52,-30 62,-36 68,-36C74,-36 74,-26 70,-16C72,-15 76,-14 80,-14`],
  g: [78, `${ENTRY_M}24,-52 38,-72C50,-88 64,-88 64,-70C64,-44 48,-18 36,-12C20,-4 10,-20 18,-44C24,-64 46,-74 58,-72M58,-72${loopDown(58, 78)}`],
  h: [84, `${loopUp(20)}C18,-70 18,-20 18,-4${archCurve(18, 62)}${stemDown(62, 84)}`],
  i: [52, `${ENTRY_M}16,-40 26,-64C30,-72 38,-72 40,-64M38,-64${stemDown(36, 52)}M38,-106L38,-106`],
  j: [56, `${ENTRY_M}18,-40 28,-64C32,-72 40,-72 42,-64M40,-64${loopDown(40, 56)}M42,-106L42,-106`],
  k: [80, `${loopUp(20)}C18,-70 18,-20 18,-4${archCurve(18, 56)}C58,-28 50,-32 46,-40C42,-48 48,-56 56,-56C62,-56 64,-50 64,-42C64,-34 56,-24 54,-18C52,-12 56,-6 64,-4C70,-2 74,-8 80,-14`],
  l: [64, `${loopUp(20)}C18,-70 18,-20 ${stemDown(18, 64)}`],
  m: [126, `${entryStroke(20)}${stemStraight(20, -96, -4)}${archCurve(20, 56)}${stemStraight(56, -44, -4)}${archCurve(56, 96)}${stemDown(96, 126)}`],
  n: [90, `${entryStroke(20)}${stemStraight(20, -96, -4)}${archCurve(20, 60)}${stemDown(60, 90)}`],
  o: [70, `${ENTRY_M}22,-52 36,-72C48,-88 62,-88 62,-70C62,-44 46,-18 34,-12C18,-4 8,-20 16,-44C22,-64 44,-74 56,-72C60,-70 64,-72 66,-78C68,-84 62,-86 58,-84C54,-82 58,-74 64,-74C70,-74 70,-64 70,-60`],
  p: [82, `${ENTRY_M}22,-44 32,-72C36,-82 46,-80 46,-70M44,-70C42,-20 38,40 34,80M38,-44${archCurve(38, 62)}C64,-20 62,-4 52,2C42,8 36,-4 38,-20M56,-6C64,-2 74,-6 82,-14`],
  q: [80, `${ENTRY_M}24,-52 38,-72C50,-88 64,-88 64,-70C64,-44 48,-18 36,-12C20,-4 10,-20 18,-44C24,-64 46,-74 58,-72M58,-72C58,-20 54,40 50,80C50,92 60,94 66,82C72,70 76,40 76,20C76,0 60,-10 60,-10C64,-10 72,-12 80,-14`],
  r: [68, `${ENTRY_M}18,-40 28,-68C32,-78 44,-80 48,-74C52,-68 50,-62 44,-64C38,-66 38,-74 44,-74C50,-74 56,-70 56,-60C56,-44 46,-24 46,-14C46,-2 56,-2 62,-8C64,-10 66,-12 68,-14`],
  s: [66, `${ENTRY_M}20,-40 32,-68C38,-82 52,-84 52,-72C52,-58 38,-44 30,-34C22,-24 20,-12 28,-4C36,4 48,2 54,-4C58,-8 60,-12 66,-14`],
  t: [64, `${ENTRY_M}18,-40 28,-70C34,-90 40,-120 40,-150C40,-162 48,-160 48,-148C48,-120 44,-80 ${stemDown(42, 64)}M20,-96L58,-96`],
  u: [84, `${ENTRY_M}18,-40 28,-68C32,-78 40,-78 40,-64M38,-64C36,-40 34,-4 54,-4C70,-4 76,-50 78,-80M78,-80${stemDown(76, 84)}`],
  v: [78, `${ENTRY_M}18,-40 28,-68C32,-78 40,-78 40,-64M38,-64C36,-40 34,-4 54,-4C66,-4 74,-30 76,-60C78,-72 68,-72 64,-64C62,-58 64,-52 70,-52C76,-52 76,-44 78,-38`],
  w: [124, `${entryStroke(18)}C16,-60 14,-4 34,-4C50,-4 56,-50 58,-80C58,-50 62,-4 82,-4C98,-4 106,-50 104,-96C106,-60 110,-24 118,-18C120,-16 122,-15 124,-14`],
  x: [92, `${ENTRY_M}18,-60 28,-80C38,-100 54,-100 54,-80C54,-50 50,-20 60,-8C66,-2 72,-4 80,-8C84,-10${outCurve(92)}M20,-10C38,-40 58,-74 78,-98`],
  y: [96, `${entryStroke(18)}C16,-60 12,-30 14,-16C16,-2 30,-2 42,-6C56,-12 66,-50 70,-96${loopDown(70, 96)}`],
  z: [88, `${ENTRY_M}20,-60 36,-90C46,-104 70,-104 64,-80C58,-60 34,-34 18,-10C34,-30 64,-24 60,10C56,60 20,96 12,72C6,52 40,-6 70,-12C76,-13 82,-13 88,-14`],
  "!": [56, "M42,-194C38,-150 32,-96 28,-52M22,-8L22,-8"],
  "?": [72, "M10,-160C14,-196 66,-200 62,-160C60,-128 30,-112 30,-60M26,-8L26,-8"],
  ".": [36, "M16,-8L16,-8"],
  ",": [36, "M20,-8C18,10 12,22 4,30"],
  "'": [30, "M22,-192L16,-140"],
  " ": [44, ""],
};

const normalizeText = (m: string) =>
  m
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‘’]/g, "'")
    .toLowerCase();

function calcPathLength(d: string): number {
  const coords = (d.match(/-?\d*\.?\d+/g) || []).map(Number);
  const commands = d.match(/[MLC]/g) || [];
  let cIdx = 0;
  let curX = 0;
  let curY = 0;
  let total = 0;

  for (const cmd of commands) {
    if (cmd === "M") {
      curX = coords[cIdx++];
      curY = coords[cIdx++];
    } else if (cmd === "L") {
      const x = coords[cIdx++];
      const y = coords[cIdx++];
      total += Math.hypot(x - curX, y - curY);
      curX = x;
      curY = y;
    } else if (cmd === "C") {
      const cp = coords.slice(cIdx, cIdx + 6);
      cIdx += 6;
      let prevX = curX;
      let prevY = curY;
      for (let step = 1; step <= 16; step++) {
        const t = step / 16;
        const mt = 1 - t;
        const x = mt * mt * mt * curX + 3 * mt * mt * t * cp[0] + 3 * mt * t * t * cp[2] + t * t * t * cp[4];
        const y = mt * mt * mt * curY + 3 * mt * mt * t * cp[1] + 3 * mt * t * t * cp[3] + t * t * t * cp[5];
        total += Math.hypot(x - prevX, y - prevY);
        prevX = x;
        prevY = y;
      }
      curX = cp[4];
      curY = cp[5];
    }
  }
  return total;
}

interface ScriptGlyph {
  ch: string;
  x: number;
  strokes: { d: string; len: number; delay: number; dur: number }[];
  dots: { x: number; y: number; delay: number }[];
}

function layoutCursiveWord(word: string) {
  const glyphs: { ch: string; x: number; strokes: { d: string; len: number }[]; dots: [number, number][] }[] = [];
  let curX = 0;
  for (const ch of normalizeText(word)) {
    const glyphData = GLYPH_MAP[ch] ?? GLYPH_MAP[" "];
    const strokes: { d: string; len: number }[] = [];
    const dots: [number, number][] = [];
    for (const sub of glyphData[1].split(/(?=M)/)) {
      if (!sub) continue;
      const dotMatch = sub.match(/^M(-?[\d.]+),(-?[\d.]+)L\1,\2$/);
      if (dotMatch) {
        dots.push([+dotMatch[1], +dotMatch[2]]);
      } else {
        strokes.push({ d: sub, len: calcPathLength(sub) });
      }
    }
    glyphs.push({ ch, x: curX, strokes, dots });
    curX += glyphData[0];
  }

  let delayAccum = 0;
  const SPEED = 1700;
  const GAP = 0.05;

  const timedGlyphs: ScriptGlyph[] = glyphs.map((g) => {
    const timedStrokes = g.strokes.map((s) => {
      const dur = Math.max(0.08, s.len / SPEED);
      const stroke = { ...s, delay: delayAccum, dur };
      delayAccum += dur + GAP;
      return stroke;
    });
    const timedDots = g.dots.map((d) => {
      const dot = { x: d[0], y: d[1], delay: delayAccum };
      delayAccum += 0.08;
      return dot;
    });
    return { ...g, strokes: timedStrokes, dots: timedDots };
  });

  return { glyphs: timedGlyphs, width: curX, total: delayAccum };
}

const springStep = (pos: number, vel: number, target: number, stiffness: number, damping: number): [number, number] => {
  const force = (vel + (target - pos) * stiffness) * damping;
  return [pos + force, force];
};

const clampVal = (val: number, min: number, max: number) =>
  min > max ? (min + max) / 2 : Math.min(max, Math.max(min, val));

// Fruit sticker color mappings and names
export const FRUIT_TYPES = ["strawberry", "banana", "chili", "orange", "cherry", "lemon", "watermelon", "pear"];

export const FRUIT_COLORS: Record<string, string> = {
  strawberry: "#f7cf45",
  banana: "#3f6fe6",
  chili: "#f6a9c4",
  orange: "#cdb8f2",
  cherry: "#bfe5c6",
  lemon: "#ff8f70",
  watermelon: "#fde7a6",
  pear: "#ffb8a6",
};

export const FRUIT_LABELS: Record<string, string> = {
  strawberry: "Strawberry",
  banana: "Banana",
  chili: "Chili",
  orange: "Orange",
  cherry: "Cherries",
  lemon: "Lemon",
  watermelon: "Watermelon",
  pear: "Pear",
};

// Fruit Vector Graphic Illustrations
const shine = (cx: number, cy: number, rx: number, ry: number, rot: number) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" opacity={0.38} transform={`rotate(${rot} ${cx} ${cy})`} />
);

const leaf = (dLeaf: string, dVein: string) => (
  <React.Fragment>
    <path d={dLeaf} fill="#46ad4f" />
    <path d={dVein} fill="none" stroke="#2f8a3c" strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
  </React.Fragment>
);

const STRAWBERRY_SEEDS = [
  [-21, -13], [-6, -15], [9, -15], [24, -12], [-27, 2], [-13, 0], [2, 0], [17, 0], [29, 3],
  [-18, 14], [-3, 15], [12, 14], [-9, 27], [5, 27],
];

export const FRUIT_SVGS: Record<string, React.ReactNode> = {
  strawberry: (
    <g>
      <path fill="#e8333d" d="M0,40C-13,40 -37,17 -39,-5C-41,-22 -29,-31 -15,-29C-8,-28 -3,-26 0,-25C3,-26 8,-28 15,-29C29,-31 41,-22 39,-5C37,17 13,40 0,40Z" />
      <path fill="#c51f2d" d="M39,-5C37,17 13,40 0,40C11,31 27,11 29,-9C30,-19 27,-26 22,-29C33,-28 41,-20 39,-5Z" />
      {shine(-24, -12, 7, 3.6, -38)}
      {STRAWBERRY_SEEDS.map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={1.7} ry={3} fill="#8c1121" opacity={0.75} transform={`rotate(${x * 0.6} ${x} ${y})`} />
      ))}
      <path fill="#43ab4c" d="M0,-24C-6,-34 -20,-34 -25,-26C-21,-22 -14,-22 -8,-24C-14,-18 -16,-12 -12,-8C-6,-14 0,-18 0,-24ZM0,-24C6,-34 20,-34 25,-26C21,-22 14,-22 8,-24C14,-18 16,-12 12,-8C6,-14 0,-18 0,-24ZM0,-24C-4,-36 4,-38 0,-44C-4,-38 -2,-32 0,-24Z" />
    </g>
  ),
  banana: (
    <g transform="rotate(-18) translate(0,-4)">
      <path fill="#ffd52c" d="M-36,-20C-16,8 8,26 40,28C42,28 44,24 43,22C24,10 2,-4 -18,-24C-24,-30 -32,-30 -36,-20Z" />
      <path fill="#f0be1a" d="M-36,-20C-16,8 8,26 40,28C38,24 20,10 -2,-6C-16,-18 -26,-26 -36,-20Z" />
      {shine(2, 8, 14, 3.6, 26)}
      <path fill="#533b18" d="M-36,-20C-38,-22 -42,-20 -44,-16C-42,-14 -38,-16 -36,-20ZM40,28L44,30L42,26Z" />
    </g>
  ),
  chili: (
    <g transform="rotate(32) translate(0,-2)">
      <path fill="#dd1f26" d="M18,-11C23,-1 18,17 7,33C-3,47 -17,55 -25,57C-23,53 -19,43 -13,31C-5,15 -1,-3 3,-11C6,-19 14,-18 18,-11Z" />
      <path fill="#b51219" d="M-25,57C-17,55 -3,47 7,33C18,17 23,-1 18,-11C15,-6 11,8 3,21C-5,34 -15,47 -25,57Z" />
      <path d="M12,-3C15,7 13,17 7,27" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" opacity={0.42} />
      <path fill="#4aa944" d="M19,-11C23,-18 32,-18 34,-10C35,-4 29,0 24,-2C22,-6 20,-8 19,-11Z" />
      <path d="M30,-15C31,-24 37,-29 44,-27" fill="none" stroke="#3a8d39" strokeWidth={4} strokeLinecap="round" />
    </g>
  ),
  orange: (
    <g transform="scale(1.16)">
      <circle r={32} fill="#ff8b1d" />
      <path fill="#ee700f" d="M32,0A32,32 0 0 1 -20,25C2,30 26,20 32,0Z" />
      {shine(-13, -15, 8, 4.2, -38)}
      {[[-4, -2], [8, -14], [14, 4], [-14, 12], [2, 14], [-20, -2], [18, -6]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.1} fill="#d9620b" opacity={0.55} />
      ))}
      <circle cx={0} cy={-30} r={3.4} fill="#3b7a2c" />
      {leaf("M2,-31C8,-44 22,-47 29,-41C23,-32 11,-28 2,-31Z", "M5,-32C12,-37 19,-40 25,-41")}
    </g>
  ),
  cherry: (
    <g transform="translate(0,4)">
      <path d="M-14,4C-12,-14 0,-30 9,-39M16,8C15,-8 13,-26 9,-39" fill="none" stroke="#6f4a26" strokeWidth={3.6} strokeLinecap="round" />
      {leaf("M9,-39C17,-51 33,-50 38,-42C28,-35 18,-35 9,-39Z", "M12,-39C20,-42 27,-43 34,-43")}
      <circle cx={-14} cy={16} r={16} fill="#d21f37" />
      <path fill="#a8142a" d="M2,16A16,16 0 0 1 -26,26C-14,34 2,30 2,16Z" />
      {shine(-20, 9, 4.4, 2.6, -40)}
      <circle cx={16} cy={20} r={16} fill="#e72c45" />
      <path fill="#b8182f" d="M32,20A16,16 0 0 1 4,30C16,38 32,34 32,20Z" />
      {shine(10, 13, 4.4, 2.6, -40)}
    </g>
  ),
  lemon: (
    <g transform="rotate(-22) scale(1.12)">
      <path fill="#ffe24b" d="M-34,0C-34,-18 -17,-28 0,-28C17,-28 34,-18 34,0C34,18 17,28 0,28C-17,28 -34,18 -34,0ZM-33,-4L-41,-2L-33,4ZM33,-4L41,-1L33,4Z" />
      <path fill="#f3c22a" d="M34,0C34,18 17,28 0,28C-17,28 -34,18 -34,0C-24,16 20,18 34,0Z" />
      {shine(-12, -14, 9, 4, -8)}
      {[[-6, -4], [10, -8], [16, 6], [-18, 6], [2, 10]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1} fill="#d9a514" opacity={0.6} />
      ))}
      {leaf("M30,-14C36,-28 50,-30 56,-24C50,-14 38,-10 30,-14Z", "M33,-15C40,-20 46,-23 52,-24")}
    </g>
  ),
  watermelon: (
    <g transform="translate(0,-4) rotate(8)">
      <path fill="#3d9a49" d="M-42,-10A42,42 0 0 0 42,-10Z" />
      <path fill="#2f7f3b" d="M-42,-10A42,42 0 0 0 42,-10L36,-10A36,36 0 0 1 -36,-10Z" opacity={0.6} />
      <path fill="#e9f6cf" d="M-37,-10A37,37 0 0 0 37,-10Z" />
      <path fill="#ff5068" d="M-33,-10A33,33 0 0 0 33,-10Z" />
      <path fill="#e53a55" d="M33,-10A33,33 0 0 1 -6,22C14,16 28,4 33,-10Z" />
      {[[-18, -2], [-6, 4], [8, 2], [20, -2], [-10, 12], [4, 14]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={1.8} ry={3} fill="#2a1717" transform={`rotate(${-x * 0.8} ${x} ${y})`} />
      ))}
      <path d="M-28,-6C-20,-6 -14,-6 -8,-6" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" opacity={0.45} />
    </g>
  ),
  pear: (
    <g transform="rotate(10) translate(0,4)">
      <path fill="#b6d74b" d="M0,-30C10,-30 12,-18 14,-10C16,0 30,6 30,20C30,34 16,40 0,40C-16,40 -30,34 -30,20C-30,6 -16,0 -14,-10C-12,-18 -10,-30 0,-30Z" />
      <path fill="#97bc35" d="M14,-10C16,0 30,6 30,20C30,34 16,40 0,40C14,32 22,20 18,8C16,2 12,-4 14,-10Z" />
      {shine(-14, 12, 5, 8, 18)}
      <path d="M0,-28C0,-36 2,-42 6,-46" fill="none" stroke="#6f4a26" strokeWidth={3.6} strokeLinecap="round" />
      {leaf("M3,-38C10,-50 24,-50 28,-43C20,-36 11,-35 3,-38Z", "M6,-39C13,-42 19,-43 24,-43")}
    </g>
  ),
};

// Default Inzeedo Branding Configurations
const DEFAULT_STICKERS: FruitStickerConfig[] = [
  { fruit: "strawberry", x: 2, y: 66, size: 0.92, rotate: -8 },
  { fruit: "banana", x: 10.5, y: 98, size: 0.72, rotate: 10 },
  { fruit: "chili", x: 63, y: -28, size: 0.64, rotate: -10, shape: "oval", behind: true },
  { fruit: "orange", x: 99, y: 84, size: 0.56, rotate: 6, shape: "oval" },
];

const DEFAULT_FAREWELLS = ["inzeedo!", "bye!", "ciao!", "later!", "adios!", "cheers!"];

const DEFAULT_LINES = [
  "Don’t forget to build something extraordinary with us.",
  "Hope to see your vision come to life!",
];

const DEFAULT_LINKS: FruitFooterLink[] = [
  { label: "inzeedo.lk", href: "https://inzeedo.lk" },
  { label: "GitHub", href: "https://github.com/inzeedo" },
  { label: "LinkedIn", href: "https://linkedin.com/company/inzeedo" },
  { label: "X / Twitter", href: "https://x.com/inzeedo" },
];

export interface FruitStickerFooterProps {
  headline?: string;
  farewells?: string[];
  lines?: string[];
  email?: string;
  links?: FruitFooterLink[];
  name?: string;
  year?: number;
  stickers?: FruitStickerConfig[];
  accent?: string;
  ink?: string;
  muted?: string;
  background?: string;
  fontSans?: string;
  height?: string;
  onFarewell?: (index: number, word: string) => void;
  onStickerSwap?: (index: number, fruit: string) => void;
  onCopy?: (email: string) => void;
  onLinkClick?: (label: string, href?: string) => void;
  onBackToTop?: () => void;
  className?: string;
}

export function FruitStickerFooter({
  headline = "Thank You,",
  farewells = DEFAULT_FAREWELLS,
  lines = DEFAULT_LINES,
  email = "hello@inzeedo.lk",
  links = DEFAULT_LINKS,
  name = "Inzeedo Studio",
  year = 2026,
  stickers = DEFAULT_STICKERS,
  accent = "#ff5a3c",
  ink = "var(--color-foreground, #141210)",
  muted = "var(--color-muted-foreground, #6f6a63)",
  background = "var(--color-background, #f4f1ea)",
  fontSans = '"Satoshi","General Sans","Plus Jakarta Sans","Manrope",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
  height = "100svh",
  onFarewell,
  onStickerSwap,
  onCopy,
  onLinkClick,
  onBackToTop,
  className = "",
}: FruitStickerFooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const stickerWrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const stickerButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const farewellList = farewells.length ? farewells : ["bye!"];
  const [isInView, setIsInView] = useState(false);
  const [farewellIdx, setFarewellIdx] = useState(0);
  const [isAnimatingFarewell, setIsAnimatingFarewell] = useState(false);
  const [hasChangedFarewell, setHasChangedFarewell] = useState(false);
  const [activeFruits, setActiveFruits] = useState<string[]>(() => stickers.map((s) => s.fruit));
  const [topStickerIdx, setTopStickerIdx] = useState(-1);
  const [draggedIdx, setDraggedIdx] = useState(-1);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const currentFarewell = farewellList[farewellIdx % farewellList.length];
  const cursiveLayout = useMemo(() => layoutCursiveWord(currentFarewell), [currentFarewell]);

  const physicsRef = useRef<{
    raf: number;
    reduced: boolean;
    px: number;
    py: number;
    tpx: number;
    tpy: number;
    s: {
      ox: number;
      oy: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      tilt: number;
      lift: number;
      liftT: number;
      drag: boolean;
      moved: boolean;
      sx: number;
      sy: number;
      ox0: number;
      oy0: number;
      min: [number, number];
      max: [number, number];
    }[];
  }>({
    raf: 0,
    reduced: false,
    px: 0,
    py: 0,
    tpx: 0,
    tpy: 0,
    s: stickers.map(() => ({
      ox: 0,
      oy: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      tilt: 0,
      lift: 0,
      liftT: 0,
      drag: false,
      moved: false,
      sx: 0,
      sy: 0,
      ox0: 0,
      oy0: 0,
      min: [-1, -1],
      max: [1, 1],
    })),
  });

  useEffect(() => {
    if (physicsRef.current.s.length !== stickers.length) {
      physicsRef.current.s = stickers.map(
        (_, i) =>
          physicsRef.current.s[i] ?? {
            ox: 0,
            oy: 0,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            tilt: 0,
            lift: 0,
            liftT: 0,
            drag: false,
            moved: false,
            sx: 0,
            sy: 0,
            ox0: 0,
            oy0: 0,
            min: [-1, -1],
            max: [1, 1],
          }
      );
    }
  }, [stickers]);

  const tickPhysicsRef = useRef<() => void>(() => {});

  const tickPhysics = useCallback(() => {
    const phys = physicsRef.current;
    const cluster = clusterRef.current;
    if (!cluster) return;

    const baseW = cluster.offsetWidth || 1;
    let needsTick = false;

    if (!phys.reduced) {
      phys.px += (phys.tpx - phys.px) * 0.07;
      phys.py += (phys.tpy - phys.py) * 0.07;
      if (Math.abs(phys.tpx - phys.px) > 0.001 || Math.abs(phys.tpy - phys.py) > 0.001) {
        needsTick = true;
      }
    }

    phys.s.forEach((stk, idx) => {
      const wrapper = stickerWrappersRef.current[idx];
      if (!wrapper) return;

      const parallaxDepth = 0.6 + ((idx * 37) % 10) / 12;
      const targetX = stk.ox * baseW + (stk.drag ? 0 : phys.px * 10 * parallaxDepth);
      const targetY = stk.oy * baseW + (stk.drag ? 0 : phys.py * 7 * parallaxDepth);

      if (phys.reduced) {
        stk.x = targetX;
        stk.y = targetY;
        stk.vx = stk.vy = 0;
        stk.tilt = 0;
        stk.lift = stk.liftT;
      } else {
        const stiffness = stk.drag ? 0.42 : 0.16;
        const damping = stk.drag ? 0.55 : 0.66;
        [stk.x, stk.vx] = springStep(stk.x, stk.vx, targetX, stiffness, damping);
        [stk.y, stk.vy] = springStep(stk.y, stk.vy, targetY, stiffness, damping);

        const targetTilt = Math.max(-16, Math.min(16, stk.vx * 1.1));
        stk.tilt += (targetTilt - stk.tilt) * 0.2;
        stk.lift += (stk.liftT - stk.lift) * 0.2;

        if (
          Math.abs(targetX - stk.x) > 0.05 ||
          Math.abs(targetY - stk.y) > 0.05 ||
          Math.abs(stk.vx) > 0.02 ||
          Math.abs(stk.vy) > 0.02 ||
          Math.abs(stk.tilt) > 0.02 ||
          Math.abs(stk.liftT - stk.lift) > 0.002
        ) {
          needsTick = true;
        }
      }

      wrapper.style.transform = `translate3d(${stk.x.toFixed(2)}px, ${stk.y.toFixed(2)}px, 0) rotate(${stk.tilt.toFixed(2)}deg) scale(${(1 + stk.lift * 0.08).toFixed(4)})`;
      wrapper.style.setProperty("--lift", stk.lift.toFixed(3));
    });

    phys.raf = needsTick ? requestAnimationFrame(() => tickPhysicsRef.current()) : 0;
  }, []);

  useEffect(() => {
    tickPhysicsRef.current = tickPhysics;
  }, [tickPhysics]);

  const wakePhysics = useCallback(() => {
    if (!physicsRef.current.raf) {
      physicsRef.current.raf = requestAnimationFrame(tickPhysics);
    }
  }, [tickPhysics]);

  // Viewport & reduced motion observer
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const phys = physicsRef.current;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    phys.reduced = mql.matches;

    const onMq = () => {
      phys.reduced = mql.matches;
      wakePhysics();
    };
    mql.addEventListener("change", onMq);

    let observer: IntersectionObserver | null = null;
    if (phys.reduced || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setIsInView(true);
            observer?.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      observer.observe(el);
    }

    const resizeObserver = new ResizeObserver(() => wakePhysics());
    if (clusterRef.current) resizeObserver.observe(clusterRef.current);

    return () => {
      mql.removeEventListener("change", onMq);
      observer?.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(phys.raf);
      phys.raf = 0;
    };
  }, [wakePhysics]);

  // Reset copied email badge timeout
  useEffect(() => {
    if (!copiedSuccess) return;
    const timer = setTimeout(() => setCopiedSuccess(false), 1800);
    return () => clearTimeout(timer);
  }, [copiedSuccess]);

  const farewellTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (farewellTimer.current) clearTimeout(farewellTimer.current);
  }, []);

  // Cycle to next farewell
  const nextFarewell = () => {
    if (isAnimatingFarewell) return;
    const nextIdx = (farewellIdx + 1) % farewellList.length;
    const apply = () => {
      setFarewellIdx(nextIdx);
      setIsAnimatingFarewell(false);
      setHasChangedFarewell(true);
      onFarewell?.(nextIdx, farewellList[nextIdx]);
    };
    if (physicsRef.current.reduced || !isInView) {
      apply();
    } else {
      setIsAnimatingFarewell(true);
      farewellTimer.current = window.setTimeout(apply, 420);
    }
  };

  // Swap to next fruit on sticker click
  const swapFruit = (idx: number) => {
    const current = activeFruits[idx];
    let nextFruit = current;
    for (let i = 1; i <= FRUIT_TYPES.length; i++) {
      const candidate = FRUIT_TYPES[(FRUIT_TYPES.indexOf(current) + i) % FRUIT_TYPES.length];
      if (!activeFruits.includes(candidate)) {
        nextFruit = candidate;
        break;
      }
    }
    const apply = () => {
      setActiveFruits((prev) => prev.map((f, i) => (i === idx ? nextFruit : f)));
      onStickerSwap?.(idx, nextFruit);
    };

    const btn = stickerButtonsRef.current[idx];
    if (physicsRef.current.reduced || !btn?.animate) return apply();

    // 3D card flip animation
    const flipAnim = btn.animate(
      [
        { transform: "perspective(30em) rotateY(0deg)" },
        { transform: "perspective(30em) rotateY(90deg) scale(1.06)" },
      ],
      { duration: 170, easing: "cubic-bezier(.5,0,.9,.6)", fill: "forwards" }
    );

    flipAnim.onfinish = () => {
      apply();
      flipAnim.cancel();
      btn.animate(
        [
          { transform: "perspective(30em) rotateY(-90deg) scale(1.06)" },
          { transform: "perspective(30em) rotateY(14deg)", offset: 0.65 },
          { transform: "perspective(30em) rotateY(0deg)" },
        ],
        { duration: 480, easing: "cubic-bezier(.2,.8,.3,1)" }
      );
    };
  };

  const slapStickerAnim = (idx: number) => {
    const btn = stickerButtonsRef.current[idx];
    if (physicsRef.current.reduced || !btn?.animate) return;
    btn.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(.9, .86)", offset: 0.3 },
        { transform: "scale(1.04)", offset: 0.65 },
        { transform: "scale(1)" },
      ],
      { duration: 460, easing: "cubic-bezier(.3,.7,.4,1)" }
    );
  };

  const updateStickerBounds = (idx: number) => {
    const footer = footerRef.current;
    const cluster = clusterRef.current;
    const stk = physicsRef.current.s[idx];
    if (!footer || !cluster) return;

    const fRect = footer.getBoundingClientRect();
    const cRect = cluster.getBoundingClientRect();
    const cWidth = cRect.width || 1;
    const cfg = stickers[idx];
    const initialX = cRect.left + (cfg.x / 100) * cRect.width;
    const initialY = cRect.top + (cfg.y / 100) * cRect.height;
    const pad = 24;

    stk.min = [(fRect.left + pad - initialX) / cWidth, (fRect.top + pad - initialY) / cWidth];
    stk.max = [(fRect.right - pad - initialX) / cWidth, (fRect.bottom - pad - initialY) / cWidth];
  };

  const onStickerDown = (e: React.PointerEvent<HTMLButtonElement>, idx: number) => {
    if (e.button !== 0) return;
    const stk = physicsRef.current.s[idx];
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    updateStickerBounds(idx);
    stk.drag = true;
    stk.moved = false;
    stk.sx = e.clientX;
    stk.sy = e.clientY;
    stk.ox0 = stk.ox;
    stk.oy0 = stk.oy;
    stk.liftT = 1;
    setTopStickerIdx(idx);
    setDraggedIdx(idx);
    wakePhysics();
  };

  const onStickerMovePointer = (e: React.PointerEvent<HTMLButtonElement>, idx: number) => {
    const stk = physicsRef.current.s[idx];
    if (!stk.drag) return;
    const clusterW = clusterRef.current?.offsetWidth || 1;
    const dx = e.clientX - stk.sx;
    const dy = e.clientY - stk.sy;
    if (!stk.moved && Math.hypot(dx, dy) > 5) stk.moved = true;
    if (stk.moved) {
      stk.ox = clampVal(stk.ox0 + dx / clusterW, stk.min[0], stk.max[0]);
      stk.oy = clampVal(stk.oy0 + dy / clusterW, stk.min[1], stk.max[1]);
      wakePhysics();
    }
  };

  const onStickerUp = (e: React.PointerEvent<HTMLButtonElement>, idx: number) => {
    const stk = physicsRef.current.s[idx];
    if (!stk.drag) return;
    stk.drag = false;
    stk.liftT = 0;
    setDraggedIdx(-1);
    if (e.type === "pointerup") {
      if (stk.moved) slapStickerAnim(idx);
      else swapFruit(idx);
    }
    wakePhysics();
  };

  const onStickerKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const step = e.shiftKey ? 0.05 : 0.015;
    const deltaMap: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = deltaMap[e.key];
    if (delta) {
      e.preventDefault();
      const stk = physicsRef.current.s[idx];
      updateStickerBounds(idx);
      stk.ox = clampVal(stk.ox + delta[0], stk.min[0], stk.max[0]);
      stk.oy = clampVal(stk.oy + delta[1], stk.min[1], stk.max[1]);
      setTopStickerIdx(idx);
      wakePhysics();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      swapFruit(idx);
    }
  };

  // Reset stickers on double click
  const onTidyDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button,a")) return;
    physicsRef.current.s.forEach((stk) => {
      stk.ox = 0;
      stk.oy = 0;
    });
    wakePhysics();
  };

  const onPointerParallax = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    physicsRef.current.tpx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    physicsRef.current.tpy = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    wakePhysics();
  };

  const onPointerLeave = () => {
    physicsRef.current.tpx = 0;
    physicsRef.current.tpy = 0;
    wakePhysics();
  };

  const copyEmail = async () => {
    if (email) {
      try {
        await navigator.clipboard.writeText(email);
        setCopiedSuccess(true);
        onCopy?.(email);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    }
  };

  const scrollToTop = () => {
    if (onBackToTop) return onBackToTop();
    window.scrollTo({ top: 0, behavior: physicsRef.current.reduced ? "auto" : "smooth" });
  };

  const EM_SCALE = 0.0052;
  const SCRIPT_PAD_X = 70;
  const SCRIPT_PAD_R = 90;
  const fmtEm = (val: number) => `${+val.toFixed(4)}em`;

  const scriptWidthEm = cursiveLayout.width * EM_SCALE;
  const viewBoxW = cursiveLayout.width + SCRIPT_PAD_X + SCRIPT_PAD_R;
  const viewBoxH = SCRIPT_BOTTOM - SCRIPT_TOP;
  const svgPosStyle: React.CSSProperties = {
    left: fmtEm(-SCRIPT_PAD_X * EM_SCALE),
    top: fmtEm(0.8 + SCRIPT_TOP * EM_SCALE),
    width: fmtEm(viewBoxW * EM_SCALE),
    height: fmtEm(viewBoxH * EM_SCALE),
  };

  // Layer rendering helper for cursive script (shadow, main, highlight)
  const renderScriptLayer = (layerType: "s" | "m" | "h") => {
    const transform = layerType === "s" ? "translate(6,8)" : layerType === "h" ? "translate(-5,-6)" : "";
    const strokeW = layerType === "h" ? 7 : 34;

    return (
      <g className={`fsf-${layerType}`} transform={transform}>
        {cursiveLayout.glyphs.map((g, gIdx) => (
          <g key={gIdx} transform={`translate(${g.x},0)`}>
            <g className="fsf-g" style={{ "--gi": gIdx } as React.CSSProperties}>
              {g.strokes.map((s, sIdx) => (
                <path
                  key={sIdx}
                  className="fsf-p"
                  d={s.d}
                  pathLength={1}
                  strokeWidth={strokeW}
                  style={
                    {
                      "--d": `${(s.delay + (layerType === "s" ? 0.06 : layerType === "h" ? 0.1 : 0)).toFixed(3)}s`,
                      "--dur": `${s.dur.toFixed(3)}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
              {g.dots.map((d, dIdx) => (
                <circle
                  key={"d" + dIdx}
                  className="fsf-dot"
                  cx={d.x}
                  cy={d.y}
                  r={layerType === "h" ? 4 : 17}
                  style={{ "--d": `${d.delay.toFixed(3)}s` } as React.CSSProperties}
                />
              ))}
            </g>
          </g>
        ))}
      </g>
    );
  };

  let charIdx = 0;
  const headlineSpans = [...headline].map((ch, idx) => (
    <span
      key={idx}
      className="fsf-ch"
      style={{ "--i": ch === " " ? charIdx : charIdx++ } as React.CSSProperties}
    >
      {ch === " " ? "\u00A0" : ch}
    </span>
  ));

  const renderStickerNode = (cfg: FruitStickerConfig, idx: number) => {
    const fruitKind = activeFruits[idx] ?? cfg.fruit;
    const baseSize = cfg.size ?? 0.8;
    const widthEm = cfg.shape === "oval" ? baseSize * 1.3 : baseSize;
    const bgColor = fruitKind === cfg.fruit && cfg.color ? cfg.color : FRUIT_COLORS[fruitKind];
    const isBehind = cfg.behind && topStickerIdx !== idx;
    const isTop = topStickerIdx === idx;
    const isDragging = draggedIdx === idx;

    const classNames = `fsf-stk${isBehind ? " is-behind" : ""}${isTop ? " is-top" : ""}${isDragging ? " is-drag" : ""}`;

    return (
      <div
        key={idx}
        ref={(el) => { stickerWrappersRef.current[idx] = el; }}
        className={classNames}
        style={
          {
            "--x": `${cfg.x}%`,
            "--y": `${cfg.y}%`,
            "--w": `${widthEm}em`,
            "--h": `${baseSize}em`,
          } as React.CSSProperties
        }
      >
        <div
          className="fsf-stk-in"
          style={
            {
              "--sd": `${(0.7 + idx * 0.13).toFixed(2)}s`,
              "--spin": `${idx % 2 ? 24 : -24}deg`,
            } as React.CSSProperties
          }
        >
          <div className="fsf-stk-bob" style={{ "--bd": `${-idx * 1.7}s` } as React.CSSProperties}>
            <button
              type="button"
              ref={(el) => { stickerButtonsRef.current[idx] = el; }}
              className="fsf-stk-body"
              style={
                {
                  "--c": bgColor,
                  "--r": `${cfg.rotate ?? 0}deg`,
                  "--f": `${baseSize * 0.86}em`,
                } as React.CSSProperties
              }
              aria-label={`${FRUIT_LABELS[fruitKind]} sticker. Press Enter to swap the fruit, arrow keys to move it.`}
              onPointerDown={(e) => onStickerDown(e, idx)}
              onPointerMove={(e) => onStickerMovePointer(e, idx)}
              onPointerUp={(e) => onStickerUp(e, idx)}
              onPointerCancel={(e) => onStickerUp(e, idx)}
              onKeyDown={(e) => onStickerKey(e, idx)}
            >
              <svg className="fsf-fruit" viewBox="-50 -50 100 100" aria-hidden="true">
                {FRUIT_SVGS[fruitKind] ?? FRUIT_SVGS.strawberry}
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <footer
      ref={footerRef}
      className={`fsf ${className}`.trim()}
      style={
        {
          "--fsf-accent": accent,
          "--fsf-shade": `color-mix(in oklab, ${accent} 66%, #3b0b02)`,
          "--fsf-ink": ink,
          "--fsf-muted": muted,
          "--fsf-bg": background,
          "--fsf-font": fontSans,
          minHeight: height,
        } as React.CSSProperties
      }
      data-in={isInView ? "" : undefined}
      onPointerMove={onPointerParallax}
      onPointerLeave={onPointerLeave}
    >
      {/* Interactive Main Stage */}
      <div className="fsf-stage" onDoubleClick={onTidyDoubleClick}>
        <div ref={clusterRef} className="fsf-cluster">
          {/* Stickers positioned behind text */}
          {stickers.map((cfg, idx) => (cfg.behind ? renderStickerNode(cfg, idx) : null))}

          {/* Large Headline & Cursive Farewell Script */}
          <h2 className="fsf-head">
            <span className="fsf-sr">{`${headline} ${currentFarewell}`}</span>
            <span className="fsf-line" aria-hidden="true">
              {headlineSpans}
            </span>
            <button
              type="button"
              className="fsf-script"
              style={{ width: fmtEm(scriptWidthEm) }}
              data-out={isAnimatingFarewell ? "" : undefined}
              onClick={nextFarewell}
              aria-label={`Say goodbye another way (now: ${currentFarewell})`}
            >
              <svg
                key={farewellIdx}
                viewBox={`${-SCRIPT_PAD_X} ${SCRIPT_TOP} ${viewBoxW} ${viewBoxH}`}
                style={
                  {
                    ...svgPosStyle,
                    "--base": hasChangedFarewell ? "0s" : "0.45s",
                    "--total": `${cursiveLayout.total.toFixed(3)}s`,
                  } as React.CSSProperties
                }
                aria-hidden="true"
              >
                <g transform="rotate(-6 0 0) skewX(-10)">
                  {renderScriptLayer("s")}
                  {renderScriptLayer("m")}
                  {renderScriptLayer("h")}
                </g>
              </svg>
            </button>
          </h2>

          {/* Subtitle Copy Lines */}
          <p className="fsf-sub">
            {lines.map((line, idx) => (
              <span key={idx} style={{ "--i": idx } as React.CSSProperties}>
                {line}
              </span>
            ))}
          </p>

          {/* Stickers positioned in front of text */}
          {stickers.map((cfg, idx) => (cfg.behind ? null : renderStickerNode(cfg, idx)))}
        </div>
      </div>

      {/* Floating Interactive Contact Links */}
      <div className="fsf-contact">
        <button
          type="button"
          className={`fsf-mail fsf-rise${copiedSuccess ? " is-copied" : ""}`}
          style={{ "--i": 0 } as React.CSSProperties}
          onClick={copyEmail}
        >
          <span className="fsf-mail-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 7.5C3.5 6.4 4.4 5.5 5.5 5.5H18.5C19.6 5.5 20.5 6.4 20.5 7.5V16.5C20.5 17.6 19.6 18.5 18.5 18.5H5.5C4.4 18.5 3.5 17.6 3.5 16.5Z" />
              <path d="M4.5 7L12 12.5L19.5 7" />
            </svg>
          </span>
          <span>{email}</span>
          <span className="fsf-mail-tag" aria-hidden="true">
            <span className="is-idle">copy</span>
            <span className="is-done">copied!</span>
          </span>
          <span className="fsf-sr" role="status">
            {copiedSuccess ? "Email address copied" : ""}
          </span>
        </button>

        <ul className="fsf-links fsf-rise" style={{ "--i": 1 } as React.CSSProperties}>
          {links.map((link) => (
            <li key={link.label}>
              <a
                className="fsf-link"
                href={link.href || "#"}
                onClick={(e) => {
                  if (!link.href || link.href === "#") e.preventDefault();
                  onLinkClick?.(link.label, link.href);
                }}
              >
                {link.label}
                <svg viewBox="0 0 40 6" preserveAspectRatio="none" aria-hidden="true">
                  <path pathLength={1} d="M1,3C4,0.5 6,0.5 9,3S14,5.5 17,3S22,0.5 25,3S30,5.5 33,3S37,0.5 39,2.5" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Copyright & Back to Top Bar */}
      <div className="fsf-bar fsf-rise" style={{ "--i": 2 } as React.CSSProperties}>
        <p>{`© ${year} ${name}`}</p>
        <button type="button" className="fsf-top" onClick={scrollToTop}>
          Back to top
          <i aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 13V3M3.5 7.5L8 3L12.5 7.5" />
            </svg>
          </i>
        </button>
      </div>
    </footer>
  );
}

export default FruitStickerFooter;
