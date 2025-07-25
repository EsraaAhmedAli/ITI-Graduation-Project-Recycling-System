import { Shirt, Percent, Leaf, Truck } from 'lucide-react';

export default function FashionRecyclingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-teal-800 mb-6">Fashion Recycling Initiative</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-teal-100 p-4 rounded-full">
              <Percent className="text-teal-600 w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">30% Discount Offer</h2>
              <p className="text-gray-600">
                Bring your used clothing and receive 30% off your next sustainable fashion purchase. 
                Help reduce textile waste while saving money.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-teal-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <Shirt className="text-teal-600 mr-2" />
              Accepted Items
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>✅ Clean clothing in good condition</li>
              <li>✅ Shoes and accessories</li>
              <li>✅ Bed linens and towels</li>
              <li>❌ Damaged or soiled items</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <Leaf className="text-amber-600 mr-2" />
              Environmental Impact
            </h3>
            <p className="text-gray-700">
              Textile recycling reduces water consumption by 80% and decreases landfill waste. 
              Each kilogram of recycled clothing saves 25kg of CO2 emissions.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Collection Process</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-teal-100 text-teal-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">1</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Prepare Your Items</h3>
                <p className="text-gray-600">Clean, dry, and pack items in a reusable bag</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-teal-100 text-teal-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">2</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Bring to Store</h3>
                <p className="text-gray-600">Visit any participating location during business hours</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-teal-100 text-teal-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">3</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Receive Discount</h3>
                <p className="text-gray-600">Get your 30% off coupon immediately after drop-off</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">What Happens Next?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Truck className="text-teal-600" />
              </div>
              <h3 className="font-medium">Sorting</h3>
              <p className="text-sm text-gray-600 mt-1">Items are categorized by quality and material</p>
            </div>
            <div className="text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Shirt className="text-teal-600" />
              </div>
              <h3 className="font-medium">Distribution</h3>
              <p className="text-sm text-gray-600 mt-1">Good condition items are donated to charities</p>
            </div>
            <div className="text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Leaf className="text-teal-600" />
              </div>
              <h3 className="font-medium">Recycling</h3>
              <p className="text-sm text-gray-600 mt-1">Worn items are processed into new materials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}