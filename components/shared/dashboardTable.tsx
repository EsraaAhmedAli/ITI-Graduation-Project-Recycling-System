import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import Image from "next/image";
import FilterDrawer, {
  FilterConfig,
  FilterOption,
  FilterType,
} from "./FilterSection";

// type Column = {
//   key: string;
//   label: string;
//   sortable?: boolean;
//   type?: "status" | "price" | "image" | string;
//   render?: (item: T) => void;
//   filterable?: boolean;
//   filterOptions?: string[];
// };
export const renderCellValue = (
  value: any,
  column: { key: string; type?: string }
) => {
  if (column.type === "status") {
    const statusColors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-600",
      pending: "bg-emerald-100 text-emerald-700",
      "on sale": "bg-teal-100 text-teal-700",
      sourcing: "bg-lime-100 text-lime-700",
      recycled: "bg-green-100 text-green-800",
      processing: "bg-emerald-100 text-emerald-700",
      collected: "bg-teal-100 text-teal-700",
      online: "bg-green-100 text-green-700",
      offline: "bg-gray-100 text-gray-500",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[value?.toLowerCase()] || "bg-gray-100 text-gray-800"
        }`}
      >
        {value}
      </span>
    );
  }

  if (column.type === "price") {
    return `$${value}`;
  }

  if (column.type === "image") {
    return (
      <Image
        width={34}
        height={34}
        src={value}
        alt={column.key}
        className="rounded-full object-cover bg-green-50 flex items-center justify-center border border-green-200"
      />
    );
  }

  return value;
};
type Column = {
  key: string;
  label: string;
  sortable?: boolean;
  type?: "status" | "price" | "image" | string;
  render?: (item: T) => React.ReactNode;
  filterable?: boolean;
  filterType?: FilterType; // Add this
  filterOptions?: FilterOption[]; // Update this
};

type DynamicTableProps<T> = {
  data: T[];
  columns: Column[];
  searchTerm?: string;
  title?: string;
  itemsPerPage?: number;
  showActions?: boolean;
  showSearch?: boolean;
  showFilter?: boolean;
  showExport?: boolean;
  showAddButton?: boolean;
  addButtonText?: string;
  externalFilters?: Record<string, string[]>;
  onExternalFiltersChange?: (filters: Record<string, string[]>) => void;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  getRenderedValue?: (row: any, key: string) => string;
  filtersConfig?: FilterConfig[]; // ✅ new
};

function DynamicTable<T extends { [key: string]: any; id?: string | number }>({
  data = [],
  columns = [],
  title = "Product",
  searchTerm = "",
  externalFilters = [],
  itemsPerPage = 10,
  showActions = true,
  showSearch = true,
  showFilter = true,
  showAddButton = true,
  addButtonText = "Add New Item",
  onAdd = () => {},
  onEdit = () => {},
  onView = () => {},
  onDelete = () => {},
  onExternalFiltersChange,
  getRenderedValue,
  filtersConfig,
}: DynamicTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const [localSearch, setLocalSearch] = useState("");

  const getFilterOptionsFromData = (key: string): FilterOption[] => {
    const unique = new Map<string, string>();
    data.forEach((item) => {
      const value = item[key];
      if (value !== undefined && value !== null) {
        unique.set(value.toString(), value.toString());
      }
    });
    return Array.from(unique).map(([value, label]) => ({ value, label }));
  };
  // const filtersConfig = useMemo(() => {
  //   return columns
  //     .filter((col) => col.filterable)
  //     .map((col) => ({
  //       name: col.key,
  //       title: col.label,
  //       type: col.filterType || "checkbox",
  //       options: col.filterOptions || getFilterOptionsFromData(col.key),
  //     }));
  // }, [columns, data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = localSearch
        ? Object.entries(item).some(([key, value]) => {
            const displayValue = getRenderedValue
              ? getRenderedValue(item, key)
              : value;
            console.log("[SEARCH]", key, "->", displayValue); // Debug log
            return displayValue
              ?.toString()
              .toLowerCase()
              .includes(localSearch.toLowerCase());
          })
        : true;

      const matchesExternalFilters = Object.entries(externalFilters).every(
        ([key, values]) => {
          if (!values.length) return true;

          const rawValue = item[key];
          const renderedValue = (
            getRenderedValue ? getRenderedValue(item, key) : rawValue
          )
            ?.toString()
            .toLowerCase();
          const match = values.some((v) => {
            const val = v.toLowerCase();
            // exact match
            if (val === renderedValue) return true;
            // partial match (e.g., for phone numbers)
            if (renderedValue?.includes(val)) return true;
            return false;
          });

          console.log("[FILTER]", key, {
            expected: values,
            renderedValue,
            match,
          });

          return match;
        }
      );

      return matchesSearch && matchesExternalFilters;
    });
  }, [data, localSearch, externalFilters, getRenderedValue]);

  // const [searchTerm, setSearchTerm] = useState("");
  // const [filters, setFilters] = useState<{ [key: string]: string }>({});

  const sortedData = useMemo(() => {
    if (!filteredData.length) return [];

    // If user clicked column to sort
    if (sortColumn) {
      return [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        const aStr = aValue.toString().toLowerCase();
        const bStr = bValue.toString().toLowerCase();
        return sortDirection === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    // Sort by active filter key (if no sort column)
    const activeFilterKey = Object.keys(externalFilters || {}).find(
      (key) => externalFilters[key] && externalFilters[key].length > 0
    );

    if (activeFilterKey) {
      return [...filteredData].sort((a, b) => {
        const aStr = a[activeFilterKey]?.toString().toLowerCase() || "";
        const bStr = b[activeFilterKey]?.toString().toLowerCase() || "";
        return aStr.localeCompare(bStr);
      });
    }

    return filteredData;
  }, [filteredData, sortColumn, sortDirection, externalFilters]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);
  const [externalFiltersState, setExternalFiltersState] = useState<{
    [key: string]: string[];
  }>({});

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  const getUniqueValuesFromData = (key: string): string[] => {
    const unique = new Set<string>();
    data.forEach((item) => {
      const value = item[key];
      if (value !== undefined && value !== null) {
        unique.add(value.toString());
      }
    });
    return Array.from(unique);
  };
  // const filtersConfig = useMemo(() => {
  //   return columns
  //     .filter((col) => col.filterable)
  //     .map((col) => ({
  //       name: col.key,
  //       title: col.label,
  //       options: getUniqueValuesFromData(col.key),
  //     }));
  // }, [columns, data]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleMenu = (id: string | number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleMenuAction = (action: "edit" | "delete" | "view", item: T) => {
    setOpenMenuId(null);
    if (action === "edit") onEdit(item);
    else if (action === "delete") onDelete(item);
    else if (action === "view") onView(item);
  };

  const renderPagination = () => {
    const pages = [];
    const pageGroupSize = 5;
    const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
    const startPage = currentGroup * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

    // « Previous group
    if (startPage > 1) {
      pages.push(
        <button
          key="prev-group"
          onClick={() => handlePageChange(startPage - 1)}
          className="px-3 py-1 rounded text-sm bg-white border border-green-200 hover:bg-green-50 text-green-700 transition-colors"
        >
          &laquo;
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            i === currentPage
              ? "bg-green-500 text-white"
              : "bg-white text-gray-700 hover:bg-green-50 border border-green-200"
          }`}
        >
          {i}
        </button>
      );
    }

    // » Next group
    if (endPage < totalPages) {
      pages.push(
        <button
          key="next-group"
          onClick={() => handlePageChange(endPage + 1)}
          className="px-3 py-1 rounded text-sm bg-white border border-green-200 hover:bg-green-50 text-green-700 transition-colors"
        >
          &raquo;
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-green-100">
      {/* Header */}
      <div className="p-6 border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          {/* Title on the left */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-green-800">{title}</h1>
            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Showing {Math.min(itemsPerPage, sortedData.length)} of{" "}
              {sortedData.length}
            </span>
          </div>

          {/* Actions on the right */}
          <div className="flex items-center gap-3">
            {/* Search input */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>
            )}
            {/* FilterDrawer - Make sure it's inline, not full-width or block */}
            {/* // Replace the current FilterDrawer usage with: */}
            {showFilter && (
              <FilterDrawer
                filtersConfig={filtersConfig!}
                activeFilters={externalFilters || {}}
                onChangeFilters={(updated) => {
                  setCurrentPage(1);
                  onExternalFiltersChange?.(updated);
                }}
              />
            )}
            {/* Add Button */}
            {showAddButton && (
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {addButtonText}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" onClick={() => setOpenMenuId(null)}>
        <table className="w-full">
          <thead className="bg-green-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-green-100" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-green-600">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-green-100">
            {currentData.map((item, index) => (
              <tr key={index} className="hover:bg-green-25 transition-colors">
                {columns.map((col) => {
                  const raw = item[col.key];
                  const rendered =
                    col.render?.(item) ??
                    (getRenderedValue
                      ? renderCellValue(getRenderedValue(item, col.key), col)
                      : renderCellValue(raw, col));

                  return (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                      {rendered}
                    </td>
                  );
                })}

                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(item.id || index);
                        }}
                        className="p-2 hover:bg-green-50 rounded-full text-green-600 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {openMenuId === (item.id || index) && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-green-200">
                          <div className="py-1">
                            <button
                              onClick={() => handleMenuAction("edit", item)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleMenuAction("view", item)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <hr className="my-1 border-green-100" />
                            <button
                              onClick={() => handleMenuAction("delete", item)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-green-100 bg-green-25">
          <div className="flex items-center justify-between">
            <div className="text-sm text-green-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, sortedData.length)} of {sortedData.length}{" "}
              results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1 rounded text-sm bg-white border border-green-200 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed text-green-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex gap-1">{renderPagination()}</div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1 rounded text-sm bg-white border border-green-200 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed text-green-700 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Example usage component

export default DynamicTable;
