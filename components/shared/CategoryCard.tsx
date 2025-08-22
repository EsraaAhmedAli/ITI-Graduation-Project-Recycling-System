"use client";

import Image from "next/image";
import { categoryIcons } from "@/utils/categoryIcons";
import { Package } from "lucide-react"; 
import Link from "next/link";
import { useLocalization } from "@/utils/localiztionUtil";
import { memo, useMemo } from "react";

interface Props {
  name: BilingualText | string;
  image: string;
  displayName?: string;
  onClick?: () => void;
}

const CategoryCard = memo(function CategoryCard({ name, image, displayName, onClick }: Props) {
  const { getDisplayName, getEnglishName } = useLocalization();
  
  // Memoize computed values
  const { categoryDisplayName, englishName, href, icon } = useMemo(() => {
    const categoryObject = { name, displayName };
    const displayName_ = getDisplayName(categoryObject);
    const englishName_ = getEnglishName(categoryObject);
    
    return {
      categoryDisplayName: displayName_,
      englishName: englishName_,
      href: `/category/${encodeURIComponent(englishName_)}`,
      icon: categoryIcons[englishName_] ?? <Package className="w-5 h-5 text-gray-400" />
    };
  }, [name, displayName, getDisplayName, getEnglishName]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <Link 
      href={href}
      className="block outline-none"
      prefetch={false}
    >
      <article
        role="button"
        tabIndex={0}
        className="category-card group relative cursor-pointer outline-none focus:ring-2 focus:ring-green-400 rounded-3xl transition-transform duration-300 ease-in-out hover:-translate-y-2 active:translate-y-0"
        onKeyDown={handleKeyDown}
        aria-label={`View ${categoryDisplayName} category`}
      >
        <div className="w-64 h-60 mb-8 rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br from-[var(--color-base-100)] via-yellow-50 to-[var(--color-base-200)] flex flex-col items-center justify-center p-4 relative transition-all duration-300 group-hover:shadow-xl group-hover:shadow-green-300/30">
          
          {/* Image container with optimizations */}
          <div className="relative mb-6">
            <span className="block w-28 h-28 rounded-full bg-gradient-to-tr from-green-400 to-green-600 p-1 shadow-md transition-transform duration-300 group-hover:scale-105">
              <span className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center border-4 border-white">
                <Image
                  src={image}
                  alt={`${categoryDisplayName} category`}
                  width={96}
                  height={96}
                  className="object-cover w-24 h-24 rounded-full"
                  loading="lazy"
                  sizes="96px"
                  quality={75}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyKKhX2XzRw=="
                />
              </span>
            </span>

            {/* Icon overlay */}
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow-sm border-2 border-gray-100 transition-colors duration-300 group-hover:border-green-300">
              {icon}
            </span>
          </div>

          {/* Title section */}
          <div className="flex flex-col items-center mb-4">
            <h4 className="font-bold text-xl text-center mb-1 text-green-700 transition-colors duration-300 group-hover:text-green-600 line-clamp-2">
              {categoryDisplayName}
            </h4>
            <span className="block w-12 h-1 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-16" />
          </div>
        </div>
      </article>
    </Link>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;