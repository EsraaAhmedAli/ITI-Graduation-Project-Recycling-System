"use client";
import React, { createContext, useContext, useState } from "react";

// If you're using TypeScript
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

// Create the context
export const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined
);

export const UserAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);

  const logout = () => setUser(null);

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
