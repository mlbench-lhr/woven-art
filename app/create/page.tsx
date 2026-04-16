"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useVariants } from "@/app/Context/VariantsContext";
import UploadImageGuideModal from "@/components/SmallComponents/UploadImageGuideModal";
import Cropper from "react-easy-crop";

export default function CreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { setVariants } = useVariants();

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL("image/jpeg");
  };

  const handleNext = async () => {
    if (!image || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      sessionStorage.setItem("stringArtPreview", croppedImage);
      sessionStorage.removeItem("stringArtVariants");
      setVariants([] as any);
      router.push("/create/variant");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <UploadImageGuideModal autoOpen />
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[800px] mx-auto px-6 py-12 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#171d1a] text-center">
            {image ? "Crop Your Photo" : "Upload Your Photo"}
          </h1>

          <div 
            className={`mt-10 w-full max-w-[360px] aspect-square relative border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden transition-colors ${
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {image ? (
              <div className="absolute inset-0">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer px-6 text-center"
              >
                <div className={`mb-4 transition-transform ${isDragOver ? "scale-110" : ""}`}>
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <p className={`font-medium ${isDragOver ? "text-blue-600" : "text-gray-700"}`}>
                  <span className="font-semibold">{isDragOver ? "Drop your image here" : "Click to upload"}</span> 
                  {!isDragOver && " or drag and drop"}
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

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-[360px]">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 px-10 rounded-xl border-gray-200"
              onClick={() => {
                if (image) {
                  setImage(null);
                } else {
                  router.push("/");
                }
              }}
            >
              Back
            </Button>
            <Button className="opp-button-4 w-full sm:w-auto h-12 px-10 rounded-xl" onClick={handleNext} disabled={!image}>
              Next Step
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
