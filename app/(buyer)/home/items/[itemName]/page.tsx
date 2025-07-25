"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CartItem, useCart } from "@/context/CartContext";
import { Recycle, Leaf, Package, Minus, Plus } from "lucide-react";
import { useGetItems } from "@/hooks/useGetItems";

// interface Item {
//   _id: string;
//   name: string;
//   points: number;
//   price: number;
//   measurement_unit: string;
//   image: string;
//   quantity: number;
//   categoryName: string;
//   categoryId: string;
//   description?: string;
// }

export default function ItemDetailsPage() {
const { itemName } = useParams();
const decodedName = typeof itemName === "string" ? decodeURIComponent(itemName) : "";
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { addToCart } = useCart();




  const{data:items}=useGetItems()
const item = items?.find(
  (i) => i.name.toLowerCase() === decodedName.toLowerCase()
) ?? null;


  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
      </div>
    );
  }
function convertToCartItem(item: any, quantity: number): CartItem {
  return {
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    itemName: item.name,
    image: item.image,
    points: item.points,
    price: item.price,
    measurement_unit: item.measurement_unit,
    quantity,
  };
}

  const remainingQuantity = item?.quantity - selectedQuantity;
  const isLowStock = item?.quantity <= 5;
  const isOutOfStock = item?.quantity <= 0;
  const stockPercentage = Math.min(100, (remainingQuantity / item?.quantity) * 100);

  const handleAddToCart = () => {
    if (!isOutOfStock && remainingQuantity >= 0) {
      console.log("Item being added to cart:", item);

addToCart(convertToCartItem(item, selectedQuantity));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-xl bg-gray-50 overflow-hidden shadow-sm">
              <Image
                src={item?.image}
                alt={item?.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category and Title */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-3">
                {item?.categoryName}
              </span>
              <h1 className="text-3xl font-bold text-gray-900">{item?.name}</h1>
              {item?.description && (
                <p className="text-gray-600 mt-2">{item?.description}</p>
              )}
            </div>

            {/* Price and Points */}
            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-gray-900">${(item?.price * selectedQuantity).toFixed(2)}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Recycle className="w-4 h-4 mr-1" />
                {item.points * selectedQuantity} points
              </span>
            </div>

            {/* Stock Status */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Available Stock</span>
                <span className={`text-sm font-medium ${
                  isOutOfStock ? 'text-red-600' : 
                  isLowStock ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {isOutOfStock ? 'Out of Stock' : `${item?.quantity} ${item.measurement_unit}`}
                </span>
              </div>
              
              {/* Dynamic Stock Indicator */}
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      stockPercentage < 20 ? 'bg-red-500' : 
                      stockPercentage < 50 ? 'bg-amber-400' : 'bg-green-500'
                    }`}
                    style={{ width: `${stockPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>After purchase: {Math.max(0, remainingQuantity)}</span>
                  <span>{stockPercentage.toFixed(0)}% remaining</span>
                </div>
              </div>

              {isLowStock && !isOutOfStock && (
                <p className="text-xs text-amber-600 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Low stock - only {item.quantity} left!
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                  disabled={selectedQuantity <= 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium">{selectedQuantity}</span>
                <button
                  onClick={() => setSelectedQuantity(prev => prev + 1)}
                  disabled={selectedQuantity >= item.quantity}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">{item.measurement_unit}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                isOutOfStock 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>{isOutOfStock ? 'Out of Stock' : 'Add to Recycling Cart'}</span>
            </button>

            {/* Environmental Benefits */}
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Leaf className="w-5 h-5 mr-2 text-green-600" />
                Environmental Benefits
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Reduces {(selectedQuantity * 2.5).toFixed(1)}kg of CO₂ emissions
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Saves {selectedQuantity * 15} liters of water
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Conserves natural resources by recycling materials
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Product Info */}
        <div className="mt-16 space-y-8">
          {/* Recycling Process */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Recycling Process</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Package className="w-6 h-6 text-green-600" />,
                  title: "Collection",
                  description: "We pick up your items at your convenience."
                },
                {
                  icon: <Recycle className="w-6 h-6 text-green-600" />,
                  title: "Processing",
                  description: "Items are safely broken down into raw materials."
                },
                {
                  icon: <Leaf className="w-6 h-6 text-green-600" />,
                  title: "New Life",
                  description: "Materials are reused in new products."
                }
              ].map((step, index) => (
                <div key={index} className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}