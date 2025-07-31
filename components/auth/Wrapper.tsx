interface WrapperProps {
  children: React.ReactNode;
  bg?: string; // Tailwind background class like 'bg-white', 'bg-base-100', etc.
}

export default function Wrapper({ children, bg = "base-100" }: WrapperProps) {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 max-h-svh overflow-hidden flex flex-col">
      <div
        className={`relative bg-${bg} rounded-2xl shadow-md p-6 sm:p-8 overflow-y-auto flex-1 max-h-full`}
      >
        {children}
      </div>
    </div>
  );
}
