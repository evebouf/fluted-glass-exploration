import { useState, useEffect } from "react";

interface NavItem {
  label: string;
  hash: string;
  description?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    title: "Presentation",
    items: [
      { label: "Brand Kit", hash: "#/", description: "Brand showcase & presets" },
    ],
  },
  {
    title: "Glass + Blobs",
    items: [
      { label: "Blobs", hash: "#/blobs", description: "Animated orbs with fluted glass" },
      { label: "Gradient Glass", hash: "#/gradient", description: "GrainGradient + glass overlay" },
      { label: "Stage Glass", hash: "#/stage", description: "Gradient animation with scroll" },
    ],
  },
  {
    title: "Custom Shaders",
    items: [
      { label: "Scanline — Blobs", hash: "#/scanline", description: "Orange blobs + fluted glass" },
      { label: "Scanline — Plasma", hash: "#/scan-plasma", description: "Organic flowing plasma" },
      { label: "Scanline — Lava", hash: "#/scan-lava", description: "Metaball lava lamp blobs" },
      { label: "Scanline — Aurora", hash: "#/scan-aurora", description: "Flowing light curtains" },
      { label: "Scanline — Nebula", hash: "#/scan-nebula", description: "Layered cloud drifts" },
      { label: "Scanline — Orb", hash: "#/scan-orb", description: "Floating circle bobbing up/down" },
    ],
  },
  {
    title: "Interactive",
    items: [
      { label: "Drag Test", hash: "#/drag", description: "Draggable circle with glass" },
    ],
  },
];

// Modes available on the main App (hash #/)
const APP_MODES = [
  { label: "Blobs", query: "?mode=blobs&glass=sus&preset=sus-hero" },
  { label: "Cursor", query: "?mode=cursor&glass=sus&preset=sus-hero" },
  { label: "Shapes", query: "?mode=shapes&glass=sus&preset=three-orbs" },
  { label: "Grain", query: "?mode=grain&glass=sus" },
  { label: "Ambient", query: "?mode=ambient&glass=sus&preset=terracotta-sun" },
  { label: "Halftone", query: "?mode=halftone&glass=sus&preset=sus-hero" },
  { label: "Circle", query: "?mode=circle&glass=sus" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState(window.location.hash || "#/");

  useEffect(() => {
    const onHash = () => setCurrentHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Keyboard: N to toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "SELECT") return;
      if (e.key === "n" || e.key === "N") setOpen((v) => !v);
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navigate = (hash: string, query?: string) => {
    setOpen(false);
    if (query) {
      // For App modes, need to clear hash and set query params
      window.location.hash = "";
      window.history.replaceState(null, "", "/" + query);
      window.location.reload();
    } else {
      window.location.hash = hash;
    }
  };

  const mono: React.CSSProperties = {
    fontFamily: "'Martian Mono', monospace",
  };

  return (
    <>
      {/* Toggle button — top left */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1000,
          width: 36,
          height: 36,
          borderRadius: 6,
          border: "none",
          background: open ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
          color: open ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)",
          fontSize: 16,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          transition: "all 0.2s",
          ...mono,
        }}
      >
        {open ? "\u2715" : "\u2630"}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 998,
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* Slide-out panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 280,
          zIndex: 999,
          background: "rgba(15, 10, 5, 0.92)",
          backdropFilter: "blur(20px)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", padding: "64px 20px 24px" }}>
          {/* Title */}
          <div
            style={{
              ...mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)",
              marginBottom: 24,
            }}
          >
            Explorations
          </div>

          {NAV.map((group) => (
            <div key={group.title} style={{ marginBottom: 20 }}>
              {/* Group title */}
              <div
                style={{
                  ...mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)",
                  marginBottom: 8,
                }}
              >
                {group.title}
              </div>

              {/* Items */}
              {group.items.map((item) => {
                const active = currentHash === item.hash || (item.hash === "#/" && (!currentHash || currentHash === "#/"));
                return (
                  <button
                    key={item.hash}
                    onClick={() => navigate(item.hash)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      padding: "8px 12px",
                      marginBottom: 2,
                      borderRadius: 6,
                      border: "none",
                      background: active ? "rgba(254, 159, 93, 0.15)" : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        ...mono,
                        fontSize: 12,
                        fontWeight: 600,
                        color: active ? "#FE9F5D" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      {item.label}
                    </span>
                    {item.description && (
                      <span
                        style={{
                          ...mono,
                          fontSize: 9,
                          color: "rgba(255,255,255,0.25)",
                          marginTop: 2,
                        }}
                      >
                        {item.description}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Show App sub-modes under Glass + Blobs */}
              {group.title === "Glass + Blobs" && currentHash.startsWith("#/") === false && (
                <div style={{ marginTop: 4, marginLeft: 12 }}>
                  {APP_MODES.map((mode) => (
                    <button
                      key={mode.query}
                      onClick={() => navigate("#/", mode.query)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "4px 12px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        ...mono,
                        fontSize: 9,
                        color: "rgba(255,255,255,0.35)",
                      }}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            ...mono,
            fontSize: 9,
            color: "rgba(255,255,255,0.15)",
          }}
        >
          N toggle &middot; Esc close
        </div>
      </div>
    </>
  );
}
