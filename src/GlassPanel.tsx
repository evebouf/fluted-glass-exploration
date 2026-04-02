// Shared glass controls panel — drop into any page
import { useState, useEffect, useCallback } from "react";

export interface GlassParams {
  ribDensity: number;
  refraction: number;
  waveAmp: number;
  waveSpeed: number;
  seamStrength: number;
  highlight: number;
  shadow: number;
  grain: number;
  vDistort: number;
  timeSpeed: number;
}

export const GLASS_DEFAULTS: GlassParams = {
  ribDensity: 0.05,
  refraction: 5.0,
  waveAmp: 1.84,
  waveSpeed: 2.65,
  seamStrength: 3.42,
  highlight: 0.05,
  shadow: 0.09,
  grain: 0.025,
  vDistort: 0.008,
  timeSpeed: 2.21,
};

function Slider({ label, value, onChange, min = 0, max = 1, step = 0.01 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "'Martian Mono', monospace", color: "rgba(255,255,255,0.5)" }}>
        <span>{label}</span>
        <span>{value.toFixed(max >= 10 ? 1 : step < 0.01 ? 3 : 2)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#EB5020" }}
      />
    </div>
  );
}

export default function GlassPanel({
  params,
  onChange,
  defaults,
}: {
  params: GlassParams;
  onChange: (params: GlassParams) => void;
  defaults?: GlassParams;
}) {
  const [open, setOpen] = useState(false);
  const defs = defaults || GLASS_DEFAULTS;

  const update = useCallback((key: keyof GlassParams, value: number) => {
    onChange({ ...params, [key]: value });
  }, [params, onChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "p" || e.key === "P") setOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Martian Mono', monospace",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed", top: 24, right: 24, zIndex: 20,
          width: 36, height: 36, borderRadius: 6, border: "none",
          background: open ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
          color: open ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)",
          fontSize: 18, cursor: "pointer", fontFamily: "system-ui",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        {open ? "\u2715" : "\u2699"}
      </button>

      {/* Panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 280, zIndex: 15,
          background: "rgba(20, 10, 5, 0.9)",
          backdropFilter: "blur(20px)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", padding: "72px 20px 24px" }}>
          <div style={{ ...labelStyle, fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
            Glass Controls
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Slider label="Rib Density" value={params.ribDensity} min={0.01} max={2} onChange={(v) => update("ribDensity", v)} />
            <Slider label="Refraction" value={params.refraction} min={0} max={10} onChange={(v) => update("refraction", v)} />
            <Slider label="Wave Amplitude" value={params.waveAmp} min={0} max={5} onChange={(v) => update("waveAmp", v)} />
            <Slider label="Wave Speed" value={params.waveSpeed} min={0} max={5} onChange={(v) => update("waveSpeed", v)} />
            <Slider label="Seam Strength" value={params.seamStrength} min={0.1} max={5} onChange={(v) => update("seamStrength", v)} />
            <Slider label="Highlight" value={params.highlight} min={0} max={0.5} onChange={(v) => update("highlight", v)} />
            <Slider label="Shadow" value={params.shadow} min={0} max={0.5} onChange={(v) => update("shadow", v)} />
            <Slider label="Grain" value={params.grain} min={0} max={0.1} step={0.001} onChange={(v) => update("grain", v)} />
            <Slider label="V. Distortion" value={params.vDistort} min={0} max={0.05} step={0.001} onChange={(v) => update("vDistort", v)} />
            <Slider label="Time Speed" value={params.timeSpeed} min={0} max={5} onChange={(v) => update("timeSpeed", v)} />
          </div>

          <button
            onClick={() => onChange({ ...defs })}
            style={{
              ...labelStyle, fontSize: 10, marginTop: 24, padding: "8px 16px",
              width: "100%", borderRadius: 4,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              cursor: "pointer", color: "rgba(255,255,255,0.4)",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Hint */}
      {!open && (
        <div style={{
          ...labelStyle, fontSize: 9,
          position: "fixed", bottom: 16, right: 16, zIndex: 10,
          color: "rgba(255,255,255,0.15)",
        }}>
          P panel
        </div>
      )}
    </>
  );
}
