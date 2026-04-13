 "use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  autoOpen?: boolean;
};

export default function GuidedInfoModal({ autoOpen = true }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="w-[calc(100vw-32px)] sm:max-w-[560px] rounded-[28px] p-8 sm:p-10 bg-[#f7f6f4] border-0"
      >
        <div className="flex flex-col items-center text-center">
          <DialogTitle className="text-xl font-semibold text-[#111111]">Info</DialogTitle>
          <div className="mt-6">
            <Image src="/guided-info-icon.png" alt="" width={80} height={50} priority />
          </div>
          <div className="mt-6 text-sm sm:text-[15px] leading-relaxed text-[#222222] max-w-[420px]">
            <span className="font-semibold">Note:</span>{" "}
            Your artwork will appear <span className="italic">mirrored</span> while you&apos;re creating it, since you&apos;ll be working from the back of the frame.
            Once hung on the wall, it will look exactly like your original image.
          </div>
        </div>

        <DialogFooter className="mt-8 flex justify-center">
          <Button 
            className="w-full sm:w-auto rounded-full bg-[#C5B4A3] hover:bg-[#B5A493] px-10 h-12 font-semibold"
            onClick={() => setOpen(false)}
          >
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
