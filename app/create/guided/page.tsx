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
import { Gauge, Pause, Play, RotateCcw, Settings, Volume2 } from "lucide-react";
import { mapIndexToColor } from "@/lib/mappers";

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
 
   useEffect(() => {
     const load = async () => {
       if (!artId) return;
       setLoadingArt(true);
       setArtLoaded(false);
       try {
         const res = await fetch(`/api/artwork/${artId}`, { credentials: "include" });
         if (!res.ok) return;
         const j = await res.json();
         setServerSequence(j.item?.finalSequence || null);
         setServerTotalLines(j.item?.totalLines || null);
         setServerUnlocked(!!j.item?.unlocked);
         setServerProgress(j.progress?.currentStep || 1);
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
   const [isInitialized, setIsInitialized] = useState(false);
   const totalPins = 240;
   const size = 420;
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTokenRef = useRef(0);
  const volumeRef = useRef(volume);
  const speedRef = useRef(speed);
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
   const prevPin = activeSequence.length ? activeSequence[Math.max(0, step - 1)] : 0;
   const nextPin = activeSequence.length ? activeSequence[step] : 1;
   const canPrev = step > 1;
   const canNext = activeSequence.length ? step < activeSequence.length - 1 : false;
  const prevMapped = mapPinIndex(prevPin);
  const nextMapped = mapPinIndex(nextPin);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

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
      u.rate = clampNumber(speedRef.current, 0.5, 2);
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
      for (let s = clampNumber(step, 1, activeSequence.length - 1); s < activeSequence.length; s++) {
        if (playTokenRef.current !== token) break;
        const fromIdx = activeSequence[s - 1];
        const toIdx = activeSequence[s];
        const from = mapPinIndex(fromIdx);
        const to = mapPinIndex(toIdx);
        setStep(s);
        const text = from.color && from.pin && to.color && to.pin ? `${from.color} ${from.pin} to ${to.color} ${to.pin}` : `Pin ${fromIdx} to ${toIdx}`;
        await speak(text, token);
        if (playTokenRef.current !== token) break;
        const pauseMs = clampNumber(Math.round(250 / clampNumber(speedRef.current, 0.5, 2)), 80, 400);
        await new Promise((r) => setTimeout(r, pauseMs));
      }
      if (playTokenRef.current === token) setIsPlaying(false);
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
       <GuidedInfoModal autoOpen />
       <Navbar />
       <main className="flex-1">
         <div className="max-w-[1000px] mx-auto px-6 py-10">
           <div className="flex items-center justify-between mb-6">
             <Button
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
                  className="w-80 rounded-2xl border-0 bg-gray-50 p-5 shadow-xl"
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
                          <Gauge className="size-4" />
                          <span>Speed</span>
                        </div>
                        <span className="text-gray-600">{speed.toFixed(1)}x</span>
                      </div>
                      <Slider
                        className="[&_[data-slot=slider-track]]:bg-[#E5E7EB] [&_[data-slot=slider-range]]:bg-[#C5B4A3] [&_[data-slot=slider-thumb]]:border-[#C5B4A3] [&_[data-slot=slider-thumb]]:size-3.5"
                        value={[Number(speed.toFixed(1))]}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={(v) => setSpeed(clampNumber(v[0] ?? 1, 0.5, 2))}
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

           <div className="text-center text-sm text-gray-700 mb-4">
            {activeSequence.length > 0 && (
              <>
                Current Line: {step} | Pin{" "}
                <span className="font-semibold" style={{ color: prevMapped.hex }}>
                  {prevMapped.label}
                </span>{" "}
                to{" "}
                <span className="font-semibold" style={{ color: nextMapped.hex }}>
                  {nextMapped.label}
                </span>
              </>
            )}
           </div>

           <div className="flex flex-col items-center gap-6">
             <GuidedCanvas sequence={activeSequence} totalPins={totalPins} size={size} step={step} />

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
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
                className="rounded-full h-11 w-11 p-0"
                onClick={togglePlayback}
                disabled={activeSequence.length < 2}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
              </Button>

              <Button
                className="opp-button-4"
                onClick={() => {
                  stopPlayback();
                  setStep((s) => Math.min((activeSequence.length || 1) - 1, s + 1));
                }}
                disabled={!canNext}
              >
                 Next Step
               </Button>
             </div>
           </div>
         </div>
       </main>
       <Footer />

      <Dialog open={lostOpen} onOpenChange={(o) => setLostOpen(o)}>
        <DialogContent className="sm:max-w-[640px] rounded-3xl p-10">
          <DialogHeader className="text-center items-center">
            <DialogTitle className="text-[22px] font-semibold font-sans">Need help finding your place?</DialogTitle>
            <DialogDescription className="text-sm">
              Select the color of each pin and enter its position (pins 1-60).
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {lostPins.map((row, idx) => (
              <div key={row.label} className="grid grid-cols-1 sm:grid-cols-[170px_1fr] items-center gap-4">
                <div className="text-sm font-medium text-gray-700">{row.label}</div>
                <div className="flex items-center gap-3">
                  <Select
                    value={row.color || undefined}
                    onValueChange={(val) =>
                      setLostPins((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, color: val as ColorName } : p))
                      )
                    }
                  >
                    <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-gray-100 px-5 text-sm w-[220px]">
                      <span className="inline-flex items-center gap-3">
                        <span
                          className="inline-block size-5 rounded-md bg-gray-200"
                          style={{ backgroundColor: row.color ? COLOR_HEX[row.color] : "#E5E7EB" }}
                        />
                        <SelectValue placeholder="Select Color" />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_ORDER.map((c) => (
                        <SelectItem key={c} value={c}>
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-block size-4 rounded-md" />
                            <span>{c}</span>
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
                    placeholder="Enter pin number"
                    className="h-12 rounded-2xl bg-gray-50 border-gray-100 px-5 text-sm"
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

          <DialogFooter className="mt-10 sm:justify-end gap-4">
            <Button
              variant="outline"
              className="rounded-full h-12 px-12 bg-[#F9E7E7] border-[#F9E7E7] text-red-600 hover:bg-[#F6DCDC] hover:text-red-600"
              onClick={() => setLostOpen(false)}
            >
              Cancel
            </Button>
            <Button className="rounded-full h-12 px-12 bg-[#C5B4A3] hover:bg-[#B5A493]" onClick={handleRestorePosition}>
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
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const margin = 46;
    const radius = size / 2 - margin;

     const pins: { x: number; y: number }[] = [];
     for (let i = 0; i < totalPins; i++) {
       const angle = (2 * Math.PI * i) / totalPins - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      pins.push({ x, y });
     }

    const ringWidth = 12;
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

    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - ringWidth * 0.65, 0, 2 * Math.PI);
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

     if (sequence.length >= 2 && step >= 1) {
      const fromIdx = sequence[step - 1];
      const toIdx = sequence[step];
      if (fromIdx < 0 || toIdx < 0 || fromIdx >= pins.length || toIdx >= pins.length) return;
      const from = pins[fromIdx];
      const to = pins[toIdx];
       ctx.strokeStyle = "#000";
       ctx.lineWidth = 3;
       ctx.beginPath();
       ctx.moveTo(from.x, from.y);
       ctx.lineTo(to.x, to.y);
       ctx.stroke();

       const dx = to.x - from.x;
       const dy = to.y - from.y;
       const angle = Math.atan2(dy, dx);
       const arrowLen = 14;
       ctx.beginPath();
       ctx.moveTo(to.x, to.y);
       ctx.lineTo(to.x - arrowLen * Math.cos(angle - Math.PI / 7), to.y - arrowLen * Math.sin(angle - Math.PI / 7));
       ctx.lineTo(to.x - arrowLen * Math.cos(angle + Math.PI / 7), to.y - arrowLen * Math.sin(angle + Math.PI / 7));
       ctx.closePath();
       ctx.fillStyle = "#000";
       ctx.fill();
     }

     if (sequence.length >= 2 && step >= 1) {
      const aIdx = sequence[step - 1];
      const bIdx = sequence[step];
      if (aIdx < 0 || bIdx < 0 || aIdx >= pins.length || bIdx >= pins.length) return;
      const aMeta = mapPinIndex(aIdx);
      const bMeta = mapPinIndex(bIdx);
      const aAngle = (2 * Math.PI * aIdx) / totalPins - Math.PI / 2;
      const bAngle = (2 * Math.PI * bIdx) / totalPins - Math.PI / 2;
      const labelRadius = radius + ringWidth / 2 + 14;
      const ax = cx + labelRadius * Math.cos(aAngle);
      const ay = cy + labelRadius * Math.sin(aAngle);
      const bx = cx + labelRadius * Math.cos(bAngle);
      const by = cy + labelRadius * Math.sin(bAngle);
      drawPinLabel(ctx, ax, ay, aMeta.pin ? String(aMeta.pin) : String(aIdx), aMeta.hex);
      drawPinLabel(ctx, bx, by, bMeta.pin ? String(bMeta.pin) : String(bIdx), bMeta.hex);
     }
   }, [sequence, totalPins, size, step]);

   return <canvas ref={canvasRef} width={size} height={size} className="rounded-full" />;
 }

function drawPinLabel(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, fill: string) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#111827";
  ctx.font = "15px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
 }
