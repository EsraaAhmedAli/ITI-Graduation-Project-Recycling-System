import { Users, Award, Calendar, BarChart2 } from 'lucide-react';

export default function CommunityChallengePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-emerald-800 mb-4">10K Device Challenge</h1>
          <p className="text-xl text-gray-600">Join our eco-community and help us achieve this ambitious goal</p>
        </div>

        <div className="bg-emerald-600 text-white rounded-xl p-8 mb-8 text-center">
          <div className="flex justify-center items-center mb-4">
            <BarChart2 size={48} className="mr-4" />
            <div>
              <p className="text-2xl font-medium">Total Devices Recycled</p>
              <p className="text-5xl font-bold">8,427</p>
            </div>
          </div>
          <div className="w-full bg-white/20 h-4 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full" 
              style={{ width: `${(8427 / 10000) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <Calendar className="text-emerald-600 w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Days Remaining</h3>
            <p className="text-gray-700">15 days</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <Users className="text-emerald-600 w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Participants</h3>
            <p className="text-gray-700">1,243 people</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <Award className="text-emerald-600 w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Top Contributor</h3>
            <p className="text-gray-700">John Smith (47 devices)</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">How to Participate</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-emerald-100 text-emerald-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">1</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Collect Old Devices</h3>
                <p className="text-gray-600">Gather electronics from friends, family, and neighbors</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-emerald-100 text-emerald-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">2</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Register Devices</h3>
                <p className="text-gray-600">Register devices on our website to track your contribution</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-emerald-100 text-emerald-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">3</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Drop Off Locations</h3>
                <p className="text-gray-600">Find your nearest collection center on our interactive map</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Rewards & Recognition</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-emerald-500 pl-4">
              <h3 className="text-lg font-medium mb-2">Top 10 Contributors</h3>
              <p className="text-gray-600">Will be featured on our Wall of Fame and receive premium membership</p>
            </div>
            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="text-lg font-medium mb-2">All Participants</h3>
              <p className="text-gray-600">Receive eco-points redeemable for discounts and special offers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}