import { useEffect, useRef, useState } from "react";
import { FlutedGlass } from "@paper-design/shaders-react";
import { PALETTE, SUS_GLASS } from "./brand/constants";

// ─── Band config ────────────────────────────────────────────────
interface Band {
  heightPct: number;  // relative height weight
  colors: string[];   // gradient color stops
  speed: number;      // scroll speed multiplier
}

const P = PALETTE;

const BANDS: Band[] = [
  { heightPct: 8,  colors: [P.neutral.parchment, P.neutral.sand, P.neutral.parchment],        speed: 0.4 },
  { heightPct: 5,  colors: [P.orange.apricot, P.neutral.linen, P.orange.apricot],              speed: -0.7 },
  { heightPct: 9,  colors: [P.orange.coral, P.orange.apricot, P.orange.coral],                 speed: 0.3 },
  { heightPct: 12, colors: [P.orange.ember, P.orange.coral, P.orange.ember],                   speed: -0.5 },
  { heightPct: 6,  colors: [P.neutral.sand, P.orange.apricot, P.neutral.sand],                 speed: 0.8 },
  { heightPct: 14, colors: [P.orange.blaze, P.orange.ember, P.orange.blaze],                   speed: -0.35 },
  { heightPct: 4,  colors: [P.neutral.linen, P.neutral.parchment, P.neutral.linen],            speed: 1.0 },
  { heightPct: 10, colors: [P.orange.coral, P.orange.blaze, P.orange.coral],                   speed: -0.6 },
  { heightPct: 7,  colors: [P.orange.apricot, P.neutral.sand, P.orange.apricot],               speed: 0.5 },
  { heightPct: 11, colors: [P.orange.blaze, P.orange.coral, P.orange.blaze],                   speed: -0.4 },
  { heightPct: 5,  colors: [P.neutral.parchment, P.orange.apricot, P.neutral.parchment],       speed: 0.9 },
  { heightPct: 8,  colors: [P.orange.ember, P.orange.blaze, P.orange.ember],                   speed: -0.55 },
  { heightPct: 6,  colors: [P.neutral.sand, P.neutral.linen, P.neutral.sand],                  speed: 0.65 },
  { heightPct: 13, colors: [P.orange.coral, P.orange.ember, P.orange.coral],                   speed: -0.3 },
  { heightPct: 4,  colors: [P.orange.apricot, P.neutral.parchment, P.orange.apricot],          speed: 0.85 },
];

// Canvas dimensions (half viewport for perf)
const CW = typeof window !== "undefined" ? Math.round(window.innerWidth / 2) : 720;
const CH = typeof window !== "undefined" ? Math.round(window.innerHeight / 2) : 450;

// Pre-compute band layout
function layoutBands() {
  const total = BANDS.reduce((s, b) => s + b.heightPct, 0);
  const result: { top: number; height: number; colors: string[]; speed: number }[] = [];
  let cursor = 0;
  for (const band of BANDS) {
    const h = (band.heightPct / total) * CH;
    result.push({ top: cursor, height: h, colors: band.colors, speed: band.speed });
    cursor += h;
  }
  return result;
}

// ─── Pre-render each band as an offscreen strip ─────────────────
// Each strip is 2x canvas width so we can scroll it seamlessly
function prerenderStrips(bands: ReturnType<typeof layoutBands>) {
  return bands.map((band) => {
    const strip = document.createElement("canvas");
    const sw = CW * 2;
    strip.width = sw;
    strip.height = 1; // just 1px tall, we'll drawImage stretched
    const sCtx = strip.getContext("2d")!;

    const grad = sCtx.createLinearGradient(0, 0, sw, 0);
    const stopCount = band.colors.length;
    for (let i = 0; i < stopCount; i++) {
      grad.addColorStop(i / (stopCount - 1), band.colors[i]);
    }
    // Mirror the gradient for seamless wrap
    for (let i = stopCount - 2; i >= 0; i--) {
      grad.addColorStop(1 - i / (stopCount - 1) * 0.001, band.colors[i]); // near-1 stops
    }

    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, sw, 1);
    return strip;
  });
}

// ─── Animated bands → data URL hook ─────────────────────────────
function useAnimatedBandsImage(active: boolean): string {
  const [image, setImage] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bandsRef = useRef(layoutBands());
  const stripsRef = useRef<HTMLCanvasElement[]>([]);

  useEffect(() => {
    if (!active) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = CW;
      canvasRef.current.height = CH;
    }
    if (stripsRef.current.length === 0) {
      stripsRef.current = prerenderStrips(bandsRef.current);
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const bands = bandsRef.current;
    const strips = stripsRef.current;

    let frame: number;
    const start = performance.now();
    let lastDraw = 0;

    const draw = (now: number) => {
      if (now - lastDraw < 50) { // ~20fps
        frame = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      const t = (now - start) / 1000;

      // Background
      ctx.fillStyle = P.neutral.parchment;
      ctx.fillRect(0, 0, CW, CH);

      // Draw each band by scrolling its pre-rendered strip
      for (let i = 0; i < bands.length; i++) {
        const band = bands[i];
        const strip = strips[i];
        const stripW = strip.width; // 2 * CW

        // Pixel offset — wraps around the strip width
        const px = ((t * band.speed * 60) % stripW + stripW) % stripW;

        // Draw the strip at the offset, stretched vertically to band height
        // First portion
        const remaining = stripW - px;
        const draw1W = Math.min(remaining, CW);
        ctx.drawImage(strip, px, 0, draw1W, 1, 0, band.top, draw1W, band.height);

        // Wrapped portion
        if (draw1W < CW) {
          ctx.drawImage(strip, 0, 0, CW - draw1W, 1, draw1W, band.top, CW - draw1W, band.height);
        }
      }

      setImage(canvas.toDataURL("image/jpeg", 0.85));
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return image;
}

// ─── Component ──────────────────────────────────────────────────
export default function BandsGlass() {
  const image = useAnimatedBandsImage(true);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: P.neutral.parchment }}>
      {image && (
        <FlutedGlass
          width="100%"
          height="100%"
          image={image}
          colorBack="#00000000"
          colorShadow={P.glass.shadow}
          colorHighlight={P.glass.highlight}
          shape={SUS_GLASS.shape}
          distortionShape={SUS_GLASS.distortionShape}
          size={SUS_GLASS.size}
          distortion={SUS_GLASS.distortion}
          edges={SUS_GLASS.edges}
          blur={SUS_GLASS.blur}
          shadows={SUS_GLASS.shadows}
          highlights={SUS_GLASS.highlights}
          stretch={SUS_GLASS.stretch}
          angle={SUS_GLASS.angle}
          grainOverlay={SUS_GLASS.grainOverlay}
          offsetX={0}
          offsetY={0}
          scale={1}
          fit="cover"
          speed={0}
        />
      )}

    </div>
  );
}
