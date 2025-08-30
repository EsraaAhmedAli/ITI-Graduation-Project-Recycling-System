"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Truck,
  MapPin,
  Clock,
  Phone,
  User,
  Shield,
  Star,
  MessageCircle,
} from "lucide-react";
// import { OrderWithDetails } from "@/components/Types/orders.type";
import { useParams } from "next/navigation";
import { useUserAuth } from "@/context/AuthFormContext";
import { useReviews } from "@/hooks/useReviews";
import DeliveryReviewModal from "../../DeliveryReview";
import PickupAddressCard from "@/components/pickupAdress";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

interface TrackingStepProps {
  orderId?: string; // Optional - can come from props
  onDelivered?: () => void; // Optional callback
  embedded?: boolean; // Whether it's embedded in pickup flow or standalone
  // Optional props from ReviewManager wrapper
  userReviews?: any[];
  refetchReviews?: () => Promise<any>;
  isReviewsLoading?: boolean;
}

export default function TrackingStep({
  orderId: propOrderId,
  onDelivered,
  embedded = false,
  userReviews: propsUserReviews,
  refetchReviews: propsRefetchReviews,
  isReviewsLoading: propsIsReviewsLoading,
}: TrackingStepProps) {
  const [trackingStarted] = useState(true);
  const [lastDriverStatus, setLastDriverStatus] = useState<string | null>(null);
  const [driverMovementWarnings, setDriverMovementWarnings] = useState(0);
  const [truckPosition, setTruckPosition] = useState({
    left: "10%",
    top: "50%",
  });
  const [showSafetyDialog, setShowSafetyDialog] = useState(false);
  const [showDeliveryReview, setShowDeliveryReview] = useState(false);
  const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);

  const { user } = useUserAuth();
  const queryClient = useQueryClient();
  const { t, convertNumber, locale } = useLanguage();
  // Get orderId from route parameters (for standalone page) or props (for embedded use)
  const params = useParams();
  const routeOrderId = params?.id as string;
  const orderId = propOrderId || routeOrderId;

  // Use the same review system as ReviewManager - prioritize props from wrapper
  const hookReviews = useReviews();
  const {
    userReviews,
    refetch: refetchReviews,
    isLoading: isReviewsLoading,
  } = {
    userReviews: propsUserReviews || hookReviews.userReviews,
    refetch: propsRefetchReviews || hookReviews.refetch,
    isLoading: propsIsReviewsLoading || hookReviews.isLoading,
  };

  // Find existing review using the same logic as ReviewManager
  const existingReview = orderId
    ? userReviews.find((review) => review.orderId === orderId)
    : null;

  const trackingSteps = [
    {
      id: "confirmed",
      label: t("tracking.orderConfirmed"),
      description: t("tracking.orderConfirmedDesc"),
      icon: CheckCircle,
    },
    {
      id: "assigntocourier",
      label: t("tracking.driverAssigned"),
      description: t("tracking.driverAssignedDesc"),
      icon: User,
    },
    {
      id: "collected",
      label: t("tracking.itemsCollected"),
      description: t("tracking.itemsCollectedDesc"),
      icon: CheckCircle,
    },
    {
      id: "completed",
      label: t("tracking.complete"),
      description: t("tracking.completeDesc"),
      icon: CheckCircle,
    },
  ];
  // Force refetch reviews when component mounts in embedded mode
  useEffect(() => {
    if (embedded && orderId) {
      console.log(
        "TrackingStep mounted in embedded mode, forcing review refetch..."
      );
      refetchReviews();
    }
  }, [embedded, orderId, refetchReviews]);
  const getDisplayName = (name: any, locale: string): string => {
    if (!name) return ""; // Handle undefined/null cases
    if (typeof name === "string") return name; // Handle string names
    if (typeof name === "object") {
      // Handle bilingual object
      if (locale === "ar" && name.ar) return name.ar;
      return name.en || ""; // Default to English or empty string
    }
    return ""; // Fallback for any other case
  };

  const getRefetchInterval = (status: string) => {
    switch (status) {
      case "confirmed":
        return 5000;
      case "assigntocourier":
        return 100000;
      case "enroute":
      case "arrived":
        return 2000; // 2 seconds - more frequent when active
      case "completed":
      case "cancelled":
        return false; // Stop polling when done
      default:
        return 5000;
    }
  };

  const { data: order, isLoading } = useQuery<OrderWithDetails>({
    queryKey: ["/api/orders", orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`);
      return res.data.data;
    },
    refetchInterval: (data) =>
      trackingStarted ? getRefetchInterval(data?.status) : false,
    enabled: !!orderId, // Only run query when orderId is available
  });

  const safetyReportMutation = useMutation({
    mutationFn: (report: SafetyReportData) =>
      api.post(`/orders/${orderId}/safety-report`, report),
    onSuccess: () => {
      toast.success(t("tracking.safetyReportSubmitted"));
      setShowSafetyDialog(false);
    },
    onError: (error) => {
      console.error("Failed to submit safety report:", error);
      toast.error(t("tracking.safetyReportFailed"));
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
          toast.info(
            `${t("tracking.driverMovementUpdate")} ${convertNumber(
              newWarningCount
            )} ${t("tracking.of")} ${convertNumber(3)}`
          );
        }
      }
      setLastDriverStatus(order.status);
    }
  }, [
    order?.status,
    trackingStarted,
    lastDriverStatus,
    driverMovementWarnings,
  ]);

  useEffect(() => {
    if (order?.status) {
      const positions = {
        assigntocourier: { left: "10%", top: "50%" },
        enroute: { left: "50%", top: "30%" },
        arrived: { left: "80%", top: "70%" },
        completed: { left: "90%", top: "90%" },
      };
      const newPosition =
        positions[order.status as keyof typeof positions] ||
        positions.assigntocourier;
      setTruckPosition(newPosition);
    }
  }, [order?.status]);

  // Handle completed order - show review modal only once if no existing review
  useEffect(() => {
    if (
      order?.status === "completed" &&
      !hasShownCompletionModal &&
      !existingReview &&
      !isReviewsLoading
    ) {
      const timer = setTimeout(() => {
        setShowDeliveryReview(true);
        setHasShownCompletionModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    order?.status,
    existingReview,
    hasShownCompletionModal,
    isReviewsLoading,
  ]);

  const handleSafetyReport = (report: SafetyReportData) => {
    safetyReportMutation.mutate(report);
  };

  // Debug: Force a complete data refresh on review submission
  const handleDeliveryReviewSubmitted = async () => {
    console.log("🔄 Review submitted, starting refresh process...");

    try {
      // First, invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ["user-reviews"],
      });

      // Force refetch reviews with explicit await
      console.log("🔄 Forcing reviews refetch...");
      const result = await refetchReviews();
      console.log("✅ Reviews refetched result:", result);

      // Also invalidate any order-specific review queries
      queryClient.invalidateQueries({
        queryKey: ["/api/orders", orderId, "review"],
      });

      // Add a delay and force a state update
      setTimeout(async () => {
        console.log("🔄 Second refetch attempt...");
        await refetchReviews();
        console.log("📊 Current reviews count:", userReviews.length);
        console.log("📊 Looking for review with orderId:", orderId);
        const foundReview = userReviews.find((r) => r.orderId === orderId);
        console.log("📊 Found existing review:", foundReview);
      }, 500);
    } catch (error) {
      console.error("❌ Failed to refetch reviews:", error);
    }

    setShowDeliveryReview(false);

    if (embedded) {
      if (onDelivered) {
        onDelivered();
      }
    } else {
      setTimeout(() => {
        window.location.href = "/profile";
      }, 500);
    }
  };

  const handleCloseReview = () => {
    setShowDeliveryReview(false);

    if (embedded && onDelivered) {
      onDelivered();
    }
  };

  const handleShowReviewModal = () => {
    setShowDeliveryReview(true);
  };

  const handleEmergencyContact = () => {
    emergencyContactMutation.mutate();
  };

  const getCurrentStepIndex = () => {
    if (!order?.status) return 0;
    const stepIndex = trackingSteps.findIndex(
      (step) => step.id === order.status
    );
    return stepIndex >= 0 ? stepIndex : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  // Helper function to get courier name (same as ReviewManager)
  const getCourierDisplayName = (courier: any) => {
    if (!courier) return "Unknown Courier";

    return (
      courier.name ||
      courier.userName ||
      courier.email?.split("@")[0] ||
      courier.phoneNumber ||
      "Unknown Courier"
    );
  };

  // Prepare order info for the review modal (same structure as ReviewManager)
  const orderInfo = order
    ? {
        orderNumber: order.orderNumber || orderId?.slice(-8).toUpperCase(),
        courierName: getCourierDisplayName(order.courier) || order.driverName,
        orderDate: order.createdAt || order.orderDate,
        itemCount: order.items?.length || 0,
      }
    : undefined;

  // Show error if no orderId
  if (!orderId) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-red-600">{t("tracking.invalidOrderId")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">{t("tracking.loading")}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-red-600">{t("tracking.orderNotFound")}</p>
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-6" : "max-w-4xl mx-auto p-6 space-y-6"}>
      {/* Progress Indicator */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t("tracking.pickupProgress")}
        </h2>
        <div className="relative">
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
            <div
              className="h-1 bg-green-500 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (currentStepIndex / (trackingSteps.length - 1)) * 100
                }%`,
              }}
            />
          </div>
          <div className="relative flex justify-between">
            {trackingSteps
              .filter(
                (step) => !(user?.role === "buyer" && step.id === "collected")
              )
              .map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                        isActive
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-center max-w-24">
                      <p
                        className={`text-sm font-medium ${
                          isCurrent
                            ? "text-green-600"
                            : isActive
                            ? "text-gray-700"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrent
                            ? "text-green-600"
                            : isActive
                            ? "text-gray-600"
                            : "text-gray-400"
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
      <div
        className={`border rounded-xl p-8 text-center relative ${
          order.status === "completed"
            ? "bg-green-50 border-green-200"
            : "bg-blue-50 border-blue-200"
        }`}
      >
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            order.status === "completed" ? "bg-green-500" : "bg-blue-500"
          }`}
        >
          {order.status === "completed" ? (
            <CheckCircle className="text-white text-3xl" />
          ) : (
            <Truck className="text-white text-3xl" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {trackingSteps[currentStepIndex]?.label ||
            t("tracking.orderInTransit")}
        </h1>
        <p className="text-gray-600 mb-4">
          {t("tracking.orderNumber")}
          {orderId?.slice(-8)}
        </p>
        <div
          className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
            order.status === "completed"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {trackingSteps[currentStepIndex]?.description ||
            t("tracking.inProgress")}
        </div>
        <div
          className="absolute transition-all duration-1000"
          style={truckPosition}
        ></div>
      </div>

      {/* Completion Actions - Show only when completed */}
      {order.status === "completed" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              {t("tracking.completedSuccessfully")}
            </h3>
            <p className="text-green-700">{t("tracking.completedMessage")}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleShowReviewModal}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <Star className="w-4 h-4" />
              {existingReview
                ? t("tracking.editReview")
                : t("tracking.rateExperience")}
            </button>

            {existingReview && (
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium">
                  {convertNumber(existingReview.stars)}/5
                </span>
                <MessageCircle className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pickup Address */}
      <PickupAddressCard order={order} />
      {/* <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
            Pickup Address
          </h2>
          </div>
    
        <div className="courierInfo">
          <h2>Delivery hero for today</h2>
          <p>Name:{order?.courier?.name}</p>
          <p>phone:{order?.courier?.phoneNumber}</p>
        </div>
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
        </div>
      </div> */}

      {/* Items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {order.status === "completed"
                ? t("tracking.itemsCollectedTitle")
                : t("tracking.itemsToPickup")}
            </h2>
          </div>
          <div className="space-y-3">
            {order.items.map((item: any, index: number) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  order.status === "completed" ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.image && (
                    <Image
                      width={40}
                      height={40}
                      src={item.image}
                      alt={getDisplayName(item.name, locale)}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {getDisplayName(item.name, locale)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("tracking.quantity")}: {convertNumber(item.quantity)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {convertNumber(item.price * item.quantity)}{" "}
                    <span className="text-sm font-normal text-gray-600">
                      {locale === "ar" ? "جنيه" : "EGP"}
                    </span>
                  </p>
                  <p className="text-sm font-medium text-green-600">
                    {convertNumber(item.points * item.quantity)}{" "}
                    {t("tracking.points")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Message */}
      <div
        className={`border rounded-xl p-6 text-center ${
          order.status === "completed"
            ? "bg-green-50 border-green-200"
            : "bg-blue-50 border-blue-200"
        }`}
      >
        <p
          className={`font-medium ${
            order.status === "completed" ? "text-green-800" : "text-blue-800"
          }`}
        >
          {(() => {
            const currentStep = trackingSteps[currentStepIndex];
            if (!currentStep) return t("tracking.statusMessages.default");

            return (
              t(`tracking.statusMessages.${currentStep.id}`) ||
              currentStep.description
            );
          })()}
        </p>
      </div>

      {/* Delivery Review Modal */}
      <DeliveryReviewModal
        isOpen={showDeliveryReview}
        onClose={handleCloseReview}
        orderId={orderId}
        orderInfo={orderInfo}
        existingReview={
          existingReview
            ? {
                rating: existingReview.stars,
                comments: existingReview.comment,
              }
            : undefined
        }
        onSubmitted={handleDeliveryReviewSubmitted}
      />

      {/* Safety Dialog
      <SafetyDialog
        open={showSafetyDialog}
        onClose={() => setShowSafetyDialog(false)}
        onReport={handleSafetyReport}
        onEmergency={handleEmergencyContact}
        isLoading={
          safetyReportMutation.isPending || emergencyContactMutation.isPending
        }
        orderNumber={orderId}
        driverName={order.driverName}
      /> */}
    </div>
  );
}
