"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

type Props = {
  triggerComponent?: React.ReactNode | React.ComponentType<any>;
  autoOpen?: boolean;
};

export default function UploadImageGuideModal({ triggerComponent, autoOpen }: Props) {
  const TriggerComponent = triggerComponent as any;
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {TriggerComponent ? (
        <DialogTrigger
          className="w-full"
          onClick={() => setOpen(true)}
        >
          {typeof TriggerComponent === "function" ? <TriggerComponent /> : TriggerComponent}
        </DialogTrigger>
      ) : null}
      <DialogContent className="w-[calc(100vw-32px)] sm:max-w-[520px] rounded-3xl p-6 sm:p-10">
        <DialogTitle className="text-xl sm:text-2xl font-bold">What Image Should I Use?</DialogTitle>
        <DialogDescription className="text-xs sm:text-sm">
          The best image for a Woven-Art artwork is a close-up of a single person or product with good contrast lighting.
        </DialogDescription>

        <div className="mt-6 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-green-600 font-medium mb-3">
              <CheckCircle2 className="text-green-600 size-5" />
              <span>Good</span>
            </div>
            <div className="flex items-center justify-between gap-2 sm:gap-6">
              <div className="relative w-full aspect-square max-w-[180px]">
                <Image
                  src="/upload_image_modal/good_before.png"
                  alt="Good example before"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <ArrowRight className="text-green-600 shrink-0" />
              <div className="relative w-full aspect-square max-w-[180px]">
                <Image
                  src="/upload_image_modal/good_after.png"
                  alt="Good example after"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-red-500 font-medium mb-3">
              <XCircle className="text-red-500 size-5" />
              <span>Bad</span>
            </div>
            <div className="flex items-center justify-between gap-2 sm:gap-6">
              <div className="relative w-full aspect-square max-w-[180px]">
                <Image
                  src="/upload_image_modal/wrong_before.png"
                  alt="Bad example before"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <ArrowRight className="text-red-500 shrink-0" />
              <div className="relative w-full aspect-square max-w-[180px]">
                <Image
                  src="/upload_image_modal/wrong_after.png"
                  alt="Bad example after"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8">
          <Button className="w-full sm:w-auto rounded-full bg-[#C5B4A3] hover:bg-[#B5A493] px-8" onClick={() => setOpen(false)}>
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}