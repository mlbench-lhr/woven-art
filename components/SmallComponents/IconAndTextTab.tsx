export const IconAndTextTab = ({ text, icon }: { text: string; icon: any }) => {
  return (
    <div className="w-full col-span-1 flex justify-start items-start gap-1 leading-tight">
      {icon}
      <span className="w-[calc(100%-20px)]">{text}</span>
    </div>
  );
};

export const IconAndTextTab2 = ({
  text,
  icon,
  textClasses = " text-[12px] font-medium text-primary leading-[10px] ",
  alignClass = "items-center",
}: {
  text: string;
  icon: any;
  textClasses?: string;
  alignClass?: string;
}) => {
  console.log("items-start----", alignClass);

  return (
    <div className={`w-fit flex justify-start ${alignClass} gap-1`}>
      {icon}
      <span className={`w-[calc(100%-20px)] ${textClasses}`}>{text}</span>
    </div>
  );
};
