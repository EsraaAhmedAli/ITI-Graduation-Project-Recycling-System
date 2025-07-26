import React, { ReactNode } from "react";

type WrapperProps = {
  children: ReactNode;
};

export default function Wrapper({ children }: WrapperProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-2xl shadow-lg p-8 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
