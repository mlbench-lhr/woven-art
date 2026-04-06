import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function HorizontalTourCardSkeleton() {
  return (
    <div className="border px-3.5 py-3 rounded-xl animate-pulse">
      <div className="flex flex-col md:flex-row items-start gap-2">
        <Skeleton className="w-full md:w-[120px] h-[120px] rounded-xl" />

        <div className="space-y-2 w-full md:w-[calc(100%-128px)]">
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

          <div className="flex justify-between items-center w-full pt-1">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-4" />
              <Skeleton className="w-10 h-4" />
            </div>
            <Skeleton className="w-[92px] h-[26px] rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
