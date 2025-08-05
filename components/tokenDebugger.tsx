// components/TokenDebugger.tsx - Add this component to debug your token
"use client";

import React from 'react';
import { useUserAuth } from '@/context/AuthFormContext';

export const TokenDebugger = () => {
  const { token } = useUserAuth();

  const debugToken = () => {
    if (!token) {
      console.log("❌ No token available");
      return;
    }

    try {
      // Decode the token payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      console.log("🔍 Token Debug Info:");
      console.log("Token:", token);
      console.log("Payload:", payload);
      console.log("User ID:", payload.userId);
      console.log("Role:", payload.role);
      console.log("Issued At:", new Date(payload.iat * 1000));
      console.log("Expires At:", new Date(payload.exp * 1000));
      console.log("Current Time:", new Date());
      console.log("Is Expired:", payload.exp < currentTime);
      console.log("Time Until Expiry:", payload.exp - currentTime, "seconds");
      
      // Test the token format your server might expect
      console.log("\n🧪 Testing different auth formats:");
      console.log("Format 1 - auth.token:", { auth: { token } });
      console.log("Format 2 - auth.authorization:", { auth: { authorization: `Bearer ${token}` } });
      console.log("Format 3 - query.token:", { query: { token } });
      
    } catch (error) {
      console.error("❌ Error decoding token:", error);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2">Token Debugger</h3>
      <button 
        onClick={debugToken}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Debug Token in Console
      </button>
      <p className="text-sm text-gray-600 mt-2">
        Check browser console for detailed token information
      </p>
    </div>
  );
};