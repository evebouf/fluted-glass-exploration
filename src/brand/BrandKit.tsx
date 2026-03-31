import { useState, useEffect, useRef } from "react";
import { FlutedGlass, GrainGradient } from "@paper-design/shaders-react";
import { useAnimatedOrbImage, landscapeOrbs } from "../useOrbImage";
import { PALETTE, SHARP_GLASS, DEFAULT_GLASS, GLASS_SCALE } from "./constants";
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
  glass?: { shape: "lines" | "wave" | "linesIrregular"; distortionShape: "prism" | "contour" | "flat" | "cascade"; size: number; distortion: number; edges: number; blur: number; shadows: number; highlights: number; stretch: number; angle: number; grainOverlay: number };
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

// ─── Raw Gradient (no glass, just the animated canvas) ───────────
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

// ─── Color data ──────────────────────────────────────────────────
const orangeColors = [
  { name: "Blaze", hex: PALETTE.orange.blaze, role: "Primary accent" },
  { name: "Ember", hex: PALETTE.orange.ember, role: "Secondary accent" },
  { name: "Coral", hex: PALETTE.orange.coral, role: "Highlight" },
  { name: "Apricot", hex: PALETTE.orange.apricot, role: "Warm light" },
];

const neutralColors = [
  { name: "Parchment", hex: PALETTE.neutral.parchment, role: "Background" },
  { name: "Sand", hex: PALETTE.neutral.sand, role: "Warm surface" },
  { name: "Linen", hex: PALETTE.neutral.linen, role: "Alt background" },
  { name: "Bone", hex: PALETTE.neutral.bone, role: "Card surface" },
];

// ─── Glass variations ────────────────────────────────────────────
const glassVariations = [
  { label: "Zigzag", shape: "linesIrregular" as const, distortionShape: "prism" as const, size: 0.75, distortion: 0.7, edges: 0.5, blur: 0, shadows: 0.25, highlights: 0.12, stretch: 0.3, angle: 0, grainOverlay: 0.05 },
  { label: "Waves", shape: "wave" as const, distortionShape: "contour" as const, size: 0.85, distortion: 0.6, edges: 0.45, blur: 0.1, shadows: 0.15, highlights: 0.08, stretch: 0.8, angle: 0, grainOverlay: 0.04 },
  { label: "Fine", shape: "lines" as const, distortionShape: "prism" as const, size: 0.92, distortion: 0.3, edges: 0.2, blur: 0, shadows: 0.15, highlights: 0.1, stretch: 0, angle: 0, grainOverlay: 0.03 },
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
      <a href="#/" className="bk-back">&larr; Back</a>

      {/* ── Nav ── */}
      <nav className="bk-nav">
        {["concept", "screens", "color", "type", "glass", "grain", "motion", "social", "usage", "moodboard"].map((id) => (
          <button key={id} onClick={() => document.getElementById(`bk-${id}`)?.scrollIntoView({ behavior: "smooth" })}>
            {id}
          </button>
        ))}
      </nav>

      {/* ── Hero ── */}
      <section className="bk-hero">
        <div className="bk-hero-glass">
          <LiveGlass orbIndex={0} style={{ width: "100%", height: "100%" }} />
        </div>
        <div className="bk-hero-text">
          <h1>Startup School<br />2026</h1>
          <span>Branding Guide</span>
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
              <span className="bk-concept-hook-text">Chase Center, San Francisco</span>
            </div>
            <div className="bk-concept-hook">
              <span className="bk-concept-hook-label">Event</span>
              <a href="https://events.ycombinator.com/startup-school-2026" target="_blank" rel="noopener" className="bk-concept-hook-link">
                Startup School 2026 &rarr;
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
          {orangeColors.map((c) => (
            <button key={c.hex} className="bk-swatch" onClick={() => copyHex(c.hex)}>
              <div className="bk-swatch-color" style={{ backgroundColor: c.hex }} />
              <div className="bk-swatch-name">{c.name}</div>
              <div className="bk-swatch-hex">{c.hex}</div>
            </button>
          ))}
        </div>

        <div className="bk-color-group-label">Neutral</div>
        <div className="bk-swatches">
          {neutralColors.map((c) => (
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
            <span className="bk-type-scale-meta">72px / weight 200 — Hero display</span>
            <span style={{ fontSize: 72, fontWeight: 200, letterSpacing: "-0.03em", color: "#3D2800" }}>
              Fluted Glass
            </span>
          </div>
          <div className="bk-type-scale-item">
            <span className="bk-type-scale-meta">28px / weight 300 — Section heading</span>
            <span style={{ fontSize: 28, fontWeight: 300, letterSpacing: "-0.02em", color: "#3D2800" }}>
              Orange and beige gradients
            </span>
          </div>
          <div className="bk-type-scale-item">
            <span className="bk-type-scale-meta">14px / weight 400 — Body text</span>
            <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(61, 40, 0, 0.6)" }}>
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
          <div className="bk-type-scale-item">
            <span className="bk-type-scale-meta">10px / weight 500 — Metadata</span>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "rgba(61, 40, 0, 0.3)" }}>
              Sharp &middot; Lines / Prism &middot; Size 0.67
            </span>
          </div>
        </div>

        <div className="bk-type-charset">
          ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
          abcdefghijklmnopqrstuvwxyz<br />
          0123456789<br />
          !@#$%^&*()_+-=[]{}|;:',./&lt;&gt;?
        </div>
      </section>

      {/* ── Glass ── */}
      <section className="bk-section" id="bk-glass">
        <div className="bk-section-label">Glass</div>

        <div className="bk-glass-main">
          <LiveGlass orbIndex={0} style={{ width: "100%", height: "100%" }} />
        </div>

        <div className="bk-glass-params">
          <span className="bk-glass-param"><strong>shape:</strong> lines</span>
          <span className="bk-glass-param"><strong>distortion:</strong> prism</span>
          <span className="bk-glass-param"><strong>size:</strong> 0.67</span>
          <span className="bk-glass-param"><strong>distortion:</strong> 0.55</span>
          <span className="bk-glass-param"><strong>edges:</strong> 0.4</span>
          <span className="bk-glass-param"><strong>shadows:</strong> 0.3</span>
          <span className="bk-glass-param"><strong>highlights:</strong> 0.35</span>
          <span className="bk-glass-param"><strong>grain:</strong> 0.04</span>
          <span className="bk-glass-param"><strong>scale:</strong> 1.8</span>
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
            Scale range: 1.5 &ndash; 2.2 for production
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
            <span className="bk-motion-param-label">Blob Drift</span>
            <span className="bk-motion-param-value">Frequency: 0.04 &ndash; 0.55 &middot; Amplitude: 0.03 &ndash; 0.30</span>
          </div>
          <div className="bk-motion-param">
            <span className="bk-motion-param-label">Motion Paths</span>
            <span className="bk-motion-param-value">Circular orbit, lissajous figure-8, radial drift</span>
          </div>
          <div className="bk-motion-param">
            <span className="bk-motion-param-label">Radius Breathing</span>
            <span className="bk-motion-param-value">+/- 20% at individual rates per blob</span>
          </div>
          <div className="bk-motion-param">
            <span className="bk-motion-param-label">Hue Shift</span>
            <span className="bk-motion-param-value">+/- 8 degrees within orange range</span>
          </div>
        </div>
      </section>

      {/* ── Usage ── */}
      <section className="bk-section" id="bk-usage">
        <div className="bk-section-label">Usage</div>

        <div className="bk-usage-cols">
          <div className="bk-usage-col">
            <div className="bk-usage-col-label" style={{ color: PALETTE.orange.blaze }}>Do</div>
            <div className="bk-usage-item">
              <span className="bk-rule-dot" style={{ backgroundColor: PALETTE.orange.blaze, marginTop: 6 }} />
              Use vertical glass lines (angle: 0)
            </div>
            <div className="bk-usage-item">
              <span className="bk-rule-dot" style={{ backgroundColor: PALETTE.orange.blaze, marginTop: 6 }} />
              Use Warm Drift blobs behind glass for hero content
            </div>
            <div className="bk-usage-item">
              <span className="bk-rule-dot" style={{ backgroundColor: PALETTE.orange.blaze, marginTop: 6 }} />
              Keep grain overlay subtle (0.03 &ndash; 0.08)
            </div>
            <div className="bk-usage-item">
              <span className="bk-rule-dot" style={{ backgroundColor: PALETTE.orange.blaze, marginTop: 6 }} />
              Use {PALETTE.orange.blaze} as the primary accent
            </div>
            <div className="bk-usage-item">
              <span className="bk-rule-dot" style={{ backgroundColor: PALETTE.orange.blaze, marginTop: 6 }} />
              Use Martian Mono exclusively
            </div>
            <div className="bk-usage-item">
              <span className="bk-rule-dot" style={{ backgroundColor: PALETTE.orange.blaze, marginTop: 6 }} />
              Weight 200-300 for display, 500-700 for labels
            </div>
          </div>

          <div className="bk-usage-col">
            <div className="bk-usage-col-label" style={{ color: "rgba(61, 40, 0, 0.3)" }}>Avoid</div>
            <div className="bk-usage-item">
              <span className="bk-rule-dot" style={{ backgroundColor: "rgba(61, 40, 0, 0.15)", marginTop: 6 }} />
              Black (#000) or white (#FFF) anywhere
            </div>
            <div className="bk-usage-item">
              <span className="bk-rule-dot" style={{ backgroundColor: "rgba(61, 40, 0, 0.15)", marginTop: 6 }} />
              Horizontal or diagonal glass lines
            </div>
            <div className="bk-usage-item">
              <span className="bk-rule-dot" style={{ backgroundColor: "rgba(61, 40, 0, 0.15)", marginTop: 6 }} />
              Stacking multiple shader layers
            </div>
            <div className="bk-usage-item">
              <span className="bk-rule-dot" style={{ backgroundColor: "rgba(61, 40, 0, 0.15)", marginTop: 6 }} />
              Busy backgrounds — keep blob count to 2-4
            </div>
            <div className="bk-usage-item">
              <span className="bk-rule-dot" style={{ backgroundColor: "rgba(61, 40, 0, 0.15)", marginTop: 6 }} />
              Any font other than Martian Mono
            </div>
          </div>
        </div>
      </section>

      {/* ── Social ── */}
      <section className="bk-section" id="bk-social">
        <div className="bk-section-label">Social</div>

        <div className="bk-concept-body" style={{ marginBottom: 48 }}>
          <p>
            Social media assets use the fluted glass gradient as a full-bleed
            background with text set in Martian Mono. Keep copy short. Let the
            texture do the work.
          </p>
        </div>

        <div className="bk-social-grid">
          {/* Instagram / Square */}
          <div className="bk-social-card bk-social-square">
            <LiveGlass orbIndex={0} style={{ width: "100%", height: "100%" }} />
            <div className="bk-social-overlay">
              <span className="bk-social-eyebrow">Y Combinator presents</span>
              <span className="bk-social-title">STARTUP<br />SCHOOL<br />2026</span>
              <span className="bk-social-detail">Chase Center &middot; San Francisco</span>
            </div>
            <span className="bk-social-format">Instagram &middot; 1080 &times; 1080</span>
          </div>

          {/* Story / Vertical */}
          <div className="bk-social-card bk-social-story">
            <LiveGlass orbIndex={0} style={{ width: "100%", height: "100%" }} />
            <div className="bk-social-overlay">
              <span className="bk-social-eyebrow">Startup School 2026</span>
              <span className="bk-social-title" style={{ fontSize: 36 }}>WINDOW<br />INTO THE<br />FUTURE</span>
              <span className="bk-social-detail">Apply now &rarr;</span>
            </div>
            <span className="bk-social-format">Story &middot; 1080 &times; 1920</span>
          </div>

          {/* Twitter / Landscape */}
          <div className="bk-social-card bk-social-landscape">
            <LiveGlass orbIndex={0} style={{ width: "100%", height: "100%" }} />
            <div className="bk-social-overlay bk-social-overlay-row">
              <span className="bk-social-title" style={{ fontSize: 28 }}>STARTUP SCHOOL 2026</span>
              <span className="bk-social-detail">Find your angle &middot; Chase Center, SF</span>
            </div>
            <span className="bk-social-format">Twitter / OG &middot; 1200 &times; 630</span>
          </div>
        </div>
      </section>

      {/* ── Moodboard ── */}
      <section className="bk-section" id="bk-moodboard">
        <div className="bk-section-label">Moodboard</div>

        <div className="bk-concept-body" style={{ marginBottom: 48 }}>
          <p>
            Visual references, inspiration, and texture samples. Drag and drop
            images to build the visual direction.
          </p>
        </div>

        <Moodboard />
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

// ─── Moodboard (drag & drop images) ──────────────────────────────
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

function Moodboard() {
  return (
    <div className="bk-moodboard">
      <div className="bk-moodboard-grid">
        {MOODBOARD_IMAGES.map((src, i) => (
          <div key={i} className="bk-moodboard-item">
            <img src={src} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Grain Row (separate component for lazy mounting) ────────────
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
