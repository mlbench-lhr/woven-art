"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useVariants } from "@/app/Context/VariantsContext";
import UploadImageGuideModal from "@/components/SmallComponents/UploadImageGuideModal";

export default function CreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { setVariants } = useVariants();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleNext = async () => {
    if (!preview) return;
    try {
      sessionStorage.setItem("stringArtPreview", preview);
    } catch {}
    setVariants([] as any);
    router.push("/create/variant");

  };


  return (
    <div className="min-h-screen flex flex-col bg-white">
      <UploadImageGuideModal autoOpen />
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

// Generation moved to /create/variant for progressive preview.
