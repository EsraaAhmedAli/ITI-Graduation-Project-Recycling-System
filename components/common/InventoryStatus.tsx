"use client";

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ICartItem } from '@/models/cart';

interface InventoryStatusProps {
  item: ICartItem;
  requestedQuantity?: number;
  showButton?: boolean;
  onAddToCart?: () => void;
  children?: React.ReactNode;
}

export const InventoryStatus: React.FC<InventoryStatusProps> = ({
  item,
  requestedQuantity = 1,
  showButton = false,
  onAddToCart,
  children
}) => {
  const { checkInventory, loadingItemId } = useCart();
  const [isInStock, setIsInStock] = React.useState<boolean | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);

  const checkItemStock = async () => {
    setIsChecking(true);
    try {
      const available = await checkInventory(item._id, requestedQuantity);
      setIsInStock(available);
    } catch (error) {
      console.error('Failed to check inventory:', error);
      setIsInStock(false);
    } finally {
      setIsChecking(false);
    }
  };

  React.useEffect(() => {
    checkItemStock();
  }, [item._id, requestedQuantity]);

  const getMeasurementText = (unit: number): string => {
    return unit === 1 ? " كجم" : " قطعة";
  };

  const getStatusColor = () => {
    if (isInStock === null) return 'text-gray-500';
    return isInStock ? 'text-green-600' : 'text-red-600';
  };

  const getStatusText = () => {
    if (isChecking) return 'جاري التحقق من المخزون...';
    if (isInStock === null) return 'غير متوفر';
    return isInStock ? 'متوفر في المخزون' : 'غير متوفر في المخزون';
  };

  const isButtonDisabled = isChecking || isInStock === false || loadingItemId === item._id;

  return (
    <div className="space-y-2">
      {/* Inventory Status Display */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          حالة المخزون:
        </span>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Stock Indicator */}
      {isInStock !== null && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isInStock ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: isInStock ? '100%' : '0%' }}
          ></div>
        </div>
      )}

      {/* Custom Button or Children */}
      {showButton && onAddToCart ? (
        <button
          onClick={onAddToCart}
          disabled={isButtonDisabled}
          className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
            isButtonDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
          }`}
        >
          {loadingItemId === item._id ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          )}
          <span>
            {isButtonDisabled
              ? (isInStock === false ? "غير متوفر" : "جاري الإضافة...")
              : "إضافة إلى السلة"}
          </span>
        </button>
      ) : (
        children
      )}

      {/* Stock Warning */}
      {isInStock === false && (
        <p className="text-xs text-red-600 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          عذراً، الكمية المطلوبة غير متوفرة في المخزون
        </p>
      )}
    </div>
  );
};

export default InventoryStatus; 