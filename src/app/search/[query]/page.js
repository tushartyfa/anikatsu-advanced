'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AnimeCard from '@/components/AnimeCard';
import AnimeFilters from '@/components/AnimeFilters';
import { searchAnime, fetchMostPopular } from '@/lib/api';

export default function SearchPage() {
  const router = useRouter();
  const { query } = useParams();
  const decodedQuery = query ? decodeURIComponent(query) : '';
  
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isEmptySearch, setIsEmptySearch] = useState(false);
  
  // Filter states
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [yearFilter, setYearFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [error, setError] = useState(null);

  // Create filters object for API request
  const getFiltersForApi = useCallback(() => {
    const filters = {};
    
    if (selectedGenre) filters.genre = selectedGenre;
    if (yearFilter !== 'all') filters.year = yearFilter;
    if (sortOrder !== 'default') filters.sort = sortOrder;
    
    // Only add these filters if API supports them
    // Currently, these may need to be handled client-side
    // if (selectedSeasons.length > 0) filters.seasons = selectedSeasons;
    // if (selectedTypes.length > 0) filters.types = selectedTypes;
    // if (selectedStatus.length > 0) filters.status = selectedStatus;
    // if (selectedLanguages.length > 0) filters.languages = selectedLanguages;
    
    return filters;
  }, [selectedGenre, yearFilter, sortOrder]);

  // Apply client-side filters
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

  // Fetch popular anime when search is empty
  const fetchPopularAnime = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    setIsEmptySearch(true);
    
    try {
      const data = await fetchMostPopular(page);
      
      if (page === 1) {
        setSearchResults(data.results || []);
      } else {
        setSearchResults(prev => [...prev, ...(data.results || [])]);
      }
      
      setHasNextPage(data.hasNextPage || false);
    } catch (error) {
      console.error('Error fetching popular anime:', error);
      setError('Failed to fetch popular anime. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // If the query param is empty, redirect to search page with empty query
    if (!decodedQuery.trim()) {
      // Fetch popular anime instead
      fetchPopularAnime(currentPage);
      return;
    }
    
    setIsEmptySearch(false);
    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const filters = getFiltersForApi();
        const data = await searchAnime(decodedQuery, currentPage, filters);
        
        if (currentPage === 1) {
          setSearchResults(data.results || []);
        } else {
          setSearchResults(prev => [...prev, ...(data.results || [])]);
        }
        
        setHasNextPage(data.hasNextPage || false);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('Failed to search anime. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [decodedQuery, currentPage, getFiltersForApi, fetchPopularAnime]);

  // Apply client-side filters whenever search results or filter settings change
  useEffect(() => {
    const filteredResults = applyClientSideFilters(searchResults);
    setFilteredResults(filteredResults);
  }, [searchResults, applyClientSideFilters]);

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  // Filter handlers
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
    <div className="px-4 md:px-8 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-4">
          {decodedQuery.trim() ? `Search Results for "${decodedQuery}"` : 'Popular Anime'}
        </h1>
        
        {/* Filters */}
        <AnimeFilters 
          selectedGenre={selectedGenre}
          onGenreChange={handleGenreChange}
          yearFilter={yearFilter}
          onYearChange={handleYearChange}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          showGenreFilter={true}
          searchQuery={decodedQuery}
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

      {isLoading && currentPage === 1 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium text-white mb-2">Error</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      ) : filteredResults.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredResults.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
          
          {hasNextPage && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className={`px-6 py-3 bg-[var(--secondary)] text-white rounded-md ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
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
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium text-white mb-2">No results found</h3>
          <p className="text-gray-400">
            We couldn&apos;t find any anime matching your search criteria. Please try different filters or a different search term.
          </p>
        </div>
      )}
    </div>
  );
} 