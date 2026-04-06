export interface BecomeVendorCardType {
  icon?: any;
  heading?: string;
  text?: string;
}
export default function BecomeVendorCard({
  text,
  heading,
  icon,
}: BecomeVendorCardType) {
  return (
    <div className="w-full flex-1 h-full flex flex-col justify-between gap-3 md:gap-[20px] items-start rounded-[10px] border py-3 md:py-4 px-3 md:px-5.5">
      <div className="flex justify-center items-center w-[50px] h-[50px] rounded-full bg-[#FFEAF4]">
        {icon}
      </div>
      <div className="w-[calc(100%)] h-fit flex justify-start items-start flex-col gap-1">
        <h3 className="text-sm md:text-base font-semibold">{heading}</h3>
        <h4 className="text-sm md:text-base font-[500] text-[rgba(0,0,0,0.50)] leading-tight">
          {text}
        </h4>
      </div>
    </div>
  );
}
