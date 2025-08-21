"use client";
import { useLanguage } from "@/context/LanguageContext";
import React, { memo, useMemo, useCallback } from "react";

interface PaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  onPageChange: (page: number) => void;
  pageGroupSize?: number; // how many page buttons to show per group
}

const Pagination = memo(
  ({ pagination, onPageChange, pageGroupSize = 5 }: PaginationProps) => {
    const { t, convertNumber } = useLanguage();
    const { currentPage, totalPages, hasNextPage, hasPreviousPage } =
      pagination;

    // compute visible pages (lazy pagination logic)
    const { visiblePages, canJumpBackward, canJumpForward } = useMemo(() => {
      if (totalPages <= 1) {
        return {
          visiblePages: [],
          canJumpBackward: false,
          canJumpForward: false,
        };
      }

      let pages: number[] = [];
      let jumpBack = false;
      let jumpForward = false;

      if (totalPages <= pageGroupSize) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        const half = Math.floor(pageGroupSize / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + pageGroupSize - 1);

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

    // handlers
    const handlePrevious = useCallback(() => {
      if (hasPreviousPage) onPageChange(currentPage - 1);
    }, [currentPage, hasPreviousPage, onPageChange]);

    const handleNext = useCallback(() => {
      if (hasNextPage) onPageChange(currentPage + 1);
    }, [currentPage, hasNextPage, onPageChange]);

    const handleBigPrevious = useCallback(() => {
      onPageChange(Math.max(1, currentPage - pageGroupSize));
    }, [currentPage, pageGroupSize, onPageChange]);

    const handleBigNext = useCallback(() => {
      onPageChange(Math.min(totalPages, currentPage + pageGroupSize));
    }, [currentPage, totalPages, pageGroupSize, onPageChange]);

    const handlePageClick = useCallback(
      (page: number) => {
        if (page !== currentPage) onPageChange(page);
      },
      [currentPage, onPageChange]
    );

    if (totalPages <= 1) return null;

    return (
      <div className="border-t border-gray-200 px-6 py-4 mt-6 rounded-b-2xl bg-white shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Big Prev */}
            <button
              onClick={handleBigPrevious}
              disabled={!canJumpBackward}
              className="px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              &laquo;
            </button>

            {/* Prev */}
            <button
              onClick={handlePrevious}
              disabled={!hasPreviousPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t("ewallet.transactions.previous")}
            </button>

            {/* Page Buttons */}
            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                disabled={page === currentPage}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  page === currentPage
                    ? "bg-green-500 text-white cursor-not-allowed"
                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                {convertNumber(page)}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={handleNext}
              disabled={!hasNextPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t("ewallet.transactions.next")}
            </button>

            {/* Big Next */}
            <button
              onClick={handleBigNext}
              disabled={!canJumpForward}
              className="px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              &raquo;
            </button>
          </div>

          {/* Page Counter */}
          <span className="text-sm text-gray-700">
            {t("common.page")} {convertNumber(currentPage)} {t("common.of")}{" "}
            {convertNumber(totalPages)}
          </span>
        </div>
      </div>
    );
  }
);

Pagination.displayName = "Pagination";

export default Pagination;
