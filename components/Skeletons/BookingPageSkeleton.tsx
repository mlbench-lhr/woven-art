import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingPageSkeleton() {
  return (
    <div className="w-full flex flex-col gap-4 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="w-40 h-7" />
        <div className="flex gap-2">
          <Skeleton className="w-32 h-10 rounded-md" />
          <Skeleton className="w-32 h-10 rounded-md" />
        </div>
      </div>

      <div className="border rounded-xl p-4 w-full flex flex-col gap-4">
        <Skeleton className="w-60 h-6" />

        <div className="border rounded-xl p-4 w-full flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <Skeleton className="w-full md:w-[200px] h-[200px] rounded-2xl" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-4" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-12 w-full gap-4">
            <div className="col-span-12 md:col-span-6 flex flex-col gap-3">
              <Skeleton className="w-40 h-5" />
              <Skeleton className="w-28 h-5" />
              <Skeleton className="w-[430px] h-[350px] max-w-full rounded-xl" />

              <Skeleton className="w-56 h-4" />
              <Skeleton className="w-40 h-4" />

              <div className="flex gap-2">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="w-6 h-6 rounded" />
              </div>

              <Skeleton className="w-32 h-10 rounded-md" />
            </div>

            <div className="col-span-12 md:col-span-6 flex flex-col gap-4">
              <Skeleton className="w-60 h-5" />
              <div className="border rounded-xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="w-32 h-4" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                  </div>
                  <Skeleton className="w-12 h-6 rounded-md" />
                </div>

                <Skeleton className="w-full h-10 rounded-md" />

                <div className="flex flex-col gap-2">
                  <Skeleton className="w-40 h-5" />
                  <Skeleton className="w-48 h-4" />
                  <Skeleton className="w-40 h-4" />
                </div>

                <div className="flex flex-col gap-2">
                  <Skeleton className="w-28 h-5" />
                  <Skeleton className="w-full h-[188px] rounded-xl" />

                  <div className="flex justify-between items-center">
                    <Skeleton className="w-40 h-5" />
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="w-5 h-5 rounded" />
                      ))}
                    </div>
                  </div>

                  <Skeleton className="w-full h-[90px] rounded-xl" />
                  <Skeleton className="w-full h-10 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
