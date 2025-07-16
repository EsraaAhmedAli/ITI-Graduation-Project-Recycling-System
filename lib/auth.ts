
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

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
  const res = await axios.post<AuthResponse>(
    `${API}/auth/verifyRegisterToken`,
    data
  );
  return res.data; // ✅ returns just { user, token }
};

export const initiateSignup = async (email: string) => {
  console.log(`Initiating signup for email: ${email}`);
  // console.log(`${API}/auth/initiate-signup`, { email });

  return axios.post(`${API}/auth/initiateSignup`, { email });
};
//npm i axios @types/axios
// export const verifyOtpAndRegister = async (data: {
//   name: string;
//   email: string;
//   password: string;
//   phoneNumber: string;
//   otpCode: string;
//   provider?: string;
// }) => {
//   return axios.post(`${API}/auth/verifyRegisterToken`, data);
// };

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await axios.post<AuthResponse>(`${API}/auth/login`, data);
  return res.data; // ✅ returns just { user, token }
};

export const forgotPassword = async (email: string) => {
  return axios.post(`${API}/auth/forgotPassword`, { email });
};

export const resetPassword = async (data: {
  email: string;
  otpCode: string;
  newPassword: string;
}) => {
  return axios.post(`${API}/auth/resetPassword`, data);
};
