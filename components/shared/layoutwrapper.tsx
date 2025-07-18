"use client";

import { ReactNode } from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useContext } from "react";
import { UserAuthContext } from "@/context/AuthFormContext";
import { ToastContainer } from "react-toastify";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const { user } = useContext(UserAuthContext) ?? {};

  const isAdmin = user?.role === "admin";

  return (
    <>
      {!isAdmin && <Navbar />}
      <ToastContainer />
      {children}
      {!isAdmin && <Footer />}
    </>
  );
}
