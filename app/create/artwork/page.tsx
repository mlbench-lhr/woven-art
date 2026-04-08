"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import CanvasStringArt from "@/components/CanvasStringArt";
import InstructionCodeModal from "@/components/SmallComponents/InstructionCodeModal";
import { useAuth } from "@/hooks/use-auth";
import { useVariants } from "@/app/Context/VariantsContext";
import { toast } from "sonner";

export default function ArtworkStepsPage() {
  const { user, loading, refreshUser } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { variants, setVariants } = useVariants();

  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(params.get("variant"));

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
          if (Array.isArray(parsed)) setVariants(parsed);
        }
      } catch {}
    }
  }, [variants.length, setVariants]);

  const selectedVariant = variants.find((v) => v.id === selectedId);
  const isLoggedIn = !!user;
  const credits = (user as any)?.credits ?? 0;

  const handleSaveWithoutInstructions = async () => {
    if (!selectedVariant) return;
    if (!isLoggedIn) return;
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const res = await fetch("/api/artwork/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          totalLines: selectedVariant.lines,
          sequence: selectedVariant.sequence,
          thumbnail: null,
        }),
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
      const clientRequestId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
      const saveRes = await fetch("/api/artwork/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          totalLines: selectedVariant.lines,
          sequence: selectedVariant.sequence,
          thumbnail: null,
          clientRequestId,
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
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="w-full">
            <div className="rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="text-xs font-semibold tracking-widest text-gray-500">STEPS</div>
              <div className="mt-1 text-sm text-gray-700">{isLoggedIn ? "2 of 4" : "1 of 4"}</div>

              <div className={`mt-6 ${!isLoggedIn ? "bg-[#FDE8E6] p-3 rounded-lg" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`size-6 rounded-full flex items-center justify-center text-xs font-semibold ${!isLoggedIn ? "bg-[#F24E1E] text-white" : "bg-gray-200 text-gray-700"}`}>
                    1
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Login or Sign Up</div>
                    <div className="text-xs text-gray-500">Save your Woven-Arts in your account</div>
                  </div>
                </div>
                {!isLoggedIn && (
                  <div className="mt-4 flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/auth/login?redirect=${redirectParam}`)}
                    >
                      Login
                    </Button>
                    <Button
                      className="opp-button-4"
                      onClick={() => router.push(`/auth/signup?redirect=${redirectParam}`)}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>

              {isLoggedIn && (
                <div className="mt-6">
                  <div className="text-[10px] font-semibold tracking-widest text-gray-700">CREDITS</div>
                  <div className="mt-2 text-sm">
                    You have <span className="text-red-600">{credits}</span> credits remaining
                  </div>
                  {credits <= 0 ? (
                    <>
                      <div className="text-xs text-gray-500 mt-1">
                        You don’t have any credits left. You can still save the string art now and unlock the instructions later, or get more credits to unlock them immediately.
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-3">
                        <Button
                          variant="outline"
                          className="justify-center"
                          disabled={!selectedVariant || saving}
                          onClick={handleSaveWithoutInstructions}
                        >
                          {saving ? "Saving..." : "Save without instructions"}
                        </Button>
                        <InstructionCodeModal
                          trigger={
                            <Button className="opp-button-4 justify-center">
                              Redeem or Buy credits
                            </Button>
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <div className="mt-4">
                      <Button
                        className="opp-button-4"
                        onClick={handleStartGuided}
                        disabled={!selectedId || !selectedVariant || saving}
                      >
                        {saving ? "Starting..." : "Start Guided Steps"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col items-center">
            {selectedVariant ? (
              <div className="flex flex-col items-center">
                <div className="w-[360px] h-[360px]">
                  <CanvasStringArt
                    sequence={selectedVariant.sequence}
                    totalPins={240}
                    size={360}
                    strokeColor="#999"
                    strokeWidth={0.4}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">{selectedVariant.lines} lines</div>
              </div>
            ) : (
              <div className="text-gray-500">No artwork to preview</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
