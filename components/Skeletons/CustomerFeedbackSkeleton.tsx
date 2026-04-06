import React from "react";

// Mock components - replace with your actual imports
const BoxProviderWithName = ({
  name,
  className,
  noBorder,
  leftSideComponent,
  rightSideComponent,
  children,
}: any) => (
  <div
    className={`border rounded-lg p-4 ${
      noBorder ? "border-transparent" : "border-gray-200"
    } ${className}`}
  >
    {name && <h3 className="font-semibold mb-3">{name}</h3>}
    {(leftSideComponent || rightSideComponent) && (
      <div className="flex justify-between items-center mb-2">
        {leftSideComponent}
        {rightSideComponent}
      </div>
    )}
    {children}
  </div>
);

const CustomerFeedbackSkeleton = () => {
  return (
    <div className="col-span-16 xl:col-span-7 space-y-2">
      <BoxProviderWithName
        name="Recent Customer Feedback"
        className="!px-0 !pb-0"
        noBorder={true}
      >
        <div className="w-full space-y-3">
          {/* Skeleton items */}
          {[1, 2, 3].map((item) => (
            <BoxProviderWithName
              name={""}
              leftSideComponent={
                <div className="flex items-center gap-3">
                  {/* Avatar skeleton */}
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    {/* Name skeleton */}
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    {/* Date skeleton */}
                    <div className="h-2.5 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              }
              rightSideComponent={
                <div className="w-fit flex justify-start items-center gap-1">
                  {/* Star icon skeleton */}
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                  {/* Rating skeleton */}
                  <div className="h-3 w-3 bg-gray-200 rounded animate-pulse" />
                </div>
              }
              key={item}
              noBorder={true}
              className="!border !px-3.5"
            >
              {/* Tour name skeleton */}
              <div className="h-3.5 w-32 bg-gray-200 rounded -mt-2 mb-2 animate-pulse" />

              {/* Feedback text skeleton */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
              </div>
            </BoxProviderWithName>
          ))}
        </div>
      </BoxProviderWithName>
    </div>
  );
};

export default CustomerFeedbackSkeleton;
