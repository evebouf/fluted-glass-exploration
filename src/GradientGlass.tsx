import { useState, useEffect, useRef, useCallback } from "react";
import { FlutedGlass } from "@paper-design/shaders-react";
import { PALETTE, SUS_GLASS } from "./brand/constants";

// ─── Column config ──────────────────────────────────────────────
interface Column {
  color: string;
  widthPct: number;
  minH: number;
  maxH: number;
  duration: number;
  delay: number;
}

// ─── Band Variations ────────────────────────────────────────────
interface BandVariation {
  label: string;
  angle: number;
  gradient: string;
  bgSize: string;
  animation: string;
  keyframes: string;
  duration: string;
  columns?: Column[];
  columnsBg?: string;
}

const P = PALETTE;

const variations: BandVariation[] = [
  {
    label: "Downpour",
    angle: 180,
    gradient: `repeating-linear-gradient(
      180deg,
      ${P.orange.blaze} 0%, ${P.orange.ember} 8%,
      ${P.neutral.sand} 16%, ${P.neutral.parchment} 24%,
      ${P.neutral.linen} 32%, ${P.orange.apricot} 40%,
      ${P.orange.coral} 48%, ${P.orange.blaze} 56%
    )`,
    bgSize: "100% 300%",
    animation: "v-down",
    keyframes: `@keyframes v-down { 0%{background-position:0% 0%} 100%{background-position:0% 300%} }`,
    duration: "20s",
  },
  {
    label: "Horizon",
    angle: 90,
    gradient: `repeating-linear-gradient(
      90deg,
      ${P.orange.blaze} 0%, ${P.neutral.parchment} 12%,
      ${P.orange.coral} 24%, ${P.neutral.linen} 36%,
      ${P.orange.ember} 48%, ${P.neutral.sand} 60%,
      ${P.orange.blaze} 72%
    )`,
    bgSize: "300% 100%",
    animation: "h-slide",
    keyframes: `@keyframes h-slide { 0%{background-position:0% 0%} 100%{background-position:300% 0%} }`,
    duration: "25s",
  },
  {
    label: "Diagonal",
    angle: 135,
    gradient: `repeating-linear-gradient(
      135deg,
      ${P.orange.blaze} 0%, ${P.orange.ember} 6%,
      ${P.neutral.parchment} 12%, ${P.orange.apricot} 18%,
      ${P.neutral.sand} 24%, ${P.orange.coral} 30%,
      ${P.neutral.linen} 36%, ${P.orange.blaze} 42%
    )`,
    bgSize: "400% 400%",
    animation: "diag-drift",
    keyframes: `@keyframes diag-drift { 0%{background-position:0% 0%} 100%{background-position:400% 400%} }`,
    duration: "30s",
  },
  {
    label: "Ascent",
    angle: 0,
    gradient: `repeating-linear-gradient(
      0deg,
      ${P.neutral.parchment} 0%, ${P.orange.apricot} 10%,
      ${P.orange.blaze} 20%, ${P.orange.ember} 30%,
      ${P.neutral.sand} 40%, ${P.neutral.linen} 50%,
      ${P.neutral.parchment} 60%
    )`,
    bgSize: "100% 300%",
    animation: "v-up",
    keyframes: `@keyframes v-up { 0%{background-position:0% 300%} 100%{background-position:0% 0%} }`,
    duration: "18s",
  },
  {
    label: "Cross",
    angle: 45,
    gradient: `repeating-linear-gradient(
      45deg,
      ${P.orange.blaze} 0%, ${P.neutral.sand} 7%,
      ${P.orange.coral} 14%, ${P.neutral.parchment} 21%,
      ${P.orange.ember} 28%, ${P.neutral.linen} 35%,
      ${P.orange.blaze} 42%
    )`,
    bgSize: "400% 400%",
    animation: "cross-slide",
    keyframes: `@keyframes cross-slide { 0%{background-position:0% 400%} 100%{background-position:400% 0%} }`,
    duration: "28s",
  },
  {
    label: "Breathe",
    angle: 180,
    gradient: `repeating-linear-gradient(
      180deg,
      ${P.orange.blaze} 0%, ${P.neutral.parchment} 25%,
      ${P.orange.blaze} 50%, ${P.neutral.parchment} 75%,
      ${P.orange.blaze} 100%
    )`,
    bgSize: "100% 400%",
    animation: "breathe",
    keyframes: `@keyframes breathe { 0%{background-position:0% 0%} 50%{background-position:0% 400%} 100%{background-position:0% 0%} }`,
    duration: "16s",
  },
  {
    label: "Sweep",
    angle: 90,
    gradient: `repeating-linear-gradient(
      90deg,
      ${P.neutral.parchment} 0%, ${P.orange.blaze} 15%,
      ${P.neutral.linen} 30%, ${P.orange.ember} 45%,
      ${P.neutral.parchment} 60%
    )`,
    bgSize: "400% 100%",
    animation: "sweep",
    keyframes: `@keyframes sweep { 0%{background-position:0% 0%} 50%{background-position:400% 0%} 100%{background-position:0% 0%} }`,
    duration: "22s",
  },
  {
    label: "Columns",
    angle: 0,
    gradient: "",
    bgSize: "",
    animation: "",
    keyframes: "",
    duration: "",
    columnsBg: P.neutral.parchment,
    columns: [
      { color: P.orange.blaze,    widthPct: 5.5, minH: 40, maxH: 100, duration: 8,  delay: 0 },
      { color: P.neutral.sand,    widthPct: 4,   minH: 55, maxH: 95,  duration: 11, delay: -3 },
      { color: P.orange.ember,    widthPct: 7,   minH: 30, maxH: 85,  duration: 9,  delay: -1 },
      { color: P.neutral.linen,   widthPct: 5,   minH: 50, maxH: 100, duration: 13, delay: -7 },
      { color: P.orange.coral,    widthPct: 6,   minH: 35, maxH: 90,  duration: 7,  delay: -2 },
      { color: P.orange.blaze,    widthPct: 4.5, minH: 60, maxH: 100, duration: 10, delay: -5 },
      { color: P.neutral.parchment, widthPct: 6, minH: 25, maxH: 80,  duration: 14, delay: -4 },
      { color: P.orange.apricot,  widthPct: 5,   minH: 45, maxH: 95,  duration: 8,  delay: -6 },
      { color: P.orange.ember,    widthPct: 7.5, minH: 50, maxH: 100, duration: 12, delay: -1 },
      { color: P.neutral.sand,    widthPct: 4.5, minH: 35, maxH: 85,  duration: 9,  delay: -8 },
      { color: P.orange.blaze,    widthPct: 6,   minH: 55, maxH: 100, duration: 11, delay: -3 },
      { color: P.neutral.linen,   widthPct: 5.5, minH: 30, maxH: 90,  duration: 7,  delay: -2 },
      { color: P.orange.coral,    widthPct: 5,   minH: 40, maxH: 95,  duration: 10, delay: -9 },
      { color: P.orange.apricot,  widthPct: 4,   minH: 60, maxH: 100, duration: 13, delay: -5 },
      { color: P.orange.ember,    widthPct: 6.5, minH: 45, maxH: 85,  duration: 8,  delay: -7 },
      { color: P.neutral.sand,    widthPct: 5,   minH: 50, maxH: 100, duration: 14, delay: -4 },
      { color: P.orange.blaze,    widthPct: 7,   minH: 35, maxH: 90,  duration: 9,  delay: -6 },
    ],
  },
];

// ─── Slug helpers ───────────────────────────────────────────────
function slugify(s: string) { return s.toLowerCase(); }

function resolveIndex(hash: string): number {
  const slug = hash.replace("#/gradient/", "").replace("#/gradient", "");
  if (!slug) return 0;
  const found = variations.findIndex((v) => slugify(v.label) === slug);
  return found >= 0 ? found : 0;
}

// ─── Slider ─────────────────────────────────────────────────────
function Slider({ label, value, onChange, min = 0, max = 1, step = 0.01 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "'Martian Mono', monospace", color: "rgba(61,40,0,0.5)" }}>
        <span>{label}</span>
        <span>{value.toFixed(max > 1 ? 0 : 2)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: PALETTE.orange.blaze }}
      />
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────
export default function GradientGlass({ initialHash = "" }: { initialHash?: string }) {
  const [idx, setIdx] = useState(() => resolveIndex(initialHash));
  const v = variations[idx];

  const [animated, setAnimated] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const [glass, setGlass] = useState({
    shape: SUS_GLASS.shape as string,
    distortionShape: SUS_GLASS.distortionShape as string,
    stretch: SUS_GLASS.stretch,
    size: SUS_GLASS.size,
    distortion: SUS_GLASS.distortion,
    edges: SUS_GLASS.edges,
    blur: SUS_GLASS.blur,
    shadows: SUS_GLASS.shadows,
    highlights: SUS_GLASS.highlights,
    grainOverlay: SUS_GLASS.grainOverlay,
    angle: SUS_GLASS.angle,
    shift: 0,
    scale: 1.0,
    speed: 0.15,
  });

  const [autoRender, setAutoRender] = useState({
    stretch: SUS_GLASS.stretch,
    size: SUS_GLASS.size,
    distortion: SUS_GLASS.distortion,
    edges: SUS_GLASS.edges,
    blur: SUS_GLASS.blur,
    shadows: SUS_GLASS.shadows,
    highlights: SUS_GLASS.highlights,
    grainOverlay: SUS_GLASS.grainOverlay,
    shift: 0,
    scale: 1.0,
  });

  const startRef = useRef(performance.now());

  useEffect(() => {
    if (!animated) return;
    let frame: number;
    let lastRender = 0;

    const tick = (now: number) => {
      if (now - lastRender < 33) {
        frame = requestAnimationFrame(tick);
        return;
      }
      lastRender = now;
      const t = (now - startRef.current) / 1000;

      setAutoRender({
        stretch: SUS_GLASS.stretch + Math.sin(t * 0.12) * 0.6,
        size: SUS_GLASS.size + Math.sin(t * 0.08 + 2.0) * 0.15,
        distortion: SUS_GLASS.distortion + Math.sin(t * 0.06 + 0.5) * 0.2,
        edges: SUS_GLASS.edges + Math.sin(t * 0.1 + 0.7) * 0.15,
        blur: Math.max(0, SUS_GLASS.blur + Math.sin(t * 0.07 + 1.5) * 0.1),
        shadows: SUS_GLASS.shadows + Math.sin(t * 0.09 + 0.3) * 0.12,
        highlights: SUS_GLASS.highlights + Math.sin(t * 0.08 + 1.8) * 0.1,
        grainOverlay: SUS_GLASS.grainOverlay + Math.sin(t * 0.5) * 0.02,
        shift: Math.sin(t * 0.05) * 0.3,
        scale: 1.0 + Math.sin(t * 0.06) * 0.3,
      });

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animated]);

  const render = animated ? {
    shape: SUS_GLASS.shape,
    distortionShape: SUS_GLASS.distortionShape,
    ...autoRender,
    angle: SUS_GLASS.angle,
    speed: 0.15,
  } : glass;

  const updateGlass = (key: string, value: number | string) => {
    if (animated) setAnimated(false);
    setGlass((prev) => ({ ...prev, [key]: value }));
  };

  const goTo = useCallback((i: number) => {
    setIdx(i);
    window.history.replaceState(null, "", `#/gradient/${slugify(variations[i].label)}`);
  }, []);
  const next = useCallback(() => goTo((idx + 1) % variations.length), [idx, goTo]);
  const prev = useCallback(() => goTo((idx - 1 + variations.length) % variations.length), [idx, goTo]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "SELECT") return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      else if (e.key === "p" || e.key === "P") { setPanelOpen((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Martian Mono', monospace",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "rgba(61, 40, 0, 0.4)",
  };

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      {/* Animated background */}
      {v.columns ? (
        <div
          key={idx}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundColor: v.columnsBg,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          {v.columns.map((col, i) => (
            <div
              key={i}
              style={{
                width: `${col.widthPct}%`,
                flexShrink: 0,
                backgroundColor: col.color,
                animation: `col-${i} ${col.duration}s ease-in-out ${col.delay}s infinite`,
              }}
            />
          ))}
          <style>{v.columns.map((col, i) =>
            `@keyframes col-${i} { 0%,100%{height:${col.minH}vh} 50%{height:${col.maxH}vh} }`
          ).join("\n")}</style>
        </div>
      ) : (
        <>
          <div
            key={idx}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              background: v.gradient,
              backgroundSize: v.bgSize,
              animation: `${v.animation} ${v.duration} linear infinite`,
            }}
          />
          <style>{v.keyframes}</style>
        </>
      )}

      {/* Fluted glass overlay */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <FlutedGlass
          width="100%"
          height="100%"
          image=""
          colorBack="#00000000"
          colorShadow={PALETTE.glass.shadow}
          colorHighlight={PALETTE.glass.highlight}
          shape={render.shape as "lines" | "wave" | "linesIrregular"}
          distortionShape={render.distortionShape as "prism" | "contour" | "flat" | "cascade"}
          size={render.size}
          distortion={render.distortion}
          edges={render.edges}
          blur={render.blur}
          shadows={render.shadows}
          highlights={render.highlights}
          stretch={render.stretch}
          angle={render.angle}
          shift={render.shift}
          grainOverlay={render.grainOverlay}
          offsetX={0}
          offsetY={0}
          scale={render.scale}
          fit="cover"
          speed={render.speed}
        />
      </div>

      {/* Bottom HUD */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <button onClick={prev} style={{ ...labelStyle, background: "none", border: "none", cursor: "pointer", padding: "8px 12px" }}>
          &larr;
        </button>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ ...labelStyle, fontSize: 14, color: "rgba(61, 40, 0, 0.5)" }}>{v.label}</span>
          <span style={{ ...labelStyle, fontSize: 9, color: "rgba(61, 40, 0, 0.25)" }}>
            {String(idx + 1).padStart(2, "0")}/{String(variations.length).padStart(2, "0")}
          </span>
        </div>

        <button onClick={next} style={{ ...labelStyle, background: "none", border: "none", cursor: "pointer", padding: "8px 12px" }}>
          &rarr;
        </button>
      </div>

      {/* Variation pills */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          gap: 4,
        }}
      >
        {variations.map((vv, i) => (
          <button
            key={vv.label}
            onClick={() => goTo(i)}
            style={{
              ...labelStyle,
              fontSize: 10,
              padding: "6px 12px",
              background: i === idx ? "rgba(61, 40, 0, 0.12)" : "rgba(61, 40, 0, 0.04)",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              color: i === idx ? "rgba(61, 40, 0, 0.6)" : "rgba(61, 40, 0, 0.25)",
              transition: "all 0.2s",
            }}
          >
            {vv.label}
          </button>
        ))}
      </div>

      {/* Panel toggle */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          zIndex: 20,
          width: 36,
          height: 36,
          borderRadius: 6,
          border: "none",
          background: panelOpen ? "rgba(61,40,0,0.15)" : "rgba(61,40,0,0.06)",
          color: "rgba(61,40,0,0.5)",
          fontSize: 18,
          cursor: "pointer",
          fontFamily: "system-ui",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {panelOpen ? "\u2715" : "\u2699"}
      </button>

      {/* Glass controls panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 280,
          zIndex: 15,
          background: "rgba(244, 241, 222, 0.92)",
          backdropFilter: "blur(20px)",
          transform: panelOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", padding: "72px 20px 24px" }}>
          {/* Animate toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ ...labelStyle, fontSize: 10 }}>Auto-animate</span>
            <button
              onClick={() => setAnimated((a) => !a)}
              style={{
                ...labelStyle,
                fontSize: 9,
                padding: "4px 10px",
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
                background: animated ? PALETTE.orange.blaze : "rgba(61,40,0,0.08)",
                color: animated ? "#fff" : "rgba(61,40,0,0.4)",
              }}
            >
              {animated ? "On" : "Off"}
            </button>
          </div>

          {/* Shape selects */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, fontFamily: "'Martian Mono', monospace", color: "rgba(61,40,0,0.5)" }}>Shape</span>
              <select
                value={glass.shape}
                onChange={(e) => updateGlass("shape", e.target.value)}
                style={{ fontFamily: "'Martian Mono', monospace", fontSize: 10, padding: "4px 6px", borderRadius: 4, border: "1px solid rgba(61,40,0,0.12)", background: "#fff", color: "rgba(61,40,0,0.6)" }}
              >
                <option value="lines">Lines</option>
                <option value="wave">Wave</option>
                <option value="linesIrregular">Irregular</option>
              </select>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, fontFamily: "'Martian Mono', monospace", color: "rgba(61,40,0,0.5)" }}>Distortion</span>
              <select
                value={glass.distortionShape}
                onChange={(e) => updateGlass("distortionShape", e.target.value)}
                style={{ fontFamily: "'Martian Mono', monospace", fontSize: 10, padding: "4px 6px", borderRadius: 4, border: "1px solid rgba(61,40,0,0.12)", background: "#fff", color: "rgba(61,40,0,0.6)" }}
              >
                <option value="prism">Prism</option>
                <option value="contour">Contour</option>
                <option value="flat">Flat</option>
                <option value="cascade">Cascade</option>
              </select>
            </div>
          </div>

          {/* Sliders */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Slider label="Size" value={glass.size} onChange={(v) => updateGlass("size", v)} />
            <Slider label="Distortion" value={glass.distortion} onChange={(v) => updateGlass("distortion", v)} />
            <Slider label="Edges" value={glass.edges} onChange={(v) => updateGlass("edges", v)} />
            <Slider label="Blur" value={glass.blur} onChange={(v) => updateGlass("blur", v)} />
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}><Slider label="Shadows" value={glass.shadows} onChange={(v) => updateGlass("shadows", v)} /></div>
              <div style={{ flex: 1 }}><Slider label="Highlights" value={glass.highlights} onChange={(v) => updateGlass("highlights", v)} /></div>
            </div>
            <Slider label="Stretch" value={glass.stretch} onChange={(v) => updateGlass("stretch", v)} />
            <Slider label="Angle" value={glass.angle} min={0} max={360} step={1} onChange={(v) => updateGlass("angle", v)} />
            <Slider label="Shift" value={glass.shift} min={-1} max={1} onChange={(v) => updateGlass("shift", v)} />
            <Slider label="Scale" value={glass.scale} min={0.5} max={4} step={0.05} onChange={(v) => updateGlass("scale", v)} />
            <Slider label="Grain" value={glass.grainOverlay} onChange={(v) => updateGlass("grainOverlay", v)} />
            <Slider label="Speed" value={glass.speed} min={0} max={1} onChange={(v) => updateGlass("speed", v)} />
          </div>

          {/* Reset button */}
          <button
            onClick={() => {
              setGlass({
                shape: SUS_GLASS.shape,
                distortionShape: SUS_GLASS.distortionShape,
                stretch: SUS_GLASS.stretch,
                size: SUS_GLASS.size,
                distortion: SUS_GLASS.distortion,
                edges: SUS_GLASS.edges,
                blur: SUS_GLASS.blur,
                shadows: SUS_GLASS.shadows,
                highlights: SUS_GLASS.highlights,
                grainOverlay: SUS_GLASS.grainOverlay,
                angle: SUS_GLASS.angle,
                shift: 0,
                scale: 1.0,
                speed: 0.15,
              });
            }}
            style={{
              ...labelStyle,
              fontSize: 10,
              marginTop: 20,
              padding: "8px 16px",
              width: "100%",
              borderRadius: 4,
              border: "1px solid rgba(61,40,0,0.12)",
              background: "rgba(61,40,0,0.04)",
              cursor: "pointer",
              color: "rgba(61,40,0,0.4)",
            }}
          >
            Reset to SUS
          </button>
        </div>
      </div>
    </div>
  );
}
