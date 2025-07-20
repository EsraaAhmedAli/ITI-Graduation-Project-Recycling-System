"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { categoryIcons } from "@/utils/categoryIcons";
import CategoryCard from "./CategoryCard";
import Loader from "../common/loader";

interface Item {
  name: string;
  image: string;
  points: number;
  price: number;
  measurement_unit: 1 | 2;
}

interface Category {
  _id: string;
  name: string;
  image: string;
  description?: string; 
  items: Item[];
}

export default function CategoryList({ basePath, maxToShow }: { basePath: string, maxToShow?: number }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories");
        const data = await response.json();
        const processedData = data.map((category: Category) => ({
          ...category,
          items: Array.isArray(category.items)
            ? category.items.map(item => ({ ...item }))
            : [],
        }));
        setCategories(processedData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] }
    },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  };
//className="m-12 px-2 sm:px-4 bg-white/100"
  return (
    <div>
      {!isLoading ?(
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
            <span className="text-green-700">Explore various recycling categories to learn more about what you can recycle and how</span>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-start items-start gap-6 pl-18"
          >
            {(showAll ? categories : (maxToShow ? categories.slice(0, maxToShow) : categories)).map((category: Category) => (
              <motion.div key={category._id} variants={itemVariants}>
                <CategoryCard
                  name={category.name}
                  image={category.image}
                />
              </motion.div>
            ))}
          </motion.div>

          {!showAll && maxToShow && categories.length > maxToShow && (
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
      ) : <Loader title="categories"/>} 
      <div className="text-center mt-8">
        <span className="text-green-700">For more detailed information on each category , Click on the respective image</span>
      </div>
    </div>
  );
}