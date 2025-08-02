"use client";

import InventoryDebugger from "@/components/common/InventoryDebugger";

export default function DebugInventoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Inventory Debug Tool
          </h1>
          <p className="text-gray-600">
            Use this tool to debug inventory checking issues. Check the browser console for detailed logs.
          </p>
        </div>

        <InventoryDebugger />

        <div className="mt-8 p-6 bg-white rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">🔧 How to Debug</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">1. Open Browser Console</h3>
              <p className="text-sm text-gray-600">
                Press F12 or right-click → Inspect → Console tab
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">2. Test with an Item ID</h3>
              <p className="text-sm text-gray-600">
                Get an item ID from your system (check the URL when viewing an item)
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">3. Check the Logs</h3>
              <p className="text-sm text-gray-600">
                Look for logs starting with 🔍, ✅, ❌, or 📦 to understand what's happening
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">4. Common Issues</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Item ID mismatch between cart and API</li>
                <li>• Different field names for quantity (quantity vs availableQty)</li>
                <li>• API response structure differences</li>
                <li>• Network or authentication issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 