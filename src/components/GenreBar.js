'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { fetchGenres } from '@/lib/api';

export default function GenreBar() {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLeftButton, setShowLeftButton] = useState(true); // Always show left button initially
  const [showRightButton, setShowRightButton] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef(null);
  const containerRef = useRef(null);
  const [visibleGenres, setVisibleGenres] = useState(14);
  
  // Function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  // Predefined genres exactly as specified
  const defaultGenres = [
    "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", 
    "Horror", "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological",
    "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"
  ];
  
  // Handle long names on mobile
  const getMobileGenreName = (genre) => {
    // Abbreviate long genre names for mobile view
    switch(genre) {
      case "Psychological": return "Psycho";
      case "Mahou Shoujo": return "Mahou";
      case "Supernatural": return "Super";
      case "Slice of Life": return "SoL";
      default: return genre;
    }
  };
  
  // Detect mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Calculate the number of genres that fit in the container
  useEffect(() => {
    const calculateVisibleGenres = () => {
      const container = containerRef.current;
      if (container) {
        const containerWidth = container.offsetWidth;
        // Approximate width of each genre button
        const genreButtonWidth = isMobile ? 72 : 88; // Slightly larger on mobile to fit text
        const visibleCount = Math.floor((containerWidth - 80) / genreButtonWidth);
        // Minimum genres visible (smaller minimum on mobile)
        setVisibleGenres(Math.max(visibleCount, isMobile ? 4 : 8));
      }
    };
    
    calculateVisibleGenres();
    window.addEventListener('resize', calculateVisibleGenres);
    
    return () => {
      window.removeEventListener('resize', calculateVisibleGenres);
    };
  }, [isMobile]);
  
  useEffect(() => {
    // Force scroll position slightly to the right initially
    // to ensure there are genres on both sides for scrolling
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = 40; // Start slightly scrolled
        // Trigger scroll event to update button states
        scrollContainerRef.current.dispatchEvent(new Event('scroll'));
      }
    }, 100);
    
    setGenres(defaultGenres);
    setIsLoading(false);
  }, []);
  
  // Check scroll position to determine button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        
        // Show left button if not at the start
        setShowLeftButton(scrollLeft > 5);
        
        // Show right button if not at the end
        setShowRightButton(scrollLeft < scrollWidth - clientWidth - 5);
      }
    };
    
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
  
  // Scroll left/right functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? -80 : -200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? 80 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  // Mobile-specific styles
  const mobileButtonStyle = {
    padding: '0.15rem 0.5rem',
    fontSize: '0.65rem',
    height: '1.5rem',
    minWidth: '4rem',
    maxWidth: '5.5rem',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  
  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden">
        <div className="flex space-x-2 md:space-x-4 py-2 animate-pulse justify-between px-4 md:px-8">
          {[...Array(isMobile ? 5 : visibleGenres)].map((_, i) => (
            <div key={i} className="h-6 md:h-7 bg-[#1f1f1f] rounded-md flex-1 max-w-[100px] min-w-[60px] md:min-w-[80px]"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Left fade effect */}
      <div className="absolute left-0 top-0 h-full w-6 md:w-16 z-10 pointer-events-none" 
           style={{ background: 'linear-gradient(to right, var(--background) 30%, transparent 100%)' }}>
      </div>
      
      {/* Left scroll button - only visible when not at the leftmost position */}
      {showLeftButton && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-[var(--background)] bg-opacity-40 backdrop-blur-sm rounded-full p-0.5 md:p-1 shadow-lg transition-opacity"
          aria-label="Scroll left"
          style={isMobile ? { left: '2px', padding: '2px' } : {}}
        >
          <svg className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      )}
      
      {/* Scrollable genre container */}
      <div className="w-full">
        <div 
          ref={scrollContainerRef}
          className="flex py-1.5 md:py-2 overflow-x-auto scrollbar-hide px-5 md:px-8"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            display: 'grid',
            gridAutoFlow: 'column',
            gridAutoColumns: `minmax(${Math.floor(100 / (isMobile ? 4.5 : visibleGenres))}%, ${Math.floor(100 / (isMobile ? 3 : visibleGenres - 2))}%)`,
            gap: isMobile ? '6px' : '8px',
            scrollSnapType: isMobile ? 'x mandatory' : 'none',
            WebkitOverflowScrolling: 'touch' // For smoother scrolling on iOS
          }}
        >
          {genres.map((genre) => (
            <Link
              key={genre}
              href={`/search?genre=${genre.toLowerCase()}`}
              className="bg-[#1f1f1f] text-white rounded-md hover:bg-white/20 transition-colors text-xs font-medium flex items-center justify-center h-6 md:h-7 px-1 md:px-2 scroll-snap-align-start"
              style={isMobile ? mobileButtonStyle : {}}
              title={genre} // Add tooltip showing full name
            >
              {isMobile ? getMobileGenreName(genre) : genre}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Right fade effect */}
      <div className="absolute right-0 top-0 h-full w-6 md:w-16 z-10 pointer-events-none"
           style={{ background: 'linear-gradient(to left, var(--background) 30%, transparent 100%)' }}>
      </div>
      
      {/* Right scroll button - only visible when not at the rightmost position */}
      {showRightButton && (
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-[var(--background)] bg-opacity-40 backdrop-blur-sm rounded-full p-0.5 md:p-1 shadow-lg transition-opacity"
          aria-label="Scroll right"
          style={isMobile ? { right: '2px', padding: '2px' } : {}}
        >
          <svg className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      )}
    </div>
  );
} 