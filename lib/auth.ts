// lib/api.ts
import api from "./axios";

interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    password: string;
    email: string;
    phoneNumber: string;
    imageUrl?: string;
    isAuthenticated?: boolean;
  };
  token: string;
}

interface VerifyData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  otpCode: string;
  provider?: string;
}
export const verifyOtpAndRegister = async (
  data: VerifyData
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/verifyRegisterToken", data);
  return res.data;
};

export const initiateSignup = async (email: string) => {
  return api.post("/auth/initiateSignup", { email });
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
};

export const forgotPassword = async (email: string) => {
  return api.post("/auth/forgotPassword", { email });
};

export const resetPassword = async (data: {
  email: string;
  otpCode: string;
  newPassword: string;
}) => {
  return api.post("/auth/resetPassword", data);
};

export const refreshAccessToken = async (): Promise<{
  accessToken: string;
}> => {
  const res = await api.post<{ accessToken: string }>("/auth/refresh");
  return res.data;
};
