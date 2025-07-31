// app/google-login/page.tsx
"use client";

import api from "@/lib/axios";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GoogleLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLoginSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;

      const res = await api.post(`/auth/provider/google`, {
        idToken,
      });

      const { exists, user } = res.data;

      if (exists) {
        // ✅ مستخدم قديم، دخله على طول
        router.push("/dashboard");
      } else {
        // 🔧 مستخدم جديد، وديه يكمل البيانات
        router.push(
          `/complete-signup?email=${user.email}&name=${user.name}&image=${user.image}&provider=${user.provider}`
        );
      }
    } catch (err: any) {
      console.error(err);
      setError("فشل تسجيل الدخول بجوجل");
    }
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-xl font-semibold mb-4">
        تسجيل الدخول باستخدام Google
      </h1>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => setError("فشل تسجيل الدخول")}
      />
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
