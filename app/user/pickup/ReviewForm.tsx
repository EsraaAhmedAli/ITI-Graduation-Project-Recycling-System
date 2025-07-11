export default function Review({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 space-y-4 text-center">
      <h2 className="text-2xl font-semibold mb-4">Review Your Info</h2>
      <p>You ready to book!</p>
      <button
        onClick={onBack}
        className="mt-4 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition"
      >
        Back
      </button>
    </div>
  );
}
