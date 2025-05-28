'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import VideoPlayer from '@/components/VideoPlayer';
import EpisodeList from '@/components/EpisodeList';
import { fetchEpisodeSources, fetchAnimeInfo } from '@/lib/api';

export default function WatchPage() {
  const { episodeId } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [videoSource, setVideoSource] = useState(null);
  const [anime, setAnime] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isDub, setIsDub] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoHeaders, setVideoHeaders] = useState({});
  const [subtitles, setSubtitles] = useState([]);
  const [thumbnails, setThumbnails] = useState(null);
  const [animeId, setAnimeId] = useState(null);
  const [episodeData, setEpisodeData] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 100;
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [autoSkip, setAutoSkip] = useState(false);
  const [currentEpisodeId, setCurrentEpisodeId] = useState(episodeId);

  // Handle URL updates when currentEpisodeId changes
  useEffect(() => {
    if (currentEpisodeId && currentEpisodeId !== episodeId) {
      const newUrl = `/watch/${currentEpisodeId}`;
      window.history.pushState({ episodeId: currentEpisodeId }, '', newUrl);
    }
  }, [currentEpisodeId, episodeId]);

  // Listen for popstate (browser back/forward) events
  useEffect(() => {
    const handlePopState = (event) => {
      const path = window.location.pathname;
      const match = path.match(/\/watch\/(.+)$/);
      if (match) {
        const newEpisodeId = match[1];
        setCurrentEpisodeId(newEpisodeId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Extract animeId from the URL
  useEffect(() => {
    if (episodeId) {
      // Log the raw episodeId from the URL for debugging
      console.log('[Watch] Raw episodeId from URL:', episodeId);
      
      // The URL might contain query parameters for episode number
      const [baseId, queryParams] = episodeId.split('?');
      console.log('[Watch] Base ID:', baseId);
      
      setAnimeId(baseId);
      setCurrentEpisodeId(episodeId);
    }
  }, [episodeId]);

  // Fetch episode sources first to ensure we have data even if anime info fails
  useEffect(() => {
    if (!currentEpisodeId || currentEpisodeId === 'undefined') {
      setError('Invalid episode ID');
      setIsLoading(false);
      return;
    }

    const fetchVideoData = async () => {
      setIsLoading(true);
      setError(null);
      setVideoSource(null);
      
      try {
        console.log(`[Watch] Fetching video for episode ${currentEpisodeId} (dub: ${isDub})`);
        
        // Fetch the episode sources from the API
        const data = await fetchEpisodeSources(currentEpisodeId, isDub);
        
        console.log('[Watch] Episode API response:', data);
        setEpisodeData(data);
        
        if (!data || !data.sources || data.sources.length === 0) {
          throw new Error('No video sources available for this episode');
        }
        
        // Extract headers if they exist in the response
        if (data.headers) {
          console.log('[Watch] Headers from API:', data.headers);
          setVideoHeaders(data.headers);
        } else {
          // Set default headers if none provided
          const defaultHeaders = { 
            "Referer": "https://hianime.to/",
            "Origin": "https://hianime.to"
          };
          console.log('[Watch] No headers provided from API, using defaults:', defaultHeaders);
          setVideoHeaders(defaultHeaders);
        }
        
        // Try to find the best source in order of preference
        // 1. HLS (m3u8) sources
        // 2. High quality MP4 sources
        const hlsSource = data.sources.find(src => src.isM3U8);
        const mp4Source = data.sources.find(src => !src.isM3U8);
        
        let selectedSource = null;
        
        if (hlsSource && hlsSource.url) {
          console.log('[Watch] Selected HLS source:', hlsSource.url);
          selectedSource = hlsSource.url;
        } else if (mp4Source && mp4Source.url) {
          console.log('[Watch] Selected MP4 source:', mp4Source.url);
          selectedSource = mp4Source.url;
        } else if (data.sources[0] && data.sources[0].url) {
          console.log('[Watch] Falling back to first available source:', data.sources[0].url);
          selectedSource = data.sources[0].url;
        } else {
          throw new Error('No valid video URLs found');
        }
        
        setVideoSource(selectedSource);
        setIsLoading(false);
        
      } catch (error) {
        console.error('[Watch] Error fetching video sources:', error);
        setError(error.message || 'Failed to load video');
        setIsLoading(false);
        
        // If this is the first try, attempt to retry once
        if (!isRetrying) {
          console.log('[Watch] First error, attempting retry...');
          setIsRetrying(true);
          setTimeout(() => {
            console.log('[Watch] Executing retry...');
            fetchVideoData();
          }, 2000);
        }
      }
    };

    fetchVideoData();
  }, [currentEpisodeId, isDub, isRetrying]);

  // Fetch anime info using extracted animeId
  useEffect(() => {
    if (animeId) {
      const fetchAnimeDetails = async () => {
        try {
          setIsRetrying(true);
          console.log(`[Watch] Fetching anime info for ID: ${animeId}`);
          const animeData = await fetchAnimeInfo(animeId);
          
          if (animeData) {
            console.log('[Watch] Anime info received:', animeData.title);
            setAnime(animeData);
            
            // Find the current episode in the anime episode list
            if (animeData.episodes && animeData.episodes.length > 0) {
              console.log('[Watch] Episodes found:', animeData.episodes.length);
              
              // First try exact match
              let episode = animeData.episodes.find(ep => ep.id === episodeId);
              
              // If not found, try to find by checking if episodeId is contained in ep.id
              if (!episode && episodeId.includes('$episode$')) {
                const episodeIdPart = episodeId.split('$episode$')[1];
                episode = animeData.episodes.find(ep => ep.id.includes(episodeIdPart));
              }
              
              if (episode) {
                setCurrentEpisode(episode);
                console.log('[Watch] Current episode found:', episode.number);
              } else {
                console.warn('[Watch] Current episode not found in episode list. Looking for:', episodeId);
                console.log('[Watch] First few episodes:', animeData.episodes.slice(0, 3).map(ep => ep.id));
              }
            } else {
              console.warn('[Watch] No episodes found in anime data or episodes array is empty');
            }
          } else {
            console.error('[Watch] Failed to fetch anime info or received empty response');
          }
        } catch (error) {
          console.error('[Watch] Error fetching anime info:', error);
        } finally {
          setIsRetrying(false);
        }
      };
      
      fetchAnimeDetails();
    } else {
      console.warn('[Watch] No animeId available to fetch anime details');
    }
  }, [animeId, episodeId]);

  const handleDubToggle = () => {
    setIsDub(!isDub);
  };

  const handleEpisodeClick = (newEpisodeId) => {
    if (newEpisodeId !== currentEpisodeId) {
      // Update the URL using history API
      const newUrl = `/watch/${newEpisodeId}`;
      window.history.pushState({ episodeId: newEpisodeId }, '', newUrl);
      
      // Update state to trigger video reload
      setCurrentEpisodeId(newEpisodeId);
      
      // Update current episode in state
      if (anime?.episodes) {
        const newEpisode = anime.episodes.find(ep => ep.id === newEpisodeId);
        if (newEpisode) {
          setCurrentEpisode(newEpisode);
        }
      }
    }
  };

  const handleRetryAnimeInfo = () => {
    if (animeId) {
      setIsRetrying(true);
      fetchAnimeInfo(animeId)
        .then(data => {
          if (data) {
            setAnime(data);
            console.log('[Watch] Anime info retry succeeded:', data.title);
          } else {
            console.error('[Watch] Anime info retry failed: empty response');
          }
        })
        .catch(error => {
          console.error('[Watch] Anime info retry error:', error);
        })
        .finally(() => {
          setIsRetrying(false);
        });
    }
  };

  const findAdjacentEpisodes = () => {
    if (!anime?.episodes || !currentEpisodeId) return { prev: null, next: null };
    
    const currentIndex = anime.episodes.findIndex(ep => ep.id === currentEpisodeId);
    if (currentIndex === -1) return { prev: null, next: null };
    
    return {
      prev: currentIndex > 0 ? anime.episodes[currentIndex - 1] : null,
      next: currentIndex < anime.episodes.length - 1 ? anime.episodes[currentIndex + 1] : null
    };
  };

  const { prev, next } = findAdjacentEpisodes();

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="container mx-auto px-4 xl:px-0">
        <div className="flex flex-col md:flex-row gap-8 py-6">
          {/* Left Side - Video Player (70%) */}
          <div className="w-full md:w-[70%] flex flex-col">
            <div className="flex flex-col" id="videoSection">
              {/* Video Player Container */}
              <div className="relative w-full bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                <div className="relative pt-[56.25%]">
                  <div className="absolute inset-0">
                    {error ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="text-red-400 text-xl mb-4">Error: {error}</div>
                        <p className="text-gray-400 mb-6">
                          The video source couldn&apos;t be loaded. Please try again or check back later.
                        </p>
                      </div>
                    ) : isLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
                        <div className="text-gray-400">Loading video...</div>
                      </div>
                    ) : videoSource ? (
                      <div className="h-full">
                        <VideoPlayer 
                          key={`${currentEpisodeId}-${isDub}`}
                          src={videoSource} 
                          poster={anime?.image} 
                          headers={videoHeaders} 
                          subtitles={subtitles}
                          thumbnails={thumbnails}
                          category={isDub ? 'dub' : 'sub'}
                          intro={episodeData?.intro}
                          outro={episodeData?.outro}
                          autoSkipIntro={autoSkip}
                          autoSkipOutro={autoSkip}
                          episodeId={currentEpisodeId}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="text-yellow-400 text-xl mb-4">No video source available</div>
                        <p className="text-gray-400 mb-6">
                          Please try again or check back later.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Controls - Slimmer and without container background */}
              <div className="flex flex-col gap-4 mt-6">
                {/* Audio and Playback Controls */}
                <div className="flex items-center justify-between">
                  {/* Playback Settings */}
                  <div className="flex items-center gap-4">
                    <h3 className="text-white/80 text-sm font-medium">Playback Settings</h3>
                    <div className="flex items-center gap-4">
                      {/* Auto Skip Checkbox */}
                      {(episodeData?.intro || episodeData?.outro) && (
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={autoSkip}
                            onChange={(e) => setAutoSkip(e.target.checked)}
                            className="w-4 h-4 text-white bg-white/10 border-none rounded cursor-pointer focus:ring-white focus:ring-offset-0 focus:ring-offset-transparent focus:ring-opacity-50"
                          />
                          <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Auto Skip</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Audio Toggle */}
                  <div className="flex items-center gap-4">
                    <h3 className="text-white/80 text-sm font-medium">Audio</h3>
                    <div className="flex bg-white/5 rounded-lg p-0.5 ring-1 ring-white/10">
                      <button
                        onClick={() => setIsDub(false)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                          !isDub 
                            ? 'bg-white text-black' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        SUB
                      </button>
                      <button
                        onClick={() => setIsDub(true)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                          isDub 
                            ? 'bg-white text-black' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        DUB
                      </button>
                    </div>
                  </div>
                </div>

                {/* Episode Navigation */}
                <div className="flex gap-3">
                  {anime?.episodes && (
                    <>
                      <button
                        onClick={() => {
                          const { prev } = findAdjacentEpisodes();
                          if (prev) {
                            handleEpisodeClick(prev.id);
                          }
                        }}
                        disabled={!findAdjacentEpisodes().prev}
                        className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-30 
                                 disabled:cursor-not-allowed hover:bg-white/10 transition-all 
                                 flex items-center gap-2 flex-1 justify-center ring-1 ring-white/10"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous Episode
                      </button>
                      <button
                        onClick={() => {
                          const { next } = findAdjacentEpisodes();
                          if (next) {
                            handleEpisodeClick(next.id);
                          }
                        }}
                        disabled={!findAdjacentEpisodes().next}
                        className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-30 
                                 disabled:cursor-not-allowed hover:bg-white/10 transition-all 
                                 flex items-center gap-2 flex-1 justify-center ring-1 ring-white/10"
                      >
                        Next Episode
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Anime Info Section */}
              {anime && (
                <div className="mt-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Cover Image */}
                    <div className="relative w-40 md:w-48 flex-shrink-0">
                      <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <Image
                          src={anime.image}
                          alt={anime.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-grow">
                      <Link href={`/anime/${animeId}`}>
                        <h2 className="text-4xl font-bold text-white mb-4 hover:text-white/80 transition-colors">
                          {anime.title}
                        </h2>
                      </Link>

                      {/* Status Bar */}
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
                        <span className="bg-white/5 px-3 py-1 rounded-full ring-1 ring-white/10">{anime.status}</span>
                        <span>•</span>
                        <span className="bg-white/5 px-3 py-1 rounded-full ring-1 ring-white/10">{anime.type}</span>
                        <span>•</span>
                        <span className="bg-white/5 px-3 py-1 rounded-full ring-1 ring-white/10">{anime.totalEpisodes} Episodes</span>
                      </div>

                      {/* Synopsis Section */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-white mb-3">Synopsis</h3>
                        <div className="relative">
                          <div className={`text-gray-300 text-sm leading-relaxed ${!showFullSynopsis ? 'line-clamp-4' : ''}`}>
                            {anime.description}
                          </div>
                          <button 
                            onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                            className="text-white hover:text-white/80 transition-colors mt-2 text-sm font-medium"
                          >
                            {showFullSynopsis ? 'Show Less' : 'Read More'}
                          </button>
                        </div>
                      </div>

                      {/* Genres */}
                      {anime.genres && (
                        <div className="flex flex-wrap gap-2">
                          {anime.genres.map((genre, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 rounded-full bg-white/5 text-white text-sm 
                                       hover:bg-white/10 transition-all cursor-pointer ring-1 ring-white/10"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Episode List (30%) */}
          <div className="w-full md:w-[30%]">
            {anime?.episodes ? (
              <div className="h-full max-h-[calc(100vh-2rem)] overflow-hidden">
                <EpisodeList 
                  episodes={anime.episodes}
                  currentEpisode={currentEpisode}
                  onEpisodeClick={handleEpisodeClick}
                />
              </div>
            ) : (
              <div className="bg-white/5 rounded-2xl shadow-2xl p-6 ring-1 ring-white/10">
                <div className="text-center text-gray-400">
                  No episodes available
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 