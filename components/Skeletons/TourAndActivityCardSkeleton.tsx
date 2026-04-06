import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function TourAndActivityCardSkeleton() {
  return (
    <div className="space-y-3 col-span-12 md:col-span-6 lg:col-span-3 h-fit animate-pulse">
      <div className="border md:border px-3.5 py-3 rounded-xl">
        <div className="flex flex-col rounded-t-xl overflow-hidden relative">
          <Skeleton className="w-full h-[120px]" />

          <div className="absolute top-3 right-3">
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>

          <div className="w-full h-[25px] flex justify-between items-center mb-2 px-1.5 bg-gray-200">
            <Skeleton className="w-12 h-3" />
            <Skeleton className="w-12 h-3" />
          </div>

          <div className="space-y-2 w-full text-xs">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex flex-col gap-1 w-full">
                <Skeleton className="w-1/2 h-3" />
                <Skeleton className="w-1/3 h-3" />
              </div>
            </div>

            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-3" />
            <Skeleton className="w-2/3 h-3" />

            <div className="flex items-center gap-1">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-10 h-3" />
            </div>

            <div className="w-full flex justify-between items-center mt-1">
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-[92px] h-[26px] rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
