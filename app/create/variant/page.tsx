"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import ProgressiveStringPreview from "@/components/ProgressiveStringPreview";
import { useVariants } from "@/app/Context/VariantsContext";
import { useRouter } from "next/navigation";

export default function SelectVariantPage() {
  const router = useRouter();
  const { variants, setVariants } = useVariants();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState<string>("This can take 4-8 minutes. Please keep this tab open, leaving or closing the page will pause generation.");
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [generating, setGenerating] = useState(false);
  const generatingRef = useRef(false);

  useEffect(() => {
    if (variants.length > 0 && !selected) setSelected(variants[0].id);
  }, [variants, selected]);

  const current = useMemo(() => variants.find((v) => v.id === selected) || null, [variants, selected]);
  const currentProgress = current ? (progress[current.id] ?? 0) : 0;

  useEffect(() => {
    if (generatingRef.current) return;

    const run = async () => {
      setGenerating(true);
      if (variants.length > 0) {
        const initialProgress: Record<string, number> = {};
        for (const v of variants) initialProgress[v.id] = 0;
        setProgress(initialProgress);
        animateStoredVariants(variants, setProgress);
        setNote("");
        setGenerating(false);
        return;
      }

      let stored: any[] | null = null;
      try {
        const raw = sessionStorage.getItem("stringArtVariants");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) stored = parsed;
        }
      } catch {}

      if (stored) {
        setVariants(stored as any);
        const initialProgress: Record<string, number> = {};
        for (const v of stored) initialProgress[v.id] = 0;
        setProgress(initialProgress);
        animateStoredVariants(stored as any, setProgress);
        setNote("");
        setGenerating(false);
        return;
      }

      generatingRef.current = true;
      try {
        const preview = sessionStorage.getItem("stringArtPreview");
        if (!preview) {
          setGenerating(false);
          return;
        }
        const imageData = await prepareImage(preview, 360);
        const totalPins = 240;
        const cfgs = [
          { id: "v1", lines: 2700, seed: 0 },
          { id: "v2", lines: 3300, seed: 61 },
          { id: "v3", lines: 3500, seed: 137 },
        ];

        const live = cfgs.map((c) => ({ id: c.id, lines: c.lines, seed: c.seed, sequence: [] as number[] }));
        setVariants(live as any);
        setSelected((s) => s ?? cfgs[0].id);
        setProgress({ v1: 0, v2: 0, v3: 0 });

        await Promise.all(
          cfgs.map(async (c) => {
            const target = live.find((x) => x.id === c.id)!;
            await generateStringArtProgressive({
              imageData,
              totalPins: totalPins,
              totalLines: c.lines,
              seed: c.seed,
              onLine: (seqLen) => {
                setProgress((prev) => ({ ...prev, [c.id]: seqLen }));
              },
              sequenceOut: target.sequence,
            });
          })
        );

        try {
          sessionStorage.setItem("stringArtVariants", JSON.stringify(live));
        } catch {}
        setNote("");
      } catch (e) {
        console.error(e);
      } finally {
        generatingRef.current = false;
        setGenerating(false);
      }
    };

    run();
  }, [setVariants, variants]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[800px] mx-auto px-6 py-12 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#171d1a] text-center">
            Select Variant
          </h1>

          {note && <div className="mt-6 text-sm text-gray-600 text-center max-w-[620px]">{note}</div>}
          {current && (
            <div className="mt-10 w-full flex justify-center">
              <ProgressiveStringPreview
                sequence={current.sequence}
                totalPins={240}
                size={360}
                strokeColor="#666"
                strokeWidth={0.2}
                progressLen={currentProgress}
              />
            </div>
          )}

          <div className="mt-8 flex items-center gap-6">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`relative w-[80px] h-[80px] rounded-full overflow-hidden border transition-all ${
                  selected === v.id
                    ? "border-[3px] border-[#C5B4A3] shadow-md scale-110"
                    : "border-gray-300 hover:border-[#C5B4A3]"
                }`}
              >
                <ProgressiveStringPreview
                  sequence={v.sequence}
                  totalPins={240}
                  size={80}
                  strokeColor="#777"
                  strokeWidth={0.05}
                  progressLen={progress[v.id] ?? 0}
                />
              </button>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/create")}>
              Back
            </Button>
            <Button
              className="opp-button-4"
              onClick={() => {
                try {
                  if (selected) sessionStorage.setItem("selectedVariantId", selected);
                } catch {}
                router.push(`/create/artwork?variant=${encodeURIComponent(selected || "")}`);
              }}
              disabled={!selected || generating}
            >
              {generating ? "Generating..." : "Create Artwork"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

async function prepareImage(src: string, size = 360): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context not available");
      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;
      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
      resolve(ctx.getImageData(0, 0, size, size));
    };
    img.onerror = reject;
    img.src = src;
  });
}

function animateStoredVariants(
  stored: Array<{ id: string; sequence: number[] }>,
  setProgressFn: React.Dispatch<React.SetStateAction<Record<string, number>>>
) {
  let raf = 0;
  const state: Record<string, number> = {};
  for (const v of stored) state[v.id] = 0;
  const step = () => {
    let allDone = true;
    for (const v of stored) {
      const max = Math.max(0, v.sequence.length - 1);
      const cur = state[v.id] ?? 0;
        if (cur < max) {
          state[v.id] = Math.min(max, cur + 2);
          allDone = false;
        }
    }
    setProgressFn({ ...state });
    if (!allDone) raf = window.requestAnimationFrame(step);
  };
  raf = window.requestAnimationFrame(step);
  return () => window.cancelAnimationFrame(raf);
}

async function generateStringArtProgressive({
  imageData,
  totalPins,
  totalLines,
  seed,
  onLine,
  sequenceOut,
}: {
  imageData: ImageData;
  totalPins: number;
  totalLines: number;
  seed: number;
  onLine: (progressLen: number) => void;
  sequenceOut: number[];
}) {
  const size = imageData.width;
  const data = imageData.data;
    const pixels = new Float32Array(size * size);
    const contrastFactor = 0.4; // Even less contrast
    const brightnessOffset = 120; // Even more brightness

    for (let i = 0; i < size * size; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      let grayscale = 0.299 * r + 0.587 * g + 0.114 * b;

      // Apply contrast and brightness adjustments
      grayscale = (grayscale - 128) * contrastFactor + 128 + brightnessOffset;

      // Clamp values to 0-255
      pixels[i] = Math.max(0, Math.min(255, grayscale));
    }

  const working = new Float32Array(pixels);
  const pins: { x: number; y: number }[] = [];
  const center = size / 2;
  const radius = size / 2 - 1;
  for (let i = 0; i < totalPins; i++) {
    const angle = (2 * Math.PI * i) / totalPins;
    pins.push({ x: Math.round(center + radius * Math.cos(angle)), y: Math.round(center + radius * Math.sin(angle)) });
  }

  function linePixels(p1: { x: number; y: number }, p2: { x: number; y: number }): number[] {
    const pts: number[] = [];
    let x0 = p1.x, y0 = p1.y;
    let x1 = p2.x, y1 = p2.y;
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      pts.push(y0 * size + x0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = err * 2;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    return pts;
  }

  const cache = new Map<string, number[]>();
  function getLine(i: number, j: number): number[] {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    let v = cache.get(key);
    if (!v) {
      v = linePixels(pins[i], pins[j]);
      cache.set(key, v);
    }
    return v;
  }

  sequenceOut.length = 0;
  let current = seed % totalPins;
  const MIN_DIST = 15;
  const MAX_BRIGHTNESS = 255;

  let lastReport = 0;
  for (let step = 0; step < totalLines; step++) {
    sequenceOut.push(current);

    let bestPin = -1;
    let bestScore = -Infinity;
    let bestLine: number[] | null = null;

    for (let i = 0; i < totalPins; i++) {
      if (i === current) continue;
      const dist = Math.abs(i - current);
      if (dist < MIN_DIST || dist > totalPins - MIN_DIST) continue;
      const line = getLine(current, i);
      let score = 0;
      for (const idx of line) score += MAX_BRIGHTNESS - working[idx];
      score /= line.length;
      if (score > bestScore) {
        bestScore = score;
        bestPin = i;
        bestLine = line;
      }
    }

    if (bestPin === -1 || !bestLine) {
      bestPin = (current + totalPins / 2) % totalPins;
      bestLine = getLine(current, bestPin);
    }

    const weight = 12 + (step / totalLines) * 20;
    for (const idx of bestLine) {
      const v = working[idx] + weight;
      working[idx] = v > MAX_BRIGHTNESS ? MAX_BRIGHTNESS : v;
    }

    current = bestPin;

    if (step - lastReport >= 1 || step === totalLines - 1) {
      lastReport = step;
      onLine(sequenceOut.length - 1);
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    }
  }
}
