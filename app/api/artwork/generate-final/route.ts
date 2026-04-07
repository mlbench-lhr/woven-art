import { NextRequest, NextResponse } from 'next/server'
import { generateStringArt } from '@/lib/stringArtGenerator'
import { buildColoredLines } from '@/lib/mappers'
import { StringArt } from '@/lib/mongodb/models/StringArt'
import { createCanvas, loadImage } from 'canvas'

type RequestBody = {
  userId: string
  image: string  // base64 string (data URI)
  lines: number
  seed?: number
}

const ALLOWED_LINES = [2700, 3300, 3500]
const TOTAL_PINS = 240

export async function POST(req: NextRequest) {
  let body: RequestBody

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { userId, image, lines, seed } = body

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  if (!image || typeof image !== 'string') {
    return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
  }

  if (!ALLOWED_LINES.includes(lines)) {
    return NextResponse.json({ error: 'Invalid line count' }, { status: 400 })
  }

  try {
    // Convert base64 image string to ImageData using canvas
    const img = await loadImage(image)
    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, img.width, img.height) as ImageData

    // Generate string art sequence
    const sequence = generateStringArt({
      imageData,
      totalPins: TOTAL_PINS,
      totalLines: lines,
      seed
    })

    if (!Array.isArray(sequence) || sequence.length === 0) {
      return NextResponse.json({ error: 'Failed to generate sequence' }, { status: 500 })
    }

    const coloredLines = buildColoredLines(sequence)

    // Save final sequence to MongoDB
    const newArt = await StringArt.create({
      userId,
      totalPins: TOTAL_PINS,
      totalLines: lines,
      finalSequence: sequence
    })

    return NextResponse.json({
      meta: { totalPins: TOTAL_PINS, totalLines: lines },
      lines: coloredLines,
      artId: newArt._id
    })
  } catch (err) {
    console.error('String art generation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}