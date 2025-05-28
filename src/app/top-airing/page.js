'use client';

import { useState, useEffect, useRef } from 'react';
import AnimeCard from '@/components/AnimeCard';
import AnimeFilters from '@/components/AnimeFilters';
import { fetchTopAiring } from '@/lib/api';

export default function TopAiringPage() {
  const [animeList, setAnimeList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [yearFilter, setYearFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [error, setError] = useState(null);

  // Current year for filtering
  const currentYear = new Date().getFullYear();
  
  // Add ref to track if this is the first render
  const initialRender = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTopAiring(currentPage);
        
        if (currentPage === 1) {
          setAnimeList(data.results || []);
        } else {
          setAnimeList(prev => [...prev, ...(data.results || [])]);
        }
        
        setHasNextPage(data.hasNextPage || false);
      } catch (error) {
        console.error('Error fetching top airing anime:', error);
        setError('Failed to load anime. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  // Apply filters and sorting whenever the anime list or filter settings change
  useEffect(() => {
    // Skip the initial render effect to avoid duplicate filtering
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    if (!animeList.length) {
      setFilteredList([]);
      return;
    }

    let result = [...animeList];

    // Search filter
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(anime => {
        const title = (anime.title || '').toLowerCase();
        const otherNames = (anime.otherNames || '').toLowerCase();
        return title.includes(query) || otherNames.includes(query);
      });
    }

    // Filter by genre if selected
    if (selectedGenre) {
      result = result.filter(anime => {
        if (anime.genres && Array.isArray(anime.genres)) {
          return anime.genres.some(g => 
            g.toLowerCase() === selectedGenre.toLowerCase() || 
            (g.name && g.name.toLowerCase() === selectedGenre.toLowerCase())
          );
        } else if (anime.genre) {
          return anime.genre.toLowerCase().includes(selectedGenre.toLowerCase());
        }
        return false;
      });
    }

    // Filter by season
    if (selectedSeasons.length > 0) {
      result = result.filter(anime => {
        const season = getAnimeSeason(anime);
        return selectedSeasons.includes(season);
      });
    }

    // Filter by year
    if (yearFilter !== 'all') {
      result = result.filter(anime => {
        const animeYear = parseInt(anime.year) || 0;
        if (yearFilter === 'older') {
          return animeYear < 2000;
        } else {
          return animeYear.toString() === yearFilter;
        }
      });
    }

    // Filter by type
    if (selectedTypes.length > 0) {
      result = result.filter(anime => 
        selectedTypes.includes(anime.type)
      );
    }

    // Filter by status
    if (selectedStatus.length > 0) {
      result = result.filter(anime => {
        const status = anime.status || getDefaultStatus(anime);
        return selectedStatus.includes(status);
      });
    }

    // Filter by language
    if (selectedLanguages.length > 0) {
      result = result.filter(anime => {
        const language = anime.language || getDefaultLanguage(anime);
        return selectedLanguages.includes(language);
      });
    }

    // Apply sorting
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
      default:
        // Default order from API
        break;
    }

    setFilteredList(result);
  }, [animeList, selectedGenre, yearFilter, sortOrder, searchQuery, selectedSeasons, selectedTypes, selectedStatus, selectedLanguages]);

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
  };

  const handleYearChange = (year) => {
    setYearFilter(year);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleSeasonChange = (seasons) => {
    setSelectedSeasons(seasons);
  };

  const handleTypeChange = (types) => {
    setSelectedTypes(types);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const handleLanguageChange = (languages) => {
    setSelectedLanguages(languages);
  };

  return (
    <div className="px-4 md:px-[4rem] py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white">Top Airing Anime</h1>
      
      {/* Filters */}
      <div className="mb-8">
        <AnimeFilters 
          selectedGenre={selectedGenre}
          onGenreChange={handleGenreChange}
          yearFilter={yearFilter}
          onYearChange={handleYearChange}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          showGenreFilter={true}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
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
      
      {isLoading && animeList.length === 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {[...Array(14)].map((_, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow animate-pulse h-64">
              <div className="w-full h-40 bg-gray-700"></div>
              <div className="p-3">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (filteredList.length > 0 || animeList.length > 0) ? (
        <>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            {(filteredList.length > 0 ? filteredList : animeList).map((anime) => (
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
          <h3 className="text-xl font-medium text-white mb-2">No anime found</h3>
          <p className="text-gray-400">
            We couldn&apos;t find any top airing anime at this time. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
} 