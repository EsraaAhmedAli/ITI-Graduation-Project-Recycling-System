"use client";
import { useEffect, useState, useContext } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";
import {
  Clock,
  MapPin,
  User,
  Package,
  Calendar,
  Phone,
  Mail,
  Zap,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { UserAuthContext } from "@/context/AuthFormContext";
import { useMutation } from "@tanstack/react-query";
import ordersApi from "@/lib/api/ordersApi";
import { CancelOrderDialog } from "./CancelOrderDialog";

export default function WaitingApprovalStep({
  orderId,
  onApproved,
}: {
  orderId: string;
  onApproved: () => void;
}) {
  const { t } = useLanguage();
  const { user } = useContext(UserAuthContext) ?? {};
  const [order, setOrder] = useState<any>(null);
  const [timeWaiting, setTimeWaiting] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Auto-approve mutation
  const autoApproveMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.autoApproveOrder(orderId),
    onSuccess: () => {
      toast.success("Order auto-approved successfully!");
      onApproved();
    },
    onError: (error) => {
      console.error("Failed to auto-approve order:", error);
      toast.error("Failed to auto-approve order");
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      ordersApi.cancelOrderWithReason(orderId, reason),
    onSuccess: () => {
      toast.success("Order cancelled successfully!");
      window.location.href = "/profile";
    },
    onError: (error) => {
      console.error("Failed to cancel order:", error);
      toast.error("Failed to cancel order");
    },
  });

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeWaiting((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatWaitingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  // Fetch order details
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${orderId}`);
        const orderData = res.data.data;
        setOrder(orderData);

        if (orderData.status === "assigntocourier") {
          onApproved();
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
        toast.error("Failed to fetch order status");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [orderId, onApproved]);

  const handleCancelOrder = (reason: string) => {
    cancelOrderMutation.mutate({ orderId, reason });
    setShowCancelDialog(false);
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-red-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Main Status Card */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
        <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="text-white text-3xl animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("pickup.messages.waitingForApproval")}
        </h1>
        <p className="text-gray-600 mb-4">
          Order #{order._id?.slice(-8) || orderId}
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-lg font-semibold">
          Pending Review
        </div>
        <div className="mt-6">
          <p className="text-gray-600">
            Time waiting:{" "}
            <span className="font-mono font-semibold text-orange-600">
              {formatWaitingTime(timeWaiting)}
            </span>
          </p>
        </div>
      </div>

      {/* Customer & Order Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Customer Information
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{user?.name || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{user?.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                {user?.phoneNumber || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Pickup Address */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pickup Address
            </h2>
          </div>

          <div className="space-y-2 text-gray-700">
            <p>
              {order.address?.street}, Building {order.address?.building}
            </p>
            <p>
              Floor {order.address?.floor}, Apartment {order.address?.apartment}
            </p>
            <p>
              {order.address?.area}, {order.address?.city}
            </p>
            {order.address?.landmark && (
              <p className="text-sm text-gray-500">
                Landmark: {order.address.landmark}
              </p>
            )}
            {order.address?.notes && (
              <p className="text-sm text-gray-500">
                Notes: {order.address.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Package className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Items</p>
              <p className="font-medium text-gray-900">
                {order.items?.length || 0} items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Order Time</p>
              <p className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Items List */}
        {order.items && order.items.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Items in Order</h3>
            <div className="space-y-2">
              {order.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name || item.itemName}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.name || item.itemName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {item.price * item.quantity} EGP
                    </p>
                    <p className="text-sm text-green-600">
                      {item.points * item.quantity} points
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Update Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <p className="text-blue-800 font-medium">
          We&apos;re reviewing your order and will assign a courier soon. This
          page will automatically update when your order is approved.
        </p>
      </div>

      {/* Demo Auto-Approve Button */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Demo Testing
          </h3>
          <p className="text-yellow-700 text-sm">
            Use this button to simulate order approval for testing purposes
          </p>
        </div>
        <button
          onClick={() => autoApproveMutation.mutate(orderId)}
          disabled={autoApproveMutation.isPending}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Zap className="mr-2" size={16} />
          {autoApproveMutation.isPending
            ? "Starting..."
            : "Demo: Auto-Approve (Test)"}
        </button>
      </div>

      {/* Subtle Cancel Order Link at Bottom */}
      <div className="mt-12 text-center">
        <button
          onClick={() => setShowCancelDialog(true)}
          className="text-gray-500 hover:text-red-600 text-sm underline transition-colors duration-200"
        >
          Cancel this order
        </button>
      </div>

      {/* Cancel Dialog */}
      <CancelOrderDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelOrder}
        isLoading={cancelOrderMutation.isPending}
      />
    </div>
  );
}
