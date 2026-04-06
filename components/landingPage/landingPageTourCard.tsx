import React from "react";
import { Star } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";

import { ToursAndActivityWithVendor } from "@/lib/mongodb/models/ToursAndActivity";
import moment from "moment";

export default function TourCard(item: ToursAndActivityWithVendor) {
  return (
    <div className="col-span-4 w-full h-fit md:h-[430px] pb-3 md:pb-0 bg-white rounded-[16px] overflow-hidden shadow-lg border border-gray-200 flex flex-col justify-start items-start">
      <div className="w-full relative h-[250px] md:h-[275px]">
        <Image
          src={item?.uploads?.[0]}
          alt="Woven Art cave dwellings"
          className="w-full h-[250px] md:h-[275px] object-cover object-center"
          width={300}
          height={275}
        />
      </div>

      {/* Content */}
      <div className="px-3 w-full pt-5 flex flex-col justify-start items-start gap-2 md:gap-4">
        {/* Title */}
        <h2 className="text-base md:text-[18px] font-[600] text-gray-900 line-clamp-1">
          {item?.title}
        </h2>

        {/* Price and Rating */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-medium text-gray-900">
              ${item?.slots?.[0]?.adultPrice}
            </span>
            <span className="text-xs text-gray-500">/Person</span>
          </div>
          {item?.rating?.average ? (
            <div className="flex items-center gap-1">
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              <span className="text-base font-medium text-gray-900">
                {item.rating.average}
              </span>
            </div>
          ) : null}
        </div>

        {/* Duration and Button */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
            >
              <path
                d="M12.9998 2.16699C18.9831 2.16699 23.8332 7.01708 23.8332 13.0003C23.8332 18.9836 18.9831 23.8337 12.9998 23.8337C7.01659 23.8337 2.1665 18.9836 2.1665 13.0003C2.1665 7.01708 7.01659 2.16699 12.9998 2.16699ZM12.9998 6.50033C12.7125 6.50033 12.437 6.61446 12.2338 6.81763C12.0306 7.02079 11.9165 7.29634 11.9165 7.58366V13.0003C11.9166 13.2876 12.0307 13.5631 12.2339 13.7662L15.4839 17.0162C15.6882 17.2136 15.9619 17.3228 16.2459 17.3203C16.53 17.3178 16.8017 17.2039 17.0026 17.003C17.2034 16.8022 17.3173 16.5305 17.3198 16.2464C17.3223 15.9624 17.2131 15.6887 17.0158 15.4844L14.0832 12.5518V7.58366C14.0832 7.29634 13.969 7.02079 13.7659 6.81763C13.5627 6.61446 13.2872 6.50033 12.9998 6.50033Z"
                fill="#B32053"
              />
            </svg>
            <span className="text-sm text-gray-500">
              {moment(item.slots?.[0]?.endDate).diff(
                item.slots?.[0]?.startDate,
                "days"
              )}{" "}
              Days
            </span>
          </div>
          <Button
            variant={"green_secondary_button"}
            className="text-xs"
            style={{ height: "34px" }}
          >
            <Link href={`/explore/detail/${item._id}`}>Book now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
