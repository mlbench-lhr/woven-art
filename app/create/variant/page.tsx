"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function SelectVariantPage() {
  const router = useRouter();
  const variants = [
    { id: "r1", label: "R", src: "/auth image 1.png" },
    { id: "r2", label: "R", src: "/auth image 1.png" },
    { id: "j", label: "J", src: "/auth image 1.png" },
  ];
  const [selected, setSelected] = useState(variants[0].id);

  const current = variants.find((v) => v.id === selected) || variants[0];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[800px] mx-auto px-6 py-12 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#171d1a] text-center">
            Select Variant
          </h1>

          <div className="mt-10 w-full flex justify-center">
            <div className="relative w-[360px] h-[360px] rounded-full overflow-hidden">
              <Image
                src={current.src}
                alt="Selected variant preview"
                fill
                sizes="(max-width: 768px) 80vw, 360px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-6">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSelected(v.id);
                  router.push(`/create/artwork?variant=${encodeURIComponent(v.id)}`);
                }}
                className={[
                  "relative w-[80px] h-[80px] rounded-full overflow-hidden border transition-all",
                  selected === v.id ? "border-[#C5B4A3] shadow" : "border-gray-300 hover:border-[#C5B4A3]",
                ].join(" ")}
                aria-label={`Select variant ${v.label}`}
              >
                <Image
                  src={v.src}
                  alt={`Variant ${v.label}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
                <span className="absolute -top-2 -right-2 bg-[#F24E1E] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                  {v.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/create")}>
              Back
            </Button>
            <Button
              className="opp-button-4"
              onClick={() => router.push(`/create/artwork?variant=${encodeURIComponent(selected)}`)}
            >
              Create Artwork
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
