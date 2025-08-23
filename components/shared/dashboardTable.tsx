'use client'
import React, { useEffect, useMemo, useState } from "react";

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
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import FilterDrawer, {
  FilterConfig,
  FilterOption,
  FilterType,
} from "./dashboard/filter/FilterArea";
import { useLanguage } from "@/context/LanguageContext";

type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  type?: "status" | "price" | "image" | string;
  hideOnMobile?: boolean;
  priority?: number;
  render?: (item: T) => React.ReactNode;
  filterable?: boolean;
  filterType?: FilterType;
  filterOptions?: FilterOption[];
  width?: string;
  minWidth?: string;
  sortKey?: string;
  // Add responsive width options
  maxWidth?: string;
  responsive?: boolean; // Whether column should be responsive
};

// Add pagination info type
type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type DynamicTableProps<T> = {
  data: T[];
  disableClientSideSearch?: boolean;
  columns: Column<T>[];
  title?: string;
  itemsPerPage?: number;
  showActions?: boolean;
  showSearch?: boolean;
  showFilter?: boolean;
  showExport?: boolean;
  showAddButton?: boolean;
  addButtonText?: string;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onViewDetails?: (item: T) => void;
  onAddSubCategory?: (item: T) => void;
  onImageClick?: (item: T) => void;
  
  filters?: {
    limit: number;
    page: number;
    [key: string]: unknown;
  };
  setFilters?: (filters: (prev: { limit: number; page: number; [key: string]: unknown }) => { limit: number; page: number; [key: string]: unknown }) => void;
  setShowFilters?: (show: boolean) => void;
  activeFiltersCount?: number;
  refetch?: () => void;
  isFetching?: boolean;
  addButtonLoading?: boolean;

  searchTerm?: string;
  onSearchChange?: (searchTerm: string) => void;
  externalFilters?: Record<string, string[]>;
  onExternalFiltersChange?: (filters: Record<string, string[]>) => void;
  filtersConfig?: FilterConfig[];
  showPagination?: boolean;
  isLoading?: boolean;
  
  // Add pagination props
  paginationInfo?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
};

function DynamicTable<T extends { [key: string]: unknown; id?: string | number }>({
  data = [],
  columns = [],
  title = "Product",
  itemsPerPage = 5,
  addButtonLoading = false,
  showPagination = true,
  isLoading = false,
  showActions = true,
  showSearch = true,
  showFilter = true,
  showAddButton = true,
  addButtonText = "Add New Item",
  onAdd = () => {},
  onEdit = () => {},
  onViewDetails = () => {},
  onDelete = () => {},
  onAddSubCategory,
  filters,
  setFilters,
  setShowFilters,
  activeFiltersCount = 0,
  refetch,
  isFetching = false,
  searchTerm: externalSearchTerm,
  onSearchChange,
  externalFilters = {},
  onExternalFiltersChange,
  disableClientSideSearch = false,
  filtersConfig,
  
  // New pagination props
  paginationInfo,
  onPageChange,
  onItemsPerPageChange,
}: DynamicTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(
    new Set()
  );

  const currentSearchTerm = externalSearchTerm !== undefined ? externalSearchTerm : searchTerm;

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setSearchTerm(value);
    }
  };

  const filteredData = useMemo(() => {
    if (disableClientSideSearch || onSearchChange) {
      return data;
    }
    
    if (!currentSearchTerm) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(currentSearchTerm.toLowerCase())
      )
    );
  }, [data, currentSearchTerm, disableClientSideSearch, onSearchChange]);

  const {t} = useLanguage()

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
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
  }, [filteredData, sortColumn, sortDirection]);

  // Use backend pagination info if available, otherwise use client-side
  const totalPages = paginationInfo?.totalPages || Math.ceil(sortedData.length / itemsPerPage);
  const isBackendPagination = !!paginationInfo && !!onPageChange;
  const currentPageValue = isBackendPagination ? paginationInfo.currentPage : currentPage;
  const totalItems = paginationInfo?.totalItems || sortedData.length;
  
  // For backend pagination, we show all data passed (already paginated)
  // For client-side pagination, we slice the data
  const currentData = disableClientSideSearch ? sortedData : sortedData.slice(
    (currentPageValue - 1) * itemsPerPage, 
    currentPageValue * itemsPerPage
  );

  const mobileColumns = useMemo(() => {
    return columns
      .filter((col) => !col.hideOnMobile)
      .sort((a, b) => (a.priority || 999) - (b.priority || 999))
      .slice(0, 2);
  }, [columns]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handlePageChange = (page: number) => {
    if (isBackendPagination) {
      // For backend pagination, only call the external handler, don't update local state
      onPageChange!(page);
    } else {
      // For client-side pagination, update local state
      setCurrentPage(page);
    }
  };

  const toggleMenu = (id: string | number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const toggleRowExpansion = (id: string | number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleMenuAction = (
    action: "edit" | "delete" | "view" | "add-sub",
    item: T
  ) => {
    setOpenMenuId(null);
    if (action === "edit") onEdit(item);
    else if (action === "delete") onDelete(item);
    else if (action === "view") onViewDetails(item);
    else if (action === "add-sub" && onAddSubCategory) onAddSubCategory(item);
  };

  const renderCellValue = (value: unknown, column: Column<T>) => {
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
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[(value as string)?.toLowerCase()] || "bg-gray-100 text-gray-800"
          }`}
        >
          {String(value)}
        </span>
      );
    }

    if (column.type === "price") {
      return `$${String(value)}`;
    }

    if (column.type === "image") {
      return (
        <Image
          width={34}
          height={34}
          src={String(value)}
          alt={column.key}
          className="rounded-full object-cover bg-green-50 flex items-center justify-center border border-green-200"
        />
      );
    }

    return String(value) as unknown as React.ReactNode;
  };

  // New generatePageNumbers function
  const generatePageNumbers = (): (number | string)[] => {
    const delta = 2; // Number of pages to show before and after current page
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = Math.max(2, currentPageValue - delta); i <= Math.min(totalPages - 1, currentPageValue + delta); i++) {
      range.push(i);
    }

    if (currentPageValue - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPageValue + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index && item !== currentPageValue).length > 0 
      ? [1, ...range, totalPages].filter((item, index, arr) => arr.indexOf(item) === index)
      : rangeWithDots;
  };

  const renderMobileCard = (item: T, index: number) => {
    const rowId = item.id || index;
    const isExpanded = expandedRows.has(rowId);

    return (
      <div
        key={index}
        className="bg-white border border-green-100 rounded-lg mb-4 shadow-sm"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              {mobileColumns.map((column, colIndex) => (
                <div key={column.key} className={colIndex > 0 ? "mt-2" : ""}>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {column.label}
                  </div>
                  <div className="text-sm font-medium text-gray-900 mt-1 truncate">
                    {column.render
                      ? column.render(item)
                      : renderCellValue(item[column.key], column)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              {columns.length > mobileColumns.length && (
                <button
                  onClick={() => toggleRowExpansion(rowId)}
                  className="p-2 hover:bg-green-50 rounded-full text-green-600 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}

              {showActions && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(rowId);
                    }}
                    className="p-2 hover:bg-green-50 rounded-full text-green-600 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {openMenuId === rowId && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-green-200">
                      <div className="py-1">
                        {onAddSubCategory && (
                          <button
                            onClick={() => handleMenuAction("add-sub", item)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add Sub Category
                          </button>
                        )}
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
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-green-100">
              <div className="grid grid-cols-1 gap-3">
                {columns
                  .filter((col) => !mobileColumns.includes(col))
                  .map((column) => (
                    <div key={column.key}>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {column.label}
                      </div>
                      <div className="text-sm text-gray-900 mt-1 break-words">
                        {column.render
                          ? column.render(item)
                          : renderCellValue(item[column.key], column)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-green-100 w-full">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-green-100 bg-gradient-to-r from-green-100 to-emerald-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold text-green-800 truncate">
              {title}
            </h1>
            <span className="text-xs md:text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
              {t("common.showing_of", {
                count: currentData.length,
                total: totalItems
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto flex-shrink-0">
            {onItemsPerPageChange && (
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
                style={{ color: "var(--color-green-900)" }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 flex-shrink-0"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            )}

            {showSearch && (
              <div className="relative min-w-0 flex-1 sm:flex-initial sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
               <input
  type="text"
  placeholder="Search"
  className="w-full pl-10 pr-4 py-2 border 
             border-green-200 dark:border-green-700 
             rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 
             bg-white dark:bg-gray-800 
             text-gray-900 dark:text-gray-100 
             placeholder-gray-400 dark:placeholder-gray-500 
             text-sm"
/>

              </div>
            )}

            {showFilter &&
              filtersConfig &&
              onExternalFiltersChange &&
              filtersConfig?.length > 0 && (
                <FilterDrawer
                  filtersConfig={filtersConfig}
                  activeFilters={externalFilters}
                  onChangeFilters={onExternalFiltersChange}
                  triggerButton={
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 md:px-4 py-2 border border-green-200 rounded-lg text-green-700 bg-white hover:bg-green-50 transition-colors shadow-sm whitespace-nowrap text-sm flex-shrink-0"
                    >
                      <Filter className="w-4 h-4" />
                      <span className="hidden sm:inline">Filter</span>
                    </button>
                  }
                />
              )}

            {!filtersConfig && showFilter && setShowFilters && (
              <button
                onClick={() => setShowFilters(true)}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 border rounded-lg transition-colors whitespace-nowrap text-sm flex-shrink-0 ${
                  activeFiltersCount > 0
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-green-200 hover:bg-green-50 text-green-700"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            )}

            {!filtersConfig && showFilter && !setShowFilters && (
              <button className="flex items-center gap-2 px-3 md:px-4 py-2 border border-green-200 rounded-lg hover:bg-green-50 text-green-700 transition-colors whitespace-nowrap text-sm flex-shrink-0">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            )}

            {refetch && (
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap text-sm flex-shrink-0"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">
                  {isFetching ? "Updating..." : "Refresh"}
                </span>
              </button>
            )}
            {showAddButton && (
              <button
                onClick={onAdd}
                disabled={addButtonLoading}
                className={`
                  flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap text-sm flex-shrink-0
                  ${addButtonLoading 
                    ? 'bg-green-400 cursor-not-allowed opacity-75 text-white' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                  }
                `}
              >
                {addButtonLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span className="hidden sm:inline">{addButtonText}</span>
                    <span className="sm:hidden">Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{addButtonText}</span>
                    <span className="sm:hidden">Add</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden" onClick={() => setOpenMenuId(null)}>
        <div className="p-4">
          {currentData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No data available
            </div>
          ) : (
            currentData.map((item, index) => renderMobileCard(item, index))
          )}
        </div>
      </div>

      {/* Desktop Table View - COMPLETELY REWRITTEN FOR BETTER RESPONSIVE BEHAVIOR */}
      <div className="hidden md:block">
        <div className="overflow-auto" onClick={() => setOpenMenuId(null)}>
          {/* Use a flexible table layout with proper column sizing */}
          <div className="min-w-fit">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-green-50 sticky top-0">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider border-b border-green-100 ${
                        column.sortable ? "cursor-pointer hover:bg-green-100" : ""
                      }`}
                      style={{
                        // Use more flexible column sizing
                        width: column.width || 'auto',
                        minWidth: column.minWidth || '100px',
                        maxWidth: column.maxWidth || 'none',
                      }}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate">{column.label}</span>
                        {column.sortable && sortColumn === column.key && (
                          <span className="text-green-600 flex-shrink-0">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  {showActions && (
                    <th 
                      className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider border-b border-green-100"
                      style={{ width: '120px', minWidth: '120px' }}
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {currentData.map((item, index) => (
                  <tr key={index} className="hover:bg-green-25 transition-colors">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-3 py-4 text-sm text-gray-900 border-b border-green-50"
                        style={{
                          minWidth: column.minWidth || '100px',
                          maxWidth: column.maxWidth || 'none',
                        }}
                      >
                        <div className="overflow-hidden">
                          {/* Better text wrapping and overflow handling */}
                          <div className={`
                            ${column.key === 'email' || column.key === 'statusAction' || column.key === 'canReapply' ? 
                              'break-words' : 'truncate'
                            }
                          `}>
                            {column.render
                              ? column.render(item)
                              : renderCellValue(item[column.key], column)}
                          </div>
                        </div>
                      </td>
                    ))}
                    {showActions && (
                      <td className="px-3 py-4 text-sm text-gray-500 border-b border-green-50" style={{ width: '120px', minWidth: '120px' }}>
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
                                {onAddSubCategory && (
                                  <button
                                    onClick={() =>
                                      handleMenuAction("add-sub", item)
                                    }
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add Sub Category
                                  </button>
                                )}
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
        </div>
      </div>

      {/* New Pagination Component */}
      {showPagination && totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 bg-white rounded-lg shadow-sm border border-green-100 p-4">
          {/* Pagination Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPageValue - 1)}
              disabled={currentPageValue === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("common.previous") || "Previous"}
            </button>
           
            {/* Page Numbers */}
            <div className="flex gap-1 overflow-x-auto">
              {generatePageNumbers().map((pageNum, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : undefined}
                  disabled={pageNum === '...'}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex-shrink-0 ${
                    pageNum === currentPageValue
                      ? 'bg-emerald-500 text-white'
                      : pageNum === '...'
                      ? 'text-slate-400 cursor-default'
                      : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
           
            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPageValue + 1)}
              disabled={currentPageValue === totalPages || (paginationInfo && !paginationInfo?.hasNextPage)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {t("common.next") || "Next"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DynamicTable;