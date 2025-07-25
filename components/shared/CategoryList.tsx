"use client";

import { motion } from "framer-motion";
import CategoryCard from "./CategoryCard";
import Loader from "../common/loader";

import {  useState } from "react";
import { useCategories } from "@/hooks/useGetCategories";
import { Category } from "../Types/categories.type";

import Marquee from "react-fast-marquee";



export default function CategoryList({  maxToShow,  horizontal = false,
 }: { basePath: string, maxToShow?: number , horizontal:boolean }) {
  const [showAll, setShowAll] = useState(false);

    const { data, isLoading, error } = useCategories(); 



  


  if (isLoading) return <Loader title="categories" />;
  if (error) return <p className="text-red-500 text-center">Error loading categories.</p>;

  const categoriesToShow = showAll ? data?.data : (maxToShow ? data?.data?.slice(0, maxToShow) : data?.data);

  return (
    <div>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-16 px-2 sm:px-4"
      >
        <div className="pl-18 mb-8 mt-16">
          <h2 className="text-3xl md:text-3xl font-bold text-left text-accent-content mb-2">
            Recycling Categories
          </h2>
          <span className="text-green-700">
            Having leftovers and want to earn money? Tell us what you have
          </span>
        </div>

     {horizontal ? (
  <Marquee speed={100} gradient={false} pauseOnHover className="overflow-hidden">
    <div className="flex gap-6 pl-4">
      {categoriesToShow?.map((category: Category) => (
        <div key={category._id} className="min-w-[200px]">
          <CategoryCard name={category?.name} image={category?.image} />
        </div>
      ))}
    </div>
  </Marquee>
) : (
<div className="flex flex-wrap justify-start items-start gap-6 pl-18">
  {categoriesToShow?.map((category: Category) => (
    <div
      key={category._id}
      className="transform transition-transform duration-300 hover:scale-105"
    >
      <CategoryCard name={category?.name} image={category?.image} />
    </div>
  ))}
</div>

)}


        {!showAll && maxToShow && data?.data.length > maxToShow && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAll(true)}
              className="px-6 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-300 shadow-md"
            >
              See more
            </button>
          </div>
        )}
      </motion.section>

      <div className="text-center mt-8">
        <span className="text-green-700">
          For more detailed information on each category, click on the respective image
        </span>
      </div>
    </div>
  );
}
