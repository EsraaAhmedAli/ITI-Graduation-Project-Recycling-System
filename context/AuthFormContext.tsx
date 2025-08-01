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
  const [deliveryStatus, setDeliveryStatusState] = useState<string | null>(null);
  const router = useRouter();

  const setUser = useCallback((user: User | null) => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
    setUserState(user);

    if (!user || user.role !== "delivery") {
      setDeliveryStatusState(null);
    } else {
      // Set initial status based on user data
      let status = "pending";
      if (user.isApproved === true) {
        status = "approved";
      } else if (user.declineReason || user.attachments?.declineReason) {
        status = "declined";
      }
      setDeliveryStatusState(status);
    }
  }, []);

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
    setDeliveryStatusState(null);
    setAccessToken(null);
    delete api.defaults.headers.common["Authorization"];
    router.push("/");
  }, [router]);

  // ✅ NEW: Public status check for users without tokens
  const checkPublicDeliveryStatus = useCallback(async (email: string) => {
    try {
      console.log("📡 Checking public delivery status for:", email);
      
      // Use axios for consistency with the rest of the app
      const response = await api.post('/auth/check-delivery-status', { email });
      console.log("📡 Public API returned:", response.data);
      
      return response.data;
    } catch (error) {
      console.error("❌ Public API error:", error);
      
      // Handle axios error format
      if (error.response) {
        throw new Error(`HTTP ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network error: No response received');
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
    if (!user || user.role !== "delivery") return;

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
          console.warn("⚠️ Auth API failed, falling back to public API:", authError.response?.status);
          
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
      
      console.log("🔄 Status comparison:", { newStatus, currentStatus, userApproved: user.isApproved });

      // Update delivery status
      setDeliveryStatus(newStatus);

      // Handle approval - REMOVED ALERT AND LOGOUT
 // Handle approval - UPDATE STATUS BUT DON'T UPDATE USER CONTEXT YET
if (newStatus === "approved" && (currentStatus !== "approved" || !user.isApproved)) {
  console.log("🎉 User was approved! Updating session data only (not user context to prevent redirects)...");
  
  // Update session storage to show approval, but DON'T update user context
  // This prevents any other components from detecting the approval and redirecting
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
        approvedAt: statusData.approvedAt
      }
    },
    deliveryStatus: "approved",
    declineReason: "",
    declinedAt: "",
    canReapply: false,
    message: "Application approved"
  };
  
  sessionStorage.setItem("deliveryUserData", JSON.stringify(approvedData));
  
  // DON'T call setUser() here to prevent other components from detecting approval
  // The waiting page component will handle showing the approval UI
  
  return statusData;
}
      else if (newStatus === "declined" && currentStatus !== "declined") {
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
            status: "declined"
          }
        };
        
        setUser(updatedUser);
        
        // Clear token for declined users
        if (token) {
          setToken(null);
        }
        
        // Update session storage
        const declineData = {
          user: updatedUser,
          deliveryStatus: "declined",
          declineReason: statusData.declineReason,
          declinedAt: statusData.declinedAt,
          canReapply: statusData.canReapply || true,
          message: "Application declined"
        };
        
        sessionStorage.setItem("deliveryUserData", JSON.stringify(declineData));
        
    
      }
      else if (newStatus === "pending" && currentStatus !== "pending") {
        console.log("⏳ Status changed to pending");
        
        const updatedUser = { 
          ...user, 
          isApproved: false,
          // Clear decline data if it was declined before
          declineReason: undefined,
          declinedAt: undefined
        };
        
        setUser(updatedUser);
        
        // Clear any decline session data
        const storedData = sessionStorage.getItem("deliveryUserData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const updatedData = {
            ...parsedData,
            deliveryStatus: "pending",
            declineReason: "",
            declinedAt: "",
            user: updatedUser
          };
          sessionStorage.setItem("deliveryUserData", JSON.stringify(updatedData));
        }
      }

      return statusData;
      
    } catch (err) {
      console.error("❌ Failed to refresh delivery status:", err);
      throw err;
    }
  }, [user, token, deliveryStatus, setUser, setToken, setDeliveryStatus, checkPublicDeliveryStatus]);

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
          } else if (newUser.declineReason || newUser.attachments?.declineReason) {
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
        console.log("👀 Window focused - refreshing delivery status");
        setTimeout(() => {
          refreshDeliveryStatus().catch(console.error);
        }, 1000);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, isLoading, refreshDeliveryStatus]);

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
