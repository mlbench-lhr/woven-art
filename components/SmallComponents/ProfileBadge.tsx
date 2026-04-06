import Image from "next/image";

const imageSizes: Record<string, string> = {
  small: " w-[30px] h-[30px] ",
  medium: " w-[40px] h-[40px] ",
  large: " w-[40px] h-[40px] md:w-[60px] md:h-[60px] ",
  custom: " w-[40px] h-[40px] md:w-[70px] md:h-[70px] ",
};

const headingTextSize: Record<string, string> = {
  small: " text-[10px] ",
  medium: " text-[13px] ",
  large: " text-sm md:text-[18px] ",
  custom: " text-sm md:text-[16px] ",
};

const descTextSize: Record<string, string> = {
  small: " text-[8px] ",
  medium: " text-xs md:text-[11px] ",
  large: " text-xs md:text-[12px] ",
  custom: " text-xs md:text-[14px] ",
};

export const ProfileBadge = ({
  image,
  title,
  subTitle,
  size = "small",
  icon,
  extraComponent,
  isTitleLink = false,
  fullWidth = false,
}: {
  image?: string;
  title: string;
  subTitle: string;
  icon?: any;
  size?: "small" | "medium" | "large" | "custom";
  extraComponent?: React.ReactNode | React.ComponentType<any>;
  isTitleLink?: boolean;
  fullWidth?: boolean;
}) => {
  const ExtraComponent = extraComponent;
  return (
    <div
      className={`${fullWidth && "w-full"} flex justify-start items-center ${
        size === "custom" ? "gap-3.5" : "gap-1.5"
      }`}
    >
      {image && (
        <Image
          src={image}
          className={`rounded-full object-cover ${imageSizes[size]}`}
          alt=""
          width={30}
          height={30}
        />
      )}
      {icon && icon}
      <div
        className={`${
          fullWidth && "w-[calc(100%-32px)]"
        } flex flex-col justify-start leading-tight items-start`}
      >
        <h4
          className={`${headingTextSize[size]} ${
            isTitleLink && "hover:underline"
          } font-medium text-black`}
        >
          {title}
        </h4>
        <h5
          className={`${descTextSize[size]} font-normal text-[rgba(0,0,0,0.50)]`}
        >
          {subTitle}
        </h5>
        {ExtraComponent &&
          (typeof ExtraComponent === "function" ? (
            <ExtraComponent />
          ) : (
            ExtraComponent
          ))}{" "}
      </div>
    </div>
  );
};
