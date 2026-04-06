"use client";
import { StarIcon } from "@/public/allIcons/page";

export default function Rating({
  value,
  setValue,
  iconsSize = "25",
}: {
  value: number;
  setValue?: (n: number) => void;
  iconsSize?: string;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          onClick={() => setValue && setValue(n)}
          className={` ${!setValue ? "cursor-default" : "cursor-pointer"}
            text-2xl transition 
            ${n <= value ? "text-yellow-400" : "text-gray-400"}
          `}
        >
          <StarIcon color={n <= value ? "#F8C65B" : "gray"} size={iconsSize} />
        </div>
      ))}
    </div>
  );
}
