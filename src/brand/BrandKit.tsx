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
        {["concept", "screens", "color", "type", "glass", "grain", "motion", "moodboard"].map((id) => (
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
              The future is visible but not yet clear. Fluted glass refracts
              what's behind it — you can see the shapes, the warmth, the energy,
              but the details shift as you move. You have to lean in, look from
              new angles, piece it together yourself.
            </p>
            <p>
              That's the startup experience. The signal is there. The opportunity
              is real. But nobody hands you a clean picture. You carve out your
              own view.
            </p>
            <p>
              The ribbed glass is the constant — structured, architectural,
              deliberate. Behind it, the orange gradient is alive, always moving.
              Warmth pushing through order. Ambition refracted through discipline.
            </p>
            <p>
              The orange is sun — optimism made visible. Not a cautious,
              corporate warmth but the real thing: direct, energetic, impossible
              to ignore. It's the color of the moment right before something
              catches fire. Paired with the beige, it reads as sunlight on
              sandstone — ancient and modern at the same time.
            </p>
            <p>
              Fluted glass is fractal by nature. A single light source hits
              the surface and multiplies — one beam becomes dozens of parallel
              lines, each carrying the same signal at a slightly different angle.
              That's the ethos of Startup School: one idea, refracted across
              thousands of founders, each finding their own version of it. The
              pattern repeats but the perspective is always unique.
            </p>
            <p>
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
