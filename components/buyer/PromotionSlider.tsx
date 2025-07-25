"use client";
import React from 'react';
import { ChevronRight, ChevronLeft, Star, Leaf, Recycle } from 'lucide-react';
import Link from 'next/link';

interface Slide {
  id: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  learnMoreLink: string;
  isStatistic?: boolean;
  icon?: React.ReactNode;
}

const PromotionSlider: React.FC = () => {
  const slides: Slide[] = [
    {
      id: '1',
      title: '20% Discount on Phone Recycling',
      description: 'Trade in your old device and save on your next purchase while helping the planet',
      image: '/images/image2.jpg',
      ctaText: 'Recycle Now',
      ctaLink: '/recycle-electronics',
      learnMoreLink: './about/about-phone-recycling',
      icon: <Star className="text-green-400" />
    },
    {
      id: '2',
      title: 'Join Our 10K Device Challenge',
      description: 'We\'re aiming to responsibly recycle 10,000 devices this month - be part of the solution!',
      image: '/images/image3.jpg',
      ctaText: 'Participate',
      ctaLink: '/community-challenge',
      learnMoreLink: 'about/about-community-challenge',
      isStatistic: true,
      icon: <Leaf className="text-emerald-400" />
    },
    {
      id: '3',
      title: 'Fashion Recycling Program',
      description: 'Get 30% off when you bring in used clothing for recycling',
      image: '/images/fashion.jpg',
      ctaText: 'Get Offer',
      ctaLink: '/fashion-recycling',
      learnMoreLink: '/about/about-fashion-recycling',
      icon: <Recycle className="text-green-400" />
    },
  ];

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  
  React.useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div 
      className="relative w-full h-[400px] md:h-[500px] overflow-hidden  "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="w-full flex-shrink-0 relative h-full"
          >
            {/* Background Image with Parallax Effect */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100 hover:scale-105"
              style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${slide.image})`,
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10 z-20" />

            {/* Slide Content */}
            <div className="relative h-full flex flex-col justify-end items-start text-white p-8 md:p-12 z-30">
              <div className="max-w-2xl">
                {/* Badge with Icon */}
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg mr-3">
                    {React.cloneElement(slide.icon as React.ReactElement, { size: 24 })}
                  </div>
                  {slide.isStatistic ? (
                    <span className="bg-emerald-500/90 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                      Community Challenge
                    </span>
                  ) : (
                    <span className="bg-amber-500/90 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                      Limited Offer
                    </span>
                  )}
                </div>

                <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl text-white/90 mb-6 max-w-lg">
                  {slide.description}
                </p>
                <div className="flex space-x-4">
                  <Link
                    href={slide.ctaLink}
                    className={`px-8 py-3 rounded-full font-medium text-sm md:text-base flex items-center transition-all ${
                      slide.isStatistic
                        ? 'bg-white text-emerald-800 hover:bg-gray-100 hover:shadow-lg'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 hover:shadow-lg'
                    }`}
                  >
                    {slide.ctaText}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                  <Link
                    href={slide.learnMoreLink}
                    className="px-6 py-3 rounded-full font-medium text-white border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all text-sm md:text-base"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all z-40 shadow-lg hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all z-40 shadow-lg hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" strokeWidth={2} />
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
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 z-40 bg-white/20">
        <div 
          className="h-full bg-white transition-all duration-5000 ease-linear"
          style={{ 
            width: isHovered ? '0%' : '100%',
            animation: isHovered ? 'none' : 'progress 5s linear'
          }}
        />
      </div>
    </div>
  );
};

export default PromotionSlider;