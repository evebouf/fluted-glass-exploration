import { useEffect, useRef, useState } from "react";
import { FlutedGlass } from "@paper-design/shaders-react";
import { PALETTE, SUS_GLASS } from "./brand/constants";

const CW = 960;
const CH = 540;

function drawCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const radius = 300;

  ctx.fillStyle = PALETTE.neutral.parchment;
  ctx.fillRect(0, 0, CW, CH);

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, PALETTE.orange.blaze);
  grad.addColorStop(0.55, PALETTE.orange.blaze);
  grad.addColorStop(0.7, "rgba(235, 80, 32, 0.6)");
  grad.addColorStop(0.85, "rgba(235, 80, 32, 0.25)");
  grad.addColorStop(0.95, "rgba(235, 80, 32, 0.08)");
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CW, CH);
}

export default function DragTest() {
  const [image, setImage] = useState("");
  const posRef = useRef({ x: CW / 2, y: CH * 0.8 });
  const draggingRef = useRef(false);
  const dirtyRef = useRef(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [status, setStatus] = useState("Click and drag to move the circle");

  // Setup offscreen canvas + render loop
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CW;
    canvas.height = CH;
    canvasRef.current = canvas;
    ctxRef.current = canvas.getContext("2d")!;

    let frame: number;
    let lastDraw = 0;

    const tick = (now: number) => {
      // Only re-export when dirty, throttled to ~30fps
      if (dirtyRef.current && now - lastDraw > 33) {
        lastDraw = now;
        dirtyRef.current = false;
        const ctx = ctxRef.current!;
        drawCircle(ctx, posRef.current.x, posRef.current.y);
        setImage(canvas.toDataURL("image/jpeg", 0.85));
      }
      frame = requestAnimationFrame(tick);
    };

    // Initial draw
    dirtyRef.current = true;
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Mouse handlers using refs — no stale closures
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      posRef.current = {
        x: (e.clientX / window.innerWidth) * CW,
        y: (e.clientY / window.innerHeight) * CH,
      };
      dirtyRef.current = true;
      setStatus("Dragging...");
    };

    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      posRef.current = {
        x: (e.clientX / window.innerWidth) * CW,
        y: (e.clientY / window.innerHeight) * CH,
      };
      dirtyRef.current = true;
      setStatus(`x=${(posRef.current.x / CW).toFixed(3)}, y=${(posRef.current.y / CH).toFixed(3)}`);
    };

    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setStatus(`Position: x=${(posRef.current.x / CW).toFixed(3)}, y=${(posRef.current.y / CH).toFixed(3)}`);
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div style={{
      width: "100vw", height: "100vh", position: "relative",
      background: PALETTE.neutral.parchment,
      cursor: draggingRef.current ? "grabbing" : "grab",
    }}>
      {/* FlutedGlass refracting the draggable circle */}
      {image && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
          <FlutedGlass
            width="100%"
            height="100%"
            image={image}
            colorBack="#00000000"
            colorShadow={PALETTE.glass.shadow}
            colorHighlight={PALETTE.glass.highlight}
            shape={SUS_GLASS.shape}
            distortionShape={SUS_GLASS.distortionShape}
            size={SUS_GLASS.size}
            distortion={SUS_GLASS.distortion}
            edges={SUS_GLASS.edges}
            blur={SUS_GLASS.blur}
            shadows={SUS_GLASS.shadows}
            highlights={SUS_GLASS.highlights}
            stretch={SUS_GLASS.stretch}
            angle={SUS_GLASS.angle}
            grainOverlay={SUS_GLASS.grainOverlay}
            offsetX={0}
            offsetY={0}
            scale={1}
            fit="cover"
            speed={0.001}
          />
        </div>
      )}

      {/* Status */}
      <div style={{
        position: "absolute", top: 20, left: 20, zIndex: 20,
        fontFamily: "'Martian Mono', monospace", fontSize: 11, color: PALETTE.text,
        background: "rgba(244,241,222,0.9)", padding: "8px 12px", borderRadius: 6,
        pointerEvents: "none",
      }}>
        {status}
      </div>
    </div>
  );
}
