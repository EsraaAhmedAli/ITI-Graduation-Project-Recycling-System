import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';

type Column = {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'status' | 'price' | 'image' | string;
};

type DynamicTableProps<T> = {
  data: T[];
  columns: Column[];
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
  onDelete = () => {},
}: DynamicTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleMenu = (id: string | number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleMenuAction = (action: 'edit' | 'delete' | 'view', item: T) => {
    setOpenMenuId(null);
    if (action === 'edit') onEdit(item);
    else if (action === 'delete') onDelete(item);
  };

  const renderCellValue = (value: any, column: Column) => {
    if (column.type === 'status') {
      const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-600',
        pending: 'bg-emerald-100 text-emerald-700',
        'on sale': 'bg-teal-100 text-teal-700',
        sourcing: 'bg-lime-100 text-lime-700',
        recycled: 'bg-green-100 text-green-800',
        processing: 'bg-emerald-100 text-emerald-700',
        collected: 'bg-teal-100 text-teal-700',
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
          {value}
        </span>
      );
    }

    if (column.type === 'price') {
      return `$${value}`;
    }

    if (column.type === 'image') {
      return (
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border border-green-200">
          <span className="text-lg">{value}</span>
        </div>
      );
    }

    return value;
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
            ? 'bg-green-500 text-white'
            : 'bg-white text-gray-700 hover:bg-green-50 border border-green-200'
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
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-green-800">{title}</h1>
            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Showing {Math.min(itemsPerPage, sortedData.length)} of {sortedData.length}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            
            {showFilter && (
              <button className="flex items-center gap-2 px-4 py-2 border border-green-200 rounded-lg hover:bg-green-50 text-green-700 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            )}
            
     
            
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
                    column.sortable ? 'cursor-pointer hover:bg-green-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-green-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
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
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderCellValue(item[column.key], column)}
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
                            <button
                              onClick={() => handleMenuAction('edit', item)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleMenuAction('view', item)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <hr className="my-1 border-green-100" />
                            <button
                              onClick={() => handleMenuAction('delete', item)}
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
              Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} results
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
              
              <div className="flex gap-1">
                {renderPagination()}
              </div>
              
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
};

// Example usage component

export default DynamicTable;