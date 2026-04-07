 "use client";

 import { useEffect, useMemo, useRef, useState } from "react";
 import { useSearchParams, useRouter } from "next/navigation";
 import Navbar from "@/components/layout/Navbar";
 import Footer from "@/components/layout/Footer";
 import { Button } from "@/components/ui/button";
 import { useVariants } from "@/app/Context/VariantsContext";
 import { useAuth } from "@/hooks/use-auth";

 export default function GuidedCreatePage() {
   const params = useSearchParams();
   const router = useRouter();
   const { variants, setVariants } = useVariants();
   const { user } = useAuth();
   const variantId = params.get("variant");
   const artId = params.get("art");
 
   const [serverSequence, setServerSequence] = useState<number[] | null>(null);
   const [serverTotalLines, setServerTotalLines] = useState<number | null>(null);
   const [serverUnlocked, setServerUnlocked] = useState<boolean>(false);
   const [serverProgress, setServerProgress] = useState<number>(1);
   const [loadingArt, setLoadingArt] = useState<boolean>(false);

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
       }
     };
     load();
   }, [artId]);
 
   useEffect(() => {
     const consume = async () => {
       if (!artId) return;
       if (serverUnlocked) return;
       const credits = (user as any)?.credits ?? 0;
       if (credits <= 0) {
         // If the artwork is locked and there are no credits, go back to dashboard.
         router.replace("/dashboard/artworks");
         return;
       }
       const res = await fetch("/api/credits/consume", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
         body: JSON.stringify({ artId })
       });
       if (res.ok) {
         setServerUnlocked(true);
       }
     };
     // Only attempt consumption after we load server data
     if (artId && serverSequence && !serverUnlocked) {
       consume();
     }
   }, [artId, serverUnlocked, serverSequence, user, router]);

   const variant = useMemo(
     () => variants.find((v) => v.id === variantId) || variants[0],
     [variants, variantId]
   );

   const [step, setStep] = useState(1);
   const totalPins = 240;
   const size = 420;

   useEffect(() => {
     if (artId) {
       if (!serverSequence) return;
       setStep(Math.max(1, Math.min(serverProgress, serverSequence.length - 1)));
       return;
     }
     if (!variant) {
       router.replace("/create/variant");
       return;
     }
     setStep(Math.min(1, variant.sequence.length - 1));
   }, [variant, router]);
 
   useEffect(() => {
     if (!artId) return;
     if (!serverSequence) return;
     const save = async () => {
       await fetch("/api/artwork/progress", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
         body: JSON.stringify({ artId, currentStep: step })
       });
     };
     save();
   }, [artId, step, serverSequence]);

   const activeSequence = artId && serverSequence ? serverSequence : (variant?.sequence || []);
   const prevPin = activeSequence.length ? activeSequence[Math.max(0, step - 1)] : 0;
   const nextPin = activeSequence.length ? activeSequence[step] : 1;
   const canPrev = step > 1;
   const canNext = activeSequence.length ? step < activeSequence.length - 1 : false;

   return (
     <div className="min-h-screen bg-white flex flex-col">
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
             <div />
           </div>

           <div className="text-center text-sm text-gray-700 mb-4">
             {activeSequence.length > 0 && <>Current Line: {step} | Pin {prevPin} to {nextPin}</>}
           </div>

           <div className="flex flex-col items-center gap-6">
             <GuidedCanvas sequence={activeSequence} totalPins={totalPins} size={size} step={step} />

             <div className="flex items-center gap-4">
               <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={!canPrev}>
                 Last Step
               </Button>
               <Button className="opp-button-4" onClick={() => setStep((s) => Math.min((activeSequence.length || 1) - 1, s + 1))} disabled={!canNext}>
                 Next Step
               </Button>
             </div>
           </div>
         </div>
       </main>
       <Footer />
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
     const radius = size / 2 - 8;

     const quadrants = [
       { color: "#6CC5F6", start: 0, end: Math.PI / 2 },
       { color: "#8FE592", start: Math.PI / 2, end: Math.PI },
       { color: "#F8D96E", start: Math.PI, end: (3 * Math.PI) / 2 },
       { color: "#EF6B65", start: (3 * Math.PI) / 2, end: 2 * Math.PI },
     ];
     ctx.lineWidth = 10;
     quadrants.forEach((q) => {
       ctx.beginPath();
       ctx.strokeStyle = q.color;
       ctx.arc(cx, cy, radius, q.start, q.end);
       ctx.stroke();
     });

     const pins: { x: number; y: number }[] = [];
     for (let i = 0; i < totalPins; i++) {
       const angle = (2 * Math.PI * i) / totalPins - Math.PI / 2;
       pins.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
     }

     if (sequence.length >= 2 && step >= 1) {
       const from = pins[sequence[step - 1]];
       const to = pins[sequence[step]];
       ctx.strokeStyle = "#111";
       ctx.lineWidth = 2;
       ctx.beginPath();
       ctx.moveTo(from.x, from.y);
       ctx.lineTo(to.x, to.y);
       ctx.stroke();

       const dx = to.x - from.x;
       const dy = to.y - from.y;
       const angle = Math.atan2(dy, dx);
       const arrowLen = 10;
       ctx.beginPath();
       ctx.moveTo(to.x, to.y);
       ctx.lineTo(to.x - arrowLen * Math.cos(angle - Math.PI / 6), to.y - arrowLen * Math.sin(angle - Math.PI / 6));
       ctx.lineTo(to.x - arrowLen * Math.cos(angle + Math.PI / 6), to.y - arrowLen * Math.sin(angle + Math.PI / 6));
       ctx.closePath();
       ctx.fillStyle = "#111";
       ctx.fill();
     }

     if (sequence.length >= 2 && step >= 1) {
       const aIdx = sequence[step - 1];
       const bIdx = sequence[step];
       const a = pins[aIdx];
       const b = pins[bIdx];
       drawPinLabel(ctx, a.x, a.y, String(aIdx));
       drawPinLabel(ctx, b.x, b.y, String(bIdx));
     }
   }, [sequence, totalPins, size, step]);

   return <canvas ref={canvasRef} width={size} height={size} className="rounded-full" />;
 }

 function drawPinLabel(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
   ctx.fillStyle = "#fff";
   ctx.strokeStyle = "#333";
   ctx.lineWidth = 1;
   ctx.beginPath();
   ctx.arc(x, y, 12, 0, 2 * Math.PI);
   ctx.fill();
   ctx.stroke();
   ctx.fillStyle = "#333";
   ctx.font = "10px sans-serif";
   ctx.textAlign = "center";
   ctx.textBaseline = "middle";
   ctx.fillText(text, x, y);
 }
