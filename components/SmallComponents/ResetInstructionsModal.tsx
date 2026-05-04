"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ResetInstructionsModal({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-32px)] sm:max-w-[400px] rounded-[28px] p-8 sm:p-10 bg-white border-0">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold text-[#171d1a]">
            Reset Instructions
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm mt-2">
            Are you sure you want to reset the instructions?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold"
            onClick={onConfirm}
          >
            Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
