"use client";

import { useEffect, useMemo, useRef } from "react";

type Props = {
  sequence: number[];
  totalPins: number;
  size: number;
  strokeColor?: string;
  strokeWidth?: number;
  progressLen?: number;
};

/**
 * Renders string art on a 3× hi-res canvas (physical pixels = size*3),
 * displayed at `size` CSS px — identical to the HTML reference tool.
 *
 * lineWidth = 0.85 px on the 3× canvas ≈ 0.28 px visual → razor-sharp threads.
 */
export default function ProgressiveStringPreview({
  sequence,
  totalPins,
  size,
  strokeColor = "rgba(10,10,10,0.22)",
  strokeWidth = 0.85,
  progressLen,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastSeqRef = useRef<number[] | null>(null);
  const lastConfigKeyRef = useRef<string>("");
  const drawnToRef = useRef(0);

  // The internal (physical) canvas resolution
  const SCALE = 3;
  const hiSize = size * SCALE;

  // Nail positions at hi-res — matches the HTML exactly:
  //   r = size/2 - 1 (logical), angle = (i/N)*2π - π
  const pins = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const r = hiSize / 2 - SCALE; // = (size/2 - 1) * SCALE
    const cx = hiSize / 2;
    const cy = hiSize / 2;
    for (let i = 0; i < totalPins; i++) {
      const angle = (2 * Math.PI * i) / totalPins;
      pts.push({
        x: Math.round(cx + r * Math.cos(angle)),
        y: Math.round(cy + r * Math.sin(angle)),
      });
    }
    return pts;
  }, [hiSize, totalPins]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth; // 0.85 px on the 3× surface

    const configKey = `${size}-${totalPins}-${strokeColor}-${strokeWidth}`;
    const needsReset =
      lastSeqRef.current !== sequence || lastConfigKeyRef.current !== configKey;

    if (needsReset) {
      lastSeqRef.current = sequence;
      lastConfigKeyRef.current = configKey;
      drawnToRef.current = 0;
      // White background, same as the HTML reference
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, hiSize, hiSize);
    }

    const maxIndex = sequence.length - 1;
    const target = Math.min(
      typeof progressLen === "number" ? progressLen : maxIndex,
      maxIndex
    );
    const start = Math.max(1, drawnToRef.current + 1);

    for (let i = start; i <= target; i++) {
      const fromIdx = sequence[i - 1];
      const toIdx = sequence[i];
      const from = pins[fromIdx];
      const to = pins[toIdx];
      if (!from || !to) continue;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }

    drawnToRef.current = Math.max(drawnToRef.current, target);
  }, [pins, progressLen, sequence, hiSize, strokeColor, strokeWidth]);

  return (
    <canvas
      ref={canvasRef}
      // Physical size = 3× for sharpness; CSS size = logical `size`
      width={hiSize}
      height={hiSize}
      style={{ width: size, height: size, imageRendering: "crisp-edges" }}
      className="block rounded-full w-full h-full"
    />
  );
}