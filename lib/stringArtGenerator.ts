import { ImageData } from "canvas"

type GenerateStringArtParams = {
  imageData: ImageData
  totalPins?: number
  totalLines?: number
  seed?: number
  onLine?: (progressLen: number) => void
}

/**
 * Creates a mirrored sequence for wall hanging
 * When the string art is hung on a wall, it needs to be mirrored horizontally
 * to appear correct when viewed from the front
 */
export function createMirroredSequence(sequence: number[], totalPins: number): number[] {
  const mirrored = [...sequence];
  for (let i = 1; i < mirrored.length; i++) {
    // Mirror the pin index across the vertical axis
    // Pin 0 stays 0, Pin 1 becomes totalPins-1, Pin 2 becomes totalPins-2, etc.
    mirrored[i] = (totalPins - mirrored[i]) % totalPins;
  }
  return mirrored;
}

/**
 * Creates the original sequence from a mirrored sequence
 * Used for displaying the correct preview in dashboard when database contains mirrored sequence
 */
export function createOriginalSequenceFromMirrored(mirroredSequence: number[], totalPins: number): number[] {
  const original = [...mirroredSequence];
  for (let i = 1; i < original.length; i++) {
    // Reverse the mirror operation
    // Pin 0 stays 0, Pin totalPins-1 becomes 1, Pin totalPins-2 becomes 2, etc.
    original[i] = (totalPins - original[i]) % totalPins;
  }
  return original;
}

export async function generateStringArt({
  imageData,
  totalPins = 240,
  totalLines = 3300,
  seed = 0,
  onLine
}: GenerateStringArtParams): Promise<number[]> {
  const SIZE = imageData.width
  const data = imageData.data
  const RADIUS = SIZE / 2 - 2
  const cx = SIZE / 2, cy = SIZE / 2
  const N = totalPins
  const SKIP = 20
  const LINE_DARKNESS = 25

  // Convert to grayscale
  const buf = new Float32Array(SIZE * SIZE)
  for (let i = 0; i < SIZE * SIZE; i++) {
    buf[i] = 0.299 * data[i*4] + 0.587 * data[i*4+1] + 0.114 * data[i*4+2]
  }

  // Histogram stretch
  let mn = 255, mx = 0
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] < mn) mn = buf[i]
    if (buf[i] > mx) mx = buf[i]
  }
  const range = mx - mn || 1
  for (let i = 0; i < buf.length; i++) {
    buf[i] = (buf[i] - mn) / range * 255
  }

  // Mild Gaussian blur (radius 1, approx with box)
  const blurred = new Float32Array(SIZE * SIZE)
  const kernel = [1,2,1,2,4,2,1,2,1]
  const kw = 3
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let sum = 0, weight = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const ny = y + ky, nx = x + kx
          if (ny >= 0 && ny < SIZE && nx >= 0 && nx < SIZE) {
            const w = kernel[(ky+1)*3+(kx+1)]
            sum += buf[ny*SIZE+nx] * w
            weight += w
          }
        }
      }
      blurred[y*SIZE+x] = sum / weight
    }
  }

  // Invert & mask circle
  const r = RADIUS
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - cx, dy = y - cy
      if (dx*dx + dy*dy > r*r) {
        blurred[y*SIZE+x] = 0
      } else {
        blurred[y*SIZE+x] = 255 - blurred[y*SIZE+x]
      }
    }
  }

  // Generate pins (starting from -PI/2 to start at top)
  const pinsX = new Float32Array(N)
  const pinsY = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const angle = (2 * Math.PI * i) / N - Math.PI / 2
    pinsX[i] = cx + r * Math.cos(angle)
    pinsY[i] = cy + r * Math.sin(angle)
  }

  // Bresenham line algorithm
  function linePixels(x0: number, y0: number, x1: number, y1: number): Int32Array {
    const pixels: number[] = []
    x0 = Math.round(x0); y0 = Math.round(y0)
    x1 = Math.round(x1); y1 = Math.round(y1)
    let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0)
    let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
    let err = dx - dy
    while (true) {
      if (x0 >= 0 && x0 < SIZE && y0 >= 0 && y0 < SIZE) {
        pixels.push(y0 * SIZE + x0)
      }
      if (x0 === x1 && y0 === y1) break
      const e2 = 2 * err
      if (e2 > -dy) { err -= dy; x0 += sx }
      if (e2 < dx) { err += dx; y0 += sy }
    }
    return new Int32Array(pixels)
  }

  // Precompute all line pixel lists
  const lines: { [key: string]: Int32Array } = {}
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      lines[`${i}_${j}`] = linePixels(pinsX[i], pinsY[i], pinsX[j], pinsY[j])
    }
  }

  function lineKey(a: number, b: number): string {
    return a < b ? `${a}_${b}` : `${b}_${a}`
  }

  // Generate sequence using greedy algorithm
  const img = new Float32Array(blurred)
  const seq = new Array(totalLines + 1)
  seq[0] = seed % N
  let cur = seq[0]

  for (let step = 0; step < totalLines; step++) {
    let bestScore = -1, bestPin = -1
    for (let j = 0; j < N; j++) {
      // skip nearby pins
      const dist = Math.min(Math.abs(j - cur), N - Math.abs(j - cur))
      if (dist < SKIP) continue
      const key = lineKey(cur, j)
      const pixels = lines[key]
      if (!pixels) continue
      let score = 0
      for (let p = 0; p < pixels.length; p++) {
        score += img[pixels[p]]
      }
      if (score > bestScore) {
        bestScore = score
        bestPin = j
      }
    }
    if (bestPin === -1) continue
    // Subtract darkness
    const key = lineKey(cur, bestPin)
    const pixels = lines[key]
    for (let p = 0; p < pixels.length; p++) {
      img[pixels[p]] = Math.max(0, img[pixels[p]] - LINE_DARKNESS)
    }
    seq[step + 1] = bestPin
    cur = bestPin
    if (onLine && (step & 127) === 0) onLine(step)
  }

  return seq
}
