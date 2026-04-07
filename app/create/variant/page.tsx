"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import CanvasStringArt from "@/components/CanvasStringArt";
import { useVariants } from "@/app/Context/VariantsContext";
import { useRouter } from "next/navigation";

export default function SelectVariantPage() {
  const router = useRouter();
  const { variants, setVariants } = useVariants();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (variants.length > 0 && !selected) setSelected(variants[0].id);
  }, [variants, selected]);

  useEffect(() => {
    if (variants.length === 0) {
      try {
        const raw = sessionStorage.getItem("stringArtVariants");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setVariants(parsed);
        }
      } catch {}
    }
  }, [variants.length, setVariants]);

  const current = variants.find((v) => v.id === selected);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[800px] mx-auto px-6 py-12 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#171d1a] text-center">
            Select Variant
          </h1>

          {current && (
            <div className="mt-10 w-full flex justify-center">
              <CanvasStringArt
                sequence={current.sequence}
                totalPins={240}
                size={360}
                strokeColor="#bbb"
                strokeWidth={0.5}
              />
            </div>
          )}

          <div className="mt-8 flex items-center gap-6">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`relative w-[80px] h-[80px] rounded-full overflow-hidden border transition-all ${
                  selected === v.id ? "border-[#C5B4A3] shadow" : "border-gray-300 hover:border-[#C5B4A3]"
                }`}
              >
                <CanvasStringArt
                  sequence={v.sequence}
                  totalPins={240}
                  size={80}
                  strokeColor="#bbb"
                  strokeWidth={0.1}
                />
              </button>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/create")}>
              Back
            </Button>
            <Button
              className="opp-button-4"
              onClick={() => {
                try {
                  if (selected) sessionStorage.setItem("selectedVariantId", selected);
                } catch {}
                router.push(`/create/artwork?variant=${encodeURIComponent(selected || "")}`);
              }}
              disabled={!selected}
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
