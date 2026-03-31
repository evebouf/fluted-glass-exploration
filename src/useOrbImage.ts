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

export const landscapeOrbs: OrbConfig[] = [
  {
    label: "Warm Drift",
    bgColor: "#F4F0E0",
    blobs: [
      // Warm orange — bottom center
      { color: "#F06820", x: 0.4, y: 0.75, radius: 0.35, driftX: 0.15, driftY: 0.1, freqX: 0.15, freqY: 0.2, phase: 0 },
      // Matching tone — right side, keeps palette consistent
      { color: "#E87530", x: 0.7, y: 0.4, radius: 0.32, driftX: 0.12, driftY: 0.15, freqX: 0.2, freqY: 0.15, phase: 2.0 },
      // Slightly deeper accent — not red, just richer
      { color: "#E06018", x: 0.3, y: 0.35, radius: 0.25, driftX: 0.18, driftY: 0.18, freqX: 0.3, freqY: 0.25, phase: 4.0 },
    ],
  },
  {
    label: "SUS 2026",
    bgColor: "#F4F2DD",
    blobs: [
      // Main bottom-center mass — intense orange
      { color: "#FB4F12", x: 0.5, y: 1.1, radius: 0.45, driftX: 0.03, driftY: 0.04, freqX: 0.08, freqY: 0.06, phase: 0 },
      // Wider glow bleeding upward
      { color: "#E8650E", x: 0.5, y: 0.9, radius: 0.55, driftX: 0.04, driftY: 0.03, freqX: 0.06, freqY: 0.08, phase: 1.5 },
      // Lighter wash reaching into the middle
      { color: "#FF8A50", x: 0.5, y: 0.75, radius: 0.4, driftX: 0.05, driftY: 0.05, freqX: 0.1, freqY: 0.07, phase: 3.0 },
      // Subtle warm tint at mid-height
      { color: "#F0A060", x: 0.45, y: 0.6, radius: 0.3, driftX: 0.03, driftY: 0.04, freqX: 0.07, freqY: 0.09, phase: 4.5 },
    ],
  },
  {
    label: "Left Blaze",
    bgColor: "#F5EFE0",
    blobs: [
      { color: "#FB4F12", x: 0.2, y: 0.5, radius: 0.45, driftX: 0.15, driftY: 0.2, freqX: 0.12, freqY: 0.18, phase: 0 },
      { color: "#F07030", x: 0.35, y: 0.3, radius: 0.25, driftX: 0.1, driftY: 0.15, freqX: 0.2, freqY: 0.14, phase: 2.0 },
      { color: "#FF8A50", x: 0.15, y: 0.8, radius: 0.3, driftX: 0.08, driftY: 0.12, freqX: 0.16, freqY: 0.2, phase: 3.5 },
    ],
  },
  {
    label: "Horizon",
    bgColor: "#F4F0E4",
    blobs: [
      { color: "#FB4F12", x: 0.5, y: 0.75, radius: 0.5, driftX: 0.25, driftY: 0.1, freqX: 0.1, freqY: 0.2, phase: 0 },
      { color: "#FF7A3D", x: 0.3, y: 0.6, radius: 0.3, driftX: 0.15, driftY: 0.08, freqX: 0.18, freqY: 0.15, phase: 1.8 },
      { color: "#E84510", x: 0.7, y: 0.65, radius: 0.28, driftX: 0.12, driftY: 0.12, freqX: 0.14, freqY: 0.22, phase: 3.2 },
    ],
  },
  {
    label: "Molten Core",
    bgColor: "#F5EDDC",
    blobs: [
      { color: "#FF5A1F", x: 0.5, y: 0.5, radius: 0.35, driftX: 0.12, driftY: 0.12, freqX: 0.22, freqY: 0.28, phase: 0 },
      { color: "#FFB366", x: 0.35, y: 0.35, radius: 0.28, driftX: 0.15, driftY: 0.15, freqX: 0.16, freqY: 0.2, phase: 1.5 },
      { color: "#E86A20", x: 0.6, y: 0.7, radius: 0.32, driftX: 0.1, driftY: 0.1, freqX: 0.2, freqY: 0.18, phase: 2.8 },
      { color: "#FF4500", x: 0.7, y: 0.3, radius: 0.2, driftX: 0.18, driftY: 0.08, freqX: 0.14, freqY: 0.24, phase: 4.0 },
    ],
  },
  {
    label: "Right Pull",
    bgColor: "#F4F2DD",
    blobs: [
      { color: "#FB4F12", x: 0.75, y: 0.5, radius: 0.42, driftX: 0.15, driftY: 0.18, freqX: 0.13, freqY: 0.17, phase: 0 },
      { color: "#D44010", x: 0.85, y: 0.3, radius: 0.25, driftX: 0.1, driftY: 0.12, freqX: 0.2, freqY: 0.15, phase: 2.0 },
      { color: "#E86520", x: 0.6, y: 0.75, radius: 0.3, driftX: 0.12, driftY: 0.1, freqX: 0.16, freqY: 0.22, phase: 3.5 },
    ],
  },
  {
    label: "Twin Suns",
    bgColor: "#F3EDD8",
    blobs: [
      { color: "#FB4F12", x: 0.25, y: 0.5, radius: 0.32, driftX: 0.12, driftY: 0.15, freqX: 0.14, freqY: 0.2, phase: 0 },
      { color: "#FF6B2B", x: 0.72, y: 0.5, radius: 0.32, driftX: 0.12, driftY: 0.15, freqX: 0.14, freqY: 0.2, phase: 3.14 },
      { color: "#FF9050", x: 0.5, y: 0.4, radius: 0.2, driftX: 0.08, driftY: 0.1, freqX: 0.2, freqY: 0.16, phase: 1.5 },
      { color: "#F08040", x: 0.5, y: 0.8, radius: 0.28, driftX: 0.15, driftY: 0.06, freqX: 0.12, freqY: 0.18, phase: 4.5 },
    ],
  },
  {
    label: "Dawn",
    bgColor: "#F5EDE0",
    blobs: [
      { color: "#FB4F12", x: 0.5, y: 0.8, radius: 0.5, driftX: 0.15, driftY: 0.1, freqX: 0.1, freqY: 0.14, phase: 0 },
      { color: "#FF8040", x: 0.3, y: 0.6, radius: 0.3, driftX: 0.18, driftY: 0.12, freqX: 0.16, freqY: 0.2, phase: 2.0 },
      { color: "#FF6020", x: 0.7, y: 0.55, radius: 0.28, driftX: 0.12, driftY: 0.15, freqX: 0.2, freqY: 0.18, phase: 3.8 },
    ],
  },
  {
    label: "Ceramic",
    bgColor: "#F8F4EE",
    blobs: [
      { color: "#E85D26", x: 0.4, y: 0.5, radius: 0.3, driftX: 0.15, driftY: 0.15, freqX: 0.18, freqY: 0.22, phase: 0 },
      { color: "#F0845A", x: 0.6, y: 0.35, radius: 0.22, driftX: 0.12, driftY: 0.1, freqX: 0.14, freqY: 0.18, phase: 2.5 },
    ],
  },
  {
    label: "Supernova",
    bgColor: "#F4EED8",
    blobs: [
      { color: "#FF4500", x: 0.5, y: 0.5, radius: 0.3, driftX: 0.08, driftY: 0.08, freqX: 0.25, freqY: 0.3, phase: 0 },
      { color: "#FF6A00", x: 0.5, y: 0.5, radius: 0.5, driftX: 0.05, driftY: 0.05, freqX: 0.18, freqY: 0.22, phase: 1.0 },
      { color: "#FF8C00", x: 0.4, y: 0.4, radius: 0.35, driftX: 0.12, driftY: 0.12, freqX: 0.14, freqY: 0.16, phase: 2.5 },
      { color: "#FF5010", x: 0.6, y: 0.6, radius: 0.2, driftX: 0.1, driftY: 0.1, freqX: 0.2, freqY: 0.25, phase: 4.0 },
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
