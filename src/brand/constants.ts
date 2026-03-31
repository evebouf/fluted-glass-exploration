export const PALETTE = {
  orange: {
    blaze: "#FB4F12",
    ember: "#E8650E",
    coral: "#FF8A50",
    apricot: "#FFB366",
  },
  neutral: {
    parchment: "#F4F2DD",
    sand: "#F0D8B8",
    linen: "#F5EFE0",
    bone: "#F4F0E4",
  },
  glass: {
    shadow: "#5C2800",
    highlight: "#F0C8A0",
  },
  text: "#3D2800",
} as const;

export const SHARP_GLASS = {
  label: "Sharp",
  shape: "lines" as const,
  distortionShape: "prism" as const,
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

export const FINE_GLASS = {
  label: "Fine",
  shape: "lines" as const,
  distortionShape: "prism" as const,
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

export const DEFAULT_GLASS = FINE_GLASS;

export const GLASS_SCALE = 1.8;
