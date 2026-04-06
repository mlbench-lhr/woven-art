import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReservationPageSkeleton() {
  return (
    <div className="p-4 animate-pulse flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-5 w-32" />
          </div>

          <Skeleton className="w-full h-[260px] lg:h-[300px] rounded-2xl" />

          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-3/4" />
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-6">
          {/* Vendor Info */}
          <div className="flex flex-col gap-4 p-4 border rounded-2xl">
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-3 w-[calc(100%-80px)]">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex flex-col gap-2 w-full">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-10 rounded-md" />
            </div>

            <Skeleton className="h-10 w-full rounded-xl" />

            <div className="flex flex-col gap-2 mt-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-52" />
            </div>

            <div className="flex flex-col gap-2 mt-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-[188px] w-full rounded-xl" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex flex-col gap-4 p-4 border rounded-2xl">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex flex-col gap-2 w-full">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>

            <Skeleton className="h-4 w-40" />
          </div>

          {/* QR Code */}
          <div className="p-4 bg-white border rounded-xl flex flex-col gap-3">
            <Skeleton className="h-5 w-24" />
            <div className="flex gap-4">
              <Skeleton className="h-32 w-32 rounded-lg" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
