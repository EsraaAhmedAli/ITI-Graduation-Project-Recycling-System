import { Smartphone, Battery, ShieldCheck } from 'lucide-react';

export default function PhoneRecyclingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-emerald-800 mb-6">Phone Recycling Program</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <Smartphone className="text-emerald-600 mr-2" />
            How It Works
          </h2>
          <ol className="list-decimal pl-6 space-y-3 text-gray-700">
            <li>Bring your old device to one of our branches</li>
            <li>Our technicians will inspect and evaluate the device</li>
            <li>You receive 20% discount on a new device purchase</li>
            <li>We securely wipe all your personal data</li>
            <li>Components are responsibly recycled</li>
          </ol>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-emerald-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <Battery className="text-emerald-600 mr-2" />
              Accepted Devices
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>✅ All smartphone models</li>
              <li>✅ Tablets</li>
              <li>✅ Smart watches</li>
              <li>❌ Completely damaged devices</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <ShieldCheck className="text-amber-600 mr-2" />
              Data Protection Guarantee
            </h3>
            <p className="text-gray-700">
              We use specialized software to securely erase all personal data according to the highest security standards, with optional data erasure certification available.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">FAQs</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-medium text-lg">What's the exact discount value?</h3>
              <p className="text-gray-600 mt-1">You get 20% off the price of any new device purchased from our store, up to a maximum of $50.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-medium text-lg">Can I participate without buying a new device?</h3>
              <p className="text-gray-600 mt-1">Yes, you can donate your old device and we'll reward you with redeemable points.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}