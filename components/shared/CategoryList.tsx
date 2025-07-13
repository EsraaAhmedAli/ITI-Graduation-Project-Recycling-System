"use client";

import { Card } from "flowbite-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Image from "next/image";

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

export default function CategoryList({ basePath }: { basePath: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const visibleCards = 4;

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const processedData = data.map((category: Category) => ({
          ...category,
          image: category.image || '/default-category-image.jpg',
          subcategories: Array.isArray(category.subcategories) 
            ? category.subcategories.map(sub => ({
                ...sub,
                image: sub.image || '/default-subcategory-image.jpg'
              }))
            : []
        }));
        setCategories(processedData);
      });
  }, []);

  const toggleCategory = (category: Category) => {
    setActiveCategory(activeCategory?._id === category._id ? null : category);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev >= categories.length - visibleCards ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? categories.length - visibleCards : prev - 1
    );
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden bg-white" dir="rtl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        اختر نوع المخلفات
      </h1>

      
      <div className="flex flex-col items-center">
       
        <div className="relative w-full max-w-6xl mb-12">
       
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all"
          >
            <FaChevronLeft className="text-gray-600 text-xl" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all"
          >
            <FaChevronRight className="text-gray-600 text-xl" />
          </button>

          
          <div className="overflow-hidden px-12">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * (100 / visibleCards)}%)`
              }}
            >
              {categories.map((category) => (
                <div 
                  key={category._id} 
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / visibleCards}%` }}
                >
                  <div
                    className={`transition-all duration-300 ${
                      activeCategory?._id === category._id 
                        ? 'ring-4 ring-primary scale-105' 
                        : 'hover:scale-105'
                    }`}
                    onClick={() => toggleCategory(category)}
                  >
                    <Card className="h-32 flex items-center justify-center text-center font-bold overflow-hidden border-0 shadow-lg bg-gray-100 transition-transform duration-300 relative">
                      <div className="absolute inset-0">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover opacity-70 hover:opacity-100 transition-opacity duration-300"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/20" />
                      <h5 className="relative z-10 text-xl text-white font-medium">{category.name}</h5>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

       
        {activeCategory && (
          <div className="w-full max-w-6xl mx-auto animate-fadeIn">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
              {activeCategory.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
              {activeCategory.subcategories.map((sub, index) => (
                <Link
                  key={index}
                  href={`/${basePath}/category/${encodeURIComponent(activeCategory.name)}/${encodeURIComponent(sub.name)}`}
                  className="group"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200 overflow-hidden">
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={sub.image}
                        alt={sub.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">{sub.name}</span>
                        <span className="text-sm bg-primary text-white px-3 py-1 rounded-full whitespace-nowrap">
                          {sub.points} نقطة / {sub.unit}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}