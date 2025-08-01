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
import { User } from "@/components/Types/Auser.type";

// === Context Shape ===
interface UserAuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isLoading: boolean;
  refreshAccessToken: () => Promise<void>;
  deliveryStatus: string | null;
  refreshDeliveryStatus: () => Promise<void>;
  // Helper computed properties
  isAdmin: boolean;
  isDelivery: boolean;
  isApprovedDelivery: boolean;
  isPendingOrDeclinedDelivery: boolean;
}

// === Create Context ===
export const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined
);

// === Provider ===
export const UserAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const router = useRouter();

  // -- Helpers --

  const setUser = useCallback((user: User | null) => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
    setUserState(user);

    // Clear delivery status if user is not delivery or is null
    if (!user || user.role !== "delivery") {
      setDeliveryStatus(null);
    } else {
      setDeliveryStatus(user.isApproved ? "approved" : "pending");
    }
  }, []);

  const setToken = useCallback((token: string | null) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    setAccessToken(token); // Sync to axios instance
    setTokenState(token);
  }, []);

  const logout = useCallback(() => {
    console.log("🔓 Logging out...");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("deliveryUserData"); // Clear delivery data
    setUserState(null);
    setTokenState(null);
    setDeliveryStatus(null);
    setAccessToken(null);
    delete api.defaults.headers.common["Authorization"];
    router.push("/");
  }, [router]);

  const refreshAccessToken = useCallback(async () => {
    try {
      console.log("🔄 Refreshing token...");
      await api.post("/auth/refresh"); // interceptor handles token update
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
  }, [logout]);

// Updated refreshDeliveryStatus function in your AuthFormContext.tsx:

const refreshDeliveryStatus = useCallback(async () => {
  if (!user || user.role !== "delivery") return;

  try {
    console.log("🚚 Refreshing delivery status for user:", user.email);
    console.log("🔍 Current user approved status:", user.isApproved);
    console.log("🔑 Has token:", !!token);

    // ✅ Try API call if user has a token (should only be approved users)
    if (token) {
      console.log("✅ User has token - calling API");
      
      const response = await api.get("/delivery-status");
      const apiData = response.data;
      
      console.log("📡 API returned:", apiData);
      
      // Get the actual status from API response
      const newStatus = apiData.deliveryStatus;
      const newApprovalState = newStatus === "approved";
      
      console.log("🔄 Status from API:", {
        newStatus,
        newApprovalState,
        currentStatus: deliveryStatus,
        currentApproved: user.isApproved
      });
      
      // Update delivery status in context
      setDeliveryStatus(newStatus);
      
      // Check if status changed
      if (newStatus !== deliveryStatus || newApprovalState !== user.isApproved) {
        console.log("✨ Status changed! Updating user...");
        
        const updatedUser = { 
          ...user, 
          isApproved: newApprovalState,
          // Add decline data if declined
          ...(newStatus === "declined" && {
            declineReason: apiData.declineReason,
            declinedAt: apiData.declinedAt
          }),
          // Clear decline data if approved
          ...(newStatus === "approved" && {
            declineReason: undefined,
            declinedAt: undefined
          })
        };
        
        setUser(updatedUser);
        
        if (newStatus === "approved") {
          console.log("✅ User approved! Clearing old data and redirecting...");
          sessionStorage.removeItem("deliveryUserData");
          router.push("/deliverydashboard");
          return apiData;
        } else if (newStatus === "declined") {
          console.log("❌ User was declined! Clearing token and updating session...");
          
          // ✅ Clear token for declined users
          setToken(null);
          
          const declineData = {
            user: updatedUser,
            deliveryStatus: "declined",
            declineReason: apiData.declineReason,
            declinedAt: apiData.declinedAt,
            canReapply: true,
            message: "Application declined"
          };
          sessionStorage.setItem("deliveryUserData", JSON.stringify(declineData));
          
          // Force reload to show decline UI
          window.location.reload();
          return apiData;
        }
      }
      
      return apiData;
    } else {
      console.log("📦 No token - determining status from user data");
      
      // For users without tokens, determine status from user object
      let currentStatus = "pending";
      
      if (user.isApproved === true) {
        // This shouldn't happen - approved users should have tokens
        console.warn("⚠️ Approved user without token - this is unexpected");
        currentStatus = "approved";
      } else if (user.declineReason || user.attachments?.declineReason) {
        currentStatus = "declined";
      }
      
      console.log("🔄 Setting status based on user data:", currentStatus);
      setDeliveryStatus(currentStatus);
      
      return {
        deliveryStatus: currentStatus,
        user: user,
        declineReason: user.declineReason || user.attachments?.declineReason,
        declinedAt: user.declinedAt || user.attachments?.declinedAt,
        canReapply: true
      };
    }
    
  } catch (err) {
    console.error("❌ Failed to refresh delivery status:", err);
    
    if (err.response?.status === 401) {
      console.log("🔓 Unauthorized - clearing token and treating as declined/pending");
      
      // Clear invalid token
      setToken(null);
      
      // Determine status from user data
      let fallbackStatus = "pending";
      if (user.declineReason || user.attachments?.declineReason) {
        fallbackStatus = "declined";
      }
      
      setDeliveryStatus(fallbackStatus);
      return {
        deliveryStatus: fallbackStatus,
        user: user
      };
    }
    
    throw err;
  }
}, [user, token, deliveryStatus, setUser, setToken, setDeliveryStatus, router]);
  const validateSession = useCallback(async () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) setUserState(JSON.parse(storedUser));
    if (storedToken) {
      setToken(storedToken);
      try {
        await api.get("/auth/validate"); // ✅ Trigger interceptor
        console.log("✅ Session validated");
      } catch {
        console.warn("⚠️ Session validation failed (interceptor handles it)");
      }
    }
  }, []);
  // -- Effects --
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

  // Storage event listener to sync auth between tabs
  useEffect(() => {
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        setTokenState(e.newValue);
      }
      if (e.key === "user") {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        setUserState(newUser);
        if (newUser?.role === "delivery") {
          setDeliveryStatus(newUser.isApproved ? "approved" : "pending");
          // Token only set if approved (will sync from token key)
        } else {
          setDeliveryStatus(null);
          setToken(null);
        }
      }
    };

    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, [setToken]);

  // Refresh delivery status on window focus, only if user is delivery and approved with token
  useEffect(() => {
    const handleFocus = () => {
      if (
        user?.role === "delivery" &&
        user.isApproved === true &&
        token &&
        !isLoading
      ) {
        setTimeout(() => {
          refreshDeliveryStatus();
        }, 1000);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, token, isLoading, refreshDeliveryStatus]);

  // Computed properties
  const computedValues = useMemo(
    () => ({
      isAdmin: user?.role === "admin",
      isDelivery: user?.role === "delivery",
      isApprovedDelivery: user?.role === "delivery" && user?.isApproved === true,
      isPendingOrDeclinedDelivery:
        user?.role === "delivery" && user?.isApproved !== true,
    }),
    [user]
  );

  // Memoize context value
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
      refreshDeliveryStatus,
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
      refreshDeliveryStatus,
      computedValues,
    ]
  );

  return (
    <UserAuthContext.Provider value={contextValue}>
      {children}
    </UserAuthContext.Provider>
  );
};

// === Hook ===
export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
};
