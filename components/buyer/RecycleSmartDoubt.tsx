import React from 'react';
import Image from 'next/image';

const RecycleSmartDoubt = () => {
  return (
    <div className="bg-white w-full py-8 px-4 sm:px-6 lg:px-8">
      {/* العنوان في المركز */}
      <div className="max-w-7xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          When in doubt, RecycleSmart!
        </h1>
      </div>

      {/* المحتوى مع النص على اليسار والصورة على اليمين */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          {/* النص على اليسار */}
          <div className="lg:w-1/2 flex flex-col items-start text-left gap-5">
            <p className="text-lg md:text-xl text-gray-600 font-medium max-w-lg leading-relaxed">
              If it's dry and you're not sure what to do with it, we've got you! No need to Google where it goes, just give it to us and we'll sort it out.
            </p>
            
            <p className="text-lg font-bold text-gray-900">
              98% of what we pickup avoids landfill.
            </p>

            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-emerald-600 flex items-center">
                  <span className="mr-2">✨</span>Top items we've picked up so far
                </p>
                <p className="text-gray-600">
                  Soft plastics, e-waste, textiles, kitchen items, blister packs, batteries, vapes.
                </p>
              </div>

              <div>
                <p className="text-lg font-semibold text-red-500 flex items-center">
                  <span className="mr-2">🚫</span>What we leave behind
                </p>
                <p className="text-gray-600">
                  Anything wet (think coffee cups with liquid in them!), organic waste (like food scraps) or hazardous items.
                </p>
              </div>
            </div>
          </div>

          {/* الصورة على اليمين */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-full h-64 lg:h-[500px] overflow-hidden">
              <Image
                src="/images/adoubt.png" 
                alt="RecycleSmart Guide"
                fill
                className="object-cover"
                quality={100}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecycleSmartDoubt;