"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ICartItem } from "@/models/cart";

export default function InventoryDebugger() {
  const { checkInventory, checkInventoryEnhanced, addToCart, loadingItemId } = useCart();
  const [testItemId, setTestItemId] = useState("");
  const [testQuantity, setTestQuantity] = useState(1);
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestInventory = async () => {
    if (!testItemId.trim()) {
      alert("Please enter an item ID");
      return;
    }

    setIsLoading(true);
    try {
      const mockItem: ICartItem = {
        _id: testItemId,
        originalCategoryId: testItemId,
        categoryId: testItemId,
        categoryName: "Test Category",
        itemName: "Test Item",
        points: 10,
        price: 100,
        measurement_unit: 1,
        quantity: testQuantity,
      };

      const result = await checkInventoryEnhanced(mockItem, testQuantity);
      setDebugResult({
        itemId: testItemId,
        requestedQuantity: testQuantity,
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setDebugResult({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAddToCart = async () => {
    if (!testItemId.trim()) {
      alert("Please enter an item ID");
      return;
    }

    const mockItem: ICartItem = {
      _id: testItemId,
      originalCategoryId: testItemId,
      categoryId: testItemId,
      categoryName: "Test Category",
      itemName: "Test Item",
      points: 10,
      price: 100,
      measurement_unit: 1,
      quantity: testQuantity,
    };

    try {
      await addToCart(mockItem);
    } catch (error) {
      console.error("Add to cart test failed:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">🔍 Inventory Debugger</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Item ID:</label>
          <input
            type="text"
            value={testItemId}
            onChange={(e) => setTestItemId(e.target.value)}
            placeholder="Enter item ID to test"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quantity:</label>
          <input
            type="number"
            value={testQuantity}
            onChange={(e) => setTestQuantity(Number(e.target.value))}
            min="0.25"
            step="0.25"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleTestInventory}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Test Inventory Check"}
          </button>

          <button
            onClick={handleTestAddToCart}
            disabled={loadingItemId === testItemId}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loadingItemId === testItemId ? "Adding..." : "Test Add to Cart"}
          </button>
        </div>

        {debugResult && (
          <div className="mt-4 p-4 bg-white rounded border">
            <h4 className="font-medium mb-2">Debug Result:</h4>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(debugResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-4 p-4 bg-yellow-50 rounded border">
          <h4 className="font-medium mb-2">Instructions:</h4>
          <ul className="text-sm space-y-1">
            <li>• Enter an item ID from your system</li>
            <li>• Set the quantity you want to test</li>
            <li>• Click "Test Inventory Check" to see detailed logs</li>
            <li>• Check the browser console for detailed API response</li>
            <li>• The debug result will show if the check passed or failed</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 