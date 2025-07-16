"use client";

import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import api from "@/services/api";

// === User Type ===
interface User {
  id?: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  imageUrl?: string;
  isAuthenticated?: boolean;
  _id: number;
  name: string;
}

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
export const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

// === Provider Component ===
export const UserAuthProvider = ({ children }: { children: React.ReactNode }) => {
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
    } else {
      localStorage.removeItem("token");
    }
    setTokenState(token);
  };



  // ✅ Logout
  const logout = () => {
    console.log("✅ Logging out");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserState(null);
    setTokenState(null);
    router.push("/");
  };

  // ✅ Load user + token on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
    if (storedToken) {
      setTokenState(storedToken);
    }

    if (storedUser && !storedToken) {
      // User exists but no token? Try to refresh
      refreshAccessToken()
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);
  const refreshAccessToken = async () => {
  try {
    const res = await api.get('/auth/refresh', { withCredentials: true });
    const newToken = res.data.accessToken;
    localStorage.setItem('token', newToken);
    setToken(newToken);
  } catch (err) {
    console.error("Error refreshing:", err);
    logout();
  }
};


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
