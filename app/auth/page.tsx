"use client";
import { useState, lazy, Suspense, useMemo, memo } from "react";
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";

// Lazy load heavy components
const Wrapper = lazy(() => import("@/components/auth/Wrapper"));
const AuthenticationProvider = lazy(() =>
  import("@/context/AuhenticationContext").then((module) => ({
    default: module.AuthenticationProvider,
  }))
);
const MainForm = lazy(() => import("./Forms/MainForm"));

// Loading component for the modal
const ModalSkeleton = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
    <div className="relative w-auto max-w-md mx-auto my-6">
      <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none animate-pulse">
        <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="relative p-6 flex-auto space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
    <div className="fixed inset-0 bg-black opacity-25"></div>
  </div>
);

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Memoized modal component to prevent unnecessary re-renders
const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  // Form methods - hooks must be called at the top level
  const methods = useForm({
    defaultValues: { otp: Array(6).fill(""), email: "" },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  if (!isOpen) return null;

  return (
    <Suspense fallback={null}>
      <Wrapper>
        <AuthenticationProvider onClose={onClose}>
          <FormProvider {...methods}>
            <MainForm />
          </FormProvider>
        </AuthenticationProvider>
      </Wrapper>
    </Suspense>
  );
};

// Memoize the AuthModal to prevent unnecessary re-renders
const MemoizedAuthModal = memo(AuthModal);

export default function Authentication() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const router = useRouter();

  // Memoize the close handler
  const handleClose = useMemo(
    () => () => {
      setIsModalOpen(false);
      router.replace("/");
    },
    [router]
  );

  return <MemoizedAuthModal isOpen={isModalOpen} onClose={handleClose} />;
}
