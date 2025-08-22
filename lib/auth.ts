// lib/api.ts
import { User } from "@/components/Types/Auser.type";
import api from "./axios";

// Payload when verifying OTP and completing signup
export interface VerifyData {
  name: string;
  email: string;
  phoneNumber: string;
  otpCode: string;
  provider?: string;
  password: string;
  role: "admin" | "customer" | "buyer" | "delivery";
}

// Response after successful auth
export interface AuthResponse {
  user: User;
  accessToken: string;
}

// Request to start signup (OTP sent to email)
export interface InitiateSignupRequest {
  email: string;
}

// Request to verify OTP only
export interface VerifyOtpOnlyRequest {
  email: string;
  otpCode: string;
}

// Register user directly (after verified)
export interface RegisterUserRequest {
  name: string;
  email: string;
  phoneNumber: string;
  role: "none" | "customer" | "buyer" | "delivery";
  password?: string;
  provider?: string;
  imgUrl?: string;
  attachments?: Record<string, any>;
  idToken?: string;
}

export const verifyOtp = async (
  data: VerifyOtpOnlyRequest
): Promise<{ message: string }> => {
  const res = await api.post("/auth/verifyOtp", data);
  return res.data;
};

export const registerUser = async (
  data: RegisterUserRequest
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/register", data);
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
