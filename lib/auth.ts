// lib/api.ts
import { User } from "@/components/Types/Auser.type";
import api from "./axios";

interface AuthResponse {
  user: User;
  accessToken: string;
}

interface VerifyData {
  name: string;
  email: string;
  phoneNumber: string;
  otpCode: string;
  provider?: string;
  password: string;
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

// export const refreshAccessToken = async (): Promise<{
//   accessToken: string;
// }> => {
//   const res = await api.post<{ accessToken: string }>("/auth/refresh");
//   return res.data;
// };
export async function refreshAccessToken(): Promise<{ accessToken: string }> {
  const response = await api.post("/auth/refresh"); // backend returns new access token
  const { accessToken } = response.data;

  if (!accessToken) {
    throw new Error("No access token returned");
  }
  return { accessToken };
}
