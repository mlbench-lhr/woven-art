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

export function generateStringArt({
  imageData,
  totalPins = 240,
  totalLines = 3000,
  seed = 0
}: GenerateStringArtParams): number[] {
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
  const sequence: number[] = []
  let current = seed % totalPins
  const MIN_DIST = 20
  const recent: number[] = []
  const RECENT_WIN = 3

  for (let step = 0; step < totalLines; step++) {
    sequence.push(current)

    let bestPin = -1
    let bestScore = -Infinity

    for (let c = 0; c < totalPins; c++) {
      if (c === current) continue
      const d = Math.min(Math.abs(c - current), totalPins - Math.abs(c - current))
      if (d < MIN_DIST) continue
      if (recent.indexOf(c) !== -1) continue

      const line = lineCache[pid(current, c)]
      const len = line.length
      if (len === 0) continue

      // Average remaining darkness — negative values penalize over-drawn areas
      let score = 0
      for (let p = 0; p < len; p++) score += working[line[p]]
      score /= len

      if (score > bestScore) {
        bestScore = score
        bestPin = c
      }
    }

    if (bestPin === -1) {
      bestPin = (current + Math.floor(totalPins / 2)) % totalPins
    }

    // Subtract along chosen line (NO clamping — negative = over-exposed penalty)
    const chosen = lineCache[pid(current, bestPin)]
    for (let p = 0; p < chosen.length; p++) {
      working[chosen[p]] -= lineWeight
    }

    recent.push(current)
    if (recent.length > RECENT_WIN) recent.shift()
    current = bestPin
  }

  sequence.push(current)
  return sequence
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
