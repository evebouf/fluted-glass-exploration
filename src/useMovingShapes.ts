import { useEffect, useRef, useState } from "react";

export interface ShapeConfig {
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

export interface ShapesConfig {
  label: string;
  bgColor: string;
  shapes: ShapeConfig[];
}

const CW = 640;
const CH = 360;

export const shapesPresets: ShapesConfig[] = [
  {
    label: "Three Orbs",
    bgColor: "#F4F2DD",
    shapes: [
      { color: "#FB4F12", x: 0.3, y: 0.5, radius: 120, driftX: 0.12, driftY: 0.15, freqX: 0.08, freqY: 0.1, phase: 0 },
      { color: "#F07030", x: 0.65, y: 0.4, radius: 80, driftX: 0.15, driftY: 0.1, freqX: 0.12, freqY: 0.09, phase: 2.0 },
      { color: "#F4E0C8", x: 0.5, y: 0.7, radius: 100, driftX: 0.1, driftY: 0.12, freqX: 0.1, freqY: 0.13, phase: 4.0 },
    ],
  },
  {
    label: "Cluster",
    bgColor: "#F4F2DD",
    shapes: [
      { color: "#FB4F12", x: 0.45, y: 0.45, radius: 90, driftX: 0.08, driftY: 0.08, freqX: 0.1, freqY: 0.12, phase: 0 },
      { color: "#FF8A50", x: 0.55, y: 0.55, radius: 70, driftX: 0.1, driftY: 0.1, freqX: 0.14, freqY: 0.1, phase: 1.5 },
      { color: "#EDE0C8", x: 0.4, y: 0.6, radius: 110, driftX: 0.06, driftY: 0.08, freqX: 0.08, freqY: 0.06, phase: 3.0 },
      { color: "#E86520", x: 0.6, y: 0.35, radius: 55, driftX: 0.12, driftY: 0.12, freqX: 0.16, freqY: 0.14, phase: 4.5 },
    ],
  },
  {
    label: "Big & Small",
    bgColor: "#F5EFE0",
    shapes: [
      { color: "#FB4F12", x: 0.35, y: 0.5, radius: 160, driftX: 0.1, driftY: 0.08, freqX: 0.06, freqY: 0.08, phase: 0 },
      { color: "#F4DFC0", x: 0.7, y: 0.4, radius: 50, driftX: 0.15, driftY: 0.18, freqX: 0.18, freqY: 0.14, phase: 1.8 },
      { color: "#FF7030", x: 0.6, y: 0.65, radius: 40, driftX: 0.2, driftY: 0.15, freqX: 0.14, freqY: 0.18, phase: 3.5 },
    ],
  },
  {
    label: "Scattered",
    bgColor: "#F4F0E4",
    shapes: [
      { color: "#FB4F12", x: 0.15, y: 0.3, radius: 70, driftX: 0.1, driftY: 0.12, freqX: 0.1, freqY: 0.08, phase: 0 },
      { color: "#F0D8B8", x: 0.8, y: 0.25, radius: 90, driftX: 0.08, driftY: 0.1, freqX: 0.07, freqY: 0.1, phase: 1.2 },
      { color: "#E85D26", x: 0.6, y: 0.7, radius: 60, driftX: 0.14, driftY: 0.1, freqX: 0.12, freqY: 0.15, phase: 2.8 },
      { color: "#F8E8D0", x: 0.3, y: 0.75, radius: 80, driftX: 0.1, driftY: 0.08, freqX: 0.09, freqY: 0.11, phase: 4.2 },
      { color: "#FF8A50", x: 0.5, y: 0.15, radius: 45, driftX: 0.18, driftY: 0.15, freqX: 0.15, freqY: 0.12, phase: 5.5 },
    ],
  },
  {
    label: "Overlap",
    bgColor: "#F4F2DD",
    shapes: [
      { color: "#FB4F12", x: 0.42, y: 0.48, radius: 130, driftX: 0.08, driftY: 0.06, freqX: 0.06, freqY: 0.08, phase: 0 },
      { color: "#F0D0A8", x: 0.55, y: 0.52, radius: 130, driftX: 0.08, driftY: 0.06, freqX: 0.06, freqY: 0.08, phase: 3.14 },
    ],
  },
  {
    label: "Rising",
    bgColor: "#F5EDE0",
    shapes: [
      { color: "#FB4F12", x: 0.5, y: 0.7, radius: 140, driftX: 0.06, driftY: 0.15, freqX: 0.08, freqY: 0.06, phase: 0 },
      { color: "#FFB880", x: 0.35, y: 0.5, radius: 60, driftX: 0.1, driftY: 0.18, freqX: 0.12, freqY: 0.08, phase: 2.0 },
      { color: "#F0D8B8", x: 0.65, y: 0.45, radius: 70, driftX: 0.08, driftY: 0.2, freqX: 0.1, freqY: 0.07, phase: 4.0 },
    ],
  },
];

export function useMovingShapesImage(config: ShapesConfig, active: boolean): string {
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

      for (let i = 0; i < config.shapes.length; i++) {
        const s = config.shapes[i];
        const p = s.phase;

        let cx: number, cy: number;
        if (i % 3 === 0) {
          cx = (s.x + Math.cos(t * s.freqX + p) * s.driftX) * CW;
          cy = (s.y + Math.sin(t * s.freqX + p) * s.driftY) * CH;
        } else if (i % 3 === 1) {
          cx = (s.x + Math.sin(t * s.freqX * 2 + p) * s.driftX) * CW;
          cy = (s.y + Math.sin(t * s.freqY * 3 + p) * s.driftY) * CH;
        } else {
          const radialT = Math.sin(t * s.freqX * 0.7 + p);
          cx = (s.x + (s.x - 0.5) * radialT * s.driftX * 2) * CW;
          cy = (s.y + (s.y - 0.5) * radialT * s.driftY * 2) * CH;
        }

        const breathe = 1 + Math.sin(t * (0.1 + i * 0.03) + p * 2) * 0.1;
        const r = s.radius * breathe;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
      }

      setImage(canvas.toDataURL("image/jpeg", 0.8));
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [config, active]);

  return image;
}
