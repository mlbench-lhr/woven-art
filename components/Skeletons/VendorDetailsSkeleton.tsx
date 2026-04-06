export default function VendorDetailsSkeleton() {
  return (
    <div className="p-2 md:p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <div className="w-32 h-6 bg-gray-200 rounded" />
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-6">
        <div className="w-full md:w-64 h-7 bg-gray-200 rounded" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-40 h-4 bg-gray-200 rounded" />
            <div className="w-32 h-4 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="w-40 h-4 bg-gray-200 rounded" />
            <div className="w-32 h-4 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="w-40 h-4 bg-gray-200 rounded" />
            <div className="w-32 h-4 bg-gray-200 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-40 h-4 bg-gray-200 rounded" />
            <div className="w-32 h-4 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="w-40 h-4 bg-gray-200 rounded" />
            <div className="w-32 h-4 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="w-40 h-4 bg-gray-200 rounded" />
            <div className="w-32 h-4 bg-gray-200 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-52 h-4 bg-gray-200 rounded" />
            <div className="w-40 h-4 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="w-52 h-4 bg-gray-200 rounded" />
            <div className="w-40 h-4 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="w-52 h-4 bg-gray-200 rounded" />
            <div className="w-40 h-4 bg-gray-200 rounded" />
          </div>
        </div>

        <div className="w-full md:w-[400px] h-[188px] bg-gray-200 rounded-xl" />

        <div className="border rounded-lg p-6 w-full md:w-[622px] space-y-3">
          <div className="w-32 h-4 bg-gray-200 rounded" />
          <div className="w-full h-20 bg-gray-200 rounded" />
        </div>

        <div className="space-y-4 w-full">
          <div className="w-40 h-4 bg-gray-200 rounded" />
          <div className="grid grid-cols-4 md:grid-cols-12 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="col-span-4 border rounded-lg p-4 space-y-3"
              >
                <div className="w-full h-40 bg-gray-200 rounded" />
                <div className="w-24 h-4 bg-gray-200 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-24 h-8 bg-gray-200 rounded" />
          <div className="w-24 h-8 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
