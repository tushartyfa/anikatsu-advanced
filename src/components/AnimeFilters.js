'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchGenres } from '@/lib/api';
import { ChevronDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Helper function to capitalize first letter of each word
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

export default function AnimeFilters({ 
  selectedGenre, 
  onGenreChange, 
  yearFilter, 
  onYearChange, 
  sortOrder, 
  onSortChange,
  showGenreFilter = true,
  searchQuery = '',
  onSearchChange,
  selectedSeasons = [],
  onSeasonChange,
  selectedTypes = [],
  onTypeChange,
  selectedStatus = [],
  onStatusChange,
  selectedLanguages = [],
  onLanguageChange
}) {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdowns, setDropdowns] = useState({
    genre: false,
    season: false,
    year: false,
    type: false,
    status: false,
    language: false,
    sort: false
  });
  const dropdownRefs = useRef({
    genre: null,
    season: null,
    year: null,
    type: null,
    status: null,
    language: null,
    sort: null
  });

  // Available years for filter (current year down to 2000 and 'older')
  const currentYear = new Date().getFullYear();
  const years = ['all', ...Array.from({ length: currentYear - 1999 }, (_, i) => (currentYear - i).toString()), 'older'];

  // Seasons data
  const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
  
  // Types data
  const types = ['TV', 'Movie', 'OVA', 'ONA', 'Special'];
  
  // Status data
  const statuses = ['Ongoing', 'Completed', 'Upcoming'];
  
  // Languages data
  const languages = ['Subbed', 'Dubbed', 'Chinese', 'English'];

  // Fetch genres on component mount
  useEffect(() => {
    const getGenres = async () => {
      if (!showGenreFilter) return;
      
      try {
        setIsLoading(true);
        const genreData = await fetchGenres();
        // Capitalize each genre
        const capitalizedGenres = genreData ? genreData.map(capitalizeFirstLetter) : [];
        setGenres(capitalizedGenres);
      } catch (error) {
        console.error('Error fetching genres:', error);
        setError('Failed to load genres. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    getGenres();
  }, [showGenreFilter]);

  // Toggle dropdown visibility
  const toggleDropdown = (dropdown) => {
    setDropdowns(prev => {
      // Close other dropdowns when opening one
      const newState = {
        genre: false,
        season: false,
        year: false,
        type: false,
        status: false,
        language: false,
        sort: false,
        [dropdown]: !prev[dropdown]
      };
      return newState;
    });
  };

  // Initialize refs for each dropdown
  useEffect(() => {
    dropdownRefs.current = {
      genre: dropdownRefs.current.genre,
      season: dropdownRefs.current.season,
      year: dropdownRefs.current.year,
      type: dropdownRefs.current.type,
      status: dropdownRefs.current.status,
      language: dropdownRefs.current.language,
      sort: dropdownRefs.current.sort
    };
  }, []);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click was outside all dropdown containers
      let isOutside = true;
      Object.keys(dropdownRefs.current).forEach(key => {
        if (dropdownRefs.current[key] && dropdownRefs.current[key].contains(event.target)) {
          isOutside = false;
        }
      });
      
      if (isOutside) {
        setDropdowns({
          genre: false,
          season: false,
          year: false,
          type: false,
          status: false,
          language: false,
          sort: false
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevent dropdown from closing when selecting an item in multiselect
  const keepDropdownOpen = (e, dropdown) => {
    e.stopPropagation();
    // Don't toggle the dropdown state on item click for multi-select dropdowns
  };

  const handleClearGenre = (e) => {
    e.stopPropagation();
    if (onGenreChange) {
      onGenreChange(null);
    }
  };

  // Toggle multi-select filter
  const handleMultiSelectToggle = (type, value, onChange) => {
    if (!onChange) return;
    
    let updatedSelection;
    if (type.includes(value)) {
      updatedSelection = type.filter(item => item !== value);
    } else {
      updatedSelection = [...type, value];
    }
    onChange(updatedSelection);
  };

  // Modify the onClick handlers for each button to prevent event propagation
  const handleGenreSelect = (e, genre) => {
    e.stopPropagation();
    if (onGenreChange) {
      onGenreChange(genre);
      // Close genre dropdown after selection since it's a single select
      setDropdowns(prev => ({ ...prev, genre: false }));
    }
  };

  const handleYearSelect = (e, year) => {
    e.stopPropagation();
    if (onYearChange) {
      onYearChange(year);
      // Close year dropdown after selection since it's a single select
      setDropdowns(prev => ({ ...prev, year: false }));
    }
  };

  const handleSortSelect = (e, sort) => {
    e.stopPropagation();
    if (onSortChange) {
      onSortChange(sort);
      // Close sort dropdown after selection since it's a single select
      setDropdowns(prev => ({ ...prev, sort: false }));
    }
  };

  const handleMultiSelect = (e, type, value, onChange, dropdown) => {
    e.stopPropagation();
    let updatedSelection;
    if (type.includes(value)) {
      updatedSelection = type.filter(item => item !== value);
    } else {
      updatedSelection = [...type, value];
    }

    if (onChange) {
      onChange(updatedSelection);
      // Keep dropdown open for multiselect to allow multiple selections
      // Without closing the dropdown
    }
  };

  // Add clear filter handlers
  const clearAllFilters = (e) => {
    e.stopPropagation();
    if (onGenreChange) onGenreChange(null);
    if (onYearChange) onYearChange('all');
    if (onSortChange) onSortChange('default');
    if (onSeasonChange) onSeasonChange([]);
    if (onTypeChange) onTypeChange([]);
    if (onStatusChange) onStatusChange([]);
    if (onLanguageChange) onLanguageChange([]);
  };

  const clearGenre = (e) => {
    e.stopPropagation();
    if (onGenreChange) onGenreChange(null);
  };

  const clearYear = (e) => {
    e.stopPropagation();
    if (onYearChange) onYearChange('all');
  };

  const clearSort = (e) => {
    e.stopPropagation();
    if (onSortChange) onSortChange('default');
  };

  const clearSeasons = (e) => {
    e.stopPropagation();
    if (onSeasonChange) onSeasonChange([]);
  };

  const clearTypes = (e) => {
    e.stopPropagation();
    if (onTypeChange) onTypeChange([]);
  };

  const clearStatus = (e) => {
    e.stopPropagation();
    if (onStatusChange) onStatusChange([]);
  };

  const clearLanguages = (e) => {
    e.stopPropagation();
    if (onLanguageChange) onLanguageChange([]);
  };

  // Get display text for filters
  const getYearDisplayText = () => {
    if (yearFilter === 'all') return 'Year';
    if (yearFilter === 'older') return 'Before 2000';
    return yearFilter;
  };

  const getSortDisplayText = () => {
    switch (sortOrder) {
      case 'title-asc': return 'Title (A-Z)';
      case 'title-desc': return 'Title (Z-A)';
      case 'year-desc': return 'Newest First';
      case 'year-asc': return 'Oldest First';
      default: return 'Default';
    }
  };

  // Check if any filter is active
  const isAnyFilterActive = () => {
    return selectedGenre !== null || 
           yearFilter !== 'all' || 
           sortOrder !== 'default' || 
           selectedSeasons.length > 0 || 
           selectedTypes.length > 0 || 
           selectedStatus.length > 0 || 
           selectedLanguages.length > 0;
  };

  return (
    <div className="p-3">
      <div className="flex flex-wrap gap-3">
        {/* Genre Filter */}
        <div className="relative flex-1 min-w-[160px]" ref={el => dropdownRefs.current.genre = el}>
          <button
            onClick={() => toggleDropdown('genre')}
            className="flex items-center justify-between w-full px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] active:bg-[#1f1f1f] border border-white/[0.04] group transition-colors"
          >
            <span className="text-[13px] font-medium text-white/80">
              {selectedGenre ? selectedGenre : 'Genre'}
            </span>
            <div className="flex items-center">
              <XMarkIcon 
                className={`w-3.5 h-3.5 text-white/60 mr-1 hover:text-white ${!selectedGenre ? 'opacity-40' : 'opacity-100'}`} 
                onClick={clearGenre}
              />
              <ChevronDownIcon className={`w-3.5 h-3.5 text-white/60 transition-transform ${dropdowns.genre ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {dropdowns.genre && (
            <div className="absolute z-50 w-full mt-2 py-1 bg-[#141414] rounded-lg border border-white/[0.04] shadow-xl">
              <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={(e) => handleGenreSelect(e, genre)}
                    className={`w-full px-4 py-1.5 text-left hover:bg-white/[0.03] transition-colors ${
                      selectedGenre === genre ? 'text-white font-medium' : 'text-white/70'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Year Filter */}
        <div className="relative flex-1 min-w-[160px]" ref={el => dropdownRefs.current.year = el}>
          <button
            onClick={() => toggleDropdown('year')}
            className="flex items-center justify-between w-full px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] active:bg-[#1f1f1f] border border-white/[0.04] group transition-colors"
          >
            <span className="text-[13px] font-medium text-white/80">
              {getYearDisplayText()}
            </span>
            <div className="flex items-center">
              <XMarkIcon 
                className={`w-3.5 h-3.5 text-white/60 mr-1 hover:text-white ${yearFilter === 'all' ? 'opacity-40' : 'opacity-100'}`}
                onClick={clearYear}
              />
              <ChevronDownIcon className={`w-3.5 h-3.5 text-white/60 transition-transform ${dropdowns.year ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {dropdowns.year && (
            <div className="absolute z-50 w-full mt-2 py-1 bg-[#141414] rounded-lg border border-white/[0.04] shadow-xl">
              <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={(e) => handleYearSelect(e, year)}
                    className={`w-full px-4 py-1.5 text-left hover:bg-white/[0.03] transition-colors ${
                      yearFilter === year ? 'text-white font-medium' : 'text-white/70'
                    }`}
                  >
                    {year === 'older' ? 'Before 2000' : year === 'all' ? 'All Years' : year}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Season Filter */}
        <div className="relative flex-1 min-w-[160px]" ref={el => dropdownRefs.current.season = el}>
          <button
            onClick={() => toggleDropdown('season')}
            className="flex items-center justify-between w-full px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] active:bg-[#1f1f1f] border border-white/[0.04] group transition-colors"
          >
            <span className="text-[13px] font-medium text-white/80">
              {selectedSeasons.length > 0 ? `${selectedSeasons.length} Selected` : 'Season'}
            </span>
            <div className="flex items-center">
              <XMarkIcon 
                className={`w-3.5 h-3.5 text-white/60 mr-1 hover:text-white ${selectedSeasons.length === 0 ? 'opacity-40' : 'opacity-100'}`}
                onClick={clearSeasons}
              />
              <ChevronDownIcon className={`w-3.5 h-3.5 text-white/60 transition-transform ${dropdowns.season ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {dropdowns.season && (
            <div onClick={(e) => keepDropdownOpen(e, 'season')} className="absolute z-50 w-full mt-2 py-1 bg-[#141414] rounded-lg border border-white/[0.04] shadow-xl">
              {seasons.map((season) => (
                <button
                  key={season}
                  onClick={(e) => handleMultiSelect(e, selectedSeasons, season, onSeasonChange, 'season')}
                  className="w-full px-4 py-1.5 text-left hover:bg-white/[0.03] transition-colors flex items-center justify-between"
                >
                  <span className={`text-[13px] ${selectedSeasons.includes(season) ? 'text-white font-medium' : 'text-white/70'}`}>
                    {season}
                  </span>
                  {selectedSeasons.includes(season) && (
                    <CheckIcon className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Format Filter */}
        <div className="relative flex-1 min-w-[160px]" ref={el => dropdownRefs.current.type = el}>
          <button
            onClick={() => toggleDropdown('type')}
            className="flex items-center justify-between w-full px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] active:bg-[#1f1f1f] border border-white/[0.04] group transition-colors"
          >
            <span className="text-[13px] font-medium text-white/80">
              {selectedTypes.length > 0 ? `${selectedTypes.length} Selected` : 'Format'}
            </span>
            <div className="flex items-center">
              <XMarkIcon 
                className={`w-3.5 h-3.5 text-white/60 mr-1 hover:text-white ${selectedTypes.length === 0 ? 'opacity-40' : 'opacity-100'}`}
                onClick={clearTypes}
              />
              <ChevronDownIcon className={`w-3.5 h-3.5 text-white/60 transition-transform ${dropdowns.type ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {dropdowns.type && (
            <div onClick={(e) => keepDropdownOpen(e, 'type')} className="absolute z-50 w-full mt-2 py-1 bg-[#141414] rounded-lg border border-white/[0.04] shadow-xl">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={(e) => handleMultiSelect(e, selectedTypes, type, onTypeChange, 'type')}
                  className="w-full px-4 py-1.5 text-left hover:bg-white/[0.03] transition-colors flex items-center justify-between"
                >
                  <span className={`text-[13px] ${selectedTypes.includes(type) ? 'text-white font-medium' : 'text-white/70'}`}>
                    {type}
                  </span>
                  {selectedTypes.includes(type) && (
                    <CheckIcon className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Status Filter */}
        <div className="relative flex-1 min-w-[160px]" ref={el => dropdownRefs.current.status = el}>
          <button
            onClick={() => toggleDropdown('status')}
            className="flex items-center justify-between w-full px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] active:bg-[#1f1f1f] border border-white/[0.04] group transition-colors"
          >
            <span className="text-[13px] font-medium text-white/80">
              {selectedStatus.length > 0 ? `${selectedStatus.length} Selected` : 'Status'}
            </span>
            <div className="flex items-center">
              <XMarkIcon 
                className={`w-3.5 h-3.5 text-white/60 mr-1 hover:text-white ${selectedStatus.length === 0 ? 'opacity-40' : 'opacity-100'}`}
                onClick={clearStatus}
              />
              <ChevronDownIcon className={`w-3.5 h-3.5 text-white/60 transition-transform ${dropdowns.status ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {dropdowns.status && (
            <div onClick={(e) => keepDropdownOpen(e, 'status')} className="absolute z-50 w-full mt-2 py-1 bg-[#141414] rounded-lg border border-white/[0.04] shadow-xl">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={(e) => handleMultiSelect(e, selectedStatus, status, onStatusChange, 'status')}
                  className="w-full px-4 py-1.5 text-left hover:bg-white/[0.03] transition-colors flex items-center justify-between"
                >
                  <span className={`text-[13px] ${selectedStatus.includes(status) ? 'text-white font-medium' : 'text-white/70'}`}>
                    {status}
                  </span>
                  {selectedStatus.includes(status) && (
                    <CheckIcon className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Language Filter */}
        <div className="relative flex-1 min-w-[160px]" ref={el => dropdownRefs.current.language = el}>
          <button
            onClick={() => toggleDropdown('language')}
            className="flex items-center justify-between w-full px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] active:bg-[#1f1f1f] border border-white/[0.04] group transition-colors"
          >
            <span className="text-[13px] font-medium text-white/80">
              {selectedLanguages.length > 0 ? `${selectedLanguages.length} Selected` : 'Language'}
            </span>
            <div className="flex items-center">
              <XMarkIcon 
                className={`w-3.5 h-3.5 text-white/60 mr-1 hover:text-white ${selectedLanguages.length === 0 ? 'opacity-40' : 'opacity-100'}`}
                onClick={clearLanguages}
              />
              <ChevronDownIcon className={`w-3.5 h-3.5 text-white/60 transition-transform ${dropdowns.language ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {dropdowns.language && (
            <div onClick={(e) => keepDropdownOpen(e, 'language')} className="absolute z-50 w-full mt-2 py-1 bg-[#141414] rounded-lg border border-white/[0.04] shadow-xl">
              {languages.map((language) => (
                <button
                  key={language}
                  onClick={(e) => handleMultiSelect(e, selectedLanguages, language, onLanguageChange, 'language')}
                  className="w-full px-4 py-1.5 text-left hover:bg-white/[0.03] transition-colors flex items-center justify-between"
                >
                  <span className={`text-[13px] ${selectedLanguages.includes(language) ? 'text-white font-medium' : 'text-white/70'}`}>
                    {language}
                  </span>
                  {selectedLanguages.includes(language) && (
                    <CheckIcon className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Sort Filter */}
        <div className="relative flex-1 min-w-[160px]" ref={el => dropdownRefs.current.sort = el}>
          <button
            onClick={() => toggleDropdown('sort')}
            className="flex items-center justify-between w-full px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] active:bg-[#1f1f1f] border border-white/[0.04] group transition-colors"
          >
            <span className="text-[13px] font-medium text-white/80">
              {getSortDisplayText()}
            </span>
            <div className="flex items-center">
              <XMarkIcon 
                className={`w-3.5 h-3.5 text-white/60 mr-1 hover:text-white ${sortOrder === 'default' ? 'opacity-40' : 'opacity-100'}`}
                onClick={clearSort}
              />
              <ChevronDownIcon className={`w-3.5 h-3.5 text-white/60 transition-transform ${dropdowns.sort ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {dropdowns.sort && (
            <div className="absolute z-50 w-full mt-2 py-1 bg-[#141414] rounded-lg border border-white/[0.04] shadow-xl">
              <button
                onClick={(e) => handleSortSelect(e, 'default')}
                className={`w-full px-4 py-1.5 text-left hover:bg-white/[0.03] transition-colors ${
                  sortOrder === 'default' ? 'text-white font-medium' : 'text-white/70'
                }`}
              >
                Default
              </button>
              <button
                onClick={(e) => handleSortSelect(e, 'title-asc')}
                className={`w-full px-4 py-1.5 text-left hover:bg-white/[0.03] transition-colors ${
                  sortOrder === 'title-asc' ? 'text-white font-medium' : 'text-white/70'
                }`}
              >
                Title (A-Z)
              </button>
              <button
                onClick={(e) => handleSortSelect(e, 'title-desc')}
                className={`w-full px-4 py-1.5 text-left hover:bg-white/[0.03] transition-colors ${
                  sortOrder === 'title-desc' ? 'text-white font-medium' : 'text-white/70'
                }`}
              >
                Title (Z-A)
              </button>
              <button
                onClick={(e) => handleSortSelect(e, 'year-desc')}
                className={`w-full px-4 py-1.5 text-left hover:bg-white/[0.03] transition-colors ${
                  sortOrder === 'year-desc' ? 'text-white font-medium' : 'text-white/70'
                }`}
              >
                Newest First
              </button>
              <button
                onClick={(e) => handleSortSelect(e, 'year-asc')}
                className={`w-full px-4 py-1.5 text-left hover:bg-white/[0.03] transition-colors ${
                  sortOrder === 'year-asc' ? 'text-white font-medium' : 'text-white/70'
                }`}
              >
                Oldest First
              </button>
            </div>
          )}
        </div>

        {/* Clear All Button - Always visible */}
        <button
          onClick={clearAllFilters}
          className={`flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-white/[0.04] transition-colors ${!isAnyFilterActive() ? 'opacity-50' : 'opacity-100'}`}
        >
          <XMarkIcon className="w-3.5 h-3.5 text-white/80" />
          <span className="text-[13px] font-medium text-white/80">Clear All</span>
        </button>
      </div>
    </div>
  );
} 