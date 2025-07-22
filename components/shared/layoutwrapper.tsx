"use client";

import { ReactNode, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import { UserAuthContext } from "@/context/AuthFormContext";
import { ToastContainer } from "react-toastify";
import Footer from "../common/Footer";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user,isLoading } = useContext(UserAuthContext) ?? {};
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      router.push("/admin/dashboard");
    }
  }, [isAdmin, router]);
if (isLoading) return null; // or a spinner

  return (
    <>
      {!isAdmin && <Navbar />}
      <ToastContainer />
      {children}
      {!isAdmin && <Footer/>}
    </>
  );
}
