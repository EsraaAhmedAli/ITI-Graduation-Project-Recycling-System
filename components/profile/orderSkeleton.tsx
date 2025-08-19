import React, { memo } from "react";

const OrderCardSkeleton = memo(() => (
  <div className="rounded-xl p-5 bg-gray-50 shadow-sm animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-16 bg-gray-200 rounded mb-4"></div>
    <div className="h-8 bg-gray-200 rounded"></div>
  </div>
));

export default OrderCardSkeleton;