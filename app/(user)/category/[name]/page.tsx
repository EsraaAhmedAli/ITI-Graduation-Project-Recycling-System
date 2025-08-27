"use client";

import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/models/cart";
import { Loader } from "@/components/common";
import { Recycle, Plus, ChevronLeft, ChevronRight, Minus } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import {
  useGetItemsPaginated,
  LocalizedItem,
} from "@/hooks/useGetItemsPaginated";
import dynamic from "next/dynamic";
import { memo, useCallback, useMemo, Suspense, startTransition, useState } from "react";

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
// Updated ItemCard component with manual "Add to Cart" button
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
    item: LocalizedItem & { currentQuantity?: number };
    locale: string;
    convertNumber: (num: number) => string;
    t: (key: string, params?: any) => string;
    onAddToCart: (item: LocalizedItem, quantity: number) => void;
    isLoading: boolean;
    index?: number;
  }) => {
    const { cart } = useCart();
    
    // Find current cart quantity for this item (for display purposes)
    const cartItem = useMemo(() => 
      cart.find(cartItem => cartItem._id === item._id), 
      [cart, item._id]
    );
    
    const currentCartQuantity = cartItem?.quantity || 0;
    
    // Local quantity state - not synced with cart until user clicks "Add to Cart"
const [quantity, setQuantity] = useState(currentCartQuantity);
const [inputValue, setInputValue] = useState(currentCartQuantity.toString());

    const [inputError, setInputError] = useState("");

    // Memoize all computed values to prevent recalculations
    const computedValues = useMemo(() => {
      const measurementText =
        item.measurement_unit === 1
          ? t("itemsModal.perKg")
          : t("itemsModal.perItem");

      const priceDisplay = {
        value: convertNumber((item.price * quantity).toFixed(2)),
        currency: t("itemsModal.currency"),
      };

      const itemName =
        typeof item.name === "string" ? item.name : item.name[locale];

      return { measurementText, priceDisplay, itemName };
    }, [item, locale, convertNumber, t, quantity]);

    // Validation function for quantity input
    const validateQuantity = useCallback((value: string) => {
      const numValue = parseFloat(value);

      // Check if it's a valid number
      if (isNaN(numValue) || numValue < 0) {
        return {
          isValid: false,
          errorMessage: t("common.invalidQuantity"),
          validValue: 0,
        };
      }

      // For measurement unit 2 (pieces) - only whole numbers
      if (item.measurement_unit === 2) {
        if (!Number.isInteger(numValue)) {
          return {
            isValid: false,
            errorMessage: t("common.wholeNumbersOnly"),
            validValue: Math.floor(numValue),
          };
        }
      }

      // For measurement unit 1 (kg) - minimum 0, multiples of 0.25
      if (item.measurement_unit === 1 && numValue > 0) {
        const minValue = 0.25;
        if (numValue < minValue) {
          return {
            isValid: false,
            errorMessage: t("common.minimumQuantity", {
              min: minValue,
              defaultValue: `Minimum quantity is ${minValue} kg`,
            }),
            validValue: minValue,
          };
        }

        // Check if it's a multiple of 0.25
        const remainder = (numValue * 100) % 25;
        if (remainder !== 0) {
          const roundedValue = Math.round(numValue * 4) / 4;
          return {
            isValid: false,
            errorMessage: t("common.invalidIncrement", {
              increment: "0.25",
              defaultValue: "Quantity must be in increments of 0.25 kg",
            }),
            validValue: roundedValue,
          };
        }
      }

      return {
        isValid: true,
        errorMessage: "",
        validValue: numValue,
      };
    }, [item.measurement_unit, t]);

    // Handle input change - only updates local state
    const handleInputChange = useCallback((value: string) => {
      setInputValue(value);
      
      const validation = validateQuantity(value);
      
      if (validation.isValid) {
        setQuantity(validation.validValue);
        setInputError("");
      } else {
        setInputError(validation.errorMessage);
      }
    }, [validateQuantity]);

    // Handle input blur - auto-correct invalid values
    const handleInputBlur = useCallback(() => {
      const validation = validateQuantity(inputValue);
      
      if (!validation.isValid) {
        setQuantity(validation.validValue);
        setInputValue(validation.validValue.toString());
        setInputError("");
      }
    }, [inputValue, validateQuantity]);

    // Handle plus/minus operations - only updates local state
    const handleOperation = useCallback((operation: "+" | "-") => {
      const step = item.measurement_unit === 1 ? 0.25 : 1;
      const newQuantity = operation === "+" ? quantity + step : Math.max(0, quantity - step);
      
      const validation = validateQuantity(newQuantity.toString());
      
      if (validation.isValid) {
        setQuantity(validation.validValue);
        setInputValue(validation.validValue.toString());
        setInputError("");
      }
    }, [quantity, item.measurement_unit, validateQuantity]);

    // Handle add to cart button click
    const handleAddToCart = useCallback(() => {
      if (quantity > 0 && !inputError) {
        onAddToCart(item, quantity);
      }
    }, [quantity, inputError, onAddToCart, item]);

    // Generate low-quality placeholder
    const blurDataURL =
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyruP8AHzTRtRVoezs";

    const canDecrease = quantity > 0;
    const canIncrease = true;
    const hasQuantityChanged = quantity > 0;
    const isQuantityDifferentFromCart = quantity !== currentCartQuantity;

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

          {/* Cart indicator when item is in cart */}
          {currentCartQuantity > 0 && (
            <div
              className="absolute top-2 left-2 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1"
              style={{
                backgroundColor: "var(--color-primary)",
              }}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
              {currentCartQuantity} {item.measurement_unit === 1 ? 'kg' : 'pcs'}
            </div>
          )}
        </div>

        {/* Content with fixed height to prevent CLS */}
        <div className="p-2 sm:p-3 flex flex-col justify-between" style={{ minHeight: "160px" }}>
          <div>
            <h3
              id={`item-${item._id}`}
              className="font-bold mb-1 text-xs sm:text-sm uppercase tracking-wide leading-tight line-clamp-2"
              style={{ color: "var(--text-gray-900)" }}
            >
              {computedValues.itemName}
            </h3>

            <div className="flex items-center justify-between mb-2">
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

          {/* Quantity Controls */}
          <div className="space-y-2">
            {/* Error message */}
            {inputError && (
              <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded p-1">
                {inputError}
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Minus button */}
              <button
                onClick={() => handleOperation("-")}
                disabled={!canDecrease || isLoading}
                className="flex-shrink-0 w-8 h-8 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{
                  borderColor: canDecrease ? "var(--color-primary)" : "var(--border-color)",
                  backgroundColor: canDecrease ? "var(--color-primary)" : "var(--color-base-100)",
                  color: canDecrease ? "white" : "var(--text-gray-400)",
                }}
                onMouseEnter={(e) => {
                  if (canDecrease && !isLoading) {
                    e.currentTarget.style.backgroundColor = "var(--color-green-600)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (canDecrease && !isLoading) {
                    e.currentTarget.style.backgroundColor = "var(--color-primary)";
                  }
                }}
                type="button"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Quantity input */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onBlur={handleInputBlur}
                  disabled={isLoading}
                  className="w-full px-2 py-1 text-center text-sm font-medium border rounded focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: inputError ? "var(--color-error)" : "var(--border-color)",
                    backgroundColor: "var(--color-card)",
                    color: "var(--text-gray-900)",
                  }}
                  placeholder="0"
                />
              </div>

              {/* Plus button */}
              <button
                onClick={() => handleOperation("+")}
                disabled={isLoading}
                className="flex-shrink-0 w-8 h-8 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{
                  borderColor: "var(--color-primary)",
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "var(--color-green-600)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = "var(--color-primary)";
                  }
                }}
                type="button"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button - Shows when quantity > 0 and no errors */}
            {hasQuantityChanged && !inputError && (
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-full text-black py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                style={{
                  background: isLoading
                    ? "var(--text-gray-400)"
                    : isQuantityDifferentFromCart
                    ? "linear-gradient(to right, var(--color-primary), var(--color-secondary))"
                    : "linear-gradient(to right, var(--color-green-600), var(--color-green-500))",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = isQuantityDifferentFromCart
                      ? "linear-gradient(to right, var(--color-green-600), var(--color-secondary))"
                      : "linear-gradient(to right, var(--color-green-700), var(--color-green-600))";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = isQuantityDifferentFromCart
                      ? "linear-gradient(to right, var(--color-primary), var(--color-secondary))"
                      : "linear-gradient(to right, var(--color-green-600), var(--color-green-500))";
                  }
                }}
                type="button"
                aria-label={`Add ${computedValues.itemName} to cart`}
              >
                {isLoading ? (
                  <div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    role="status"
                    aria-label="Loading"
                  />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>
                      {currentCartQuantity > 0 && isQuantityDifferentFromCart
                        ? t("itemsModal.updateCart") || "Update Cart"
                      
                        : t("itemsModal.addToCollection") || "Add to Cart"}
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Status information */}
            <div className="text-center space-y-1">
              {currentCartQuantity > 0 && (
                <div className="text-xs font-medium flex items-center justify-center gap-1" 
                     style={{ color: "var(--color-primary)" }}>
                  <div className="w-2 h-2 bg-current rounded-full" />
                  Currently in cart: {currentCartQuantity} {item.measurement_unit === 1 ? 'kg' : 'items'}
                </div>
              )}
              
              {/* Helper text */}
              <div className="text-xs" style={{ color: "var(--text-gray-500)" }}>
                {item.measurement_unit === 1
                  ? t("common.kgIncrement", {
                      defaultValue: "Min 0.25kg, increments of 0.25kg",
                    })
                  : t("common.wholeNumbers", {
                      defaultValue: "Whole numbers only",
                    })}
              </div>
            </div>
          </div>
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
 // Fixed handleAddToCollection function - use the quantity parameter
const handleAddToCollection = useCallback(
  async (item: LocalizedItem, quantity: number) => {
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
        categoryId: item.categoryId || categoryName,
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
        quantity: quantity,
      };

      await addToCart(cartItem, true); // ← Add true here to replace quantity
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  },
  [addToCart, categoryName]
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
