import { useState } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useFilters } from "@/hooks/useFilters";

export type FilterOption = {
  label: string;
  value: string;
  color?: string; // For color swatches
};

export type FilterType =
  | "checkbox"
  | "range"
  | "color-swatch"
  | "search"
  | "multi-select";

export interface FilterConfig {
  name: string;
  title: string;
  type: FilterType;
  options: FilterOption[];
  min?: number; // For range
  max?: number; // For range
  step?: number; // For range
}

interface FilterDrawerProps {
  filtersConfig: FilterConfig[];
  onChangeFilters: (filters: Record<string, string[]>) => void;
  activeFilters: Record<string, string[]>;
  className?: string;
}

export default function FilterDrawer({
  filtersConfig,
  onChangeFilters,
  activeFilters,
  className = "",
}: FilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    expandedGroups,
    selectedCount,
    handleChange,
    handleRangeChange,
    handleSearchChange,
    clearAll,
    toggleGroup,
  } = useFilters(filtersConfig, activeFilters, onChangeFilters);
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
                <span>{opt.label}</span>
              </label>
            ))}
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

      case "range":
        const currentRange = activeFilters[filter.name]?.[0]?.split("-") || [
          filter.min,
          filter.max,
        ];
        const [minVal, maxVal] = currentRange.map(Number);

        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">${minVal}</span>
              <span className="text-sm text-gray-600">${maxVal}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={filter.min}
                max={filter.max}
                step={filter.step || 1}
                value={minVal}
                onChange={(e) =>
                  handleRangeChange(filter.name, Number(e.target.value), maxVal)
                }
                className="w-full"
              />
              <input
                type="range"
                min={filter.min}
                max={filter.max}
                step={filter.step || 1}
                value={maxVal}
                onChange={(e) =>
                  handleRangeChange(filter.name, minVal, Number(e.target.value))
                }
                className="w-full"
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
    <div className={`relative ${className}`}>
      {/* Toggle Button + Clear All */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isOpen
              ? "bg-green-100 text-green-700"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">
            {selectedCount > 0 ? `${selectedCount} Filters` : "Filters"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {selectedCount > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-gray-500 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Filter Panel */}
      <div
        className={`fixed sm:absolute top-16 left-0 sm:left-auto right-0 sm:top-10 w-full sm:w-96 bg-white z-50 shadow-lg rounded-lg transition-all duration-200 ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {filtersConfig.map((filter) => (
              <div key={filter.name} className="border-b pb-4 last:border-b-0">
                <button
                  onClick={() => toggleGroup(filter.name)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h4 className="text-sm font-medium text-gray-700">
                    {filter.title}
                  </h4>
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
      </div>
    </div>
  );
}
