const HeadingCard = ({
  icon,
  heading,
  number,
  text,
  width,
  height,
}: {
  icon: any;
  heading: string;
  number?: string;
  text: string;
  width?: string;
  height?: string;
}) => {
  return (
    <div
      className="w-[100%] h-fit relative flex flex-col justify-start items-start"
      style={{ zIndex: 0 }}
      key={number}
    >
      {number && (
        <span
          className="card-number-text mb-[-17px] lg:mb-[-10px]"
          style={{ zIndex: -10 }}
        >
          {number}
        </span>
      )}

      <div
        className="h-fit lg:h-[226px] w-full flex flex-col justify-start gap-[20px] items-center bg-[#F5FBF5] rounded-[16px] p-[24px] md:p-[40px]"
        style={{ zIndex: 10 }}
      >
        <div className="w-full flex justify-start gap-[20px] items-center">
          <div
            className="bg-[#D8E6DD] w-fit rounded-[8px] flex justify-center items-center"
            style={{ padding: "16px" }}
          >
            <img src={icon.src} alt="" />
          </div>
          <h2 className="heading-text-style-2">{heading}</h2>
        </div>
        <span className="plan-text-style-2" style={{ textAlign: "start" }}>
          {text}
        </span>
      </div>
    </div>
  );
};

export default HeadingCard;
