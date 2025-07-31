"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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
  const router = useRouter();

  // -- Helpers --

  const setUser = (user: User | null) => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
    setUserState(user);
  };

  const setToken = (token: string | null) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    setAccessToken(token); // Sync to axios instance
    setTokenState(token);
  };

  const logout = useCallback(() => {
    console.log("🔓 Logging out...");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserState(null);
    setTokenState(null);
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

  useEffect(() => {
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === "token") setTokenState(e.newValue);
      if (e.key === "user") {
        setUserState(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (user && token) validateSession();
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

// === Hook ===
export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
};
