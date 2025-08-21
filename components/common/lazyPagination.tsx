"use client";
import React, { memo, useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  onPageChange: (page: number) => void;
  pageGroupSize?: number; // how many page buttons to show per group
  showPageCounter?: boolean; // show "Page X of Y" text
  showBigJumps?: boolean; // show << and >> buttons
}

const LazyPagination = memo(
  ({
    pagination,
    onPageChange,
    pageGroupSize = 5,
    showPageCounter = true,
    showBigJumps = true,
  }: PaginationProps) => {
    const { currentPage, totalPages, hasNextPage, hasPreviousPage } =
      pagination;

    // Memoize page calculations to prevent recalculation on every render
    const { visiblePages, canJumpBackward, canJumpForward } = useMemo(() => {
      if (totalPages <= 1)
        return {
          visiblePages: [],
          canJumpBackward: false,
          canJumpForward: false,
        };

      let pages: number[] = [];
      let jumpBack = false;
      let jumpForward = false;

      if (totalPages <= pageGroupSize) {
        // Show all pages if total is less than group size
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        // Calculate start and end of visible page group
        const halfGroup = Math.floor(pageGroupSize / 2);
        let start = Math.max(1, currentPage - halfGroup);
        let end = Math.min(totalPages, start + pageGroupSize - 1);

        // Adjust start if we're near the end
        if (end - start + 1 < pageGroupSize) {
          start = Math.max(1, end - pageGroupSize + 1);
        }

        pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        jumpBack = start > 1;
        jumpForward = end < totalPages;
      }

      return {
        visiblePages: pages,
        canJumpBackward: jumpBack,
        canJumpForward: jumpForward,
      };
    }, [currentPage, totalPages, pageGroupSize]);

    // Memoize event handlers to prevent unnecessary re-renders
    const handlePrevious = useCallback(() => {
      if (hasPreviousPage) {
        onPageChange(currentPage - 1);
      }
    }, [currentPage, hasPreviousPage, onPageChange]);

    const handleNext = useCallback(() => {
      if (hasNextPage) {
        onPageChange(currentPage + 1);
      }
    }, [currentPage, hasNextPage, onPageChange]);

    const handleBigPrevious = useCallback(() => {
      const newPage = Math.max(1, currentPage - pageGroupSize);
      onPageChange(newPage);
    }, [currentPage, pageGroupSize, onPageChange]);

    const handleBigNext = useCallback(() => {
      const newPage = Math.min(totalPages, currentPage + pageGroupSize);
      onPageChange(newPage);
    }, [currentPage, totalPages, pageGroupSize, onPageChange]);

    const handlePageClick = useCallback(
      (page: number) => {
        if (page !== currentPage) {
          onPageChange(page);
        }
      },
      [currentPage, onPageChange]
    );

    // Don't render if there's only one page or no pages
    if (totalPages <= 1) return null;

    return (
      <div className="border-t border-gray-200 px-4 sm:px-6 py-4 mt-6 rounded-b-2xl bg-white shadow-inner">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Navigation Controls */}
          <nav
            className="flex items-center gap-1 sm:gap-2"
            role="navigation"
            aria-label="Pagination Navigation"
          >
            {/* Big Previous (Jump Backward) */}
            {showBigJumps && canJumpBackward && (
              <button
                onClick={handleBigPrevious}
                className="p-1.5 sm:px-3 sm:py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label={`Jump backward ${pageGroupSize} pages`}
                title={`Jump to page ${Math.max(
                  1,
                  currentPage - pageGroupSize
                )}`}
              >
                <ChevronsLeft className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">&laquo;</span>
              </button>
            )}

            {/* Previous */}
            <button
              onClick={handlePrevious}
              disabled={!hasPreviousPage}
              className="p-1.5 sm:px-3 sm:py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Go to previous page"
            >
              <ChevronLeft className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {visiblePages.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  disabled={page === currentPage}
                  className={`w-8 h-8 sm:px-3 sm:py-2 sm:w-auto sm:h-auto flex items-center justify-center text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    page === currentPage
                      ? "bg-green-500 text-white cursor-not-allowed focus:ring-green-500"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 focus:ring-gray-500"
                  }`}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next */}
            <button
              onClick={handleNext}
              disabled={!hasNextPage}
              className="p-1.5 sm:px-3 sm:py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Go to next page"
            >
              <ChevronRight className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Next</span>
            </button>

            {/* Big Next (Jump Forward) */}
            {showBigJumps && canJumpForward && (
              <button
                onClick={handleBigNext}
                className="p-1.5 sm:px-3 sm:py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label={`Jump forward ${pageGroupSize} pages`}
                title={`Jump to page ${Math.min(
                  totalPages,
                  currentPage + pageGroupSize
                )}`}
              >
                <ChevronsRight className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">&raquo;</span>
              </button>
            )}
          </nav>

          {/* Page Counter */}
          {showPageCounter && (
            <div className="text-sm text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      </div>
    );
  }
);

LazyPagination.displayName = "LazyPagination";

export default LazyPagination;
