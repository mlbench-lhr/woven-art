"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import ProgressiveStringPreview from "@/components/ProgressiveStringPreview";
import InstructionCodeModal from "@/components/SmallComponents/InstructionCodeModal";
import { useAuth } from "@/hooks/use-auth";
import { useVariants } from "@/app/Context/VariantsContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ArtworkStepsPage() {
  const { user, loading, refreshUser } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { variants, setVariants } = useVariants();

  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(params.get("variant"));
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const redirectParam = useMemo(() => {
    const sp = params.toString();
    const full = sp ? `${pathname}?${sp}` : pathname;
    return encodeURIComponent(full);
  }, [pathname, params]);

  useEffect(() => {
    if (!selectedId) {
      try {
        const sid = sessionStorage.getItem("selectedVariantId");
        if (sid) setSelectedId(sid);
      } catch {}
    }
  }, [selectedId]);

  useEffect(() => {
    if (variants.length === 0) {
      try {
        const raw = sessionStorage.getItem("stringArtVariants");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            Array.isArray(parsed) &&
            parsed.length > 0 &&
            parsed.every((v) => typeof v?.lines === "number" && Array.isArray(v?.sequence) && v.sequence.length === v.lines + 1)
          ) {
            setVariants(parsed);
          } else {
            sessionStorage.removeItem("stringArtVariants");
          }
        }
      } catch {}
    }
  }, [variants.length, setVariants]);

  useEffect(() => {
    if (variants.length === 0) return;
    if (variants.every((v: any) => typeof v?.lines === "number" && Array.isArray(v?.sequence) && v.sequence.length === v.lines + 1)) return;
    try {
      sessionStorage.removeItem("stringArtVariants");
    } catch {}
    setVariants([] as any);
  }, [variants, setVariants]);

  const selectedVariant = variants.find((v) => v.id === selectedId);
  const isLoggedIn = !!user;
  const credits = (user as any)?.credits ?? 0;

  const [canvasSize, setCanvasSize] = useState(360);

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize(Math.min(360, window.innerWidth - 48));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSaveWithoutInstructions = async () => {
    if (!selectedVariant) return;
    if (!isLoggedIn) return;
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      // Get storage variant with mirrored sequence for database
      let storageVariant = null;
      try {
        const storageVariants = JSON.parse(sessionStorage.getItem("stringArtStorageVariants") || "[]");
        console.log("Available storage variants:", storageVariants);
        console.log("Looking for variant ID:", selectedVariant.id);
        storageVariant = storageVariants.find((v: any) => v.id === selectedVariant.id);
        console.log("Found storage variant:", storageVariant);
        
        if (!storageVariant) {
          // Fallback: use display variant data but create mirrored sequence
          console.warn("Storage variant not found, using display variant as fallback");
          const { createMirroredSequence } = await import("@/lib/stringArtGenerator");
          storageVariant = {
            id: selectedVariant.id,
            lines: selectedVariant.lines / 2, // Convert to storage lines
            seed: selectedVariant.seed,
            sequence: createMirroredSequence(selectedVariant.sequence, 240), // Mirror for storage pins
            totalPins: 240
          };
        }
      } catch (e) {
        console.error("Failed to get storage variants:", e);
        // Fallback: use display variant data
        const { createMirroredSequence } = await import("@/lib/stringArtGenerator");
        storageVariant = {
          id: selectedVariant.id,
          lines: selectedVariant.lines / 2,
          seed: selectedVariant.seed,
          sequence: createMirroredSequence(selectedVariant.sequence, 240),
          totalPins: 240
        };
      }

      const requestBody = {
        variantId: selectedVariant.id,
        storageVariant: storageVariant, // Send storage variant with mirrored sequence
        thumbnail: null,
      };
      console.log("Sending to save API:", requestBody);
      
      const res = await fetch("/api/artwork/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      toast.success("Artwork saved to your account");
      router.push("/dashboard/artworks");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save artwork");
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  };

  const handleStartGuided = async () => {
    if (!selectedVariant) return;
    if (!isLoggedIn) return;

    if (savingRef.current) return;

    savingRef.current = true;
    setSaving(true);
    try {
      // Get storage variant with mirrored sequence for database
      let storageVariant = null;
      try {
        const storageVariants = JSON.parse(sessionStorage.getItem("stringArtStorageVariants") || "[]");
        storageVariant = storageVariants.find((v: any) => v.id === selectedVariant.id);
      } catch (e) {
        console.error("Failed to get storage variants:", e);
      }

      const clientRequestId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
      const saveRes = await fetch("/api/artwork/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          variantId: selectedVariant.id,
          storageVariant: storageVariant, // Send the storage variant with mirrored sequence
          clientRequestId,
          thumbnail: null,
        }),
      });
      if (!saveRes.ok) {
        const j = await saveRes.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${saveRes.status}`);
      }
      const saved = await saveRes.json();
      const artId = saved.id;

      const consumeRes = await fetch("/api/credits/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ artId }),
      });

      if (!consumeRes.ok) {
        const j = await consumeRes.json().catch(() => ({}));
        toast.error(j.error || "Unable to unlock artwork");
        router.push("/dashboard/artworks");
        return;
      }

      await refreshUser();
      router.replace(`/create/guided?art=${encodeURIComponent(artId)}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to start guided steps");
    } finally {
      setSaving(false);
      savingRef.current = false;
      setShowConfirmModal(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <Navbar />
      <main className="flex-1">
        <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Unlock</AlertDialogTitle>
              <AlertDialogDescription>
                You will now use 1 credit to unlock the instructions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleStartGuided}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="w-full">
            <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
              {/* Steps Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase">STEPS</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-gray-900">{isLoggedIn ? "2" : "1"}</span>
                  <span className="text-gray-400 font-medium text-sm">of 4</span>
                </div>
              </div>

              {/* Step 1: Login or Sign Up */}
              <div className={`p-6 border-b border-gray-50 ${!isLoggedIn ? "bg-[#fcfbf9]" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className={`size-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${!isLoggedIn ? "bg-[#C5B4A3] text-white" : "bg-gray-100 text-gray-400"}`}>
                    1
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold transition-colors ${!isLoggedIn ? "text-gray-900" : "text-gray-400"}`}>Login or Sign Up</div>
                    <div className="text-sm text-gray-500 mt-0.5 leading-relaxed">Save your Woven-Arts in your account</div>
                    
                    {!isLoggedIn && (
                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-6 rounded-xl border-gray-200"
                          onClick={() => router.push(`/auth/login?redirect=${redirectParam}`)}
                        >
                          Login
                        </Button>
                        <Button
                          size="sm"
                          className="opp-button-4 h-9 px-6 rounded-xl"
                          onClick={() => router.push(`/auth/signup?redirect=${redirectParam}`)}
                        >
                          Sign Up
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Credits */}
              <div className={`p-6 border-b border-gray-50 ${isLoggedIn ? "bg-[#fcfbf9]" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className={`size-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${isLoggedIn ? "bg-[#C5B4A3] text-white" : "bg-gray-100 text-gray-400"}`}>
                    2
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold tracking-wider text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded leading-none uppercase bg-white">CREDITS</span>
                    </div>
                    <div className={`font-semibold transition-colors ${isLoggedIn ? "text-gray-900" : "text-gray-400"}`}>
                      You have <span className={isLoggedIn ? (credits > 0 ? "text-green-600" : "text-red-500") : "text-gray-400"}>{credits} credits</span> remaining
                    </div>

                    {isLoggedIn && (
                      <div className="mt-4 space-y-4">
                        {credits <= 0 ? (
                          <div className="space-y-4">
                            <p className="text-xs text-gray-500 leading-relaxed">
                              You don't have any credits left. You can still save the string art now and unlock the instructions later, or get more credits to unlock them immediately.
                            </p>
                            <div className="flex flex-col gap-3">
                              <Button
                                variant="outline"
                                className="h-11 rounded-xl border-gray-200 font-medium text-sm w-full"
                                disabled={!selectedVariant || saving}
                                onClick={handleSaveWithoutInstructions}
                              >
                                {saving ? "Saving..." : "Save without instructions"}
                              </Button>
                              <InstructionCodeModal
                                trigger={
                                  <Button className="opp-button-4 h-11 rounded-xl font-medium text-sm w-full">
                                    Redeem or Buy credits
                                  </Button>
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <Button
                              variant="outline"
                              className="h-11 rounded-xl border-gray-200 font-medium text-sm w-full"
                              disabled={!selectedVariant || saving}
                              onClick={handleSaveWithoutInstructions}
                            >
                              {saving ? "Saving..." : "Save without instructions"}
                            </Button>
                            <Button
                              className="opp-button-4 h-11 w-full rounded-xl font-medium"
                              onClick={() => setShowConfirmModal(true)}
                              disabled={!selectedId || !selectedVariant || saving}
                            >
                              {saving ? "Starting..." : "Use credit and unlock instructions"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3: Unlock Instructions */}
              <div className="p-6 border-b border-gray-50 opacity-60">
                <div className="flex items-start gap-4">
                  <div className="size-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-semibold shrink-0">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-gray-400">Unlock Instructions</div>
                    <div className="text-sm text-gray-500 mt-0.5">Get step-by-step guidance for your art</div>
                  </div>
                </div>
              </div>

              {/* Step 4: Start Stringing */}
              <div className="p-6 opacity-60">
                <div className="flex items-start gap-4">
                  <div className="size-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-semibold shrink-0">
                    4
                  </div>
                  <div>
                    <div className="font-semibold text-gray-400">Start Stringing</div>
                    <div className="text-sm text-gray-500 mt-0.5">Follow the instructions to create your art</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col items-center">
            {selectedVariant ? (
              <div className="flex flex-col items-center">
                <div 
                  className="relative bg-white rounded-full shadow-lg border border-gray-100 overflow-hidden"
                  style={{ width: canvasSize, height: canvasSize }}
                >
                  <ProgressiveStringPreview
                    sequence={selectedVariant.sequence}
                    totalPins={480}
                    size={canvasSize}
                    strokeColor="rgba(10,10,10,0.22)"
                    strokeWidth={0.85}
                  />
                </div>
                <div className="mt-8 px-6 py-2 bg-gray-50 rounded-full border border-gray-100">
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedVariant.id === 'v1' ? '2700' : selectedVariant.id === 'v2' ? '3300' : '3700'} lines
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 font-medium">No artwork to preview</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
