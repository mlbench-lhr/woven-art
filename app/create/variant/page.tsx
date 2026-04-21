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
        <div className="max-w-8xl mx-auto px-6 py-12 flex flex-col items-center">
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
            {variants.map((v,index) => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-white transition-shadow ${
                  selected === v.id ? "ring-4 ring-[#C5B4A3] shadow-md" : "hover:shadow-sm"
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700">{index + 1}</span>
                  {/* <ProgressiveStringPreview
                    sequence={v.sequence}
                    totalPins={240}
                    size={80}
                    strokeColor="#888"
                    strokeWidth={0.2}
                    progressLen={progress[v.id] ?? 0}
                  /> */}
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
  const SIZE = imageData.width;
  const data = imageData.data;
  const RADIUS = SIZE / 2 - 10;
  const cx = SIZE / 2, cy = SIZE / 2;
  const N = totalPins;

  // Convert to grayscale and create darkness map with brightness/contrast adjustment
  const grayBuffer = new Float32Array(SIZE * SIZE);
  const R2 = RADIUS * RADIUS;
  const BRIGHTNESS = 0.1;  // Increase to make overall brighter (0.0 = normal, 0.2 = much brighter)
  const CONTRAST = 1.3;     // Increase to make more contrast (1.0 = normal, 1.5 = high contrast)
  
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= R2) {
        const i = (y * SIZE + x) * 4;
        const g = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
        
        // Apply brightness and contrast adjustments
        let adjusted = g + BRIGHTNESS;
        adjusted = (adjusted - 0.5) * CONTRAST + 0.5;
        adjusted = Math.max(0, Math.min(1, adjusted));
        
        grayBuffer[y * SIZE + x] = 1.0 - adjusted;
      }
    }
  }

  // Generate pins
  const pinsX = new Float32Array(N);
  const pinsY = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = 2 * Math.PI * i / N;
    pinsX[i] = cx + RADIUS * Math.cos(a);
    pinsY[i] = cy + RADIUS * Math.sin(a);
  }

  // Bresenham line algorithm
  function bresenham(x0: number, y0: number, x1: number, y1: number): Int32Array {
    x0 = Math.round(x0); y0 = Math.round(y0);
    x1 = Math.round(x1); y1 = Math.round(y1);
    const pts: number[] = [];
    let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    for (;;) {
      if (x0 >= 0 && x0 < SIZE && y0 >= 0 && y0 < SIZE) {
        const dx = x0 - cx, dy = y0 - cy;
        if (dx * dx + dy * dy <= R2) pts.push(y0 * SIZE + x0);
      }
      if (x0 === x1 && y0 === y1) break;
      const e2 = err << 1;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    return new Int32Array(pts);
  }

  // Precompute all lines
  const lines = new Array(N * N);
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      lines[i * N + j] = bresenham(pinsX[i], pinsY[i], pinsX[j], pinsY[j]);
    }
  }

  function getLine(a: number, b: number): Int32Array {
    return a < b ? lines[a * N + b] : lines[b * N + a];
  }

  // Generate sequence using greedy algorithm
  const img = new Float32Array(grayBuffer);
  const WEIGHT = 0.18;
  const MIN_DIST = 20;
  const SKIP = 20;
  const seq = new Array(totalLines + 1);
  seq[0] = seed % N;
  let cur = seq[0];
  const recentArr = new Array(SKIP).fill(-1);
  const recentSet = new Set();
  let rHead = 0;

  sequenceOut.length = 0;

  for (let step = 0; step < totalLines; step++) {
    let bestScore = -1, bestPin = -1;
    for (let j = 0; j < N; j++) {
      if (j === cur || recentSet.has(j)) continue;
      const dist = Math.min(Math.abs(j - cur), N - Math.abs(j - cur));
      if (dist < MIN_DIST) continue;
      const line = getLine(cur, j);
      const len = line.length;
      if (len === 0) continue;
      let score = 0;
      for (let k = 0; k < len; k++) score += img[line[k]];
      score /= len;
      if (score > bestScore) { bestScore = score; bestPin = j; }
    }
    if (bestPin === -1) bestPin = (cur + (N >> 1)) % N;
    const line = getLine(cur, bestPin);
    for (let k = 0; k < line.length; k++) img[line[k]] = Math.max(0, img[line[k]] - WEIGHT);
    seq[step + 1] = bestPin;
    const evict = recentArr[rHead];
    if (evict !== -1) recentSet.delete(evict);
    recentArr[rHead] = cur;
    recentSet.add(cur);
    rHead = (rHead + 1) % SKIP;
    cur = bestPin;

    sequenceOut.push(cur);
    
    if (step - 0 >= 1 || step === totalLines - 1) {
      onLine(sequenceOut.length - 1);
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    }
  }

  sequenceOut.push(cur);
  onLine(sequenceOut.length - 1);
}
