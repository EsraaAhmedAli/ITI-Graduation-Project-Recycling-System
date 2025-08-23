"use client";
import { useState, ReactNode, useRef, useEffect } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useFilters } from "@/hooks/useFilter";

export type FilterOption = {
  label: string;
  value: string;
  color?: string;
};

export type FilterType =
  | "checkbox"
  | "range"
  | "color-swatch"
  | "search"
  | "multi-select"
  | "single-select"
  | "date";

export interface FilterConfig {
  name: string;
  title: string;
  type: FilterType;
  options: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
}

interface FilterDrawerProps {
  filtersConfig: FilterConfig[];
  onChangeFilters: (filters: Record<string, string[]>) => void;
  activeFilters: Record<string, string[]>;
  className?: string;
  triggerButton?: ReactNode;
}

export default function FilterDrawer({
  filtersConfig,
  onChangeFilters,
  activeFilters,
  className = "",
}: FilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    expandedGroups,
    selectedCount,
    handleChange,
    handleRangeChange,
    handleSearchChange,
    clearAll,
    toggleGroup,
  } = useFilters(filtersConfig, activeFilters, onChangeFilters);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderFilterInput = (filter: FilterConfig) => {
    switch (filter.type) {
      case "checkbox":
      case "multi-select":
        return (
          <div className="space-y-2">
            {filter.options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={
                    activeFilters[filter.name]?.includes(opt.value) || false
                  }
                  onChange={() => handleChange(filter.name, opt.value)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span style={{color:"var(--color-base-900)"}}>{opt.label}</span>
              </label>
            ))}
          </div>
        );
      case "date":
        const dateValue = activeFilters[filter.name]?.[0] || "";
        return (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateValue}
              onChange={(e) => handleSearchChange(filter.name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
            />
            {dateValue && (
              <button
                onClick={() => handleSearchChange(filter.name, "")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );

      case "color-swatch":
        return (
          <div className="flex flex-wrap gap-2">
            {filter.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange(filter.name, opt.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  activeFilters[filter.name]?.includes(opt.value)
                    ? "ring-2 ring-offset-1 ring-green-600"
                    : "border-transparent"
                }`}
              
               style={{ backgroundColor: opt.color || opt.value }}
                title={opt.label}
              />
            ))}
          </div>
        );

      case "single-select":
        return (
          <div className="space-y-2">
            {filter.options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name={filter.name}
                  checked={
                    activeFilters[filter.name]?.includes(opt.value) || false
                  }
                  onChange={() =>
                    onChangeFilters({
                      ...activeFilters,
                      [filter.name]: [opt.value],
                    })
                  }
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case "range":
        const currentRange = activeFilters[filter.name]?.[0]?.split("-") || [
          filter.min,
          filter.max,
        ];
        const [minVal, maxVal] = currentRange.map(Number);

        const minLimit = Number(filter.min);
        const maxLimit = Number(filter.max);
        const step = Number(filter.step || 1);

        const handleMinChange = (value: number) => {
          const newMin = Math.min(value, maxVal - step);
          handleRangeChange(filter.name, newMin, maxVal);
        };

        const handleMaxChange = (value: number) => {
          const newMax = Math.max(value, minVal + step);
          handleRangeChange(filter.name, minVal, newMax);
        };

        return (
          <div className="w-full max-w-sm">
            {/* Labels */}
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>${minVal}</span>
              <span>${maxVal}</span>
            </div>

            {/* Slider Wrapper */}
            <div className="relative h-6">
              {/* Track */}
              <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded" />
              {/* Range highlight */}
              <div
                className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-primary rounded"
                style={{
                  left: `${
                    ((minVal - minLimit) / (maxLimit - minLimit)) * 100
                  }%`,
                  width: `${
                    ((maxVal - minVal) / (maxLimit - minLimit)) * 100
                  }%`,
                }}
              />

              {/* Min Thumb */}
              <input
                type="range"
                min={minLimit}
                max={maxLimit}
                step={step}
                value={minVal}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className="absolute w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none"
              />

              {/* Max Thumb */}
              <input
                type="range"
                min={minLimit}
                max={maxLimit}
                step={step}
                value={maxVal}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                className="absolute w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none"
              />
            </div>
          </div>
        );

      case "search":
        const searchValue = activeFilters[filter.name]?.[0] || "";
        return (
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${filter.title.toLowerCase()}...`}
              value={searchValue}
              onChange={(e) => handleSearchChange(filter.name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
            />
            {searchValue && (
              <button
                onClick={() => handleSearchChange(filter.name, "")}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="inline-block text-left rtl:text-right">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2 px-4 py-2 rounded-md shadow-sm text-sm min-w-[140px] border transition-colors
      ${
        selectedCount > 0
          ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
          : "bg-white text-green-700 border-green-600 hover:bg-green-50"
      }
    `}
      >
        <Filter className="w-4 h-4" />
        <span className="whitespace-nowrap">Filters</span>

        {selectedCount > 0 && (
          <span className="text-xs w-5 h-5 flex items-center justify-center bg-white text-green-700 rounded-full font-bold">
            {selectedCount}
          </span>
        )}
        <ChevronDown className="w-4 h-4 rtl:rotate-180" />
      </button>

      {isOpen && (
        <div
          className="fixed mt-2 right-5 z-50 min-w-[180px] bg-white border border-green-200 rounded-xl shadow-xl 
               p-4 animate-slide-down
               rtl:right-auto rtl:left-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 rtl:flex-row-reverse">
            <h3 className="text-base font-semibold text-gray-800">Filters</h3>

            <div className="flex items-center gap-2 text-sm rtl:flex-row-reverse">
              {selectedCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-gray-500 text-sm font-medium hover:underline"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {filtersConfig.map((filter) => (
              <div key={filter.name} className="border-b pb-4 last:border-0">
                <button
                  onClick={() => toggleGroup(filter.name)}
                  className="flex justify-between items-center w-full rtl:flex-row-reverse"
                >
                  <span className="font-medium" style={{color:"var(--color-base-900)"}}>{filter.title}</span>
                  {expandedGroups[filter.name] ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {expandedGroups[filter.name] && (
                  <div className="mt-3">{renderFilterInput(filter)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
