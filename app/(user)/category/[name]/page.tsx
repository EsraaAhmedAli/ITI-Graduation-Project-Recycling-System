"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import SubcategoryList from "@/components/shared/SubcategoryList";
import Loader from "@/components/common/loader";
import { Recycle, Leaf, Award, Info } from "lucide-react";

interface Item {
  _id: string;
  name: string;
  image: string;
  points: number;
  price: number;
  measurement_unit: 1 | 2;
}

interface CategoryStats {
  totalItems: number;
  estimatedImpact: string;
  pointsRange: string;
}

export default function UserCategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(null);
  const { addToCart, loadingItemId } = useCart();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/categories/get-items/${categoryName}`);
        const data = await response.json();
        setItems(data);
        
        // Calculate category statistics
        if (data.length > 0) {
          const pointsArray = data.map((item: Item) => item.points);
          const minPoints = Math.min(...pointsArray);
          const maxPoints = Math.max(...pointsArray);
          
          setCategoryStats({
            totalItems: data.length,
            estimatedImpact: getEnvironmentalImpact(categoryName),
            pointsRange: minPoints === maxPoints ? `${minPoints} points` : `${minPoints}-${maxPoints} points`
          });
        }
        
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [categoryName]);

  const getEnvironmentalImpact = (category: string): string => {
    const impacts: { [key: string]: string } = {
      'plastic': 'Reduces ocean pollution and saves marine life',
      'paper': 'Saves trees and reduces deforestation',
      'metal': 'Conserves natural resources and reduces mining',
      'glass': 'Infinitely recyclable with 100% material recovery',
      'electronics': 'Prevents toxic waste and recovers precious metals',
      'organic': 'Creates compost and reduces methane emissions'
    };
    
    return impacts[category.toLowerCase()] || 'Contributes to a cleaner environment';
  };

const handleAddToCollection = (item: Item) => {
  addToCart({
    categoryId: item._id,
    categoryName, // 👈 أضفنا اسم الفئة هنا
    itemName: item.name,
    image: item.image,
    points: item.points,
    price: item.price,
    measurement_unit: item.measurement_unit,
    quantity: 1,
  });
};


  const getMeasurementText = (unit: 1 | 2): string => {
    return unit === 1 ? "per kg" : "per item";
  };

  if (isLoading) {
    return <Loader title={'recyclable items'} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How Recycling Works</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                Select the items you want to recycle, add them to your collection, and schedule a pickup or drop-off. 
                You'll earn points based on the type and quantity of materials, which can be redeemed for rewards or donated to environmental causes.
              </p>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Recycle className="w-5 h-5 text-green-600" />
            Recyclable {categoryName} Items
          </h2>
          <p className="text-gray-600 mb-6">
            Browse through recyclable {categoryName.toLowerCase()} items. Points are awarded based on material value and environmental benefit.
          </p>
        </div>

        {/* Custom Items Display for Recycling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                  +{item.points} pts
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{item.name.toUpperCase()}</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    {getMeasurementText(item.measurement_unit)}
                  </span>
                  <span className="text-green-600 font-semibold">
                    {item.price} EGP
                  </span>
                </div>
                
                <button
                  onClick={() => handleAddToCollection(item)}
                  disabled={loadingItemId === item._id}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingItemId === item._id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Recycle className="w-4 h-4" />
                      Add to Collection
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <Recycle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No items available</h3>
            <p className="text-gray-400">Check back later for more recyclable {categoryName.toLowerCase()} items.</p>
          </div>
        )}
      </div>
    </div>
  );
}