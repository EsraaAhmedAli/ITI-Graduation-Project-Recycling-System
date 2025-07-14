"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";



import { categoryIcons } from "@/utils/categoryIcons";
import CategoryCard from "./CategoryCard";
import SubcategoryCard from "./SubcategoryCard";

interface Subcategory {
  name: string;
  image: string;
  points: number;
  unit: string;
}

interface Category {
  _id: string;
  name: string;
  image: string;
  subcategories: Subcategory[];
}

export default function CategoryList({ basePath, maxToShow }: { basePath: string, maxToShow?: number }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const router = useRouter();
  const { cart, addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories");
        const data = await response.json();
        const processedData = data.map((category: Category) => ({
          ...category,
          subcategories: Array.isArray(category.subcategories)
            ? category.subcategories.map(sub => ({ ...sub }))
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

  const toggleCategory = (category: Category) => {
    setActiveCategory(activeCategory?._id === category._id ? null : category);
  };

  const handleAddToCart = (subcategory: Subcategory, categoryId: string) => {
    addToCart({
      categoryId,
      subcategoryName: subcategory.name,
      points: subcategory.points,
      unit: subcategory.unit,
      quantity: 1,
    });
  };

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

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[var(--color-base-100)] to-[var(--color-base-100)]">
      {!isLoading && (
        <>
          {!activeCategory && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-16"
            >
              <h1 className="text-2xl md:text-3xl font-extrabold text-center text-green-500 mb-10 mt-7">
                Recycle Smart, <span className="text-green-500">Earn Rewards</span>
              </h1>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
              >
                {(showAll ? categories : (maxToShow ? categories.slice(0, maxToShow) : categories)).map((category: Category) => (
                  <motion.div key={category._id} variants={itemVariants}>
                    <CategoryCard
                      name={category.name}
                      image={category.image}
                      onClick={() => toggleCategory(category)}
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
          )}

          {activeCategory && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-16 p-8"
            >
              <button
                onClick={() => setActiveCategory(null)}
                className="mb-6 flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-success)] text-md transition-colors"
              >
                <FaArrowLeft />
                Back to Categories
              </button>

              <h2 className="text-3xl font-bold mb-8 text-[var(--color-primary)] flex items-center gap-2">
                {categoryIcons[activeCategory.name]}
                {activeCategory.name}
              </h2>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
              >
                {activeCategory.subcategories.map((sub, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <SubcategoryCard
                      name={sub.name}
                      image={sub.image}
                      points={sub.points}
                      unit={sub.unit}
                      categoryName={activeCategory.name}
                      onAddToCart={() => handleAddToCart(sub, activeCategory._id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}
        </>
      )}
    </div>
  );
}
