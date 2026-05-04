"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

type Props = {
  open: boolean;
  onClose: () => void;
  onHaveKit: () => void;
  onShopKit: () => void;
};

export default function WovenArtKitModal({ open, onClose, onHaveKit, onShopKit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-32px)] sm:max-w-[480px] rounded-[28px] p-8 sm:p-10 bg-white border-0">
        <div className="flex flex-col items-center text-center">
          <DialogTitle className="text-2xl font-semibold text-[#171d1a] mb-6">
            Do you have a Woven-Art kit?
          </DialogTitle>
          
          <div className="mb-8">
            <Image 
              src="/woven-art-kit.png" 
              alt="Woven-Art Kit" 
              width={280} 
              height={280} 
              priority 
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 h-12 rounded-full bg-[#C5B4A3] hover:bg-[#B5A493] text-white font-semibold"
            onClick={onHaveKit}
          >
            I already have a Woven-Art
          </Button>
          
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-full border-[#C5B4A3] text-[#C5B4A3] hover:bg-[#C5B4A3] hover:text-white font-semibold"
            onClick={onShopKit}
          >
            Shop the kit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
