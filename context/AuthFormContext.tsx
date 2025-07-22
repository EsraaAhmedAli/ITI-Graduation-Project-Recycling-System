"use client";

import api from "@/lib/axios";
import { setAccessToken } from "@/lib/axios";

import { useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User } from "@/components/Types/Auser.type";

// === User Type ===
// interface User {
//   id: string;
//   fullName: string;
//   email: string;
//   phoneNumber: string;
//   password?: string;
//   provider?: "google" | "facebook" | "none";
//   role?: "admin" | "customer" | "buyer" | "delivery";
//   isGuest: boolean;
//   imgUrl?: string;
//   createdAt?: string; // or Date if you parse it
//   updatedAt?: string; // or Date if you parse it
// }

// === Context Type ===
interface UserAuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isLoading: boolean;
  refreshAccessToken: () => Promise<void>;
}

// === Create Context ===
export const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined
);

// === Provider Component ===
export const UserAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();

  // ✅ Store/Remove user in localStorage
  const setUser = (user: User | null) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    setUserState(user);
  };

  // ✅ Store/Remove token in localStorage
  const setToken = (token: string | null) => {
    if (token) {
      localStorage.setItem("token", token);
      setAccessToken(token); // 👈 ADD THIS
    } else {
      localStorage.removeItem("token");
      setAccessToken(null); // 👈 Clear token in memory
    }
    setTokenState(token);
  };

  // ✅ Logout - clears everything and redirects
  const logout = useCallback(async () => {
    console.log("✅ Logging out");
    // await api.post("/auth/logout");

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUserState(null);
    setTokenState(null);
    // Clear axios default headers
    delete api.defaults.headers.common["Authorization"];
    router.push("/");
  }, [router]);

  // ✅ Manual refresh token - delegates to your axios interceptor
  const refreshAccessToken = useCallback(async () => {
    try {
      console.log("🔄 Attempting to refresh access token...");
      // Make any authenticated request to trigger the interceptor
      // The interceptor will handle the token refresh automatically
      const response = await api.post("/auth/refresh");

      // Update local state with the new token
      const newToken = localStorage.getItem("token");
      if (newToken) {
        setTokenState(newToken);
        console.log("✅ Token refreshed successfully");
      } else {
        throw new Error("No token found after refresh");
      }
    } catch (err) {
      console.error("❌ Error refreshing token:", err);
      logout();
    }
  }, [logout]);

  // ✅ Check if user session is still valid
  const validateSession = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }

    if (storedToken) {
      setTokenState(storedToken);
      setAccessToken(storedToken);

      try {
        // Make a simple authenticated request to validate the token
        // If token is expired, the interceptor will handle refresh automatically
        await api.get("/auth/validate"); // or any protected endpoint
        console.log("✅ Session is valid");
      } catch (error) {
        console.log(
          "⚠️ Session validation failed, but interceptor should handle it"
        );
        // The interceptor will handle token refresh, so we don't need to do anything here
      }
    }
  }, []);

  // ✅ Load user + token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await validateSession();
      } catch (error) {
        console.error("❌ Error initializing auth:", error);
        // Clear everything on error
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUserState(null);
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [validateSession]);

  // ✅ Listen for token changes in localStorage (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        if (e.newValue) {
          setTokenState(e.newValue);
        } else {
          setTokenState(null);
        }
      }
      if (e.key === "user") {
        if (e.newValue) {
          setUserState(JSON.parse(e.newValue));
        } else {
          setUserState(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Refresh token when app regains focus (optional)
  useEffect(() => {
    const handleFocus = () => {
      if (user && token) {
        // The interceptor will handle token refresh automatically on next request
        // So we just need to make a simple request
        validateSession();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, token, validateSession]);

  return (
    <UserAuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        logout,
        isLoading,
        refreshAccessToken,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

// === Hook to use Context ===
export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
};
