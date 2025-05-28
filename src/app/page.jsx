'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSearchSuggestions } from '@/lib/api';
import Image from 'next/image';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const suggestionRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Create separate delays for staggered loading of FAQ items
  const faqDelays = ['0.6s', '0.7s', '0.8s'];
  
  // For FAQ dropdowns
  const [openFAQ, setOpenFAQ] = useState(null);
  
  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Fetch search suggestions when search query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const suggestions = await fetchSearchSuggestions(searchQuery);
          setSearchSuggestions(suggestions || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching search suggestions:', error);
          setSearchSuggestions([]);
        }
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current && 
        !suggestionRef.current.contains(event.target) &&
        !searchInputRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search/${searchQuery}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (title) => {
    router.push(`/search/${title}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col relative">
      {/* Background Image with Fade Effect */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
        <Image
          src="/LandingPage.jpg"
          alt="Dark anime character background"
          fill
          priority
          className="object-cover opacity-45"
          sizes="100vw"
          style={{ objectPosition: 'center' }}
        />
        {/* Ultra-smooth gradient for fade from bottom */}
        <div className="absolute inset-0" 
             style={{
               background: `linear-gradient(to top, 
                 var(--background) 0%, 
                 var(--background) 25%, 
                 rgba(10,10,10,0.97) 35%,
                 rgba(10,10,10,0.95) 40%,
                 rgba(10,10,10,0.93) 42%,
                 rgba(10,10,10,0.90) 44%,
                 rgba(10,10,10,0.87) 46%,
                 rgba(10,10,10,0.84) 48%,
                 rgba(10,10,10,0.81) 50%,
                 rgba(10,10,10,0.78) 52%,
                 rgba(10,10,10,0.75) 54%,
                 rgba(10,10,10,0.72) 56%,
                 rgba(10,10,10,0.69) 58%,
                 rgba(10,10,10,0.66) 60%,
                 rgba(10,10,10,0.63) 62%,
                 rgba(10,10,10,0.60) 64%,
                 rgba(10,10,10,0.57) 66%,
                 rgba(10,10,10,0.54) 68%,
                 rgba(10,10,10,0.51) 70%,
                 rgba(10,10,10,0.48) 72%,
                 rgba(10,10,10,0.45) 74%,
                 rgba(10,10,10,0.42) 76%,
                 rgba(10,10,10,0.39) 78%,
                 rgba(10,10,10,0.36) 80%,
                 rgba(10,10,10,0.33) 82%,
                 rgba(10,10,10,0.30) 84%,
                 rgba(10,10,10,0.27) 86%,
                 rgba(10,10,10,0.24) 88%,
                 rgba(10,10,10,0.21) 90%,
                 rgba(10,10,10,0.18) 92%,
                 rgba(10,10,10,0.15) 94%,
                 rgba(10,10,10,0.12) 96%,
                 rgba(10,10,10,0.09) 98%,
                 rgba(10,10,10,0.06) 100%)`
             }}>
        </div>
      </div>
      
      {/* Unified Content Section */}
      <section className="relative flex flex-col items-center text-center px-4 py-6 z-10">
        {/* Hero Content */}
        <div className="w-full max-w-3xl mx-auto fade-in flex flex-col items-center mb-20">
          {/* Logo */}
          <div className="mb-8 pt-16 md:pt-24 lg:pt-32">
            <Image
              src="/Logo.png"
              alt="JustAnime Logo"
              width={200}
              height={60}
              className="mx-auto"
              priority
            />
          </div>
          
          {/* Search Bar */}
          <div className="w-full max-w-xl mb-8 relative">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative w-full">
                <input
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search anime..." 
                  className="w-full px-5 py-4 pl-12 rounded-lg bg-[var(--card)] bg-opacity-80 backdrop-blur-sm border border-[var(--border)] text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-white focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div 
                ref={suggestionRef}
                className="absolute mt-2 w-full bg-[var(--card)] bg-opacity-90 backdrop-blur-sm rounded-md shadow-lg z-30 max-h-60 overflow-y-auto border border-[var(--border)]"
              >
                {searchSuggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="px-4 py-3 text-sm text-white hover:bg-[var(--hover)] cursor-pointer transition-colors duration-200"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Enter Homepage Button */}
          <Link 
            href="/home"
            className="bg-white hover:bg-gray-200 text-[#0a0a0a] font-medium px-8 py-3 rounded-md max-w-[200px] text-center transition-colors border border-[var(--border)] flex items-center justify-center gap-2 whitespace-nowrap shadow-lg"
          >
            Enter Homepage <span>→</span>
          </Link>
        </div>

        {/* FAQ Content - with fade-in animation matching the hero section */}
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-6 fade-in" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-white">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)] fade-in" style={{ animationDelay: faqDelays[0] }}>
              <button 
                className="w-full flex justify-between items-center p-3 sm:p-4 text-left hover:bg-opacity-90 transition-colors" 
                onClick={() => toggleFAQ(0)}
              >
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white pr-2">Is JustAnime safe?</h3>
                <svg 
                  className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transform transition-transform duration-300 ease-out ${openFAQ === 0 ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div 
                className={`overflow-hidden bg-[var(--background)] transform transition-all duration-300 ease-out ${
                  openFAQ === 0 ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-3 sm:p-4 border-t border-[var(--border)]">
                  <p className="text-[var(--text-muted)] text-left text-sm sm:text-base">Yes. We started this site to improve UX and are committed to keeping our users safe. We encourage all our users to notify us if anything looks suspicious.</p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)] fade-in" style={{ animationDelay: faqDelays[1] }}>
              <button 
                className="w-full flex justify-between items-center p-3 sm:p-4 text-left hover:bg-opacity-90 transition-colors" 
                onClick={() => toggleFAQ(1)}
              >
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white pr-2">What makes JustAnime the best site to watch anime free online?</h3>
                <svg 
                  className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transform transition-transform duration-300 ease-out ${openFAQ === 1 ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div 
                className={`overflow-hidden bg-[var(--background)] transform transition-all duration-300 ease-out ${
                  openFAQ === 1 ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-3 sm:p-4 border-t border-[var(--border)]">
                  <ul className="text-[var(--text-muted)] space-y-2 sm:space-y-3 list-disc pl-5 text-left text-sm sm:text-base">
                    <li><span className="font-medium text-white">Content library:</span> Our extensive database ensures you can find almost everything here.</li>
                    <li><span className="font-medium text-white">Streaming experience:</span> We have top of the line streaming servers. You can simply choose one that is fast for you.</li>
                    <li><span className="font-medium text-white">Quality/Resolution:</span> All our video files are encoded in highest possible resolution. We also have quality setting function that allows every user to enjoy streaming regardless of their internet speed.</li>
                    <li><span className="font-medium text-white">Updates:</span> Our content is updated hourly, so you will get update as fast as possible.</li>
                    <li><span className="font-medium text-white">User interface:</span> We focus on the simple and easy to use, so you will feel the life is easier here. We also have almost every feature that other anime streaming sites have, but not the opposite.</li>
                    <li><span className="font-medium text-white">Device compatibility:</span> JustAnime works fine on both desktop and mobile devices, even with old browsers, so you can enjoy your anime anywhere you want.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)] fade-in" style={{ animationDelay: faqDelays[2] }}>
              <button 
                className="w-full flex justify-between items-center p-3 sm:p-4 text-left hover:bg-opacity-90 transition-colors" 
                onClick={() => toggleFAQ(2)}
              >
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white pr-2">Why should I choose JustAnime?</h3>
                <svg 
                  className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transform transition-transform duration-300 ease-out ${openFAQ === 2 ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div 
                className={`overflow-hidden bg-[var(--background)] transform transition-all duration-300 ease-out ${
                  openFAQ === 2 ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-3 sm:p-4 border-t border-[var(--border)]">
                  <p className="text-[var(--text-muted)] text-left text-sm sm:text-base">
                    If you want a good and safe place to watch anime online for free, give JustAnime a try, and if you like what we provide, please help us by sharing JustAnime to your friends and do not forget to bookmark our site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 