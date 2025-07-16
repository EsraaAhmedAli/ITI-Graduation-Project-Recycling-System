"use client";

import { motion } from "framer-motion";
import { FaCoins, FaShoppingCart } from "react-icons/fa";
import Image from "next/image";

interface Item {
  name: string;
  image: string;
  points: number;
  price: number;
  measurement_unit: 1 | 2;
}

interface ItemCardProps {
  item: Item;
  index: number;
  onAddToCart: (item: Item) => void;
}

const getUnitText = (unit: 1 | 2): string => {
  return unit === 1 ? "KG" : "Pieces";
};

export default function ItemCard({ item, index, onAddToCart }: ItemCardProps) {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={item.image}
            alt={item.name || "image name"}
            fill
            className="object-contain group-hover:scale-100 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>

          <div className="flex items-center gap-2 mb-4">
            <FaCoins className="text-yellow-500" />
            <span className="text-gray-700">
              {item.points} points per {getUnitText(item.measurement_unit)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(item)}
            className="mt-auto w-full py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <FaShoppingCart />
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}
