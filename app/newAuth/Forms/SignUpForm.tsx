"use client";

import { useAuthenticationContext } from "@/context/AuhenticationContext";
import BasicInfo from "../common/BasicInfo";
import CustomerSteps from "../customer/CustomerSteps";
import DeliverySteps from "../delivery/DeliverySteps";
import BuyerSteps from "../steps/BuyerSteps";
import SocialButtons from "../common/socialSection";
import OTPInput from "@/app/newAuth/common/OtpStep";
import { useLanguage } from "@/context/LanguageContext";

export default function SignUpForm() {
  const { step, selectedRole, setMode, GoogleUser } =
    useAuthenticationContext();
  const { t } = useLanguage();

  const renderRoleSpecificFields = () => {
    switch (selectedRole) {
      case "customer":
        return <CustomerSteps />;
      case "delivery":
        return <DeliverySteps />;
      case "buyer":
        return <BuyerSteps />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Form */}
      {step === 1 && <BasicInfo />}
      {step === 2 && <OTPInput comeFrom="signup" />}
      {step > 2 && renderRoleSpecificFields()}

      {/* Social Login (First Step Only) */}
      {step === 1 && GoogleUser?.email === undefined && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {t("auth.login.continueWith")}
              </span>
            </div>
          </div>
          <SocialButtons />
        </>
      )}

      {/* Footer Link */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setMode("login");
          }}
          className="text-sm text-primary hover:underline"
        >
          {t("auth.login.already")}
        </button>
      </div>
    </div>
  );
}
