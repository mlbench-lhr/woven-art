import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LandingTourCardSkeleton() {
  return (
    <div className="col-span-4 w-full h-fit md:h-[430px] pb-3 md:pb-0 bg-white rounded-[16px] overflow-hidden shadow-lg border border-gray-200 flex flex-col justify-start items-start animate-pulse">
      <div className="w-full relative h-[250px] md:h-[275px]">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="px-3 w-full pt-5 flex flex-col justify-start items-start gap-2 md:gap-4">
        <Skeleton className="w-3/4 h-5" />

        <div className="flex items-center justify-between w-full">
          <Skeleton className="w-20 h-5" />
          <Skeleton className="w-14 h-5" />
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-12 h-4" />
          </div>
          <Skeleton className="w-20 h-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}
