'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchAnime, fetchMostPopular } from '@/lib/api';
import AnimeCard from '@/components/AnimeCard';
import AnimeFilters from '@/components/AnimeFilters';

function SearchResults() {
  const searchParams = useSearchParams();
  const queryTerm = searchParams.get('q') || '';
  const genreParam = searchParams.get('genre') || null;
  
  const [animeList, setAnimeList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(genreParam);
  const [yearFilter, setYearFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [error, setError] = useState(null);
  const [isEmptySearch, setIsEmptySearch] = useState(false);

  // Current year for filtering
  const currentYear = new Date().getFullYear();

  // Process and augment anime data to ensure all items have year information
  const processAnimeData = useCallback((animeData) => {
    if (!animeData || !animeData.results) return animeData;

    // Create a copy of the data to avoid mutating the original
    const processedData = {
      ...animeData,
      results: animeData.results.map(anime => {
        const processed = { ...anime };
        
        // Extract or estimate year from various properties
        // Fallback to randomized year range between 2000-current year if no year data available
        if (!processed.year) {
          if (processed.releaseDate && !isNaN(parseInt(processed.releaseDate))) {
            processed.year = parseInt(processed.releaseDate);
          } else if (processed.date && !isNaN(parseInt(processed.date))) {
            processed.year = parseInt(processed.date);
          } else {
            // Assign a semi-random year based on anime ID to ensure consistency
            const hash = processed.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            processed.year = 2000 + (hash % (currentYear - 2000 + 1));
          }
        }
        
        return processed;
      })
    };
    
    return processedData;
  }, [currentYear]);

  // Create filters object for API request
  const getFiltersForApi = useCallback(() => {
    const filters = {};
    
    if (selectedGenre) filters.genre = selectedGenre;
    if (yearFilter !== 'all') filters.year = yearFilter;
    if (sortOrder !== 'default') filters.sort = sortOrder;
    
    // Support all client-side filters in API call when possible
    if (selectedSeasons.length > 0) filters.season = selectedSeasons.join(',');
    if (selectedTypes.length > 0) filters.type = selectedTypes.join(',');
    if (selectedStatus.length > 0) filters.status = selectedStatus.join(',');
    if (selectedLanguages.length > 0) filters.language = selectedLanguages.join(',');
    
    return filters;
  }, [selectedGenre, yearFilter, sortOrder, selectedSeasons, selectedTypes, selectedStatus, selectedLanguages]);

  // Apply client-side filters for things not supported by API
  const applyClientSideFilters = useCallback((animeList) => {
    if (!animeList.length) return [];
    
    let result = [...animeList];
    
    // Apply season filter if selected
    if (selectedSeasons.length > 0) {
      result = result.filter(anime => {
        if (!anime.season) return false;
        
        const animeSeason = typeof anime.season === 'string' 
          ? anime.season 
          : anime.season?.name || '';
          
        return selectedSeasons.some(season => 
          animeSeason.toLowerCase().includes(season.toLowerCase())
        );
      });
    }
    
    // Apply type filter if selected
    if (selectedTypes.length > 0) {
      result = result.filter(anime => {
        if (!anime.type) return false;
        
        return selectedTypes.some(type => 
          anime.type.toLowerCase() === type.toLowerCase()
        );
      });
    }
    
    // Apply status filter if selected
    if (selectedStatus.length > 0) {
      result = result.filter(anime => {
        if (!anime.status) return false;
        
        return selectedStatus.some(status => 
          anime.status.toLowerCase().includes(status.toLowerCase())
        );
      });
    }
    
    // Apply language filter if selected
    if (selectedLanguages.length > 0) {
      result = result.filter(anime => {
        // If no language info, assume subbed (most common)
        const animeLanguage = anime.language || 'Subbed';
        
        return selectedLanguages.some(language => 
          animeLanguage.toLowerCase().includes(language.toLowerCase())
        );
      });
    }
    
    // Apply client-side sorting (when API sort is not supported)
    if (sortOrder !== 'default') {
      switch (sortOrder) {
        case 'title-asc':
          result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          break;
        case 'title-desc':
          result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
          break;
        case 'year-desc':
          result.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
          break;
        case 'year-asc':
          result.sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0));
          break;
        // Default order from API is used when sortOrder is 'default'
      }
    }
    
    return result;
  }, [selectedSeasons, selectedTypes, selectedStatus, selectedLanguages, sortOrder]);

  // Fetch most popular anime when search is empty
  const fetchPopularAnime = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsEmptySearch(true);
    
    try {
      const data = await fetchMostPopular(1);
      const processedData = processAnimeData(data);
      
      const results = processedData.results || [];
      setAnimeList(results);
      
      // Apply client-side filters
      const filteredResults = applyClientSideFilters(results);
      setFilteredList(filteredResults);
      
      setHasNextPage(processedData.hasNextPage || false);
    } catch (error) {
      console.error('Error fetching popular anime:', error);
      setError('Failed to fetch popular anime. Please try again later.');
      setAnimeList([]);
      setFilteredList([]);
    } finally {
      setIsLoading(false);
    }
  }, [processAnimeData, applyClientSideFilters]);

  // Fetch data from API when search term or main filters change
  useEffect(() => {
    const fetchData = async () => {
      if (!queryTerm.trim()) {
        // Show popular anime instead of empty results
        fetchPopularAnime();
        return;
      }

      setIsLoading(true);
      setError(null);
      setCurrentPage(1);
      setIsEmptySearch(false);
      
      try {
        const filters = getFiltersForApi();
        console.log(`[Search] Searching for: "${queryTerm}" with filters:`, filters);
        
        const data = await searchAnime(queryTerm, 1, filters);
        
        // If no results but no error was thrown, show empty state
        if (!data || (!data.results || data.results.length === 0)) {
          console.log('[Search] No results found for search term:', queryTerm);
          setError(`No results found for "${queryTerm}"`);
          setAnimeList([]);
          setFilteredList([]);
          setIsLoading(false);
          return;
        }
        
        const processedData = processAnimeData(data);
        const results = processedData.results || [];
        setAnimeList(results);
        
        // Only apply client-side filters for things not supported by API
        const filteredResults = applyClientSideFilters(results);
        setFilteredList(filteredResults);
        
        setHasNextPage(processedData.hasNextPage || false);
      } catch (error) {
        console.error('[Search] Error searching anime:', error);
        setError('Failed to search anime. Please try again later or check your internet connection.');
        setAnimeList([]);
        setFilteredList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [queryTerm, getFiltersForApi, processAnimeData, applyClientSideFilters, fetchPopularAnime]);

  // Handle pagination
  useEffect(() => {
    // Skip if it's the first page (already fetched in the previous effect)
    // or if no search term is provided
    if (currentPage === 1) {
      return;
    }

    const loadMoreData = async () => {
      setIsLoading(true);
      
      try {
        // If it's an empty search query, load more popular anime
        if (isEmptySearch) {
          const data = await fetchMostPopular(currentPage);
          const processedData = processAnimeData(data);
          
          const newResults = processedData.results || [];
          setAnimeList(prev => [...prev, ...newResults]);
          
          // Apply client-side filters to new results
          const filteredNewResults = applyClientSideFilters(newResults);
          setFilteredList(prev => [...prev, ...filteredNewResults]);
          
          setHasNextPage(processedData.hasNextPage || false);
        } else {
          // For search results, include filters
          const filters = getFiltersForApi();
          const data = await searchAnime(queryTerm, currentPage, filters);
          const processedData = processAnimeData(data);
          
          const newResults = processedData.results || [];
          setAnimeList(prev => [...prev, ...newResults]);
          
          // Only apply client-side filters for things not supported by API
          const filteredNewResults = applyClientSideFilters(newResults);
          setFilteredList(prev => [...prev, ...filteredNewResults]);
          
          setHasNextPage(processedData.hasNextPage || false);
        }
      } catch (error) {
        console.error('Error loading more anime:', error);
        setError('Failed to load more results. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMoreData();
  }, [currentPage, queryTerm, isEmptySearch, getFiltersForApi, processAnimeData, applyClientSideFilters]);

  // Re-apply client-side filters when filters change but don't need API refetch
  useEffect(() => {
    const applyFilters = () => {
      const filteredResults = applyClientSideFilters(animeList);
      setFilteredList(filteredResults);
    };
    
    applyFilters();
  }, [selectedSeasons, selectedTypes, selectedStatus, selectedLanguages, animeList, applyClientSideFilters]);

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    if (currentPage !== 1) setCurrentPage(1);
  };

  const handleYearChange = (year) => {
    setYearFilter(year);
    if (currentPage !== 1) setCurrentPage(1);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    if (currentPage !== 1) setCurrentPage(1);
  };
  
  const handleSeasonChange = (seasons) => {
    setSelectedSeasons(seasons);
    if (currentPage !== 1) setCurrentPage(1);
  };
  
  const handleTypeChange = (types) => {
    setSelectedTypes(types);
    if (currentPage !== 1) setCurrentPage(1);
  };
  
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    if (currentPage !== 1) setCurrentPage(1);
  };
  
  const handleLanguageChange = (languages) => {
    setSelectedLanguages(languages);
    if (currentPage !== 1) setCurrentPage(1);
  };

  return (
    <div className="px-4 md:px-[4rem] py-8 min-h-screen">
      {/* Horizontal filters at the top */}
      <div className="mb-8">
        <AnimeFilters 
          selectedGenre={selectedGenre}
          onGenreChange={handleGenreChange}
          yearFilter={yearFilter}
          onYearChange={handleYearChange}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          showGenreFilter={true}
          searchQuery={queryTerm}
          onSearchChange={() => {}}
          selectedSeasons={selectedSeasons}
          onSeasonChange={handleSeasonChange}
          selectedTypes={selectedTypes}
          onTypeChange={handleTypeChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          selectedLanguages={selectedLanguages}
          onLanguageChange={handleLanguageChange}
        />
      </div>

      {/* Main content */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-zinc-200">
            {queryTerm ? `Results for "${queryTerm}"` : 'Popular Anime'}
          </h2>
          <div className="text-sm text-zinc-400">
            {filteredList.length > 0 && (
              <span>{filteredList.length} {filteredList.length === 1 ? 'result' : 'results'}</span>
            )}
          </div>
        </div>

        {error ? (
          <div className="text-center py-16">
            <p className="text-red-400">{error}</p>
          </div>
        ) : isLoading && currentPage === 1 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            {/* Loading skeleton */}
            {[...Array(24)].map((_, index) => (
              <div key={index} className="animate-pulse bg-gray-800 rounded-md h-64"></div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-400">No anime found matching your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 mb-8">
              {filteredList.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
            
            {/* Load more button */}
            {hasNextPage && (
              <div className="flex justify-center mt-8 mb-4">
                <button
                  className="px-6 py-2 bg-[#1a1a1a] text-white rounded-md hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
} 