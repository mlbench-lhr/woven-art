import React, { useState } from "react";
import { Users, ChevronDown, Minus, Plus } from "lucide-react";
import { Label } from "../ui/label";

export default function ParticipantsSelector({
  participants,
  setParticipants,
  childAgeRange,
  kidsAllowed = true,
}: {
  participants: {
    adult: number;
    child: number;
  };
  setParticipants: React.Dispatch<{
    adult: number;
    child: number;
  }>;
  childAgeRange?: { min: number; max: number };
  kidsAllowed?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (type: any, value: any) => {
    const newParticipants = {
      ...participants,
      [type]: Math.max(0, value),
    };
    if (type === "child" && !kidsAllowed) {
      newParticipants.child = 0;
    }
    setParticipants(newParticipants);

    // This is where you'd call your onChange callback
    console.log("participants:", newParticipants);
  };

  const getSummaryText = () => {
    const parts = [];
    if (participants.adult > 0) {
      parts.push(`Adult x ${participants.adult}`);
    }
    if (participants.child > 0) {
      parts.push(`Child x ${participants.child}`);
    }
    return parts.length > 0 ? parts.join(", ") : "Select participants";
  };

  return (
    <div className="w-full space-y-1">
      <Label className="text-[14px] font-semibold">Participants</Label>
      <div className="relative">
        {/* Main Select Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-[36px] w-full px-3 py-3 bg-white text-sm text-black/70 border shadow-2xs rounded-[7px] text-left flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2 text-black/60">
            <span>{getSummaryText()}</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-black/30 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Content */}
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
              {/* Adult Row */}
              <div className="px-3 py-2 flex items-center justify-between hover:bg-gray-50">
                <div className="text-gray-900 font-semibold text-[14px]">
                  Adult
                  <span className="ms-1 text-black/70 text-[14px] font-normal">
                    {`(Age ${(childAgeRange?.max ?? 7) + 1}+ )`}
                  </span>
                </div>
                <div className="flex items-center gap-0">
                  <button
                    onClick={() =>
                      handleChange("adult", participants.adult - 1)
                    }
                    className="w-fit p-2 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={participants.adult === 0}
                  >
                    <Minus size={15} className=" text-gray-600" />
                  </button>
                  <span className="w-6 text-center text-[12px] font-normal text-primary">
                    {participants.adult}
                  </span>
                  <button
                    onClick={() =>
                      handleChange("adult", participants.adult + 1)
                    }
                    className="w-fit p-2 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={15} className=" text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Child Row */}
              <div className={`px-3 py-2 flex items-center justify-between ${kidsAllowed ? "hover:bg-gray-50" : "opacity-50"}`}>
                <div className="text-gray-900 font-semibold text-[14px]">
                  Child
                  <span className="ms-1 text-black/70 text-[14px] font-normal">
                    {`(Age ${childAgeRange?.min ?? 0} - ${childAgeRange?.max ?? 7})`}
                  </span>
                </div>
                <div className="flex items-center gap-0">
                  <button
                    onClick={() =>
                      handleChange("child", participants.child - 1)
                    }
                    className="w-fit p-2 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={participants.child === 0 || !kidsAllowed}
                  >
                    <Minus size={15} className=" text-gray-600" />
                  </button>
                  <span className="w-6 text-center text-[12px] font-normal text-primary">
                    {participants.child}
                  </span>
                  <button
                    onClick={() =>
                      handleChange("child", participants.child + 1)
                    }
                    className="w-fit p-2 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    disabled={!kidsAllowed}
                  >
                    <Plus size={15} className=" text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
