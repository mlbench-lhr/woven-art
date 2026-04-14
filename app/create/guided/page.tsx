"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useVariants } from "@/app/Context/VariantsContext";
import GuidedInfoModal from "@/components/SmallComponents/GuidedInfoModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FastForward, Pause, Play, RotateCcw, Settings, Volume2 } from "lucide-react";
import { mapIndexToColor } from "@/lib/mappers";
import CongratulationsModal from "@/components/SmallComponents/CongratulationsModal";

type ColorName = "Green" | "Yellow" | "Red" | "Blue";

const COLOR_ORDER: readonly ColorName[] = ["Green", "Yellow", "Red", "Blue"] as const;
const COLOR_HEX: Record<ColorName, string> = {
  Green: "#8FE592",
  Yellow: "#F8D96E",
  Red: "#EF6B65",
  Blue: "#6CC5F6",
};

function clampNumber(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pickFemaleVoice(voices: SpeechSynthesisVoice[]) {
  const preferredNameHints = [
    "female",
    "samantha",
    "victoria",
    "karen",
    "moira",
    "tessa",
    "zira",
    "aria",
    "jenny",
    "serena",
    "amelie",
    "ava",
    "joanna",
    "google uk english female",
    "google us english female",
  ];
  const candidates = voices.filter((v) => String(v.lang || "").toLowerCase().startsWith("en"));
  const scored = candidates.map((v) => {
    const name = String(v.name || "").toLowerCase();
    const hintIdx = preferredNameHints.findIndex((h) => name.includes(h));
    const score = hintIdx === -1 ? 999 : hintIdx;
    return { v, score };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored[0]?.v ?? candidates[0] ?? voices[0] ?? null;
}

function parseMappedPin(mapped: string): { color: ColorName | null; pin: number | null } {
  const [colorRaw, pinRaw] = mapped.split("-");
  const pinNum = Number(pinRaw);
  const color = (COLOR_ORDER as readonly string[]).includes(colorRaw) ? (colorRaw as ColorName) : null;
  const pin = Number.isFinite(pinNum) ? pinNum : null;
  return { color, pin };
}

function mapPinIndex(index: number): { color: ColorName | null; pin: number | null; hex: string; label: string } {
  const mapped = mapIndexToColor(index);
  const { color, pin } = parseMappedPin(mapped);
  const hex = color ? COLOR_HEX[color] : "#9CA3AF";
  const label = color && pin ? `${color} ${pin}` : mapped.replace("-", " ");
  return { color, pin, hex, label };
}

function colorPinToIndex(color: ColorName, pin: number) {
  const cIdx = COLOR_ORDER.indexOf(color);
  return cIdx * 60 + (pin - 1);
}

function findSequenceEndIndex(sequence: number[], third: number, second: number, last: number) {
  for (let i = 2; i < sequence.length; i++) {
    if (sequence[i - 2] === third && sequence[i - 1] === second && sequence[i] === last) return i;
  }
  return -1;
}

export default function GuidedCreatePage() {
  const params = useSearchParams();
  const router = useRouter();
  const { variants, setVariants } = useVariants();
  const variantId = params.get("variant");
  const artId = params.get("art");

  const [serverSequence, setServerSequence] = useState<number[] | null>(null);
  const [serverTotalLines, setServerTotalLines] = useState<number | null>(null);
  const [serverUnlocked, setServerUnlocked] = useState<boolean>(false);
  const [serverProgress, setServerProgress] = useState<number>(1);
  const [loadingArt, setLoadingArt] = useState<boolean>(false);
  const [artLoaded, setArtLoaded] = useState<boolean>(false);
  const [showCongratulationsModal, setShowCongratulationsModal] = useState(false);
  const [showGuidedModal, setShowGuidedModal] = useState(false);

  useEffect(() => {
    if (variants.length === 0) {
      try {
        const raw = sessionStorage.getItem("stringArtVariants");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setVariants(parsed);
        }
      } catch { }
    }
  }, [variants.length, setVariants]);

  useEffect(() => {
    const load = async () => {
      if (!artId) return;
      setLoadingArt(true);
      setArtLoaded(false);
      try {
        const res = await fetch(`/api/artwork/${artId}`, { credentials: "include" });
        if (!res.ok) return;
        const j = await res.json();
        console.log(j);
        setServerSequence(j.item?.finalSequence || null);
        setServerTotalLines(j.item?.totalLines || null);
        setServerUnlocked(!!j.item?.unlocked);
        setServerProgress(j.progress?.currentStep || 1);
        // ✅ KEY LOGIC
        if (j.progress?.currentStep <= 1) {
          setShowGuidedModal(true);
        }
      } finally {
        setLoadingArt(false);
        setArtLoaded(true);
      }
    };
    load();
  }, [artId]);

  useEffect(() => {
    if (!artId) return;
    if (!artLoaded) return;
    if (serverUnlocked) return;
    router.replace("/dashboard/artworks");
  }, [artId, artLoaded, serverUnlocked, router]);

  const variant = useMemo(
    () => variants.find((v) => v.id === variantId) || variants[0],
    [variants, variantId]
  );

  const [step, setStep] = useState(1);
  const [isEditingLine, setIsEditingLine] = useState(false);
  const [lineDraft, setLineDraft] = useState("");
  const lineInputRef = useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const totalPins = 240;
  const size = 420;
  const [canvasSize, setCanvasSize] = useState(size);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTokenRef = useRef(0);
  const volumeRef = useRef(volume);
  const speedRef = useRef(speed);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const [lostOpen, setLostOpen] = useState(false);
  const [lostPins, setLostPins] = useState<
    { label: "Last Pin" | "Second Last Pin" | "Third Last Pin"; color: ColorName | ""; pin: string }[]
  >([
    { label: "Last Pin", color: "", pin: "" },
    { label: "Second Last Pin", color: "", pin: "" },
    { label: "Third Last Pin", color: "", pin: "" },
  ]);

  useEffect(() => {
    if (artId) {
      if (!serverSequence) return;
      setStep(Math.max(1, Math.min(serverProgress, serverSequence.length - 1)));
      setIsInitialized(true);
      return;
    }
    if (!variant) {
      router.replace("/create/variant");
      return;
    }
    setStep(Math.min(1, variant.sequence.length - 1));
    setIsInitialized(true);
  }, [artId, serverProgress, serverSequence, variant, router]);

  useEffect(() => {
    if (!artId || !serverSequence || !isInitialized) return;

    // Only save if the current step is different from the server progress 
    // or if we've already started moving
    const save = async () => {
      await fetch("/api/artwork/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ artId, currentStep: step })
      });
    };
    save();
  }, [artId, step, serverSequence, isInitialized]);

  const activeSequence = artId && serverSequence ? serverSequence : (variant?.sequence || []);
  const maxStep = Math.max(1, activeSequence.length - 1);
  const displayStep = Math.min(step, maxStep);
  const prevPin = activeSequence.length ? activeSequence[Math.max(0, displayStep - 1)] : 0;
  const nextPin = activeSequence.length ? activeSequence[displayStep] : 1;
  const canPrev = step > 1;
  const canNext = activeSequence.length ? step <= maxStep : false;
  const prevMapped = mapPinIndex(prevPin);
  const nextMapped = mapPinIndex(nextPin);
  const currentLine = clampNumber(step - 1, 0, maxStep);
  const isLastLine = currentLine === maxStep - 1;
  const isDone = currentLine === maxStep;

  useEffect(() => {
    if (isEditingLine) return;
    setLineDraft(String(clampNumber(step - 1, 0, Math.max(0, maxStep))));
  }, [isEditingLine, step, maxStep]);

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize(Math.min(size, window.innerWidth - 32));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const load = () => {
      voiceRef.current = pickFemaleVoice(synth.getVoices());
    };
    load();
    synth.onvoiceschanged = load;
    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const stopPlayback = () => {
    playTokenRef.current += 1;
    setIsPlaying(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  const speak = (text: string, token: number) =>
    new Promise<void>((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        resolve();
        return;
      }
      if (playTokenRef.current !== token) {
        resolve();
        return;
      }
      const synth = window.speechSynthesis;
      const u = new SpeechSynthesisUtterance(text);
      u.volume = clampNumber(volumeRef.current, 0, 1);
      u.rate = 1;
      if (voiceRef.current) {
        u.voice = voiceRef.current;
        u.lang = voiceRef.current.lang;
      } else {
        u.lang = "en-US";
      }
      u.onend = () => resolve();
      u.onerror = () => resolve();
      synth.speak(u);
    });

  const startPlayback = () => {
    if (!activeSequence.length || activeSequence.length < 2) return;
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
      toast.error("Voice is not supported in this browser.");
      return;
    }
    stopPlayback();
    const token = playTokenRef.current + 1;
    playTokenRef.current = token;
    setIsPlaying(true);

    const run = async () => {
      const lastPlayableStep = Math.min(maxStep, maxStep);
      for (let s = clampNumber(step, 1, lastPlayableStep); s <= lastPlayableStep; s++) {
        if (playTokenRef.current !== token) break;
        const fromIdx = activeSequence[s - 1];
        const toIdx = activeSequence[s];
        const from = mapPinIndex(fromIdx);
        const to = mapPinIndex(toIdx);
        setStep(s);
        const text = to.color && to.pin ? `${to.color} ${to.pin}` : `Pin ${toIdx}`;
        await speak(text, token);
        if (playTokenRef.current !== token) break;

        // Custom pause based on speed setting
        let pauseMs = 1500; // Default for 3x
        if (speedRef.current <= 0.25) {
          pauseMs = 8000;
        } else if (speedRef.current <= 0.5) {
          pauseMs = 6000;
        } else if (speedRef.current <= 1) {
          pauseMs = 4000;
        } else if (speedRef.current <= 2) {
          pauseMs = 2500;
        }

        await new Promise((r) => setTimeout(r, pauseMs));
      }
      if (playTokenRef.current === token) {
        setIsPlaying(false);
        setStep(maxStep);
        setShowCongratulationsModal(true);
      }
    };

    run();
  };

  const togglePlayback = () => {
    if (isPlaying) stopPlayback();
    else startPlayback();
  };

  const handleRestorePosition = () => {
    stopPlayback();
    const last = lostPins[0];
    const second = lostPins[1];
    const third = lostPins[2];
    if (!last.color || !second.color || !third.color) {
      toast.error("Select the color for all three pins.");
      return;
    }
    const lastPin = clampNumber(Number(last.pin), 1, 60);
    const secondPin = clampNumber(Number(second.pin), 1, 60);
    const thirdPin = clampNumber(Number(third.pin), 1, 60);
    if (!Number.isFinite(lastPin) || !Number.isFinite(secondPin) || !Number.isFinite(thirdPin)) {
      toast.error("Enter valid pin numbers (1–60).");
      return;
    }
    if (lastPin < 1 || lastPin > 60 || secondPin < 1 || secondPin > 60 || thirdPin < 1 || thirdPin > 60) {
      toast.error("Pin numbers must be between 1 and 60.");
      return;
    }
    const lastIdx = colorPinToIndex(last.color, lastPin);
    const secondIdx = colorPinToIndex(second.color, secondPin);
    const thirdIdx = colorPinToIndex(third.color, thirdPin);
    const endIdx = findSequenceEndIndex(activeSequence, thirdIdx, secondIdx, lastIdx);
    if (endIdx === -1) {
      toast.error("Couldn’t find that position in the instructions.");
      return;
    }
    const newStep = clampNumber(endIdx + 1, 1, Math.max(1, activeSequence.length - 1));
    setStep(newStep);
    setLostOpen(false);
    toast.success("Position restored.");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <GuidedInfoModal
        open={showGuidedModal}
        onClose={() => setShowGuidedModal(false)}
      />
      <CongratulationsModal
        open={showCongratulationsModal}
        onClose={() => setShowCongratulationsModal(false)}
      />
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[1000px] mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            <Button
              className="hidden md:block"
              variant="outline"
              onClick={() =>
                artId
                  ? router.push("/dashboard/artworks")
                  : router.push(`/create/artwork?variant=${encodeURIComponent(variantId || variant?.id || "")}`)
              }
            >
              Back
            </Button>
            <h1 className="text-2xl md:text-3xl font-semibold">Create Artwork</h1>
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full h-10 w-10 p-0 bg-gray-100 border-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800"
                    aria-label="Settings"
                  >
                    <Settings className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  align="start"
                  sideOffset={10}
                  className="w-[280px] sm:w-80 rounded-2xl border-0 bg-gray-50 p-5 shadow-xl"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Volume2 className="size-4" />
                          <span>Volume</span>
                        </div>
                        <span className="text-gray-600">{Math.round(volume * 100)}%</span>
                      </div>
                      <Slider
                        className="[&_[data-slot=slider-track]]:bg-[#E5E7EB] [&_[data-slot=slider-range]]:bg-[#C5B4A3] [&_[data-slot=slider-thumb]]:border-[#C5B4A3] [&_[data-slot=slider-thumb]]:size-3.5"
                        value={[Math.round(volume * 100)]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(v) => setVolume(clampNumber((v[0] ?? 100) / 100, 0, 1))}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FastForward className="size-4" />
                          <span>Speed</span>
                        </div>
                        <span className="text-gray-600">
                          {speed === 0.25 ? "0.25x" : speed === 0.5 ? "0.5x" : speed === 1 ? "1x" : speed === 2 ? "2x" : "3x"}
                        </span>
                      </div>
                      <Slider
                        className="[&_[data-slot=slider-track]]:bg-[#E5E7EB] [&_[data-slot=slider-range]]:bg-[#C5B4A3] [&_[data-slot=slider-thumb]]:border-[#C5B4A3] [&_[data-slot=slider-thumb]]:size-3.5"
                        value={[speed === 0.25 ? 0 : speed === 0.5 ? 25 : speed === 1 ? 50 : speed === 2 ? 75 : 100]}
                        min={0}
                        max={100}
                        step={25}
                        onValueChange={(v) => {
                          const val = v[0] ?? 50;
                          if (val === 0) setSpeed(0.25);
                          else if (val === 25) setSpeed(0.5);
                          else if (val === 50) setSpeed(1);
                          else if (val === 75) setSpeed(2);
                          else setSpeed(3);
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      className="w-full flex items-center gap-2 text-sm text-red-600 hover:text-red-600"
                      onClick={() => {
                        stopPlayback();
                        setStep(1);
                      }}
                    >
                      <RotateCcw className="size-4" />
                      <span>Reset Instructions</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                className="rounded-full h-10 px-6 bg-gray-100 border-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800"
                onClick={() => setLostOpen(true)}
              >
                I&apos;m Lost
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-gray-700 mb-4 px-4">
            {activeSequence.length > 0 && (
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-2 sm:gap-y-1">
                <div className="flex items-center gap-1">
                  {isEditingLine ? (
                    <>
                      <span className="underline underline-offset-4 decoration-2">Current Line:</span>
                      <input
                        ref={lineInputRef}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={maxStep}
                        value={lineDraft}
                        onChange={(e) => setLineDraft(e.target.value)}
                        onBlur={() => {
                          const n = Number(lineDraft);
                          if (Number.isFinite(n)) setStep(clampNumber(Math.trunc(n) + 1, 1, maxStep + 1));
                          setIsEditingLine(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur();
                          if (e.key === "Escape") {
                            setLineDraft(String(step - 1));
                            setIsEditingLine(false);
                          }
                        }}
                        className="w-[48px] text-center font-bold underline decoration-2 underline-offset-4 outline-none bg-transparent"
                        autoFocus
                      />
                    </>
                  ) : (
                    <button
                      type="button"
                      className="font-bold underline cursor-pointer hover:text-[#C5B4A3] transition-colors decoration-2 underline-offset-4"
                      onClick={() => {
                        setIsEditingLine(true);
                        setTimeout(() => lineInputRef.current?.select(), 0);
                      }}
                    >
                      Current Line:{step}
                    </button>
                  )}
                  <span className="font-medium text-gray-500">/{maxStep}</span>
                </div>
                <span className="text-gray-400 hidden sm:inline">|</span>
                <div className="flex items-center gap-1">
                  <span>Pin</span>
                  <span className="font-semibold" style={{ color: prevMapped.hex }}>
                    {prevMapped.label}
                  </span>
                  <span>to</span>
                  <span className="font-semibold" style={{ color: nextMapped.hex }}>
                    {nextMapped.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="relative w-full flex justify-center overflow-hidden">
              <GuidedCanvas sequence={activeSequence} totalPins={totalPins} size={canvasSize} step={step} />
            </div>

            <div className="flex items-center justify-center gap-3 w-full max-w-[500px] px-4 mt-4">
              <Button
                variant="outline"
                className="flex-1 md:flex-none md:w-36 !h-12 !rounded-full border-gray-200 font-bold"
                onClick={() => {
                  stopPlayback();
                  setStep((s) => Math.max(1, s - 1));
                }}
                disabled={!canPrev}
              >
                Last Step
              </Button>

              <Button
                variant="outline"
                className="rounded-full h-12 w-12 shrink-0 p-0"
                onClick={togglePlayback}
                disabled={activeSequence.length < 2}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
              </Button>

              <Button
                className="opp-button-4 flex-1 md:flex-none md:w-36 !h-12 !rounded-full font-bold"
                onClick={() => {
                  stopPlayback();
                  if (step >= maxStep) {
                    setShowCongratulationsModal(true);
                  } else {
                    setStep((s) => s + 1);
                  }
                }}
                disabled={!canNext}
              >
                {step >= maxStep ? "Finish" : "Next Step"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={lostOpen} onOpenChange={(o) => setLostOpen(o)}>
        <DialogContent className="w-[calc(100vw-32px)] sm:max-w-[640px] rounded-3xl p-6 sm:p-10">
          <DialogHeader className="text-center items-center">
            <DialogTitle className="text-xl sm:text-[22px] font-semibold font-sans">Need help finding your place?</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Select the color of each pin and enter its position (pins 1-60).
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {lostPins.map((row, idx) => (
              <div key={row.label} className="grid grid-cols-[80px_1fr] sm:grid-cols-[170px_1fr] items-center gap-3 sm:gap-4">
                <div className="text-sm font-medium text-gray-700 truncate">{row.label}</div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Select
                    value={row.color || undefined}
                    onValueChange={(val) =>
                      setLostPins((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, color: val as ColorName } : p))
                      )
                    }
                  >
                    <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-gray-100 px-3 sm:px-5 text-xs sm:text-sm w-[100px] sm:w-[220px]">
                      <SelectValue placeholder="Color" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-100 rounded-2xl shadow-xl">
                      {COLOR_ORDER.map((c) => (
                        <SelectItem key={c} value={c} className="focus:bg-gray-50 rounded-xl cursor-pointer py-3">
                          <span className="inline-flex items-center gap-3">
                            <span
                              className="inline-block size-5 rounded-md"
                              style={{ backgroundColor: COLOR_HEX[c] }}
                            />
                            <span className="font-medium text-gray-700">{c}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={60}
                    placeholder="Pin #"
                    className="h-12 rounded-2xl bg-gray-50 border-gray-100 px-3 sm:px-5 text-xs sm:text-sm flex-1"
                    value={row.pin}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setLostPins((prev) => prev.map((p, i) => (i === idx ? { ...p, pin: "" } : p)));
                        return;
                      }
                      const num = clampNumber(Number(raw), 1, 60);
                      if (!Number.isFinite(num)) return;
                      setLostPins((prev) => prev.map((p, i) => (i === idx ? { ...p, pin: String(num) } : p)));
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-10 flex flex-col-reverse sm:flex-row sm:justify-end gap-4">
            <Button
              variant="outline"
              className="rounded-full h-12 px-12 bg-[#F9E7E7] border-[#F9E7E7] text-red-600 hover:bg-[#F6DCDC] hover:text-red-600 w-full sm:w-auto"
              onClick={() => setLostOpen(false)}
            >
              Cancel
            </Button>
            <Button className="rounded-full h-12 px-12 bg-[#C5B4A3] hover:bg-[#B5A493] w-full sm:w-auto" onClick={handleRestorePosition}>
              Restore My Position
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GuidedCanvas({
  sequence,
  totalPins,
  size,
  step,
}: {
  sequence: number[];
  totalPins: number;
  size: number;
  step: number;
}) {
  const renderStep = Math.min(step, sequence.length > 0 ? sequence.length - 1 : 1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI displays for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const displaySize = size;
    const actualSize = displaySize * dpr;
    
    // Set canvas resolution for sharp rendering
    canvas.width = actualSize;
    canvas.height = actualSize;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;
    
    // Scale context for device pixel ratio
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, displaySize, displaySize);
    const cx = size / 2;
    const cy = size / 2;
    const ringWidth = 14;
    const bubbleRadius = 20;
    const desiredLabelGap = 8;
    const maxLabelRadius = size / 2 - bubbleRadius - 2;
    const maxRadiusForLabels = maxLabelRadius - (ringWidth / 2 + bubbleRadius + desiredLabelGap);
    const radius = clampNumber(Math.min(size / 2 - 8, maxRadiusForLabels), 40, size / 2 - 8);
    const ringOuter = radius + ringWidth / 2;
    const labelRadius = Math.min(ringOuter + bubbleRadius + desiredLabelGap, maxLabelRadius);

    const pins: { x: number; y: number }[] = [];
    for (let i = 0; i < totalPins; i++) {
      const angle = (2 * Math.PI * i) / totalPins - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      pins.push({ x, y });
    }

    ctx.lineWidth = ringWidth;
    for (let ci = 0; ci < COLOR_ORDER.length; ci++) {
      const startIdx = (totalPins / COLOR_ORDER.length) * ci;
      const endIdx = (totalPins / COLOR_ORDER.length) * (ci + 1);
      const startAngle = (-Math.PI / 2) + (2 * Math.PI * startIdx) / totalPins;
      const endAngle = (-Math.PI / 2) + (2 * Math.PI * endIdx) / totalPins;
      ctx.beginPath();
      ctx.strokeStyle = COLOR_HEX[COLOR_ORDER[ci]];
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.stroke();
    }

    // Dotted circle exactly in the center of the colored ring
    const dottedRadius = radius;
    const arrowRadius = radius;
    ctx.save();
    const circumference = 2 * Math.PI * dottedRadius;
    const desiredDots = totalPins; // or 120 / 240 etc
    const dashLength = circumference / (desiredDots * 2);

    // Scale line width for better visibility on mobile
    const scaledLineWidth = Math.max(1, Math.min(2, 1.5 * (size / 420)));
    
    ctx.setLineDash([dashLength, dashLength]);
    ctx.strokeStyle = "rgb(8, 9, 10)";
    ctx.lineWidth = scaledLineWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, dottedRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();

    ctx.lineWidth = 2;
    for (let i = 0; i < totalPins; i++) {
      const angle = (2 * Math.PI * i) / totalPins - Math.PI / 2;
      const meta = mapPinIndex(i);
      ctx.strokeStyle = meta.hex;
      const x1 = cx + (radius - ringWidth / 2) * Math.cos(angle);
      const y1 = cy + (radius - ringWidth / 2) * Math.sin(angle);
      const x2 = cx + (radius + ringWidth / 2) * Math.cos(angle);
      const y2 = cy + (radius + ringWidth / 2) * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    if (sequence.length >= 2 && renderStep >= 1) {
      const fromIdx = sequence[renderStep - 1];
      const toIdx = sequence[renderStep];
      if (fromIdx < 0 || toIdx < 0 || fromIdx >= pins.length || toIdx >= pins.length) return;

      // Calculate points slightly inside the ring for the arrow
      const angleFrom = (2 * Math.PI * fromIdx) / totalPins - Math.PI / 2;
      const angleTo = (2 * Math.PI * toIdx) / totalPins - Math.PI / 2;
      const fromX = cx + arrowRadius * Math.cos(angleFrom);
      const fromY = cy + arrowRadius * Math.sin(angleFrom);
      const toX = cx + arrowRadius * Math.cos(angleTo);
      const toY = cy + arrowRadius * Math.sin(angleTo);

      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);
      const arrowLen = 14;
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - arrowLen * Math.cos(angle - Math.PI / 7), toY - arrowLen * Math.sin(angle - Math.PI / 7));
      ctx.lineTo(toX - arrowLen * Math.cos(angle + Math.PI / 7), toY - arrowLen * Math.sin(angle + Math.PI / 7));
      ctx.closePath();
      ctx.fillStyle = "#000";
      ctx.fill();
    }

    if (sequence.length >= 2 && renderStep >= 1) {
      const aIdx = sequence[renderStep - 1];
      const bIdx = sequence[renderStep];
      if (aIdx < 0 || bIdx < 0 || aIdx >= pins.length || bIdx >= pins.length) return;
      const aMeta = mapPinIndex(aIdx);
      const bMeta = mapPinIndex(bIdx);
      const aAngle = (2 * Math.PI * aIdx) / totalPins - Math.PI / 2;
      const bAngle = (2 * Math.PI * bIdx) / totalPins - Math.PI / 2;

      const ax = cx + labelRadius * Math.cos(aAngle);
      const ay = cy + labelRadius * Math.sin(aAngle);
      const bx = cx + labelRadius * Math.cos(bAngle);
      const by = cy + labelRadius * Math.sin(bAngle);
      drawPinLabel(ctx, ax, ay, aMeta.pin ? String(aMeta.pin) : String(aIdx), aMeta.hex, size);
      drawPinLabel(ctx, bx, by, bMeta.pin ? String(bMeta.pin) : String(bIdx), bMeta.hex, size);
    }
  }, [sequence, totalPins, size, renderStep]);

  return <canvas ref={canvasRef} className="rounded-full" />;
}

function drawPinLabel(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, fill: string, canvasSize: number) {
  // Scale bubble and font size based on canvas size for better mobile display
  const scaleFactor = Math.max(0.7, Math.min(1.2, canvasSize / 420));
  const bubbleRadius = Math.max(16, 20 * scaleFactor);
  const fontSize = Math.max(12, Math.min(15, 15 * scaleFactor));
  
  ctx.fillStyle = fill;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = Math.max(1.5, 2 * scaleFactor);
  ctx.beginPath();
  ctx.arc(x, y, bubbleRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = "#111827";
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}
