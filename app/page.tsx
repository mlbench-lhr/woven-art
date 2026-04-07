"use client";
import Image from "next/image";
import UploadImageGuideModal from "@/components/SmallComponents/UploadImageGuideModal";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-6 lg:py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl lg:text-5xl font-semibold text-[#171d1a]">
              Transform Photos into
              <br />
              String Art
            </h1>
            <div className="mt-2 h-[10px] w-[240px] border-b-2 border-dotted border-[#C5B4A3]"></div>
            <p className="mt-6 plan-text-style-3 text-[#51606e]">
              Create stunning string art designs in a few clicks
            </p>
            <div className="mt-8">
              <UploadImageGuideModal
                triggerComponent={() => (
                  <Button className="opp-button-4">Start Creating</Button>
                )}
              />
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="relative w-[420px] h-[420px] lg:w-[520px] lg:h-[520px]">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <Image
                  src="/auth image 1.png"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 80vw, 520px"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <Image
                  src="/auth image 1.png"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 80vw, 520px"
                  className="object-cover"
                  style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)", filter: "grayscale(100%) contrast(120%)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
