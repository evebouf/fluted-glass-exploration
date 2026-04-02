import { useState, useEffect, useRef } from "react";
import { FlutedGlass, GrainGradient } from "@paper-design/shaders-react";
import { useAnimatedOrbImage, landscapeOrbs } from "../useOrbImage";
import { PALETTE, DEFAULT_GLASS, SUS_GLASS, GLASS_SCALE, type GlassPreset } from "./constants";
import "./BrandKit.css";

// ─── Lazy shader mounting ────────────────────────────────────────
function useInView(margin = "200px") {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: margin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [margin]);
  return { ref, inView };
}

// ─── Live Glass Preview ──────────────────────────────────────────
function LiveGlass({
  orbIndex = 0,
  glass = DEFAULT_GLASS,
  scale = GLASS_SCALE,
  style,
}: {
  orbIndex?: number;
  glass?: GlassPreset;
  scale?: number;
  style?: React.CSSProperties;
}) {
  const { ref, inView } = useInView();
  const image = useAnimatedOrbImage(landscapeOrbs[orbIndex], inView);

  return (
    <div ref={ref} style={style}>
      {inView && image && (
        <FlutedGlass
          width="100%"
          height="100%"
          image={image}
          colorBack="#00000000"
          colorShadow={PALETTE.glass.shadow}
          colorHighlight={PALETTE.glass.highlight}
          shape={glass.shape}
          distortionShape={glass.distortionShape}
          size={glass.size}
          distortion={glass.distortion}
          edges={glass.edges}
          blur={glass.blur}
          shadows={glass.shadows}
          highlights={glass.highlights}
          stretch={glass.stretch}
          angle={glass.angle}
          grainOverlay={glass.grainOverlay}
          offsetX={0}
          offsetY={0}
          scale={scale}
          fit="cover"
          speed={0}
        />
      )}
    </div>
  );
}

// ─── Raw Gradient (no glass) ─────────────────────────────────────
function RawGradient({ orbIndex = 0 }: { orbIndex?: number }) {
  const { ref, inView } = useInView();
  const image = useAnimatedOrbImage(landscapeOrbs[orbIndex], inView);

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      {image && (
        <img
          src={image}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "inherit" }}
        />
      )}
    </div>
  );
}

// ─── Glass variations for the grid ───────────────────────────────
const glassVariations: GlassPreset[] = [
  { label: "Whisper", shape: "lines", distortionShape: "prism", size: 0.95, distortion: 0.1, edges: 0.08, blur: 0, shadows: 0.05, highlights: 0.03, stretch: 0, angle: 0, grainOverlay: 0.02 },
  { label: "Sharp", shape: "lines", distortionShape: "prism", size: 0.67, distortion: 0.55, edges: 0.4, blur: 0, shadows: 0.3, highlights: 0.35, stretch: 0, angle: 0, grainOverlay: 0.04 },
  { label: "Fine", shape: "lines", distortionShape: "prism", size: 0.92, distortion: 0.3, edges: 0.2, blur: 0, shadows: 0.15, highlights: 0.1, stretch: 0, angle: 0, grainOverlay: 0.03 },
];

// ─── Moodboard images ────────────────────────────────────────────
const MOODBOARD_IMAGES = [
  "/moodboard/fluted-wall.jpg",
  "/moodboard/lounge-led.jpg",
  "/moodboard/gradient-stage.jpg",
  "/moodboard/orange-signage.jpg",
  "/moodboard/blurred-figure.jpg",
  "/moodboard/orange-curtain.jpg",
  "/moodboard/neon-drape.png",
  "/moodboard/orange-pleats.jpg",
  "/moodboard/orange-sun-dinner.jpg",
  "/moodboard/fluted-glass-partition.png",
];

// ─── Brand Kit Page ──────────────────────────────────────────────
// ─── 3D Confirmation Card ───────────────────────────────────────
function ConfirmationCard3D() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, tx: 0, ty: 0 });
  const [hovering, setHovering] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const animRef = useRef({ offsetX: 0.15, offsetY: -0.21, scale: 2.2 });
  const [, forceUpdate] = useState(0);

  // Generate the orange orb image for the glass
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 600; canvas.height = 800;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#F4F2DD";
    ctx.fillRect(0, 0, 600, 800);

    const orb = ctx.createRadialGradient(200, 600, 0, 200, 600, 380);
    orb.addColorStop(0, "#FB4F12");
    orb.addColorStop(0.4, "#FB4F12");
    orb.addColorStop(0.7, "rgba(251, 79, 18, 0.4)");
    orb.addColorStop(1, "rgba(251, 79, 18, 0)");
    ctx.fillStyle = orb;
    ctx.fillRect(0, 0, 600, 800);

    const glow = ctx.createRadialGradient(480, 250, 0, 480, 250, 280);
    glow.addColorStop(0, "rgba(251, 79, 18, 0.35)");
    glow.addColorStop(0.6, "rgba(251, 79, 18, 0.1)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 600, 800);

    setGeneratedImage(canvas.toDataURL("image/png"));
  }, []);

  // Animate glass offset
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    let lastUpdate = 0;
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      animRef.current.offsetY = -0.21 + Math.sin(t * 0.5) * 0.2;
      animRef.current.offsetX = 0.15 + Math.cos(t * 0.35) * 0.15;
      animRef.current.scale = 2.2 + Math.sin(t * 0.3) * 0.3;
      if (now - lastUpdate > 33) { lastUpdate = now; forceUpdate((n) => n + 1); }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Idle float when not hovering
  useEffect(() => {
    if (hovering) return;
    let frame: number;
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      setTilt({
        rx: Math.cos(t * 0.5) * 3,
        ry: Math.sin(t * 0.8) * 4,
        tx: Math.sin(t * 0.8) * 2,
        ty: Math.cos(t * 0.5) * 1.5,
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hovering]);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    setHovering(true);
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 16, ry: x * 16, tx: x * 10, ty: -y * 10 });
  };

  const onMouseLeave = () => {
    setHovering(false);
    setTilt({ rx: 0, ry: 0, tx: 0, ty: 0 });
  };

  const MONO = "'Martian Mono', 'Space Mono', monospace";

  // Ticket mask with corner notches and perforation notches
  const CORNER = 16;
  const PERF = 14;
  const STUB = 76;
  const mask = [
    `radial-gradient(circle ${CORNER}px at 0 0, transparent 99%, black 100%)`,
    `radial-gradient(circle ${CORNER}px at 100% 0, transparent 99%, black 100%)`,
    `radial-gradient(circle ${CORNER}px at 0 100%, transparent 99%, black 100%)`,
    `radial-gradient(circle ${CORNER}px at 100% 100%, transparent 99%, black 100%)`,
    `radial-gradient(circle ${PERF}px at ${STUB}% 0, transparent 99%, black 100%)`,
    `radial-gradient(circle ${PERF}px at ${STUB}% 100%, transparent 99%, black 100%)`,
  ].join(", ");

  if (!generatedImage) return null;

  return (
    <div style={{ perspective: "1200px", display: "flex", justifyContent: "center" }}>
      <div
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateX(${tilt.tx}px) translateY(${tilt.ty}px)`,
          transition: hovering ? "transform 0.08s ease-out" : "transform 0.6s ease-out",
          transformStyle: "preserve-3d",
          WebkitMaskImage: mask,
          WebkitMaskComposite: "destination-in",
          maskImage: mask,
          boxShadow: "rgba(0,0,0,0.15) 0px 15px 40px 0px, rgba(0,0,0,0.08) 0px 5px 15px 0px",
          maxWidth: 520,
          width: "100%",
          cursor: "grab",
        }}
      >
        <div style={{
          display: "flex", flexDirection: "row", alignItems: "stretch",
          minHeight: 280, overflow: "hidden", background: "#F4F2DD", padding: 12,
          position: "relative",
          fontFamily: MONO,
        }}>
          {/* Left text section */}
          <div style={{
            position: "relative", zIndex: 3, flex: 1,
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            padding: 24,
          }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.15em", color: "#473426" }}>
                Startup School 2026
              </div>
              <div style={{ fontSize: 15, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.08em", color: "#473426", marginTop: 4 }}>
                You're confirmed
              </div>
            </div>
            <div style={{ margin: "16px 0" }}>
              <div style={{ fontSize: 26, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.02em", color: "#473426", lineHeight: 1.1 }}>
                Jane Smith
              </div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#473426", marginTop: 8 }}>
                From: San Francisco, CA
              </div>
            </div>
            <div style={{ fontSize: 9, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.15em", color: "#473426", whiteSpace: "nowrap" }}>
              Chase Center, SF &middot; June 16–17, 2026
            </div>
          </div>

          {/* Perforation line */}
          <div style={{
            position: "absolute", left: `${STUB}%`,
            top: PERF + 4, bottom: PERF + 4,
            borderLeft: "1.5px dashed rgba(71, 52, 38, 0.2)",
            zIndex: 5,
          }} />

          {/* Right shader section */}
          <div style={{
            position: "relative", zIndex: 1, width: "38%", flexShrink: 0,
            margin: "-12px -12px -12px 0", overflow: "hidden",
            borderRadius: "0 13px 13px 0",
          }}>
            {/* Year watermark */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 3,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: MONO, fontSize: 90, fontWeight: 700,
              color: "#ffffff", letterSpacing: "0.05em", lineHeight: 1,
              writingMode: "vertical-rl", opacity: 0.15, mixBlendMode: "overlay",
              overflow: "hidden", pointerEvents: "none",
            }}>
              2026
            </div>
            {/* Fluted glass */}
            <div style={{ position: "absolute", inset: -2 }}>
              <FlutedGlass
                width="100%" height="100%"
                image={generatedImage}
                colorBack="#00000000" colorShadow="#000000" colorHighlight="#ffffff"
                size={0.86} shadows={0} highlights={0} shape="lines" angle={0}
                distortionShape="prism" distortion={0.39} shift={0} stretch={0}
                blur={0} edges={0.25} margin={0} grainMixer={0} grainOverlay={0}
                offsetX={animRef.current.offsetX} offsetY={animRef.current.offsetY}
                scale={animRef.current.scale} fit="cover"
              />
            </div>
          </div>

          {/* "Presented by" rotated on right edge */}
          <div style={{
            position: "absolute", bottom: 0, right: 6, top: 0, zIndex: 6,
            display: "flex", alignItems: "center",
          }}>
            <div style={{
              fontFamily: MONO, fontSize: 8, textTransform: "uppercase",
              letterSpacing: "0.15em", color: "rgba(71, 52, 38, 0.7)",
              writingMode: "vertical-rl", whiteSpace: "nowrap",
            }}>
              Presented by Y Combinator
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationCardSection() {
  return (
    <section className="bk-section" id="bk-card">
      <div className="bk-section-label">Confirmation Card</div>

      <div className="bk-concept">
        <h2 className="bk-concept-headline">Your Ticket, Refracted</h2>
        <div className="bk-concept-body">
          <p>
            The confirmation card is a physical artifact rendered digitally.
            A ticket stub with notched corners, perforation marks, and a
            fluted glass panel on the right that refracts an animated orange
            gradient. The card tilts in 3D as the cursor moves — on mobile,
            the gyroscope takes over.
          </p>
          <p>
            <strong>Idle Float</strong><br />
            When the cursor is away, the card gently floats with a slow
            sine-driven oscillation — alive but calm. On hover, it snaps
            to follow the mouse with spring-damped rotation.
          </p>
        </div>
      </div>

      {/* Live 3D card */}
      <div style={{
        marginTop: 48,
        marginBottom: 48,
        padding: "60px 20px",
        borderRadius: 12,
        background: "#2E1F15",
      }}>
        <ConfirmationCard3D />
      </div>

      <div className="bk-motion-params">
        <div className="bk-motion-param">
          <span className="bk-motion-param-label">Tilt Range</span>
          <span className="bk-motion-param-value">&plusmn;8&deg; rotation &middot; &plusmn;8px translate</span>
        </div>
        <div className="bk-motion-param">
          <span className="bk-motion-param-label">Idle Float</span>
          <span className="bk-motion-param-value">Sine oscillation &middot; 3&deg; pitch, 4&deg; yaw</span>
        </div>
        <div className="bk-motion-param">
          <span className="bk-motion-param-label">Glass Animation</span>
          <span className="bk-motion-param-value">Offset + scale breathing at ~30fps</span>
        </div>
        <div className="bk-motion-param">
          <span className="bk-motion-param-label">Mask</span>
          <span className="bk-motion-param-value">Corner notches (16px) + perforation notches (14px)</span>
        </div>
      </div>
    </section>
  );
}

// ─── Floating Code Section ──────────────────────────────────────
const BAUHAUS_CODE = `const CLIP_PATHS = {
  "semi-top": "ellipse(50% 50% at 50% 0%)",
  "semi-bottom": "ellipse(50% 50% at 50% 100%)",
  "qtr-tl": "ellipse(100% 100% at 0% 0%)",
  "qtr-br": "ellipse(100% 100% at 100% 100%)",
  "full-circle": "ellipse(50% 50% at 50% 50%)",
};`;

const SHADER_CODE = `const GRAIN = {
  colors: ["#E04A00", "#D54400", "#C03A00"],
  colorBack: "#B03200",
  softness: 0.35,
  intensity: 0.6,
  noise: 0.35,
  speed: 0.25,
};

const FLUTE = {
  size: 0.85,
  shadows: 0.3,
  highlights: 0.08,
  distortion: 0.7,
  opacity: 0.7,
};`;

const ANIMATION_CODE = `// Each cell scrolls code at its own speed
const duration = 12 + seeded(cellSeed) * 18;
const delay = -(seeded(cellSeed) * duration);

// Mouse proximity controls opacity
const d = Math.sqrt(
  (mx - r.cx) ** 2 + (my - r.cy) ** 2
);
const opacity = Math.max(
  0, 1 - d / HOVER_RADIUS
) * MAX_OPACITY;`;

function CodeToggle({ title, code }: { title: string; code: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          width: "100%",
          border: "1px solid rgba(61, 40, 0, 0.1)",
          borderRadius: 6,
          background: open ? "rgba(251, 79, 18, 0.06)" : "rgba(61, 40, 0, 0.03)",
          cursor: "pointer",
          fontFamily: "'Martian Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          color: "#3D2800",
          textAlign: "left",
          transition: "background 0.2s",
        }}
      >
        <span style={{ fontSize: 10, opacity: 0.4, transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "rotate(0)" }}>&#9654;</span>
        {title}
      </button>
      {open && (
        <pre
          style={{
            margin: "8px 0 0",
            padding: "16px 18px",
            borderRadius: 6,
            background: "#1a1008",
            color: "#EBB488",
            fontFamily: "'Martian Mono', 'Space Mono', monospace",
            fontSize: 11,
            lineHeight: 1.5,
            overflow: "auto",
            maxHeight: 300,
            border: "1px solid rgba(61, 40, 0, 0.15)",
          }}
        >
          {code}
        </pre>
      )}
    </div>
  );
}

// ─── Mini Bauhaus Grid (live preview) ───────────────────────────
const CLIP_PATHS: Record<string, string> = {
  "semi-top": "ellipse(50% 50% at 50% 0%)",
  "semi-bottom": "ellipse(50% 50% at 50% 100%)",
  "semi-left": "ellipse(50% 50% at 0% 50%)",
  "semi-right": "ellipse(50% 50% at 100% 50%)",
  "qtr-tl": "ellipse(100% 100% at 0% 0%)",
  "qtr-tr": "ellipse(100% 100% at 100% 0%)",
  "qtr-bl": "ellipse(100% 100% at 0% 100%)",
  "qtr-br": "ellipse(100% 100% at 100% 100%)",
  "full-circle": "ellipse(50% 50% at 50% 50%)",
};

const TILE_PATTERN = [
  "qtr-br", "semi-bottom", "qtr-bl", "semi-left",
  "semi-right", "qtr-tl", "semi-top", "qtr-br",
  "qtr-tr", "semi-right", "full-circle", "semi-bottom",
  "semi-bottom", "full-circle", "semi-left", "qtr-tl",
];

const SAMPLE_CODE = `use std::sync::Arc;
use tokio::sync::Mutex;

struct ConnectionPool {
    connections: Vec<TcpStream>,
    max_size: usize,
}

impl ConnectionPool {
    async fn acquire(&self) -> Result<Connection> {
        let pool = self.inner.lock().await;
        match pool.connections.pop() {
            Some(conn) => Ok(conn),
            None if pool.len() < self.max_size => {
                self.create_connection().await
            }
            None => Err(PoolExhausted),
        }
    }
}

fn quicksort<T: Ord>(arr: &mut [T]) {
    if arr.len() <= 1 { return; }
    let pivot = partition(arr);
    quicksort(&mut arr[..pivot]);
    quicksort(&mut arr[pivot + 1..]);
}`.split("\n");

function seeded(i: number) {
  const n = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function MiniCell({ idx }: { idx: number }) {
  const shape = TILE_PATTERN[idx % TILE_PATTERN.length];
  const clipPath = CLIP_PATHS[shape];
  const duration = 10 + seeded(idx + 100) * 14;
  const delay = -(seeded(idx) * duration);
  const offset = Math.floor(seeded(idx + 400) * SAMPLE_CODE.length);

  // Double the lines for seamless loop
  const lines: string[] = [];
  for (let i = 0; i < 30; i++) {
    lines.push(SAMPLE_CODE[(offset + i) % SAMPLE_CODE.length]);
  }
  const doubled = [...lines, ...lines];

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          clipPath,
          opacity: 0.18,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            whiteSpace: "pre",
            fontFamily: "'Martian Mono', 'Space Mono', monospace",
            fontSize: "7px",
            lineHeight: "1.4",
            color: "#3D2800",
            animation: `bauhaus-scroll ${duration}s linear ${delay}s infinite`,
          }}
        >
          {doubled.map((line, i) => (
            <span key={i} style={{ display: "block" }}>{line || " "}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniPreview() {
  const cols = 4;
  const rows = 4;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1",
        borderRadius: 12,
        overflow: "hidden",
        background: "#F4F1DE",
      }}
    >
      <style>{`
        @keyframes bauhaus-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
      {/* Orange gradient base */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 80%, rgba(235,80,32,0.35) 0%, rgba(244,241,222,0) 70%)",
      }} />
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}>
        {Array.from({ length: cols * rows }, (_, i) => (
          <MiniCell key={i} idx={i} />
        ))}
      </div>
    </div>
  );
}

function FloatingCodeSection() {
  return (
    <section className="bk-section" id="bk-code">
      <div className="bk-section-label">Floating Code</div>

      <div className="bk-concept">
        <h2 className="bk-concept-headline">Code as Texture</h2>
        <div className="bk-concept-body">
          <p>
            Behind the glass, code floats. Not as decoration — as signal.
            Real algorithms, real data structures, scrolling through
            Bauhaus-inspired geometric cells. Each cell clips its code
            through a different shape: semicircles, quarter arcs, full
            circles. The grid forms a pattern that's structured but never
            repetitive.
          </p>
          <p>
            <strong>Mouse Proximity Reveal</strong><br />
            The code is invisible by default. As the cursor moves across
            the page, nearby cells fade in — a 350px radius of influence,
            peaking at 22% opacity. Move the mouse and the code follows,
            like light passing through the glass. Pull it away and the
            cells go dark again. The effect is subtle, peripheral,
            atmospheric.
          </p>
          <p>
            <strong>Perpetual Scroll</strong><br />
            Each cell scrolls its code upward at its own speed (12–30s
            per cycle) with a unique starting offset. The content is real:
            Rust connection pools, Python batch processors, C++ ring
            buffers. Three languages, randomly assigned per cell, each
            contributing a different visual rhythm. The scroll loops
            seamlessly — the same lines repeat without a visible seam.
          </p>
          <p>
            <strong>Geometric Clipping</strong><br />
            CSS clip-path shapes define what's visible in each cell.
            The 40-tile pattern alternates between semicircles (top,
            bottom, left, right), quarter circles (each corner), and
            full circles. Adjacent cells share edges to create a
            continuous tessellation. The effect is architectural —
            code seen through windows, not on screens.
          </p>
        </div>
      </div>

      {/* Live preview card */}
      <div style={{
        marginTop: 40,
        marginBottom: 40,
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}>
        <div style={{ flex: "0 0 280px", maxWidth: 320 }}>
          <MiniPreview />
          <div style={{
            fontFamily: "'Martian Mono', monospace",
            fontSize: 9,
            color: "rgba(61, 40, 0, 0.3)",
            textAlign: "center",
            marginTop: 10,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            Live preview &middot; 4&times;4 grid
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{
            fontFamily: "'Martian Mono', monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(61, 40, 0, 0.35)",
            marginBottom: 16,
          }}>
            Implementation
          </div>

          <CodeToggle title="Clip Paths — Geometric shapes" code={BAUHAUS_CODE} />
          <CodeToggle title="Shader Config — Gradient + glass params" code={SHADER_CODE} />
          <CodeToggle title="Animation — Scroll & proximity reveal" code={ANIMATION_CODE} />
        </div>
      </div>

      <div className="bk-motion-params">
        <div className="bk-motion-param">
          <span className="bk-motion-param-label">Grid</span>
          <span className="bk-motion-param-value">8 &times; 5 desktop &middot; 4 &times; 3 mobile</span>
        </div>
        <div className="bk-motion-param">
          <span className="bk-motion-param-label">Hover Radius</span>
          <span className="bk-motion-param-value">350px &middot; Max opacity 22%</span>
        </div>
        <div className="bk-motion-param">
          <span className="bk-motion-param-label">Scroll Speed</span>
          <span className="bk-motion-param-value">12–30s per cycle &middot; Unique per cell</span>
        </div>
        <div className="bk-motion-param">
          <span className="bk-motion-param-label">Languages</span>
          <span className="bk-motion-param-value">Rust &middot; Python &middot; C++</span>
        </div>
        <div className="bk-motion-param">
          <span className="bk-motion-param-label">Clip Shapes</span>
          <span className="bk-motion-param-value">9 types &middot; 40-tile repeating pattern</span>
        </div>
      </div>
    </section>
  );
}

export default function BrandKit() {
  const [toast, setToast] = useState("");

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setToast(`Copied ${hex}`);
    setTimeout(() => setToast(""), 1500);
  };

  return (
    <div className="brand-kit">
      {/* ── Nav ── */}
      <nav className="bk-nav">
        {["concept", "screens", "card", "color", "type", "glass", "grain", "motion", "code", "moodboard"].map((id) => (
          <button key={id} onClick={() => document.getElementById(`bk-${id}`)?.scrollIntoView({ behavior: "smooth" })}>
            {id}
          </button>
        ))}
      </nav>

      {/* ── Hero ── */}
      <section className="bk-hero">
        <div className="bk-hero-header">
          <h1>STARTUP SCHOOL 2026</h1>
          <span>Branding Guide</span>
        </div>
        <div className="bk-hero-card">
          <LiveGlass orbIndex={0} style={{ width: "100%", height: "100%" }} />
        </div>
      </section>

      {/* ── Concept ── */}
      <section className="bk-section" id="bk-concept">
        <div className="bk-section-label">Concept</div>

        <div className="bk-concept">
          <h2 className="bk-concept-headline">Bending the Future</h2>
          <div className="bk-concept-body">
            <p>
              <strong>A Window Into the Future</strong><br />
              Fluted glass is a window — but not a clear one. You can see
              through it: the shapes, the warmth, the energy. But the details
              shift as you move. The future is there, just not defined yet.
              That's what Startup School is. Six thousand technical builders
              at Chase Center, looking through the same window at what's being
              built right now — the excitement, the possibilities, the things
              that don't fully exist yet. You have to lean in, move around,
              piece together your own picture.
            </p>
            <p>
              <strong>Find Your Angle</strong><br />
              Nobody hands you a clean view. You carve out your own space, find
              your own angle. The glass multiplies — one beam of light hits the
              surface and refracts into dozens of parallel lines, each carrying
              the same signal at a slightly different angle. That's the
              experience: six thousand people looking at the same future, each
              seeing something different. Each finding the version that's theirs.
            </p>
            <p>
              <strong>Structure + Energy</strong><br />
              The ribbed glass is the constant — structured, architectural,
              deliberate. Behind it, the orange gradient is alive, always moving.
              Warmth pushing through order. Ambition refracted through discipline.
            </p>
            <p>
              <strong>Why Orange</strong><br />
              Orange is the sun. It's optimism made visible — the rising sun,
              the beginning of something, the early days of an era. It carries
              the weight of a first morning: everything ahead, nothing yet
              decided. It's also fire — intensity, warmth, brightness. Not a
              cautious, corporate warmth but the real thing: direct, energetic,
              impossible to ignore. The color of the moment right before
              something catches. Paired with the beige, it reads as sunlight
              on sandstone — ancient and modern at the same time.
            </p>
            <p>
              <strong>Fractal by Nature</strong><br />
              The pattern repeats but the perspective is always unique. That's
              the ethos — one event, one signal, refracted across thousands of
              builders. The glass doesn't blur the picture. It multiplies it.
            </p>
            <p>
              <strong>Material Heritage</strong><br />
              The material itself carries a quiet nod to mid-century architecture —
              fluted glass in office lobbies, department stores, old San Francisco
              buildings. It's familiar without being retro. The warmth of the
              palette and the grain texture add analog texture to a digital surface,
              grounding the futurism in something you can almost feel. Not nostalgia
              as a destination, but as a point of departure.
            </p>
          </div>

          <div className="bk-concept-hooks">
            <div className="bk-concept-hook">
              <span className="bk-concept-hook-label">Tagline</span>
              <span className="bk-concept-hook-text">Window into the future</span>
            </div>
            <div className="bk-concept-hook">
              <span className="bk-concept-hook-label">Theme</span>
              <span className="bk-concept-hook-text">Bending the future</span>
            </div>
            <div className="bk-concept-hook">
              <span className="bk-concept-hook-label">Motif</span>
              <span className="bk-concept-hook-text">Fractal light, multiplied</span>
            </div>
            <div className="bk-concept-hook">
              <span className="bk-concept-hook-label">CTA</span>
              <span className="bk-concept-hook-text">Find your angle</span>
            </div>
            <div className="bk-concept-hook">
              <span className="bk-concept-hook-label">Venue</span>
              <span className="bk-concept-hook-text">Chase Center</span>
            </div>
            <div className="bk-concept-hook">
              <span className="bk-concept-hook-label">Event</span>
              <a href="https://events.ycombinator.com/startup-school-2026" target="_blank" rel="noopener" className="bk-concept-hook-link">
                Startup School 2026 &rarr;
              </a>
            </div>
            <div className="bk-concept-hook">
              <span className="bk-concept-hook-label">Moodboard</span>
              <a href="https://pin.it/1L0Bf7uaJ" target="_blank" rel="noopener" className="bk-concept-hook-link">
                Pinterest Board &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Screens ── */}
      <section className="bk-section" id="bk-screens">
        <div className="bk-section-label">Screens</div>

        <div className="bk-concept-body" style={{ marginBottom: 48 }}>
          <p>
            Chase Center has dozens of screens across lobbies, concourses,
            suites, and the main bowl — varying from vertical signage totems
            to ultra-wide LED ribbons. The fluted glass effect is designed to
            work at any aspect ratio and any scale. The glass texture stays
            consistent; the gradient behind it adapts to fill the canvas.
          </p>
          <p>
            For animated screens, the blobs drift autonomously — no interaction
            needed. For interactive installations (lobby kiosks, photo ops),
            the gradient can follow cursor or touch position behind static glass.
          </p>
        </div>

        <div className="bk-screens-grid">
          <div className="bk-screen-frame bk-screen-wide">
            <LiveGlass orbIndex={0} style={{ width: "100%", height: "100%" }} />
            <span className="bk-screen-label">LED Ribbon &middot; Ultra-wide</span>
          </div>
          <div className="bk-screen-pair">
            <div className="bk-screen-frame bk-screen-portrait">
              <LiveGlass orbIndex={1} style={{ width: "100%", height: "100%" }} />
              <span className="bk-screen-label">Signage Totem</span>
            </div>
            <div className="bk-screen-frame bk-screen-square">
              <LiveGlass orbIndex={0} style={{ width: "100%", height: "100%" }} />
              <span className="bk-screen-label">Suite Display</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Confirmation Card ── */}
      <ConfirmationCardSection />

      {/* ── Color ── */}
      <section className="bk-section" id="bk-color">
        <div className="bk-section-label">Color</div>

        <div className="bk-color-group-label">Orange</div>
        <div className="bk-swatches">
          {[
            { name: "Blaze", hex: PALETTE.orange.blaze },
            { name: "Ember", hex: PALETTE.orange.ember },
            { name: "Coral", hex: PALETTE.orange.coral },
            { name: "Apricot", hex: PALETTE.orange.apricot },
          ].map((c) => (
            <button key={c.hex} className="bk-swatch" onClick={() => copyHex(c.hex)}>
              <div className="bk-swatch-color" style={{ backgroundColor: c.hex }} />
              <div className="bk-swatch-name">{c.name}</div>
              <div className="bk-swatch-hex">{c.hex}</div>
            </button>
          ))}
        </div>

        <div className="bk-color-group-label">Neutral</div>
        <div className="bk-swatches">
          {[
            { name: "Parchment", hex: PALETTE.neutral.parchment },
            { name: "Sand", hex: PALETTE.neutral.sand },
            { name: "Linen", hex: PALETTE.neutral.linen },
            { name: "Bone", hex: PALETTE.neutral.bone },
          ].map((c) => (
            <button key={c.hex} className="bk-swatch" onClick={() => copyHex(c.hex)}>
              <div className="bk-swatch-color" style={{ backgroundColor: c.hex }} />
              <div className="bk-swatch-name">{c.name}</div>
              <div className="bk-swatch-hex">{c.hex}</div>
            </button>
          ))}
        </div>

        <div className="bk-color-group-label">Dark</div>
        <div className="bk-swatches">
          {[
            { name: "Card Background", hex: PALETTE.dark.cardBg },
            { name: "Dark Text", hex: PALETTE.dark.text },
            { name: "Glass Shadow", hex: PALETTE.glass.shadow },
            { name: "Text", hex: PALETTE.text },
          ].map((c) => (
            <button key={c.hex} className="bk-swatch" onClick={() => copyHex(c.hex)}>
              <div className="bk-swatch-color" style={{ backgroundColor: c.hex }} />
              <div className="bk-swatch-name">{c.name}</div>
              <div className="bk-swatch-hex">{c.hex}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Typography ── */}
      <section className="bk-section" id="bk-type">
        <div className="bk-section-label">Type</div>

        <div className="bk-type-ramp">
          {[100, 200, 300, 400, 500, 600, 700, 800].map((w) => (
            <div key={w} className="bk-type-weight">
              <span className="bk-type-weight-num">{w}</span>
              <span className="bk-type-weight-sample" style={{ fontWeight: w }}>
                Martian Mono {w}
              </span>
            </div>
          ))}
        </div>

        <div className="bk-color-group-label" style={{ marginTop: 48 }}>Secondary — Geist Mono</div>
        <div className="bk-type-ramp">
          {[100, 200, 300, 400, 500, 600, 700, 800].map((w) => (
            <div key={w} className="bk-type-weight">
              <span className="bk-type-weight-num">{w}</span>
              <span className="bk-type-weight-sample" style={{ fontWeight: w, fontFamily: "'Geist Mono', monospace" }}>
                Geist Mono {w}
              </span>
            </div>
          ))}
        </div>

        <div className="bk-type-scale">
          <div className="bk-type-scale-item">
            <span className="bk-type-scale-meta">48px / weight 200 — Hero display</span>
            <span style={{ fontSize: 48, fontWeight: 200, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: "#3D2800" }}>
              Startup School
            </span>
          </div>
          <div className="bk-type-scale-item">
            <span className="bk-type-scale-meta">28px / weight 300 — Section heading</span>
            <span style={{ fontSize: 28, fontWeight: 300, letterSpacing: "-0.02em", color: "#3D2800" }}>
              Bending the Future
            </span>
          </div>
          <div className="bk-type-scale-item">
            <span className="bk-type-scale-meta">14px / weight 400 — Body text</span>
            <span style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.8, color: "rgba(61, 40, 0, 0.55)" }}>
              A canvas-generated gradient texture passed through a WebGL fluted glass shader.
              The blobs drift on circular, lissajous, and radial paths behind static ribbed glass.
            </span>
          </div>
          <div className="bk-type-scale-item">
            <span className="bk-type-scale-meta">11px / weight 700 — Label</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(251, 79, 18, 0.6)" }}>
              Brand Kit &middot; Color &middot; Typography
            </span>
          </div>
        </div>

        <div className="bk-type-charset">
          ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
          abcdefghijklmnopqrstuvwxyz<br />
          0123456789<br />
          !@#$%^&*()_+-=[]{}|;:&apos;,./&lt;&gt;?
        </div>
      </section>

      {/* ── Glass ── */}
      <section className="bk-section" id="bk-glass">
        <div className="bk-section-label">Glass</div>

        <div className="bk-glass-main">
          <LiveGlass orbIndex={0} glass={SUS_GLASS} style={{ width: "100%", height: "100%" }} />
        </div>

        <div className="bk-glass-params">
          <span className="bk-glass-param"><strong>shape:</strong> lines</span>
          <span className="bk-glass-param"><strong>distortion:</strong> flat</span>
          <span className="bk-glass-param"><strong>size:</strong> 0.82</span>
          <span className="bk-glass-param"><strong>distortion:</strong> 0.45</span>
          <span className="bk-glass-param"><strong>edges:</strong> 0.3</span>
          <span className="bk-glass-param"><strong>shadows:</strong> 0.2</span>
          <span className="bk-glass-param"><strong>grain:</strong> 0.06</span>
          <span className="bk-glass-param"><strong>shadow:</strong> {PALETTE.glass.shadow}</span>
          <span className="bk-glass-param"><strong>highlight:</strong> {PALETTE.glass.highlight}</span>
        </div>

        <div className="bk-glass-grid">
          {glassVariations.map((v) => (
            <div key={v.label} className="bk-glass-thumb">
              <LiveGlass orbIndex={0} glass={v} style={{ width: "100%", height: "100%" }} />
              <span className="bk-glass-thumb-label">{v.label}</span>
            </div>
          ))}
        </div>

        <div className="bk-rules">
          <div className="bk-rule">
            <span className="bk-rule-dot" style={{ backgroundColor: PALETTE.orange.blaze }} />
            Lines always vertical (angle: 0)
          </div>
          <div className="bk-rule">
            <span className="bk-rule-dot" style={{ backgroundColor: PALETTE.orange.blaze }} />
            Shadow color: {PALETTE.glass.shadow} &middot; Highlight: {PALETTE.glass.highlight}
          </div>
          <div className="bk-rule">
            <span className="bk-rule-dot" style={{ backgroundColor: PALETTE.orange.blaze }} />
            SUS preset as default &middot; Fine and Sharp for variation
          </div>
        </div>
      </section>

      {/* ── Grain ── */}
      <section className="bk-section" id="bk-grain">
        <div className="bk-section-label">Grain</div>
        <GrainRow />
      </section>

      {/* ── Motion ── */}
      <section className="bk-section" id="bk-motion">
        <div className="bk-section-label">Motion</div>

        <div className="bk-concept-body" style={{ marginBottom: 48 }}>
          <p>
            The gradient behind the glass is never still. Orange blobs drift on
            circular, figure-8, and radial paths — each at its own speed and phase.
            Through the fluted glass, this reads as a slow, organic color shift
            rather than literal movement.
          </p>
        </div>

        <div className="bk-motion-pair">
          <div className="bk-motion-card">
            <div className="bk-motion-preview">
              <RawGradient orbIndex={0} />
            </div>
            <span className="bk-motion-card-label">Raw gradient (no glass)</span>
          </div>
          <div className="bk-motion-card">
            <div className="bk-motion-preview">
              <LiveGlass orbIndex={0} style={{ width: "100%", height: "100%" }} />
            </div>
            <span className="bk-motion-card-label">Through fluted glass</span>
          </div>
        </div>

        <div className="bk-motion-params">
          <div className="bk-motion-param">
            <span className="bk-motion-param-label">Radius Breathing</span>
            <span className="bk-motion-param-value">+/- 35% at individual rates per blob</span>
          </div>
          <div className="bk-motion-param">
            <span className="bk-motion-param-label">Hue Shift</span>
            <span className="bk-motion-param-value">+/- 8 degrees within orange range</span>
          </div>
          <div className="bk-motion-param">
            <span className="bk-motion-param-label">Frame Rate</span>
            <span className="bk-motion-param-value">Canvas: 20fps &middot; Glass: static</span>
          </div>
        </div>
      </section>

      {/* ── Floating Code ── */}
      <FloatingCodeSection />

      {/* ── Moodboard ── */}
      <section className="bk-section" id="bk-moodboard">
        <div className="bk-section-label">Moodboard</div>

        <div className="bk-concept-body" style={{ marginBottom: 48 }}>
          <p>
            Visual references, inspiration, and texture samples.
          </p>
        </div>

        <a
          href="https://pin.it/1L0Bf7uaJ"
          target="_blank"
          rel="noopener"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 24px",
            borderRadius: 8,
            background: "rgba(251, 79, 18, 0.08)",
            border: "1px solid rgba(251, 79, 18, 0.15)",
            textDecoration: "none",
            marginBottom: 40,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(251, 79, 18, 0.15)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(251, 79, 18, 0.08)")}
        >
          <span style={{
            fontFamily: "'Martian Mono', monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: PALETTE.orange.blaze,
          }}>
            Full Pinterest Board
          </span>
          <span style={{
            fontFamily: "'Martian Mono', monospace",
            fontSize: 13,
            color: PALETTE.orange.blaze,
          }}>
            &rarr;
          </span>
        </a>

        <div className="bk-moodboard">
          <div className="bk-moodboard-grid">
            {MOODBOARD_IMAGES.map((src, i) => (
              <div key={i} className="bk-moodboard-item">
                <img src={src} alt="" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bk-footer">
        <span>@paper-design/shaders</span>
        <a href="#/">&larr; Exploration tool</a>
      </footer>

      {/* ── Toast ── */}
      <div className={`bk-toast ${toast ? "visible" : ""}`}>{toast}</div>
    </div>
  );
}

// ─── Grain Row ───────────────────────────────────────────────────
function GrainRow() {
  const { ref, inView } = useInView();

  return (
    <div ref={ref}>
      <div className="bk-grain-row">
        <div className="bk-grain-preview">
          {inView && (
            <GrainGradient
              width="100%"
              height="100%"
              colorBack={PALETTE.orange.blaze}
              colors={[PALETTE.neutral.parchment, PALETTE.neutral.linen, PALETTE.orange.ember, PALETTE.neutral.sand]}
              softness={0.2}
              intensity={0.8}
              noise={0.5}
              shape="corners"
              speed={0.5}
            />
          )}
          <span className="bk-grain-label">Bold — event signage</span>
        </div>

        <div className="bk-grain-preview">
          {inView && (
            <GrainGradient
              width="100%"
              height="100%"
              colorBack={PALETTE.neutral.parchment}
              colors={[PALETTE.neutral.sand, PALETTE.neutral.linen, PALETTE.orange.apricot]}
              softness={0.4}
              intensity={0.3}
              noise={0.3}
              shape="corners"
              speed={0.3}
            />
          )}
          <span className="bk-grain-label">Subtle — background texture</span>
        </div>
      </div>
    </div>
  );
}
