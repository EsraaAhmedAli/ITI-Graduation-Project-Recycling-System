"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  XCircle,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  LogIn,
  ShieldX, // New icon for revoked status
} from "lucide-react";
import { useUserAuth } from "@/context/AuthFormContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";

const WaitingForApprovalPage = () => {
  const {
    user,
    deliveryStatus: contextDeliveryStatus,
    refreshDeliveryStatus,
    checkPublicDeliveryStatus,
    setUser,
    setDeliveryStatus,
    isLoading,
    logout,
    token,
  } = useUserAuth();

  const [isReapplying, setIsReapplying] = useState(false);
  const [sessionDeliveryData, setSessionDeliveryData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const [isApprovedLocally, setIsApprovedLocally] = useState(false);
  const [forceRerender, setForceRerender] = useState(0); // ✅ ADD: Force rerender trigger
  const router = useRouter();

  // Load session data
  useEffect(() => {
    const storedData = sessionStorage.getItem("deliveryUserData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setSessionDeliveryData(parsedData);
        console.log("📦 Loaded delivery data from session:", parsedData);
      } catch (error) {
        console.error("❌ Failed to parse session delivery data:", error);
        sessionStorage.removeItem("deliveryUserData");
      }
    }
  }, []);

  // Initial status check
  useEffect(() => {
    if (user?.role === "delivery") {
      refreshDeliveryStatus();
    }
  }, [user, refreshDeliveryStatus]);

  // ✅ IMPROVED: Auto-refresh with better error handling
  useEffect(() => {
    if (!user || user.role !== "delivery" || isApprovedLocally) return;

    const shouldAutoRefresh =
      contextDeliveryStatus === "pending" ||
      contextDeliveryStatus === "declined" ||
      contextDeliveryStatus === "revoked" ||
      sessionDeliveryData?.deliveryStatus === "pending" ||
      sessionDeliveryData?.deliveryStatus === "declined" ||
      sessionDeliveryData?.deliveryStatus === "revoked";

    if (!shouldAutoRefresh) return;

    const interval = setInterval(async () => {
      const now = Date.now();
      if (now - lastCheckTime < 4000) return;

      console.log("🔄 Auto-refreshing delivery status...");
      setLastCheckTime(now);

      try {
        const result = await handleStatusCheck(false);
        if (result === null) {
          console.warn("⚠️ Auto-refresh returned null, skipping this cycle");
        }
      } catch (error) {
        console.error("Auto-refresh failed:", error);
        // Don't show errors for auto-refresh, only log them
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [
    user,
    contextDeliveryStatus,
    sessionDeliveryData,
    lastCheckTime,
    isApprovedLocally,
  ]);

  // ✅ ENHANCED: Status check function with improved state updates
  const handleStatusCheck = async (showNotifications = true) => {
    if (!user?.email || isApprovedLocally) return;

    setIsRefreshing(true);

    try {
      console.log("🔄 Status check triggered");

      let statusData = null;

      if (token) {
        try {
          statusData = await refreshDeliveryStatus();
          console.log("✅ Auth API success:", statusData);
        } catch (authError) {
          console.warn("⚠️ Auth API failed, using public API", authError);
          try {
            statusData = await checkPublicDeliveryStatus(user.email);
          } catch (publicError) {
            console.error("❌ Public API also failed:", publicError);
            statusData = null;
          }
        }
      } else {
        try {
          statusData = await checkPublicDeliveryStatus(user.email);
        } catch (publicError) {
          console.error("❌ Public API failed:", publicError);
          statusData = null;
        }
      }

      // ✅ ADD: Check if statusData is null or doesn't have deliveryStatus
      if (!statusData || !statusData.deliveryStatus) {
        console.warn("⚠️ No valid status data received:", statusData);
        if (showNotifications) {
          toast.error("Unable to check status. Please try again later.");
        }
        return null;
      }

      const newStatus = statusData.deliveryStatus;
      const currentDisplayStatus =
        sessionDeliveryData?.deliveryStatus || contextDeliveryStatus;

      console.log("📊 Status comparison:", {
        newStatus,
        currentDisplayStatus,
        userApproved: user.isApproved,
      });

      // Handle approval - NO ALERTS, NO REDIRECTS
      if (newStatus === "approved" && currentDisplayStatus !== "approved") {
        console.log("🎉 User approved - showing success UI!");

        setIsApprovedLocally(true);
        setDeliveryStatus("approved");

        const approvedData = {
          user: { ...user, isApproved: true },
          deliveryStatus: "approved",
          declineReason: "",
          declinedAt: "",
          revokeReason: "",
          revokedAt: "",
          canReapply: false,
          message: "Application approved",
        };

        sessionStorage.setItem(
          "deliveryUserData",
          JSON.stringify(approvedData)
        );
        setSessionDeliveryData(approvedData);
        setForceRerender((prev) => prev + 1); // ✅ ADD: Force rerender

        return statusData;
      }

      // ✅ IMPROVED: Handle revoked status with better state updates
      if (newStatus === "revoked" && currentDisplayStatus !== "revoked") {
        console.log("🚫 User access revoked");

        const updatedUser = {
          ...user,
          isApproved: false,
          revokeReason: statusData.revokeReason,
          revokedAt: statusData.revokedAt,
        };

        setUser(updatedUser);
        setDeliveryStatus("revoked");

        const revokeData = {
          user: updatedUser,
          deliveryStatus: "revoked",
          revokeReason: statusData.revokeReason,
          revokedAt: statusData.revokedAt,
          activeOrdersCount: statusData.activeOrdersCount || 0,
          canReapply: statusData.canReapply !== false, // ✅ FIXED: Default to true if not explicitly false
          message: "Access revoked",
        };

        sessionStorage.setItem("deliveryUserData", JSON.stringify(revokeData));
        setSessionDeliveryData(revokeData);
        setForceRerender((prev) => prev + 1); // ✅ ADD: Force rerender
      }

      // ✅ IMPROVED: Handle decline with better state updates
      if (newStatus === "declined" && currentDisplayStatus !== "declined") {
        console.log("❌ User declined");

        const updatedUser = {
          ...user,
          isApproved: false,
          declineReason: statusData.declineReason,
          declinedAt: statusData.declinedAt,
        };

        setUser(updatedUser);
        setDeliveryStatus("declined");

        const declineData = {
          user: updatedUser,
          deliveryStatus: "declined",
          declineReason: statusData.declineReason,
          declinedAt: statusData.declinedAt,
          canReapply: statusData.canReapply !== false, // ✅ FIXED: Default to true if not explicitly false
          message: "Application declined",
        };

        sessionStorage.setItem("deliveryUserData", JSON.stringify(declineData));
        setSessionDeliveryData(declineData);
        setForceRerender((prev) => prev + 1); // ✅ ADD: Force rerender to show reapply button
      }

      // Handle pending status
      if (newStatus === "pending" && currentDisplayStatus !== "pending") {
        console.log("⏳ Status is pending");

        setDeliveryStatus("pending");

        const pendingData = {
          user: { ...user, isApproved: false },
          deliveryStatus: "pending",
          declineReason: "",
          declinedAt: "",
          revokeReason: "",
          revokedAt: "",
          canReapply: false,
          message: "Application pending",
        };

        sessionStorage.setItem("deliveryUserData", JSON.stringify(pendingData));
        setSessionDeliveryData(pendingData);
        setForceRerender((prev) => prev + 1); // ✅ ADD: Force rerender
      }

      return statusData;
    } catch (error) {
      console.error("Status check failed:", error);
      if (showNotifications) {
        // ✅ IMPROVED: More specific error messages
        let errorMessage = "Failed to check status. Please try again.";

        if (error?.response?.status === 404) {
          errorMessage = "User not found. Please contact support.";
        } else if (error?.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error?.message?.includes("Network")) {
          errorMessage = "Network error. Please check your connection.";
        }

        toast.error(errorMessage);
      }
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => handleStatusCheck(true);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ IMPROVED: Better reapply handler with proper cleanup
  const handleReapply = async (email: string) => {
    setIsReapplying(true);

    try {
      const res = await api.post("delivery/reapply", { email });

      if (res.status === 200) {
        // ✅ IMPROVED: Clear all data before redirect
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.removeItem("deliveryUserData");

        // Clear context state
        setUser(null);
        setDeliveryStatus(null);

        toast.success(
          "Previous application deleted. Redirecting to reapply..."
        );

        // ✅ IMPROVED: Use replace instead of push and add delay
        setTimeout(() => {
          router.replace("/auth"); // Use replace to prevent back navigation
        }, 1500);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Something went wrong";
      toast.error(message);
      setIsReapplying(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("deliveryUserData");
    logout();
  };

  const handleLoginNavigation = () => {
    sessionStorage.removeItem("deliveryUserData");
    logout();
    router.push("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading your application status...
          </p>
        </div>
      </div>
    );
  }

  if (!user && !sessionDeliveryData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-700">
          You must be logged in as a delivery user to view this page.
        </p>
      </div>
    );
  }

  const displayUser = sessionDeliveryData?.user || user;
  const displayDeliveryStatus =
    sessionDeliveryData?.deliveryStatus || contextDeliveryStatus;
  const declineReason =
    sessionDeliveryData?.declineReason || displayUser?.declineReason || "";
  const declinedAt =
    sessionDeliveryData?.declinedAt || displayUser?.declinedAt || "";
  const revokeReason =
    sessionDeliveryData?.revokeReason || displayUser?.revokeReason || "";
  const revokedAt =
    sessionDeliveryData?.revokedAt || displayUser?.revokedAt || "";
  const activeOrdersCount = sessionDeliveryData?.activeOrdersCount || 0;
  // ✅ FIXED: Always allow reapply for declined/revoked status, regardless of API flag
  const canReapply =
    sessionDeliveryData?.canReapply ||
    displayUser?.canReapply ||
    displayDeliveryStatus === "declined" ||
    displayDeliveryStatus === "revoked";

  const isApproved = isApprovedLocally || displayDeliveryStatus === "approved";

  // Status icon with revoked support
  const getStatusIcon = () => {
    if (isApproved) return <CheckCircle className="w-16 h-16 text-green-500" />;

    switch (displayDeliveryStatus) {
      case "declined":
        return <XCircle className="w-16 h-16 text-red-500" />;
      case "revoked":
        return <ShieldX className="w-16 h-16 text-orange-500" />;
      case "pending":
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  // Status color with revoked support
  const getStatusColor = () => {
    if (isApproved) return "text-green-600 bg-green-50 border-green-200";

    switch (displayDeliveryStatus) {
      case "declined":
        return "text-red-600 bg-red-50 border-red-200";
      case "revoked":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "pending":
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  // Status title with revoked support
  const getStatusTitle = () => {
    if (isApproved) return "🎉 Application Approved!";

    switch (displayDeliveryStatus) {
      case "declined":
        return "Application Declined";
      case "revoked":
        return "Access Revoked";
      case "pending":
      default:
        return "Application Under Review";
    }
  };

  // Status message with revoked support
  const getStatusMessage = () => {
    if (isApproved) {
      return "Congratulations! Your delivery application has been approved. You can now proceed to login and start accepting delivery requests.";
    }

    switch (displayDeliveryStatus) {
      case "declined":
        return "Unfortunately, your delivery application has been declined. Please review the reason below and consider reapplying if eligible.";
      case "revoked":
        return "Your delivery access has been revoked. Please review the reason below. You can submit a new application to regain access.";
      case "pending":
      default:
        return "Your delivery application is currently being reviewed by our team. We'll notify you once a decision has been made.";
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      key={forceRerender}
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8 text-center border-b border-gray-200">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getStatusTitle()}
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              {getStatusMessage()}
            </p>

            {!isApproved && (
              <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
                {isRefreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-2"></div>
                    Checking for updates...
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    Auto-refreshing every 5 seconds
                  </>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Application Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="ml-2 font-medium">{displayUser?.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 font-medium">{displayUser?.email}</span>
              </div>
              <div>
                <span className="text-gray-500">Role:</span>
                <span className="ml-2 font-medium capitalize">
                  {displayUser?.role}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 font-medium capitalize">
                  {isApproved ? "approved" : displayDeliveryStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Active orders info for revoked users */}
          {displayDeliveryStatus === "revoked" &&
            activeOrdersCount > 0 &&
            !isApproved && (
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0 text-blue-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800 mb-1">
                      Active Orders Preserved
                    </h4>
                    <p className="text-sm text-blue-700">
                      You have {activeOrdersCount} active order(s) that will
                      remain assigned to you even during the reapplication
                      process. You can complete these orders while your new
                      application is being reviewed.
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className="px-6 py-6">
            <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">
                    Current Status:{" "}
                    <span className="capitalize">
                      {isApproved ? "approved" : displayDeliveryStatus}
                    </span>
                  </h4>

                  {/* Show decline reason */}
                  {displayDeliveryStatus === "declined" &&
                    declineReason &&
                    !isApproved && (
                      <div className="mt-3">
                        <p className="font-medium text-sm mb-1">
                          Reason for Decline:
                        </p>
                        <p className="text-sm bg-white bg-opacity-60 p-3 rounded border">
                          {declineReason}
                        </p>
                      </div>
                    )}

                  {/* Show revoke reason */}
                  {displayDeliveryStatus === "revoked" &&
                    revokeReason &&
                    !isApproved && (
                      <div className="mt-3">
                        <p className="font-medium text-sm mb-1">
                          Reason for Revocation:
                        </p>
                        <p className="text-sm bg-white bg-opacity-60 p-3 rounded border">
                          {revokeReason}
                        </p>
                      </div>
                    )}

                  {/* Show relevant dates */}
                  {declinedAt &&
                    !isApproved &&
                    displayDeliveryStatus === "declined" && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Declined:</span>{" "}
                        {formatDate(declinedAt)}
                      </p>
                    )}

                  {revokedAt &&
                    !isApproved &&
                    displayDeliveryStatus === "revoked" && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Revoked:</span>{" "}
                        {formatDate(revokedAt)}
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {isApproved ? (
                <button
                  onClick={handleLoginNavigation}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isRefreshing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Check Status Now
                      </>
                    )}
                  </button>

                  {/* ✅ IMPROVED: Show reapply button based on status, not just canReapply flag */}
                  {(displayDeliveryStatus === "declined" ||
                    displayDeliveryStatus === "revoked") && (
                    <button
                      onClick={() => handleReapply(displayUser?.email)}
                      disabled={isReapplying}
                      className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isReapplying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reapply Now
                        </>
                      )}
                    </button>
                  )}
                </>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Home
              </button>
            </div>

            {!isApproved && displayDeliveryStatus === "pending" && (
              <div className="text-sm text-gray-500 mt-4 text-center">
                <p>
                  We typically review applications within 2-3 business days.
                </p>
                <p className="mt-1">
                  Status automatically refreshes every 5 seconds.
                </p>
              </div>
            )}

            {!isApproved && displayDeliveryStatus === "declined" && (
              <div className="text-sm text-gray-500 mt-4 text-center">
                <p>
                  You can reapply after addressing the decline reasons above.
                </p>
              </div>
            )}

            {!isApproved && displayDeliveryStatus === "revoked" && (
              <div className="text-sm text-gray-500 mt-4 text-center">
                <p>Submit a new application to regain delivery access.</p>
                {activeOrdersCount > 0 && (
                  <p className="mt-1 text-blue-600 font-medium">
                    Your {activeOrdersCount} active order(s) will remain
                    assigned during reapplication.
                  </p>
                )}
              </div>
            )}

            {isApproved && (
              <div className="text-sm text-green-600 mt-4 text-center font-medium">
                <p>
                  🎉 You're all set! Click the login button above to access your
                  delivery dashboard.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Have questions about your application?{" "}
            <a
              href="/contact"
              className="text-blue-600 hover:text-blue-800 ml-1 underline"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingForApprovalPage;
