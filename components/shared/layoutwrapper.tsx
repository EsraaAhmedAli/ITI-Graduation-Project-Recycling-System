"use client";

import { ReactNode, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import { UserAuthContext } from "@/context/AuthFormContext";
import { ToastContainer } from "react-toastify";
import Footer from "../common/Footer";

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
    } else if (isDelivery && !pathname.startsWith("/deilvery")) {
      router.push("/deilveryDashboard");
    }
  }, [isAdmin, isDelivery, isLoading, pathname, router]);

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
