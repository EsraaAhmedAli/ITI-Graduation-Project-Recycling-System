"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  XCircle,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useUserAuth } from "@/context/AuthFormContext";
import { useRouter } from "next/navigation";

const WaitingForApprovalPage = () => {
  const {
    user,
    deliveryStatus: contextDeliveryStatus,
    refreshDeliveryStatus,
    isLoading,
    logout,
    token
  } = useUserAuth();

  const [isReapplying, setIsReapplying] = useState(false);
  const [sessionDeliveryData, setSessionDeliveryData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Read from session storage on component mount
  useEffect(() => {
    const storedData = sessionStorage.getItem("deliveryUserData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setSessionDeliveryData(parsedData);
        console.log("📦 Loaded delivery data from session:", parsedData);
      } catch (error) {
        console.error("❌ Failed to parse session delivery data:", error);
        sessionStorage.removeItem("deliveryUserData"); // Clean up corrupted data
      }
    }
  }, []);

  // Initial status check
  useEffect(() => {
    if (user?.role === "delivery") {
      refreshDeliveryStatus();
    }
  }, [user, refreshDeliveryStatus]);

  // Auto-refresh status every 10 seconds if pending or declined
  useEffect(() => {
    if (!user || user.role !== "delivery") return;
    
    const shouldAutoRefresh = 
      contextDeliveryStatus === "pending" || 
      contextDeliveryStatus === "declined" ||
      sessionDeliveryData?.deliveryStatus === "pending" ||
      sessionDeliveryData?.deliveryStatus === "declined";
    
    if (!shouldAutoRefresh) return;

    const interval = setInterval(async () => {
      console.log("🔄 Auto-refreshing delivery status...");
      try {
        // Use the same logic as manual refresh
        handleManualRefresh();
      } catch (error) {
        console.error("Auto-refresh failed:", error);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [user, contextDeliveryStatus, sessionDeliveryData]);

  // Redirect if user gets approved while on this page
  useEffect(() => {
    if (user?.role === "delivery" && user?.isApproved === true) {
      console.log("✅ User is approved, redirecting...");
      router.push("/deliverydashboard");
    }
  }, [user, router]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log("🔄 Manual refresh triggered");
      console.log("👤 Current user:", { 
        email: user?.email, 
        isApproved: user?.isApproved,
        hasToken: !!token
      });
      
      // ✅ For users without tokens, check status via public endpoint
      if (!token && user?.email) {
        console.log("📡 No token - checking status via public endpoint");
        
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-delivery-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email })
          });

          if (response.ok) {
            const statusData = await response.json();
            console.log("📡 Public API returned:", statusData);
            
            if (statusData.deliveryStatus === "approved") {
              console.log("🎉 User was approved by admin! Updating and redirecting...");
              
              // Update user object
              const updatedUser = { ...user, isApproved: true };
              setUser(updatedUser);
              
              // Clear old session data
              sessionStorage.removeItem("deliveryUserData");
              
              // User needs to log in again to get token, so redirect to login
              alert("Congratulations! Your delivery application has been approved. Please log in again to access your dashboard.");
              logout();
              return;
            } else if (statusData.deliveryStatus === "declined") {
              console.log("❌ User is still declined, updating session data");
              
              const updatedUser = { 
                ...user, 
                isApproved: false,
                declineReason: statusData.declineReason,
                declinedAt: statusData.declinedAt
              };
              setUser(updatedUser);
              
              const declineData = {
                user: updatedUser,
                deliveryStatus: "declined",
                declineReason: statusData.declineReason || "",
                declinedAt: statusData.declinedAt || "",
                canReapply: statusData.canReapply || true,
                message: "Application declined"
              };
              
              sessionStorage.setItem("deliveryUserData", JSON.stringify(declineData));
              setSessionDeliveryData(declineData);
            } else {
              console.log("⏳ User is still pending");
              setDeliveryStatus("pending");
            }
          } else {
            console.error("❌ Public API call failed:", response.statusText);
          }
        } catch (apiError) {
          console.error("❌ Public API error:", apiError);
        }
      } else if (token) {
        // For users with tokens, use the authenticated endpoint
        console.log("✅ Has token - calling authenticated refresh");
        await refreshDeliveryStatus();
      }
      
      // Wait a bit then reload session data
      setTimeout(() => {
        const newStoredData = sessionStorage.getItem("deliveryUserData");
        if (newStoredData) {
          const parsedData = JSON.parse(newStoredData);
          console.log("📦 Updated session data:", parsedData);
          setSessionDeliveryData(parsedData);
        }
      }, 500);
      
    } catch (error) {
      console.error("Manual refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
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

  // Use session data if available, otherwise fall back to context
  const displayUser = sessionDeliveryData?.user || user;
  const displayDeliveryStatus = sessionDeliveryData?.deliveryStatus || contextDeliveryStatus;
  const declineReason = sessionDeliveryData?.declineReason || displayUser?.declineReason || "";
  const declinedAt = sessionDeliveryData?.declinedAt || displayUser?.declinedAt || "";
  const canReapply = sessionDeliveryData?.canReapply || displayUser?.canReapply || false;

  console.log("🔍 Display values:", {
    displayDeliveryStatus,
    declineReason,
    declinedAt,
    canReapply,
    contextDeliveryStatus,
    sessionDeliveryStatus: sessionDeliveryData?.deliveryStatus,
    userApproved: user?.isApproved
  });

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
    // TODO: add your reapply logic (API call, redirect, etc.)
    setTimeout(() => {
      setIsReapplying(false);
      // Clear session data after reapply
      sessionStorage.removeItem("deliveryUserData");
    }, 2000);
  };

  const handleLogout = () => {
    // Clear session data on logout
    sessionStorage.removeItem("deliveryUserData");
    logout();
  };

  const getStatusIcon = () => {
    switch (displayDeliveryStatus) {
      case "approved":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "declined":
        return <XCircle className="w-16 h-16 text-red-500" />;
      case "pending":
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (displayDeliveryStatus) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "declined":
        return "text-red-600 bg-red-50 border-red-200";
      case "pending":
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const getStatusTitle = () => {
    switch (displayDeliveryStatus) {
      case "approved":
        return "Application Approved!";
      case "declined":
        return "Application Declined";
      case "pending":
      default:
        return "Application Under Review";
    }
  };

  const getStatusMessage = () => {
    switch (displayDeliveryStatus) {
      case "approved":
        return "Congratulations! Your delivery application has been approved. You can now start accepting delivery requests.";
      case "declined":
        return "Unfortunately, your delivery application has been declined. Please review the reason below and consider reapplying if eligible.";
      case "pending":
      default:
        return "Your delivery application is currently being reviewed by our team. We'll notify you once a decision has been made.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Enhanced Debug section */}
      <div className="max-w-2xl mx-auto mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-xs">
        <details>
          <summary className="cursor-pointer font-medium">Debug Info (click to expand)</summary>
          <div className="mt-2 space-y-1">
            <div><strong>Context Status:</strong> {contextDeliveryStatus}</div>
            <div><strong>Session Status:</strong> {sessionDeliveryData?.deliveryStatus}</div>
            <div><strong>Display Status:</strong> {displayDeliveryStatus}</div>
            <div><strong>User Approved:</strong> {String(user?.isApproved)}</div>
            <div><strong>Decline Reason:</strong> {declineReason}</div>
            <div><strong>Can Reapply:</strong> {String(canReapply)}</div>
            <div><strong>Has Token:</strong> {String(!!token)}</div>
            <button 
              onClick={async () => {
                try {
                  const response = await api.get("/auth/delivery-status");
                  console.log("🧪 Direct API response:", response.data);
                  alert(`API Status: ${response.data.deliveryStatus}\nUser Approved: ${response.data.user?.isApproved}\nDecline Reason: ${response.data.declineReason || 'None'}`);
                } catch (error) {
                  console.error("API Error:", error);
                  alert(`API Error: ${error.response?.data?.message || error.message}`);
                }
              }}
              className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-xs mr-2"
            >
              Test API Direct
            </button>
            <button 
              onClick={handleManualRefresh}
              className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
              disabled={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "Manual Refresh"}
            </button>
          </div>
        </details>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 text-center border-b border-gray-200">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getStatusTitle()}
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">{getStatusMessage()}</p>
            
            {/* Refresh status indicator */}
            {isRefreshing && (
              <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-2"></div>
                Checking for updates...
              </div>
            )}
          </div>

          {/* User Info */}
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
                <span className="text-gray-500">User ID:</span>
                <span className="ml-2 font-mono text-xs">{displayUser?._id || displayUser?.userId}</span>
              </div>
            </div>
          </div>

          {/* Status Details */}
          <div className="px-6 py-6">
            <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">
                    Status: <span className="capitalize">{displayDeliveryStatus}</span>
                  </h4>

                  {displayDeliveryStatus === "declined" && declineReason && (
                    <div className="mt-3">
                      <p className="font-medium text-sm mb-1">Reason for Decline:</p>
                      <p className="text-sm bg-white bg-opacity-60 p-3 rounded border">
                        {declineReason}
                      </p>
                    </div>
                  )}

                  {declinedAt && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Date:</span> {formatDate(declinedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Manual refresh button */}
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRefreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check Status
                  </>
                )}
              </button>

              {/* Reapply button */}
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

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Home
              </button>
            </div>

            {/* Status-specific messages */}
            {displayDeliveryStatus === "pending" && (
              <div className="text-sm text-gray-500 mt-4 text-center">
                <p>We typically review applications within 2-3 business days.</p>
                <p className="mt-1">Status automatically refreshes every 10 seconds.</p>
              </div>
            )}

            {displayDeliveryStatus === "declined" && (
              <div className="text-sm text-gray-500 mt-4 text-center">
                <p>You can reapply after addressing the decline reasons above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
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