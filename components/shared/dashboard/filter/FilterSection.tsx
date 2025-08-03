"use client";

import { ChevronDown, Filter } from "lucide-react";

interface SmartFilterProps {
  name: string;
  title: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  isOpen: boolean;
  onToggle: (name: string) => void;
}

export default function SmartFilter({
  name,
  title,
  options,
  selected,
  onChange,
  isOpen,
  onToggle,
}: SmartFilterProps) {
  const toggleOption = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((o) => o !== option)
        : [...selected, option]
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => onToggle(name)}
        className="text-sm font-medium text-gray-800 flex items-center gap-1 border border-green-500 px-3 py-1 rounded-md shadow-sm"
      >
        <Filter className="w-4 h-4 text-green-600" />
        {title} {selected.length > 0 && `(${selected.length})`}
        <ChevronDown className="w-4 h-4 text-green-600" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-48 bg-white border rounded-md shadow-lg">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="mr-2 accent-green-600"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
