// components/FavoriteButton.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import RejectVendorDialog from "../RejectVendorDialog";
import { useState } from "react";
import { TextInputComponent } from "./InputComponents";
interface ReviewButtonProps {
  data: {
    _id: string;
    activity: {
      title: string;
    };
    vendor?: {
      companyName?: string;
      paymentInfo?: {
        ibanNumber?: string;
        bankName?: string;
        accountHolderName?: string;
        currency?: string;
      };
    };
    booking: {
      paymentDetails: {
        totalAmount: number;
        vendorPayable: number;
        commission: number;
        currency: string;
      };
    };
  };
  triggerComponent?: React.ReactNode | React.ComponentType<any>;
  onSuccess?: () => void;
}

export const PayoutDetailsModal = ({
  data,
  triggerComponent,
  onSuccess,
}: ReviewButtonProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const TriggerComponent = triggerComponent || (
    <div className="w-fit text-primary underline hover:no-underline text-xs font-normal cursor-pointer">
      View Details
    </div>
  );

  async function sendPayout() {
    try {
      setLoading(true);
      const res = await fetch("/api/payments/sendVendorCommission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: data._id,
          reference,
        }),
      });

      const respData = await res.json();
      setOpen(false);
      onSuccess && onSuccess();
      if (!res.ok) throw new Error(respData.error || "Failed to send payout");
    } catch (err: any) {
      console.log("Error sending payout: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">
        {TriggerComponent &&
          (typeof TriggerComponent === "function" ? (
            <TriggerComponent />
          ) : (
            TriggerComponent
          ))}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-center w-full ">Details</DialogTitle>
        <DialogDescription className="mt-2 space-y-4">
          <div className="w-full flex justify-between items-center flex-wrap gap-y-4">
            <div className="flex flex-col gap-1 justify-start items-start w-full">
              <h4 className="text-sm font-semibold text-black">Tour Name</h4>
              <h4 className="text-sm font-medium text-black/70">
                {data.activity.title}
              </h4>
            </div>
            <div className="flex flex-col gap-1 justify-start items-start w-1/2">
          <h4 className="text-sm font-semibold text-black">Total Amount</h4>
          <h4 className="text-sm font-medium text-black/70">
                {data.booking.paymentDetails.totalAmount}
          </h4>
        </div>
        <div className="flex flex-col gap-1 justify-start items-start w-1/2">
          <h4 className="text-sm font-semibold text-black">
            Vendor Net Payable
          </h4>
          <h4 className="text-sm font-medium text-black/70">
                {data.booking.paymentDetails.vendorPayable.toFixed(2)}
          </h4>
        </div>
            <div className="flex flex-col gap-1 justify-start items-start w-1/2">
              <h4 className="text-sm font-semibold text-black">
                Commission (%)
              </h4>
              <h4 className="text-sm font-medium text-black/70">
                {data.booking.paymentDetails.commission}%
              </h4>
            </div>
            <div className="flex flex-col gap-1 justify-start items-start w-full">
              <h4 className="text-sm font-semibold text-black">
                Vendor Bank Details
              </h4>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInputComponent
                  label="Account Holder"
                  disabled
                  value={data.vendor?.paymentInfo?.accountHolderName || ""}
                />
                <TextInputComponent
                  label="Bank Name"
                  disabled
                  value={data.vendor?.paymentInfo?.bankName || ""}
                />
                <TextInputComponent
                  label="IBAN"
                  disabled
                  value={data.vendor?.paymentInfo?.ibanNumber || ""}
                />
                <TextInputComponent
                  label="Currency"
                  disabled
                  value={
                    data.vendor?.paymentInfo?.currency ||
                    data.booking.paymentDetails.currency ||
                    ""
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 justify-start items-start w-full">
              <h4 className="text-sm font-semibold text-black">
                EFT/FAST Reference
              </h4>
              <TextInputComponent
                label="Reference"
                value={reference}
                onChange={(v) => setReference(v)}
              />
            </div>
            <div className="w-full grid grid-cols-2 gap-4">
              <Button
                variant={"main_green_button"}
                className="!bg-[#51C058]"
                onClick={() => {
                  sendPayout();
                }}
                loading={loading}
              >
                Accept
              </Button>
              <RejectVendorDialog
                type={"payment"}
                id={data._id}
                onSuccess={() => {
                  setOpen(false);
                  onSuccess && onSuccess();
                }}
              />
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
