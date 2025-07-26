export function ProgressIndicator({ currentStep }: { currentStep: number }) {
  const steps = ["Address", "Review", "Track"];
  return (
    <div className="flex items-center justify-center mb-6 space-x-4">
      {steps.map((label, idx) => (
        <div key={idx} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            idx + 1 <= currentStep ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"
          }`}>
            {idx + 1}
          </div>
          <span className={`ml-2 ${idx + 1 <= currentStep ? "text-green-600" : "text-gray-500"}`}>
            {label}
          </span>
          {idx < steps.length - 1 && (
            <div className={`w-12 h-1 ml-4 ${idx + 1 < currentStep ? "bg-green-600" : "bg-gray-300"}`}></div>
          )}
        </div>
      ))}
    </div>
  );
} 