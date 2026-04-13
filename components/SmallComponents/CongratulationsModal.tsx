"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CongratulationsModal({ open, onClose }: Props) {
  const showConfetti = open;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {showConfetti && <Confetti
        className="fixed inset-0 z-[60]"
        recycle={false}
        numberOfPieces={600}
        gravity={0.4}
        confettiSource={{
          x: 0,
          y: 0,
          w: window.innerWidth,
          h: window.innerHeight,
        }}
      />}
      <DialogContent
        className="w-[calc(100vw-32px)] sm:max-w-[560px] rounded-[28px] p-8 sm:p-10 bg-[#f7f6f4] border-0"
      >
        <div className="flex flex-col items-center text-center relative">
          <DialogTitle className="text-xl font-semibold text-[#111111]">Congratulations!</DialogTitle>

          <div className="mt-6 text-sm sm:text-[15px] leading-relaxed text-[#222222] max-w-[420px]">
            Your artwork is complete!
            <br />
            Share your creation on Instagram and tag{" "}
            <span className="font-bold">@wovenart.store</span> to receive a{" "}
            <span className="font-bold">$5,- cashback.</span>
          </div>
        </div>

        <DialogFooter className="mt-8 flex justify-center">
          <Button
            className="w-full sm:w-auto rounded-full bg-[#C5B4A3] hover:bg-[#B5A4A3] px-10 h-12 font-semibold"
            onClick={onClose}
          >
            Awesome!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
