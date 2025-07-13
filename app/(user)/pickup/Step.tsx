export default function Step({
  label,
  active
}: {
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300
          ${active ? 'bg-green-700 border-green-700 text-white' : 'bg-white border-gray-300 text-gray-400'}
        `}
      >
        {active && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span
        className={`text-sm font-medium transition-colors duration-300 ${
          active ? 'text-green-700' : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
