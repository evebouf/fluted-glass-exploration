export const PALETTE = {
  orange: {
    blaze: "#EB5020",
    ember: "#E86830",
    coral: "#E89060",
    apricot: "#EBB488",
  },
  neutral: {
    parchment: "#F4F1DE",
    sand: "#F0D4B0",
    linen: "#F2E8D0",
    bone: "#F4F0E4",
  },
  dark: {
    cardBg: "#2E1F15",
    text: "#473426",
  },
  glass: {
    shadow: "#5C2800",
    highlight: "#F0C8A0",
  },
  text: "#3D2800",
} as const;

export interface GlassPreset {
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

export const SUS_GLASS: GlassPreset = {
  label: "SUS",
  shape: "lines",
  distortionShape: "flat",
  size: 0.82,
  distortion: 0.45,
  edges: 0.3,
  blur: 0,
  shadows: 0.2,
  highlights: 0.12,
  stretch: 0,
  angle: 0,
  grainOverlay: 0.06,
};

export const SHARP_GLASS: GlassPreset = {
  label: "Sharp",
  shape: "lines",
  distortionShape: "prism",
  size: 0.67,
  distortion: 0.55,
  edges: 0.4,
  blur: 0,
  shadows: 0.3,
  highlights: 0.35,
  stretch: 0,
  angle: 0,
  grainOverlay: 0.04,
};

export const FINE_GLASS: GlassPreset = {
  label: "Fine",
  shape: "lines",
  distortionShape: "prism",
  size: 0.92,
  distortion: 0.3,
  edges: 0.2,
  blur: 0,
  shadows: 0.15,
  highlights: 0.1,
  stretch: 0,
  angle: 0,
  grainOverlay: 0.03,
};

export const DEFAULT_GLASS = SUS_GLASS;

export const GLASS_SCALE = 1.0;
