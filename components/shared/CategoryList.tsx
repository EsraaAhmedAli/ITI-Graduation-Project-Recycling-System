"use client";

import React, { useState, useMemo, useCallback, memo, Suspense, startTransition } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCategories } from "@/hooks/useGetCategories";
import { Category } from "../Types/categories.type";
import { useLanguage } from "@/context/LanguageContext";

// Lazy load CategoryCard with skeleton fallback
const CategoryCard = dynamic(() => import("./CategoryCard"), {
  ssr: false,
  loading: () => <CategorySkeleton />
});

// Category Skeleton Component
const CategorySkeleton = memo(() => (
  <div className="animate-pulse">
    <div className="w-full max-w-64 h-60 mb-8 rounded-3xl overflow-hidden shadow-lg bg-slate-200">
      <div className="flex flex-col items-center justify-center p-4 h-full">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-slate-300 p-1 shadow-md">
            <div className="w-full h-full rounded-full bg-slate-200 border-4 border-white" />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-300 rounded-full border-2 border-gray-100" />
        </div>
        <div className="flex flex-col items-center mb-4">
          <div className="w-32 h-5 bg-slate-300 rounded mb-1" />
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  </div>
));
CategorySkeleton.displayName = 'CategorySkeleton';

// Grid of category skeletons
const CategorySkeletonGrid = memo(({ 
  count = 10, 
  horizontal = false 
}: { 
  count?: number, 
  horizontal?: boolean 
}) => (
  <div className={
    horizontal 
      ? "overflow-x-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100" 
      : ""
  }>
    <div className={
      horizontal
        ? "flex gap-6 pl-4 min-w-max pb-4"
        : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 sm:px-6 lg:px-8"
    }>
      {Array(count).fill(0).map((_, i) => (
        <CategorySkeleton key={`category-skeleton-${i}`} />
      ))}
    </div>
  </div>
));
CategorySkeletonGrid.displayName = 'CategorySkeletonGrid';

interface CategoryListProps {
  basePath: string;
  maxToShow?: number;
  horizontal?: boolean;
  enablePagination?: boolean;
  itemsPerPage?: number;
}


const CategoryList = memo(function CategoryList({
  maxToShow,
  horizontal = false,
  enablePagination = false,
  itemsPerPage = 10,
}: CategoryListProps) {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useLanguage();
  const scrollToTop = useCallback(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}, []);
  // Use pagination only if enablePagination is true
  const { data, isLoading, error, isFetching } = useCategories(
    enablePagination 
      ? { page: currentPage, limit: itemsPerPage }
      : { page: 1, limit: 1000 }
  );

  // Generate page numbers for pagination (matching items pagination style)
  const generatePageNumbers = useCallback((): (number | string)[] => {
    const pagination = data?.pagination;
    if (!pagination) return [];
    
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage;
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index);
  }, [data?.pagination]);

  // Handle page changes
const handlePageChange = useCallback((page: number) => {
  startTransition(() => {
    setCurrentPage(page);
    // Scroll to top after page change
    setTimeout(() => {
      scrollToTop();
    }, 50); // Small delay to ensure state update
  });
}, [scrollToTop]);

  // Memoize categories logic
  const { categoriesToShow, shouldShowSeeMoreButton, totalCategories } = useMemo(() => {
    if (!data?.data) return { categoriesToShow: [], shouldShowSeeMoreButton: false, totalCategories: 0 };
    
    const categories = data.data;
    
    if (enablePagination) {
      return {
        categoriesToShow: categories,
        shouldShowSeeMoreButton: false,
        totalCategories: data.pagination?.totalItems || categories.length
      };
    } else {
      const total = categories.length;
      const toShow = showAll || !maxToShow 
        ? categories 
        : categories.slice(0, maxToShow);

      return {
        categoriesToShow: toShow,
        shouldShowSeeMoreButton: !showAll && maxToShow && total > maxToShow,
        totalCategories: total
      };
    }
  }, [data?.data, data?.pagination, showAll, maxToShow, enablePagination]);

  const handleSeeMoreClick = useCallback(() => {
    setShowAll(true);
  }, []);

  const renderCategory = useCallback(
    (category: Category, index: number) => (
      <div
        key={category._id}
        className={horizontal ? "min-w-[200px] flex-shrink-0" : ""}
      >
        <CategoryCard 
          name={category.name} 
          image={category.image}
          displayName={category.displayName}
        />
      </div>
    ),
    [horizontal]
  );

  // Updated Pagination Controls Component (matching items style exactly)
const PaginationControls = memo(({ 
  pagination,
  currentPage,
  onPageChange,
  generatePageNumbers,
  t
}: {
  pagination: any;
  currentPage: number;
  onPageChange: (page: number) => void;
  generatePageNumbers: () => (number | string)[];
  t: (key: string, params?: any) => string;
}) => {
  const pageNumbers = useMemo(() => generatePageNumbers(), [generatePageNumbers]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (pagination?.hasNextPage) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, pagination?.hasNextPage, onPageChange]);

  const handlePageClick = useCallback((pageNum: number) => {
    onPageChange(pageNum);
  }, [onPageChange]);

  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <nav
      className="flex flex-col items-center gap-4"
      aria-label="Pagination Navigation"
      role="navigation"
    >
      {/* Pagination Buttons with fixed height container */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 min-h-[44px] my-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium border rounded-lg hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{
            color: "var(--text-gray-600)",
            backgroundColor: "var(--color-card)",
            borderColor: "var(--border-color)",
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.backgroundColor = "var(--color-base-100)";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.backgroundColor = "var(--color-card)";
            }
          }}
          aria-label="Go to previous page"
          type="button"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          {t("common.previous") || "Previous"}
        </button>

        <div className="flex gap-1 flex-wrap justify-center" role="group" aria-label="Page numbers">
          {pageNumbers.map((pageNum, index) => (
            <button
              key={`page-${index}-${pageNum}`}
              onClick={() =>
                typeof pageNum === "number" ? handlePageClick(pageNum) : undefined
              }
              disabled={pageNum === "..."}
              className="px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[44px]"
              style={{
                color:
                  pageNum === currentPage
                    ? "white"
                    : pageNum === "..."
                    ? "var(--text-gray-400)"
                    : "var(--text-gray-600)",
                backgroundColor:
                  pageNum === currentPage
                    ? "var(--color-primary)"
                    : pageNum === "..."
                    ? "transparent"
                    : "var(--color-card)",
                borderColor:
                  pageNum === currentPage
                    ? "var(--color-primary)"
                    : "var(--border-color)",
                border: pageNum === "..." ? "none" : "1px solid",
                cursor: pageNum === "..." ? "default" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (pageNum !== currentPage && pageNum !== "...") {
                  e.currentTarget.style.backgroundColor = "var(--color-base-100)";
                }
              }}
              onMouseLeave={(e) => {
                if (pageNum !== currentPage && pageNum !== "...") {
                  e.currentTarget.style.backgroundColor = "var(--color-card)";
                }
              }}
              aria-label={
                typeof pageNum === "number"
                  ? `Go to page ${pageNum}`
                  : undefined
              }
              aria-current={pageNum === currentPage ? "page" : undefined}
              type="button"
            >
              {pageNum}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!pagination?.hasNextPage}
          className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium border rounded-lg hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{
            color: "var(--text-gray-600)",
            backgroundColor: "var(--color-card)",
            borderColor: "var(--border-color)",
          }}
          onMouseEnter={(e) => {
            if (pagination?.hasNextPage) {
              e.currentTarget.style.backgroundColor = "var(--color-base-100)";
            }
          }}
          onMouseLeave={(e) => {
            if (pagination?.hasNextPage) {
              e.currentTarget.style.backgroundColor = "var(--color-card)";
            }
          }}
          aria-label="Go to next page"
          type="button"
        >
          {t("common.next") || "Next"}
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
});
  PaginationControls.displayName = "PaginationControls";

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="space-y-8">
        <section className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
          <div className="pl-18 mb-8 mt-16">
            <div className="animate-pulse">
              <div className="w-80 h-8 bg-slate-200 rounded mb-2" />
              <div className="w-96 h-5 bg-slate-200 rounded" />
            </div>
          </div>

          <CategorySkeletonGrid 
            count={enablePagination ? itemsPerPage : (maxToShow || 10)} 
            horizontal={horizontal} 
          />

          {/* Pagination skeleton when pagination is enabled */}
          {enablePagination && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2 animate-pulse">
                <div className="w-20 h-10 bg-slate-200 rounded" />
                <div className="w-10 h-10 bg-slate-200 rounded" />
                <div className="w-10 h-10 bg-slate-200 rounded" />
                <div className="w-10 h-10 bg-slate-200 rounded" />
                <div className="w-20 h-10 bg-slate-200 rounded" />
              </div>
            </div>
          )}

          {/* See more button skeleton when pagination is disabled */}
          {!enablePagination && maxToShow && (
            <div className="flex justify-center mt-8">
              <div className="w-32 h-10 bg-slate-200 rounded-full animate-pulse" />
            </div>
          )}
        </section>
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  if (!categoriesToShow.length) {
    return <EmptyState t={t} />;
  }

  return (
    <div className="space-y-8">
      <section className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
        <HeaderSection t={t} />

     

        <main>
          {horizontal ? (
            <HorizontalCategoryList 
              categories={categoriesToShow}
              renderCategory={renderCategory}
            />
          ) : (
            <GridCategoryList 
              categories={categoriesToShow}
              renderCategory={renderCategory}
            />
          )}

          {/* Pagination Controls - only show when pagination is enabled */}
          {enablePagination && (
            <Suspense fallback={<div className="h-20" />}>
              <PaginationControls
                pagination={data?.pagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                generatePageNumbers={generatePageNumbers}
                t={t}
              />
            </Suspense>
          )}

          {/* See More Button - only show when pagination is disabled */}
          {!enablePagination && shouldShowSeeMoreButton && (
            <SeeMoreButton 
              onClick={handleSeeMoreClick}
              totalCategories={totalCategories}
              t={t}
            />
          )}
        </main>
      </section>

      <FooterMessage t={t} />
    </div>
  );
});

// Optimized sub-components (keeping existing ones)
const HeaderSection = memo(({ t }: { t: (key: string) => string }) => (
  <div className="pl-18 mb-8 mt-16">
    <h2 className="text-3xl md:text-3xl font-bold text-start text-accent-content mb-2">
      {t("staticCategories.recyclingCategories")}
    </h2>
    <span className="text-green-700">
      {t("staticCategories.recyclingCategoriesSubtitle")}
    </span>
  </div>
));
HeaderSection.displayName = 'HeaderSection';

const HorizontalCategoryList = memo(({ 
  categories, 
  renderCategory 
}: { 
  categories: Category[], 
  renderCategory: (category: Category, index: number) => React.ReactNode 
}) => (
  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100">
    <div className="flex gap-6 pl-4 min-w-max pb-4">
      {categories.map(renderCategory)}
    </div>
  </div>
));
HorizontalCategoryList.displayName = 'HorizontalCategoryList';

const GridCategoryList = memo(({ 
  categories, 
  renderCategory 
}: { 
  categories: Category[], 
  renderCategory: (category: Category, index: number) => React.ReactNode 
}) => (
  <div 
    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 sm:px-6 lg:px-8"
    role="grid"
    aria-label="Category grid"
  >
    {categories.map((category, index) => (
      <div key={category._id} role="gridcell">
        {renderCategory(category, index)}
      </div>
    ))}
  </div>
));
GridCategoryList.displayName = 'GridCategoryList';

const SeeMoreButton = memo(({ 
  onClick, 
  totalCategories, 
  t 
}: { 
  onClick: () => void, 
  totalCategories: number, 
  t: (key: string) => string 
}) => (
  <div className="flex justify-center mt-8">
    <button
      onClick={onClick}
      className="px-6 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
      aria-label={`Show all ${totalCategories} categories`}
    >
      {t("staticCategories.seeMore")}
    </button>
  </div>
));
SeeMoreButton.displayName = 'SeeMoreButton';

const ErrorState = memo(({ onRetry }: { onRetry: () => void }) => (
  <div className="text-red-500 text-center p-4" role="alert">
    <p>Error loading categories.</p>
    <button 
      onClick={onRetry}
      className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
    >
      Retry
    </button>
  </div>
));
ErrorState.displayName = 'ErrorState';

const EmptyState = memo(({ t }: { t: (key: string) => string }) => (
  <div className="text-gray-500 text-center p-8">
    <p>{t("messages.noCategories", "No categories available")}</p>
  </div>
));
EmptyState.displayName = 'EmptyState';

const FooterMessage = memo(({ t }: { t: (key: string) => string }) => (
  <div className="text-center mt-8">
    <span className="text-green-700 text-sm">
      {t("staticCategories.clickImageForDetails")}
    </span>
  </div>
));
FooterMessage.displayName = 'FooterMessage';

export default CategoryList;