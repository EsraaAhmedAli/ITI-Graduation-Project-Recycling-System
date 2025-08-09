"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import ordersApi from "@/lib/api/ordersApi";
import { CheckCircle, Truck, MapPin, Clock, Zap, Phone, User, X, Shield } from "lucide-react";
import { OrderWithDetails } from "@/components/Types/orders.type";
import { CancelOrderDialog } from "./CancelOrderDialog";
import { SafetyDialog, SafetyReportData } from "./SafetyDialog";

const trackingSteps = [
  { id: "confirmed", label: "Order Confirmed", description: "Your pickup request has been confirmed", icon: CheckCircle },
  { id: "assigntocourier", label: "Driver Assigned", description: "Driver has been assigned to your pickup", icon: User },

  { id: "collected", label: "Items Collected", description: "All items have been collected", icon: CheckCircle },
  { id: "completed", label: "Complete", description: "Pickup completed and payment processed", icon: CheckCircle },
];

export default function TrackingStep({
  orderId,
  onDelivered,
}: {
  orderId: string;
  onDelivered: () => void;
}) {
  const [trackingStarted, setTrackingStarted] = useState(true);
  const [lastDriverStatus, setLastDriverStatus] = useState<string | null>(null);
  const [driverMovementWarnings, setDriverMovementWarnings] = useState(0);
  const [truckPosition, setTruckPosition] = useState({ left: "10%", top: "50%" });
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSafetyDialog, setShowSafetyDialog] = useState(false);

  const { data: order, isLoading } = useQuery<OrderWithDetails>({
    queryKey: ["/api/orders", orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`);
      return res.data.data;
    },
    refetchInterval: trackingStarted ? 3000 : false,
  });

  const completeOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.completeOrder(orderId),
    onSuccess: () => {
      toast.success("Order completed successfully!");
      onDelivered();
    },
    onError: (error) => {
      console.error("Failed to complete order:", error);
      toast.error("Failed to complete order");
    },
  });

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

  const safetyReportMutation = useMutation({
    mutationFn: (report: SafetyReportData) => api.post(`/orders/${orderId}/safety-report`, report),
    onSuccess: () => {
      toast.success("Safety report submitted successfully!");
      setShowSafetyDialog(false);
    },
    onError: (error) => {
      console.error("Failed to submit safety report:", error);
      toast.error("Failed to submit safety report");
    },
  });

  const emergencyContactMutation = useMutation({
    mutationFn: () => api.post(`/orders/${orderId}/emergency`),
    onSuccess: () => {
      toast.success("Emergency services contacted!");
      setShowSafetyDialog(false);
    },
    onError: (error) => {
      console.error("Failed to contact emergency services:", error);
      toast.error("Failed to contact emergency services");
    },
  });

  useEffect(() => {
    if (order && order.status && trackingStarted) {
      if (
        lastDriverStatus &&
        lastDriverStatus !== order.status &&
        (order.status === "enroute" || order.status === "arrived")
      ) {
        const newWarningCount = driverMovementWarnings + 1;
        setDriverMovementWarnings(newWarningCount);

        if (newWarningCount <= 3) {
          toast.info(`Driver Movement Update - Warning ${newWarningCount} of 3`);
        }
      }
      setLastDriverStatus(order.status);
    }
  }, [order?.status, trackingStarted, lastDriverStatus, driverMovementWarnings]);

  useEffect(() => {
    if (order?.status) {
      const positions = {
        assigntocourier: { left: "10%", top: "50%" },
        enroute: { left: "50%", top: "30%" },
        arrived: { left: "80%", top: "70%" },
        completed: { left: "90%", top: "90%" },
      };
      const newPosition = positions[order.status as keyof typeof positions] || positions.assigntocourier;
      setTruckPosition(newPosition);
    }
  }, [order?.status]);

  useEffect(() => {
    if (order?.status === "completed") {
      onDelivered();
    }
  }, [order?.status, onDelivered]);

  const handleCancelOrder = (reason: string) => {
    cancelOrderMutation.mutate({ orderId, reason });
    setShowCancelDialog(false);
  };

  const handleSafetyReport = (report: SafetyReportData) => {
    safetyReportMutation.mutate(report);
  };

  const handleEmergencyContact = () => {
    emergencyContactMutation.mutate();
  };

  const getCurrentStepIndex = () => {
    if (!order?.status) return 0;
    const stepIndex = trackingSteps.findIndex((step) => step.id === order.status);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading tracking information...</p>
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
      {/* Progress Indicator */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Pickup Progress</h2>
        <div className="relative">
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
            <div
              className="h-1 bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%` }}
            />
          </div>
          <div className="relative flex justify-between">
            {trackingSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      isActive ? "bg-green-500 text-white shadow-lg" : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-center max-w-24">
                    <p
                      className={`text-sm font-medium ${
                        isCurrent ? "text-green-600" : isActive ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrent ? "text-green-600" : isActive ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Status Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center relative">
        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Truck className="text-white text-3xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {trackingSteps[currentStepIndex]?.label || "Order in Transit"}
        </h1>
        <p className="text-gray-600 mb-4">Order #{order._id?.slice(-8) || orderId}</p>
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-lg font-semibold">
          {trackingSteps[currentStepIndex]?.description || "In Progress"}
        </div>
        <div className="absolute transition-all duration-1000" style={truckPosition}></div>
      </div>

      {/* Safety Button Only */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowSafetyDialog(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          <Shield className="w-4 h-4" />
          Report Safety Issue
        </button>
      </div>

      {/* Driver Information */}
      {order.driverName && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Driver Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{order.driverName}</span>
            </div>
            {order.driverPhone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{order.driverPhone}</span>
              </div>
            )}
            {order.estimatedArrival && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">ETA: {order.estimatedArrival}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pickup Address */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Pickup Address</h2>
        </div>
        <div className="space-y-2 text-gray-700">
          <p>{order.address?.street}, Building {order.address?.building}</p>
          <p>Floor {order.address?.floor}, Apartment {order.address?.apartment}</p>
          <p>{order.address?.area}, {order.address?.city}</p>
          {order.address?.landmark && (
            <p className="text-sm text-gray-500">Landmark: {order.address.landmark}</p>
          )}
        </div>
      </div>

      {/* Items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Items to Pickup</h2>
          </div>
          <div className="space-y-3">
            {order.items.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.name || item.itemName} className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{item.name || item.itemName}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{item.price * item.quantity} EGP</p>
                  <p className="text-sm text-green-600">{item.points * item.quantity} points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracking Updates */}
      {order.trackingUpdates && order.trackingUpdates.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Tracking Updates</h2>
          </div>
          <div className="space-y-3">
            {order.trackingUpdates.map((update, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{update.message}</p>
                  <p className="text-sm text-gray-500">{update.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <p className="text-blue-800 font-medium">
          Your courier is on the way to pickup your items. This page will automatically update when your order is completed.
        </p>
      </div>

      {/* Demo Complete Button */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Demo Testing</h3>
          <p className="text-yellow-700 text-sm">
            Use this button to simulate order completion for testing purposes
          </p>
        </div>
        <button
          onClick={() => completeOrderMutation.mutate(orderId)}
          disabled={completeOrderMutation.isPending}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Zap className="mr-2" size={16} />
          {completeOrderMutation.isPending ? "Starting..." : "Demo: Complete Order (Test)"}
        </button>
      </div>

      {/* Low-Priority Cancel Button at Bottom */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setShowCancelDialog(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
          Cancel Order
        </button>
        <p className="mt-1 text-xs text-gray-400">
          Cancelling will stop your pickup and you may lose your rewards
        </p>
      </div>

      {/* Dialogs */}
      <CancelOrderDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelOrder}
        isLoading={cancelOrderMutation.isPending}
      />

      <SafetyDialog
        open={showSafetyDialog}
        onClose={() => setShowSafetyDialog(false)}
        onReport={handleSafetyReport}
        onEmergency={handleEmergencyContact}
        isLoading={safetyReportMutation.isPending || emergencyContactMutation.isPending}
        orderNumber={orderId}
        driverName={order.driverName}
      />
    </div>
  );
}
