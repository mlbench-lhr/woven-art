"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, MoveHorizontal } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let x = 0;

    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
    } else {
      x = e.clientX - rect.left;
    }

    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(position);
  };

  useEffect(() => {
    const up = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", up);
    };
  }, [isDragging]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-6 lg:py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-semibold text-[#171d1a]">
              Transform Photos into
              <Image
                src="/SVG.png"
                alt="SVG"
                width={0}
                height={0}
                sizes="100vw"
                className="w-auto h-auto object-cover"
              />
              String Art
            </h1>
            <p className="mt-6 plan-text-style-3 text-[#51606e]">
              Start stringing and bring your art to life
            </p>
            <div className="mt-8">
              <Button className="rounded-full" onClick={() => router.push("/create")}>
                <span className="ml-2">Start Creating</span><ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center select-none">
            <div 
              ref={containerRef}
              className="relative w-[360px] h-[360px] md:w-[480px] md:h-[480px] rounded-full overflow-hidden shadow-2xl border-4 border-white"
              style={{ cursor: isDragging ? "grabbing" as const : "grab" as const }}
              onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
              onTouchStart={(e) => { e.preventDefault(); setIsDragging(true); }}
            >
              {/* Original Image (Left Side) */}
              <div className="absolute inset-0">
                <Image
                  src="/home-page.png"
                  alt="Original"
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* String Art Image (Right Side Overlay) */}
              <div 
                className="absolute inset-0 z-10"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
              >
                <Image
                  src="/cropped_circle_image.png"
                  alt="String Art"
                  fill
                  priority
                  className="object-cover grayscale contrast-125"
                  style={{ 
                    filter: "grayscale(100%) contrast(150%) brightness(90%)",
                  }}
                />
                {/* Simulated string art effect - overlaying a fine grid or pattern could go here */}
                <div className="absolute inset-0 bg-black/5 pointer-events-none" />
              </div>

              {/* Slider Handle Line */}
              <div 
                className="absolute top-0 bottom-0 z-20 w-1 bg-white"
                style={{ left: `${sliderPos}%` }}
              />

              {/* Hand Slider Handle */}
              <div 
                className="absolute z-30 transition-transform duration-75 pointer-events-auto"
                style={{ 
                  left: `${sliderPos}%`,
                  top: "50%",
                  transform: `translate(-50%, -50%) ${isDragging ? "scale(0.9)" : "scale(1)"}`,
                }}
                onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
                onTouchStart={(e) => { e.preventDefault(); setIsDragging(true); }}
              >
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-xl border-2 border-gray-100 flex items-center justify-center">
                  <div className="relative w-6 h-6 md:w-7 md:h-7">
                    <Image
                      src="/hand.png"
                      alt="Drag handle"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Interaction Hint */}
              {sliderPos === 50 && !isDragging && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 bg-black/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm animate-pulse pointer-events-none">
                  Slide to compare
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
