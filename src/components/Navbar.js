'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  fetchSearchSuggestions, 
  fetchMostPopular, 
  fetchTopAiring, 
  fetchRecentEpisodes, 
  fetchMostFavorite, 
  fetchTopUpcoming 
} from '@/lib/api';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRandomLoading, setIsRandomLoading] = useState(false);
  const suggestionRef = useRef(null);
  const searchInputRef = useRef(null);
  const router = useRouter();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update suggestions when search query changes
  useEffect(() => {
    const updateSuggestions = async () => {
      // Only search if we have at least 2 characters
      if (searchQuery.trim().length >= 2) {
        setIsLoading(true);
        setShowSuggestions(true); // Always show the suggestions container when typing
        
        try {
          console.log(`Fetching suggestions for: ${searchQuery}`);
          const apiSuggestions = await fetchSearchSuggestions(searchQuery);
          console.log('API returned:', apiSuggestions);
          
          if (Array.isArray(apiSuggestions) && apiSuggestions.length > 0) {
            // Take top 5 results
            setSearchSuggestions(apiSuggestions.slice(0, 5));
          } else {
            // Create a generic suggestion based on the search query
            setSearchSuggestions([{
              id: searchQuery.toLowerCase().replace(/\s+/g, '-'),
              title: `Search for "${searchQuery}"`,
              type: "SEARCH"
            }]);
          }
        } catch (error) {
          console.error('Error in search component:', error);
          // Create a generic suggestion
          setSearchSuggestions([{
            id: searchQuery.toLowerCase().replace(/\s+/g, '-'),
            title: `Search for "${searchQuery}"`,
            type: "SEARCH"
          }]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      updateSuggestions();
    }, 300); // 300ms debounce time

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
    // Navigate to search page regardless if search is empty or not
    router.push(searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery)}` : '/search');
    setSearchQuery('');
    setShowSuggestions(false);
    setIsMenuOpen(false);
  };

  // Handle suggestion item click
  const handleAnimeClick = (id) => {
    router.push(`/anime/${id}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsMenuOpen(false);
  };

  // Handle search by query click
  const handleSearchByQueryClick = () => {
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsMenuOpen(false);
  };

  // Helper function to render clear button
  const renderClearButton = () => {
    if (searchQuery) {
      return (
        <button 
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          onClick={() => setSearchQuery('')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      );
    }
    return null;
  };

  // Function to handle input focus
  const handleInputFocus = () => {
    if (searchQuery.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  // Function to handle random anime click
  const handleRandomAnimeClick = async () => {
    setIsRandomLoading(true);
    try {
      // Randomly select a category to fetch from
      const categories = [
        { name: 'Most Popular', fetch: fetchMostPopular },
        { name: 'Top Airing', fetch: fetchTopAiring },
        { name: 'Recent Episodes', fetch: fetchRecentEpisodes },
        { name: 'Most Favorite', fetch: fetchMostFavorite },
        { name: 'Top Upcoming', fetch: fetchTopUpcoming }
      ];
      
      // Select a random category
      const randomCategoryIndex = Math.floor(Math.random() * categories.length);
      const selectedCategory = categories[randomCategoryIndex];
      
      console.log(`Fetching random anime from: ${selectedCategory.name}`);
      
      // Fetch anime from the selected category - use a random page number to get more variety
      const randomPage = Math.floor(Math.random() * 5) + 1; // Random page between 1-5
      const animeList = await selectedCategory.fetch(randomPage);
      
      if (animeList && animeList.results && animeList.results.length > 0) {
        // Skip the first few results as they tend to be more popular
        const skipCount = Math.min(5, Math.floor(animeList.results.length / 3));
        let availableAnime = animeList.results.slice(skipCount);
        
        if (availableAnime.length === 0) {
          // If we've filtered out everything, use the original list
          availableAnime = animeList.results;
        }
        
        // Get a random index
        const randomAnimeIndex = Math.floor(Math.random() * availableAnime.length);
        
        // Get the random anime ID
        const randomAnimeId = availableAnime[randomAnimeIndex].id;
        
        console.log(`Selected random anime: ${availableAnime[randomAnimeIndex].title} (ID: ${randomAnimeId})`);
        
        // Navigate to the anime page
        router.push(`/anime/${randomAnimeId}`);
      } else {
        console.error('No anime found to select randomly from');
        
        // Fallback to most popular if the chosen category fails, but use a higher page number
        const fallbackPage = Math.floor(Math.random() * 5) + 2; // Pages 2-6 for more obscure options
        const fallbackList = await fetchMostPopular(fallbackPage);
        
        if (fallbackList && fallbackList.results && fallbackList.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * fallbackList.results.length);
          const randomAnimeId = fallbackList.results[randomIndex].id;
          router.push(`/anime/${randomAnimeId}`);
        }
      }
    } catch (error) {
      console.error('Error fetching random anime:', error);
    } finally {
      setIsRandomLoading(false);
    }
  };

  return (
    <nav className={`fixed w-full z-20 transition-all duration-300 ${
      isScrolled 
        ? 'backdrop-blur-xl shadow-md bg-[#0a0a0a]/80' 
        : 'bg-transparent'
    }`}>
      <div className="flex items-center justify-between h-16 px-2 sm:px-4 md:px-[4rem]">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/home" className="flex items-center" prefetch={false}>
            <Image src="/Logo.png" alt="JustAnime Logo" width={80} height={38} className="h-[38px] w-auto" />
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden sm:flex flex-1 max-w-lg mx-auto">
          <form onSubmit={handleSearch} className="flex items-center w-full">
            <div className="relative w-full">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Anime"
                className="bg-[#1a1a1a] text-white pl-10 pr-8 py-2 rounded-md focus:outline-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleInputFocus}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              
              {renderClearButton()}
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div 
                  ref={suggestionRef}
                  className="absolute mt-2 w-full bg-[#121212] rounded-md shadow-lg z-30 border border-gray-700 overflow-hidden"
                >
                  {isLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-400 flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </div>
                  ) : searchSuggestions.length > 0 ? (
                    <>
                      <ul className="list-none m-0 p-0 w-full">
                        {searchSuggestions.map((suggestion, index) => (
                          <li key={index}>
                            <a 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (suggestion.type === 'SEARCH') {
                                  handleSearchByQueryClick();
                                } else {
                                  handleAnimeClick(suggestion.id);
                                }
                              }}
                              className="block p-2.5 text-sm text-white hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0 transition-colors duration-150 bg-[#121212] active:bg-gray-600"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-10 h-14 bg-gray-800 overflow-hidden rounded">
                                  {suggestion.image ? (
                                    <div className="relative w-full h-full">
                                      <Image 
                                        src={suggestion.image} 
                                        alt={suggestion.title}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                      <span className="text-xs text-gray-500">No img</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{suggestion.title}</div>
                                  <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                    {suggestion.year && (
                                      <span className="text-gray-400">{suggestion.year}</span>
                                    )}
                                    {suggestion.type && suggestion.type !== 'SEARCH' && (
                                      <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-300">{suggestion.type}</span>
                                    )}
                                    {suggestion.type === 'SEARCH' && (
                                      <span className="bg-blue-900 px-2 py-0.5 rounded text-blue-200">Search</span>
                                    )}
                                    {suggestion.episodes && (
                                      <span className="flex items-center text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
                                        </svg>
                                        {suggestion.episodes}
                                      </span>
                                    )}
                                    {suggestion.rating && (
                                      <span className="flex items-center text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                                          <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z" />
                                        </svg>
                                        {suggestion.rating}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSearchByQueryClick();
                        }}
                        className="block p-2 border-t border-gray-700 bg-[#121212] hover:bg-gray-700 cursor-pointer transition-colors duration-150 active:bg-gray-600 text-center"
                      >
                        <div className="text-sm text-gray-300 hover:text-white py-2 flex items-center justify-center">
                          <span>VIEW ALL</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </a>
                    </>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Search Button */}
            <button
              type="submit"
              className="bg-[#1a1a1a] text-white p-2 rounded-md transition-colors duration-200 focus:outline-none ml-2 h-[38px] w-[38px] flex items-center justify-center cursor-pointer"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
              
            {/* Random Anime Button */}
            <div className="ml-2">
              <button
                type="button"
                onClick={handleRandomAnimeClick}
                disabled={isRandomLoading}
                className="bg-[#1a1a1a] text-white p-2 rounded-md transition-colors duration-200 focus:outline-none h-[38px] w-[38px] flex items-center justify-center cursor-pointer"
                aria-label="Random Anime"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-shuffle" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z"/>
                  <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"/>
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Login Button - Desktop */}
        <div className="hidden sm:block flex-shrink-0">
          <Link 
            href="#" 
            className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200"
            prefetch={false}
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden flex items-center ml-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#1a1a1a] focus:outline-none"
          >
            <svg
              className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden absolute top-16 inset-x-0 bg-[var(--card)] shadow-lg border-t border-[var(--border)] z-10">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <div className="mb-4">
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search Anime"
                    className="bg-[#1a1a1a] text-white pl-10 pr-8 py-2 rounded-md focus:outline-none w-full text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleInputFocus}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                  
                  {/* Mobile Clear Button */}
                  {searchQuery && (
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setSearchQuery('')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Mobile Search Suggestions */}
                  {showSuggestions && (
                    <div 
                      className="absolute mt-2 w-full bg-[#121212] rounded-md shadow-lg z-30 border border-gray-700 overflow-hidden"
                    >
                      {isLoading ? (
                        <div className="px-4 py-3 text-sm text-gray-400 flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </div>
                      ) : searchSuggestions.length > 0 ? (
                        <>
                          <ul className="list-none m-0 p-0 w-full">
                            {searchSuggestions.map((suggestion, index) => (
                              <li key={index}>
                                <a 
                                  href="#" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (suggestion.type === 'SEARCH') {
                                      handleSearchByQueryClick();
                                    } else {
                                      handleAnimeClick(suggestion.id);
                                    }
                                  }}
                                  className="block p-2.5 text-sm text-white hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0 transition-colors duration-150 bg-[#121212] active:bg-gray-600"
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-10 h-14 bg-gray-800 overflow-hidden rounded">
                                      {suggestion.image ? (
                                        <div className="relative w-full h-full">
                                          <Image 
                                            src={suggestion.image} 
                                            alt={suggestion.title}
                                            fill
                                            sizes="40px"
                                            className="object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                          <span className="text-xs text-gray-500">No img</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">{suggestion.title}</div>
                                      <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                        {suggestion.year && (
                                          <span className="text-gray-400">{suggestion.year}</span>
                                        )}
                                        {suggestion.type && suggestion.type !== 'SEARCH' && (
                                          <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-300">{suggestion.type}</span>
                                        )}
                                        {suggestion.type === 'SEARCH' && (
                                          <span className="bg-blue-900 px-2 py-0.5 rounded text-blue-200">Search</span>
                                        )}
                                        {suggestion.episodes && (
                                          <span className="flex items-center text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
                                            </svg>
                                            {suggestion.episodes}
                                          </span>
                                        )}
                                        {suggestion.rating && (
                                          <span className="flex items-center text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                                              <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z" />
                                            </svg>
                                            {suggestion.rating}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </a>
                              </li>
                            ))}
                          </ul>
                          <a 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSearchByQueryClick();
                              setIsMenuOpen(false);
                            }}
                            className="block p-2 border-t border-gray-700 bg-[#121212] hover:bg-gray-700 cursor-pointer transition-colors duration-150 active:bg-gray-600 text-center"
                          >
                            <div className="text-sm text-gray-300 hover:text-white py-2 flex items-center justify-center">
                              <span>VIEW ALL</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </a>
                        </>
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-400">
                          No results found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Search Button - Mobile */}
                <button
                  type="submit"
                  className="bg-[#1a1a1a] text-white p-2 rounded-md transition-colors duration-200 focus:outline-none ml-2 h-[34px] w-[34px] flex items-center justify-center cursor-pointer"
                  aria-label="Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>

                {/* Random Anime Button - Mobile */}
                <button
                  type="button"
                  onClick={handleRandomAnimeClick}
                  disabled={isRandomLoading}
                  className="bg-[#1a1a1a] text-white p-2 rounded-md transition-colors duration-200 focus:outline-none ml-2 h-[34px] w-[34px] flex items-center justify-center cursor-pointer"
                  aria-label="Random Anime"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-shuffle" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z"/>
                    <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"/>
                  </svg>
                </button>
              </form>
            </div>
            
            <div className="pt-4 border-t border-[var(--border)]">
              <Link 
                href="#" 
                className="block px-3 py-2 text-base font-medium text-white bg-[var(--primary)] hover:bg-opacity-90 rounded-md"
                onClick={() => setIsMenuOpen(false)}
                prefetch={false}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 