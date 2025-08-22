"use client";

import { FaCoins, FaShoppingCart } from "react-icons/fa";
import Image from "next/image";
import { memo } from "react";
import Button from "../common/Button";

interface Item {
  _id: string;
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
  loading: boolean;
}

const getUnitText = (unit: 1 | 2): string => {
  return unit === 1 ? "KG" : "Pieces";
};

const ItemCard = memo(function ItemCard({ item, onAddToCart, loading }: ItemCardProps) {
  const isLoading = loading === item._id;
  const unitText = getUnitText(item.measurement_unit);

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={item.image}
          alt={item.name || "Product image"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain"
          priority={false}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {item.name}
        </h3>

        <div className="flex items-center gap-2 mb-4">
          <FaCoins className="text-yellow-500 flex-shrink-0" />
          <span className="text-gray-700 text-sm">
            {item.points} points per {unitText}
          </span>
        </div>

        <Button
          disabled={isLoading}
          onClick={() => onAddToCart(item)}
          className="mt-auto w-full py-2 flex items-center justify-center gap-2"
        >
          <FaShoppingCart />
          Add to Cart
        </Button>
      </div>
    </div>
  );
});

export default ItemCard;