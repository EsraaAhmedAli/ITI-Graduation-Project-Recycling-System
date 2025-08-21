import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PaginationInfo } from '@/hooks/useGetItemsPaginated';

interface PaginationProps {
  pagination: PaginationInfo;
  currentPage: number;
  onPageChange: (page: number) => void;
  generatePageNumbers: () => (number | string)[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  currentPage,
  onPageChange,
  generatePageNumbers,
  className = "",
}) => {
  const { t } = useLanguage();

  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Pagination Info */}
      <div className="text-sm text-slate-600 text-center">
        {t("common.showing", {
          start: (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
          end: Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems),
          total: pagination.totalItems
        }) || `Showing ${(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-${Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of ${pagination.totalItems} items`}
      </div>

      {/* Pagination Buttons */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">
            {t("common.previous") || "Previous"}
          </span>
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1">
          {generatePageNumbers().map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : undefined}
              disabled={pageNum === '...'}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[40px] ${
                pageNum === currentPage
                  ? 'bg-emerald-500 text-white shadow-sm'
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
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">
            {t("common.next") || "Next"}
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Additional Stats (Optional) */}
      <div className="text-xs text-slate-500 text-center">
        Page {currentPage} of {pagination.totalPages}
      </div>
    </div>
  );
};