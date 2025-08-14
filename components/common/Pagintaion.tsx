"use client";
import React, { useState, useEffect } from "react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  pageGroupSize?: number; // how many page buttons to show per group
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  pageGroupSize = 5,
  currentPage,
  onPageChange,
}) => {
  const [pageGroupStart, setPageGroupStart] = useState(1);

  useEffect(() => {
    // adjust page group when currentPage changes
    const group =
      Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
    setPageGroupStart(group);
  }, [currentPage, pageGroupSize]);

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };
  const goBigPrev = () => goToPage(Math.max(1, currentPage - pageGroupSize));
  const goBigNext = () =>
    goToPage(Math.min(totalPages, currentPage + pageGroupSize));

  if (totalPages <= 1) return null;

  return (
    <div className="border-t border-gray-200 px-6 py-4 mt-6 rounded-b-2xl bg-white shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Big Prev */}
          <button
            onClick={goBigPrev}
            disabled={pageGroupStart === 1}
            className="px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            &laquo;
          </button>

          {/* Prev */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {/* Page Buttons */}
          {Array.from(
            {
              length: Math.min(pageGroupSize, totalPages - pageGroupStart + 1),
            },
            (_, i) => pageGroupStart + i
          ).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              disabled={page === currentPage}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                page === currentPage
                  ? "bg-green-500 text-white cursor-not-allowed"
                  : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>

          {/* Big Next */}
          <button
            onClick={goBigNext}
            disabled={pageGroupStart + pageGroupSize > totalPages}
            className="px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            &raquo;
          </button>
        </div>

        {/* Page Counter */}
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </div>
  );
};

export default Pagination;
