import { BasicStructureWithName } from "../providers/BasicStructureWithName";
import { BoxProviderWithName } from "../providers/BoxProviderWithName";

export default function BookingPaymentPageSkeleton() {
  return (
    <BasicStructureWithName name="Payment" showBackOption>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT – Payment Option */}
        <div className="col-span-1">
          <BoxProviderWithName
            noBorder={true}
            className="!p-0"
            name="Payment Option"
            textClasses=" text-[18px] font-semibold "
          >
            <div className="flex gap-4 flex-col mt-4">
              {/* Option 1 */}
              <div className="px-3 py-2 flex items-start gap-4 border rounded-2xl">
                <div className="w-[20px] h-[20px] bg-gray-200 rounded-full" />
                <div className="flex flex-col gap-2">
                  <div className="w-[240px] h-[16px] bg-gray-200 rounded" />
                  <div className="w-[300px] h-[14px] bg-gray-200 rounded" />
                  <div className="w-[120px] h-[14px] bg-gray-200 rounded" />
                </div>
              </div>

              {/* Option 2 */}
              <div className="px-3 py-2 flex items-start gap-4 border rounded-2xl">
                <div className="w-[20px] h-[20px] bg-gray-200 rounded-full" />
                <div className="flex flex-col gap-2">
                  <div className="w-[200px] h-[16px] bg-gray-200 rounded" />
                  <div className="w-[240px] h-[14px] bg-gray-200 rounded" />
                  <div className="w-[90px] h-[14px] bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </BoxProviderWithName>
        </div>

        {/* RIGHT – Payment Summary */}
        <div className="col-span-1">
          <BoxProviderWithName
            noBorder={true}
            className="!p-0"
            name="Payment Summary"
            textClasses=" text-[18px] font-semibold "
          >
            <BoxProviderWithName textClasses=" text-[18px] font-semibold ">
              <div className="flex flex-col w-full gap-4">
                {/* Vendor Header */}
                <div className="flex justify-between items-center w-full">
                  <div className="w-[260px] h-[60px] bg-gray-200 rounded-xl" />
                  <div className="flex gap-1">
                    <div className="w-[16px] h-[16px] bg-gray-200 rounded" />
                    <div className="w-[16px] h-[16px] bg-gray-200 rounded" />
                    <div className="w-[16px] h-[16px] bg-gray-200 rounded" />
                    <div className="w-[16px] h-[16px] bg-gray-200 rounded" />
                    <div className="w-[16px] h-[16px] bg-gray-200 rounded" />
                    <div className="w-[20px] h-[14px] bg-gray-200 rounded" />
                  </div>
                </div>

                {/* Activity Row */}
                <div className="flex w-full gap-3">
                  <div className="w-[80px] h-[80px] bg-gray-200 rounded-[9px]" />
                  <div className="flex flex-col gap-2 w-full">
                    <div className="w-[200px] h-[16px] bg-gray-200 rounded" />
                    <div className="w-[180px] h-[14px] bg-gray-200 rounded" />
                    <div className="w-[250px] h-[14px] bg-gray-200 rounded" />
                  </div>
                </div>

                {/* Date */}
                <div className="flex justify-between items-center w-full">
                  <div className="w-[40px] h-[12px] bg-gray-200 rounded" />
                  <div className="w-[160px] h-[14px] bg-gray-200 rounded" />
                </div>

                {/* Guests */}
                <div className="flex justify-between items-center w-full">
                  <div className="w-[50px] h-[12px] bg-gray-200 rounded" />
                  <div className="w-[150px] h-[14px] bg-gray-200 rounded" />
                </div>

                {/* Icon note */}
                <div className="pt-3.5 border-t w-full">
                  <div className="flex gap-2 items-center">
                    <div className="w-[20px] h-[20px] bg-gray-200 rounded" />
                    <div className="w-[260px] h-[14px] bg-gray-200 rounded" />
                  </div>
                </div>
              </div>

              {/* Total Row */}
              <div className="w-[calc(100%+28px)] -ms-3.5 -mb-3 bg-gray-200 px-3.5 py-2 rounded-b-2xl flex justify-between items-center mt-4">
                <div className="w-[60px] h-[18px] bg-gray-200 rounded" />
                <div className="w-[90px] h-[18px] bg-gray-200 rounded" />
              </div>
            </BoxProviderWithName>
          </BoxProviderWithName>
        </div>

        {/* Bottom Button */}
        <div className="w-full md:w-[300px] mt-4">
          <div className="w-full h-[48px] bg-gray-200 rounded-xl" />
        </div>
      </div>
    </BasicStructureWithName>
  );
}
