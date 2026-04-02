// NeonScanline: CRT scanlines + horizontal wave distortion + orange neon bloom
// Inspired by glitch art / datamosh / liquid silk aesthetic

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Params ─────────────────────────────────────────────────────
interface Params {
  scanlineDensity: number;  // how many scanlines
  scanlineWidth: number;    // thickness of bright lines vs gaps
  waveAmp: number;          // horizontal wave displacement
  waveFreq: number;         // vertical frequency of wave bands
  waveSpeed: number;        // animation speed
  glitchAmp: number;        // per-band random offset
  bloom: number;            // glow intensity
  bloomSpread: number;      // glow radius
  contrast: number;         // overall contrast
  blobSpeed: number;        // background blob drift
  timeSpeed: number;        // global time multiplier
}

const DEFAULTS: Params = {
  scanlineDensity: 800.0,
  scanlineWidth: 0.45,
  waveAmp: 0.06,
  waveFreq: 6.0,
  waveSpeed: 1.5,
  glitchAmp: 0.02,
  bloom: 0.6,
  bloomSpread: 0.008,
  contrast: 1.15,
  blobSpeed: 3.0,
  timeSpeed: 1.0,
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
uniform float u_scanDensity;
uniform float u_scanWidth;
uniform float u_waveAmp;
uniform float u_waveFreq;
uniform float u_waveSpeed;
uniform float u_glitchAmp;
uniform float u_bloom;
uniform float u_bloomSpread;
uniform float u_contrast;

in vec2 v_uv;
out vec4 fragColor;

// Pseudo-random
float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  vec2 uv = v_uv;

  // ─── Horizontal wave distortion ───
  // Multiple wave layers at different frequencies create organic displacement
  float wave1 = sin(uv.y * u_waveFreq * 6.2832 + u_time * u_waveSpeed) * u_waveAmp;
  float wave2 = sin(uv.y * u_waveFreq * 2.5 + u_time * u_waveSpeed * 0.7 + 1.5) * u_waveAmp * 0.5;
  float wave3 = sin(uv.y * u_waveFreq * 0.8 - u_time * u_waveSpeed * 0.3 + 3.0) * u_waveAmp * 0.8;

  // Per-band glitch — quantize Y into bands and add random horizontal offset
  float bandY = floor(uv.y * u_waveFreq * 3.0);
  float glitchOffset = (hash(bandY + floor(u_time * 2.0)) - 0.5) * u_glitchAmp;

  float hDisplace = wave1 + wave2 + wave3 + glitchOffset;

  // Slight vertical displacement
  float vDisplace = sin(uv.x * 12.0 + u_time * 0.8) * 0.003;

  // ─── Glass refraction — vertical ribs ───
  float ribFreq = u_res.x * 0.15;
  float ribX = uv.x * ribFreq;
  float rib = sin(ribX + sin(u_time * 0.3) * 0.8);
  // Each rib bends the image horizontally
  float glassRefract = cos(ribX + sin(u_time * 0.3) * 0.8) * 0.012;

  float totalH = hDisplace + glassRefract;
  vec2 displaced = clamp(uv + vec2(totalH, vDisplace), 0.0, 1.0);

  // ─── Sample base color ───
  vec4 baseColor = texture(u_tex, displaced);

  // ─── Bloom: sample neighbors and blend ───
  vec3 bloomColor = vec3(0.0);
  float spread = u_bloomSpread;
  bloomColor += texture(u_tex, clamp(displaced + vec2(spread, 0.0), 0.0, 1.0)).rgb;
  bloomColor += texture(u_tex, clamp(displaced - vec2(spread, 0.0), 0.0, 1.0)).rgb;
  bloomColor += texture(u_tex, clamp(displaced + vec2(spread * 2.0, 0.0), 0.0, 1.0)).rgb;
  bloomColor += texture(u_tex, clamp(displaced - vec2(spread * 2.0, 0.0), 0.0, 1.0)).rgb;
  bloomColor += texture(u_tex, clamp(displaced + vec2(0.0, spread), 0.0, 1.0)).rgb;
  bloomColor += texture(u_tex, clamp(displaced - vec2(0.0, spread), 0.0, 1.0)).rgb;
  bloomColor /= 6.0;

  vec3 color = mix(baseColor.rgb, bloomColor, u_bloom);

  // ─── Contrast boost ───
  color = (color - 0.5) * u_contrast + 0.5;
  color = clamp(color, 0.0, 1.0);

  // ─── Scanlines ───
  float scanY = uv.y * u_scanDensity;
  float scanline = smoothstep(u_scanWidth - 0.1, u_scanWidth, fract(scanY))
                 * smoothstep(1.0, u_scanWidth + 0.1, fract(scanY));

  // Scanline modulation — gaps stay warm, not black
  float scanMix = mix(0.55, 1.0, scanline);
  color *= scanMix;

  // ─── Glass rib highlights / shadows ───
  float ribHighlight = pow(max(rib, 0.0), 2.0) * 0.12;
  float ribShadow = pow(max(-rib, 0.0), 2.0) * 0.06;
  color += ribHighlight;
  color -= ribShadow;

  // ─── Brightness-mapped orange glow ───
  float brightness = dot(color, vec3(0.299, 0.587, 0.114));
  // Bright areas bloom into near-white, mid-tones stay orange
  vec3 glowColor = mix(
    vec3(0.98, 0.5, 0.12),    // warm amber
    vec3(1.0, 0.93, 0.8),     // near-white highlight
    pow(brightness, 1.2)
  );
  color = mix(color, glowColor, 0.35 + brightness * 0.35);

  // ─── Subtle grain ───
  float grain = fract(sin(dot(uv * u_res + u_time * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) * 0.03;

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
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
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "'Martian Mono', monospace", color: "rgba(255,200,150,0.5)" }}>
        <span>{label}</span>
        <span>{value.toFixed(max >= 100 ? 0 : step < 0.01 ? 3 : 2)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#ff6020" }}
      />
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────
export default function NeonScanline() {
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState<Params>({ ...DEFAULTS });
  const [panelOpen, setPanelOpen] = useState(false);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const update = useCallback((key: keyof Params, value: number) => {
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
    const uScanDensity = gl.getUniformLocation(prog, "u_scanDensity");
    const uScanWidth = gl.getUniformLocation(prog, "u_scanWidth");
    const uWaveAmp = gl.getUniformLocation(prog, "u_waveAmp");
    const uWaveFreq = gl.getUniformLocation(prog, "u_waveFreq");
    const uWaveSpeed = gl.getUniformLocation(prog, "u_waveSpeed");
    const uGlitchAmp = gl.getUniformLocation(prog, "u_glitchAmp");
    const uBloom = gl.getUniformLocation(prog, "u_bloom");
    const uBloomSpread = gl.getUniformLocation(prog, "u_bloomSpread");
    const uContrast = gl.getUniformLocation(prog, "u_contrast");

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

    // Orange gradient blobs background
    const blobs = [
      { color: "rgba(252, 42, 13, 0.9)",   cx: 0.15, cy: 0.25, r: 0.5,  sx: 0.12, sy: 0.08, px: 0,   py: 0 },
      { color: "rgba(253, 108, 65, 0.85)",  cx: 0.4,  cy: 0.7,  r: 0.45, sx: 0.09, sy: 0.14, px: 1.5, py: 0.8 },
      { color: "rgba(254, 159, 93, 0.9)",   cx: 0.75, cy: 0.35, r: 0.55, sx: 0.1,  sy: 0.07, px: 3.0, py: 1.5 },
      { color: "rgba(254, 197, 154, 0.8)",  cx: 0.3,  cy: 0.5,  r: 0.4,  sx: 0.08, sy: 0.11, px: 0.5, py: 2.0 },
      { color: "rgba(252, 42, 13, 0.7)",    cx: 0.85, cy: 0.75, r: 0.4,  sx: 0.13, sy: 0.06, px: 2.0, py: 1.0 },
      { color: "rgba(253, 108, 65, 0.6)",   cx: 0.55, cy: 0.15, r: 0.35, sx: 0.07, sy: 0.12, px: 4.0, py: 3.0 },
      { color: "rgba(255, 220, 180, 0.5)",  cx: 0.5,  cy: 0.5,  r: 0.5,  sx: 0.06, sy: 0.09, px: 1.0, py: 2.5 },
    ];

    let frame: number;
    let elapsed = 0;
    let lastNow = 0;

    function drawBlobs(t: number) {
      // Warm dark base — not pitch black
      bCtx.fillStyle = "#3d1a08";
      bCtx.fillRect(0, 0, bw, bh);

      const spd = paramsRef.current.blobSpeed;
      for (const blob of blobs) {
        const cx = (blob.cx + Math.sin(t * blob.sx * spd + blob.px) * 0.2) * bw;
        const cy = (blob.cy + Math.sin(t * blob.sy * spd + blob.py) * 0.2) * bh;
        const r = blob.r * bw * (1 + Math.sin(t * 0.15 * spd + blob.px) * 0.15);

        const grad = bCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, blob.color);
        grad.addColorStop(0.5, blob.color.replace(/[\d.]+\)$/, "0.4)"));
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
      gl.uniform1f(uScanDensity, p.scanlineDensity);
      gl.uniform1f(uScanWidth, p.scanlineWidth);
      gl.uniform1f(uWaveAmp, p.waveAmp);
      gl.uniform1f(uWaveFreq, p.waveFreq);
      gl.uniform1f(uWaveSpeed, p.waveSpeed);
      gl.uniform1f(uGlitchAmp, p.glitchAmp);
      gl.uniform1f(uBloom, p.bloom);
      gl.uniform1f(uBloomSpread, p.bloomSpread);
      gl.uniform1f(uContrast, p.contrast);

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
    fontFamily: "'Martian Mono', monospace", fontSize: 11,
    fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
  };

  return (
    <>
      <canvas
        ref={glCanvasRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "block", background: "#1a0800" }}
      />

      <a href="#/" style={{
        ...labelStyle, position: "fixed", top: 24, left: 24, zIndex: 10,
        color: "rgba(255, 150, 80, 0.4)", textDecoration: "none",
      }}>
        &larr; Back
      </a>

      {/* Panel toggle */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        style={{
          position: "fixed", top: 24, right: 24, zIndex: 20,
          width: 36, height: 36, borderRadius: 6, border: "none",
          background: panelOpen ? "rgba(255,150,80,0.2)" : "rgba(255,150,80,0.08)",
          color: "rgba(255,150,80,0.6)", fontSize: 18, cursor: "pointer",
          fontFamily: "system-ui", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {panelOpen ? "\u2715" : "\u2699"}
      </button>

      {/* Controls */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 280, zIndex: 15,
        background: "rgba(26, 8, 0, 0.92)", backdropFilter: "blur(20px)",
        transform: panelOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "72px 20px 24px" }}>
          <div style={{ ...labelStyle, fontSize: 10, color: "rgba(255,150,80,0.3)", marginBottom: 20 }}>
            Neon Scanline
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Slider label="Scanline Density" value={params.scanlineDensity} min={100} max={2000} step={10} onChange={(v) => update("scanlineDensity", v)} />
            <Slider label="Scanline Width" value={params.scanlineWidth} min={0.1} max={0.9} onChange={(v) => update("scanlineWidth", v)} />
            <Slider label="Wave Amplitude" value={params.waveAmp} min={0} max={0.2} step={0.001} onChange={(v) => update("waveAmp", v)} />
            <Slider label="Wave Frequency" value={params.waveFreq} min={1} max={20} step={0.1} onChange={(v) => update("waveFreq", v)} />
            <Slider label="Wave Speed" value={params.waveSpeed} min={0} max={5} onChange={(v) => update("waveSpeed", v)} />
            <Slider label="Glitch" value={params.glitchAmp} min={0} max={0.1} step={0.001} onChange={(v) => update("glitchAmp", v)} />
            <Slider label="Bloom" value={params.bloom} min={0} max={1} onChange={(v) => update("bloom", v)} />
            <Slider label="Bloom Spread" value={params.bloomSpread} min={0} max={0.03} step={0.001} onChange={(v) => update("bloomSpread", v)} />
            <Slider label="Contrast" value={params.contrast} min={0.5} max={3} onChange={(v) => update("contrast", v)} />

            <div style={{ borderTop: "1px solid rgba(255,150,80,0.08)", paddingTop: 14, marginTop: 4 }}>
              <div style={{ ...labelStyle, fontSize: 10, color: "rgba(255,150,80,0.3)", marginBottom: 12 }}>
                Animation
              </div>
            </div>
            <Slider label="Blob Speed" value={params.blobSpeed} min={0} max={10} step={0.1} onChange={(v) => update("blobSpeed", v)} />
            <Slider label="Time Speed" value={params.timeSpeed} min={0} max={5} onChange={(v) => update("timeSpeed", v)} />
          </div>

          <button onClick={() => setParams({ ...DEFAULTS })} style={{
            ...labelStyle, fontSize: 10, marginTop: 24, padding: "8px 16px",
            width: "100%", borderRadius: 4, border: "1px solid rgba(255,150,80,0.1)",
            background: "rgba(255,150,80,0.05)", cursor: "pointer", color: "rgba(255,150,80,0.4)",
          }}>
            Reset
          </button>
        </div>
      </div>

      {!panelOpen && (
        <div style={{ ...labelStyle, fontSize: 9, position: "fixed", bottom: 16, right: 16, zIndex: 10, color: "rgba(255,150,80,0.15)" }}>
          P panel
        </div>
      )}
    </>
  );
}
