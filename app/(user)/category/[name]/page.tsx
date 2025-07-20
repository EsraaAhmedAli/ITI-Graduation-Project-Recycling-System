"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import SubcategoryList from "@/components/shared/SubcategoryList";
import Loader from "@/components/common/loader";


interface Item {
  _id:string,
  name: string;
  image: string;
  points: number;
  price: number;
  measurement_unit: 1 | 2;
}

export default function UserCategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart ,loadingItemId} = useCart();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/categories/get-items/${categoryName}`);
        const data = await response.json();
        setItems(data);
        console.log(data);
        
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [categoryName]);

  const handleAddToCart = (item: Item) => {
    addToCart({
      categoryId: item._id,
      itemName: item.name,
      image: item.image,
      points: item.points,
      price: item.price,
      measurement_unit: item.measurement_unit,
      quantity: 1,
    });
  };

  if (isLoading) {
    return (
  <Loader title={'your items'}/>
    );
  }

  return (
    <div className="min-h-screen bg-white-300 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-accent-content mb-2 mt-6">{categoryName} Items</h1>
            <p className="text-green-700 mb-4">Explore recyclable items in {categoryName} category</p>
          </div>
        </div>

    
        <SubcategoryList items={items} loading={loadingItemId} onAddToCart={handleAddToCart} />
      </div>
    </div>
  );
}
