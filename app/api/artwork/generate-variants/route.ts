import { NextRequest, NextResponse } from 'next/server';
import { generateStringArt } from '@/lib/stringArtGenerator';
import { createCanvas, loadImage } from "canvas";

type RequestBody = {
  image: string; // base64 string
};

type Variant = {
  id: string;
  lines: number;
  seed: number;
  sequence: number[];
};

const TOTAL_PINS = 240;

export async function POST(req: NextRequest) {
  let body: RequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { image } = body;

  if (!image || typeof image !== 'string') {
    return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
  }

  try {
    // convert base64 to ImageData
    const imageData = await base64ToImageData(image);

    const variants: Variant[] = [
      await runVariant(imageData, 2700, 0, 'v1'),
      await runVariant(imageData, 3300, 61, 'v2'),
      await runVariant(imageData, 3500, 137, 'v3')
    ];

    return NextResponse.json({ variants });
  } catch (err) {
    console.error('Variant generation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function base64ToImageData(base64: string): Promise<ImageData> {
  const img = await loadImage(base64);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

async function runVariant(
  imageData: ImageData,
  lines: number,
  seed: number,
  id: string
): Promise<Variant> {
  const sequence = generateStringArt({
    imageData,
    totalPins: TOTAL_PINS,
    totalLines: lines,
    seed
  });

  if (!Array.isArray(sequence) || sequence.length === 0) {
    throw new Error(`Failed to generate sequence for ${id}`);
  }

  return { id, lines, seed, sequence };
}