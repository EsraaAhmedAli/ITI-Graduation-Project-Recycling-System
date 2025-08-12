"use client";

import { motion } from "framer-motion";
import CategoryCard from "./CategoryCard";
import Loader from "../common/Loader";

import { useState, useMemo, useCallback } from "react";
import { useCategories } from "@/hooks/useGetCategories";
import { Category } from "../Types/categories.type";

import Marquee from "react-fast-marquee";
import { useLanguage } from "@/context/LanguageContext";

interface CategoryListProps {
  basePath: string;
  maxToShow?: number;
  horizontal?: boolean;
}

export default function CategoryList({
  maxToShow,
  horizontal = false,
}: CategoryListProps) {
  const [showAll, setShowAll] = useState(false);
  const { t } = useLanguage();
  const { data, isLoading, error } = useCategories();

  // Memoize the categories to show to avoid recalculation on every render
  const categoriesToShow = useMemo(() => {
    if (!data?.data) return [];

    if (showAll) return data.data;
    if (maxToShow) return data?.data.slice(0, maxToShow);
    return data.data;
  }, [data?.data, showAll, maxToShow]);

  // Memoize the "See More" button visibility
  const shouldShowSeeMoreButton = useMemo(() => {
    return !showAll && maxToShow && (data?.data?.length ?? 0) > maxToShow;
  }, [showAll, maxToShow, data?.data?.length]);

  // Memoize the click handler to avoid recreating function on every render
  const handleSeeMoreClick = useCallback(() => {
    setShowAll(true);
  }, []);

  // Memoized category rendering function
  const renderCategory = useCallback(
    (category: Category) => (
      <div
        key={category._id}
        className={
          horizontal
            ? "min-w-[200px]"
            : "transform transition-transform duration-300 hover:scale-105"
        }>
        <CategoryCard name={category?.name} image={category?.image} />
      </div>
    ),
    [horizontal]
  );

  // Early returns for loading and error states
  if (isLoading) return <Loader title="categories" />;
  if (error)
    return (
      <p className="text-red-500 text-center">Error loading categories.</p>
    );

  return (
    <div>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-16 px-2 sm:px-4">
        <div className="pl-18 mb-8 mt-16">
          <h2 className="text-3xl md:text-3xl font-bold text-start text-accent-content mb-2">
            {t("staticCategories.recyclingCategories")}
          </h2>
          <span className="text-green-700">
            {t("staticCategories.recyclingCategoriesSubtitle")}
          </span>
        </div>

        {horizontal ? (
          <Marquee
            speed={100}
            gradient={false}
            pauseOnHover
            className="overflow-hidden">
            <div className="flex gap-6 pl-4">
              {categoriesToShow.map(renderCategory)}
            </div>
          </Marquee>
        ) : (
          <div className="flex flex-wrap justify-start items-start gap-6 pl-18">
            {categoriesToShow.map(renderCategory)}
          </div>
        )}

        {shouldShowSeeMoreButton && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSeeMoreClick}
              className="px-6 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-300 shadow-md">
              {t("staticCategories.seeMore")}
            </button>
          </div>
        )}
      </motion.section>

      <div className="text-center mt-8">
        <span className="text-green-700">
          {t("staticCategories.clickImageForDetails")}
        </span>
      </div>
    </div>
  );
}
