"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id?: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  imageUrl?: string;
  isAuthenticated?: boolean;
}

interface UserAuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
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

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
  }, []);

  const setUser = (user: User | null) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    setUserState(user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUserState(null);
  };

  return (
    <UserAuthContext.Provider value={{ user, setUser, logout }}>
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
