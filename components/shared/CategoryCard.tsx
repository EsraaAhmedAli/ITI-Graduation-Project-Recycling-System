"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { categoryIcons } from "@/utils/categoryIcons";

interface Props {
  name: string;
  image: string;
  onClick: () => void;
}

export default function CategoryCard({ name, image, onClick }: Props) {
  return (
    <motion.div
      className="group relative cursor-pointer"
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="h-full rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 border border-[var(--color-base-300)] flex flex-col items-center justify-center backdrop-blur-md p-8">
        <div className="relative mb-6">
          <span className="block w-28 h-28 rounded-full bg-gradient-to-tr from-[var(--color-base-200)] to-[var(--color-success-content)] p-1 shadow-lg transition-transform duration-300">
            <span className="block w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
              <Image src={image} alt={name} width={100} height={100} className="object-cover w-24 h-24 rounded-full shadow-md" />
            </span>
          </span>
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow-md border border-[var(--color-base-200)]">
            {categoryIcons[name]}
          </span>
        </div>
        <div className="flex flex-col items-center mb-4">
          <h4 className="font-extrabold text-2xl drop-shadow-lg text-center mb-1">{name}</h4>
          <span className="block w-10 h-1 rounded-full bg-gradient-to-r from-[var(--color-success-content)] to-[var(--color-base-200)] mb-2" />
        </div>
      </div>
    </motion.div>
  );
}
