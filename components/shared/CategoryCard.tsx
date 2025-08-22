"use client";

import Image from "next/image";
import { categoryIcons } from "@/utils/categoryIcons";
import { Package } from "lucide-react"; 
import Link from "next/link";
import { useLocalization } from "@/utils/localiztionUtil";
import { memo } from "react";

// Type definitions for bilingual text
interface BilingualText {
  en: string;
  ar: string;
}

interface Props {
  name: BilingualText | string;
  image: string;
  displayName?: string;
  onClick?: () => void;
}

const CategoryCard = memo(function CategoryCard({ name, image, displayName, onClick }: Props) {
  const { getDisplayName, getEnglishName } = useLocalization();

  // Create a temporary object to use with utility functions
  const categoryObject = { name, displayName };

  const categoryDisplayName = getDisplayName(categoryObject);
  const englishName = getEnglishName(categoryObject);

  return (
    <Link href={`/category/${encodeURIComponent(englishName)}`}>
      <div
        role="button"
        tabIndex={0}
        className="category-card group relative cursor-pointer outline-none focus:ring-2 focus:ring-green-400 rounded-3xl"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick?.();
        }}
      >
        <div className="w-64 h-60 mb-8 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-[var(--color-base-100)] via-yellow-50 to-[var(--color-base-200)] border-2 border-transparent flex flex-col items-center justify-center backdrop-blur-md p-4 relative">
          <div className="relative mb-6">
            <span className="category-icon-wrapper block w-28 h-28 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] p-1 shadow-lg">
              <span className="category-icon-inner w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center border-4 border-[var(--color-base-200)]">
                <Image
                  src={image}
                  alt={`Image of ${categoryDisplayName}`}
                  width={96}
                  height={96}
                  className="object-cover w-24 h-24 rounded-full shadow-md"
                  priority={false}
                  loading="lazy"
                  sizes="96px"
                />
              </span>
            </span>

            <span className="category-badge absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow-md border-2 border-[var(--color-base-200)]">
              {categoryIcons[englishName] ?? (
                <Package className="w-5 h-5 text-gray-400" />
              )}
            </span>
          </div>

          <div className="flex flex-col items-center mb-4">
            <h4 className="category-title font-extrabold text-2xl drop-shadow-lg text-center mb-1 text-[var(--color-primary)]">
              {categoryDisplayName}
            </h4>
            <span className="category-underline block w-12 h-1 rounded-full bg-gradient-to-r from-[var(--color-success-content)] to-[var(--color-accent)] mb-2" />
          </div>
        </div>

        <style jsx>{`
          .category-card {
            transform: translateZ(0);
            will-change: transform;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .category-card:hover {
            transform: translateY(-8px) scale(1.02);
          }

          .category-card:active {
            transform: translateY(-4px) scale(0.99);
          }

          .category-card > div {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .category-card:hover > div {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border-color: var(--color-primary);
            transform: scale(1.03);
          }

          .category-icon-wrapper {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .category-card:hover .category-icon-wrapper {
            transform: scale(1.1);
          }

          .category-icon-inner {
            transition: border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .category-card:hover .category-icon-inner {
            border-color: var(--color-primary);
          }

          .category-badge {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .category-card:hover .category-badge {
            border-color: var(--color-primary);
          }

          .category-title {
            transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .category-card:hover .category-title {
            color: var(--color-accent);
          }

          .category-underline {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .category-card:hover .category-underline {
            background: linear-gradient(to right, var(--color-primary), var(--color-accent));
          }

          @media (prefers-reduced-motion: reduce) {
            .category-card,
            .category-card > div,
            .category-icon-wrapper,
            .category-icon-inner,
            .category-badge,
            .category-title,
            .category-underline {
              transition: none;
            }
          }
        `}</style>
      </div>
    </Link>
  );
});

export default CategoryCard;