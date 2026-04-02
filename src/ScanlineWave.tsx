// ScanlineWave: Fluted glass — large color blobs + dense vertical ribbing
// Custom GLSL shader with controllable parameters

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Shader params ──────────────────────────────────────────────
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
  blobSpeed: number;
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
  blobSpeed: 4.1,
  timeSpeed: 2.21,
};

// ─── Shaders ────────────────────────────────────────────────────
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

// Controllable params
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

  // Dense vertical fluted glass ribs
  float ribFreq = u_res.x * u_ribDensity;
  float ribX = uv.x * ribFreq;
  float rib = sin(ribX + sin(u_time * 0.2) * 1.0);

  // Horizontal refraction
  float refract1 = cos(ribX + sin(u_time * 0.2) * 1.0) * 0.02 * u_refraction;
  float refract2 = cos(ribX * 0.7 + u_time * 0.12) * 0.015 * u_refraction;

  // Large-scale wave
  float bigWave = sin(uv.y * 4.0 + u_time * u_waveSpeed * 0.6) * 0.04 * u_waveAmp
                + sin(uv.y * 2.0 - u_time * u_waveSpeed * 0.3) * 0.03 * u_waveAmp;

  float hDisplace = refract1 + refract2 + bigWave;

  // Vertical distortion
  float vDisplace = sin(uv.y * 8.0 + u_time * 0.5 + uv.x * 3.0) * u_vDistort;

  vec2 displaced = clamp(uv + vec2(hDisplace, vDisplace), 0.0, 1.0);
  vec4 color = texture(u_tex, displaced);

  // Seams between ribs — warm orange tint, never black
  float seamMask = abs(rib);
  float seam = smoothstep(0.0, 0.3 / u_seamStrength, seamMask);
  vec3 seamTint = vec3(0.7, 0.35, 0.12); // warm amber base
  vec3 seamColor = mix(seamTint, color.rgb, 0.5);
  color.rgb = mix(seamColor, color.rgb, seam);

  // Highlights on rib peaks
  float highlightVal = pow(max(rib, 0.0), 2.0) * u_highlight;
  color.rgb += highlightVal;

  // Shadows on rib valleys
  float shadowVal = pow(max(-rib, 0.0), 2.0) * u_shadow;
  color.rgb -= shadowVal;

  // Grain
  float grainVal = fract(sin(dot(uv * u_res + u_time, vec2(12.9898, 78.233))) * 43758.5453);
  color.rgb += (grainVal - 0.5) * u_grain;

  fragColor = vec4(color.rgb, 1.0);
}`;

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
        style={{ width: "100%", accentColor: "#a080ff" }}
      />
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────
export default function ScanlineWave() {
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState<GlassParams>({ ...DEFAULTS });
  const [panelOpen, setPanelOpen] = useState(false);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const update = useCallback((key: keyof GlassParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const glCanvas = glCanvasRef.current!;
    const gl = glCanvas.getContext("webgl2")!;
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
      gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    // Orange palette: #FC2A0D → #FD6C41 → #FE9F5D → #FEC59A
    const blobs = [
      // Hot reds (#FC2A0D)
      { color: "rgba(252, 42, 13, 0.9)",  cx: 0.2, cy: 0.3, r: 0.45, sx: 0.08, sy: 0.06, px: 0, py: 0 },
      { color: "rgba(252, 42, 13, 0.7)",  cx: 0.15, cy: 0.7, r: 0.35, sx: 0.06, sy: 0.09, px: 1.5, py: 0.8 },
      // Coral (#FD6C41)
      { color: "rgba(253, 108, 65, 0.85)", cx: 0.4, cy: 0.15, r: 0.4,  sx: 0.07, sy: 0.05, px: 3.0, py: 1.5 },
      { color: "rgba(253, 108, 65, 0.7)",  cx: 0.85, cy: 0.5, r: 0.4,  sx: 0.05, sy: 0.07, px: 4.0, py: 3.0 },
      // Warm orange (#FE9F5D)
      { color: "rgba(254, 159, 93, 0.9)",  cx: 0.75, cy: 0.5, r: 0.5,  sx: 0.06, sy: 0.08, px: 0.5, py: 2.0 },
      { color: "rgba(254, 159, 93, 0.6)",  cx: 0.5, cy: 0.45, r: 0.35, sx: 0.07, sy: 0.08, px: 1.0, py: 2.5 },
      // Light peach (#FEC59A)
      { color: "rgba(254, 197, 154, 0.85)", cx: 0.6, cy: 0.8, r: 0.45, sx: 0.09, sy: 0.06, px: 2.0, py: 1.0 },
      { color: "rgba(254, 197, 154, 0.5)",  cx: 0.65, cy: 0.6, r: 0.3,  sx: 0.06, sy: 0.05, px: 3.5, py: 0.5 },
    ];

    let frame: number;
    let elapsed = 0;
    let lastNow = 0;

    function drawBlobs(t: number) {
      bCtx.fillStyle = "#FEC59A";
      bCtx.fillRect(0, 0, bw, bh);

      const blobSpd = paramsRef.current.blobSpeed;
      for (const blob of blobs) {
        const cx = (blob.cx + Math.sin(t * blob.sx * blobSpd + blob.px) * 0.15) * bw;
        const cy = (blob.cy + Math.sin(t * blob.sy * blobSpd + blob.py) * 0.15) * bh;
        const r = blob.r * Math.max(bw, bh) * (1 + Math.sin(t * 0.1 * blobSpd + blob.px) * 0.1);

        const grad = bCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, blob.color);
        grad.addColorStop(0.6, blob.color.replace(/[\d.]+\)$/, "0.3)"));
        grad.addColorStop(1, "transparent");
        bCtx.fillStyle = grad;
        bCtx.fillRect(0, 0, bw, bh);
      }
    }

    function render(now: number) {
      const dt = lastNow ? (now - lastNow) / 1000 : 0;
      lastNow = now;
      elapsed += dt * paramsRef.current.timeSpeed;

      const p = paramsRef.current;

      drawBlobs(elapsed);

      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgCanvas);

      gl.useProgram(prog);
      gl.uniform1i(uTex, 0);
      gl.uniform1f(uTime, elapsed);
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
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "p" || e.key === "P") setPanelOpen((v) => !v);
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
      <canvas
        ref={glCanvasRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "block" }}
      />

      {/* Panel toggle */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        style={{
          position: "fixed", top: 24, right: 24, zIndex: 20,
          width: 36, height: 36, borderRadius: 6, border: "none",
          background: panelOpen ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.6)", fontSize: 18, cursor: "pointer",
          fontFamily: "system-ui", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {panelOpen ? "\u2715" : "\u2699"}
      </button>

      {/* Controls panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 280, zIndex: 15,
          background: "rgba(20, 10, 40, 0.88)",
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
            <Slider label="Rib Density" value={params.ribDensity} min={0.05} max={2} onChange={(v) => update("ribDensity", v)} />
            <Slider label="Refraction" value={params.refraction} min={0} max={5} onChange={(v) => update("refraction", v)} />
            <Slider label="Wave Amplitude" value={params.waveAmp} min={0} max={5} onChange={(v) => update("waveAmp", v)} />
            <Slider label="Wave Speed" value={params.waveSpeed} min={0} max={5} onChange={(v) => update("waveSpeed", v)} />
            <Slider label="Seam Strength" value={params.seamStrength} min={0.1} max={5} onChange={(v) => update("seamStrength", v)} />
            <Slider label="Highlight" value={params.highlight} min={0} max={0.5} onChange={(v) => update("highlight", v)} />
            <Slider label="Shadow" value={params.shadow} min={0} max={0.5} onChange={(v) => update("shadow", v)} />
            <Slider label="Grain" value={params.grain} min={0} max={0.1} step={0.001} onChange={(v) => update("grain", v)} />
            <Slider label="V. Distortion" value={params.vDistort} min={0} max={0.05} step={0.001} onChange={(v) => update("vDistort", v)} />

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14, marginTop: 4 }}>
              <div style={{ ...labelStyle, fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
                Animation
              </div>
            </div>

            <Slider label="Blob Speed" value={params.blobSpeed} min={0} max={10} step={0.1} onChange={(v) => update("blobSpeed", v)} />
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
          color: "rgba(255,255,255,0.15)",
        }}>
          P panel
        </div>
      )}
    </>
  );
}
