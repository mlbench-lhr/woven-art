import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReservationPageSkeleton() {
  return (
    <div className="w-full flex flex-col gap-4 animate-pulse">
      <div className="rounded-xl p-4">
        <div className="grid grid-cols-10 gap-4">
          <div className="col-span-10">
            <div className=" rounded-xl p-4 flex justify-between items-center">
              <Skeleton className="w-48 h-6" />
              <Skeleton className="w-32 h-4" />
            </div>

            <div className="border rounded-xl p-4 mt-3">
              <div className="flex flex-col md:flex-row gap-4">
                <Skeleton className="w-full md:w-[100px] h-[100px] rounded-2xl" />
                <div className="flex flex-col w-full gap-2">
                  <Skeleton className="w-3/4 h-5" />
                  <Skeleton className="w-1/2 h-4" />
                  <Skeleton className="w-2/3 h-4" />
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-28 h-4" />
              </div>

              <div className="flex justify-between items-center mt-1">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-32 h-4" />
              </div>
            </div>
          </div>

          <div className="col-span-10 md:col-span-4 flex flex-col gap-3.5">
            <div className="border rounded-xl p-4">
              <Skeleton className="w-32 h-6 mb-3" />
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex flex-col gap-1 w-full">
                    <Skeleton className="w-1/2 h-4" />
                    <Skeleton className="w-1/3 h-4" />
                  </div>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex flex-col gap-1 w-full">
                      <Skeleton className="w-1/3 h-4" />
                      <Skeleton className="w-1/2 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-10 md:col-span-6 flex flex-col gap-3.5">
            <div className="border rounded-xl p-4">
              <Skeleton className="w-40 h-6 mb-3" />
              <div className="flex flex-col gap-3">
                <div className="flex justify-start items-center gap-8">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-4" />
                </div>

                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-24 h-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
