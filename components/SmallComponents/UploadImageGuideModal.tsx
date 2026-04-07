"use client";

import { useState } from "react";
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
};

export default function UploadImageGuideModal({ triggerComponent }: Props) {
  const TriggerComponent = triggerComponent as any;
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="w-full"
        onClick={() => setOpen(true)}
      >
        {TriggerComponent
          ? typeof TriggerComponent === "function"
            ? <TriggerComponent />
            : TriggerComponent
          : null}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogTitle>What Image Should I Use?</DialogTitle>
        <DialogDescription>
          The best image for a Woven-Art artwork is a close-up of a single person or product with good contrast lighting.
        </DialogDescription>

        <div className="mt-4 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle2 className="text-green-600" />
              <span>Good</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Image
                src="/upload_image_modal/good_before.png"
                alt="Good example before"
                width={180}
                height={180}
                className="w-[180px] h-[180px] rounded-lg object-cover"
              />
              <ArrowRight className="mx-6 text-green-600" />
              <Image
                src="/upload_image_modal/good_after.png"
                alt="Good example after"
                width={180}
                height={180}
                className="w-[180px] h-[180px] rounded-full object-cover"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-red-500 font-medium">
              <XCircle className="text-red-500" />
              <span>Bad</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Image
                src="/upload_image_modal/wrong_before.png"
                alt="Bad example before"
                width={180}
                height={180}
                className="w-[180px] h-[180px] rounded-lg object-cover"
              />
              <ArrowRight className="mx-6 text-red-500" />
              <Image
                src="/upload_image_modal/wrong_after.png"
                alt="Bad example after"
                width={180}
                height={180}
                className="w-[180px] h-[180px] rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}