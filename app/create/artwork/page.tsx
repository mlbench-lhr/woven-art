"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useVariants } from "@/app/Context/VariantsContext";

export default function ArtworkStepsPage() {
  const { user, loading } = useAuth();  // <- use hook here
  const params = useSearchParams();
  const variant = params.get("variant") || "r1";
  const badge = variant.toLowerCase().startsWith("j") ? "J" : "R";
  const isLoggedIn = !!user;
  const { variants } = useVariants();

  const [saving, setSaving] = useState(false);
  const variantId = params.get("variant");

  const selectedVariant = variants.find(v => v.id === variantId);

  const handleSaveWithoutInstructions = async () => {
    if (!selectedVariant) return;
    setSaving(true);
    try {
      await fetch("/api/artwork/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          totalLines: selectedVariant.lines,
          sequence: selectedVariant.sequence,
          thumbnail: null,
        }),
      });
      alert("Artwork saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save artwork.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {saving && (
        <div className="absolute inset-0 z-50 bg-black/30 flex items-center justify-center text-white font-semibold text-lg">
          Saving...
        </div>
      )}
      <Navbar />
      <main className="flex-1">
        {/* Steps & preview code */}
        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Steps left */}
          <div className="w-full">
            <div className="rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="text-xs font-semibold tracking-widest text-gray-500">STEPS</div>
              <div className="mt-1 text-sm text-gray-700">{isLoggedIn ? "2 of 4" : "1 of 4"}</div>

              {/* Step 1 */}
              <div className={`mt-6 ${!isLoggedIn ? "bg-[#FDE8E6] p-3 rounded-lg" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`size-6 rounded-full flex items-center justify-center text-xs font-semibold ${!isLoggedIn ? "bg-[#F24E1E] text-white" : "bg-gray-200 text-gray-700"
                    }`}>
                    1
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Login or Sign Up</div>
                    <div className="text-xs text-gray-500">
                      Save your Woven-Arts in your account
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`mt-6 ${isLoggedIn ? "bg-[#D8E6DD] p-3 rounded-lg" : ""}`}>
                <div className="text-[10px] font-semibold tracking-widest text-gray-700">CREDITS</div>
                <div className="mt-2 flex items-start gap-3">
                  <div className={`size-6 rounded-full flex items-center justify-center text-xs font-semibold ${isLoggedIn ? "bg-[#D8E6DD]" : "bg-gray-200 text-gray-700"
                    }`}>
                    2
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      You have <span className="text-red-600">0 credits</span> remaining
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      You don’t have any credits left. You can still save the string art now and unlock the instructions later, or get more credits to unlock them immediately.
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <Button
                        variant="outline"
                        className="justify-center"
                        onClick={handleSaveWithoutInstructions}
                      >
                        Save without instructions
                      </Button>
                      <Button className="opp-button-4 justify-center">
                        Redeem or Buy credits
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 & 4 unchanged */}
            </div>
          </div>

          {/* Right: Artwork preview unchanged */}
        </div>
      </main>
      <Footer />
    </div>
  );
}