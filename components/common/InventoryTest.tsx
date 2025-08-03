"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ICartItem } from '@/models/cart';

// Mock item for testing
const mockItem: ICartItem = {
  _id: "test-item-1",
  originalCategoryId: "cat-1",
  categoryId: "cat-1",
  categoryName: "Test Category",
  itemName: "Test Item",
  image: "/test-image.jpg",
  points: 10,
  price: 25.50,
  measurement_unit: 1, // KG
  quantity: 2,
  availableQty: 5
};

export const InventoryTest: React.FC = () => {
  const { addToCart, checkInventory, loadingItemId } = useCart();
  const [testQuantity, setTestQuantity] = useState(1);
  const [inventoryResult, setInventoryResult] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckInventory = async () => {
    setIsChecking(true);
    try {
      const result = await checkInventory(mockItem._id, testQuantity);
      setInventoryResult(result);
    } catch (error) {
      console.error('Inventory check failed:', error);
      setInventoryResult(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleAddToCart = () => {
    const testItem = { ...mockItem, quantity: testQuantity };
    addToCart(testItem);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">اختبار فحص المخزون</h2>
      
      <div className="space-y-4">
        {/* Item Info */}
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-semibold mb-2">معلومات المنتج:</h3>
          <p><strong>الاسم:</strong> {mockItem.itemName}</p>
          <p><strong>السعر:</strong> {mockItem.price} جنيه</p>
          <p><strong>الوحدة:</strong> {mockItem.measurement_unit === 1 ? 'كجم' : 'قطعة'}</p>
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium mb-2">الكمية المطلوبة:</label>
          <input
            type="number"
            min="0.25"
            step="0.25"
            value={testQuantity}
            onChange={(e) => setTestQuantity(parseFloat(e.target.value) || 0)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Check Inventory Button */}
        <button
          onClick={handleCheckInventory}
          disabled={isChecking}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isChecking ? 'جاري الفحص...' : 'فحص المخزون'}
        </button>

        {/* Inventory Result */}
        {inventoryResult !== null && (
          <div className={`p-3 rounded ${
            inventoryResult ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <p className="font-medium">
              {inventoryResult ? '✅ المخزون متوفر' : '❌ المخزون غير متوفر'}
            </p>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={loadingItemId === mockItem._id || inventoryResult === false}
          className={`w-full py-2 px-4 rounded font-medium ${
            loadingItemId === mockItem._id || inventoryResult === false
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loadingItemId === mockItem._id ? 'جاري الإضافة...' : 'إضافة إلى السلة'}
        </button>

        {/* Status Messages */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>• ✅ المخزون موجود → إضافة بنجاح</p>
          <p>• ❌ المخزون غير موجود → لا إضافة + toast خطأ + زر معطل</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryTest; 