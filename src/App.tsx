import { useState, useEffect, useCallback, useRef } from "react";
import { FlutedGlass, GrainGradient } from "@paper-design/shaders-react";
import { useAnimatedOrbImage, landscapeOrbs, shiftHue, hexToRgba, type OrbConfig } from "./useOrbImage";
import { useStaticCircleImage } from "./useStaticCircle";
import { useMovingShapesImage, shapesPresets, type ShapesConfig } from "./useMovingShapes";
import "./App.css";

// ─── Glass Config ────────────────────────────────────────────────
interface GlassConfig {
  label: string;
  shape: "lines" | "wave" | "linesIrregular";
  distortionShape: "prism" | "contour" | "flat" | "cascade";
  size: number;
  distortion: number;
  edges: number;
  blur: number;
  shadows: number;
  highlights: number;
  stretch: number;
  angle: number;
  grainOverlay: number;
}

const glassPresets: GlassConfig[] = [
  { label: "Sharp", shape: "lines", distortionShape: "prism", size: 0.67, distortion: 0.55, edges: 0.4, blur: 0, shadows: 0.3, highlights: 0.35, stretch: 0, angle: 0, grainOverlay: 0.04 },
  { label: "Zigzag", shape: "linesIrregular", distortionShape: "prism", size: 0.75, distortion: 0.7, edges: 0.5, blur: 0, shadows: 0.25, highlights: 0.12, stretch: 0.3, angle: 0, grainOverlay: 0.05 },
  { label: "Waves", shape: "wave", distortionShape: "contour", size: 0.85, distortion: 0.6, edges: 0.45, blur: 0.1, shadows: 0.15, highlights: 0.08, stretch: 0.8, angle: 0, grainOverlay: 0.04 },
  { label: "Cascade", shape: "lines", distortionShape: "cascade", size: 0.5, distortion: 0.8, edges: 0.55, blur: 0.15, shadows: 0.4, highlights: 0.1, stretch: 0, angle: 0, grainOverlay: 0.03 },
  { label: "Abstract", shape: "linesIrregular", distortionShape: "flat", size: 0.65, distortion: 1, edges: 0.5, blur: 0.6, shadows: 0.1, highlights: 0.05, stretch: 1, angle: 25, grainOverlay: 0.08 },
  { label: "Fine", shape: "lines", distortionShape: "prism", size: 0.92, distortion: 0.3, edges: 0.2, blur: 0, shadows: 0.15, highlights: 0.1, stretch: 0, angle: 0, grainOverlay: 0.03 },
];

// ─── Static Glass (no movement) ──────────────────────────────────
function StaticGlass({
  image,
  glassConfig,
  glassScale,
}: {
  image: string;
  glassConfig: GlassConfig;
  glassScale: number;
}) {
  if (!image) return null;

  return (
    <FlutedGlass
      width="100%"
      height="100%"
      image={image}
      colorBack="#00000000"
      colorShadow="#5C2800"
      colorHighlight="#F0A870"
      shape={glassConfig.shape}
      distortionShape={glassConfig.distortionShape}
      size={glassConfig.size}
      distortion={glassConfig.distortion}
      edges={glassConfig.edges}
      blur={glassConfig.blur}
      shadows={glassConfig.shadows}
      highlights={glassConfig.highlights}
      stretch={glassConfig.stretch}
      angle={glassConfig.angle}
      shift={0}
      grainOverlay={glassConfig.grainOverlay}
      offsetX={0}
      offsetY={0}
      scale={glassScale}
      fit="cover"
      speed={0}
    />
  );
}

// ─── Cursor-reactive orb image ───────────────────────────────────
// Same as useAnimatedOrbImage but adds a cursor-driven offset to all blob positions
function useCursorOrbImage(config: OrbConfig, active: boolean): string {
  const [image, setImage] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothRef = useRef({ x: 0, y: 0 });
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    console.log("[cursor-orb] mousemove listener ATTACHED");
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      console.log("[cursor-orb] mousemove listener DETACHED");
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  useEffect(() => {
    console.log("[cursor-orb] draw effect running, active=", active);
    if (!active) {
      console.log("[cursor-orb] NOT active, skipping");
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = 480;
      canvasRef.current.height = 270;
      console.log("[cursor-orb] canvas created");
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const CW = 480, CH = 270;
    const DIAG = Math.sqrt(CW * CW + CH * CH);

    let frame: number;
    const start = performance.now();
    let lastDraw = 0;
    let drawCount = 0;

    const draw = (now: number) => {
      if (now - lastDraw < 50) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      drawCount++;
      const t = (now - start) / 1000;
      const cfg = configRef.current;

      // Smooth lerp cursor offset
      const s = smoothRef.current;
      const m = mouseRef.current;
      // Vertical movement is what's visible through vertical fluted glass lines.
      // Horizontal shift gets absorbed by the fluting. So use big vertical range.
      const targetX = (m.x - 0.5) * 0.5;
      const targetY = (m.y - 0.5) * 2.5 + (m.x - 0.5) * 1.5;
      s.x += (targetX - s.x) * 0.08;
      s.y += (targetY - s.y) * 0.08;

      // Debug: log every 40 frames (~2 seconds)
      if (drawCount % 40 === 0) {
        console.log("[cursor-orb] frame", drawCount, {
          rawMouse: { x: m.x.toFixed(3), y: m.y.toFixed(3) },
          smooth: { x: s.x.toFixed(4), y: s.y.toFixed(4) },
          offsetPx: { x: (s.x * CW).toFixed(1), y: (s.y * CH).toFixed(1) },
          blobs: cfg.blobs.length,
          imageLen: 0, // will be set after toDataURL
        });
      }

      ctx.fillStyle = cfg.bgColor;
      ctx.fillRect(0, 0, CW, CH);

      for (let i = 0; i < cfg.blobs.length; i++) {
        const blob = cfg.blobs[i];
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

        // Add cursor offset — shifts entire gradient behind static glass
        cx += s.x * CW;
        cy += s.y * CH;

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

      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      if (drawCount % 40 === 0) {
        console.log("[cursor-orb] dataURL length:", dataUrl.length);
      }
      setImage(dataUrl);
      frame = requestAnimationFrame(draw);
    };

    console.log("[cursor-orb] starting rAF loop");
    frame = requestAnimationFrame(draw);
    return () => {
      console.log("[cursor-orb] CANCELLING rAF loop, ran", drawCount, "frames");
      cancelAnimationFrame(frame);
    };
  // Only restart on active change, not config — config is read via ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  console.log("[cursor-orb] hook render, image length:", image.length, "active:", active);
  return image;
}

// ─── Mode wrappers ───────────────────────────────────────────────
function CursorScreen({ orbConfig, glassConfig, glassScale }: {
  orbConfig: OrbConfig; glassConfig: GlassConfig; glassScale: number; active: boolean;
}) {
  // Shift blob positions based on cursor — modify orbConfig before passing to useAnimatedOrbImage
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothRef = useRef({ x: 0, y: 0 });
  const [shiftedOrb, setShiftedOrb] = useState<OrbConfig>(orbConfig);
  const orbRef = useRef(orbConfig);
  orbRef.current = orbConfig;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    let frame: number;
    let lastUpdate = 0;

    const tick = (now: number) => {
      if (now - lastUpdate < 80) {
        frame = requestAnimationFrame(tick);
        return;
      }
      lastUpdate = now;

      const s = smoothRef.current;
      const m = mouseRef.current;
      const targetX = (m.x - 0.5) * 0.4;
      const targetY = (m.y - 0.5) * 0.4 + (m.x - 0.5) * 0.3;
      s.x += (targetX - s.x) * 0.1;
      s.y += (targetY - s.y) * 0.1;

      const base = orbRef.current;
      setShiftedOrb({
        ...base,
        blobs: base.blobs.map((b) => ({
          ...b,
          x: b.x + s.x,
          y: b.y + s.y,
        })),
      });

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const image = useAnimatedOrbImage(shiftedOrb, true);

  return (
    <div className="screen active">
      <StaticGlass image={image} glassConfig={glassConfig} glassScale={glassScale} />
    </div>
  );
}

function BlobsScreen({ orbConfig, glassConfig, glassScale, active }: {
  orbConfig: OrbConfig; glassConfig: GlassConfig; glassScale: number; active: boolean;
}) {
  const image = useAnimatedOrbImage(orbConfig, active);
  return (
    <div className="screen active">
      <StaticGlass image={image} glassConfig={glassConfig} glassScale={glassScale} />
    </div>
  );
}

function CircleScreen({ glassConfig, glassScale, active, bgColor, circleColor, circleRadius }: {
  glassConfig: GlassConfig; glassScale: number; active: boolean; bgColor: string; circleColor: string; circleRadius: number;
}) {
  const image = useStaticCircleImage(bgColor, circleColor, circleRadius);
  return (
    <div className="screen active">
      <StaticGlass image={image} glassConfig={glassConfig} glassScale={glassScale} />
    </div>
  );
}

function ShapesScreen({ shapesConfig, glassConfig, glassScale, active }: {
  shapesConfig: ShapesConfig; glassConfig: GlassConfig; glassScale: number; active: boolean;
}) {
  const image = useMovingShapesImage(shapesConfig, active);
  return (
    <div className="screen active">
      <StaticGlass image={image} glassConfig={glassConfig} glassScale={glassScale} />
    </div>
  );
}

// ─── Mode D: Grain Gradient background + Fluted Glass overlay ────
function GrainScreen({ glassConfig, glassScale, active }: {
  glassConfig: GlassConfig; glassScale: number; active: boolean;
}) {
  // Render GrainGradient to a hidden canvas, capture as image for FlutedGlass
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const grainContainerRef = useRef<HTMLDivElement | null>(null);

  // We can't nest two WebGL shaders, so show them layered:
  // GrainGradient behind, FlutedGlass on top with transparent colorBack
  const [renderState, setRenderState] = useState({
    stretch: glassConfig.stretch,
    size: glassConfig.size,
    distortion: glassConfig.distortion,
    edges: glassConfig.edges,
    blur: glassConfig.blur,
    shadows: glassConfig.shadows,
    highlights: glassConfig.highlights,
    grainOverlay: glassConfig.grainOverlay,
    shift: 0,
    scale: glassScale,
    speed: 0.15,
  });

  const glassConfigRef = useRef(glassConfig);
  const glassScaleRef = useRef(glassScale);
  glassConfigRef.current = glassConfig;
  glassScaleRef.current = glassScale;

  useEffect(() => {
    if (!active) return;
    let frame: number;
    const start = performance.now();
    let lastRender = 0;

    const tick = (now: number) => {
      if (now - lastRender < 33) { frame = requestAnimationFrame(tick); return; }
      lastRender = now;
      const t = (now - start) / 1000;
      const gc = glassConfigRef.current;
      const gs = glassScaleRef.current;

      setRenderState({
        stretch: gc.stretch + Math.sin(t * 0.15) * 0.8 + Math.sin(t * 0.06 + 1.0) * 0.4,
        size: gc.size + Math.sin(t * 0.1 + 2.0) * 0.2 + Math.sin(t * 0.04) * 0.1,
        distortion: gc.distortion + Math.sin(t * 0.08 + 0.5) * 0.35,
        edges: gc.edges + Math.sin(t * 0.12 + 0.7) * 0.25,
        blur: Math.max(0, gc.blur + Math.sin(t * 0.07 + 1.5) * 0.2),
        shadows: gc.shadows + Math.sin(t * 0.09 + 0.3) * 0.2,
        highlights: gc.highlights + Math.sin(t * 0.1 + 1.8) * 0.15,
        grainOverlay: gc.grainOverlay + Math.sin(t * 0.8) * 0.03,
        shift: Math.sin(t * 0.06) * 0.4,
        scale: gs + Math.sin(t * 0.07) * 0.4,
        speed: 0.2 + Math.sin(t * 0.04) * 0.18,
      });

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const s = renderState;

  return (
    <div className="screen active">
      {/* Grain Gradient background — renders as its own WebGL canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <GrainGradient
          width="100%"
          height="100%"
          colorBack="#FB4F12"
          colors={["#F4F2DD", "#F5EFE0", "#E8650E", "#F4E0C8"]}
          softness={0.2}
          intensity={0.8}
          noise={0.5}
          shape="corners"
          speed={0.5}
        />
      </div>
      {/* FlutedGlass overlay — transparent back, distorts what's behind visually */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, mixBlendMode: 'normal' }}>
        <FlutedGlass
          width="100%"
          height="100%"
          image=""
          colorBack="#00000000"
          colorShadow="#5C2800"
          colorHighlight="#F0A870"
          shape={glassConfig.shape}
          distortionShape={glassConfig.distortionShape}
          size={s.size}
          distortion={s.distortion}
          edges={s.edges}
          blur={s.blur}
          shadows={s.shadows}
          highlights={s.highlights}
          stretch={s.stretch}
          angle={glassConfig.angle}
          shift={s.shift}
          grainOverlay={s.grainOverlay}
          offsetX={0}
          offsetY={0}
          scale={s.scale}
          fit="cover"
          speed={s.speed}
        />
      </div>
    </div>
  );
}

// ─── Ambient Mode (pure CSS blobs, no glass) ─────────────────
interface AmbientPreset {
  label: string;
  bgColor: string;
  blobs: {
    color: string;
    x: string;
    y: string;
    size: number;
    blur: number;
    opacity: number;
    animation: string;
    duration: string;
  }[];
}

const ambientPresets: AmbientPreset[] = [
  {
    label: "Terracotta Sun",
    bgColor: "#C0705A",
    blobs: [
      // Back layer — massive, very blurred, slow
      { color: "#F5D0B0", x: "-5%",  y: "-10%", size: 800, blur: 120, opacity: 0.7, animation: "ambient-drift-1", duration: "32s" },
      { color: "#E89060", x: "40%",  y: "-15%", size: 700, blur: 100, opacity: 0.6, animation: "ambient-drift-2", duration: "38s" },
      { color: "#D06030", x: "10%",  y: "40%",  size: 750, blur: 110, opacity: 0.5, animation: "ambient-drift-6", duration: "35s" },
      // Front layer — smaller, less blur, faster
      { color: "#FFE0C0", x: "50%",  y: "30%",  size: 500, blur: 70,  opacity: 0.6, animation: "ambient-drift-3", duration: "24s" },
      { color: "#F0A870", x: "-10%", y: "55%",  size: 550, blur: 80,  opacity: 0.55, animation: "ambient-drift-5", duration: "26s" },
      { color: "#FFD0A0", x: "65%",  y: "60%",  size: 450, blur: 60,  opacity: 0.5, animation: "ambient-drift-4", duration: "22s" },
    ],
  },
  {
    label: "Peach Haze",
    bgColor: "#B88878",
    blobs: [
      { color: "#F5D8C8", x: "0%",   y: "0%",   size: 900, blur: 130, opacity: 0.65, animation: "ambient-drift-2", duration: "36s" },
      { color: "#E8B8A0", x: "50%",  y: "-10%", size: 750, blur: 110, opacity: 0.6,  animation: "ambient-drift-1", duration: "40s" },
      { color: "#D09080", x: "20%",  y: "50%",  size: 650, blur: 100, opacity: 0.5,  animation: "ambient-drift-4", duration: "30s" },
      { color: "#FFE8D8", x: "60%",  y: "35%",  size: 500, blur: 70,  opacity: 0.6,  animation: "ambient-drift-5", duration: "25s" },
      { color: "#F0C8B0", x: "10%",  y: "65%",  size: 480, blur: 65,  opacity: 0.55, animation: "ambient-drift-3", duration: "23s" },
    ],
  },
  {
    label: "Warm Ember",
    bgColor: "#983820",
    blobs: [
      { color: "#D06838", x: "-5%",  y: "-5%",  size: 800, blur: 120, opacity: 0.7,  animation: "ambient-drift-3", duration: "34s" },
      { color: "#E89058", x: "45%",  y: "5%",   size: 700, blur: 100, opacity: 0.6,  animation: "ambient-drift-6", duration: "38s" },
      { color: "#F0B888", x: "15%",  y: "45%",  size: 650, blur: 100, opacity: 0.55, animation: "ambient-drift-1", duration: "30s" },
      { color: "#FFD0A0", x: "55%",  y: "40%",  size: 500, blur: 70,  opacity: 0.6,  animation: "ambient-drift-4", duration: "24s" },
      { color: "#E87840", x: "0%",   y: "60%",  size: 550, blur: 80,  opacity: 0.5,  animation: "ambient-drift-2", duration: "26s" },
      { color: "#F0A068", x: "70%",  y: "55%",  size: 400, blur: 60,  opacity: 0.55, animation: "ambient-drift-5", duration: "21s" },
    ],
  },
  {
    label: "Golden Hour",
    bgColor: "#A87050",
    blobs: [
      { color: "#E8C8A0", x: "-10%", y: "0%",   size: 850, blur: 120, opacity: 0.65, animation: "ambient-drift-1", duration: "35s" },
      { color: "#F5E0C8", x: "40%",  y: "-10%", size: 700, blur: 100, opacity: 0.6,  animation: "ambient-drift-6", duration: "33s" },
      { color: "#C89060", x: "60%",  y: "40%",  size: 650, blur: 100, opacity: 0.55, animation: "ambient-drift-3", duration: "30s" },
      { color: "#FFE8D0", x: "15%",  y: "45%",  size: 550, blur: 75,  opacity: 0.6,  animation: "ambient-drift-2", duration: "25s" },
      { color: "#E8B080", x: "70%",  y: "10%",  size: 500, blur: 70,  opacity: 0.5,  animation: "ambient-drift-5", duration: "22s" },
    ],
  },
];

function AmbientScreen({ preset, active }: { preset: AmbientPreset; active: boolean }) {
  if (!active) return null;
  return (
    <div className="ambient-screen" style={{ background: preset.bgColor }}>
      {preset.blobs.map((blob, i) => (
        <div
          key={i}
          className="ambient-blob"
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.size,
            height: blob.size,
            backgroundColor: blob.color,
            filter: `blur(${blob.blur}px)`,
            opacity: blob.opacity,
            animation: `${blob.animation} ${blob.duration} ease-in-out infinite`,
            animationDelay: `${-i * 4.5}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Slider ──────────────────────────────────────────────────────
function Slider({ label, value, onChange, min = 0, max = 1, step = 0.01 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div className="ctrl-slider">
      <div className="ctrl-slider-header">
        <span className="ctrl-slider-label">{label}</span>
        <span className="ctrl-slider-value">{value.toFixed(max > 1 ? 0 : 2)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

function Select({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <div className="ctrl-select">
      <span className="ctrl-select-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="ctrl-color">
      <span className="ctrl-color-label">{label}</span>
      <div className="ctrl-color-input">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <span className="ctrl-color-hex">{value}</span>
      </div>
    </div>
  );
}

// ─── URL Params ──────────────────────────────────────────────────
function slugify(s: string) { return s.toLowerCase().replace(/\s+/g, "-"); }

function readUrlState() {
  const p = new URLSearchParams(window.location.search);
  const mode = (p.get("mode") ?? "blobs") as "blobs" | "cursor" | "circle" | "shapes" | "grain" | "ambient";
  const glassSlug = p.get("glass") ?? "";
  const presetSlug = p.get("preset") ?? "";

  const glassIdx = Math.max(0, glassPresets.findIndex((g) => slugify(g.label) === glassSlug));
  let orbIdx = 0;
  let shapesIdx = 0;
  let ambientIdx = 0;

  if (mode === "blobs" || mode === "cursor") {
    const found = landscapeOrbs.findIndex((o) => slugify(o.label) === presetSlug);
    if (found >= 0) orbIdx = found;
  } else if (mode === "shapes") {
    const found = shapesPresets.findIndex((s) => slugify(s.label) === presetSlug);
    if (found >= 0) shapesIdx = found;
  } else if (mode === "ambient") {
    const found = ambientPresets.findIndex((a) => slugify(a.label) === presetSlug);
    if (found >= 0) ambientIdx = found;
  }

  return { mode, glassIdx, orbIdx, shapesIdx, ambientIdx };
}

function pushUrl(mode: string, glassLabel: string, presetLabel?: string) {
  const p = new URLSearchParams();
  p.set("mode", mode);
  p.set("glass", slugify(glassLabel));
  if (presetLabel) p.set("preset", slugify(presetLabel));
  window.history.replaceState(null, "", `?${p.toString()}`);
}

// ─── App ─────────────────────────────────────────────────────────
export default function App() {
  const init = useRef(readUrlState()).current;

  const [mode, setMode] = useState<"blobs" | "cursor" | "circle" | "shapes" | "grain" | "ambient">(init.mode);
  const [currentOrbIdx, setCurrentOrbIdx] = useState(init.orbIdx);
  const [currentGlassIdx, setCurrentGlassIdx] = useState(init.glassIdx);
  const [panelOpen, setPanelOpen] = useState(false);

  const [glass, setGlass] = useState<GlassConfig>({ ...glassPresets[init.glassIdx] });
  const [orb, setOrb] = useState<OrbConfig>({ ...landscapeOrbs[init.orbIdx] });
  const [glassScale, setGlassScale] = useState(1.8);

  // Circle mode state
  const [bgColor, setBgColor] = useState("#F4F2DD");
  const [circleColor, setCircleColor] = useState("#FB4F12");
  const [circleRadius, setCircleRadius] = useState(0.25);

  // Shapes mode state
  const [currentShapesIdx, setCurrentShapesIdx] = useState(init.shapesIdx);
  const [shapes, setShapes] = useState<ShapesConfig>({ ...shapesPresets[init.shapesIdx] });

  // Ambient mode state
  const [currentAmbientIdx, setCurrentAmbientIdx] = useState(init.ambientIdx);

  // Sync URL on state changes
  useEffect(() => {
    let presetLabel: string | undefined;
    if (mode === "blobs" || mode === "cursor") presetLabel = landscapeOrbs[currentOrbIdx]?.label;
    else if (mode === "shapes") presetLabel = shapesPresets[currentShapesIdx]?.label;
    else if (mode === "ambient") presetLabel = ambientPresets[currentAmbientIdx]?.label;
    pushUrl(mode, glassPresets[currentGlassIdx]?.label ?? "sharp", presetLabel);
  }, [mode, currentGlassIdx, currentOrbIdx, currentShapesIdx, currentAmbientIdx]);

  const loadShapesPreset = useCallback((i: number) => {
    setCurrentShapesIdx(i);
    setShapes({ ...shapesPresets[i] });
  }, []);

  const total = landscapeOrbs.length;

  const next = useCallback(() => {
    setCurrentOrbIdx((i) => { const n = (i + 1) % total; setOrb({ ...landscapeOrbs[n] }); return n; });
  }, [total]);

  const prev = useCallback(() => {
    setCurrentOrbIdx((i) => { const n = (i - 1 + total) % total; setOrb({ ...landscapeOrbs[n] }); return n; });
  }, [total]);

  const loadGlassPreset = useCallback((i: number) => {
    setCurrentGlassIdx(i);
    setGlass({ ...glassPresets[i] });
  }, []);

  const loadOrbPreset = useCallback((i: number) => {
    setCurrentOrbIdx(i);
    setOrb({ ...landscapeOrbs[i] });
  }, []);

  const nextShapes = useCallback(() => {
    setCurrentShapesIdx((i) => { const n = (i + 1) % shapesPresets.length; setShapes({ ...shapesPresets[n] }); return n; });
  }, []);
  const prevShapes = useCallback(() => {
    setCurrentShapesIdx((i) => { const n = (i - 1 + shapesPresets.length) % shapesPresets.length; setShapes({ ...shapesPresets[n] }); return n; });
  }, []);

  const nextAmbient = useCallback(() => {
    setCurrentAmbientIdx((i) => (i + 1) % ambientPresets.length);
  }, []);
  const prevAmbient = useCallback(() => {
    setCurrentAmbientIdx((i) => (i - 1 + ambientPresets.length) % ambientPresets.length);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "SELECT") return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (mode === "shapes") nextShapes(); else if (mode === "ambient") nextAmbient(); else next();
      }
      else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (mode === "shapes") prevShapes(); else if (mode === "ambient") prevAmbient(); else prev();
      }
      else if (e.key === "p" || e.key === "P") { setPanelOpen((v) => !v); }
      else if (e.key === "m" || e.key === "M") { setMode((m) => m === "blobs" ? "cursor" : m === "cursor" ? "shapes" : m === "shapes" ? "grain" : m === "grain" ? "ambient" : m === "ambient" ? "circle" : "blobs"); }
      else if (e.key === "ArrowUp") { e.preventDefault(); loadGlassPreset((currentGlassIdx + 1) % glassPresets.length); }
      else if (e.key === "ArrowDown") { e.preventDefault(); loadGlassPreset((currentGlassIdx - 1 + glassPresets.length) % glassPresets.length); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, nextShapes, prevShapes, nextAmbient, prevAmbient, mode, currentGlassIdx, loadGlassPreset]);

  const updateGlass = (key: string, value: number | string) => setGlass((prev) => ({ ...prev, [key]: value }));
  const updateBlob = (index: number, key: string, value: number | string) => {
    setOrb((prev) => { const blobs = [...prev.blobs]; blobs[index] = { ...blobs[index], [key]: value }; return { ...prev, blobs }; });
  };

  const [copied, setCopied] = useState(false);
  const copySettings = useCallback(() => {
    const settings: Record<string, unknown> = {
      mode,
      glass: { ...glass, scale: glassScale },
    };
    if (mode === "blobs") settings.orb = orb;
    if (mode === "circle") settings.circle = { bgColor, circleColor, circleRadius };
    if (mode === "shapes") settings.shapes = shapes;
    if (mode === "grain") settings.grain = { colors: ["#FB4F12", "#E8650E", "#F4E0C8", "#FF8A50"] };

    navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [mode, glass, glassScale, orb, bgColor, circleColor, circleRadius, shapes]);

  return (
    <div className="app">
      {/* ── Screens ── */}
      {mode === "blobs" && (
        <BlobsScreen
          key={`blobs-${currentOrbIdx}-${currentGlassIdx}`}
          orbConfig={orb}
          glassConfig={glass}
          glassScale={glassScale}
          active={true}
        />
      )}
      {mode === "cursor" && (
        <CursorScreen
          key={`cursor-${currentOrbIdx}-${currentGlassIdx}`}
          orbConfig={orb}
          glassConfig={glass}
          glassScale={glassScale}
          active={true}
        />
      )}
      {mode === "circle" && (
        <CircleScreen
          key={`circle-${currentGlassIdx}`}
          glassConfig={glass}
          glassScale={glassScale}
          active={true}
          bgColor={bgColor}
          circleColor={circleColor}
          circleRadius={circleRadius}
        />
      )}
      {mode === "shapes" && (
        <ShapesScreen
          key={`shapes-${currentShapesIdx}-${currentGlassIdx}`}
          shapesConfig={shapes}
          glassConfig={glass}
          glassScale={glassScale}
          active={true}
        />
      )}
      {mode === "grain" && (
        <GrainScreen
          key={`grain-${currentGlassIdx}`}
          glassConfig={glass}
          glassScale={glassScale}
          active={true}
        />
      )}
      {mode === "ambient" && (
        <AmbientScreen
          key={`ambient-${currentAmbientIdx}`}
          preset={ambientPresets[currentAmbientIdx]}
          active={true}
        />
      )}

      {/* ── Top Menu Bar ── */}
      <div className={`menu-bar ${panelOpen ? "hidden" : ""}`}>
        {/* Mode toggle */}
        <div className="menu-modes">
          <button className={`menu-mode-btn ${mode === "blobs" ? "active" : ""}`} onClick={() => setMode("blobs")}>Blobs</button>
          <button className={`menu-mode-btn ${mode === "cursor" ? "active" : ""}`} onClick={() => setMode("cursor")}>Cursor</button>
          <button className={`menu-mode-btn ${mode === "shapes" ? "active" : ""}`} onClick={() => setMode("shapes")}>Shapes</button>
          <button className={`menu-mode-btn ${mode === "grain" ? "active" : ""}`} onClick={() => setMode("grain")}>Grain</button>
          <button className={`menu-mode-btn ${mode === "ambient" ? "active" : ""}`} onClick={() => setMode("ambient")}>Ambient</button>
          <button className={`menu-mode-btn ${mode === "circle" ? "active" : ""}`} onClick={() => setMode("circle")}>Circle</button>
        </div>

        <div className="menu-divider" />

        {/* Glass presets */}
        <div className="menu-glass">
          {glassPresets.map((p, i) => (
            <button
              key={p.label}
              className={`menu-glass-btn ${i === currentGlassIdx ? "active" : ""}`}
              onClick={() => loadGlassPreset(i)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="menu-divider" />

        {/* Exploration thumbnails */}
        <div className="menu-explorations">
          {(mode === "blobs" || mode === "cursor") && landscapeOrbs.map((preset, i) => (
            <button key={preset.label} className={`menu-thumb ${i === currentOrbIdx ? "active" : ""}`} onClick={() => loadOrbPreset(i)}>
              <span className="menu-thumb-label">{preset.label}</span>
            </button>
          ))}
          {mode === "shapes" && shapesPresets.map((preset, i) => (
            <button key={preset.label} className={`menu-thumb ${i === currentShapesIdx ? "active" : ""}`} onClick={() => loadShapesPreset(i)}>
              <span className="menu-thumb-label">{preset.label}</span>
            </button>
          ))}
          {mode === "ambient" && ambientPresets.map((preset, i) => (
            <button key={preset.label} className={`menu-thumb ${i === currentAmbientIdx ? "active" : ""}`} onClick={() => setCurrentAmbientIdx(i)}>
              <span className="menu-thumb-label">{preset.label}</span>
            </button>
          ))}
          {mode === "circle" && (
            <button className="menu-thumb active">
              <span className="menu-thumb-label">Circle</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Panel toggle ── */}
      <button className="panel-toggle" onClick={() => setPanelOpen((v) => !v)}>
        {panelOpen ? "\u2715" : "\u2699"}
      </button>

      {/* ── Control panel ── */}
      <div className={`panel ${panelOpen ? "open" : ""}`}>
        <div className="panel-scroll">
          {/* Copy settings */}
          <button className="copy-btn" onClick={copySettings}>
            {copied ? "Copied!" : "Copy Settings"}
          </button>

          {/* Mode switch */}
          <div className="panel-section">
            <div className="panel-section-title">Mode</div>
            <div className="preset-row">
              <button className={`preset-btn ${mode === "blobs" ? "active" : ""}`} onClick={() => setMode("blobs")}>Blobs</button>
              <button className={`preset-btn ${mode === "cursor" ? "active" : ""}`} onClick={() => setMode("cursor")}>Cursor</button>
              <button className={`preset-btn ${mode === "shapes" ? "active" : ""}`} onClick={() => setMode("shapes")}>Shapes</button>
              <button className={`preset-btn ${mode === "grain" ? "active" : ""}`} onClick={() => setMode("grain")}>Grain</button>
              <button className={`preset-btn ${mode === "ambient" ? "active" : ""}`} onClick={() => setMode("ambient")}>Ambient</button>
              <button className={`preset-btn ${mode === "circle" ? "active" : ""}`} onClick={() => setMode("circle")}>Circle</button>
            </div>
          </div>

          {/* Glass presets */}
          <div className="panel-section">
            <div className="panel-section-title">Glass Preset</div>
            <div className="preset-row">
              {glassPresets.map((p, i) => (
                <button key={p.label} className="preset-btn" onClick={() => loadGlassPreset(i)}>{p.label}</button>
              ))}
            </div>
          </div>

          {/* Blob presets (blobs mode only) */}
          {(mode === "blobs" || mode === "cursor") && (
            <div className="panel-section">
              <div className="panel-section-title">Color Preset</div>
              <div className="preset-row">
                {landscapeOrbs.map((p, i) => (
                  <button key={p.label} className="preset-btn" onClick={() => loadOrbPreset(i)}>{p.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* Glass controls */}
          <div className="panel-section">
            <div className="panel-section-title">Glass</div>
            <div className="ctrl-row">
              <Select label="Shape" value={glass.shape} onChange={(v) => updateGlass("shape", v)} options={[
                { value: "lines", label: "Lines" }, { value: "wave", label: "Wave" }, { value: "linesIrregular", label: "Irregular" },
              ]} />
              <Select label="Distortion" value={glass.distortionShape} onChange={(v) => updateGlass("distortionShape", v)} options={[
                { value: "prism", label: "Prism" }, { value: "contour", label: "Contour" }, { value: "flat", label: "Flat" }, { value: "cascade", label: "Cascade" },
              ]} />
            </div>
            <Slider label="Size" value={glass.size} onChange={(v) => updateGlass("size", v)} />
            <Slider label="Distortion" value={glass.distortion} onChange={(v) => updateGlass("distortion", v)} />
            <Slider label="Edges" value={glass.edges} onChange={(v) => updateGlass("edges", v)} />
            <Slider label="Blur" value={glass.blur} onChange={(v) => updateGlass("blur", v)} />
            <div className="ctrl-row">
              <Slider label="Shadows" value={glass.shadows} onChange={(v) => updateGlass("shadows", v)} />
              <Slider label="Highlights" value={glass.highlights} onChange={(v) => updateGlass("highlights", v)} />
            </div>
            <div className="ctrl-row">
              <Slider label="Stretch" value={glass.stretch} onChange={(v) => updateGlass("stretch", v)} />
              <Slider label="Angle" value={glass.angle} min={0} max={360} step={1} onChange={(v) => updateGlass("angle", v)} />
            </div>
            <Slider label="Grain" value={glass.grainOverlay} onChange={(v) => updateGlass("grainOverlay", v)} />
            <Slider label="Scale" value={glassScale} min={0.5} max={4} step={0.05} onChange={setGlassScale} />
          </div>

          {/* Circle mode controls */}
          {mode === "circle" && (
            <div className="panel-section">
              <div className="panel-section-title">Circle</div>
              <div className="ctrl-row">
                <ColorInput label="Background" value={bgColor} onChange={setBgColor} />
                <ColorInput label="Circle" value={circleColor} onChange={setCircleColor} />
              </div>
              <Slider label="Radius" value={circleRadius} min={0.05} max={0.6} onChange={setCircleRadius} />
            </div>
          )}

          {/* Shapes mode controls */}
          {mode === "shapes" && (
            <>
              <div className="panel-section">
                <div className="panel-section-title">Shapes Preset</div>
                <div className="preset-row">
                  {shapesPresets.map((p, i) => (
                    <button key={p.label} className="preset-btn" onClick={() => loadShapesPreset(i)}>{p.label}</button>
                  ))}
                </div>
              </div>
              <div className="panel-section">
                <div className="panel-section-title">Background</div>
                <ColorInput label="Color" value={shapes.bgColor} onChange={(v) => setShapes((prev) => ({ ...prev, bgColor: v }))} />
              </div>
              {shapes.shapes.map((s, i) => (
                <div className="panel-section" key={i}>
                  <div className="panel-section-title">Shape {i + 1}</div>
                  <ColorInput label="Color" value={s.color} onChange={(v) => setShapes((prev) => {
                    const arr = [...prev.shapes]; arr[i] = { ...arr[i], color: v }; return { ...prev, shapes: arr };
                  })} />
                  <Slider label="Radius" value={s.radius} min={20} max={200} step={1} onChange={(v) => setShapes((prev) => {
                    const arr = [...prev.shapes]; arr[i] = { ...arr[i], radius: v }; return { ...prev, shapes: arr };
                  })} />
                  <div className="ctrl-row">
                    <Slider label="X" value={s.x} onChange={(v) => setShapes((prev) => {
                      const arr = [...prev.shapes]; arr[i] = { ...arr[i], x: v }; return { ...prev, shapes: arr };
                    })} />
                    <Slider label="Y" value={s.y} onChange={(v) => setShapes((prev) => {
                      const arr = [...prev.shapes]; arr[i] = { ...arr[i], y: v }; return { ...prev, shapes: arr };
                    })} />
                  </div>
                  <div className="ctrl-row">
                    <Slider label="Drift X" value={s.driftX} min={0} max={0.3} onChange={(v) => setShapes((prev) => {
                      const arr = [...prev.shapes]; arr[i] = { ...arr[i], driftX: v }; return { ...prev, shapes: arr };
                    })} />
                    <Slider label="Drift Y" value={s.driftY} min={0} max={0.3} onChange={(v) => setShapes((prev) => {
                      const arr = [...prev.shapes]; arr[i] = { ...arr[i], driftY: v }; return { ...prev, shapes: arr };
                    })} />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Blob controls (blobs mode only) */}
          {(mode === "blobs" || mode === "cursor") && (
            <>
              <div className="panel-section">
                <div className="panel-section-title">Background</div>
                <ColorInput label="Color" value={orb.bgColor} onChange={(v) => setOrb((prev) => ({ ...prev, bgColor: v }))} />
              </div>
              {orb.blobs.map((blob, i) => (
                <div className="panel-section" key={i}>
                  <div className="panel-section-title">Blob {i + 1}</div>
                  <ColorInput label="Color" value={blob.color} onChange={(v) => updateBlob(i, "color", v)} />
                  <Slider label="Radius" value={blob.radius} min={0.05} max={0.8} onChange={(v) => updateBlob(i, "radius", v)} />
                  <div className="ctrl-row">
                    <Slider label="X" value={blob.x} onChange={(v) => updateBlob(i, "x", v)} />
                    <Slider label="Y" value={blob.y} onChange={(v) => updateBlob(i, "y", v)} />
                  </div>
                  <div className="ctrl-row">
                    <Slider label="Drift X" value={blob.driftX} min={0} max={0.5} onChange={(v) => updateBlob(i, "driftX", v)} />
                    <Slider label="Drift Y" value={blob.driftY} min={0} max={0.5} onChange={(v) => updateBlob(i, "driftY", v)} />
                  </div>
                  <div className="ctrl-row">
                    <Slider label="Speed X" value={blob.freqX} min={0} max={1} onChange={(v) => updateBlob(i, "freqX", v)} />
                    <Slider label="Speed Y" value={blob.freqY} min={0} max={1} onChange={(v) => updateBlob(i, "freqY", v)} />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Bottom HUD ── */}
      {!panelOpen && (
        <div className="hud-bottom">
          <div className="hud-label">
            {(mode === "blobs" || mode === "cursor") && <h2>{orb.label}</h2>}
            {mode === "shapes" && <h2>{shapes.label}</h2>}
            {mode === "ambient" && <h2>{ambientPresets[currentAmbientIdx].label}</h2>}
            <span>
              {mode === "circle" ? "Circle" : mode === "shapes" ? "Shapes" : mode === "grain" ? "Grain" : mode === "cursor" ? "Cursor" : mode === "ambient" ? "Ambient" : "Blobs"} &middot; {glass.label} &middot; {glass.shape} / {glass.distortionShape}
            </span>
          </div>
          {(mode === "blobs" || mode === "cursor") && (
            <div className="hud-nav">
              <button className="nav-btn" onClick={prev}>&larr;</button>
              <span className="hud-counter">
                {String(currentOrbIdx + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
              </span>
              <button className="nav-btn" onClick={next}>&rarr;</button>
            </div>
          )}
          {mode === "shapes" && (
            <div className="hud-nav">
              <button className="nav-btn" onClick={prevShapes}>&larr;</button>
              <span className="hud-counter">
                {String(currentShapesIdx + 1).padStart(2, "0")}/{String(shapesPresets.length).padStart(2, "0")}
              </span>
              <button className="nav-btn" onClick={nextShapes}>&rarr;</button>
            </div>
          )}
          {mode === "ambient" && (
            <div className="hud-nav">
              <button className="nav-btn" onClick={prevAmbient}>&larr;</button>
              <span className="hud-counter">
                {String(currentAmbientIdx + 1).padStart(2, "0")}/{String(ambientPresets.length).padStart(2, "0")}
              </span>
              <button className="nav-btn" onClick={nextAmbient}>&rarr;</button>
            </div>
          )}
        </div>
      )}

      <div className="hud-hint">P panel &middot; M mode</div>
    </div>
  );
}
