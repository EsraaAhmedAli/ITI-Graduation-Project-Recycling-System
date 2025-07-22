import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useFilters } from "@/hooks/useFilters";
import { FilterConfig } from "../Types/filter.type";

interface FilterDrawerProps {
  filtersConfig: FilterConfig[];
  onChangeFilters: (filters: Record<string, string[]>) => void;
  activeFilters: Record<string, string[]>;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

export default function FilterDrawer({
  filtersConfig = [],
  onChangeFilters,
  activeFilters,
  className = "",
  isOpen,
  onClose,
  onOpen,
}: FilterDrawerProps) {
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
    <div
      className={`fixed top-16 right-4 w-full max-w-md bg-white z-50 shadow-lg rounded-lg transition-all duration-200 ${
        isOpen
          ? "opacity-100 translate-y-0 h-[70vh] overflow-y-auto"
          : "opacity-0 translate-y-4 h-0 overflow-hidden"
      }`}
    >
      {/* Panel Header */}
      <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium">Filters</h3>
        <div className="flex items-center gap-4">
          {selectedCount > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Filter Content */}
      <div className="p-4 h-[calc(70vh-56px)] overflow-y-auto">
        {filtersConfig.map((filter) => (
          <div key={filter.name} className="mb-6 last:mb-0">
            <button
              onClick={() => toggleGroup(filter.name)}
              className="flex items-center justify-between w-full text-left mb-2"
            >
              <h4 className="text-sm font-medium text-gray-700">
                {filter.title}
              </h4>
              {expandedGroups[filter.name] ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {expandedGroups[filter.name] && (
              <div className="mt-3 pl-1">{renderFilterInput(filter)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
