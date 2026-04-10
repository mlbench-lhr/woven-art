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

          <div className="mt-10 w-full max-w-[360px] aspect-square relative border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
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
