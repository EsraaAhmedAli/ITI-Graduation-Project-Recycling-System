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

    if (isAdmin && !pathname.startsWith("/admin")) {
      router.push("/admin/dashboard");
      return;
    }

    if (isDelivery) {
      if (isPendingOrDeclined && !pathname.startsWith("/waiting-for-approval")) {
        router.push("/waiting-for-approval");
        return;
      }

      if (isApprovedDelivery && !pathname.startsWith("/deilveryDashboard")) {
        router.push("/deilveryDashboard");
        return;
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
