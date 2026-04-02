// ScanlineVariations: Same fluted glass shader, different animated backgrounds
// Each variant changes what's behind the glass

import { useEffect, useRef, useState } from "react";
import GlassPanel, { type GlassParams, GLASS_DEFAULTS } from "./GlassPanel";

export type Variant = "waves" | "rings" | "diagonal" | "plasma" | "columns" | "lava" | "aurora" | "nebula" | "tide" | "orb";

// ─── Shaders (same glass as ScanlineWave) ───────────────────────
const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;

uniform sampler2D u_tex;
uniform float u_time;
uniform vec2 u_res;
uniform float u_ribDensity;
uniform float u_refraction;
uniform float u_waveAmp;
uniform float u_waveSpeed;
uniform float u_seamStrength;
uniform float u_highlight;
uniform float u_shadow;
uniform float u_grain;
uniform float u_vDistort;

in vec2 v_uv;
out vec4 fragColor;

void main() {
  vec2 uv = v_uv;

  float ribFreq = u_res.x * u_ribDensity;
  float ribX = uv.x * ribFreq;
  float rib = sin(ribX + sin(u_time * 0.2) * 1.0);

  float refract1 = cos(ribX + sin(u_time * 0.2) * 1.0) * 0.02 * u_refraction;
  float refract2 = cos(ribX * 0.7 + u_time * 0.12) * 0.015 * u_refraction;
  float bigWave = sin(uv.y * 4.0 + u_time * u_waveSpeed * 0.6) * 0.04 * u_waveAmp
                + sin(uv.y * 2.0 - u_time * u_waveSpeed * 0.3) * 0.03 * u_waveAmp;
  float hDisplace = refract1 + refract2 + bigWave;
  float vDisplace = sin(uv.y * 8.0 + u_time * 0.5 + uv.x * 3.0) * u_vDistort;

  vec2 displaced = clamp(uv + vec2(hDisplace, vDisplace), 0.0, 1.0);
  vec4 color = texture(u_tex, displaced);

  // Seam disabled
  float seamMask = abs(rib);
  float seam = smoothstep(0.0, 0.3 / u_seamStrength, seamMask);

  float highlightVal = pow(max(rib, 0.0), 2.0) * u_highlight;
  color.rgb += highlightVal;
  float shadowVal = pow(max(-rib, 0.0), 2.0) * u_shadow;
  color.rgb -= shadowVal;

  float grainVal = fract(sin(dot(uv * u_res + u_time, vec2(12.9898, 78.233))) * 43758.5453);
  color.rgb += (grainVal - 0.5) * u_grain;

  fragColor = vec4(color.rgb, 1.0);
}`;

// ─── Orange palette ─────────────────────────────────────────────
const C = {
  hot:    [252, 42, 13],
  coral:  [253, 108, 65],
  warm:   [254, 159, 93],
  peach:  [254, 197, 154],
  cream:  [255, 235, 210],
};

function rgba(c: number[], a: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

// ─── Background drawers ─────────────────────────────────────────

function drawWaves(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Wavy vertical bands that snake and scroll
  ctx.fillStyle = rgba(C.peach, 1);
  ctx.fillRect(0, 0, w, h);

  const bandCount = 10;
  const baseW = w / bandCount;
  const sliceH = 4;
  const colors = [C.hot, C.coral, C.warm, C.peach, C.cream, C.warm, C.coral, C.hot, C.cream, C.coral];

  for (let i = 0; i < bandCount; i++) {
    const ci = colors[i % colors.length];
    ctx.fillStyle = rgba(ci, 0.9);

    const speed = 40 + i * 25;
    const totalW = w + baseW * 2;
    const baseX = ((i * baseW + t * speed) % totalW + totalW) % totalW - baseW;
    const bw = baseW * (0.9 + Math.sin(t * 0.5 + i) * 0.3);

    for (let sy = 0; sy < h; sy += sliceH) {
      const ny = sy / h;
      const wave = Math.sin(ny * 4.5 + t * 2.5 + i * 0.9) * 30
                 + Math.sin(ny * 2.0 - t * 1.8 + i * 1.7) * 22;
      ctx.fillRect(baseX + wave, sy, bw, sliceH + 1);
    }
  }
}

function drawRings(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Concentric expanding rings
  ctx.fillStyle = rgba(C.peach, 1);
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2 + Math.sin(t * 0.3) * w * 0.15;
  const cy = h / 2 + Math.cos(t * 0.25) * h * 0.15;
  const ringCount = 12;
  const maxR = Math.max(w, h) * 0.8;
  const colors = [C.hot, C.coral, C.warm, C.peach, C.cream, C.coral];

  for (let i = ringCount - 1; i >= 0; i--) {
    // Rings expand outward continuously
    const phase = (t * 0.4 + i / ringCount) % 1;
    const r = phase * maxR;
    const ci = colors[i % colors.length];

    const grad = ctx.createRadialGradient(cx, cy, Math.max(0, r - maxR / ringCount * 0.8), cx, cy, r);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(0.3, rgba(ci, 0.8));
    grad.addColorStop(0.7, rgba(ci, 0.6));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawDiagonal(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Diagonal stripes scrolling
  ctx.fillStyle = rgba(C.peach, 1);
  ctx.fillRect(0, 0, w, h);

  const stripeW = 60;
  const angle = Math.PI / 4; // 45 degrees
  const colors = [C.hot, C.coral, C.warm, C.peach, C.cream];
  const diag = Math.sqrt(w * w + h * h);
  const stripeCount = Math.ceil(diag / stripeW) + 4;

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(angle + Math.sin(t * 0.15) * 0.1);

  const scroll = (t * 80) % (stripeW * colors.length);

  for (let i = -stripeCount; i < stripeCount; i++) {
    const x = i * stripeW - scroll;
    const ci = colors[((i % colors.length) + colors.length) % colors.length];
    ctx.fillStyle = rgba(ci, 0.9);
    ctx.fillRect(x, -diag, stripeW * 0.85, diag * 2);
  }

  ctx.restore();
}

function drawPlasma(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Organic plasma — overlapping sine waves create flowing shapes
  const imgData = ctx.createImageData(w, h);
  const d = imgData.data;

  for (let y = 0; y < h; y++) {
    const ny = y / h;
    for (let x = 0; x < w; x++) {
      const nx = x / w;

      const v1 = Math.sin(nx * 8 + t * 1.2);
      const v2 = Math.sin(ny * 6 - t * 0.9);
      const v3 = Math.sin((nx + ny) * 5 + t * 0.7);
      const v4 = Math.sin(Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 12 - t * 1.5);
      const v = (v1 + v2 + v3 + v4) / 4; // -1 to 1

      const n = (v + 1) / 2; // 0 to 1

      // Map to orange palette
      let r: number, g: number, b: number;
      if (n < 0.25) {
        const f = n / 0.25;
        r = C.hot[0] + (C.coral[0] - C.hot[0]) * f;
        g = C.hot[1] + (C.coral[1] - C.hot[1]) * f;
        b = C.hot[2] + (C.coral[2] - C.hot[2]) * f;
      } else if (n < 0.5) {
        const f = (n - 0.25) / 0.25;
        r = C.coral[0] + (C.warm[0] - C.coral[0]) * f;
        g = C.coral[1] + (C.warm[1] - C.coral[1]) * f;
        b = C.coral[2] + (C.warm[2] - C.coral[2]) * f;
      } else if (n < 0.75) {
        const f = (n - 0.5) / 0.25;
        r = C.warm[0] + (C.peach[0] - C.warm[0]) * f;
        g = C.warm[1] + (C.peach[1] - C.warm[1]) * f;
        b = C.warm[2] + (C.peach[2] - C.warm[2]) * f;
      } else {
        const f = (n - 0.75) / 0.25;
        r = C.peach[0] + (C.cream[0] - C.peach[0]) * f;
        g = C.peach[1] + (C.cream[1] - C.peach[1]) * f;
        b = C.peach[2] + (C.cream[2] - C.peach[2]) * f;
      }

      const idx = (y * w + x) * 4;
      d[idx] = r;
      d[idx + 1] = g;
      d[idx + 2] = b;
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function drawColumns(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Thick vertical columns that slide left/right and pulse in width
  ctx.fillStyle = rgba(C.cream, 1);
  ctx.fillRect(0, 0, w, h);

  const colCount = 5;
  const baseW = w / colCount;
  const colors = [C.hot, C.coral, C.warm, C.peach, C.hot];

  for (let i = 0; i < colCount; i++) {
    const ci = colors[i % colors.length];

    // Each column oscillates left/right
    const drift = Math.sin(t * 0.6 + i * 1.5) * baseW * 0.5;
    // Width pulses
    const cw = baseW * (0.7 + Math.sin(t * 0.4 + i * 2.0) * 0.4);
    const x = i * baseW + baseW / 2 - cw / 2 + drift;

    // Vertical gradient per column
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    const topColor = colors[(i + 1) % colors.length];
    grad.addColorStop(0, rgba(topColor, 0.9));
    grad.addColorStop(0.5, rgba(ci, 0.95));
    grad.addColorStop(1, rgba(topColor, 0.9));
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, cw, h);
  }
}

function drawLava(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Slow lava lamp — large soft blobs that rise, merge, and split
  const imgData = ctx.createImageData(w, h);
  const d = imgData.data;

  for (let y = 0; y < h; y++) {
    const ny = y / h;
    for (let x = 0; x < w; x++) {
      const nx = x / w;

      // Multiple metaball-like fields
      let field = 0;
      const cx1 = 0.3 + Math.sin(t * 0.2) * 0.15;
      const cy1 = 0.5 + Math.sin(t * 0.15 + 1.0) * 0.3;
      field += 0.08 / ((nx - cx1) ** 2 + (ny - cy1) ** 2 + 0.01);

      const cx2 = 0.7 + Math.sin(t * 0.18 + 2.0) * 0.15;
      const cy2 = 0.4 + Math.cos(t * 0.12) * 0.3;
      field += 0.06 / ((nx - cx2) ** 2 + (ny - cy2) ** 2 + 0.01);

      const cx3 = 0.5 + Math.cos(t * 0.14 + 3.0) * 0.2;
      const cy3 = 0.6 + Math.sin(t * 0.1 + 0.5) * 0.25;
      field += 0.05 / ((nx - cx3) ** 2 + (ny - cy3) ** 2 + 0.01);

      const cx4 = 0.4 + Math.sin(t * 0.22 + 4.0) * 0.2;
      const cy4 = 0.3 + Math.cos(t * 0.16 + 1.5) * 0.2;
      field += 0.04 / ((nx - cx4) ** 2 + (ny - cy4) ** 2 + 0.01);

      // Normalize
      const n = Math.min(1, field / 12);

      let r: number, g: number, b: number;
      if (n < 0.3) {
        const f = n / 0.3;
        r = C.peach[0] + (C.warm[0] - C.peach[0]) * f;
        g = C.peach[1] + (C.warm[1] - C.peach[1]) * f;
        b = C.peach[2] + (C.warm[2] - C.peach[2]) * f;
      } else if (n < 0.6) {
        const f = (n - 0.3) / 0.3;
        r = C.warm[0] + (C.coral[0] - C.warm[0]) * f;
        g = C.warm[1] + (C.coral[1] - C.warm[1]) * f;
        b = C.warm[2] + (C.coral[2] - C.warm[2]) * f;
      } else {
        const f = (n - 0.6) / 0.4;
        r = C.coral[0] + (C.hot[0] - C.coral[0]) * f;
        g = C.coral[1] + (C.hot[1] - C.coral[1]) * f;
        b = C.coral[2] + (C.hot[2] - C.coral[2]) * f;
      }

      const idx = (y * w + x) * 4;
      d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function drawAurora(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Horizontal aurora — slow flowing curtains of light
  const imgData = ctx.createImageData(w, h);
  const d = imgData.data;

  for (let y = 0; y < h; y++) {
    const ny = y / h;
    for (let x = 0; x < w; x++) {
      const nx = x / w;

      // Horizontal flowing curtains
      const flow1 = Math.sin(nx * 3 + t * 0.3 + ny * 2) * 0.5 + 0.5;
      const flow2 = Math.sin(nx * 5 - t * 0.2 + ny * 1.5 + 1.0) * 0.5 + 0.5;
      const flow3 = Math.sin(nx * 2 + t * 0.15 - ny * 3 + 2.0) * 0.5 + 0.5;

      // Vertical fade — brighter in middle, dim at edges
      const vFade = Math.sin(ny * Math.PI) ** 0.6;

      const n = (flow1 * 0.4 + flow2 * 0.35 + flow3 * 0.25) * vFade;

      let r: number, g: number, b: number;
      if (n < 0.25) {
        const f = n / 0.25;
        r = C.cream[0] * (1 - f) + C.peach[0] * f;
        g = C.cream[1] * (1 - f) + C.peach[1] * f;
        b = C.cream[2] * (1 - f) + C.peach[2] * f;
      } else if (n < 0.5) {
        const f = (n - 0.25) / 0.25;
        r = C.peach[0] + (C.warm[0] - C.peach[0]) * f;
        g = C.peach[1] + (C.warm[1] - C.peach[1]) * f;
        b = C.peach[2] + (C.warm[2] - C.peach[2]) * f;
      } else if (n < 0.75) {
        const f = (n - 0.5) / 0.25;
        r = C.warm[0] + (C.coral[0] - C.warm[0]) * f;
        g = C.warm[1] + (C.coral[1] - C.warm[1]) * f;
        b = C.warm[2] + (C.coral[2] - C.warm[2]) * f;
      } else {
        const f = (n - 0.75) / 0.25;
        r = C.coral[0] + (C.hot[0] - C.coral[0]) * f;
        g = C.coral[1] + (C.hot[1] - C.coral[1]) * f;
        b = C.coral[2] + (C.hot[2] - C.coral[2]) * f;
      }

      const idx = (y * w + x) * 4;
      d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function drawNebula(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Nebula — layered noise clouds, very slow drift
  const imgData = ctx.createImageData(w, h);
  const d = imgData.data;

  for (let y = 0; y < h; y++) {
    const ny = y / h;
    for (let x = 0; x < w; x++) {
      const nx = x / w;

      // Layered "noise" via sine sums at different scales
      const s1 = Math.sin(nx * 4 + t * 0.15) * Math.cos(ny * 3 - t * 0.1);
      const s2 = Math.sin(nx * 7 - t * 0.08 + ny * 5) * 0.5;
      const s3 = Math.sin((nx * 2 + ny * 2) * 6 + t * 0.12) * 0.3;
      const s4 = Math.cos(nx * 10 + ny * 8 - t * 0.2) * 0.2;
      const s5 = Math.sin(Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 8 + t * 0.1) * 0.4;

      const v = (s1 + s2 + s3 + s4 + s5) / 2.4;
      const n = (v + 1) / 2;

      // Nebula color mapping — more range
      let r: number, g: number, b: number;
      if (n < 0.2) {
        const f = n / 0.2;
        r = 180 + (C.peach[0] - 180) * f;
        g = 110 + (C.peach[1] - 110) * f;
        b = 80 + (C.peach[2] - 80) * f;
      } else if (n < 0.4) {
        const f = (n - 0.2) / 0.2;
        r = C.peach[0] + (C.warm[0] - C.peach[0]) * f;
        g = C.peach[1] + (C.warm[1] - C.peach[1]) * f;
        b = C.peach[2] + (C.warm[2] - C.peach[2]) * f;
      } else if (n < 0.6) {
        const f = (n - 0.4) / 0.2;
        r = C.warm[0] + (C.coral[0] - C.warm[0]) * f;
        g = C.warm[1] + (C.coral[1] - C.warm[1]) * f;
        b = C.warm[2] + (C.coral[2] - C.warm[2]) * f;
      } else if (n < 0.8) {
        const f = (n - 0.6) / 0.2;
        r = C.coral[0] + (C.hot[0] - C.coral[0]) * f;
        g = C.coral[1] + (C.hot[1] - C.coral[1]) * f;
        b = C.coral[2] + (C.hot[2] - C.coral[2]) * f;
      } else {
        const f = (n - 0.8) / 0.2;
        r = C.hot[0] + (C.cream[0] - C.hot[0]) * f;
        g = C.hot[1] + (C.cream[1] - C.hot[1]) * f;
        b = C.hot[2] + (C.cream[2] - C.hot[2]) * f;
      }

      const idx = (y * w + x) * 4;
      d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function drawTide(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Tide — horizontal bands that breathe and shift gently
  const imgData = ctx.createImageData(w, h);
  const d = imgData.data;

  for (let y = 0; y < h; y++) {
    const ny = y / h;
    for (let x = 0; x < w; x++) {
      const nx = x / w;

      // Gentle horizontal waves
      const wave = Math.sin(ny * 6 + t * 0.4 + Math.sin(nx * 3 + t * 0.2) * 0.5) * 0.5 + 0.5;
      const wave2 = Math.sin(ny * 3 - t * 0.25 + nx * 0.5) * 0.5 + 0.5;
      const wave3 = Math.sin(ny * 10 + t * 0.6 + nx * 2) * 0.3 + 0.5;

      const n = wave * 0.5 + wave2 * 0.3 + wave3 * 0.2;

      let r: number, g: number, b: number;
      if (n < 0.3) {
        const f = n / 0.3;
        r = C.cream[0] + (C.peach[0] - C.cream[0]) * f;
        g = C.cream[1] + (C.peach[1] - C.cream[1]) * f;
        b = C.cream[2] + (C.peach[2] - C.cream[2]) * f;
      } else if (n < 0.55) {
        const f = (n - 0.3) / 0.25;
        r = C.peach[0] + (C.warm[0] - C.peach[0]) * f;
        g = C.peach[1] + (C.warm[1] - C.peach[1]) * f;
        b = C.peach[2] + (C.warm[2] - C.peach[2]) * f;
      } else if (n < 0.75) {
        const f = (n - 0.55) / 0.2;
        r = C.warm[0] + (C.coral[0] - C.warm[0]) * f;
        g = C.warm[1] + (C.coral[1] - C.warm[1]) * f;
        b = C.warm[2] + (C.coral[2] - C.warm[2]) * f;
      } else {
        const f = (n - 0.75) / 0.25;
        r = C.coral[0] + (C.hot[0] - C.coral[0]) * f;
        g = C.coral[1] + (C.hot[1] - C.coral[1]) * f;
        b = C.coral[2] + (C.hot[2] - C.coral[2]) * f;
      }

      const idx = (y * w + x) * 4;
      d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; d[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

// ─── Orb config (shared via ref) ────────────────────────────────
export interface OrbParams {
  posX: number;    // 0–1, horizontal center
  posY: number;    // 0–1, vertical center
  size: number;    // 0–1, radius relative to canvas
  drift: number;   // how much the orb drifts
}

export const ORB_DEFAULTS: OrbParams = {
  posX: 0.57,
  posY: 0.59,
  size: 1.17,
  drift: 0.23,
};

// Module-level ref so drawOrb can read it without changing the drawer signature
let _orbParams: OrbParams = { ...ORB_DEFAULTS };
export function setOrbParamsRef(p: OrbParams) { _orbParams = p; }

// ─── Drawer map ─────────────────────────────────────────────────
function drawOrb(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const o = _orbParams;
  ctx.fillStyle = rgba(C.cream, 1);
  ctx.fillRect(0, 0, w, h);

  const cx = w * o.posX + Math.sin(t * 0.25) * w * o.drift * 0.5;
  const cy = h * o.posY + Math.sin(t * 0.2) * h * o.drift;
  const r = Math.min(w, h) * o.size + Math.sin(t * 0.15) * Math.min(w, h) * 0.03;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, rgba(C.hot, 0.95));
  grad.addColorStop(0.35, rgba(C.coral, 0.9));
  grad.addColorStop(0.65, rgba(C.warm, 0.7));
  grad.addColorStop(0.85, rgba(C.peach, 0.4));
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

const DRAWERS: Record<Variant, (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void> = {
  waves: drawWaves,
  rings: drawRings,
  diagonal: drawDiagonal,
  plasma: drawPlasma,
  columns: drawColumns,
  lava: drawLava,
  aurora: drawAurora,
  nebula: drawNebula,
  tide: drawTide,
  orb: drawOrb,
};

const LABELS: Record<Variant, string> = {
  waves: "Wavy Bands",
  rings: "Expanding Rings",
  diagonal: "Diagonal Stripes",
  plasma: "Plasma Flow",
  columns: "Sliding Columns",
  lava: "Lava Lamp",
  aurora: "Aurora Curtains",
  nebula: "Nebula Clouds",
  tide: "Gentle Tide",
  orb: "Floating Orb",
};

// ─── WebGL helpers ──────────────────────────────────────────────
function createShaderProgram(gl: WebGL2RenderingContext) {
  const vs = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vs, VERT);
  gl.compileShader(vs);
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
    console.error("VS:", gl.getShaderInfoLog(vs));

  const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fs, FRAG);
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
    console.error("FS:", gl.getShaderInfoLog(fs));

  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    console.error("Link:", gl.getProgramInfoLog(prog));

  return prog;
}

// ─── Orb slider (inline, matches GlassPanel style) ──────────────
function OrbSlider({ label, value, onChange, min = 0, max = 1, step = 0.01 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "'Martian Mono', monospace", color: "rgba(255,255,255,0.5)" }}>
        <span>{label}</span>
        <span>{value.toFixed(2)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#EB5020" }}
      />
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────
export default function ScanlineVariations({ variant }: { variant: Variant }) {
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const variantRef = useRef(variant);
  variantRef.current = variant;
  const [params, setParams] = useState<GlassParams>(() => {
    if (variant === "orb") {
      return {
        ...GLASS_DEFAULTS,
        ribDensity: 0.03,
        refraction: 10.0,
        waveAmp: 5.0,
        waveSpeed: 0.89,
        seamStrength: 5.0,
        highlight: 0.03,
        shadow: 0.04,
        grain: 0.094,
        vDistort: 0.0,
        timeSpeed: 3.93,
      };
    }
    return { ...GLASS_DEFAULTS };
  });
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const [orbParams, setOrbParams] = useState<OrbParams>({ ...ORB_DEFAULTS });
  // Keep the module-level ref in sync
  useEffect(() => { setOrbParamsRef(orbParams); }, [orbParams]);

  useEffect(() => {
    const glCanvas = glCanvasRef.current!;
    const gl = glCanvas.getContext("webgl2")!;
    if (!gl) { console.error("No WebGL2"); return; }

    const pixelVariants = ["plasma", "lava", "aurora", "nebula", "tide", "orb"];
    const isPixel = pixelVariants.includes(variantRef.current);
    const bw = isPixel ? 256 : 512;
    const bh = isPixel ? 256 : 512;
    const bgCanvas = document.createElement("canvas");
    bgCanvas.width = bw;
    bgCanvas.height = bh;
    const bCtx = bgCanvas.getContext("2d")!;

    const prog = createShaderProgram(gl);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    const uTex = gl.getUniformLocation(prog, "u_tex");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uRibDensity = gl.getUniformLocation(prog, "u_ribDensity");
    const uRefraction = gl.getUniformLocation(prog, "u_refraction");
    const uWaveAmp = gl.getUniformLocation(prog, "u_waveAmp");
    const uWaveSpeed = gl.getUniformLocation(prog, "u_waveSpeed");
    const uSeamStrength = gl.getUniformLocation(prog, "u_seamStrength");
    const uHighlight = gl.getUniformLocation(prog, "u_highlight");
    const uShadow = gl.getUniformLocation(prog, "u_shadow");
    const uGrain = gl.getUniformLocation(prog, "u_grain");
    const uVDistort = gl.getUniformLocation(prog, "u_vDistort");

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      glCanvas.width = window.innerWidth * dpr;
      glCanvas.height = window.innerHeight * dpr;
      glCanvas.style.width = window.innerWidth + "px";
      glCanvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    let frame: number;

    function render(now: number) {
      const p = paramsRef.current;
      const t = now / 1000 * p.timeSpeed;

      const drawer = DRAWERS[variantRef.current];
      drawer(bCtx, bw, bh, t);

      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgCanvas);

      gl.useProgram(prog);
      gl.uniform1i(uTex, 0);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, glCanvas.width, glCanvas.height);
      gl.uniform1f(uRibDensity, p.ribDensity);
      gl.uniform1f(uRefraction, p.refraction);
      gl.uniform1f(uWaveAmp, p.waveAmp);
      gl.uniform1f(uWaveSpeed, p.waveSpeed);
      gl.uniform1f(uSeamStrength, p.seamStrength);
      gl.uniform1f(uHighlight, p.highlight);
      gl.uniform1f(uShadow, p.shadow);
      gl.uniform1f(uGrain, p.grain);
      gl.uniform1f(uVDistort, p.vDistort);

      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      frame = requestAnimationFrame(render);
    }

    frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, [variant]);

  const label = LABELS[variant] || variant;

  return (
    <>
      <canvas
        ref={glCanvasRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "block" }}
      />
      <GlassPanel
        params={params}
        onChange={setParams}
        extraControls={variant === "orb" ? (
          <>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14, marginTop: 14 }}>
              <div style={{
                fontFamily: "'Martian Mono', monospace", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                color: "rgba(255,255,255,0.3)", marginBottom: 12,
              }}>
                Orb Position
              </div>
            </div>
            <OrbSlider label="X Position" value={orbParams.posX} min={0} max={1} onChange={(v) => setOrbParams((p) => ({ ...p, posX: v }))} />
            <OrbSlider label="Y Position" value={orbParams.posY} min={0} max={1} onChange={(v) => setOrbParams((p) => ({ ...p, posY: v }))} />
            <OrbSlider label="Size" value={orbParams.size} min={0.1} max={1.5} onChange={(v) => setOrbParams((p) => ({ ...p, size: v }))} />
            <OrbSlider label="Drift" value={orbParams.drift} min={0} max={0.3} step={0.005} onChange={(v) => setOrbParams((p) => ({ ...p, drift: v }))} />
          </>
        ) : undefined}
      />
      <div
        style={{
          position: "fixed", bottom: 16, left: 16, zIndex: 10,
          fontFamily: "'Martian Mono', monospace", fontSize: 10, fontWeight: 600,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        {label}
      </div>
    </>
  );
}
