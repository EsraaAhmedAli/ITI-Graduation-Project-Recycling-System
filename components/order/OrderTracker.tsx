"use client";

import { useState } from 'react';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  User, 
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Package
} from 'lucide-react';

interface OrderTrackerProps {
  orderId: string;
  showDetails?: boolean;
  onStatusChange?: (oldStatus: string, newStatus: string) => void;
}

export default function OrderTracker({ 
  orderId, 
  showDetails = true,
  onStatusChange 
}: OrderTrackerProps) {
  const [expanded, setExpanded] = useState(false);
  
  const {
    order,
    loading,
    error,
    lastUpdated,
    refresh,
    getStatusInfo,
    isActive,
    getEstimatedTime
  } = useOrderTracking({
    orderId,
    autoRefresh: true,
    refreshInterval: 15000, // 15 seconds
    onStatusChange
  });

  if (loading && !order) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️ Error loading order</div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          Order not found
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const estimatedTime = getEstimatedTime();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalPoints = () => {
    return order.items?.reduce((total, item) => total + (item.totalPoints || 0), 0) || 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${statusInfo?.bgColor}`}>
              {statusInfo?.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Order #{order._id ? order._id.slice(-8) : 'N/A'}
              </h3>
              <p className="text-sm text-gray-500">
                Created {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusInfo?.color} ${statusInfo?.bgColor}`}>
              {statusInfo?.text}
            </span>
            {isActive && (
              <button
                onClick={refresh}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Refresh status"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Description */}
      <div className="px-6 py-4 bg-gray-50">
        <p className="text-sm text-gray-600">{statusInfo?.description}</p>
        {estimatedTime && (
          <p className="text-sm text-gray-500 mt-1">
            Estimated: {estimatedTime}
          </p>
        )}
        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Order Summary */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Items Summary */}
          <div>
                         <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
               <Package className="w-4 h-4" />
               Items ({order.items?.length || 0})
             </h4>
            <div className="space-y-2">
              {order.items?.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name || 'Unknown Item'}</span>
                  <span className="font-medium">{item.quantity || 0} × {item.price || 0} EGP</span>
                </div>
              ))}
              {order.items && order.items.length > 3 && (
                <div className="text-sm text-gray-500">
                  +{order.items.length - 3} more items
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm font-medium">
                <span>Total Points:</span>
                <span className="text-green-600">{calculateTotalPoints()} pts</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Pickup Address
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{order.address?.street || 'N/A'}</p>
              <p>{order.address?.building || 'N/A'}, {order.address?.floor || 'N/A'}</p>
              <p>{order.address?.area || 'N/A'}, {order.address?.city || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        {order.courier && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Your Driver
            </h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {order.courier.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{order.courier.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="w-3 h-3" />
                      {order.courier.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Details */}
        {showDetails && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {expanded ? 'Hide Details' : 'View Full Details'}
            </button>

            {expanded && (
              <div className="mt-4 space-y-6">
                {/* Status Timeline */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Order Timeline</h4>
                  <div className="space-y-4">
                    {order.statusHistory.map((status, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(status.timestamp)}
                          </p>
                          {status.notes && (
                            <p className="text-xs text-gray-600 mt-1">{status.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cancellation Info */}
                {order.status === 'cancelled' && order.cancellationReason && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Cancellation Details</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">
                        <span className="font-medium">Reason:</span> {order.cancellationReason}
                      </p>
                      {order.cancelledAt && (
                        <p className="text-xs text-red-600 mt-2">
                          Cancelled on {formatDate(order.cancelledAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* All Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">All Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                            <Package className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.quantity} units</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{item.price} EGP</p>
                          <p className="text-sm text-green-600">{item.totalPoints} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 