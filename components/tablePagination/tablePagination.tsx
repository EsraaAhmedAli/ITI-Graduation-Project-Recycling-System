import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems
}: TablePaginationProps) {
  const renderPagination = () => {
    const pages = [];
    const pageGroupSize = window.innerWidth < 768 ? 3 : 5;
    const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
    const startPage = currentGroup * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

    if (startPage > 1) {
      pages.push(
        <button
          key="prev-group"
          onClick={() => onPageChange(startPage - 1)}
          className="px-2 md:px-3 py-1 rounded text-sm bg-white border border-green-200 hover:bg-green-50 text-green-700 transition-colors"
        >
          &laquo;
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
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

    if (endPage < totalPages) {
      pages.push(
        <button
          key="next-group"
          onClick={() => onPageChange(endPage + 1)}
          className="px-2 md:px-3 py-1 rounded text-sm bg-white border border-green-200 hover:bg-green-50 text-green-700 transition-colors"
        >
          &raquo;
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="px-4 md:px-6 py-4 border-t border-green-100 bg-green-25">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs md:text-sm text-green-700 order-2 sm:order-1">
          Showing {startIndex + 1} to {endIndex} of {totalItems} results
        </div>

        <div className="flex items-center gap-2 order-1 sm:order-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-2 md:px-3 py-1 rounded text-sm bg-white border border-green-200 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed text-green-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex gap-1">{renderPagination()}</div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-2 md:px-3 py-1 rounded text-sm bg-white border border-green-200 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed text-green-700 transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}