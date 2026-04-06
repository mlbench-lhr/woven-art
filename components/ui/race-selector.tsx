"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp } from "lucide-react"

interface RaceOption {
  id: string
  label: string
  description?: string
  subOptions?: RaceOption[]
}

const raceOptions: RaceOption[] = [
  {
    id: "american-indian",
    label: "American Indian or Alaska Native",
    description: "A person having origins in original peoples of North/South America",
  },
  {
    id: "asian",
    label: "Asian",
    subOptions: [
      { id: "filipino", label: "Filipino" },
      { id: "indian", label: "Indian" },
      { id: "japanese", label: "Japanese" },
      { id: "vietnamese", label: "Vietnamese" },
      { id: "korean", label: "Korean" },
      { id: "other-asian", label: "Other Asian" },
    ],
  },
  {
    id: "black",
    label: "Black or African American",
    description: "A person having origins in any of the black racial groups of Africa",
  },
  {
    id: "pacific-islander",
    label: "Native Hawaiian or Other Pacific Islander",
    subOptions: [
      { id: "native-hawaiian", label: "Native Hawaiian" },
      { id: "guamanian", label: "Guamanian or Chamorro" },
      { id: "samoan", label: "Samoan" },
      { id: "other-pacific", label: "Other Pacific Islander" },
    ],
  },
  {
    id: "white",
    label: "White",
    description: "A person having origins in Europe, the Middle East, or North Africa",
  },
]

interface RaceSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function RaceSelector({ value, onChange }: RaceSelectorProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionId])
    } else {
      onChange(value.filter((id) => id !== optionId))
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      {raceOptions.map((option) => (
        <div key={option.id} className="space-y-2">
          <div className="flex items-start space-x-3">
            <Checkbox
              id={option.id}
              checked={value.includes(option.id)}
              onCheckedChange={(checked) => handleOptionChange(option.id, !!checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Label htmlFor={option.id} className="font-medium text-sm">
                  {option.label}
                </Label>
                {option.subOptions && (
                  <button
                    type="button"
                    onClick={() => toggleSection(option.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedSections.includes(option.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              {option.description && <p className="text-xs text-gray-600 mt-1">{option.description}</p>}
            </div>
          </div>

          {/* Sub-options */}
          {option.subOptions && expandedSections.includes(option.id) && (
            <div className="ml-6 space-y-2 border-l-2 border-gray-100 pl-4">
              {option.subOptions.map((subOption) => (
                <div key={subOption.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={subOption.id}
                    checked={value.includes(subOption.id)}
                    onCheckedChange={(checked) => handleOptionChange(subOption.id, !!checked)}
                  />
                  <Label htmlFor={subOption.id} className="text-sm">
                    {subOption.label}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
