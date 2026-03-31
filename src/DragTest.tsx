import { useEffect, useRef, useState, useCallback } from "react";
import { FlutedGlass } from "@paper-design/shaders-react";

const CW = 960;
const CH = 540;

// Generate a static glass-only texture (no image content, just the glass pattern)
function makeGlassTexture(): string {
  const canvas = document.createElement("canvas");
  canvas.width = CW;
  canvas.height = CH;
  const ctx = canvas.getContext("2d")!;
  // Neutral gray so the glass pattern is visible
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, CW, CH);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function drawCircle(canvas: HTMLCanvasElement, cx: number, cy: number) {
  const ctx = canvas.getContext("2d")!;
  const radius = 300;

  ctx.fillStyle = "#F4F1DE";
  ctx.fillRect(0, 0, CW, CH);

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, "#EB5020");
  grad.addColorStop(0.55, "#EB5020");
  grad.addColorStop(0.7, "rgba(235, 80, 32, 0.6)");
  grad.addColorStop(0.85, "rgba(235, 80, 32, 0.25)");
  grad.addColorStop(0.95, "rgba(235, 80, 32, 0.08)");
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CW, CH);
}

export default function DragTest() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bgImage, setBgImage] = useState("");
  const [glassTexture] = useState(makeGlassTexture);
  const [pos, setPos] = useState({ x: CW / 2, y: CH * 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("Click and drag to move the circle");

  // Create canvas once
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CW;
    canvas.height = CH;
    canvasRef.current = canvas;
    drawCircle(canvas, CW / 2, CH * 0.8);
    setBgImage(canvas.toDataURL("image/jpeg", 0.85));
  }, []);

  // Redraw on position change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCircle(canvas, pos.x, pos.y);
    setBgImage(canvas.toDataURL("image/jpeg", 0.85));
  }, [pos]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStatus("Dragging...");
    setPos({ x: (e.clientX / window.innerWidth) * CW, y: (e.clientY / window.innerHeight) * CH });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = (e.clientX / window.innerWidth) * CW;
    const newY = (e.clientY / window.innerHeight) * CH;
    setPos({ x: newX, y: newY });
    setStatus(`x=${(newX / CW).toFixed(3)}, y=${(newY / CH).toFixed(3)}`);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setStatus(`Position: x=${(pos.x / CW).toFixed(3)}, y=${(pos.y / CH).toFixed(3)}`);
  }, [pos]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#F4F1DE" }}>
      {/* Layer 1: Raw gradient image — moves freely, no WebGL */}
      {bgImage && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }} />
      )}

      {/* Layer 2: Static glass overlay — never remounts, mix-blend creates the fluted look */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, opacity: 0.6, mixBlendMode: "overlay" }}>
        <FlutedGlass
          width="100%"
          height="100%"
          image={glassTexture}
          colorBack="#F4F1DE"
          colorShadow="#5C2800"
          colorHighlight="#F0C8A0"
          shape="lines"
          distortionShape="prism"
          size={0.82}
          distortion={0.45}
          edges={0.3}
          blur={0}
          shadows={0.2}
          highlights={0.12}
          stretch={0}
          angle={0}
          grainOverlay={0.06}
          scale={1}
          fit="cover"
          speed={0}
        />
      </div>

      {/* Layer 3: Drag surface */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 10,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Status */}
      <div style={{
        position: "absolute", top: 20, left: 20, zIndex: 20,
        fontFamily: "'Martian Mono', monospace", fontSize: 11, color: "#3D2800",
        background: "rgba(244,241,222,0.9)", padding: "8px 12px", borderRadius: 6,
        pointerEvents: "none",
      }}>
        {status}
      </div>
      <a href="#/" style={{
        position: "absolute", top: 20, right: 20, zIndex: 20,
        fontFamily: "'Martian Mono', monospace", fontSize: 11, color: "#3D2800",
        textDecoration: "none",
      }}>
        &larr; Back
      </a>
    </div>
  );
}
