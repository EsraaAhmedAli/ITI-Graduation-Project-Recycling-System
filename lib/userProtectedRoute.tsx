// lib/ProtectedRoute.tsx or components/common/ProtectedRoute.tsx
"use client";

import Loader from "@/components/common/Loader";
import { useUserAuth } from "@/context/AuthFormContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // e.g. ['admin'], ['customer'], etc.
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, token, isLoading } = useUserAuth();
  const router = useRouter();
  const [showDenied, setShowDenied] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // 1. Not authenticated
      if (!user || !token) {
        router.replace("/auth");
        return;
      }

      // 2. Authenticated but not allowed role
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        setShowDenied(true);
        setTimeout(() => {
          router.replace("/unauthorized");
        }, 2000);
      }
    }
  }, [user, token, isLoading, router, allowedRoles]);

  if (isLoading) {
    return <Loader />;
  }

  if (!user || !token) {
    return null; // prevent flash
  }

  if (showDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access this page
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
