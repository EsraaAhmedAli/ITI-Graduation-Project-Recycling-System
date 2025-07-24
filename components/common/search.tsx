"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NavbarSearch() {
  const router = useRouter();
  const [typing, setTyping] = useState(false);

  const handleFocus = () => {
    // Delay navigation to allow width animation to apply smoothly
    setTyping(true);
    setTimeout(() => {
      router.replace("/search");
    }, 100); // enough for animation to feel smooth
  };

  return (
    <form className="mx-auto w-fit" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="default-search" className="sr-only">
        Search
      </label>
      <div
        className={`relative transition-all duration-300 ease-in-out ${
          typing ? "w-full" : "w-40"
        }`}
      >
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          id="default-search"
          placeholder="Search items..."
          className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-all"
          onFocus={handleFocus}
        />
      </div>
    </form>
  );
}
