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

export default function ProgressiveStringPreview({
  sequence,
  totalPins,
  size,
  strokeColor = "#bbb",
  strokeWidth = 0.2,
  progressLen,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastSeqRef = useRef<number[] | null>(null);
  const lastConfigKeyRef = useRef<string>("");
  const drawnToRef = useRef(0);

  const pins = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const radius = size / 2;
    const cx = radius;
    const cy = radius;
    for (let i = 0; i < totalPins; i++) {
      const angle = (2 * Math.PI * i) / totalPins;
      pts.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
    }
    return pts;
  }, [size, totalPins]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    const configKey = `${size}-${totalPins}-${strokeColor}-${strokeWidth}`;
    const needsReset = lastSeqRef.current !== sequence || lastConfigKeyRef.current !== configKey;
    if (needsReset) {
      lastSeqRef.current = sequence;
      lastConfigKeyRef.current = configKey;
      drawnToRef.current = 0;
      ctx.clearRect(0, 0, size, size);
    }

    const maxIndex = sequence.length - 1;
    const target = Math.min(typeof progressLen === "number" ? progressLen : maxIndex, maxIndex);
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
  }, [pins, progressLen, sequence, size, strokeColor, strokeWidth]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-full" />;
}

