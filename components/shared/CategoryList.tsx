"use client";

import { useState, useMemo, useCallback, memo, Suspense } from "react";
import dynamic from "next/dynamic";
import { useCategories } from "@/hooks/useGetCategories";
import { Category } from "../Types/categories.type";
import { useLanguage } from "@/context/LanguageContext";

// Lazy load CategoryCard with skeleton fallback
const CategoryCard = dynamic(() => import("./CategoryCard"), {
  ssr: false,
  loading: () => <CategorySkeleton />
});

// Category Skeleton Component matching the ItemCard skeleton pattern
const CategorySkeleton = memo(() => (
  <div className="animate-pulse">
<div className="w-full max-w-64 h-60 mb-8 rounded-3xl overflow-hidden shadow-lg bg-slate-200">
      {/* Image skeleton */}
      <div className="flex flex-col items-center justify-center p-4 h-full">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-slate-300 p-1 shadow-md">
            <div className="w-full h-full rounded-full bg-slate-200 border-4 border-white" />
          </div>
          {/* Icon overlay skeleton */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-300 rounded-full border-2 border-gray-100" />
        </div>
        
        {/* Title skeleton */}
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
:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 sm:px-6 lg:px-8"
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
}

const CategoryList = memo(function CategoryList({
  maxToShow = 10,
  horizontal = false,
}: CategoryListProps) {
  const [showAll, setShowAll] = useState(false);
  const { t } = useLanguage();
  const { data, isLoading, error } = useCategories();

  // Memoize categories with better dependency tracking
  const { categoriesToShow, shouldShowSeeMoreButton, totalCategories } = useMemo(() => {
    if (!data?.data) return { categoriesToShow: [], shouldShowSeeMoreButton: false, totalCategories: 0 };
    
    const categories = data.data;
    const total = categories.length;
    
    const toShow = showAll || !maxToShow 
      ? categories 
      : categories.slice(0, maxToShow);

    return {
      categoriesToShow: toShow,
      shouldShowSeeMoreButton: !showAll && maxToShow && total > maxToShow,
      totalCategories: total
    };
  }, [data?.data, showAll, maxToShow]);

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

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="space-y-8">
        <section className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
          {/* Header skeleton */}
          <div className="pl-18 mb-8 mt-16">
            <div className="animate-pulse">
              <div className="w-80 h-8 bg-slate-200 rounded mb-2" />
              <div className="w-96 h-5 bg-slate-200 rounded" />
            </div>
          </div>

          {/* Categories skeleton grid */}
          <CategorySkeletonGrid 
            count={maxToShow || 10} 
            horizontal={horizontal} 
          />

          {/* See more button skeleton */}
          {maxToShow && (
            <div className="flex justify-center mt-8">
              <div className="w-32 h-10 bg-slate-200 rounded-full animate-pulse" />
            </div>
          )}
        </section>

        {/* Footer message skeleton */}
        <div className="text-center mt-8">
          <div className="w-64 h-4 bg-slate-200 rounded animate-pulse mx-auto" />
        </div>
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

        {shouldShowSeeMoreButton && (
          <SeeMoreButton 
            onClick={handleSeeMoreClick}
            totalCategories={totalCategories}
            t={t}
          />
        )}
      </section>

      <FooterMessage t={t} />
    </div>
  );
});

// Optimized sub-components
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