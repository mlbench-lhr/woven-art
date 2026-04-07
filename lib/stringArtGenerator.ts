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

  // --- 1. LIGHTNESS
  const pixels = new Float32Array(size * size)
  for (let i = 0; i < size * size; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    pixels[i] = 0.299 * r + 0.587 * g + 0.114 * b
  }

  const working = new Float32Array(pixels)

  // --- 2. PINS
  const pins: Pin[] = []
  const center = size / 2
  const radius = size / 2 - 1

  for (let i = 0; i < totalPins; i++) {
    const angle = (2 * Math.PI * i) / totalPins
    pins.push({
      x: Math.round(center + radius * Math.cos(angle)),
      y: Math.round(center + radius * Math.sin(angle))
    })
  }

  // --- 3. LINE RASTER
  function linePixels(p1: Pin, p2: Pin): number[] {
    const pts: number[] = []
    let x0 = p1.x, y0 = p1.y
    let x1 = p2.x, y1 = p2.y

    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx - dy

    while (true) {
      pts.push(y0 * size + x0)
      if (x0 === x1 && y0 === y1) break
      const e2 = err * 2
      if (e2 > -dy) { err -= dy; x0 += sx }
      if (e2 < dx) { err += dx; y0 += sy }
    }

    return pts
  }

  const cache = new Map<string, number[]>()

  function getLine(i: number, j: number): number[] {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`
    if (!cache.has(key)) {
      cache.set(key, linePixels(pins[i], pins[j]))
    }
    return cache.get(key)!
  }

  // --- 4. GENERATION
  const sequence: number[] = []
  let current = seed % totalPins

  const MIN_DIST = 15
  const MAX_BRIGHTNESS = 255

  for (let step = 0; step < totalLines; step++) {
    sequence.push(current)

    let bestPin = -1
    let bestScore = -Infinity
    let bestLine: number[] | null = null

    for (let i = 0; i < totalPins; i++) {
      if (i === current) continue

      const dist = Math.abs(i - current)
      if (dist < MIN_DIST || dist > totalPins - MIN_DIST) continue

      const line = getLine(current, i)

      let score = 0
      for (const idx of line) {
        score += (MAX_BRIGHTNESS - working[idx])
      }

      score /= line.length

      if (score > bestScore) {
        bestScore = score
        bestPin = i
        bestLine = line
      }
    }

    if (bestPin === -1 || !bestLine) {
      bestPin = (current + totalPins / 2) % totalPins
      bestLine = getLine(current, bestPin)
    }

    const weight = 12 + (step / totalLines) * 20

    for (const idx of bestLine) {
      working[idx] = Math.min(
        MAX_BRIGHTNESS,
        working[idx] + weight
      )
    }

    current = bestPin
  }

  return sequence
}