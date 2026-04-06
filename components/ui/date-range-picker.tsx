"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
interface DateRangePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: { from: Date | null; to: Date | null };
  onChange?: (val: { from: Date | null; to: Date | null }) => void;
}

export function DateRangePicker({
  className,
  value,
  onChange,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    value?.from || value?.to
      ? { from: value.from || undefined, to: value.to || undefined }
      : undefined
  );

  // Update local state when parent value changes
  React.useEffect(() => {
    if (value?.from !== date?.from || value?.to !== date?.to) {
      setDate(
        value?.from || value?.to
          ? { from: value.from || undefined, to: value.to || undefined }
          : undefined
      );
    }
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (onChange) {
      onChange({
        from: range?.from ?? null,
        to: range?.to ?? null,
      });
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[270px] sm:w-[300px] justify-start text-left text-sm font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
