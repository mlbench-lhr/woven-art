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
import { FaTiktok, FaFacebookF, FaInstagram } from "react-icons/fa";

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
          <DialogTitle className="text-3xl font-semibold text-[#111111]">Congratulations!</DialogTitle>

          <div className="mt-6 text-sm sm:text-[18px] font-medium leading-relaxed text-[#222222] max-w-[420px]">
            Your artwork is complete!
            <br />
            Finish by tying a triple knot around the last pin,
            maintaining tension on the thread.
            <br />
            Share your creation on your <span className="font-semibold italic">Instagram, tiktok or facebook</span> and tag us to receive a{" "}
            <p className="font-bold text-[22px]">$5,- cashback.</p>
          </div>
          <div className="mt-6 flex gap-5 justify-center items-center">

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@wovenart.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black hover:scale-110 transition"
            >
              <FaTiktok size={20} className="text-white" />
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/1BtaJKMz4T/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1877F2] hover:scale-110 transition"
            >
              <FaFacebookF size={20} className="text-white" />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/wovenart.store"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:scale-110 transition"
            >
              <FaInstagram size={20} className="text-white" />
            </a>

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
