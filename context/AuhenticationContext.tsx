// context/AuthenticationContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

export type Role = "customer" | "delivery" | "buyer" | "none";
export type AuthMode =
  | "login"
  | "signup"
  | "forgot-password"
  | "role-select"
  | "complete-signup";
export type GoogleUser = {
  name: string;
  email: string;
  image: string;
  provider: string;
} | null;
interface AuthenticationContextType {
  mode: AuthMode;
  setMode: (val: AuthMode) => void;
  selectedRole: Role;
  setSelectedRole: (role: Role) => void;
  step: number;
  setStep: (val: number) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (val: boolean) => void;

  loading: boolean;
  setLoading: (val: boolean) => void;
  resetState: () => void;
  handleClose: () => void; // ✅ new
  GoogleUser: GoogleUser;
  setGoogleUser: (user: GoogleUser) => void;
}

const AuthenticationContext = createContext<
  AuthenticationContextType | undefined
>(undefined);

export const useAuthenticationContext = (): AuthenticationContextType => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error(
      "useAuthenticationContext must be used within AuthenticationProvider"
    );
  }
  return context;
};

type AuthenticationProviderProps = {
  children: ReactNode;
  onClose: () => void; // ✅ accept close handler from parent
};

export const AuthenticationProvider = ({
  children,
  onClose,
}: AuthenticationProviderProps) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [selectedRole, setSelectedRole] = useState<Role>("none");
  const [step, setStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [GoogleUser, setGoogleUser] = useState<GoogleUser>(null);

  const resetState = () => {
    setMode("login");
    setSelectedRole("customer");
    setStep(1);
    setShowPassword(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose(); // ✅ close modal
  };

  return (
    <AuthenticationContext.Provider
      value={{
        mode,
        setMode,
        selectedRole,
        setSelectedRole,
        step,
        setStep,
        showPassword,
        setShowPassword,
        loading,
        setLoading,
        resetState,
        handleClose, // ✅ provide to children
        setShowConfirmPassword,
        showConfirmPassword,
        GoogleUser,
        setGoogleUser,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
