import React from 'react'


interface LoaderProps {
  title?: string;
}

export default function Loader({ title = 'content' }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="h-screen flex items-center justify-center bg-gray-50"
    >
      <div className="text-center">
           <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading {title}...</p>
        </div>
      </div>
    </div>
  );
}
