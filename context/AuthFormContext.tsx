"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import api, { setAccessToken } from "@/lib/axios";
import { User, UserRewards } from "@/components/Types/Auser.type";

interface UserAuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isLoading: boolean;
  refreshAccessToken: () => Promise<void>;
  deliveryStatus: string | null;
  setDeliveryStatus: (status: string | null) => void;
  refreshDeliveryStatus: () => Promise<void>;
  checkPublicDeliveryStatus: (email: string) => Promise<any>;
  isAdmin: boolean;
  isDelivery: boolean;
  isApprovedDelivery: boolean;
  isPendingOrDeclinedDelivery: boolean;
  userRewards: UserRewards | null;
  setUserRewards: (rewards: UserRewards | null) => void;
}

export const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined
);

export const UserAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryStatus, setDeliveryStatusState] = useState<string | null>(
    null
  );
  const [userRewards, setUserRewards] = useState<UserRewards>(null);
  const router = useRouter();
  const [lastRefreshTime, setLastRefreshTime] = useState(0); // ✅ ADD: Prevent rapid refreshes
  const determineDeliveryStatus = useCallback((userData: User) => {
    if (userData.role !== "delivery") return null;

    // Check attachments for status information
    const attachments = userData.attachments;
    const declineReason = userData.declineReason || attachments?.declineReason;
    const revokeReason = attachments?.revokeReason;
    const declinedAt = userData.declinedAt || attachments?.declinedAt;
    const revokedAt = attachments?.revokedAt;
    const approvedAt = attachments?.approvedAt;

    // Get timestamps for comparison
    const declineTimestamp = declinedAt ? new Date(declinedAt).getTime() : 0;
    const revokeTimestamp = revokedAt ? new Date(revokedAt).getTime() : 0;
    const approveTimestamp = approvedAt ? new Date(approvedAt).getTime() : 0;

    // Find most recent action
    const mostRecentTimestamp = Math.max(
      declineTimestamp,
      revokeTimestamp,
      approveTimestamp
    );

    if (mostRecentTimestamp === revokeTimestamp && revokeReason) {
      return "revoked";
    } else if (mostRecentTimestamp === declineTimestamp && declineReason) {
      return "declined";
    } else if (
      userData.isApproved === true &&
      (mostRecentTimestamp === approveTimestamp || approveTimestamp > 0)
    ) {
      return "approved";
    } else {
      return "pending";
    }
  }, []);

  const setUser = useCallback(
    (user: User | null) => {
      if (user) localStorage.setItem("user", JSON.stringify(user));
      else localStorage.removeItem("user");
      setUserState(user);

      if (!user || user.role !== "delivery") {
        setDeliveryStatusState(null);
      } else {
        // ✅ ENHANCED: Use better status determination
        const status = determineDeliveryStatus(user);
        setDeliveryStatusState(status);
      }
    },
    [determineDeliveryStatus]
  );

  const setToken = useCallback((token: string | null) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    setAccessToken(token);
    setTokenState(token);
  }, []);

  const setDeliveryStatus = useCallback((status: string | null) => {
    setDeliveryStatusState(status);
  }, []);

  const logout = useCallback(() => {
    console.log("🔓 Logging out...");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("deliveryUserData");
    setUserState(null);
    setTokenState(null);
    setLastRefreshTime(0); // ✅ ADD: Reset refresh time

    setDeliveryStatusState(null);
    setAccessToken(null);
    delete api.defaults.headers.common["Authorization"];
    router.push("/");
  }, [router]);

  // ✅ NEW: Public status check for users without tokens
  const checkPublicDeliveryStatus = useCallback(async (email: string) => {
    try {
      console.log("📡 Checking public delivery status for:", email);

      const response = await api.post("/auth/check-delivery-status", { email });
      console.log("📡 Public API returned:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ Public API error:", error);

      if (error.response) {
        console.log(error.response.statusText);

        // throw new Error(`HTTP ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error("Network error: No response received");
      } else {
        throw error;
      }
    }
  }, []);
  const refreshAccessToken = useCallback(async () => {
    try {
      console.log("🔄 Refreshing token...");
      await api.post("/auth/refresh");
      const newToken = localStorage.getItem("token");
      if (newToken) {
        setToken(newToken);
        console.log("✅ Token refreshed");
      } else {
        throw new Error("No token after refresh");
      }
    } catch (err) {
      console.error("❌ Refresh failed:", err);
      logout();
    }
  }, [logout, setToken]);

  // ✅ IMPROVED: Better delivery status refresh with public API fallback
  const refreshDeliveryStatus = useCallback(async () => {
    if (!user || user.role !== "delivery") {
      return Promise.resolve(null);
    }

    // ✅ ADD: Rate limiting to prevent rapid refreshes
    const now = Date.now();
    if (now - lastRefreshTime < 3000) {
      // Minimum 3 seconds between refreshes
      console.log("⏰ Skipping refresh - too soon since last refresh");
      return Promise.resolve(null);
    }

    setLastRefreshTime(now);

    try {
      console.log("🚚 Refreshing delivery status for user:", user.email);
      console.log("🔑 Has token:", !!token);

      let statusData;

      // Try authenticated API first if user has token
      if (token) {
        try {
          console.log("✅ Using authenticated API");
          const response = await api.get("/delivery-status");
          statusData = response.data;
          console.log("📡 Auth API returned:", statusData);
        } catch (authError) {
          console.warn(
            "⚠️ Auth API failed, falling back to public API:",
            authError.response?.status
          );

          // Clear invalid token
          if (authError.response?.status === 401) {
            setToken(null);
          }

          // Fallback to public API
          statusData = await checkPublicDeliveryStatus(user.email);
        }
      } else {
        console.log("📡 Using public API (no token)");
        statusData = await checkPublicDeliveryStatus(user.email);
      }

      const newStatus = statusData.deliveryStatus;
      const currentStatus = deliveryStatus;

      console.log("🔄 Status comparison:", {
        newStatus,
        currentStatus,
        userApproved: user.isApproved,
      });

      // ✅ FIXED: Only update if status actually changed
      if (newStatus !== currentStatus) {
        setDeliveryStatus(newStatus);
        console.log(`📝 Status updated: ${currentStatus} → ${newStatus}`);
      }

      // ✅ ENHANCED: Handle all status changes without triggering more refreshes
      if (
        newStatus === "approved" &&
        (currentStatus !== "approved" || !user.isApproved)
      ) {
        console.log("🎉 User was approved! Updating session data only...");

        const approvedData = {
          user: {
            ...user,
            isApproved: true,
            declineReason: undefined,
            declinedAt: undefined,
            attachments: {
              ...user.attachments,
              declineReason: undefined,
              declinedAt: undefined,
              revokeReason: undefined,
              revokedAt: undefined,
              approvedAt: statusData.approvedAt,
              status: "approved",
            },
          },
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
      }
      // ✅ ADD: Handle revoked status
      else if (newStatus === "revoked" && currentStatus !== "revoked") {
        console.log("🚫 User was revoked! Updating session data...");

        const updatedUser = {
          ...user,
          isApproved: false,
          attachments: {
            ...user.attachments,
            revokeReason: statusData.revokeReason,
            revokedAt: statusData.revokedAt,
            status: "revoked",
          },
        };

        setUser(updatedUser);

        const revokeData = {
          user: updatedUser,
          deliveryStatus: "revoked",
          revokeReason: statusData.revokeReason,
          revokedAt: statusData.revokedAt,
          activeOrdersCount: statusData.activeOrdersCount || 0,
          canReapply: statusData.canReapply || true,
          message: "Access revoked",
        };

        sessionStorage.setItem("deliveryUserData", JSON.stringify(revokeData));
      } else if (newStatus === "declined" && currentStatus !== "declined") {
        console.log("❌ User was declined! Updating session data...");

        const updatedUser = {
          ...user,
          isApproved: false,
          declineReason: statusData.declineReason,
          declinedAt: statusData.declinedAt,
          attachments: {
            ...user.attachments,
            declineReason: statusData.declineReason,
            declinedAt: statusData.declinedAt,
            status: "declined",
          },
        };

        setUser(updatedUser);

        // Clear token for declined users
        if (token) {
          setToken(null);
        }

        const declineData = {
          user: updatedUser,
          deliveryStatus: "declined",
          declineReason: statusData.declineReason,
          declinedAt: statusData.declinedAt,
          canReapply: statusData.canReapply || true,
          message: "Application declined",
        };

        sessionStorage.setItem("deliveryUserData", JSON.stringify(declineData));
      } else if (newStatus === "pending" && currentStatus !== "pending") {
        console.log("⏳ Status changed to pending");

        const updatedUser = {
          ...user,
          isApproved: false,
          // Clear previous decline/revoke data
          declineReason: undefined,
          declinedAt: undefined,
          attachments: {
            ...user.attachments,
            declineReason: undefined,
            declinedAt: undefined,
            revokeReason: undefined,
            revokedAt: undefined,
            status: "pending",
          },
        };

        setUser(updatedUser);

        const pendingData = {
          user: updatedUser,
          deliveryStatus: "pending",
          declineReason: "",
          declinedAt: "",
          revokeReason: "",
          revokedAt: "",
          canReapply: false,
          message: "Application pending",
        };

        sessionStorage.setItem("deliveryUserData", JSON.stringify(pendingData));
      }

      return statusData;
    } catch (err) {
      console.error("❌ Failed to refresh delivery status:", err);
      throw err;
    }
  }, [
    user,
    token,
    deliveryStatus,
    setUser,
    setToken,
    setDeliveryStatus,
    checkPublicDeliveryStatus,
    lastRefreshTime,
  ]);

  const validateSession = useCallback(async () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) setUserState(JSON.parse(storedUser));
    if (storedToken) {
      setToken(storedToken);
      try {
        await api.get("/auth/validate");
        console.log("✅ Session validated");
      } catch {
        console.warn("⚠️ Session validation failed");
      }
    }
  }, [setToken]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await validateSession();
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, [validateSession, logout]);

  useEffect(() => {
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        setTokenState(e.newValue);
        setAccessToken(e.newValue);
      }
      if (e.key === "user") {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        setUserState(newUser);

        if (newUser?.role === "delivery") {
          // Determine status from user data
          let status = "pending";
          if (newUser.isApproved === true) {
            status = "approved";
          } else if (
            newUser.declineReason ||
            newUser.attachments?.declineReason
          ) {
            status = "declined";
          }
          setDeliveryStatus(status);
        } else {
          setDeliveryStatus(null);
        }
      }
    };

    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, [setToken, setDeliveryStatus]);

  // ✅ IMPROVED: Better focus-based refresh
  useEffect(() => {
    const handleFocus = async () => {
      if (user?.role === "delivery" && !isLoading) {
        const now = Date.now();
        if (now - lastRefreshTime > 5000) {
          // Only refresh if last refresh was more than 5 seconds ago
          console.log("👀 Window focused - refreshing delivery status");
          setTimeout(() => {
            refreshDeliveryStatus().catch(console.error);
          }, 1000);
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, isLoading, refreshDeliveryStatus, lastRefreshTime]);

  const computedValues = useMemo(
    () => ({
      isAdmin: user?.role === "admin",
      isDelivery: user?.role === "delivery",
      isApprovedDelivery:
        user?.role === "delivery" && user?.isApproved === true,
      isPendingOrDeclinedDelivery:
        user?.role === "delivery" && user?.isApproved !== true,
    }),
    [user]
  );

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      token,
      setToken,
      logout,
      isLoading,
      refreshAccessToken,
      deliveryStatus,
      setDeliveryStatus,
      refreshDeliveryStatus,
      checkPublicDeliveryStatus,
userRewards,
    setUserRewards,
      ...computedValues,
    }),
    [
      user,
      setUser,
      token,
      setToken,
      logout,
      isLoading,
      refreshAccessToken,
      deliveryStatus,
      setDeliveryStatus,
      refreshDeliveryStatus,
      checkPublicDeliveryStatus,
      computedValues,
    ]
  );

  return (
    <UserAuthContext.Provider value={contextValue}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
};
