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
  const [showSpamReminder, setShowSpamReminder] = useState(false);

  const canSubmit = useMemo(() => code.length === 8 && /^\d{8}$/.test(code), [code]);

  const handleSpamReminder = () => {
    setShowSpamReminder(true);
  };

  const closeSpamReminder = () => {
    setShowSpamReminder(false);
  };

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
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="w-[calc(100vw-32px)] sm:max-w-[560px] rounded-[18px] p-6 sm:p-10">
          <DialogTitle className="text-xl sm:text-[22px] font-semibold text-[#111111]">Instruction Code</DialogTitle>
          <DialogDescription className="sr-only">Redeem an instruction code or buy a new one.</DialogDescription>

          <div className="mt-6">
            <InputOTP
              value={code}
              onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 8))}
              maxLength={8}
              containerClassName="w-full justify-between gap-1 sm:gap-2"
            >
              <InputOTPGroup className="w-full justify-between">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <InputOTPSlot
                    key={idx}
                    index={idx}
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-[10px] border-0 bg-[#f3f3f3] text-[#111111] shadow-none data-[active=true]:ring-0"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <div className="mt-3 text-[13px] sm:text-[14px] text-[#9a9a9a]">Enter the 8-digit code from the email</div>

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
          <button
            type="button"
            className="mt-3 text-[13px] sm:text-[14px] text-[#9a9a9a]"
            onClick={handleSpamReminder}
          >
            I did not receive my code
          </button>
          <DialogFooter />
        </DialogContent>
      </Dialog>

      {/* Spam Reminder Popup */}
      <Dialog open={showSpamReminder} onOpenChange={setShowSpamReminder}>
        <DialogContent className="w-[calc(100vw-32px)] sm:max-w-[400px] rounded-[18px] p-6">
          <DialogTitle className="text-lg font-semibold text-[#111111] mb-4">Check Your Email</DialogTitle>
          <DialogDescription className="text-sm text-[#666666] mb-6">
            Please check your spam or junk email folder for the instruction code email.
          </DialogDescription>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What to check:</h4>
              <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                <li>Spam or Junk folder</li>
                <li>Promotions or Social folder</li>
                <li>Check email from: contact@wovenart.store</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Still can't find it?</h4>
              <p className="text-sm text-yellow-800 mb-4">
                If you still can't locate your code, please reach out to our support team for assistance.
              </p>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-[#C5B4A3] text-white hover:bg-[#B5A493]"
                  onClick={() => window.open("mailto:contact@wovenart.store?subject=Missing Instruction Code")}
                >
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={closeSpamReminder}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
