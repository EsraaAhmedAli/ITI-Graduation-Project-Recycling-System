"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { User, Truck, ShoppingCart, Shield } from "lucide-react";
import Wrapper from "@/components/auth/Wrapper";
import { AuthenticationProvider } from "@/context/AuhenticationContext";
import MainForm from "./Forms/MainForm";
import { useRouter } from "next/navigation";

export const roleConfig = {
  customer: {
    title: "Customer Registration",
    description: "Join our recycling community",
    icon: <User className="w-6 h-6" />,
    color: "bg-green-500",
    steps: 2,
  },
  delivery: {
    title: "Delivery Partner Registration",
    description: "Become a verified delivery partner",
    icon: <Truck className="w-6 h-6" />,
    color: "bg-blue-500",
    steps: 3,
  },
  buyer: {
    title: "Business Buyer Registration",
    description: "Register your business to purchase recycled materials",
    icon: <ShoppingCart className="w-6 h-6" />,
    color: "bg-purple-500",
    steps: 3,
  },
  admin: {
    title: "Admin Registration",
    description: "Administrative access registration",
    icon: <Shield className="w-6 h-6" />,
    color: "bg-red-500",
    steps: 2,
  },
};
export type Role = keyof typeof roleConfig;
type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const methods = useForm({
    defaultValues: { otp: Array(6).fill("") },
    mode: "all",
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
