"use client";

import React from 'react';
import { useUserAuth } from '@/context/AuthFormContext';
import { testSocketConnections } from '@/lib/socket-tester';

export const SocketTester = () => {
  const { token } = useUserAuth();

  const runTests = () => {
    if (!token) {
      console.log("❌ No token available for testing");
      return;
    }
    
    testSocketConnections(token);
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="font-bold mb-2">Socket Connection Tester</h3>
      <button 
        onClick={runTests}
        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        disabled={!token}
      >
        Test All Connection Methods
      </button>
      <p className="text-sm text-gray-600 mt-2">
        This will test 5 different authentication methods. Check console for results.
      </p>
      {!token && (
        <p className="text-red-500 text-sm mt-1">Please log in first to test</p>
      )}
    </div>
  );
};