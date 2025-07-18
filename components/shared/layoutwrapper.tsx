"use client";

import { ReactNode, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { UserAuthContext } from "@/context/AuthFormContext";
import { ToastContainer } from "react-toastify";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useContext(UserAuthContext) ?? {};
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      router.push("/admin/dashboard");
    }
  }, [isAdmin, router]);

  return (
    <>
      {!isAdmin && <Navbar />}
      <ToastContainer />
      {children}
      {!isAdmin && <Footer />}
    </>
  );
}
