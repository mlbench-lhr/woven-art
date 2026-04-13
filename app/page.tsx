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
          <div className="flex flex-col justify-center text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#171d1a] leading-tight">
              Transform Photos into
              <div className="inline-block mx-2 align-middle">
                <Image
                  src="/SVG.png"
                  alt="SVG"
                  width={100}
                  height={20}
                  className="w-auto h-auto"
                />
              </div>
              <br />
              String Art
            </h1>
            <p className="mt-6 text-lg text-[#51606e]">
              Create stunning string art designs in a few clicks
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Button 
                className="rounded-full px-12 py-7 h-auto text-lg opp-button-4 !rounded-full" 
                onClick={() => router.push("/create")}
              >
                Start Creating <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center select-none">
            <div 
              ref={containerRef}
              className="relative w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] md:w-[480px] md:h-[480px] rounded-full overflow-hidden shadow-2xl border-4 border-white cursor-grab active:cursor-grabbing"
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
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
                  className="object-cover"
                />
              </div>

              {/* Slider Handle Line */}
              <div 
                className="absolute top-0 bottom-0 z-20 w-1 bg-white"
                style={{ left: `${sliderPos}%` }}
              />

              {/* Hand Slider Handle */}
              <div 
                className="absolute z-30 pointer-events-none transition-transform duration-75"
                style={{ 
                  left: `${sliderPos}%`,
                  top: "50%",
                  transform: `translate(-50%, -50%) ${isDragging ? "scale(0.9)" : "scale(1)"}`,
                }}
              >
                <div className="relative w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl border-2 border-white flex items-center justify-center">
                  <div className="relative w-6 h-6 md:w-7 h-7">
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
