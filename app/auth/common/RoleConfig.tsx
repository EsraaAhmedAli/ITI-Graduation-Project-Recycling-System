import { useLanguage } from "@/context/LanguageContext";
import { User, Truck, ShoppingCart } from "lucide-react";

export const RoleConfig = () => {
  const { t } = useLanguage();

  return {
    customer: {
      title: t("auth.roles.customer.title"),
      description: t("auth.roles.customer.description"),
      icon: <User className="w-6 h-6" />,
      color: "bg-green-500",
      steps: 2,
    },
    delivery: {
      title: t("auth.roles.delivery.title"),
      description: t("auth.roles.delivery.description"),
      icon: <Truck className="w-6 h-6" />,
      color: "bg-blue-500",
      steps: 4,
    },
    buyer: {
      title: t("auth.roles.buyer.title"),
      description: t("auth.roles.buyer.description"),
      icon: <ShoppingCart className="w-6 h-6" />,
      color: "bg-purple-500",
      steps: 2,
    },
  };
};
