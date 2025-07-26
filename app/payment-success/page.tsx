export default function PaymentSuccess({
  searchParams: { amount },
}: {
  searchParams: { amount: string };
}) {
  return (
    <main className="max-w-xl mx-auto px-6 py-12 mt-16 bg-gradient-to-br from-lime-100 via-emerald-50 to-white border border-lime-200 rounded-xl shadow-lg text-center">
      <div className="flex flex-col items-center">
        {/* Checkmark Icon */}
        <div className="w-16 h-16 rounded-full bg-lime-600 text-white flex items-center justify-center mb-6 shadow-md animate-bounce">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-lime-800 mb-2">Thank you for your support!</h1>
        <p className="text-gray-700 mb-6">
          Your payment was successfully processed.
        </p>

        {/* Amount Display */}
        <div className="bg-white border border-gray-200 text-lime-700 px-6 py-4 rounded-lg text-2xl font-semibold shadow-inner">
          {amount}EGP
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-500 mt-6">
          🌱 Your contribution helps us grow a greener future.
        </p>
      </div>
    </main>
  );
}
