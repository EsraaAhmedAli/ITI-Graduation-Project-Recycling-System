"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { categoryIcons } from "@/utils/categoryIcons";
import { Package } from "lucide-react"; 
import Link from "next/link";
import { useLocalization } from "@/utils/localiztionUtil";

// Type definitions for bilingual text
interface BilingualText {
  en: string;
  ar: string;
}

interface Props {
  name: BilingualText | string; // Support both bilingual object and string
  image: string;
  displayName?: string; // Optional display name from backend
  onClick?: () => void;
}

export default function CategoryCard({ name, image, displayName, onClick }: Props) {
  const { getDisplayName, getEnglishName } = useLocalization();

  // Create a temporary object to use with utility functions
  const categoryObject = { name, displayName };

  const categoryDisplayName = getDisplayName(categoryObject);
  const englishName = getEnglishName(categoryObject);

  return (
    <Link href={`/category/${encodeURIComponent(englishName)}`}>
      <motion.div
        role="button"
        tabIndex={0}
        className="group relative cursor-pointer outline-none focus:ring-2 focus:ring-green-400 rounded-3xl transition-transform duration-300"
        whileHover={{ y: -8, scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick?.();
        }}
      >
        <div className="w-64 h-60 mb-8 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-[var(--color-base-100)] via-yellow-50 to-[var(--color-base-200)] border-2 border-transparent group-hover:border-[var(--color-primary)] group-hover:scale-105 flex flex-col items-center justify-center backdrop-blur-md p-4 relative">
          <div className="relative mb-6">
            <span className="block w-28 h-28 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] p-1 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <span className=" w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center border-4 border-[var(--color-base-200)] group-hover:border-[var(--color-primary)] transition-all duration-300">
                <Image
                  src={image}
                  alt={`Image of ${categoryDisplayName}`}
                  width={100}
                  height={100}
                  className="object-cover w-24 h-24 rounded-full shadow-md"
                  priority
                />
              </span>
            </span>

            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow-md border-2 border-[var(--color-base-200)] group-hover:border-[var(--color-primary)] transition-all duration-300">
              {categoryIcons[englishName] ?? (
                <Package className="w-5 h-5 text-gray-400" />
              )}
            </span>
          </div>

          <div className="flex flex-col items-center mb-4">
            <h4 className="font-extrabold text-2xl drop-shadow-lg text-center mb-1 text-[var(--color-primary)] group-hover:text-[var(--color-accent)] transition-colors duration-300">
              {categoryDisplayName}
            </h4>
            <span className="block w-12 h-1 rounded-full bg-gradient-to-r from-[var(--color-success-content)] to-[var(--color-accent)] mb-2 group-hover:from-[var(--color-primary)] group-hover:to-[var(--color-accent)] transition-all duration-300" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}