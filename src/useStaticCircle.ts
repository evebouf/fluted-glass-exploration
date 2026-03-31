import { useEffect, useState } from "react";

/**
 * Generates a simple static image: beige background + orange circle in center.
 * No animation on the image — all motion comes from the glass shader.
 */
export function useStaticCircleImage(
  bgColor = "#F4F2DD",
  circleColor = "#FB4F12",
  circleRadius = 0.25, // fraction of canvas height
): string {
  const [image, setImage] = useState("");

  useEffect(() => {
    const cw = 960;
    const ch = 540;
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d")!;

    // Beige background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cw, ch);

    // Orange circle — centered, soft radial gradient
    const cx = cw / 2;
    const cy = ch / 2;
    const r = ch * circleRadius;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, circleColor);
    grad.addColorStop(0.5, circleColor);
    grad.addColorStop(0.8, hexToRgba(circleColor, 0.5));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    setImage(canvas.toDataURL("image/jpeg", 0.9));
  }, [bgColor, circleColor, circleRadius]);

  return image;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
