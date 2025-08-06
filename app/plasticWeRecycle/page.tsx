'use client';

import { useState } from 'react';

export default function RecycleCheckPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleCheck = async () => {
    if (!image) return;

    setLoading(true);

    // Fake "AI analysis" logic – can replace with real API later
    const fakeLabels = ['bottle', 'container', 'plastic bag', 'food wrapper'];
    const randomLabel = fakeLabels[Math.floor(Math.random() * fakeLabels.length)];

    const recyclable = ['bottle', 'container'].includes(randomLabel);

    setTimeout(() => {
      setResult(
        recyclable
          ? `✅ This looks like a ${randomLabel}. It can be recycled! ♻️`
          : `❌ This appears to be a ${randomLabel}. It cannot be recycled.`
      );
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Plastic Recyclability Checker</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="mb-4"
      />

      {preview && (
        <div className="mb-4">
          <img src={preview} alt="preview" className="w-64 h-64 object-cover mx-auto rounded" />
        </div>
      )}

      <button
        onClick={handleCheck}
        disabled={!image || loading}
        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Check Recyclability'}
      </button>

      {result && (
        <p className="mt-6 text-lg font-medium">{result}</p>
      )}
    </div>
  );
}
