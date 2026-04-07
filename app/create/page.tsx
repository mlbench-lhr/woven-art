"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import UploadImageGuideModal from "@/components/SmallComponents/UploadImageGuideModal";

export default function CreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[800px] mx-auto px-6 py-12 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#171d1a] text-center">
            Upload Your Photo
          </h1>

          <div className="mt-10 w-full flex justify-center">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={[
                "w-[360px] h-[360px] rounded-lg border-2 border-dashed",
                "flex items-center justify-center text-center cursor-pointer",
                "transition-colors",
                isDragging ? "border-[#C5B4A3] bg-[#C5B4A3]/5" : "border-gray-300 hover:border-[#C5B4A3] hover:bg-gray-50",
              ].join(" ")}
            >
              <div className="px-6">
                <p className="font-medium text-gray-700">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG or GIF (min 150×150)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back
            </Button>
            <Button className="opp-button-4" onClick={() => router.push("/create/variant")}>
              Next
            </Button>
          </div>
        </div>
      </main>

      <Footer />

      <UploadImageGuideModal autoOpen />
    </div>
  );
}
