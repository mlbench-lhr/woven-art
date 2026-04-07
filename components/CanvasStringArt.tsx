"use client";

import { useEffect, useRef } from "react";
import type { Variant } from "@/app/Context/VariantsContext";

type Props = {
  sequence: number[];
  totalPins: number;
  size: number;
  strokeColor?: string;
  strokeWidth?: number;
};

export default function CanvasStringArt({
  sequence,
  totalPins,
  size,
  strokeColor = "#bbb",
  strokeWidth = 0.1,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !sequence) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    // Compute pin positions on circle
    const pins: { x: number; y: number }[] = [];
    const radius = size / 2;
    const cx = radius;
    const cy = radius;

    for (let i = 0; i < totalPins; i++) {
      const angle = (2 * Math.PI * i) / totalPins;
      pins.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    }

    // Draw lines
    for (let i = 1; i < sequence.length; i++) {
      const from = pins[sequence[i - 1]];
      const to = pins[sequence[i]];
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
  }, [sequence, size, strokeColor, strokeWidth, totalPins]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-full" />;
}