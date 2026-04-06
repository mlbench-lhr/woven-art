import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BoxProviderWithName } from "@/components/providers/BoxProviderWithName";

const ReservationsListSkeleton = () => {
  return (
    <div className="w-full space-y-2">
      <BoxProviderWithName>
        <div className="w-full">
          <BoxProviderWithName noBorder={true} className="!p-0">
            {/* User profile */}
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="w-32 h-3 rounded" />
                <Skeleton className="w-40 h-3 rounded" />
              </div>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mt-4 gap-y-4 items-start">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <Skeleton className="w-20 h-3 rounded" />
                  <Skeleton className="w-28 h-3 rounded" />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex gap-2 justify-between items-center mt-4 w-full border-t pt-4">
              <Skeleton className="w-20 h-6 rounded" />
              <div className="flex gap-2">
                <Skeleton className="w-28 h-10 rounded-md" />
                <Skeleton className="w-28 h-10 rounded-md" />
              </div>
            </div>
          </BoxProviderWithName>
        </div>
      </BoxProviderWithName>
    </div>
  );
};

export default ReservationsListSkeleton;
