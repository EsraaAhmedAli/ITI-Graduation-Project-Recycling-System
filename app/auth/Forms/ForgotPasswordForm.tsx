import { useAuthenticationContext } from "@/context/AuhenticationContext";
import RoleStepperWithIcons from "../common/RoleStepper";
import OTPInput from "../common/OtpStep";
import EmailInput from "../forgot/EmailInput";
import ResetPasswordForm from "../forgot/ResetForm";
export default function ForgetPasswordForm() {
  const { step, selectedRole } = useAuthenticationContext();

  return (
    <>
      {/* Stepper (role is only used in signup mode, ignored in forgot) */}
      <RoleStepperWithIcons step={step} role={selectedRole} />
      {step === 1 && <EmailInput />}
      {step === 2 && <OTPInput comeFrom="forgot" />}
      {step === 3 && <ResetPasswordForm />}
    </>
  );
}
