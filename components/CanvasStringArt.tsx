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

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Compute pin positions on circle (starting from -PI/2 to start at top)
    const pins: { x: number; y: number }[] = [];
    const radius = size / 2 - 1;
    const cx = size / 2;
    const cy = size / 2;

    for (let i = 0; i < totalPins; i++) {
      const angle = (2 * Math.PI * i) / totalPins - Math.PI / 2;
      pins.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    }

    // Draw circle border
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();

    // Draw strings with multiply compositing
    ctx.globalCompositeOperation = 'multiply';
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 0.75;
    ctx.lineCap = 'round';

    for (let i = 1; i < sequence.length; i++) {
      const from = pins[sequence[i - 1]];
      const to = pins[sequence[i]];
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
  }, [sequence, size, strokeColor, strokeWidth, totalPins]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-full" />;
}