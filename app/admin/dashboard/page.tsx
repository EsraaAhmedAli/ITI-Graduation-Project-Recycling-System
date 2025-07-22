"use client";
import AdminLayout from "@/components/shared/adminLayout";
import FilterDrawer, {
  FilterConfig,
  FilterOption,
} from "@/components/shared/FilterSection";
import { useState } from "react";

const filters: FilterConfig[] = [
  {
    name: "category",
    title: "Category",
    type: "checkbox",
    options: [
      { label: "All New Arrivals", value: "all-new-arrivals" },
      { label: "Tees", value: "tees" },
      { label: "Objects", value: "objects" },
    ],
  },
  {
    name: "color",
    title: "Color",
    type: "color-swatch",
    options: [
      { label: "Red", value: "red", color: "#ff0000" },
      { label: "Blue", value: "blue", color: "#0000ff" },
      { label: "Green", value: "green", color: "#00ff00" },
      { label: "Black", value: "black", color: "#000000" },
    ],
  },
  {
    name: "size",
    title: "Sizes",
    type: "checkbox",
    options: [
      { label: "S", value: "s" },
      { label: "M", value: "m" },
      { label: "L", value: "l" },
      { label: "XL", value: "xl" },
    ],
  },
  {
    name: "brand",
    title: "Brand",
    type: "checkbox",
    options: [
      { label: "Nike", value: "nike" },
      { label: "Adidas", value: "adidas" },
      { label: "Puma", value: "puma" },
    ],
  },
];

export default function Page() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );

  return (
    <AdminLayout>
      <FilterDrawer
        filtersConfig={filters}
        activeFilters={activeFilters}
        onChangeFilters={setActiveFilters}
      />

      {/* Your table or content that uses the filters */}
      <div className="mt-4">
        {/* Display filtered content here */}
        <pre>{JSON.stringify(activeFilters, null, 2)}</pre>
      </div>
    </AdminLayout>
  );
}
