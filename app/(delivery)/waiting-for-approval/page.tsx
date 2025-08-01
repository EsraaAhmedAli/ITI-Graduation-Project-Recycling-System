"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  XCircle,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { useUserAuth } from "@/context/AuthFormContext";
import { useRouter } from "next/navigation";

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
    token
  } = useUserAuth();

  const [isReapplying, setIsReapplying] = useState(false);
  const [sessionDeliveryData, setSessionDeliveryData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const [isApprovedLocally, setIsApprovedLocally] = useState(false);
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

  // Auto-refresh for pending/declined status only - stops when approved
  useEffect(() => {
    if (!user || user.role !== "delivery" || isApprovedLocally) return;
    
    const shouldAutoRefresh = 
      contextDeliveryStatus === "pending" || 
      contextDeliveryStatus === "declined" ||
      sessionDeliveryData?.deliveryStatus === "pending" ||
      sessionDeliveryData?.deliveryStatus === "declined";
    
    if (!shouldAutoRefresh) return;

    const interval = setInterval(async () => {
      const now = Date.now();
      if (now - lastCheckTime < 4000) return;
      
      console.log("🔄 Auto-refreshing delivery status...");
      setLastCheckTime(now);
      
      try {
        await handleStatusCheck(false);
      } catch (error) {
        console.error("Auto-refresh failed:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, contextDeliveryStatus, sessionDeliveryData, lastCheckTime, isApprovedLocally]);

  // Status check function - completely rewritten to prevent alerts/redirects on approval
  const handleStatusCheck = async (showNotifications = true) => {
    if (!user?.email || isApprovedLocally) return;
    
    setIsRefreshing(true);
    
    try {
      console.log("🔄 Status check triggered");
      
      let statusData;
      
      if (token) {
        try {
          statusData = await refreshDeliveryStatus();
          console.log("✅ Auth API success:", statusData);
        } catch (authError) {
          console.warn("⚠️ Auth API failed, using public API");
          statusData = await checkPublicDeliveryStatus(user.email);
        }
      } else {
        statusData = await checkPublicDeliveryStatus(user.email);
      }
      
      const newStatus = statusData.deliveryStatus;
      const currentDisplayStatus = sessionDeliveryData?.deliveryStatus || contextDeliveryStatus;
      
      console.log("📊 Status comparison:", { 
        newStatus, 
        currentDisplayStatus, 
        userApproved: user.isApproved 
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
          canReapply: false,
          message: "Application approved"
        };
        
        sessionStorage.setItem("deliveryUserData", JSON.stringify(approvedData));
        setSessionDeliveryData(approvedData);
        
        return statusData;
      }
      
      // Handle decline
      if (newStatus === "declined" && currentDisplayStatus !== "declined") {
        console.log("❌ User declined");
        
        const updatedUser = { 
          ...user, 
          isApproved: false,
          declineReason: statusData.declineReason,
          declinedAt: statusData.declinedAt
        };
        
        setUser(updatedUser);
        setDeliveryStatus("declined");
        
        const declineData = {
          user: updatedUser,
          deliveryStatus: "declined",
          declineReason: statusData.declineReason,
          declinedAt: statusData.declinedAt,
          canReapply: statusData.canReapply || true,
          message: "Application declined"
        };
        
        sessionStorage.setItem("deliveryUserData", JSON.stringify(declineData));
        setSessionDeliveryData(declineData);
        
      
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
          canReapply: false,
          message: "Application pending"
        };
        
        sessionStorage.setItem("deliveryUserData", JSON.stringify(pendingData));
        setSessionDeliveryData(pendingData);
      }
      
      return statusData;
      
    } catch (error) {
      console.error("Status check failed:", error);
      if (showNotifications) {
        alert("Failed to check status. Please try again.");
      }
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

  const handleReapply = () => {
    setIsReapplying(true);
    setTimeout(() => {
      setIsReapplying(false);
      sessionStorage.removeItem("deliveryUserData");
      router.push("/auth");
    }, 2000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("deliveryUserData");
    logout();
  };

  const handleLoginNavigation = () => {
    sessionStorage.removeItem("deliveryUserData");
    logout();
    router.push("/newAuth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your application status...</p>
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
  const displayDeliveryStatus = sessionDeliveryData?.deliveryStatus || contextDeliveryStatus;
  const declineReason = sessionDeliveryData?.declineReason || displayUser?.declineReason || "";
  const declinedAt = sessionDeliveryData?.declinedAt || displayUser?.declinedAt || "";
  const canReapply = sessionDeliveryData?.canReapply || displayUser?.canReapply || false;

  const isApproved = isApprovedLocally || displayDeliveryStatus === "approved";

  const getStatusIcon = () => {
    if (isApproved) return <CheckCircle className="w-16 h-16 text-green-500" />;
    
    switch (displayDeliveryStatus) {
      case "declined":
        return <XCircle className="w-16 h-16 text-red-500" />;
      case "pending":
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    if (isApproved) return "text-green-600 bg-green-50 border-green-200";
    
    switch (displayDeliveryStatus) {
      case "declined":
        return "text-red-600 bg-red-50 border-red-200";
      case "pending":
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const getStatusTitle = () => {
    if (isApproved) return "🎉 Application Approved!";
    
    switch (displayDeliveryStatus) {
      case "declined":
        return "Application Declined";
      case "pending":
      default:
        return "Application Under Review";
    }
  };

  const getStatusMessage = () => {
    if (isApproved) {
      return "Congratulations! Your delivery application has been approved. You can now proceed to login and start accepting delivery requests.";
    }
    
    switch (displayDeliveryStatus) {
      case "declined":
        return "Unfortunately, your delivery application has been declined. Please review the reason below and consider reapplying if eligible.";
      case "pending":
      default:
        return "Your delivery application is currently being reviewed by our team. We'll notify you once a decision has been made.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8 text-center border-b border-gray-200">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getStatusTitle()}
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">{getStatusMessage()}</p>
            
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
                <span className="ml-2 font-medium capitalize">{displayUser?.role}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 font-medium capitalize">
                  {isApproved ? "approved" : displayDeliveryStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">
                    Current Status: <span className="capitalize">
                      {isApproved ? "approved" : displayDeliveryStatus}
                    </span>
                  </h4>

                  {displayDeliveryStatus === "declined" && declineReason && !isApproved && (
                    <div className="mt-3">
                      <p className="font-medium text-sm mb-1">Reason for Decline:</p>
                      <p className="text-sm bg-white bg-opacity-60 p-3 rounded border">
                        {declineReason}
                      </p>
                    </div>
                  )}

                  {declinedAt && !isApproved && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Date:</span> {formatDate(declinedAt)}
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

                  {displayDeliveryStatus === "declined" && canReapply && (
                    <button
                      onClick={handleReapply}
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
                <p>We typically review applications within 2-3 business days.</p>
                <p className="mt-1">Status automatically refreshes every 5 seconds.</p>
              </div>
            )}

            {!isApproved && displayDeliveryStatus === "declined" && (
              <div className="text-sm text-gray-500 mt-4 text-center">
                <p>You can reapply after addressing the decline reasons above.</p>
              </div>
            )}

            {isApproved && (
              <div className="text-sm text-green-600 mt-4 text-center font-medium">
                <p>🎉 You're all set! Click the login button above to access your delivery dashboard.</p>
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