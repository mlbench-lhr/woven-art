"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function ArtworkStepsPage() {
  const params = useSearchParams();
  const variant = params.get("variant") || "r1";
  const badge = variant.toLowerCase().startsWith("j") ? "J" : "R";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Steps */}
          <div className="w-full">
            <div className="rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="text-xs font-semibold tracking-widest text-gray-500">
                STEPS
              </div>
              <div className="mt-1 text-sm text-gray-700">2 of 4</div>

              {/* Step 1 */}
              <div className="mt-6">
                <div className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold">
                    1
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Login or Sign Up
                    </div>
                    <div className="text-xs text-gray-500">
                      Save your Woven-Arts in your account
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="mt-6">
                <div className="text-[10px] font-semibold tracking-widest text-gray-700">
                  CREDITS
                </div>
                <div className="mt-2 flex items-start gap-3">
                  <div className="size-6 rounded-full bg-[#D8E6DD] text-gray-700 flex items-center justify-center text-xs font-semibold">
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
                      <Button variant="outline" className="justify-center">
                        Save without instructions
                      </Button>
                      <Button className="opp-button-4 justify-center">
                        Redeem or Buy credits
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="mt-6 opacity-60">
                <div className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold">
                    3
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Unlock Instructions
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="mt-4 opacity-60">
                <div className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold">
                    4
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Start Stringing
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Artwork preview */}
          <div className="w-full flex items-center justify-center">
            <div className="relative w-[520px] h-[520px]">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <Image
                  src="/auth image 1.png"
                  alt="String art preview"
                  fill
                  sizes="520px"
                  className="object-cover grayscale"
                />
              </div>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F24E1E] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow">
                {badge}
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
