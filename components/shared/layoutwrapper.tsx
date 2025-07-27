"use client";

import { ReactNode, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import { UserAuthContext } from "@/context/AuthFormContext";
import { ToastContainer } from "react-toastify";
import Footer from "../common/Footer";
import { NotificationProvider } from "@/context/notificationContext";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, isLoading } = useContext(UserAuthContext) ?? {};

  const isAdmin = user?.role === "admin";
  const isDelivery = user?.role === "delivery";

  useEffect(() => {
    if (isLoading) return;

    if (isAdmin && !pathname.startsWith("/admin")) {
      router.push("/admin/dashboard");
    } else if (isDelivery && !pathname.startsWith("/delivery")) {
      router.push("/deliveryDashboard");
    }
  }, [isAdmin, isDelivery, isLoading, pathname, router]);

  if (isLoading) return null;

  const shouldHideLayout = isAdmin || isDelivery;

  // Conditionally wrap children with NotificationProvider only if NOT admin
  const content = !isAdmin ? (
    <NotificationProvider>{children}</NotificationProvider>
  ) : (
    children
  );

  return (
    <>
      {!shouldHideLayout && <Navbar />}
      <ToastContainer />

      {content}

      {!shouldHideLayout && <Footer />}
    </>
  );
}
