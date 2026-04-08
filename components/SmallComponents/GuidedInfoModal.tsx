 "use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
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
        showCloseButton={false}
        className="bg-[#f7f6f4] border-0 rounded-[28px] px-10 py-10 sm:max-w-[560px]"
      >
        <div className="flex flex-col items-center text-center">
          <DialogTitle className="text-[20px] font-semibold text-[#111111]">Info</DialogTitle>
          <div className="mt-6">
            <Image src="/guided-info-icon.svg" alt="" width={120} height={80} priority />
          </div>
          <div className="mt-6 text-[15px] leading-6 text-[#222222] max-w-[420px]">
            <span className="font-semibold">Note:</span>{" "}
            Your artwork will appear <span className="italic">mirrored</span> while you're creating it, since you'll be working from the back of the frame.
            Once hung on the wall, it will look exactly like your original image.
          </div>
        </div>

        <DialogFooter className="mt-8 sm:justify-end">
          <Button
            className="rounded-full bg-[#c7b89a] px-8 py-6 text-white hover:bg-[#b9aa8d]"
            onClick={() => setOpen(false)}
          >
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
