import React, { useState } from 'react';

const LanguageSwitcherExamples = () => {
  const [currentLocale, setCurrentLocale] = useState('en');

  const toggleLanguage = () => {
    setCurrentLocale(currentLocale === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">

      
 

  


      <div className="space-y-4">
        <div className=" p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${currentLocale === 'en' ? 'text-blue-600' : 'text-gray-400'}`}>
              EN
            </span>
            <button
              onClick={toggleLanguage}
              className="relative w-12 h-6 bg-gray-200 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: currentLocale === 'ar' ? '#3B82F6' : '#D1D5DB' }}
            >
              <div
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200"
                style={{ transform: currentLocale === 'ar' ? 'translateX(24px)' : 'translateX(0)' }}
              />
            </button>
            <span className={`text-sm font-medium ${currentLocale === 'ar' ? 'text-blue-600' : 'text-gray-400'}`}>
              العربية
            </span>
          </div>
        </div>
      </div>


    </div>
  );
};

export default LanguageSwitcherExamples;