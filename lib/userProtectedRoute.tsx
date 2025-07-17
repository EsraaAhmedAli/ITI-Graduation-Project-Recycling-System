"use client";

import { useUserAuth } from "@/context/AuthFormContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, token, isLoading } = useUserAuth();
  const router = useRouter();
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !token)) {
      setShowLoginMessage(true);
      // Optional: Add a delay before redirecting
      const timer = setTimeout(() => {
        router.push("/auth");
      }, 2000); // Redirect after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [user, token, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user is not authenticated, show login message
  if (!user || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please login first to access this page</p>
          <button
            onClick={() => router.push("/auth")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If user is authenticated
  return <>{children}</>;
};