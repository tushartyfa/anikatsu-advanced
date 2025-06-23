import { useState, useMemo, useEffect } from 'react';

export default function EpisodeList({ episodes, currentEpisode, onEpisodeClick, isDub = false }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isGridView, setIsGridView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEpisodeId, setActiveEpisodeId] = useState(null);
  const episodesPerPage = 100;
  
  // Update active episode when currentEpisode changes
  useEffect(() => {
    if (currentEpisode?.id) {
      setActiveEpisodeId(currentEpisode.id);
    }
  }, [currentEpisode]);

  // Sync with URL to identify current episode
  useEffect(() => {
    const checkCurrentEpisode = () => {
      const path = window.location.pathname;
      const match = path.match(/\/watch\/(.+)$/);
      if (match) {
        const urlEpisodeId = match[1];
        setActiveEpisodeId(urlEpisodeId);
        
        // Find the episode and update page
        const episode = episodes.find(ep => ep.id === urlEpisodeId);
        
        if (episode) {
          const pageNumber = Math.ceil(episode.number / episodesPerPage);
          setCurrentPage(pageNumber);
        }
      }
    };

    // Check initially
    checkCurrentEpisode();

    // Set up listener for URL changes using the History API
    const handleUrlChange = () => {
      checkCurrentEpisode();
    };

    window.addEventListener('popstate', handleUrlChange);
    
    // Clean up
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [episodes, episodesPerPage]);

  const filteredEpisodes = useMemo(() => {
    if (!searchQuery) return episodes;
    const query = searchQuery.toLowerCase();
    return episodes.filter(episode => 
      episode.number.toString().includes(query) || 
      (episode.title && episode.title.toLowerCase().includes(query))
    );
  }, [episodes, searchQuery]);

  const totalPages = Math.ceil(filteredEpisodes.length / episodesPerPage);
  const indexOfLastEpisode = currentPage * episodesPerPage;
  const indexOfFirstEpisode = indexOfLastEpisode - episodesPerPage;
  const currentEpisodes = filteredEpisodes.slice(indexOfFirstEpisode, indexOfLastEpisode);

  const getPageRange = (pageNum) => {
    const start = (pageNum - 1) * episodesPerPage + 1;
    const end = Math.min(pageNum * episodesPerPage, filteredEpisodes.length);
    return `${start}-${end}`;
  };

  const isCurrentEpisode = (episode) => {
    if (!episode || !episode.id || !activeEpisodeId) return false;
    return episode.id === activeEpisodeId;
  };

  const handleEpisodeSelect = (episode, e) => {
    e.preventDefault();
    if (onEpisodeClick && episode.id) {
      // Use the episode ID directly as it's already in the correct format from the API
      console.log(`[EpisodeList] Selected episode: ${episode.number}, ID: ${episode.id}`);
      onEpisodeClick(episode.id);
      setActiveEpisodeId(episode.id);
    }
  };

  // Scroll active episode into view when page changes or active episode changes
  useEffect(() => {
    if (activeEpisodeId) {
      setTimeout(() => {
        const activeElement = document.querySelector(`[data-episode-id="${activeEpisodeId}"]`);
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }, [activeEpisodeId, currentPage]);

  return (
    <div className="bg-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden h-[calc(90vh-6rem)]">
      {/* Header */}
      <div className="bg-[#242424] p-3 border-b border-gray-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="relative flex-grow max-w-lg">
            <input
              type="text"
              placeholder="Search episodes by name or number..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#2a2a2a] text-white text-sm rounded-lg px-4 py-1.5 pl-9 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder-gray-500"
            />
            <svg
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="bg-[#2a2a2a] text-white text-sm rounded-lg px-2 py-1.5 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-w-[90px]"
            >
              {[...Array(totalPages)].map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {getPageRange(index + 1)}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors bg-[#2a2a2a] hover:bg-[#333333]"
              title={isGridView ? "Switch to List View" : "Switch to Grid View"}
            >
              {isGridView ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Episodes Container */}
      <div className="overflow-y-auto h-[calc(100%-4rem)] scroll-smooth" id="episodes-container">
        <div className="p-4">
          {isGridView ? (
            // Grid View
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {currentEpisodes.map((episode) => (
                <button
                  key={episode.number}
                  data-episode-id={episode.id}
                  onClick={(e) => handleEpisodeSelect(episode, e)}
                  className={`group relative ${
                    isCurrentEpisode(episode)
                      ? 'bg-[#2a2a2a] ring-2 ring-white z-30'
                      : 'bg-[#2a2a2a] hover:bg-[#333333]'
                  } rounded-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:z-10`}
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <div className={`flex items-center justify-center text-white p-1.5 ${
                      isCurrentEpisode(episode) ? 'text-base font-bold' : 'text-sm font-medium'
                    }`}>
                      <span>{episode.number}</span>
                    </div>
                  </div>
                  {isCurrentEpisode(episode) && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                      <svg className="w-3 h-3 text-[#2a2a2a]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            // List View
            <div className="flex flex-col gap-1">
              {currentEpisodes.map((episode) => (
                <button
                  key={episode.number}
                  data-episode-id={episode.id}
                  onClick={(e) => handleEpisodeSelect(episode, e)}
                  className={`group flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300 w-full text-left ${
                    isCurrentEpisode(episode)
                      ? 'bg-[#2a2a2a] ring-2 ring-white z-30'
                      : 'bg-[#2a2a2a] hover:bg-[#333333]'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${
                    isCurrentEpisode(episode)
                      ? 'bg-black/20' 
                      : 'bg-black/20'
                  } flex items-center justify-center`}>
                    <span className={`${
                      isCurrentEpisode(episode)
                        ? 'text-base font-bold' 
                        : 'text-sm font-medium'
                    } text-white`}>{episode.number}</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-sm text-white font-medium truncate">
                      {episode.title || `Episode ${episode.number}`}
                    </div>
                  </div>
                  {isCurrentEpisode(episode) && (
                    <div className="flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 