"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function StringingTensionModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-32px)] sm:max-w-[520px] rounded-[28px] p-8 sm:p-10 bg-white border-0">
        <div className="flex flex-col items-center text-center">
          <DialogTitle className="text-2xl font-semibold text-[#171d1a] mb-6">
            You're getting the hang of it 😄
          </DialogTitle>
          
          <div className="space-y-4 text-gray-800 text-md leading-relaxed max-w-[450px]">
            <p>
              As your artwork becomes more complete, the tension on the frame increases.
            </p>
            
            <p>
              Please avoid pulling the string too tightly, as this may cause the frame to bend slightly.
            </p>
            
            <p>
              For better tension control, hold the string with both hands while stringing.
            </p>
            
            <p className="font-medium">
              <strong>Tip:</strong> Keep the thread tight enough to stay in place, but do not use excessive force.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            className="w-auto px-6 h-10 rounded-full bg-[#C5B4A3] hover:bg-[#B5A493] text-white font-semibold"
            onClick={onClose}
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
