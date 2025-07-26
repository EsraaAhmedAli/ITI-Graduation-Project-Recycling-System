"use client";

import ItemCard from "./ItemCard";

interface Item {
  name: string;
  image: string;
  points: number;
  price: number;
  measurement_unit: 1 | 2;
}

interface SubcategoryListProps {
  items: Item[];
  onAddToCart: (item: Item) => void;
  loading:boolean
}


export default function SubcategoryList({ items, onAddToCart,loading }: SubcategoryListProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <ItemCard key={index} loading={loading} item={item} index={index} onAddToCart={onAddToCart} />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white p-8 rounded-lg shadow-sm max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500">No items available in this category at the moment.</p>
          </div>
        </div>
      )}
    </>
  );
}
