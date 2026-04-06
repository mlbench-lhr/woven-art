import { BasicStructureWithName } from "../providers/BasicStructureWithName";
import { BoxProviderWithName } from "../providers/BoxProviderWithName";

export default function BookingConfirmPageSkeleton() {
  return (
    <BasicStructureWithName
      name="Booking Details"
      showBackOption
      rightSideComponent={<Placeholder />}
    >
      <div className="flex flex-col w-full gap-3">
        <BoxProviderWithName noBorder>
          <div className="grid grid-cols-12 gap-6">
            {/* LEFT SECTION */}
            <div className="col-span-12 md:col-span-6 flex flex-col gap-4">
              {/* Booking ID */}
              <div className="w-full md:w-[360px] h-[50px] bg-gray-200 rounded-lg" />

              {/* Payment Status */}
              <div className="w-[180px] h-[28px] bg-gray-200 rounded-lg" />

              {/* QR Title */}
              <div className="w-[120px] h-[22px] bg-gray-200 rounded" />

              {/* QR Box */}
              <div className="w-[430px] h-[350px] bg-gray-200 rounded-xl" />

              {/* QR Note */}
              <div className="w-[250px] h-[16px] bg-gray-200 rounded" />

              {/* ID Text */}
              <div className="w-[200px] h-[16px] bg-gray-200 rounded" />

              {/* Copy + Forward */}
              <div className="flex gap-2">
                <div className="w-[24px] h-[24px] bg-gray-200 rounded" />
                <div className="w-[24px] h-[24px] bg-gray-200 rounded" />
              </div>

              {/* Pay Now */}
              <div className="w-[160px] h-[42px] bg-gray-200 rounded-xl" />
            </div>

            {/* RIGHT SECTION */}
            <div className="col-span-12 md:col-span-6 flex flex-col">
              <BoxProviderWithName leftSideComponent={<Placeholder />}>
                <BoxProviderWithName>
                  {/* Vendor Header */}
                  <div className="flex justify-between items-center w-full">
                    <div className="w-[260px] h-[60px] bg-gray-200 rounded-xl" />
                    <div className="w-[50px] h-[28px] bg-gray-200 rounded-xl" />
                  </div>

                  {/* Chat Button */}
                  <div className="w-full h-[42px] bg-gray-200 rounded-xl mt-3" />

                  {/* Contact info */}
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="w-[160px] h-[20px] bg-gray-200 rounded" />
                    <div className="w-[260px] h-[24px] bg-gray-200 rounded" />
                    <div className="w-[260px] h-[24px] bg-gray-200 rounded" />
                  </div>
                </BoxProviderWithName>
              </BoxProviderWithName>
            </div>
          </div>
        </BoxProviderWithName>
      </div>
    </BasicStructureWithName>
  );
}

function Placeholder() {
  return <div className="w-[120px] h-[36px] bg-gray-200 rounded-xl" />;
}
