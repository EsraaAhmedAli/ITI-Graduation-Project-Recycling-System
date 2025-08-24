"use client";
import React from 'react';
import { ChevronRight, ChevronLeft, Star, Leaf, Recycle } from 'lucide-react';
import Link from 'next/link';

interface Slide {
  id: string;
  titleKey: string;
  descriptionKey: string;
  image: string;
  ctaTextKey: string;
  ctaLink: string;
  learnMoreLinkKey: string;
  isStatistic?: boolean;
  icon?: React.ReactNode;
}

interface PromotionSliderProps {
  t: (key: string) => string;
  isRTL?: boolean;
  locale?: string;
}

const PromotionSlider: React.FC<PromotionSliderProps> = ({ t, isRTL = false, locale = 'en' }) => {
  const slides: Slide[] = [
    {
      id: '1',
      titleKey: 'slider.phoneRecycling.title',
      descriptionKey: 'slider.phoneRecycling.description',
      image: '/images/slide1.jpg',
      ctaTextKey: 'slider.phoneRecycling.cta',
      ctaLink: '/recycle-electronics',
      learnMoreLinkKey: 'slider.phoneRecycling.learnMore',
      icon: <Star className="text-green-400" />
    },
    {
      id: '2',
      titleKey: 'slider.deviceChallenge.title',
      descriptionKey: 'slider.deviceChallenge.description',
      image: '/images/slide2.webp',
      ctaTextKey: 'slider.deviceChallenge.cta',
      ctaLink: '/community-challenge',
      learnMoreLinkKey: 'slider.deviceChallenge.learnMore',
      isStatistic: true,
      icon: <Leaf className="text-emerald-400" />
    },
    {
      id: '3',
      titleKey: 'slider.fashionRecycling.title',
      descriptionKey: 'slider.fashionRecycling.description',
      image: '/images/green.webp',
      ctaTextKey: 'slider.fashionRecycling.cta',
      ctaLink: '/fashion-recycling',
      learnMoreLinkKey: 'slider.fashionRecycling.learnMore',
      icon: <Recycle className="text-green-400" />
    },
  ];

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  const nextSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  React.useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isHovered, nextSlide]);

  // Handle RTL navigation
  const handleNext = () => {
    if (isRTL) {
      prevSlide();
    } else {
      nextSlide();
    }
  };

  const handlePrev = () => {
    if (isRTL) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  return (
    <div 
      className={`relative  md:block w-full h-[400px] hidden md:h-[500px] overflow-hidden ${isRTL ? 'dir-rtl' : 'dir-ltr'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] h-full"
        style={{ 
          transform: isRTL 
            ? `translateX(${currentSlide * 100}%)` 
            : `translateX(-${currentSlide * 100}%)`
        }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="w-full flex-shrink-0 relative h-full"
          >
            {/* Background Image with Parallax Effect - Fixed for RTL */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100 hover:scale-105"
              style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10 z-20" />

            {/* Slide Content */}
            <div className={`relative h-full flex flex-col justify-end text-white p-8 md:p-12 z-30 ${
              isRTL ? 'items-end text-right' : 'items-start text-left'
            }`}>
              <div className="max-w-2xl">
                {/* Badge with Icon */}
                <div className={`flex items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-2 bg-white/10 backdrop-blur-sm rounded-lg ${isRTL ? 'ml-3' : 'mr-3'}`}>
                    {React.cloneElement(slide.icon as React.ReactElement, { size: 24 })}
                  </div>
                  {slide.isStatistic ? (
                    <span className="bg-emerald-500/90 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                      {t('slider.badges.communityChallenge')}
                    </span>
                  ) : (
                    <span className="bg-amber-500/90 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                      {t('slider.badges.limitedOffer')}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  {t(slide.titleKey)}
                </h2>
                <p className="text-lg md:text-xl text-white/90 mb-6 max-w-lg">
                  {t(slide.descriptionKey)}
                </p>
                <div className={`flex space-x-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Link
                    href={slide.ctaLink}
                    className={`px-8 py-3 rounded-full font-medium text-sm md:text-base flex items-center transition-all ${
                      isRTL ? 'flex-row-reverse' : ''
                    } ${
                      slide.isStatistic
                        ? 'bg-white text-emerald-800 hover:bg-gray-100 hover:shadow-lg'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 hover:shadow-lg'
                    }`}
                  >
                    {t(slide.ctaTextKey)}
                    {isRTL ? (
                      <ChevronLeft className="mr-1 h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-1 h-4 w-4" />
                    )}
                  </Link>
                  <Link
                    href={t(slide.learnMoreLinkKey)}
                    className="px-6 py-3 rounded-full font-medium text-white border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all text-sm md:text-base"
                  >
                    {t('slider.common.learnMore')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className={`absolute ${isRTL ? 'right-6' : 'left-6'} top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all z-40 shadow-lg hover:scale-110`}
        aria-label={t('slider.navigation.previous')}
      >
        {isRTL ? (
          <ChevronRight className="h-6 w-6" strokeWidth={2} />
        ) : (
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        )}
      </button>
      <button
        onClick={handleNext}
        className={`absolute ${isRTL ? 'left-6' : 'right-6'} top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all z-40 shadow-lg hover:scale-110`}
        aria-label={t('slider.navigation.next')}
      >
        {isRTL ? (
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        ) : (
          <ChevronRight className="h-6 w-6" strokeWidth={2} />
        )}
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-40">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'bg-white w-12'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={t('slider.navigation.goToSlide', { number: index + 1 })}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 z-40 bg-white/20">
        <div 
          className={`h-full bg-white transition-all duration-5000 ease-linear ${
            isRTL ? 'origin-right' : 'origin-left'
          }`}
          style={{ 
            width: isHovered ? '0%' : '100%',
            animation: isHovered ? 'none' : 'progress 5s linear'
          }}
        />
      </div>

      {/* Add CSS for RTL progress animation */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .dir-rtl {
          direction: rtl;
        }
        
        .dir-ltr {
          direction: ltr;
        }
      `}</style>
    </div>
  );
};

export default PromotionSlider;