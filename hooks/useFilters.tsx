import { FilterConfig } from "@/components/shared/FilterSection";
import { useState } from "react";

export function useFilters(
  filtersConfig: FilterConfig[],
  activeFilters: Record<string, string[]>,
  onChangeFilters: (filters: Record<string, string[]>) => void
) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    filtersConfig.reduce<Record<string, boolean>>((acc, filter) => {
      acc[filter.name] = true;
      return acc;
    }, {})
  );

  const selectedCount = Object.values(activeFilters).flat().length;

  const handleChange = (key: string, value: string) => {
    const updated = activeFilters[key]?.includes(value)
      ? activeFilters[key].filter((v) => v !== value)
      : [...(activeFilters[key] || []), value];

    const updatedFilters = { ...activeFilters, [key]: updated };
    onChangeFilters(updatedFilters);
  };

  const handleRangeChange = (key: string, min: number, max: number) => {
    const updatedFilters = { ...activeFilters, [key]: [`${min}-${max}`] };
    onChangeFilters(updatedFilters);
  };

  const handleSearchChange = (key: string, searchTerm: string) => {
    const updatedFilters = {
      ...activeFilters,
      [key]: searchTerm ? [searchTerm] : [],
    };
    onChangeFilters(updatedFilters);
  };

  const clearAll = () => {
    const cleared = filtersConfig.reduce<Record<string, string[]>>(
      (acc, filter) => {
        acc[filter.name] = [];
        return acc;
      },
      {}
    );
    onChangeFilters(cleared);
  };

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return {
    activeFilters,
    expandedGroups,
    selectedCount,
    handleChange,
    handleRangeChange,
    handleSearchChange,
    clearAll,
    toggleGroup,
  };
}
