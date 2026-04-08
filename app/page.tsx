"use client";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
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
