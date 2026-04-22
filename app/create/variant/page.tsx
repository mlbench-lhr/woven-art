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
  const hasGeneratedOnce = useRef(false);

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
    // Prevent regeneration if we already have valid variants and have generated once
    if (hasGeneratedOnce.current && variants.length > 0 && 
        variants.every((v) => typeof v?.lines === "number" && Array.isArray(v?.sequence) && v.sequence.length === v.lines + 1)) {
      return;
    }

    const run = async () => {
      setGenerating(true);
      if (variants.length > 0) {
        if (variants.some((v) => typeof v?.lines !== "number" || !Array.isArray(v?.sequence) || v.sequence.length !== v.lines + 1)) {
          try {
            sessionStorage.removeItem("stringArtVariants");
          } catch { }
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
      } catch { }

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
        } catch { }
      }

      generatingRef.current = true;
      try {
        const preview = sessionStorage.getItem("stringArtPreview");
        if (!preview) {
          setGenerating(false);
          return;
        }
        const imageData = await prepareImage(preview, 400);
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
              totalPins,
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
          hasGeneratedOnce.current = true; // Mark that we've successfully generated once
        } catch { }
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
                  strokeColor="rgba(10,10,10,0.22)"
                  strokeWidth={0.85}
                  progressLen={currentProgress}
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            {variants.map((v, index) => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-white transition-shadow ${selected === v.id ? "ring-4 ring-[#C5B4A3] shadow-md" : "hover:shadow-sm"
                  }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700">{index + 1}</span>
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
                } catch { }
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

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

async function prepareImage(src: string, size = 400): Promise<ImageData> {
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

// ─────────────────────────────────────────────
//  Core algorithm — ported from string-art-sharp-240.html
//
//  Key differences vs the old version:
//   • Runs at 3× internal hi-res (SCALE=3) for razor-sharp lines
//   • Error-buffer approach (errR initialized from luminance, depleted per string)
//   • strength = 0.12  (matches the HTML default)
//   • No MIN_DIST / SKIP / recent-set — every nail is always a candidate
//   • Early-exit when best score ≤ 0 (no more dark pixels to cover)
//   • Nail positions: r = size/2 - 1 (scaled), angle = (i/N)*2π  (standard, no offset)
// ─────────────────────────────────────────────

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
  const SIZE = imageData.width;          // logical size (400 px)
  const SCALE = 3;
  const hiSize = SIZE * SCALE;           // internal hi-res size (1200 px)
  const N = totalPins;

  // ── 1. Upscale reference image to hi-res ──
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = srcCanvas.height = SIZE;
  srcCanvas.getContext("2d")!.putImageData(imageData, 0, 0);

  const refCanvas = document.createElement("canvas");
  refCanvas.width = refCanvas.height = hiSize;
  const rctx = refCanvas.getContext("2d")!;
  rctx.drawImage(srcCanvas, 0, 0, hiSize, hiSize);
  const ref = rctx.getImageData(0, 0, hiSize, hiSize).data;

  // ── 2. Error buffer (darkness remaining per pixel) ──
  const numPx = hiSize * hiSize;
  const errR = new Float32Array(numPx);
  for (let i = 0; i < numPx; i++) {
    const lum = (0.299 * ref[i * 4] + 0.587 * ref[i * 4 + 1] + 0.114 * ref[i * 4 + 2]) / 255;
    errR[i] = 1 - lum; // darkness: 1 = black, 0 = white
  }

  // ── 3. Nail positions at hi-res ──
  const nailsX = new Float32Array(N);
  const nailsY = new Float32Array(N);
  const r = hiSize / 2 - SCALE; // r = size/2-1 scaled
  const cx = hiSize / 2;
  const cy = hiSize / 2;
  for (let i = 0; i < N; i++) {
    const angle = (2 * Math.PI * i) / N;
    nailsX[i] = Math.round(cx + r * Math.cos(angle));
    nailsY[i] = Math.round(cy + r * Math.sin(angle));
  }

  // ── 4. Bresenham line pixels (hi-res coords) ──
  function linePixels(x0: number, y0: number, x1: number, y1: number): Int32Array {
    const pts: number[] = [];
    let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    for (; ;) {
      if (x0 >= 0 && x0 < hiSize && y0 >= 0 && y0 < hiSize) pts.push(y0 * hiSize + x0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = err * 2;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    return new Int32Array(pts);
  }

  // ── 5. Precompute all unique line pixel lists ──
  const lines = new Array<Int32Array>(N * N);
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      lines[i * N + j] = linePixels(nailsX[i], nailsY[i], nailsX[j], nailsY[j]);
    }
  }
  function getLine(a: number, b: number): Int32Array {
    return a < b ? lines[a * N + b] : lines[b * N + a];
  }

  // ── 6. Greedy algorithm ──
  const STRENGTH = 0.45;  // depletion per string — higher = lighter result, less over-darkening
  const MIN_LINE = 10 * SCALE; // minimum line length in hi-res pixels

  sequenceOut.length = 0;
  let cur = seed % N;
  sequenceOut.push(cur);

  const BATCH = 8; // Smaller batch for smoother time lapse effect

  for (let step = 0; step < totalLines;) {
    const chunkEnd = Math.min(step + BATCH, totalLines);

    for (let i = step; i < chunkEnd; i++) {
      // Pick best nail
      let bestScore = -Infinity;
      let bestNail = -1;

      for (let j = 0; j < N; j++) {
        if (j === cur) continue;
        const pts = getLine(cur, j);
        if (pts.length < MIN_LINE) continue;
        let score = 0;
        for (let k = 0; k < pts.length; k++) score += errR[pts[k]];
        score /= pts.length;
        if (score > bestScore) { bestScore = score; bestNail = j; }
      }

      // Early exit if no improvement possible
      if (bestNail < 0 || bestScore <= 0) {
        step = totalLines;
        break;
      }

      // Deplete error along the chosen line
      const chosen = getLine(cur, bestNail);
      for (let k = 0; k < chosen.length; k++) {
        errR[chosen[k]] = Math.max(0, errR[chosen[k]] - STRENGTH);
      }

      cur = bestNail;
      sequenceOut.push(cur);
    }

    step = Math.min(step + BATCH, totalLines);
    onLine(sequenceOut.length - 1);
    // Time lapse effect - pause between batches for visual appeal
    await new Promise<void>((resolve) => setTimeout(resolve, 50));
  }

  onLine(sequenceOut.length - 1);
}