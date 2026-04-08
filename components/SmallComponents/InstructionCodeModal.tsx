"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";

type Props = {
  trigger: React.ReactElement;
};

export default function InstructionCodeModal({ trigger }: Props) {
  const { refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => code.length === 8 && /^\d{8}$/.test(code), [code]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/credits/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      await refreshUser();
      setOpen(false);
      setCode("");
      toast.success("Code redeemed");
    } catch (err: any) {
      toast.error(err?.message || "Failed to redeem code");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[560px] rounded-[18px] px-8 py-7">
        <DialogTitle className="text-[22px] font-semibold text-[#111111]">Instruction Code</DialogTitle>
        <DialogDescription className="sr-only">Redeem an instruction code or buy a new one.</DialogDescription>

        <div className="mt-6">
          <InputOTP
            value={code}
            onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 8))}
            maxLength={8}
            containerClassName="w-full justify-between gap-2"
          >
            <InputOTPGroup className="w-full justify-between">
              {Array.from({ length: 8 }).map((_, idx) => (
                <InputOTPSlot
                  key={idx}
                  index={idx}
                  className="h-12 w-12 rounded-[10px] border-0 bg-[#f3f3f3] text-[#111111] shadow-none data-[active=true]:ring-0"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <div className="mt-3 text-[14px] text-[#9a9a9a]">Enter the 8-digit code from the email</div>

          <Button
            className="mt-5 h-12 w-full rounded-[14px] bg-[#c7a089] text-white hover:bg-[#b9927c]"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#e7e7e7]" />
            <div className="text-[14px] font-medium text-[#111111]">Or Buy</div>
            <div className="h-px flex-1 bg-[#e7e7e7]" />
          </div>

          <button
            type="button"
            className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-[14px] bg-[#f1ebe7] text-[15px] font-medium text-[#b26f4c]"
            onClick={() => window.open("https://wovenart.store/products/new-codes", "_blank", "noopener,noreferrer")}
          >
            <ShoppingCart className="h-5 w-5" />
            New Instruction Code
          </button>
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
