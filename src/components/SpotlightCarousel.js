'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const SpotlightCarousel = ({ items = [] }) => {
  const [isClient, setIsClient] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // If no items or not on client yet, show loading state
  if (!isClient || !items.length) {
    return (
      <div className="w-full h-[250px] md:h-[450px] bg-[var(--card)] rounded-xl animate-pulse flex items-center justify-center mb-6 md:mb-10">
        <div className="text-center">
          <div className="h-10 w-40 bg-[var(--border)] rounded mx-auto mb-4"></div>
          <div className="h-4 w-60 bg-[var(--border)] rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-6 md:mb-10 spotlight-carousel">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        slidesPerView={1}
        effect="fade"
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="rounded-xl overflow-hidden"
      >
        {items.map((anime, index) => (
          <SwiperSlide key={`spotlight-${anime.id}-${index}`}>
            <div className="relative w-full h-[250px] md:h-[450px]">
              {/* Background Image */}
              <Image
                src={anime.banner || anime.poster || '/LandingPage.jpg'}
                alt={anime.name || 'Anime spotlight'}
                fill
                priority={index < 2}
                className="object-cover"
              />
              
              {/* Gradient Overlay */}
              <div 
                className="absolute inset-0" 
                style={{
                  background: `
                    linear-gradient(to right, 
                      rgba(10,10,10,0.9) 0%, 
                      rgba(10,10,10,0.6) 25%, 
                      rgba(10,10,10,0.3) 40%, 
                      rgba(10,10,10,0) 60%),
                    linear-gradient(to top, 
                      rgba(10,10,10,0.95) 0%, 
                      rgba(10,10,10,0.7) 15%, 
                      rgba(10,10,10,0.3) 30%, 
                      rgba(10,10,10,0) 50%)
                  `
                }}
              ></div>
              
              {/* Content Area */}
              <div className="absolute inset-0 flex flex-col justify-end p-3 pb-12 md:p-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                  {/* Left Side Content */}
                  <div className="max-w-2xl">
                    {/* Metadata first - Minimal boxed design */}
                    <div className="flex items-center mb-2 md:mb-3 text-xs md:text-xs space-x-1.5 md:space-x-1.5">
                      {anime.otherInfo?.map((info, i) => (
                        <span 
                          key={i} 
                          className="inline-block px-2 md:px-1.5 py-1 md:py-0.5 bg-white/10 text-white/80 rounded-sm"
                        >
                          {info}
                        </span>
                      ))}
                      
                      {anime.episodes && (
                        <>
                          {anime.episodes.sub > 0 && (
                            <span className="inline-block px-2 md:px-1.5 py-1 md:py-0.5 bg-white/10 text-white/80 rounded-sm">
                              SUB {anime.episodes.sub}
                            </span>
                          )}
                          {anime.episodes.dub > 0 && (
                            <span className="inline-block px-2 md:px-1.5 py-1 md:py-0.5 bg-white/10 text-white/80 rounded-sm">
                              DUB {anime.episodes.dub}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Title second */}
                    <h2 className="text-lg md:text-4xl font-bold mb-2 md:mb-2 line-clamp-2 md:line-clamp-none">
                      {anime.name || 'Anime Title'}
                    </h2>
                    
                    {/* Japanese Title */}
                    {anime.jname && (
                      <h3 className="text-sm md:text-lg text-white/70 mb-2 line-clamp-1">
                        {anime.jname}
                      </h3>
                    )}
                    
                    {/* Description third - hidden on mobile, shown on desktop with exactly 3 lines */}
                    <p className="hidden md:block text-base line-clamp-3 text-white/90 max-h-[4.5rem] overflow-hidden">
                      {anime.description || 'No description available.'}
                    </p>
                  </div>

                  {/* Buttons - Below title on mobile, right side on desktop */}
                  <div className="flex items-center space-x-2 md:space-x-4 mt-1 md:mt-0 md:absolute md:bottom-8 md:right-8">
                    <Link 
                      href={`/watch/${anime.id}?ep=${anime.episodes?.sub || anime.episodes?.dub || 1}`}
                      className="bg-white hover:bg-gray-200 text-[#0a0a0a] font-medium text-xs md:text-base px-3 md:px-6 py-1.5 md:py-2 rounded flex items-center space-x-1.5 md:space-x-2 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span>WATCH NOW</span>
                    </Link>
                    
                    <Link 
                      href={`/anime/${anime.id}`}
                      className="text-white border border-white/30 hover:bg-white/10 text-xs md:text-base px-3 md:px-6 py-1.5 md:py-2 rounded flex items-center space-x-1.5 md:space-x-2 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>DETAILS</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      <style jsx global>{`
        .spotlight-carousel .swiper-button-next,
        .spotlight-carousel .swiper-button-prev {
          color: white;
          background: rgba(0, 0, 0, 0.3);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @media (min-width: 768px) {
          .spotlight-carousel .swiper-button-next,
          .spotlight-carousel .swiper-button-prev {
            width: 40px;
            height: 40px;
          }
        }
        
        .spotlight-carousel .swiper-button-next:after,
        .spotlight-carousel .swiper-button-prev:after {
          font-size: 12px;
        }
        
        @media (min-width: 768px) {
          .spotlight-carousel .swiper-button-next:after,
          .spotlight-carousel .swiper-button-prev:after {
            font-size: 18px;
          }
        }
        
        .spotlight-carousel .swiper-pagination {
          bottom: 12px !important;
        }
        
        .spotlight-carousel .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
          width: 4px;
          height: 4px;
          margin: 0 3px !important;
        }
        
        @media (min-width: 768px) {
          .spotlight-carousel .swiper-pagination {
            bottom: 20px !important;
          }
          
          .spotlight-carousel .swiper-pagination-bullet {
            width: 6px;
            height: 6px;
            margin: 0 4px !important;
          }
        }
        
        .spotlight-carousel .swiper-pagination-bullet-active {
          background: white;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default SpotlightCarousel; 