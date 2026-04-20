import { ImageData } from "canvas"

type Pin = {
  x: number
  y: number
}

type GenerateStringArtParams = {
  imageData: ImageData
  totalPins?: number
  totalLines?: number
  seed?: number
}

export async function generateStringArt({
  imageData,
  totalPins = 240,
  totalLines = 3000,
  seed = 0,
  onLine
}: GenerateStringArtParams & { onLine?: (progressLen: number) => void }): Promise<number[]> {
  const size = imageData.width
  const data = imageData.data
  const N = size * size

  // --- 1. GRAYSCALE (Rec. 709 luminance)
  const gray = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    gray[i] = 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]
  }

  // --- 2. Light Gaussian blur for noise reduction (σ=0.8)
  const smoothed = gaussianBlur(gray, size, 0.8)

  // --- 3. Unsharp mask for edge enhancement
  const coarseBlur = gaussianBlur(gray, size, 3.0)
  const enhanced = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    enhanced[i] = Math.max(0, Math.min(255,
      smoothed[i] + 0.6 * (smoothed[i] - coarseBlur[i])
    ))
  }

  // --- 4. CIRCLE GEOMETRY
  const center = size / 2
  const radius = size / 2 - 1
  const rSq = radius * radius

  // --- 5. Circular-masked contrast stretch (0.5%–99.5%)
  const cvals: number[] = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center, dy = y - center
      if (dx * dx + dy * dy <= rSq) cvals.push(enhanced[y * size + x])
    }
  }
  cvals.sort((a, b) => a - b)
  const pLo = cvals[Math.floor(cvals.length * 0.005)]
  const pHi = cvals[Math.floor(cvals.length * 0.995)]
  const rng = Math.max(pHi - pLo, 1)

  // --- 6. DARKNESS MAP (255 = black = needs lines, 0 = white = no lines needed)
  const GAMMA = 2.0
  const darkness = new Float32Array(N)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x
      const dx = x - center, dy = y - center
      if (dx * dx + dy * dy > rSq) { darkness[i] = 0; continue }
      let v = (enhanced[i] - pLo) / rng
      v = Math.max(0, Math.min(1, v))
      v = Math.pow(v, GAMMA)
      darkness[i] = (1 - v) * 255
    }
  }

  // Working copy — ALLOWED to go negative (penalty for over-drawing)
  const working = new Float32Array(darkness)

  // --- 7. PINS on circle
  const pins: Pin[] = []
  for (let i = 0; i < totalPins; i++) {
    const a = (2 * Math.PI * i) / totalPins
    pins.push({
      x: Math.round(center + radius * Math.cos(a)),
      y: Math.round(center + radius * Math.sin(a))
    })
  }

  // --- 8. PRECOMPUTE BRESENHAM LINES (circle-filtered)
  function bresenham(p1: Pin, p2: Pin): Int32Array {
    const pts: number[] = []
    let x0 = p1.x, y0 = p1.y
    const x1 = p2.x, y1 = p2.y
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
    let err = dx - dy
    while (true) {
      if (x0 >= 0 && x0 < size && y0 >= 0 && y0 < size) {
        const ddx = x0 - center, ddy = y0 - center
        if (ddx * ddx + ddy * ddy <= rSq) pts.push(y0 * size + x0)
      }
      if (x0 === x1 && y0 === y1) break
      const e2 = err * 2
      if (e2 > -dy) { err -= dy; x0 += sx }
      if (e2 < dx) { err += dx; y0 += sy }
    }
    return new Int32Array(pts)
  }

  const pairCount = (totalPins * (totalPins - 1)) / 2
  const lineCache: Int32Array[] = new Array(pairCount)

  function pid(a: number, b: number): number {
    const lo = a < b ? a : b, hi = a < b ? b : a
    return (lo * (2 * totalPins - lo - 1)) / 2 + (hi - lo - 1)
  }

  for (let i = 0; i < totalPins; i++) {
    for (let j = i + 1; j < totalPins; j++) {
      lineCache[pid(i, j)] = bresenham(pins[i], pins[j])
    }
  }

  // --- 9. AUTO-CALIBRATE LINE WEIGHT
  let totalDark = 0
  for (let i = 0; i < N; i++) totalDark += darkness[i]

  let avgLen = 0
  const sampleN = Math.min(500, pairCount)
  for (let s = 0; s < sampleN; s++) {
    avgLen += lineCache[Math.floor(s * pairCount / sampleN)].length
  }
  avgLen /= sampleN

  // weight * totalLines * avgLen ≈ totalDark
  let lineWeight = totalDark / (totalLines * avgLen)
  lineWeight = Math.max(10, Math.min(80, lineWeight))

  // --- 10. GREEDY SELECTION (penalty scoring — negative working repels lines)
  const sequenceOut: number[] = [];
  let current = seed % totalPins;
  const MIN_DIST = 15;
  const MAX_BRIGHTNESS = 255;

  // Helper function to get cached line
  function getLine(a: number, b: number): Int32Array {
    return lineCache[pid(a, b)];
  }

  let lastReport = 0;
  for (let step = 0; step < totalLines; step++) {
    // Store original current for internal calculations
    sequenceOut.push(totalPins - 1 - current);

    let bestPin = -1;
    let bestScore = -Infinity;
    let bestLine: Int32Array | null = null;

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
    if (bestLine) {
      for (const idx of bestLine) {
        const v = working[idx] + weight;
        working[idx] = v > MAX_BRIGHTNESS ? MAX_BRIGHTNESS : v;
      }
    }

    // Store the mirrored position for the next iteration
    current = bestPin;
    if (step - lastReport >= 1 || step === totalLines - 1) {
      lastReport = step;
      if (onLine) onLine(sequenceOut.length - 1);
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    }
  }

  sequenceOut.push(totalPins - 1 - current);
  return sequenceOut
}

// --- SEPARABLE GAUSSIAN BLUR ---
function gaussianBlur(input: Float32Array, size: number, sigma: number): Float32Array {
  const ks = Math.ceil(sigma * 3) * 2 + 1
  const half = Math.floor(ks / 2)
  const kernel = new Float32Array(ks)
  let sum = 0
  for (let i = 0; i < ks; i++) {
    const x = i - half
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma))
    sum += kernel[i]
  }
  for (let i = 0; i < ks; i++) kernel[i] /= sum

  const temp = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    const row = y * size
    for (let x = 0; x < size; x++) {
      let val = 0
      for (let k = 0; k < ks; k++) {
        const xx = Math.min(size - 1, Math.max(0, x + k - half))
        val += input[row + xx] * kernel[k]
      }
      temp[row + x] = val
    }
  }

  const output = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let val = 0
      for (let k = 0; k < ks; k++) {
        const yy = Math.min(size - 1, Math.max(0, y + k - half))
        val += temp[yy * size + x] * kernel[k]
      }
      output[y * size + x] = val
    }
  }
  return output
}
