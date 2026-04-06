import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function InvoiceDetailSkeleton() {
  return (
    <div className="flex flex-col gap-2 w-full md:w-1/2 animate-pulse">
      <Skeleton className="w-32 h-5" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-2/3 h-4" />
      <Skeleton className="w-1/2 h-4" />
      <Skeleton className="w-5/6 h-4" />
    </div>
  );
}
