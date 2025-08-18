// components/LazyPagination.tsx
import { memo } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  onPageChange: (page: number) => void;
}

const LazyPagination = memo(({ pagination, onPageChange }: PaginationProps) => {
  // Limit pagination buttons to prevent large DOM trees
  const getVisiblePages = () => {
    const { currentPage, totalPages } = pagination;
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="flex justify-center mt-6" role="navigation" aria-label="Pagination">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
          className={`p-1.5 rounded-md transition-colors ${
            pagination.hasPreviousPage
              ? "text-green-600 hover:bg-green-50"
              : "text-gray-300 cursor-not-allowed"
          }`}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${
              pagination.currentPage === page
                ? "bg-green-600 text-white"
                : "text-green-600 hover:bg-green-50"
            }`}
            aria-label={`Go to page ${page}`}
            aria-current={pagination.currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className={`p-1.5 rounded-md transition-colors ${
            pagination.hasNextPage
              ? "text-green-600 hover:bg-green-50"
              : "text-gray-300 cursor-not-allowed"
          }`}
          aria-label="Go to next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
});

LazyPagination.displayName = 'LazyPagination';

export default LazyPagination;