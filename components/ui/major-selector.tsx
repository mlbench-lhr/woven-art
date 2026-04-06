"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const POPULAR_MAJORS = [
  "Computer Science",
  "Business Administration",
  "Psychology",
  "Biology",
  "Engineering",
  "English",
  "Economics",
  "Political Science",
  "Mathematics",
  "Chemistry",
  "History",
  "Art",
  "Music",
  "Philosophy",
  "Sociology",
  "Anthropology",
  "Physics",
  "Environmental Science",
  "International Relations",
  "Pre-Med",
  "Pre-Law",
  "Education",
  "Communications",
  "Marketing",
  "Finance",
  "Accounting",
  "Nursing",
  "Architecture",
  "Graphic Design",
  "Film Studies",
];

interface MajorSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  placeholder: string;
}

export function MajorSelector({
  value,
  onChange,
  label,
  placeholder,
}: MajorSelectorProps) {
  const [customMajor, setCustomMajor] = useState("");

  const handleMajorSelect = (major: string) => {
    if (!value.includes(major)) {
      onChange([...value, major]);
    }
  };

  const handleCustomMajorAdd = () => {
    if (customMajor.trim() && !value.includes(customMajor.trim())) {
      onChange([...value, customMajor.trim()]);
      setCustomMajor("");
    }
  };

  const removeMajor = (majorToRemove: string) => {
    onChange(value.filter((major) => major !== majorToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label className="label-style">{label}</Label>
        <Select onValueChange={handleMajorSelect}>
          <SelectTrigger className="input-style">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {POPULAR_MAJORS.map((major) => (
              <SelectItem key={major} value={major}>
                {major}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="label-style">Or Add Custom Major</Label>
        <div className="flex gap-2">
          <Input
            className="input-style flex-1"
            placeholder="Enter major name"
            value={customMajor}
            onChange={(e) => setCustomMajor(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCustomMajorAdd()}
          />
          <button
            type="button"
            onClick={handleCustomMajorAdd}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add
          </button>
        </div>
      </div>

      {value?.length > 0 && (
        <div className="space-y-2">
          <Label className="label-style">Selected {label}:</Label>
          <div className="flex flex-wrap gap-2">
            {value.map((major) => (
              <div
                key={major}
                className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
              >
                <span>{major}</span>
                <button
                  type="button"
                  onClick={() => removeMajor(major)}
                  className="text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
