"use client";

import { useState, useMemo, useCallback, memo } from "react";
import dynamic from "next/dynamic";
import { Loader } from '@/components/common'
import { useCategories } from "@/hooks/useGetCategories";
import { Category } from "../Types/categories.type";
import { useLanguage } from "@/context/LanguageContext";

// Lazy load CategoryCard to reduce initial bundle size
const CategoryCard = dynamic(() => import("./CategoryCard"), {
  ssr: false // Disable SSR for better performance if not needed for SEO
});

interface CategoryListProps {
  basePath: string;
  maxToShow?: number;
  horizontal?: boolean;
}

const CategoryList = memo(function CategoryList({
  maxToShow,
  horizontal = false,
}: CategoryListProps) {
  const [showAll, setShowAll] = useState(false);
  const { t } = useLanguage();
  const { data, isLoading, error } = useCategories();

  // Memoize all derived state to prevent unnecessary recalculations
  const derivedState = useMemo(() => {
    const categories = data?.data || [];
    const totalCategories = categories.length;
    
    let categoriesToShow: Category[];
    if (showAll || !maxToShow) {
      categoriesToShow = categories;
    } else {
      categoriesToShow = categories.slice(0, maxToShow);
    }

    const shouldShowSeeMoreButton = !showAll && maxToShow && totalCategories > maxToShow;

    return {
      categoriesToShow,
      shouldShowSeeMoreButton,
      totalCategories
    };
  }, [data?.data, showAll, maxToShow]);

  // Stable callback references
  const handleSeeMoreClick = useCallback(() => {
    setShowAll(true);
  }, []);

  // Optimized category rendering with stable keys
  const renderCategory = useCallback(
    (category: Category, index: number) => (
      <div
        key={`${category._id}-${index}`} // More stable key
        className={horizontal ? "min-w-[200px] flex-shrink-0" : ""}
      >
        <CategoryCard 
          name={category?.name} 
          image={category?.image}
          displayName={category?.displayName}
        />
      </div>
    ),
    [horizontal]
  );

  // Early returns with memoized components
  if (isLoading) {
    return <Loader title={t("loaders.Categories")} />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4" role="alert">
        <p>Error loading categories.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!derivedState.categoriesToShow.length) {
    return (
      <div className="text-gray-500 text-center p-8">
        <p>{t("messages.noCategories", "No categories available")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="mb-16 px-2 sm:px-4">
        {/* Header section - memoized */}
        <HeaderSection t={t} />

        {/* Categories grid/list with virtualization consideration */}
        {horizontal ? (
          <HorizontalCategoryList 
            categories={derivedState.categoriesToShow}
            renderCategory={renderCategory}
          />
        ) : (
          <GridCategoryList 
            categories={derivedState.categoriesToShow}
            renderCategory={renderCategory}
          />
        )}

        {/* See More Button */}
        {derivedState.shouldShowSeeMoreButton && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSeeMoreClick}
              className="px-6 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
              aria-label={`Show all ${derivedState.totalCategories} categories`}
            >
              {t("staticCategories.seeMore")}
            </button>
          </div>
        )}
      </section>

      {/* Footer message */}
      <div className="text-center mt-8">
        <span className="text-green-700 text-sm">
          {t("staticCategories.clickImageForDetails")}
        </span>
      </div>
    </div>
  );
});

// Memoized sub-components for better performance
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

const HorizontalCategoryList = memo(({ 
  categories, 
  renderCategory 
}: { 
  categories: Category[], 
  renderCategory: (category: Category, index: number) => React.ReactNode 
}) => (
  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100">
    <div className="flex gap-6 pl-4 min-w-max pb-4">
      {categories.map((category, index) => renderCategory(category, index))}
    </div>
  </div>
));

const GridCategoryList = memo(({ 
  categories, 
  renderCategory 
}: { 
  categories: Category[], 
  renderCategory: (category: Category, index: number) => React.ReactNode 
}) => (
  <div 
    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pl-10"
    role="grid"
    aria-label="Category grid"
  >
    {categories.map((category, index) => (
      <div key={`${category._id}-${index}`} role="gridcell">
        {renderCategory(category, index)}
      </div>
    ))}
  </div>
));

export default CategoryList;