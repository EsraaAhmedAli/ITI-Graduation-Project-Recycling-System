"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaCoins, FaShoppingCart } from "react-icons/fa";
import { categoryColors } from "@/utils/categoryColors";

interface Props {
  name: string;
  image: string;
  points: number;
  unit: string;
  categoryName: string;
  onAddToCart: () => void;
}

export default function SubcategoryCard({ name, image, points, unit, categoryName, onAddToCart }: Props) {
  return (
    <motion.div
      className="group relative"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="h-full rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 flex flex-col">
        <div className="relative h-40 w-full overflow-hidden">
          <Image src={image} alt={name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-md font-semibold px-2 py-1 rounded-full ${categoryColors[categoryName]}`}>
              {name}
            </span>
            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
              <FaCoins className="text-amber-500" />
              <span className="font-bold">{points} point / {unit}</span>
            </div>
          </div>
          <div className="mt-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddToCart}
              className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-md"
            >
              <FaShoppingCart />
              Add to Cart
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
