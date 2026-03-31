import { useEffect, useRef, useState } from "react";

interface Blob {
  color: string;
  x: number;
  y: number;
  radius: number;
  driftX: number;
  driftY: number;
  freqX: number;
  freqY: number;
  phase: number;
}

export interface OrbConfig {
  label: string;
  bgColor: string;
  blobs: Blob[];
}

const CW = 480;
const CH = 270;
const DIAG = Math.sqrt(CW * CW + CH * CH);

// All gradients use colors sampled from the live SUS site:
// #F4F1DE (bg) → #F2E8D0 → #F0D4B0 → #EBB488 → #E89060 → #E86830 → #EB5020 → #F04A18

export const landscapeOrbs: OrbConfig[] = [
  // ─── Bottom-anchored (like the live site) ─────────────────────
  {
    label: "SUS Hero",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#F04A18", x: 0.5, y: 1.05, radius: 0.4, driftX: 0.04, driftY: 0.03, freqX: 0.06, freqY: 0.05, phase: 0 },
      { color: "#EB5020", x: 0.5, y: 0.9, radius: 0.45, driftX: 0.05, driftY: 0.04, freqX: 0.08, freqY: 0.06, phase: 1.5 },
      { color: "#E89060", x: 0.5, y: 0.72, radius: 0.4, driftX: 0.04, driftY: 0.03, freqX: 0.06, freqY: 0.07, phase: 3.0 },
      { color: "#EBB488", x: 0.5, y: 0.55, radius: 0.35, driftX: 0.03, driftY: 0.03, freqX: 0.05, freqY: 0.06, phase: 4.5 },
    ],
  },
  {
    label: "SUS Tight",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#F04A18", x: 0.5, y: 1.1, radius: 0.3, driftX: 0.03, driftY: 0.02, freqX: 0.05, freqY: 0.04, phase: 0 },
      { color: "#E86830", x: 0.5, y: 0.95, radius: 0.35, driftX: 0.04, driftY: 0.03, freqX: 0.07, freqY: 0.06, phase: 1.8 },
      { color: "#EBB488", x: 0.5, y: 0.8, radius: 0.3, driftX: 0.03, driftY: 0.03, freqX: 0.06, freqY: 0.05, phase: 3.5 },
    ],
  },
  {
    label: "SUS Wide",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#F04A18", x: 0.5, y: 1.0, radius: 0.55, driftX: 0.05, driftY: 0.04, freqX: 0.07, freqY: 0.05, phase: 0 },
      { color: "#EB5020", x: 0.5, y: 0.8, radius: 0.55, driftX: 0.06, driftY: 0.05, freqX: 0.09, freqY: 0.07, phase: 1.5 },
      { color: "#E89060", x: 0.45, y: 0.6, radius: 0.5, driftX: 0.04, driftY: 0.04, freqX: 0.06, freqY: 0.08, phase: 3.0 },
      { color: "#F0D4B0", x: 0.5, y: 0.4, radius: 0.45, driftX: 0.03, driftY: 0.03, freqX: 0.05, freqY: 0.06, phase: 4.5 },
    ],
  },

  // ─── Center-focused ───────────────────────────────────────────
  {
    label: "Center Glow",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#EB5020", x: 0.5, y: 0.5, radius: 0.35, driftX: 0.06, driftY: 0.06, freqX: 0.1, freqY: 0.12, phase: 0 },
      { color: "#E89060", x: 0.5, y: 0.5, radius: 0.5, driftX: 0.04, driftY: 0.04, freqX: 0.07, freqY: 0.08, phase: 2.0 },
      { color: "#EBB488", x: 0.5, y: 0.5, radius: 0.6, driftX: 0.03, driftY: 0.03, freqX: 0.05, freqY: 0.06, phase: 4.0 },
    ],
  },
  {
    label: "Center Tight",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#F04A18", x: 0.5, y: 0.5, radius: 0.22, driftX: 0.05, driftY: 0.05, freqX: 0.12, freqY: 0.1, phase: 0 },
      { color: "#E86830", x: 0.5, y: 0.5, radius: 0.35, driftX: 0.04, driftY: 0.04, freqX: 0.08, freqY: 0.09, phase: 2.0 },
    ],
  },

  // ─── Diagonal / asymmetric ────────────────────────────────────
  {
    label: "Diagonal",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#F04A18", x: 0.2, y: 0.8, radius: 0.35, driftX: 0.08, driftY: 0.06, freqX: 0.1, freqY: 0.08, phase: 0 },
      { color: "#E89060", x: 0.5, y: 0.5, radius: 0.35, driftX: 0.06, driftY: 0.06, freqX: 0.08, freqY: 0.1, phase: 2.0 },
      { color: "#EBB488", x: 0.8, y: 0.2, radius: 0.3, driftX: 0.05, driftY: 0.05, freqX: 0.07, freqY: 0.09, phase: 4.0 },
    ],
  },
  {
    label: "Left Anchor",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#F04A18", x: 0.1, y: 0.6, radius: 0.4, driftX: 0.06, driftY: 0.08, freqX: 0.08, freqY: 0.1, phase: 0 },
      { color: "#E86830", x: 0.25, y: 0.4, radius: 0.35, driftX: 0.05, driftY: 0.06, freqX: 0.1, freqY: 0.08, phase: 1.8 },
      { color: "#EBB488", x: 0.4, y: 0.55, radius: 0.4, driftX: 0.04, driftY: 0.04, freqX: 0.06, freqY: 0.07, phase: 3.5 },
    ],
  },
  {
    label: "Right Anchor",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#F04A18", x: 0.85, y: 0.55, radius: 0.38, driftX: 0.06, driftY: 0.07, freqX: 0.08, freqY: 0.1, phase: 0 },
      { color: "#EB5020", x: 0.7, y: 0.35, radius: 0.3, driftX: 0.05, driftY: 0.06, freqX: 0.1, freqY: 0.08, phase: 2.0 },
      { color: "#E89060", x: 0.6, y: 0.65, radius: 0.35, driftX: 0.04, driftY: 0.04, freqX: 0.07, freqY: 0.09, phase: 3.8 },
    ],
  },

  // ─── Full wash / ambient ──────────────────────────────────────
  {
    label: "Full Wash",
    bgColor: "#F2E8D0",
    blobs: [
      { color: "#E89060", x: 0.3, y: 0.4, radius: 0.5, driftX: 0.08, driftY: 0.1, freqX: 0.08, freqY: 0.06, phase: 0 },
      { color: "#EBB488", x: 0.7, y: 0.6, radius: 0.5, driftX: 0.06, driftY: 0.08, freqX: 0.06, freqY: 0.08, phase: 2.5 },
      { color: "#EB5020", x: 0.5, y: 0.8, radius: 0.3, driftX: 0.1, driftY: 0.06, freqX: 0.1, freqY: 0.1, phase: 4.5 },
    ],
  },
  {
    label: "Soft Blanket",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#F0D4B0", x: 0.3, y: 0.3, radius: 0.55, driftX: 0.06, driftY: 0.08, freqX: 0.06, freqY: 0.07, phase: 0 },
      { color: "#EBB488", x: 0.6, y: 0.6, radius: 0.5, driftX: 0.05, driftY: 0.06, freqX: 0.07, freqY: 0.06, phase: 2.0 },
      { color: "#E89060", x: 0.5, y: 0.45, radius: 0.4, driftX: 0.04, driftY: 0.05, freqX: 0.05, freqY: 0.08, phase: 4.0 },
    ],
  },

  // ─── Minimal / subtle ─────────────────────────────────────────
  {
    label: "Hint",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#EBB488", x: 0.5, y: 0.7, radius: 0.35, driftX: 0.05, driftY: 0.04, freqX: 0.08, freqY: 0.06, phase: 0 },
      { color: "#F0D4B0", x: 0.4, y: 0.4, radius: 0.4, driftX: 0.04, driftY: 0.05, freqX: 0.06, freqY: 0.07, phase: 2.5 },
    ],
  },
  {
    label: "Blush",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#F0D4B0", x: 0.5, y: 0.6, radius: 0.5, driftX: 0.06, driftY: 0.06, freqX: 0.07, freqY: 0.08, phase: 0 },
      { color: "#E89060", x: 0.5, y: 0.8, radius: 0.25, driftX: 0.04, driftY: 0.03, freqX: 0.06, freqY: 0.05, phase: 2.0 },
    ],
  },

  // ─── Top-anchored ─────────────────────────────────────────────
  {
    label: "Top Down",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#F04A18", x: 0.5, y: -0.05, radius: 0.4, driftX: 0.05, driftY: 0.03, freqX: 0.07, freqY: 0.05, phase: 0 },
      { color: "#E86830", x: 0.5, y: 0.15, radius: 0.4, driftX: 0.04, driftY: 0.04, freqX: 0.08, freqY: 0.06, phase: 1.5 },
      { color: "#EBB488", x: 0.5, y: 0.35, radius: 0.4, driftX: 0.03, driftY: 0.04, freqX: 0.06, freqY: 0.07, phase: 3.0 },
    ],
  },

  // ─── Corner anchors ───────────────────────────────────────────
  {
    label: "Corner BL",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#F04A18", x: 0.0, y: 1.0, radius: 0.4, driftX: 0.06, driftY: 0.04, freqX: 0.08, freqY: 0.06, phase: 0 },
      { color: "#E86830", x: 0.15, y: 0.85, radius: 0.35, driftX: 0.05, driftY: 0.05, freqX: 0.07, freqY: 0.08, phase: 1.8 },
      { color: "#EBB488", x: 0.3, y: 0.7, radius: 0.35, driftX: 0.04, driftY: 0.04, freqX: 0.06, freqY: 0.07, phase: 3.5 },
    ],
  },
  {
    label: "Corner BR",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#F04A18", x: 1.0, y: 1.0, radius: 0.4, driftX: 0.06, driftY: 0.04, freqX: 0.08, freqY: 0.06, phase: 0 },
      { color: "#EB5020", x: 0.85, y: 0.85, radius: 0.35, driftX: 0.05, driftY: 0.05, freqX: 0.07, freqY: 0.08, phase: 1.8 },
      { color: "#E89060", x: 0.7, y: 0.7, radius: 0.35, driftX: 0.04, driftY: 0.04, freqX: 0.06, freqY: 0.07, phase: 3.5 },
    ],
  },

  // ─── Dual zones ───────────────────────────────────────────────
  {
    label: "Split",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#F04A18", x: 0.15, y: 0.5, radius: 0.3, driftX: 0.06, driftY: 0.08, freqX: 0.08, freqY: 0.1, phase: 0 },
      { color: "#EB5020", x: 0.85, y: 0.5, radius: 0.3, driftX: 0.06, driftY: 0.08, freqX: 0.08, freqY: 0.1, phase: 3.14 },
      { color: "#EBB488", x: 0.5, y: 0.5, radius: 0.3, driftX: 0.03, driftY: 0.03, freqX: 0.05, freqY: 0.06, phase: 1.5 },
    ],
  },
  {
    label: "Top & Bottom",
    bgColor: "#F4F1DE",
    blobs: [
      { color: "#EB5020", x: 0.5, y: 0.0, radius: 0.3, driftX: 0.05, driftY: 0.04, freqX: 0.07, freqY: 0.06, phase: 0 },
      { color: "#F04A18", x: 0.5, y: 1.0, radius: 0.35, driftX: 0.05, driftY: 0.04, freqX: 0.07, freqY: 0.06, phase: 3.14 },
      { color: "#E89060", x: 0.5, y: 0.5, radius: 0.35, driftX: 0.03, driftY: 0.03, freqX: 0.05, freqY: 0.05, phase: 1.5 },
    ],
  },
];

export function shiftHue(hex: string, shift: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === rf) h = ((gf - bf) / d + 6) % 6;
    else if (max === gf) h = (bf - rf) / d + 2;
    else h = (rf - gf) / d + 4;
    h *= 60;
  }
  h = ((h + shift) % 60 + 60) % 60;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r1: number, g1: number, b1: number;
  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else { r1 = x; g1 = c; b1 = 0; }
  const toHex = (v: number) => Math.round(Math.max(0, Math.min(255, (v + m) * 255))).toString(16).padStart(2, '0');
  return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function useAnimatedOrbImage(config: OrbConfig, active: boolean): string {
  const [image, setImage] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = CW;
      canvasRef.current.height = CH;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    let frame: number;
    const start = performance.now();
    let lastDraw = 0;

    const draw = (now: number) => {
      if (now - lastDraw < 50) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      const t = (now - start) / 1000;

      ctx.fillStyle = config.bgColor;
      ctx.fillRect(0, 0, CW, CH);

      for (let i = 0; i < config.blobs.length; i++) {
        const blob = config.blobs[i];
        const p = blob.phase;

        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;

        const hueShift = Math.sin(t * (0.05 + i * 0.02) + p) * 8;
        const color = shiftHue(blob.color, hueShift);

        let cx: number, cy: number;
        if (i % 3 === 0) {
          cx = (blob.x + Math.cos(t * blob.freqX + p) * blob.driftX) * CW;
          cy = (blob.y + Math.sin(t * blob.freqX + p) * blob.driftY) * CH;
        } else if (i % 3 === 1) {
          cx = (blob.x + Math.sin(t * blob.freqX * 2 + p) * blob.driftX) * CW;
          cy = (blob.y + Math.sin(t * blob.freqY * 3 + p) * blob.driftY) * CH;
        } else {
          const radialT = Math.sin(t * blob.freqX * 0.7 + p);
          cx = (blob.x + (blob.x - 0.5) * radialT * blob.driftX * 2) * CW;
          cy = (blob.y + (blob.y - 0.5) * radialT * blob.driftY * 2) * CH;
        }

        const breathe = 1 + Math.sin(t * (0.15 + i * 0.04) + p * 2) * 0.2;
        const r = blob.radius * DIAG * breathe;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, color);
        grad.addColorStop(0.45, color);
        grad.addColorStop(0.75, hexToRgba(color, 0.35));
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CW, CH);
      }

      setImage(canvas.toDataURL("image/jpeg", 0.8));
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [config, active]);

  return image;
}
