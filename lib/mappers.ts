const PINS_PER_COLOR = 60
const COLORS = ['Green', 'Yellow', 'Red', 'Blue'] as const

type Color = typeof COLORS[number]

export function mapIndexToColor(index: number): string {
  const colorIndex = Math.floor(index / PINS_PER_COLOR)
  const pinNumber = (index % PINS_PER_COLOR) + 1
  const color = COLORS[colorIndex] ?? 'Unknown'
  return `${color}-${pinNumber}`
}

export type ColoredLine = {
  from: string
  to: string
}

export function buildColoredLines(sequence: number[]): ColoredLine[] {
  const lines: ColoredLine[] = []

  for (let i = 1; i < sequence.length; i++) {
    const from = sequence[i - 1]
    const to = sequence[i]

    // skip invalid or out-of-range pins
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= PINS_PER_COLOR * COLORS.length ||
      to >= PINS_PER_COLOR * COLORS.length
    ) {
      continue
    }

    lines.push({ from: mapIndexToColor(from), to: mapIndexToColor(to) })
  }

  return lines
}