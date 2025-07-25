import React from 'react';
import Image from 'next/image';

const BannerMobile = () => {
  return (
    <div className="relative bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white w-full py-8 px-4 md:py-12 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Text Content */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left gap-5">
          <div className="flex items-center justify-center md:justify-start mb-2">
            <span className="bg-gradient-to-tr from-cyan-400 to-emerald-500 p-2 rounded-full shadow-sm mr-2">
              <svg width="20" height="20" fill="none"><path d="M7 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H7Zm5 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="font-medium text-emerald-100 text-sm md:text-base tracking-wide">MOBILE APP</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Download the <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">RecycleSmart</span> app
          </h2>
          <p className="text-lg md:text-xl text-emerald-100 font-medium max-w-lg leading-relaxed mb-4">
            Your fast and reliable hassle-free pickup service for hard-to-recycle items right from your business or home doorstep.
          </p>
          
          {/* App Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full mt-4">
            <a href="#" className="hover:opacity-90 transition-opacity">
              <Image 
                src="/images/image mobile.png" 
                alt="Download on the App Store" 
                width={160} 
                height={48} 
                className="rounded-lg"
              />
            </a>
            <a href="#" className="hover:opacity-90 transition-opacity">
              <Image 
                src="/images/google-play-button.png" 
                alt="GET IT ON Google Play" 
                width={160} 
                height={48} 
                className="rounded-lg"
              />
            </a>
          </div>
          
          {/* Additional Links */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <button className="bg-white text-emerald-600 font-semibold py-2 px-6 rounded-full hover:bg-gray-100 transition-colors">
              Book a Pickup
            </button>
            <button className="border-2 border-white text-white font-semibold py-2 px-6 rounded-full hover:bg-white/10 transition-colors">
              Join a plan
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md aspect-square">
            <Image
              src="/images/image mobile.png"
              alt="RecycleSmart App Screenshot"
              fill
              className="object-contain"
              quality={100}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerMobile;