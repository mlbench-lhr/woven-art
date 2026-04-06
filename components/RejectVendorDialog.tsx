"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";
import { TextAreaInputComponent } from "./SmallComponents/InputComponents";
import Swal from "sweetalert2";

export default function RejectVendorDialog({
  id,
  type = "vendor",
  onSuccess,
}: {
  id: string;
  type?: "activity" | "vendor" | "payment";
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [reason, setReason] = useState("");
  console.log("reason----", reason);

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      await axios.put(`/api/admin/vendor-applications/update/${id}`, {
        roleRejected: {
          isRoleRejected: true,
          reason: reason,
        },
      });
      setDeleting(false);
      router.push("/admin/vendor-applications");
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Vendor rejected Successfully`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("err---", error);
    }
  };

  const handleConfirmActivity = async () => {
    try {
      setDeleting(true);
      await axios.put(`/api/toursAndActivity/update/${id}`, {
        rejected: {
          isRejected: true,
          reason: reason,
        },
      });
      setDeleting(false);
      router.push("/admin/tours-and-activities");
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Vendor rejected Successfully`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("err---", error);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setDeleting(true);
      await axios.put(`/api/payments/update/${id}`, {
        paymentStatus: "rejected",
        rejected: {
          isRejected: true,
          reason: reason,
        },
      });
      setDeleting(false);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Vendor rejected Successfully`,
        timer: 1500,
        showConfirmButton: false,
      });
      onSuccess && onSuccess();
    } catch (error) {
      console.log("err---", error);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 rounded-lg font-semibold">
            Reject
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg rounded-[16px] flex flex-col justify-start items-center gap-[8px] p-[40px]">
          <DialogHeader className="w-full">
            <DialogTitle className="text-center w-full heading-text-style-4">
              Reason For Rejection
            </DialogTitle>
            <DialogDescription className="mt-2">
              <TextAreaInputComponent
                label="Add a reason"
                value={reason}
                onChange={(e) => setReason(e)}
              />
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex items-center justify-end w-full">
            <DialogFooter className="w-full">
              <div className="w-full">
                <DialogClose asChild>
                  <Button
                    onClick={
                      type === "vendor"
                        ? handleConfirm
                        : type === "payment"
                        ? handleConfirmPayment
                        : handleConfirmActivity
                    }
                    variant={"main_green_button"}
                    className="w-full !bg-red-500"
                    disabled={deleting}
                  >
                    {deleting ? "Rejecting..." : "Reject"}
                  </Button>
                </DialogClose>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
