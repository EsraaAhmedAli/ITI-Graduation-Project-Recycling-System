// pages/signup.tsx
"use client";
import { RegistrationForm } from "./MultiStep";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <RegistrationForm />

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?
            <a
              href="/login"
              className="text-primary hover:text-green-700 ml-1 font-medium"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
