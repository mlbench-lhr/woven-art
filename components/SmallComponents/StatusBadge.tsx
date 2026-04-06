const variants: any = {
  paid: { bg: "#E7FAE3", text: "#4A9E35" },
  upcoming: { bg: "rgba(0, 142, 255, 0.10)", text: "#008EFF" },
  "in-progress": { bg: "rgba(0, 142, 255, 0.10)", text: "#008EFF" },
  active: { bg: "#E7FAE3", text: "#4A9E35" },
  pending: { bg: "#F8E6D4", text: "#FF862F" },
  "pending admin approval": { bg: "#F8E6D4", text: "#FF862F" },
  cancelled: { bg: "#FAE3E3", text: "#DE191D" },
  rejected: { bg: "#FAE3E3", text: "#DE191D" },
  refunded: { bg: "#E3F7FA", text: "#2B8B94" },
};
export const StatusBadge = ({
  status,
  textClasses = " text-xs font-medium ",
  widthClasses = "w-fit",
}: {
  status: string;
  textClasses?: string;
  widthClasses?: string;
}) => {
  return (
    <div
      className={`px-2.5 py-1 leading-tight flex justify-center items-center ${textClasses} ${widthClasses} rounded-xl capitalize`}
      style={{
        color: variants[status]?.text,
        backgroundColor: variants[status]?.bg,
      }}
    >
      {status}
    </div>
  );
};
