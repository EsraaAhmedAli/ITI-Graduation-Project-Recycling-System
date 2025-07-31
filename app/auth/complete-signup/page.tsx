// app/auth/complete-signup/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface OAuthUserData {
  clerkId: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  isNewUser: boolean;
}

interface SignupData {
  role: string;
  phoneNumber: string;
  // Add any other fields you need
}

export default function CompleteSignup() {
  const router = useRouter();
  const [userData, setUserData] = useState<OAuthUserData | null>(null);
  const [signupData, setSignupData] = useState<SignupData>({
    role: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get OAuth user data from sessionStorage
    const storedData = sessionStorage.getItem("oauthUserData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    } else {
      // If no data, redirect to login
      router.replace("/auth/signin");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setLoading(true);

    try {
      // Combine OAuth data with additional signup data
      const completeUserData = {
        ...userData,
        ...signupData,
        createdAt: new Date(),
      };

      // Save to your MongoDB
      const response = await fetch("/api/auth/complete-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeUserData),
      });

      if (response.ok) {
        // Clear stored data
        sessionStorage.removeItem("oauthUserData");

        // Redirect to home or dashboard
        router.replace("/");
      } else {
        const error = await response.json();
        alert(`Signup failed: ${error.message}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We got your info from {userData.provider}. Just need a few more
            details.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <h3 className="text-lg font-medium">
              Your Info from {userData.provider}
            </h3>
            <p className="text-sm text-gray-600">Name: {userData.name}</p>
            <p className="text-sm text-gray-600">Email: {userData.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                value={signupData.role}
                onChange={(e) =>
                  setSignupData({ ...signupData, role: e.target.value })
                }
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={signupData.phoneNumber}
                onChange={(e) =>
                  setSignupData({ ...signupData, phoneNumber: e.target.value })
                }
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="+1234567890"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Completing Signup..." : "Complete Signup"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
