// components/shared/AuthRedirectHandler.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserAuth } from "@/context/AuthFormContext";

const AuthRedirectHandler = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isLoading } = useUserAuth();
  const hasRedirected = useRef(false);
  const lastPath = useRef(pathname);
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset redirect flag when path actually changes
    if (lastPath.current !== pathname) {
      hasRedirected.current = false;
      lastPath.current = pathname;

      // Clear any pending redirects
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
        redirectTimeout.current = null;
      }
    }
  }, [pathname]);

  useEffect(() => {
    // Skip if loading or already redirected
    if (isLoading || hasRedirected.current) return;

    console.log("🔍 Auth Redirect Check:", {
      pathname,
      user: user?.email,
      role: user?.role,
      isApproved: user?.isApproved,
      hasToken: !!token,
    });

    // Define route categories
    const publicRoutes = ["/login", "/register", "/auth", "/auth", "/"];
    const deliveryRoutes = ["/deliveryDashboard", "/deilveryDashboard"]; // Include both spellings
    const adminRoutes = ["/admin/dashboard"];
    const waitingRoute = "/waitingforapproval";

    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    const isDeliveryRoute = deliveryRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    const isAdminRoute = adminRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/admin")
    );
    const isWaitingRoute =
      pathname === waitingRoute || pathname.startsWith(waitingRoute + "/");

    console.log("🔍 Route checks:", {
      isPublicRoute,
      isDeliveryRoute,
      isAdminRoute,
      isWaitingRoute,
    });

    // Helper function to safely redirect with timeout
    const safeRedirect = (path: string, reason: string) => {
      console.log(`🔄 ${reason} - Redirecting to: ${path}`);
      hasRedirected.current = true;

      // Use a small timeout to prevent immediate re-renders
      redirectTimeout.current = setTimeout(() => {
        router.replace(path);
      }, 100);
    };

    // No user/token - redirect to login (except for public routes)
    if ((!user || !token) && !isPublicRoute && !isWaitingRoute) {
      safeRedirect("/auth", "No authentication");
      return;
    }

    // User exists - handle role-based logic
    if (user && token) {
      console.log("👤 Authenticated user detected, role:", user.role);

      switch (user.role) {
        case "admin":
          console.log("👑 Admin user");
          if (!isAdminRoute) {
            safeRedirect("/admin/dashboard", "Admin user not on admin route");
          } else {
            console.log("✅ Admin on correct route");
          }
          break;

        case "delivery":
          console.log("🚚 Delivery user, approved:", user.isApproved);

          if (user.isApproved === true) {
            // Approved delivery users
            console.log("✅ Approved delivery user");

            if (isWaitingRoute) {
              // If approved user is on waiting page, redirect to dashboard
              safeRedirect(
                "/deilveryDashboard",
                "Approved user on waiting page"
              );
            } else if (isAdminRoute) {
              // If approved delivery user tries to access admin, redirect to dashboard
              safeRedirect(
                "/deilveryDashboard",
                "Approved delivery user on admin route"
              );
            } else if (!isDeliveryRoute && !isPublicRoute) {
              // If not on delivery or public routes, redirect to dashboard
              safeRedirect(
                "/deilveryDashboard",
                "Approved delivery user on restricted route"
              );
            } else {
              console.log("✅ Approved delivery user on allowed route");
            }
          } else {
            // Non-approved delivery users (pending/declined)
            console.log("❌ Non-approved delivery user");

            if (isDeliveryRoute || isAdminRoute) {
              // Non-approved users can't access delivery or admin routes
              safeRedirect(
                "/waitingforapproval",
                "Non-approved user on restricted route"
              );
            } else if (!isWaitingRoute && !isPublicRoute) {
              // Non-approved users should be on waiting page
              safeRedirect(
                "/waitingforapproval",
                "Non-approved user not on waiting page"
              );
            } else {
              console.log("✅ Non-approved delivery user on allowed route");
            }
          }
          break;

        case "customer":
          console.log("🛒 Customer user");

          if (isAdminRoute || isDeliveryRoute || isWaitingRoute) {
            // Customers can't access restricted routes
            safeRedirect("/", "Customer on restricted route");
          } else {
            console.log("✅ Customer on allowed route");
          }
          break;

        default:
          console.log("👤 Other user role:", user.role);

          // For other roles, only restrict admin/delivery routes
          if (isAdminRoute || isDeliveryRoute || isWaitingRoute) {
            safeRedirect("/", "Non-admin/delivery user on restricted route");
          } else {
            console.log("✅ User on allowed route");
          }
      }
    }

    // Cleanup function
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
        redirectTimeout.current = null;
      }
    };
  }, [user, token, isLoading, pathname, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
        redirectTimeout.current = null;
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default AuthRedirectHandler;
