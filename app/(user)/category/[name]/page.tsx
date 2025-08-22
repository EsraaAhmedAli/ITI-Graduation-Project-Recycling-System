"use client";

import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/models/cart";
import { Loader } from '@/components/common'
import {
  Recycle,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import {
  useGetItemsPaginated,
  LocalizedItem,
} from "@/hooks/useGetItemsPaginated";
import dynamic from "next/dynamic";
import { memo, useCallback, useMemo, Suspense, startTransition } from "react";

// Ultra-lazy loading with no SSR and loading fallback
const FloatingRecorderButton = dynamic(
  () => import('@/components/Voice Processing/FloatingRecorderButton'),
  { 
    ssr: false,
    loading: () => null
  }
);

// Skeleton Components for better perceived performance
const ItemSkeleton = memo(() => (
  <div className="animate-pulse rounded-2xl border border-slate-200/60 overflow-hidden bg-white">
    <div className="bg-slate-200 h-40 w-full" />
    <div className="p-4">
      <div className="bg-slate-200 h-4 rounded mb-2" />
      <div className="bg-slate-200 h-4 rounded w-3/4 mb-3" />
      <div className="flex justify-between items-center mb-3">
        <div className="bg-slate-200 h-6 w-16 rounded-lg" />
        <div className="bg-slate-200 h-4 w-12 rounded" />
      </div>
      <div className="bg-slate-200 h-10 rounded-xl w-full" />
    </div>
  </div>
));
ItemSkeleton.displayName = 'ItemSkeleton';

const ItemSkeletonGrid = memo(() => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
    {Array(12).fill(0).map((_, i) => (
      <ItemSkeleton key={`skeleton-${i}`} />
    ))}
  </div>
));
ItemSkeletonGrid.displayName = 'ItemSkeletonGrid';

// Optimized Item Card with layout shift prevention
const ItemCard = memo(({ 
  item, 
  locale, 
  convertNumber, 
  t, 
  onAddToCart, 
  isLoading,
  index = 0
}: {
  item: LocalizedItem;
  locale: string;
  convertNumber: (num: number) => string;
  t: (key: string, params?: any) => string;
  onAddToCart: (item: LocalizedItem, categoryId: string) => void;
  isLoading: boolean;
  index?: number;
}) => {
  // Memoize all computed values to prevent recalculations
  const computedValues = useMemo(() => {
    const measurementText = item.measurement_unit === 1 ? 
      t("itemsModal.perKg") : t("itemsModal.perItem");
    
    const priceDisplay = {
      value: convertNumber(item.price),
      currency: t("itemsModal.currency")
    };
    
    const itemName = typeof item.name === "string" ? 
      item.name : item.name[locale];
    
    return { measurementText, priceDisplay, itemName };
  }, [item, locale, convertNumber, t]);

  const handleClick = useCallback(() => {
    // Use startTransition for non-urgent updates
    startTransition(() => {
      onAddToCart(item, item.categoryId);
    });
  }, [item, onAddToCart]);

  // Generate low-quality placeholder
  const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyruP8AHzTRtRVoezs";

  return (
    <article
      className="group rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 bg-white"
      role="article"
      aria-labelledby={`item-${item._id}`}
    >
      {/* Fixed aspect ratio container to prevent CLS */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100">
<Image
  src={item.image}
  alt={computedValues.itemName}
  fill
  className="object-contain group-hover:scale-105 transition-transform duration-300 p-4 bg-white"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
  priority={index < 8} // Increased from 4 to 8 for better LCP
  quality={index < 8 ? 85 : 75}
  placeholder="blur"
  blurDataURL={blurDataURL}
  loading={index < 8 ? "eager" : "lazy"}
  onLoad={(e) => {
    // Force repaint to prevent black flash
    const target = e.target as HTMLImageElement;
    target.style.opacity = "1";
  }}
  style={{ 
    transition: 'opacity 0.3s ease-in-out',
    opacity: 0 
  }}
/>
        <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          +{item.points}
        </div>
      </div>

      {/* Content with fixed height to prevent CLS */}
      <div className="p-4 h-32 flex flex-col justify-between">
        <div>
          <h3 
            id={`item-${item._id}`}
            className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide leading-tight line-clamp-2"
          >
            {computedValues.itemName}
          </h3>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-lg">
              {computedValues.measurementText}
            </span>
            <div className="text-end">
              <span className="text-base font-bold text-slate-900">
                {computedValues.priceDisplay.value}
              </span>
              <span className="text-xs text-slate-500 ml-1">
                {computedValues.priceDisplay.currency}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClick}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md group/button h-10"
          aria-label={`Add ${computedValues.itemName} to collection`}
          type="button"
        >
          {isLoading ? (
            <div 
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" 
              role="status"
              aria-label="Loading"
            />
          ) : (
            <>
              <Plus className="w-4 h-4 group-hover/button:rotate-90 transition-transform duration-200" />
              <span className="text-sm">
                {t("itemsModal.addToCollection")}
              </span>
            </>
          )}
        </button>
      </div>
    </article>
  );
});
ItemCard.displayName = 'ItemCard';

// Memoized Pagination with better performance
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
  
  const paginationInfo = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const end = Math.min(
      pagination.currentPage * pagination.itemsPerPage,
      pagination.totalItems
    );
    return { start, end, total: pagination.totalItems };
  }, [pagination]);

  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      onPageChange(page);
    });
  }, [onPageChange]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, handlePageChange]);

  const handleNext = useCallback(() => {
    if (pagination?.hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, pagination?.hasNextPage, handlePageChange]);

  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <nav 
      className="flex flex-col items-center gap-4"
      aria-label="Pagination Navigation"
      role="navigation"
    >
      {/* Pagination Info */}
      <div className="text-sm text-slate-600 text-center" aria-live="polite">
        {t("common.showing", paginationInfo) ||
          `Showing ${paginationInfo.start}-${paginationInfo.end} of ${paginationInfo.total} items`}
      </div>

      {/* Pagination Buttons with fixed height container */}
      <div className="flex items-center gap-2 min-h-[44px]">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Go to previous page"
          type="button"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          {t("common.previous") || "Previous"}
        </button>

        <div className="flex gap-1" role="group" aria-label="Page numbers">
          {pageNumbers.map((pageNum, index) => (
            <button
              key={`page-${index}-${pageNum}`}
              onClick={() => typeof pageNum === "number" ? handlePageChange(pageNum) : undefined}
              disabled={pageNum === "..."}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[44px] ${
                pageNum === currentPage
                  ? "bg-emerald-500 text-white"
                  : pageNum === "..."
                  ? "text-slate-400 cursor-default"
                  : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
              }`}
              aria-label={typeof pageNum === "number" ? `Go to page ${pageNum}` : undefined}
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
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
PaginationControls.displayName = 'PaginationControls';

// Main Component with all optimizations
export default function UserCategoryPage() {
  const { locale, t, convertNumber } = useLanguage();
  const params = useParams();
  const categoryName = useMemo(() => 
    decodeURIComponent(params.name as string), 
    [params.name]
  );
  const { addToCart, loadingItemId } = useCart();

  const {
    data,
    pagination,
    isLoading,
    isFetching,
    error,
    currentPage,
    handlePageChange,
    generatePageNumbers,
    categoryStats,
  } = useGetItemsPaginated({
    categoryName,
    itemsPerPage: 12,
    keepPreviousData: true,
  });

  // Optimized add to cart handler with proper error handling
  const handleAddToCollection = useCallback(async (item: LocalizedItem, catId: string) => {
    try {
      const englishItemName =
        typeof item.name === "string" ? item.name : item.name?.en || "";
      const arabicItemName =
        typeof item.name === "string" ? "" : item.name?.ar || "";

      const categoryNameEn =
        typeof item.categoryName === "string"
          ? item.categoryName
          : item.categoryName?.en || "";
      const categoryNameAr =
        typeof item.categoryName === "string"
          ? ""
          : item.categoryName?.ar || "";

      const cartItem: CartItem = {
        _id: item._id,
        categoryId: catId,
        categoryName: {
          en: categoryNameEn,
          ar: categoryNameAr,
        },
        name: {
          en: englishItemName,
          ar: arabicItemName,
        },
        image: item.image,
        points: item.points,
        price: item.price,
        measurement_unit: item.measurement_unit,
        quantity: item.measurement_unit === 1 ? 0.25 : 1,
      };

      await addToCart(cartItem);
    } catch (error) {
      console.error("Add to cart failed:", error);
      // Could add user notification here
    }
  }, [addToCart]);

  // Memoized header content
  const headerContent = useMemo(() => ({
    title: t("collectionsOfCategory", {
      collections: t("common.collectionsPlural"),
      category: categoryStats?.categoryDisplayName || categoryName,
    }),
    subtitle: t("staticCategories.discoverMoreSub")
  }), [t, categoryStats, categoryName]);

  // Memoized empty state content
  const emptyStateContent = useMemo(() => ({
    title: t("common.noItemsAvailable") || "No items available",
    description: t("common.workingOnAddingItems") ||
      `We're working on adding more recyclable ${
        categoryStats?.categoryDisplayName || categoryName
      } items. Check back soon for new additions!`
  }), [t, categoryStats, categoryName]);

  // Error state
  if (error) {
    console.error("Query Error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Recycle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Unable to load items
          </h2>
          <p className="text-red-500 text-center mb-4" role="alert">
            Failed to load items. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
        {/* Header Section with semantic HTML */}
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-100 rounded-xl flex-shrink-0">
              <Recycle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {headerContent.title}
              </h1>
              <p className="text-slate-500 mt-1 text-sm md:text-base">
                {headerContent.subtitle}
              </p>
            </div>
          </div>
        </header>

        {/* Loading overlay for pagination - only when fetching, not initial load */}
        {isFetching && !isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-600">Loading items...</p>
            </div>
          </div>
        )}

        <main>
          {/* Loading State - Show skeleton immediately */}
          {isLoading && <ItemSkeletonGrid />}

          {/* Items Grid - Only show when data is loaded */}
          {!isLoading && data.length > 0 && (
            <>
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8"
                role="grid"
                aria-label="Product grid"
              >
                {data.map((item, index) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    index={index}
                    locale={locale}
                    convertNumber={convertNumber}
                    t={t}
                    onAddToCart={handleAddToCollection}
                    isLoading={loadingItemId === item._id}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <Suspense fallback={<div className="h-20" />}>
                <PaginationControls
                  pagination={pagination}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  generatePageNumbers={generatePageNumbers}
                  t={t}
                />
              </Suspense>
            </>
          )}

          {/* Empty State - Only show when no data and not loading */}
          {!isLoading && data.length === 0 && (
            <div className="text-center py-12" role="status">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Recycle className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                {emptyStateContent.title}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {emptyStateContent.description}
              </p>
            </div>
          )}
        </main>
      </div>
      
      {/* Voice Processing Component - Ultra lazy loaded */}
      <Suspense fallback={null}>
        <FloatingRecorderButton />
      </Suspense>
    </div>
  );
}