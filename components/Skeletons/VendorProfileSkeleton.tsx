import React from "react";

export default function VendorProfileSkeleton() {
  return (
    <div className="animate-pulse w-full flex flex-col gap-4 pb-8">
      {/* Cover + Profile Image */}
      <div className="w-full h-[320px] bg-gray-200 rounded-xl relative">
        <div className="w-[90px] h-[90px] md:w-[180px] md:h-[180px] rounded-full bg-gray-200 absolute left-4 sm:left-8 lg:left-14 bottom-0 ring-2 ring-white" />
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start -mt-10 sm:-mt-8 md:mt-3 lg:-mt-8 gap-3">
        <div className="flex flex-col ps-[110px] sm:ps-[140px] w-full md:ps-0 lg:ps-[230px] gap-2">
          <div className="w-40 h-5 bg-gray-200 rounded" />
          <div className="w-28 h-4 bg-gray-200 rounded" />
        </div>
        <div className="w-full md:w-[160px] h-10 bg-gray-200 rounded-lg" />
      </div>

      {/* Stats boxes */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border rounded-2xl h-[100px] md:h-[130px] flex flex-col justify-center items-center gap-2"
          >
            <div className="w-12 h-6 bg-gray-200 rounded" />
            <div className="w-20 h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* About + Languages + Contact */}
      <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-3.5">
        <div className="col-span-1 md:col-span-3 flex flex-col gap-3.5">
          <div className="border rounded-xl p-4 space-y-3">
            <div className="w-32 h-5 bg-gray-200 rounded" />
            <div className="w-full h-20 bg-gray-200 rounded" />
          </div>

          <div className="border rounded-xl p-4 space-y-3">
            <div className="w-40 h-5 bg-gray-200 rounded" />
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-24 h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-3.5">
          <div className="border rounded-xl p-4 space-y-4">
            <div className="w-40 h-5 bg-gray-200 rounded" />

            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-10 bg-gray-200 rounded-lg" />
            ))}

            <div className="w-full h-[188px] rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="border rounded-xl p-4 w-full space-y-4">
        <div className="w-28 h-5 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Reviews Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        <div className="rounded-xl p-4 border space-y-2 bg-gray-50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 w-full">
              <div className="w-6 h-4 bg-gray-200 rounded" />
              <div className="flex-1 h-3 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>

        <div className="rounded-xl p-4 border bg-gray-50 flex flex-col justify-center items-center gap-2">
          <div className="w-16 h-10 bg-gray-200 rounded" />
          <div className="w-24 h-6 bg-gray-200 rounded" />
          <div className="w-32 h-4 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="w-full space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="space-y-1">
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                  <div className="w-16 h-3 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="w-20 h-4 bg-gray-200 rounded" />
            </div>
            <div className="w-full h-16 bg-gray-200 rounded" />
          </div>
        ))}
        <div className="w-40 h-10 bg-gray-200 rounded-lg mx-auto" />
      </div>
    </div>
  );
}
