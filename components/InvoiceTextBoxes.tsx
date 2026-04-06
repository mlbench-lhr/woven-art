const titles: Record<string, string> = {
  invoice: "Invoice",
  paymentDetails: "Payment Details",
  tourDetails: "Tour Details",
  priceBreakdown: "Price Breakdown",
  travelerInformation: "Traveler Information",
  vendorInformation: "Vendor Information",
};
export const InvoiceTextBoxes = ({
  heading,
  textList,
}: {
  heading: string;
  textList: string[] | Record<string, any>;
}) => {
  const formatValue = (key: string, value: any): string => {
    if (key === "participants" && typeof value === "object")
      return `Participants: ${value.adults} Adults${
        value.children
          ? `, ${value.children} Child${value.children > 1 ? "ren" : ""}`
          : ""
      }`;
    if (key === "basePrice" && typeof value === "object")
      return `Base Price (${value.adults} Adults × ${value.currency}${value.perAdult}): ${value.currency}${value.total}`;
    if (key === "childPrice" && typeof value === "object")
      return `Child Price (${value.children} × ${value.currency}${value.perChild}): ${value.currency}${value.total}`;
    return `${key[0].toUpperCase() + key.slice(1)}: ${value}`;
  };

  const items = Array.isArray(textList)
    ? textList
    : Object.entries(textList).map(([key, value]) => formatValue(key, value));

  return (
    <div className="flex flex-col gap-0 md:gap-1 justify-start items-start w-full md:w-1/2">
      <h3 className="text-sm md:text-base font-semibold">{titles[heading]}</h3>
      {items.map((item, index) => (
        <span className="text-xs md:text-base font-[400]" key={index}>
          {item}
        </span>
      ))}
    </div>
  );
};
