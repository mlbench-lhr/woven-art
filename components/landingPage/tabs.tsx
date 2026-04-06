import Image from "next/image";

export type TabsProps = {
  image: string;
  title: string;
  description: string;
};

export default function Tabs(item: TabsProps) {
  return (
    <div className="w-full h-fit flex flex-col md:flex-row justify-start gap-4 [@media(min-width:1350px)]:gap-[30px] items-center rounded-[10px] border py-2 w-[calc(100%-80px)]:py-3 px-3 w-[calc(100%-80px)]:px-4.5">
      <div className="flex justify-center items-center w-[50px] h-[50px] rounded-full bg-[#FFEAF4]">
        <Image
          src={item.image}
          alt="Woven Art cave dwellings"
          className="object-cover object-center"
          width={28}
          height={28}
        />
      </div>
      <div className="w-full md:w-[calc(100%-50px)] [@media(min-width:1350px)]:w-[calc(100%-80px)] text-center md:text-start h-fit flex justify-start items-start flex-col gap-1">
        <h3 className="text-sm md:text-base font-semibold w-full md:w-fit text-center md:text-start">
          {item.title}
        </h3>
        <h4 className="text-sm md:text-base font-[500] text-[rgba(0,0,0,0.50)] leading-tight">
          {item.description}
        </h4>
      </div>
    </div>
  );
}
