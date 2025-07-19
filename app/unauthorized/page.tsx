"use client";
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        401 - Unauthorized
      </h1>
      <p className="text-gray-600">You do not have access to this page.</p>
    </div>
  );
}
