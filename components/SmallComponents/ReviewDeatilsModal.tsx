// components/FavoriteButton.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Rating from "./RatingField";
import Image from "next/image";
import { ReviewWithPopulatedData } from "@/lib/types/review";
import { Textarea } from "../ui/textarea";
import { ProfileBadge } from "./ProfileBadge";
import { StarIcon } from "@/public/allIcons/page";
import { ReviewModal } from "./ReviewModal";
import { Button } from "../ui/button";
import Link from "next/link";
import { getPartOfDay } from "@/lib/helper/timeFunctions";

interface ReviewButtonProps {
  data: ReviewWithPopulatedData;
  triggerComponent?: React.ReactNode | React.ComponentType<any>;
  onSuccess?: () => void;
}

export const ReviewDetailsModal = ({
  data,
  triggerComponent,
  onSuccess,
}: ReviewButtonProps) => {
  const TriggerComponent = triggerComponent;

  return (
    <Dialog>
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
          <>
            <div className="w-full flex justify-start items-center gap-2">
              <Image
                src={data.activity.uploads?.[0]}
                alt=""
                width={200}
                height={200}
                className="w-full md:w-[100px] h-auto md:h-[80px] object-cover object-center rounded-2xl"
              />
              <div className="w-fit flex justify-center items-start flex-col ">
                <h2 className="text-base font-semibold">
                  {data.activity.title}
                </h2>
                <h3 className="text-sm font-normal">
                  Duration: {getPartOfDay(data.booking.selectDate)} ({data.activity.duration} hours)
                </h3>
                <h4 className="text-sm font-normal">
                  {`From : ${data.booking.paymentDetails.currency} ${data.activity.slots?.[0]?.adultPrice}/Adult,  ${data.booking.paymentDetails.currency} ${data.activity.slots?.[0]?.adultPrice}/Child`}
                </h4>
                <div className="w-fit flex justify-start items-center gap-1">
                  <StarIcon />
                  <span className="text-[12px] font-medium text-black/70">
                    {Number(data.activity.rating.average).toFixed(1)}
                    <span className="text-black/50">
                      {" "}
                      ({data.activity.rating.total} Reviews)
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <ProfileBadge
              size="medium"
              isTitleLink={true}
              title={data?.vendor?.vendorDetails?.companyName || ""}
              subTitle={
                "TÜRSAB Number: " + data?.vendor?.vendorDetails?.tursabNumber
              }
              image={data?.vendor?.avatar || "/placeholderDp.png"}
              extraComponent={
                <div className="w-fit flex justify-start items-center gap-1">
                  <StarIcon />
                  <span className="text-[12px] font-medium text-black/60">
                    {Number(data.vendor.vendorDetails.rating.average).toFixed(
                      1
                    )}
                  </span>
                </div>
              }
            />
            <div className="w-full flex flex-col justify-start items-start gap-2">
              <div className="w-full flex flex-col justify-between items-start">
                <h3 className="text-base font-semibold">Rating</h3>
                <div className="w-fit flex justify-start items-center mt-1">
                  <Rating value={data.rating} iconsSize="22" />
                </div>
              </div>
              {data.review.map((item, index) => (
                <div
                  key={index}
                  className="w-full flex flex-col justify-start items-start gap-2"
                >
                  <div className="w-full flex flex-col justify-between items-start gap-2">
                    <h3 className="text-base font-semibold">
                      Tell us about your experience…
                    </h3>
                    <Textarea
                      className="bg-[#FFF8FB] border h-[90px]"
                      disabled
                      value={item.text}
                    />
                    {item.uploads?.length > 0 && (
                      <div className="w-full flex flex-col justify-between items-start gap-2">
                        <h3 className="text-base font-semibold">Uploads</h3>
                        <div className="w-full grid-cols-3 gap-2">
                          {item.uploads.map((image, index2) => (
                            <Image
                              src={image}
                              key={index2}
                              height={100}
                              width={100}
                              className="col-span-1 h-[100px]"
                              alt=""
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant={"main_green_button"} className="w-full" asChild>
              <Link href={`/bookings/detail/${data.booking._id}`}>
                View Booking Details
              </Link>
            </Button>
          </>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
