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
  const base = new Uint8Array(size * size)
  for (let i = 0; i < size * size; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    base[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
  }
  const blurH = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const x0 = x > 0 ? x - 1 : 0
      const x1 = x
      const x2 = x + 1 < size ? x + 1 : size - 1
      const idx = y * size
      blurH[idx + x] = (base[idx + x0] + base[idx + x1] + base[idx + x2]) / 3
    }
  }
  const blurred = new Uint8Array(size * size)
  for (let y = 0; y < size; y++) {
    const y0 = y > 0 ? y - 1 : 0
    const y1 = y
    const y2 = y + 1 < size ? y + 1 : size - 1
    for (let x = 0; x < size; x++) {
      const v = (blurH[y0 * size + x] + blurH[y1 * size + x] + blurH[y2 * size + x]) / 3
      blurred[y * size + x] = Math.round(v)
    }
  }
  const hist = new Uint32Array(256)
  for (let i = 0; i < blurred.length; i++) hist[blurred[i]]++
  const total = size * size
  const lowCount = Math.floor(total * 0.02)
  const highCount = Math.floor(total * 0.98)
  let acc = 0
  let pLow = 0
  for (let i = 0; i < 256; i++) {
    acc += hist[i]
    if (acc >= lowCount) { pLow = i; break }
  }
  acc = 0
  let pHigh = 255
  for (let i = 0; i < 256; i++) {
    acc += hist[i]
    if (acc >= highCount) { pHigh = i; break }
  }
  if (pHigh <= pLow) { pLow = 0; pHigh = 255 }
  const range = pHigh - pLow
  const gamma = 0.9
  for (let i = 0; i < pixels.length; i++) {
    let v = (blurred[i] - pLow) / range
    if (v < 0) v = 0
    else if (v > 1) v = 1
    v = Math.pow(v, gamma)
    pixels[i] = Math.round(v * 255)
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

    const weight = 10 + (step / totalLines) * 15

    for (const idx of bestLine) {
      working[idx] = Math.min(
        MAX_BRIGHTNESS,
        working[idx] + weight
      )
    }

    current = bestPin
  }

  sequence.push(current)

  return sequence
}
