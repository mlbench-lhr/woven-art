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
  const [note, setNote] = useState<string>("This can take 2-4 minutes. Please keep this tab open, leaving or closing the page will pause generation.");
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [generating, setGenerating] = useState(false);
  const generatingRef = useRef(false);

  useEffect(() => {
    if (variants.length > 0 && !selected) setSelected(variants[0].id);
  }, [variants, selected]);

  const current = useMemo(() => variants.find((v) => v.id === selected) || null, [variants, selected]);
  const currentProgress = current ? (progress[current.id] ?? 0) : 0;

  const [canvasSize, setCanvasSize] = useState(360);

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize(Math.min(360, window.innerWidth - 48));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (generatingRef.current) return;

    const run = async () => {
      setGenerating(true);
      if (variants.length > 0) {
        if (variants.some((v) => typeof v?.lines !== "number" || !Array.isArray(v?.sequence) || v.sequence.length !== v.lines + 1)) {
          try {
            sessionStorage.removeItem("stringArtVariants");
          } catch {}
          setVariants([] as any);
        } else {
        const initialProgress: Record<string, number> = {};
        for (const v of variants) initialProgress[v.id] = 0;
        setProgress(initialProgress);
        animateStoredVariants(variants, setProgress);
        setGenerating(false);
        return;
        }
      }

      let stored: any[] | null = null;
      try {
        const raw = sessionStorage.getItem("stringArtVariants");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) stored = parsed;
        }
      } catch {}

      if (stored && stored.every((v) => typeof v?.lines === "number" && Array.isArray(v?.sequence) && v.sequence.length === v.lines + 1)) {
        setVariants(stored as any);
        const initialProgress: Record<string, number> = {};
        for (const v of stored) initialProgress[v.id] = 0;
        setProgress(initialProgress);
        animateStoredVariants(stored as any, setProgress);
        setGenerating(false);
        return;
      }
      if (stored) {
        try {
          sessionStorage.removeItem("stringArtVariants");
        } catch {}
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
          { id: "v3", lines: 3700, seed: 137 },
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
              <div 
                className="relative bg-white rounded-full shadow-lg border border-gray-100 overflow-hidden"
                style={{ width: canvasSize, height: canvasSize }}
              >
                <ProgressiveStringPreview
                  sequence={current.sequence}
                  totalPins={240}
                  size={canvasSize}
                  strokeColor="#777"
                  strokeWidth={0.2}
                  progressLen={currentProgress}
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`relative w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-white transition-shadow ${
                  selected === v.id ? "ring-4 ring-[#C5B4A3] shadow-md" : "hover:shadow-sm"
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden">
                  <ProgressiveStringPreview
                    sequence={v.sequence}
                    totalPins={240}
                    size={80}
                    strokeColor="#777"
                    strokeWidth={0.03}
                    progressLen={progress[v.id] ?? 0}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
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
    const base = new Uint8Array(size * size);
    for (let i = 0; i < size * size; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      base[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    const blurH = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const x0 = x > 0 ? x - 1 : 0;
        const x1 = x;
        const x2 = x + 1 < size ? x + 1 : size - 1;
        const idx = y * size;
        blurH[idx + x] = (base[idx + x0] + base[idx + x1] + base[idx + x2]) / 3;
      }
    }
    const blurred = new Uint8Array(size * size);
    for (let y = 0; y < size; y++) {
      const y0 = y > 0 ? y - 1 : 0;
      const y1 = y;
      const y2 = y + 1 < size ? y + 1 : size - 1;
      for (let x = 0; x < size; x++) {
        const v = (blurH[y0 * size + x] + blurH[y1 * size + x] + blurH[y2 * size + x]) / 3;
        blurred[y * size + x] = Math.round(v);
      }
    }
    const hist = new Uint32Array(256);
    for (let i = 0; i < blurred.length; i++) hist[blurred[i]]++;
    const total = size * size;
    const lowCount = Math.floor(total * 0.02);
    const highCount = Math.floor(total * 0.98);
    let acc = 0;
    let pLow = 0;
    for (let i = 0; i < 256; i++) {
      acc += hist[i];
      if (acc >= lowCount) { pLow = i; break; }
    }
    acc = 0;
    let pHigh = 255;
    for (let i = 0; i < 256; i++) {
      acc += hist[i];
      if (acc >= highCount) { pHigh = i; break; }
    }
    if (pHigh <= pLow) { pLow = 0; pHigh = 255; }
    const range = pHigh - pLow;
    const gamma = 0.9;
    for (let i = 0; i < pixels.length; i++) {
      let v = (blurred[i] - pLow) / range;
      if (v < 0) v = 0;
      else if (v > 1) v = 1;
      v = Math.pow(v, gamma);
      pixels[i] = Math.round(v * 255);
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

  sequenceOut.push(current);
  onLine(sequenceOut.length - 1);
}
