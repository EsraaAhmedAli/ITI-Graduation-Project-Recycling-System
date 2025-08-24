"use client";

import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/models/cart";
import { Loader } from "@/components/common";
import { Recycle, Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
  () => import("@/components/Voice Processing/FloatingRecorderButton"),
  {
    ssr: false,
    loading: () => null,
  }
);

// Skeleton Components for better perceived performance
const ItemSkeleton = memo(() => (
  <div
    className="animate-pulse rounded-2xl border overflow-hidden"
    style={{
      borderColor: "var(--border-color)",
      backgroundColor: "var(--color-card)",
    }}
  >
    <div
      className="h-40 w-full"
      style={{ backgroundColor: "var(--color-base-300)" }}
    />
    <div className="p-4">
      <div
        className="h-4 rounded mb-2"
        style={{ backgroundColor: "var(--color-base-300)" }}
      />
      <div
        className="h-4 rounded w-3/4 mb-3"
        style={{ backgroundColor: "var(--color-base-300)" }}
      />
      <div className="flex justify-between items-center mb-3">
        <div
          className="h-6 w-16 rounded-lg"
          style={{ backgroundColor: "var(--color-base-300)" }}
        />
        <div
          className="h-4 w-12 rounded"
          style={{ backgroundColor: "var(--color-base-300)" }}
        />
      </div>
      <div
        className="h-10 rounded-xl w-full"
        style={{ backgroundColor: "var(--color-base-300)" }}
      />
    </div>
  </div>
));
ItemSkeleton.displayName = "ItemSkeleton";

const ItemSkeletonGrid = memo(() => (
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-4 gap-3 sm:gap-4 mb-8">
    {Array(12)
      .fill(0)
      .map((_, i) => (
        <ItemSkeleton key={`skeleton-${i}`} />
      ))}
  </div>
));
ItemSkeletonGrid.displayName = "ItemSkeletonGrid";

// Optimized Item Card with layout shift prevention and theme variables
const ItemCard = memo(
  ({
    item,
    locale,
    convertNumber,
    t,
    onAddToCart,
    isLoading,
    index = 0,
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
      const measurementText =
        item.measurement_unit === 1
          ? t("itemsModal.perKg")
          : t("itemsModal.perItem");

      const priceDisplay = {
        value: convertNumber(item.price),
        currency: t("itemsModal.currency"),
      };

      const itemName =
        typeof item.name === "string" ? item.name : item.name[locale];

      return { measurementText, priceDisplay, itemName };
    }, [item, locale, convertNumber, t]);

    const handleClick = useCallback(() => {
      // Use startTransition for non-urgent updates
      startTransition(() => {
        onAddToCart(item, item.categoryId);
      });
    }, [item, onAddToCart]);

    // Generate low-quality placeholder
    const blurDataURL =
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyruP8AHzTRtRVoezs";

    return (
      <article
        className="group rounded-xl sm:rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{
          borderColor: "var(--border-color)",
          backgroundColor: "var(--color-card)",
          boxShadow:
            "0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 1px 0 rgba(0, 0, 0, 0.04)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 6px 10px -3px rgba(16, 185, 129, 0.1), 0 2px 4px -1px rgba(16, 185, 129, 0.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow =
            "0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 1px 0 rgba(0, 0, 0, 0.04)";
        }}
        role="article"
        aria-labelledby={`item-${item._id}`}
      >
        {/* Fixed aspect ratio container to prevent CLS */}
        <div
          className="relative w-full aspect-square"
          style={{
            background:
              "linear-gradient(to bottom right, var(--color-base-100), var(--color-base-200))",
          }}
        >
          <Image
            src={item.image}
            alt={computedValues.itemName}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300 p-2 sm:p-4"
            style={{ backgroundColor: "var(--color-image)" }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            priority={index < 8}
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
              transition: "opacity 0.3s ease-in-out",
              opacity: 0,
              backgroundColor: "var(--color-image)",
            }}
          />
          <div
            className="absolute top-2 right-2 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-md"
            style={{
              background:
                "linear-gradient(to right, var(--color-primary), var(--color-secondary))",
            }}
          >
            +{item.points}
          </div>
        </div>

        {/* Content with fixed height to prevent CLS */}
        <div className="p-2 sm:p-3 h-28 sm:h-32 flex flex-col justify-between">
          <div>
            <h3
              id={`item-${item._id}`}
              className="font-bold mb-1 text-xs sm:text-sm uppercase tracking-wide leading-tight line-clamp-2"
              style={{ color: "var(--text-gray-900)" }}
            >
              {computedValues.itemName}
            </h3>

            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-md"
                style={{
                  color: "var(--text-gray-600)",
                  backgroundColor: "var(--color-base-100)",
                }}
              >
                {computedValues.measurementText}
              </span>
              <div className="text-end">
                <span
                  className="text-sm sm:text-base font-bold"
                  style={{ color: "var(--text-gray-900)" }}
                >
                  {computedValues.priceDisplay.value}
                </span>
                <span
                  className="text-xs ml-0.5"
                  style={{ color: "var(--text-gray-600)" }}
                >
                  {computedValues.priceDisplay.currency}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClick}
            disabled={isLoading}
            className="w-full text-white py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 shadow-sm hover:shadow-md group/button h-8 sm:h-10"
            style={{
              background: isLoading
                ? "var(--text-gray-400)"
                : "linear-gradient(to right, var(--color-primary), var(--color-secondary))",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background =
                  "linear-gradient(to right, var(--color-green-600), var(--color-secondary))";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background =
                  "linear-gradient(to right, var(--color-primary), var(--color-secondary))";
              }
            }}
            aria-label={`Add ${computedValues.itemName} to collection`}
            type="button"
          >
            {isLoading ? (
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                role="status"
                aria-label="Loading"
              />
            ) : (
              <>
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 group-hover/button:rotate-90 transition-transform duration-200" />
                <span className="text-xs sm:text-sm">
                  {t("itemsModal.addToCollection")}
                </span>
              </>
            )}
          </button>
        </div>
      </article>
    );
  }
);
ItemCard.displayName = "ItemCard";
// Memoized Pagination with better performance and theme variables
const PaginationControls = memo(
  ({
    pagination,
    currentPage,
    onPageChange,
    generatePageNumbers,
    t,
  }: {
    pagination: any;
    currentPage: number;
    onPageChange: (page: number) => void;
    generatePageNumbers: () => (number | string)[];
    t: (key: string, params?: any) => string;
  }) => {
    const pageNumbers = useMemo(
      () => generatePageNumbers(),
      [generatePageNumbers]
    );

    const paginationInfo = useMemo(() => {
      const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
      const end = Math.min(
        pagination.currentPage * pagination.itemsPerPage,
        pagination.totalItems
      );
      return { start, end, total: pagination.totalItems };
    }, [pagination]);

    const handlePageChange = useCallback(
      (page: number) => {
        startTransition(() => {
          onPageChange(page);
        });
      },
      [onPageChange]
    );

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
                  typeof pageNum === "number"
                    ? handlePageChange(pageNum)
                    : undefined
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
                    e.currentTarget.style.backgroundColor =
                      "var(--color-base-100)";
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
  }
);
PaginationControls.displayName = "PaginationControls";

// Main Component with all optimizations and theme variables
export default function UserCategoryPage() {
  const { locale, t, convertNumber } = useLanguage();
  const params = useParams();
  const categoryName = useMemo(
    () => decodeURIComponent(params.name as string),
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
    itemsPerPage: 8,
    keepPreviousData: true,
  });

  // Optimized add to cart handler with proper error handling
  const handleAddToCollection = useCallback(
    async (item: LocalizedItem, catId: string) => {
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
    },
    [addToCart]
  );

  // Memoized header content
  const headerContent = useMemo(
    () => ({
      title: t("collectionsOfCategory", {
        collections: t("common.collectionsPlural"),
        category: categoryStats?.categoryDisplayName || categoryName,
      }),
      subtitle: t("staticCategories.discoverMoreSub"),
    }),
    [t, categoryStats, categoryName]
  );

  // Memoized empty state content
  const emptyStateContent = useMemo(
    () => ({
      title: t("common.noItemsAvailable") || "No items available",
      description:
        t("common.workingOnAddingItems") ||
        `We're working on adding more recyclable ${
          categoryStats?.categoryDisplayName || categoryName
        } items. Check back soon for new additions!`,
    }),
    [t, categoryStats, categoryName]
  );

  // Error state
  if (error) {
    console.error("Query Error:", error);
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(to bottom right, var(--color-base-100), var(--color-base-200))",
        }}
      >
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              backgroundColor: "var(--color-error)",
              opacity: "0.1",
            }}
          >
            <Recycle
              className="w-10 h-10"
              style={{ color: "var(--color-error)" }}
            />
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-gray-900)" }}
          >
            Unable to load items
          </h2>
          <p
            className="text-center mb-4"
            style={{ color: "var(--color-error)" }}
            role="alert"
          >
            Failed to load items. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg transition-colors text-white"
            style={{
              backgroundColor: "var(--color-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-green-600)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-primary)";
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"

    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
        {/* Header Section with semantic HTML */}
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="p-2 rounded-xl flex-shrink-0"
              style={{
                backgroundColor: "var(--color-green-100)",
                color: "var(--color-green-600)",
              }}
            >
              <Recycle className="w-6 h-6" />
            </div>
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold tracking-tight"
                style={{ color: "var(--text-gray-900)" }}
              >
                {headerContent.title}
              </h1>
              <p
                className="mt-1 text-sm md:text-base"
                style={{ color: "var(--text-gray-600)" }}
              >
                {headerContent.subtitle}
              </p>
            </div>
          </div>
        </header>

        {/* Loading overlay for pagination - only when fetching, not initial load */}
        {/* {isFetching && !isLoading && (
          <div
            className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
          >
            <div
              className="p-4 rounded-xl shadow-lg"
              style={{ backgroundColor: "var(--color-card)" }}
            >
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-2"
                style={{
                  borderColor: "rgba(16, 185, 129, 0.3)",
                  borderTopColor: "var(--color-primary)",
                }}
              />
              <p className="text-sm" style={{ color: "var(--text-gray-600)" }}>
                Loading items...
              </p>
            </div>
          </div>
        )} */}

        <main>
          {/* Loading State - Show skeleton immediately */}
          {isLoading && <ItemSkeletonGrid />}

          {/* Items Grid - Only show when data is loaded */}
          {!isLoading && data.length > 0 && (
            <>
              <div
className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-4 gap-3 sm:gap-4"                role="grid"
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
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "var(--color-base-100)" }}
              >
                <Recycle
                  className="w-10 h-10"
                  style={{ color: "var(--text-gray-400)" }}
                />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text-gray-600)" }}
              >
                {emptyStateContent.title}
              </h3>
              <p
                className="max-w-md mx-auto"
                style={{ color: "var(--text-gray-600)" }}
              >
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
