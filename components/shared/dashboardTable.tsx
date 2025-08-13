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

  type Column<T> = {
    key: string;
    label: string;
    sortable?: boolean;
    type?: "status" | "price" | "image" | string;
    hideOnMobile?: boolean; // New prop to hide columns on mobile
    priority?: number; // Priority for showing columns (1 = highest priority)

    render?: (item: T) => React.ReactNode;
    filterable?: boolean;
    filterType?: FilterType; // Add this
    filterOptions?: FilterOption[]; // Update this
  };

  type DynamicTableProps<T> = {
    data: T[];
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
    // New props for custom filter logic (optional)
    filters?: any;
    setFilters?: (filters: any) => void;
    setShowFilters?: (show: boolean) => void;
    activeFiltersCount?: number;
    refetch?: () => void;
    isFetching?: boolean;
    // Search props to work with external search state
    searchTerm?: string;
    onSearchChange?: (searchTerm: string) => void;

    // Filters Props
    externalFilters?: Record<string, string[]>;
    onExternalFiltersChange?: (filters: Record<string, string[]>) => void;
    onView?: (item: T) => void;
    getRenderedValue?: (row: any, key: string) => string;
    filtersConfig?: FilterConfig[]; // ✅ new
  };

  function DynamicTable<T extends { [key: string]: any; id?: string | number }>({
    data = [],
    columns = [],
    title = "Product",
    itemsPerPage = 10,
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
    onImageClick,
    // New props
    filters,
    setFilters,
    setShowFilters,
    activeFiltersCount = 0,
    refetch,
    isFetching = false,
    searchTerm: externalSearchTerm,
    onSearchChange,

    onView = () => {},
    externalFilters = [],
    onExternalFiltersChange,
    getRenderedValue,
    filtersConfig,
  }: DynamicTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortColumn, setSortColumn] = useState("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string | number>>(
      new Set()
    );
    const [pageGroupSize, setPageGroupSize] = useState(5); // Default to desktop
  useEffect(() => {
    const updatePageGroupSize = () => {
      setPageGroupSize(window.innerWidth < 768 ? 3 : 5);
    };
    
    updatePageGroupSize(); // Set initial value
    window.addEventListener('resize', updatePageGroupSize);
    
    return () => window.removeEventListener('resize', updatePageGroupSize);
  }, []);
    // Removed isDrawerOpen, setIsDrawerOpen. FilterDrawer now manages its own state.

    // Use external search term if provided, otherwise use internal state
    const currentSearchTerm =
      externalSearchTerm !== undefined ? externalSearchTerm : searchTerm;

    const handleSearchChange = (value: string) => {
      if (onSearchChange) {
        onSearchChange(value);
      } else {
        setSearchTerm(value);
      }
    };
    const sortKeyMap: Record<string, keyof T> = {
      createdAt: "orderDate", // map display key to real sortable field
      // Add more if needed
    };

    const filteredData = useMemo(() => {
      if (!currentSearchTerm) return data;
      return data.filter((item) =>
        Object.values(item).some((value) =>
          value
            ?.toString()
            .toLowerCase()
            .includes(currentSearchTerm.toLowerCase())
        )
      );
    }, [data, currentSearchTerm]);

    const getSortKey = (colKey: string): string => {
      const col = columns.find((c) => c.key === colKey);
      return (col?.sortKey as string) || colKey;
    };

    const sortedData = useMemo(() => {
      if (!sortColumn) return filteredData;
      return [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        // Safe guard in case of null or undefined
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        const aStr = aValue.toString().toLowerCase();
        const bStr = bValue.toString().toLowerCase();

        return sortDirection === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }, [filteredData, sortColumn, sortDirection]);
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = sortedData?.slice(startIndex, endIndex);

    // Get columns that should be visible on mobile (priority-based)
    const mobileColumns = useMemo(() => {
      return columns
        .filter((col) => !col.hideOnMobile)
        .sort((a, b) => (a.priority || 999) - (b.priority || 999))
        .slice(0, 2); // Show only 2 most important columns on mobile
    }, [columns]);

    const handleSort = (column: string) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    };
    // const autoGeneratedFiltersConfig: FilterConfig[] = useMemo(() => {
    //   return columns
    //     .filter((col) => col.filterable)
    //     .map((col) => ({
    //       name: col.key,
    //       title: col.label,
    //       type: col.filterType || "search", // default to 'search' if not defined
    //       options: col.filterOptions || [],
    //     }));
    // }, [columns]);
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
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

    const renderCellValue = (value: any, column: Column<T>) => {
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

    const renderMobileCard = (item: T, index: number) => {
      const rowId = item.id || index;
      const isExpanded = expandedRows.has(rowId);

      return (
        <div
          key={index}
          className="bg-white border border-green-100 rounded-lg mb-4 shadow-sm"
        >
          <div className="p-4">
            {/* Main content - always visible */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                {mobileColumns.map((column, colIndex) => (
                  <div key={column.key} className={colIndex > 0 ? "mt-2" : ""}>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      {column.label}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {column.render
                        ? column.render(item)
                        : renderCellValue(item[column.key], column)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
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

            {/* Expanded content */}
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
                        <div className="text-sm text-gray-900 mt-1">
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

    const renderPagination = () => {
      const pages = [];
    const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
    const startPage = currentGroup * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

      // « Previous group
      if (startPage > 1) {
        pages.push(
          <button
            key="prev-group"
            onClick={() => handlePageChange(startPage - 1)}
            className="px-2 md:px-3 py-1 rounded text-sm bg-white border border-green-200 hover:bg-green-50 text-green-700 transition-colors"
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
            className={`px-2 md:px-3 py-1 rounded text-sm transition-colors ${
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
            className="px-2 md:px-3 py-1 rounded text-sm bg-white border border-green-200 hover:bg-green-50 text-green-700 transition-colors"
          >
            &raquo;
          </button>
        );
      }

      return pages;
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-green-100 ">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-green-100 bg-gradient-to-r from-green-100 to-emerald-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl md:text-2xl font-semibold text-green-800">
                {title}
              </h1>
              <span className="text-xs md:text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">
                Showing {Math.min(itemsPerPage, sortedData.length)} of{" "}
                {sortedData.length}
              </span>
            </div>

            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto">
              {/* Page Size Selector - only show when custom filters are provided */}
              {filters && setFilters && (
                <select
                  value={filters.limit}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      limit: parseInt(e.target.value),
                      page: 1,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              )}

              {showSearch && (
                <div className="relative min-w-0 flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm"
                    value={currentSearchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              )}
              {/* FilterDrawer handles its own open/close state and trigger button */}
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
                        className="flex items-center gap-2 px-3 md:px-4 py-2 border border-green-200 rounded-lg text-green-700 bg-white hover:bg-green-50 transition-colors shadow-sm whitespace-nowrap text-sm"
                      >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filter</span>
                      </button>
                    }
                  />
                )}
              {/* Custom Filter Button - only show when setShowFilters is provided */}
              {!filtersConfig && showFilter && setShowFilters && (
                <button
                  onClick={() => setShowFilters(true)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 border rounded-lg transition-colors whitespace-nowrap text-sm ${
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

              {/* Default Filter Button - only show when no custom filter is provided */}
              {!filtersConfig && showFilter && !setShowFilters && (
                <button className="flex items-center gap-2 px-3 md:px-4 py-2 border border-green-200 rounded-lg hover:bg-green-50 text-green-700 transition-colors whitespace-nowrap text-sm">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </button>
              )}

              {/* Refresh Button - only show when refetch is provided */}
              {refetch && (
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap text-sm"
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
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm whitespace-nowrap text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{addButtonText}</span>
                  <span className="sm:hidden">Add</span>
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

        {/* Desktop Table View */}
        <div
          className="hidden md:block overflow-x-auto "
          onClick={() => setOpenMenuId(null)}
        >
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
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column.render
                        ? column.render(item)
                        : renderCellValue(item[column.key], column)}
                    </td>
                  ))}

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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 md:px-6 py-4 border-t border-green-100 bg-green-25">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs md:text-sm text-green-700 order-2 sm:order-1">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, sortedData.length)} of {sortedData.length}{" "}
                results
              </div>

              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-2 md:px-3 py-1 rounded text-sm bg-white border border-green-200 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed text-green-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex gap-1">{renderPagination()}</div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-2 md:px-3 py-1 rounded text-sm bg-white border border-green-200 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed text-green-700 transition-colors"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  export default DynamicTable;
