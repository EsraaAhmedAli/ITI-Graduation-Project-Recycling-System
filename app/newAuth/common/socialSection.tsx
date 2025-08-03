"use client";

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useUserAuth } from "@/context/AuthFormContext";
import { useFormContext } from "react-hook-form";

const SocialButtons = () => {
  const { setMode, setGoogleUser } = useAuthenticationContext();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { setUser, setToken } = useUserAuth();
  const { setValue } = useFormContext();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const idToken = credentialResponse.credential;

      const res = await api.post(`/auth/provider/google`, {
        idToken,
      });

      const { exists, user, accessToken } = res.data;
      console.log("GOOOOOOOOOOOOOOOOOOOOOOOGLE");
      console.log(user);
      console.log(idToken);

      setValue("name", user.name);
      setValue("email", user.email);
      if (exists) {
        // ✅ Existing user

        setUser(user);
        setToken(accessToken);
        router.push("/");
      } else {
        // 🔧 First time login → go to complete-signup
        const { email, name, image, provider } = user;
        setGoogleUser({ email, name, image, provider });
        setMode("role-select");
      }
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.error("Google login failed")}
        useOneTap // optional: enables one-tap popup

      />
    </div>
  );
};

export default SocialButtons;
