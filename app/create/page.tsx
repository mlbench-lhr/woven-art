"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useVariants } from "@/app/Context/VariantsContext";
import { generateStringArt } from "@/lib/stringArtGenerator"; // existing function

export default function CreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { setVariants } = useVariants();
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleNext = async () => {
    if (!preview) return;
    setLoading(true);


    // Prepare cropped ImageData
    try {
      const imageData = await prepareImage(preview, 360);
      const TOTAL_PINS = 240;

      const variants = [
        runVariant(imageData, 2700, 0, "v1", TOTAL_PINS),
        runVariant(imageData, 3300, 61, "v2", TOTAL_PINS),
        runVariant(imageData, 3500, 137, "v3", TOTAL_PINS),
      ];

      setVariants(variants);
      router.push("/create/variant");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

  };


  return (
    <div className="min-h-screen flex flex-col bg-white">
      {
        loading && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="w-24 h-24 border-4 border-gray-300 border-t-[#C5B4A3] rounded-full animate-spin" />
          </div>
        )
      }
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[800px] mx-auto px-6 py-12 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#171d1a] text-center">
            Upload Your Photo
          </h1>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-10 w-[360px] h-[360px] border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer overflow-hidden"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center px-6">
                <p className="font-medium text-gray-700">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG or GIF (min 150×150)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
          </div>

          <div className="mt-8 flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back
            </Button>
            <Button className="opp-button-4" onClick={handleNext} disabled={!preview}>
              Next
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ----- helper functions -----
async function prepareImage(src: string, size = 360): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context not available");

      // Center crop
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

function runVariant(
  imageData: ImageData,
  lines: number,
  seed: number,
  id: string,
  totalPins: number
) {
  const sequence = generateStringArt({ imageData, totalPins, totalLines: lines, seed });
  return { id, lines, seed, sequence };
}