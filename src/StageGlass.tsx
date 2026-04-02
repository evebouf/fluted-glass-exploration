import { useEffect, useRef, useState, useCallback } from "react";

// ─── Glass params ───────────────────────────────────────────────
interface GlassParams {
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

const DEFAULTS: GlassParams = {
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

// ─── Palette ────────────────────────────────────────────────────
type RGB = [number, number, number];

const C: Record<string, RGB> = {
  blaze:     [235, 80, 32],
  ember:     [232, 104, 48],
  coral:     [232, 144, 96],
  apricot:   [235, 180, 136],
  sand:      [240, 212, 176],
  parchment: [244, 241, 222],
};

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

const STOPS: { pos: number; color: RGB }[] = [
  { pos: 0.0,  color: C.parchment },
  { pos: 0.12, color: C.sand },
  { pos: 0.25, color: C.apricot },
  { pos: 0.4,  color: C.coral },
  { pos: 0.55, color: C.ember },
  { pos: 0.7,  color: C.blaze },
  { pos: 0.82, color: C.coral },
  { pos: 0.92, color: C.sand },
  { pos: 1.0,  color: C.parchment },
];

function sampleGradient(t: number): RGB {
  const p = ((t % 1) + 1) % 1;
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (p >= STOPS[i].pos && p <= STOPS[i + 1].pos) {
      const local = (p - STOPS[i].pos) / (STOPS[i + 1].pos - STOPS[i].pos);
      const s = local * local * (3 - 2 * local);
      return lerpColor(STOPS[i].color, STOPS[i + 1].color, s);
    }
  }
  return C.parchment;
}

// ─── Rib configuration ─────────────────────────────────────────
interface Rib {
  x: number;
  width: number;
  phase: number;
  speed: number;
  amplitude: number;
}

function generateRibs(count: number): Rib[] {
  const ribs: Rib[] = [];
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    const baseWidth = 1 / count;
    const variation = 0.5 + ((Math.sin(i * 7.3) + 1) / 2) * 1.2;
    const width = baseWidth * variation;
    ribs.push({
      x: 0, width,
      phase: i * 0.4 + Math.sin(i * 3.7) * 1.5,
      speed: 0.3 + ((Math.sin(i * 5.1) + 1) / 2) * 0.6,
      amplitude: 0.15 + ((Math.sin(i * 2.9) + 1) / 2) * 0.35,
    });
    cursor += width;
  }
  let acc = 0;
  for (const rib of ribs) {
    rib.width /= cursor;
    rib.x = acc + rib.width / 2;
    acc += rib.width;
  }
  return ribs;
}

// ─── Fluted glass shader (from ScanlineWave) ────────────────────
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

  float seamMask = abs(rib);
  float seam = smoothstep(0.0, 0.3 / u_seamStrength, seamMask);
  vec3 seamTint = vec3(0.7, 0.35, 0.12);
  vec3 seamColor = mix(seamTint, color.rgb, 0.5);
  color.rgb = mix(seamColor, color.rgb, seam);

  float highlightVal = pow(max(rib, 0.0), 2.0) * u_highlight;
  color.rgb += highlightVal;
  float shadowVal = pow(max(-rib, 0.0), 2.0) * u_shadow;
  color.rgb -= shadowVal;

  float grainVal = fract(sin(dot(uv * u_res + u_time, vec2(12.9898, 78.233))) * 43758.5453);
  color.rgb += (grainVal - 0.5) * u_grain;

  fragColor = vec4(color.rgb, 1.0);
}`;

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

// ─── Slider ─────────────────────────────────────────────────────
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

// ─── Component ──────────────────────────────────────────────────
export default function StageGlass() {
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const ribsRef = useRef<Rib[]>(generateRibs(50));
  const [params, setParams] = useState<GlassParams>({ ...DEFAULTS });
  const [panelOpen, setPanelOpen] = useState(false);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const update = useCallback((key: keyof GlassParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Keyboard: P to toggle panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "p" || e.key === "P") setPanelOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const glCanvas = glCanvasRef.current!;
    const gl = glCanvas.getContext("webgl2");
    if (!gl) { console.error("No WebGL2"); return; }

    const bgCanvas = document.createElement("canvas");
    const bw = 512;
    const bh = 512;
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
      gl!.viewport(0, 0, glCanvas.width, glCanvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    const ribs = ribsRef.current;
    let frame: number;

    function drawStage(t: number) {
      const scroll = t * 0.06;
      const steps = 80;
      const stepH = bh / steps;

      // Clear
      bCtx.fillStyle = `rgb(${C.parchment[0]},${C.parchment[1]},${C.parchment[2]})`;
      bCtx.fillRect(0, 0, bw, bh);

      for (const rib of ribs) {
        const ribLeft = Math.floor((rib.x - rib.width / 2) * bw);
        const ribRight = Math.ceil((rib.x + rib.width / 2) * bw);
        const ribW = ribRight - ribLeft;
        if (ribW <= 0) continue;

        const refraction =
          Math.sin(t * rib.speed + rib.phase) * rib.amplitude +
          Math.sin(t * rib.speed * 0.4 + rib.phase * 1.7) * rib.amplitude * 0.4;

        for (let s = 0; s < steps; s++) {
          const yNorm = s / steps;
          const samplePos = yNorm + scroll + refraction;
          const color = sampleGradient(samplePos);
          bCtx.fillStyle = `rgb(${color[0] | 0},${color[1] | 0},${color[2] | 0})`;
          bCtx.fillRect(ribLeft, (s * stepH) | 0, ribW, (stepH + 1) | 0);
        }
      }
    }

    function render(now: number) {
      const p = paramsRef.current;
      const t = now / 1000;

      drawStage(t);

      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, bgCanvas);

      gl!.useProgram(prog);
      gl!.uniform1i(uTex, 0);
      gl!.uniform1f(uTime, t * p.timeSpeed);
      gl!.uniform2f(uRes, glCanvas.width, glCanvas.height);
      gl!.uniform1f(uRibDensity, p.ribDensity);
      gl!.uniform1f(uRefraction, p.refraction);
      gl!.uniform1f(uWaveAmp, p.waveAmp);
      gl!.uniform1f(uWaveSpeed, p.waveSpeed);
      gl!.uniform1f(uSeamStrength, p.seamStrength);
      gl!.uniform1f(uHighlight, p.highlight);
      gl!.uniform1f(uShadow, p.shadow);
      gl!.uniform1f(uGrain, p.grain);
      gl!.uniform1f(uVDistort, p.vDistort);

      gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
      gl!.enableVertexAttribArray(aPos);
      gl!.vertexAttribPointer(aPos, 2, gl!.FLOAT, false, 0, 0);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);

      frame = requestAnimationFrame(render);
    }

    frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Martian Mono', monospace",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  };

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#F4F1DE" }}>
      <canvas
        ref={glCanvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />

      {/* Panel toggle */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        style={{
          position: "fixed", top: 24, right: 24, zIndex: 20,
          width: 36, height: 36, borderRadius: 6, border: "none",
          background: panelOpen ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
          color: panelOpen ? "rgba(255,255,255,0.8)" : "rgba(61,40,0,0.4)",
          fontSize: 18, cursor: "pointer", fontFamily: "system-ui",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        {panelOpen ? "\u2715" : "\u2699"}
      </button>

      {/* Controls panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 280, zIndex: 15,
          background: "rgba(20, 10, 5, 0.9)",
          backdropFilter: "blur(20px)",
          transform: panelOpen ? "translateX(0)" : "translateX(100%)",
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
            onClick={() => setParams({ ...DEFAULTS })}
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
      {!panelOpen && (
        <div style={{
          ...labelStyle, fontSize: 9,
          position: "fixed", bottom: 16, right: 16, zIndex: 10,
          color: "rgba(61,40,0,0.2)",
        }}>
          P panel
        </div>
      )}
    </div>
  );
}
