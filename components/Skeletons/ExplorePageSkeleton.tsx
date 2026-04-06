export default function ExplorePageSkeleton() {
  return (
    <div className="flex flex-col w-full gap-3 pb-8 animate-pulse">
      <div className="w-full bg-white rounded-xl p-4 border space-y-3">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div className="flex flex-col gap-1">
              <div className="w-32 h-3 bg-gray-200 rounded" />
              <div className="w-20 h-2 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        </div>

        <div className="w-60 h-5 bg-gray-200 rounded mt-2" />

        <div className="w-full h-60 bg-gray-200 rounded-xl" />

        <div className="space-y-2 w-full mt-2">
          <div className="w-28 h-4 bg-gray-200 rounded" />
          <div className="w-full h-3 bg-gray-200 rounded" />
          <div className="w-[80%] h-3 bg-gray-200 rounded" />
          <div className="w-[60%] h-3 bg-gray-200 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className="space-y-3 border rounded-xl p-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-6 h-6 bg-gray-200 rounded" />
                <div className="w-40 h-3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          <div className="border rounded-xl p-3 space-y-2">
            <div className="w-10 h-3 bg-gray-200" />
            <div className="w-24 h-6 bg-gray-200 rounded" />
            <div className="w-10 h-3 bg-gray-200" />
            <div className="w-full h-8 bg-gray-200 rounded mt-3" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className="border rounded-xl p-3 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded" />
                <div className="w-48 h-3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          <div className="border rounded-xl p-3 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded" />
                <div className="w-48 h-3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative h-[490px] bg-gray-100 rounded-xl" />
          <div className="w-full h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
