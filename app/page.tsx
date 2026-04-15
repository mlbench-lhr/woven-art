"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

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
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-serif font-normal text-[#1a1a1a] leading-tight max-w-2xl">
          Turn your memories into{" "}
          <span className="whitespace-nowrap">Woven-Art</span>.
        </h1>

        {/* Underline image — natural size using width/height that match the PNG's own aspect ratio */}
        <div className="mb-8">
          <Image
            src="home_page_images/under-line.png"
            alt="underline"
            width={320}
            height={40}
            className="mx-auto object-contain"
          />
        </div>

        {/* Subtitle */}
        <p className="text-lg md:text-2xl text-[#4a4a4a] mb-8">
          Premium art from the photo you choose.
        </p>

        {/* CTA Button */}
        <Button
          className="px-14 py-2 h-auto text-base font-medium bg-[#b5a49a] hover:bg-[#a5948a] text-white border-none shadow-sm mb-10"
          onClick={() => router.push("/create")}
        >
          Start creating <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        {/* Before/After Slider — square */}
        <div className="relative flex items-center justify-center select-none">
          <div
            ref={containerRef}
            className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] overflow-hidden shadow-2xl border-4 border-white cursor-grab active:cursor-grabbing"
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
          >
            {/* Original Image (Left Side) */}
            <div className="absolute inset-0">
              <Image
                src="home_page_images/20.png"
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
                src="home_page_images/21.png"
                alt="String Art"
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Slider Handle Line */}
            <div
              className="absolute top-0 bottom-0 z-20 w-[2px] bg-white shadow"
              style={{ left: `${sliderPos}%` }}
            />

            {/* Hand Slider Handle */}
            <div
              className="absolute z-30 pointer-events-none"
              style={{
                left: `${sliderPos}%`,
                top: "50%",
                transform: `translate(-50%, -50%) ${isDragging ? "scale(0.9)" : "scale(1)"}`,
                transition: "transform 0.1s ease",
              }}
            >
              <div className="w-10 h-10 bg-white rounded-full shadow-xl border-2 border-white flex items-center justify-center">
                <div className="relative w-6 h-6">
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
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 bg-black/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm animate-pulse pointer-events-none">
                Slide to compare
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}