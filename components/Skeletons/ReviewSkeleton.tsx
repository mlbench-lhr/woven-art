export default function ReviewSkeleton() {
  return (
    <div className="flex flex-col w-full gap-3 pb-8 animate-pulse">
      <div className="w-full bg-white rounded-xl p-4 border space-y-3">
        <div className="mt-6 w-full space-y-4">
          <div className="w-full h-10 bg-gray-200 rounded" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border rounded-xl p-3 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="w-full h-2 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          <div className="border rounded-xl p-3 flex flex-col items-center gap-2">
            <div className="w-20 h-10 bg-gray-200 rounded" />
            <div className="w-32 h-6 bg-gray-200 rounded" />
            <div className="w-24 h-3 bg-gray-200 rounded" />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="border rounded-xl p-3 space-y-2 w-full flex flex-col"
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex flex-col gap-1">
                    <div className="w-24 h-3 bg-gray-200 rounded" />
                    <div className="w-16 h-2 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-4 h-4 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded" />
              <div className="w-[90%] h-3 bg-gray-200 rounded" />
              <div className="w-[60%] h-3 bg-gray-200 rounded" />
            </div>
          ))}
          <div className="w-36 h-10 bg-gray-200 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}
