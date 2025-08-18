"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Wrapper from "@/components/auth/Wrapper";
import { AuthenticationProvider } from "@/context/AuhenticationContext";
import MainForm from "./Forms/MainForm";
import { useRouter } from "next/navigation";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const methods = useForm({
    defaultValues: { otp: Array(6).fill(""), email: "" },
    mode: "onChange", // don’t nag immediately
    reValidateMode: "onChange", // but fix as soon as user types
  });

  if (!isOpen) return null;

  return (
    <Wrapper>
      <AuthenticationProvider onClose={onClose}>
        <FormProvider {...methods}>
          <MainForm />
        </FormProvider>
      </AuthenticationProvider>
    </Wrapper>
  );
}

export default function Authentication() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const router = useRouter();
  const handleCLose = () => {
    setIsModalOpen(false);
    router.replace("/");
  };

  return <AuthModal isOpen={isModalOpen} onClose={handleCLose} />;
}
