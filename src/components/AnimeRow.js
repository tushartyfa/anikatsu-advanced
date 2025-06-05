'use client';

import { useRef, useState, useEffect } from 'react';
import AnimeCard from './AnimeCard';

export default function AnimeRow({ title, animeList }) {
  const scrollContainerRef = useRef(null);
  const contentRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  
  useEffect(() => {
    if (!animeList || animeList.length <= 7) {
      setShowRightButton(false);
      return;
    }
    
    setShowRightButton(true);
    
    const checkScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft + clientWidth < scrollWidth - 10);
    };
    
    const scrollContainer = scrollContainerRef.current;
    scrollContainer.addEventListener('scroll', checkScroll);
    
    // Initial check
    checkScroll();
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', checkScroll);
      }
    };
  }, [animeList]);
  
  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    // Calculate single card width based on viewport
    const isMobile = window.innerWidth < 640; // sm breakpoint in Tailwind
    const cardsPerRow = isMobile ? 3 : 7;
    const singleCardWidth = container.clientWidth / cardsPerRow;
    
    if (direction === 'left') {
      container.scrollBy({ left: -singleCardWidth, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: singleCardWidth, behavior: 'smooth' });
    }
  };
  
  if (!animeList || animeList.length === 0) return null;
  
  // Create groups of cards for pagination - 3 for mobile, 7 for larger screens
  const cardGroups = [];
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 640;
  const groupSize = isMobileView ? 3 : 7;
  
  for (let i = 0; i < animeList.length; i += groupSize) {
    cardGroups.push(animeList.slice(i, i + groupSize));
  }
  
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      
      <div className="relative">
        {showLeftButton && (
          <button 
            onClick={() => scroll('left')} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black shadow-lg -ml-5"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto hide-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div 
            ref={contentRef} 
            className="flex snap-x snap-mandatory"
          >
            {cardGroups.map((group, groupIndex) => (
              <div 
                key={groupIndex} 
                className="grid grid-cols-3 sm:grid-cols-7 gap-3 snap-start snap-always min-w-full px-1"
              >
                {group.map((anime, index) => (
                  <div key={index}>
                    <AnimeCard anime={anime} isRecent={true} />
                  </div>
                ))}
                {/* Add empty placeholders if needed to ensure slots are filled */}
                {Array.from({ length: (typeof window !== 'undefined' && window.innerWidth < 640) ? 
                  Math.max(0, 3 - group.length) : 
                  Math.max(0, 7 - group.length) }).map((_, index) => (
                  <div key={`empty-${index}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {showRightButton && (
          <button 
            onClick={() => scroll('right')} 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black shadow-lg -mr-5"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 