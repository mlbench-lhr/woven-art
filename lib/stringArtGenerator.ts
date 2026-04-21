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
  onLine?: (progressLen: number) => void
}

export async function generateStringArt({
  imageData,
  totalPins = 240,
  totalLines = 3700,
  seed = 0,
  onLine
}: GenerateStringArtParams): Promise<number[]> {
  const SIZE = imageData.width
  const data = imageData.data
  const RADIUS = SIZE / 2 - 10
  const cx = SIZE / 2, cy = SIZE / 2
  const N = totalPins

  // Convert to grayscale and create darkness map with brightness/contrast adjustment
  const grayBuffer = new Float32Array(SIZE * SIZE)
  const R2 = RADIUS * RADIUS
  const BRIGHTNESS = 0.1  // Increase to make overall brighter (0.0 = normal, 0.2 = much brighter)
  const CONTRAST = 1.3     // Increase to make more contrast (1.0 = normal, 1.5 = high contrast)
  
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - cx, dy = y - cy
      if (dx * dx + dy * dy <= R2) {
        const i = (y * SIZE + x) * 4
        const g = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255
        
        // Apply brightness and contrast adjustments
        let adjusted = g + BRIGHTNESS
        adjusted = (adjusted - 0.5) * CONTRAST + 0.5
        adjusted = Math.max(0, Math.min(1, adjusted))
        
        grayBuffer[y * SIZE + x] = 1.0 - adjusted
      }
    }
  }

  // Generate pins
  const pinsX = new Float32Array(N)
  const pinsY = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const a = 2 * Math.PI * i / N
    pinsX[i] = cx + RADIUS * Math.cos(a)
    pinsY[i] = cy + RADIUS * Math.sin(a)
  }

  // Bresenham line algorithm
  function bresenham(x0: number, y0: number, x1: number, y1: number): Int32Array {
    x0 = Math.round(x0); y0 = Math.round(y0)
    x1 = Math.round(x1); y1 = Math.round(y1)
    const pts: number[] = []
    let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0)
    let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
    let err = dx - dy
    for (;;) {
      if (x0 >= 0 && x0 < SIZE && y0 >= 0 && y0 < SIZE) {
        const dx = x0 - cx, dy = y0 - cy
        if (dx * dx + dy * dy <= R2) pts.push(y0 * SIZE + x0)
      }
      if (x0 === x1 && y0 === y1) break
      const e2 = err << 1
      if (e2 > -dy) { err -= dy; x0 += sx }
      if (e2 < dx) { err += dx; y0 += sy }
    }
    return new Int32Array(pts)
  }

  // Precompute all lines
  const lines = new Array(N * N)
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      lines[i * N + j] = bresenham(pinsX[i], pinsY[i], pinsX[j], pinsY[j])
    }
  }

  function getLine(a: number, b: number): Int32Array {
    return a < b ? lines[a * N + b] : lines[b * N + a]
  }

  // Generate sequence using greedy algorithm
  const img = new Float32Array(grayBuffer)
  const WEIGHT = 0.18
  const MIN_DIST = 20
  const SKIP = 20
  const seq = new Array(totalLines + 1)
  seq[0] = seed % N
  let cur = seq[0]
  const recentArr = new Array(SKIP).fill(-1)
  const recentSet = new Set()
  let rHead = 0

  for (let step = 0; step < totalLines; step++) {
    let bestScore = -1, bestPin = -1
    for (let j = 0; j < N; j++) {
      if (j === cur || recentSet.has(j)) continue
      const dist = Math.min(Math.abs(j - cur), N - Math.abs(j - cur))
      if (dist < MIN_DIST) continue
      const line = getLine(cur, j)
      const len = line.length
      if (len === 0) continue
      let score = 0
      for (let k = 0; k < len; k++) score += img[line[k]]
      score /= len
      if (score > bestScore) { bestScore = score; bestPin = j }
    }
    if (bestPin === -1) bestPin = (cur + (N >> 1)) % N
    const line = getLine(cur, bestPin)
    for (let k = 0; k < line.length; k++) img[line[k]] = Math.max(0, img[line[k]] - WEIGHT)
    seq[step + 1] = bestPin
    const evict = recentArr[rHead]
    if (evict !== -1) recentSet.delete(evict)
    recentArr[rHead] = cur
    recentSet.add(cur)
    rHead = (rHead + 1) % SKIP
    cur = bestPin
    if (onLine && (step & 127) === 0) onLine(step)
  }

  return seq
}
