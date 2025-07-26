"use client";

import { useState, useEffect, useContext } from "react";
import { UserAuthContext } from "@/context/AuthFormContext";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import Loader from "@/components/common/loader";
import Link from "next/link";
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  User, 
  Calendar,
  RefreshCw,
  AlertCircle,
  XCircle
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  totalPoints: number;
  image: string;
  points: number;
  measurement_unit: number;
  itemName: string;
}

interface Order {
  _id: string;
  userId: string;
  user: {
    userId: string;
    userName: string;
    phoneNumber: string;
    email: string;
    imageUrl: string;
  };
  items: OrderItem[];
  address: {
    city: string;
    area: string;
    street: string;
    building: string;
    floor: string;
  };
  status: 'pending' | 'confirmed' | 'assigntocourier' | 'completed' | 'cancelled';
  courier: {
    _id: string;
    name: string;
    email: string;
  } | null;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    notes: string;
  }>;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  safetyReports?: any[];
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { user } = useContext(UserAuthContext) ?? {};

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'assigntocourier':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigntocourier':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'confirmed':
        return 'Confirmed';
      case 'assigntocourier':
        return 'Driver Assigned';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalPoints = (items: OrderItem[]) => {
    return items?.reduce((total, item) => total + (item.totalPoints || 0), 0) || 0;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your orders</p>
          <Link
            href="/auth"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader title="Loading your orders" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Track your recycling pickup orders</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchOrders}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <Link
                href="/pickup"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                <MapPin className="w-4 h-4" />
                New Order
              </Link>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">Start your recycling journey by creating your first pickup order</p>
            <Link
              href="/pickup"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Create First Order
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order._id ? order._id.slice(-8) : 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Created on {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {selectedOrder?._id === order._id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Items */}
                    <div>
                                             <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                         <Truck className="w-4 h-4" />
                         Items ({order.items?.length || 0})
                       </h4>
                      <div className="space-y-2">
                        {order.items?.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name || 'Unknown Item'}</span>
                            <span className="font-medium">{item.quantity || 0} × {item.price || 0} EGP</span>
                          </div>
                        ))}
                        {order.items && order.items.length > 2 && (
                          <div className="text-sm text-gray-500">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Total Points:</span>
                          <span className="text-green-600">{calculateTotalPoints(order.items)} pts</span>
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

                    {/* Driver Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Driver
                      </h4>
                      {order.courier ? (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium">{order.courier.name}</p>
                          <p>{order.courier.email}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Not assigned yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Details (Expandable) */}
                {selectedOrder?._id === order._id && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Status Timeline */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Order Timeline</h4>
                        <div className="space-y-4">
                          {order.statusHistory && order.statusHistory.length > 0 ? (
                            order.statusHistory.map((status, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {getStatusText(status.status)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(status.timestamp)}
                                  </p>
                                  {status.notes && (
                                    <p className="text-xs text-gray-600 mt-1">{status.notes}</p>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              No status history available
                            </div>
                          )}
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
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 