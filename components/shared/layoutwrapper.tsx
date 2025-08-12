"use client";

import { ReactNode, useContext, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "../common/Footer";
import { ToastContainer } from "react-toastify";
import { UserAuthContext } from "@/context/AuthFormContext";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, isLoading } = useContext(UserAuthContext) ?? {};

  // === Computed Roles ===
  const isAdmin = user?.role === "admin";
  const isDelivery = user?.role === "delivery";
  const isBuyer = user?.role === 'buyer';

  // Define restricted routes for buyers (routes they should NOT access)
  const buyerRestrictedRoutes = [
    "/admin",
    "/deilveryDashboard", 
    "/waiting-for-approval",
    // Add any specific routes that buyers should NOT access
  ];
const approvedDeliveryAllowedRoutes = [
  "/deilveryDashboard",
  "/edit-profile"
];

  // Define routes that are considered "entry points" where we should redirect buyers to /home
  const entryRoutes = ["/", "/login", "/register", "/auth"];

  // Check if current path is restricted for buyers
  const isBuyerRestrictedRoute = useMemo(() => {
    if (!isBuyer) return false; // Not a buyer, so no restrictions
    
    return buyerRestrictedRoutes.some(route => 
      pathname.startsWith(route)
    );
  }, [isBuyer, pathname, buyerRestrictedRoutes]);

  // ✅ Use fallback to isApproved if deliveryStatus is not yet set
  const isPendingOrDeclined = useMemo(() => {
    return (
      user?.role === "delivery" &&
      (user?.isApproved === false ||
        user?.deliveryStatus === "pending" ||
        user?.deliveryStatus === "declined")
    );
  }, [user?.role, user?.isApproved, user?.deliveryStatus]);

  const isApprovedDelivery = useMemo(() => {
    return (
      user?.role === "delivery" &&
      (user?.isApproved === true || user?.deliveryStatus === "accepted")
    );
  }, [user?.role, user?.isApproved, user?.deliveryStatus]);

  useEffect(() => {
    if (isLoading || !user) return;

    // Handle buyer routing
    if (isBuyer) {
      // Only redirect to /home from specific entry routes (first login scenario)
      const isOnEntryRoute = entryRoutes.some(route => {
        if (route === "/") {
          return pathname === "/"; // Exact match for root
        }
        return pathname.startsWith(route);
      });
      
      if (isOnEntryRoute && pathname !== "/home") {
        router.push("/home");
        return;
      }
      
      // Restrict access to specific routes
      if (isBuyerRestrictedRoute) {
        router.push("/home");
        return;
      }
    }

    // Handle admin routing
    if (isAdmin && !pathname.startsWith("/admin")) {
      router.push("/admin/dashboard");
      return;
    }

 // Handle delivery routing
if (isDelivery) {
  if (isPendingOrDeclined && !pathname.startsWith("/waiting-for-approval")) {
    router.push("/waiting-for-approval");
    return;
  }

  if (isApprovedDelivery) {
    const approvedDeliveryAllowedRoutes = [
      "/deilveryDashboard",
      "/editprofile"
    ];
    
    const isAllowedRoute = approvedDeliveryAllowedRoutes.some(route =>
      pathname.startsWith(route)
    );

    if (!isAllowedRoute) {
      router.push("/deilveryDashboard");
      return;
    }
  }
}

    
  }, [
    user,
    isAdmin,
    isDelivery,
    isPendingOrDeclined,
    isApprovedDelivery,
    pathname,
    router,
    isLoading,
    isBuyer,
    isBuyerRestrictedRoute
  ]);

  if (isLoading) return null;

  const shouldHideLayout = isAdmin || isDelivery;

  return (
    <>
      {!shouldHideLayout && <Navbar />}
      <ToastContainer />
      {children}
      {!shouldHideLayout && <Footer />}
    </>
  );
}