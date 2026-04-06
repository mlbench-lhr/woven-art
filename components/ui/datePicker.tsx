"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { X } from "lucide-react";
import moment from "moment";

export default function DeadlinePicker({
  date,
  setDate,
  onRemove,
  textClass = " text-[12px] ",
  minDate,
  maxDate,
  disabledPredicate,
  disabled = false,
}: {
  date: Date | string | undefined;
  setDate: any;
  onRemove: any;
  textClass?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledPredicate?: (date: Date) => boolean;
  disabled?: boolean;
}) {
  const currentYear = new Date().getFullYear();
  const fromYear = minDate ? new Date(minDate).getFullYear() : 1940;
  const toYear = maxDate ? new Date(maxDate).getFullYear() : currentYear + 10;
  return (
    <div className="flex flex-col gap-[10px] w-full relative">
      <Popover>
        <div>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={`w-full justify-between text-left font-medium ${textClass} flex items-center border-none shadow-none h-[37px] ps-0 px-0 hover:bg-transparent leading-tight ${
                !date && "text-muted-foreground"
              }`}
            >
              {date ? moment(date).format("MMM DD, YYYY") : <span>Date</span>}
            </Button>
          </PopoverTrigger>
          {date && (
            <X
              className="cursor-pointer absolute top-1/2 translate-y-[-50%] right-3 z-40"
              onClick={() => {
                onRemove();
              }}
              size={16}
            />
          )}
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
            mode="single"
            selected={date ? new Date(date) : undefined}
            onSelect={(d) =>
              d && setDate(moment(d).format("YYYY-MM-DDTHH:mm:ss.SSSZ"))
            }
            initialFocus
            disabled={(d) => {
              const today = new Date(new Date().setHours(0, 0, 0, 0));
              let isDisabled = false;
              if (!minDate && !maxDate && !disabledPredicate) {
                isDisabled = d < today;
              }
              if (minDate) {
                const min = new Date(new Date(minDate).setHours(0, 0, 0, 0));
                if (d < min) isDisabled = true;
              }
              if (maxDate) {
                const max = new Date(new Date(maxDate).setHours(23, 59, 59, 999));
                if (d > max) isDisabled = true;
              }
              if (disabledPredicate && disabledPredicate(d)) {
                isDisabled = true;
              }
              return isDisabled;
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
