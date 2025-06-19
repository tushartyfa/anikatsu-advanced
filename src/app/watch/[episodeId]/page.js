'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import VideoPlayer from '@/components/VideoPlayer';
import EpisodeList from '@/components/EpisodeList';
import { 
  fetchEpisodeSources, 
  fetchAnimeInfo, 
  fetchEpisodeServers, 
  fetchAnimeEpisodes 
} from '@/lib/api';

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
  const [availableServers, setAvailableServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState('hd-2');
  const [episodes, setEpisodes] = useState([]);

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
      
      // Extract animeId from the episodeId parameter
      // Handle different possible formats:
      // 1. anime-name?ep=episode-number (standard format)
      // 2. anime-name-episode-number (legacy format)
      
      let extractedAnimeId;
      let episodeNumber;
      
      if (episodeId.includes('?ep=')) {
        // Format: anime-name?ep=episode-number
        const [baseId, queryString] = episodeId.split('?');
        extractedAnimeId = baseId;
        episodeNumber = queryString.replace('ep=', '');
        console.log(`[Watch] Format detected: standard (anime-name?ep=episode-number)`);
      } else if (episodeId.includes('-')) {
        // Format: anime-name-episode-number
        const match = episodeId.match(/^(.*?)-(\d+)$/);
        if (match) {
          extractedAnimeId = match[1];
          episodeNumber = match[2];
          console.log(`[Watch] Format detected: legacy (anime-name-episode-number)`);
        }
      }
      
      if (extractedAnimeId) {
        setAnimeId(extractedAnimeId);
        console.log('[Watch] Extracted anime ID:', extractedAnimeId);
        console.log('[Watch] Extracted episode number:', episodeNumber);
      } else {
        console.warn('[Watch] Could not extract anime ID from episode ID:', episodeId);
      }
      
      setCurrentEpisodeId(episodeId);
    }
  }, [episodeId]);

  // First fetch episode servers to get available servers and subtitles
  useEffect(() => {
    if (!currentEpisodeId || currentEpisodeId === 'undefined') {
      setError('Invalid episode ID');
      setIsLoading(false);
      return;
    }

    const fetchServers = async () => {
      setIsLoading(true);
      
      try {
        console.log(`[Watch] Fetching servers for episode ${currentEpisodeId}`);
        
        // Fetch available servers from the API
        const data = await fetchEpisodeServers(currentEpisodeId);
        
        if (!data || !data.servers || data.servers.length === 0) {
          console.warn('[Watch] No servers available for this episode');
        } else {
          // Filter servers based on current audio preference (sub/dub)
          const filteredServers = data.servers.filter(server => 
            server.category === (isDub ? 'dub' : 'sub')
          );
          
          setAvailableServers(filteredServers);
          console.log(`[Watch] Available ${isDub ? 'dub' : 'sub'} servers:`, filteredServers);
          
          // Set default server if available
          // First try to find HD-1 server
          let preferredServer = filteredServers.find(server => 
            server.serverName && server.serverName.toLowerCase() === 'hd-2'
          );
          
          // If not found, look for vidstreaming
          if (!preferredServer) {
            preferredServer = filteredServers.find(server => 
              server.serverName && server.serverName.toLowerCase().includes('vidstreaming')
            );
          }
          
          if (preferredServer && preferredServer.serverName) {
            setSelectedServer(preferredServer.serverName.toLowerCase());
            console.log(`[Watch] Selected preferred server: ${preferredServer.serverName}`);
          } else if (filteredServers.length > 0 && filteredServers[0].serverName) {
            setSelectedServer(filteredServers[0].serverName.toLowerCase());
            console.log(`[Watch] Selected first available server: ${filteredServers[0].serverName}`);
          }
        }
        
        // Continue to fetch video sources with the selected server
        fetchVideoSources(currentEpisodeId, isDub, selectedServer);
        
      } catch (error) {
        console.error('[Watch] Error fetching episode servers:', error);
        // Continue to sources even if servers fail
        fetchVideoSources(currentEpisodeId, isDub, selectedServer);
      }
    };
    
    fetchServers();
  }, [currentEpisodeId, isDub]);
  
  // Fetch video sources function
  const fetchVideoSources = async (episodeId, dub, server) => {
    setIsLoading(true);
    setError(null);
    setVideoSource(null);
    
    try {
      console.log(`[Watch] Fetching video for episode ${episodeId} (dub: ${dub}, server: ${server})`);
      
      // Fetch the episode sources from the API
      const data = await fetchEpisodeSources(episodeId, dub, server);
      
      console.log('[Watch] Episode sources API response:', data);
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
        setVideoHeaders(defaultHeaders);
      }
      
      // Set subtitles if available in the sources response
      // Check both subtitles and tracks fields since API might return either
      const subtitleData = data.subtitles || data.tracks || [];
      if (subtitleData.length > 0) {
        // Filter out thumbnails from subtitles array
        const filteredSubtitles = subtitleData.filter(sub => 
          sub.lang && sub.lang.toLowerCase() !== 'thumbnails'
        );
        
        // Look for thumbnails separately
        const thumbnailTrack = subtitleData.find(sub => 
          sub.lang && sub.lang.toLowerCase() === 'thumbnails'
        );
        
        if (thumbnailTrack && thumbnailTrack.url) {
          console.log('[Watch] Found thumbnails track:', thumbnailTrack.url);
          setThumbnails(thumbnailTrack.url);
        }
        
        if (filteredSubtitles.length > 0) {
          console.log('[Watch] Found subtitles:', filteredSubtitles.length);
          setSubtitles(filteredSubtitles);
        }
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
          fetchVideoSources(episodeId, dub, server);
        }, 2000);
      }
    }
  };

  // Effect to refetch sources when server or dub changes
  useEffect(() => {
    if (currentEpisodeId && selectedServer) {
      fetchVideoSources(currentEpisodeId, isDub, selectedServer);
    }
  }, [selectedServer, isDub]);

  // Fetch anime info and episodes using animeId
  useEffect(() => {
    if (animeId) {
      const fetchAnimeDetails = async () => {
        try {
          setIsRetrying(true);
          console.log(`[Watch] Fetching anime info for ID: ${animeId}`);
          
          // Fetch basic anime info
          const animeData = await fetchAnimeInfo(animeId);
          if (animeData) {
            console.log('[Watch] Anime info received:', animeData.info?.name);
            setAnime({
              id: animeId,
              title: animeData.info?.name || 'Unknown Anime',
              image: animeData.info?.poster || '',
              description: animeData.info?.description || 'No description available',
              status: animeData.moreInfo?.status || 'Unknown',
              type: animeData.info?.stats?.type || 'TV',
              totalEpisodes: animeData.info?.stats?.episodes?.sub || 0,
              genres: animeData.moreInfo?.genres || []
            });
          }
          
          // Fetch episodes separately
          const episodesData = await fetchAnimeEpisodes(animeId);
          if (episodesData && episodesData.episodes && episodesData.episodes.length > 0) {
            console.log('[Watch] Episodes found:', episodesData.episodes.length);
            setEpisodes(episodesData.episodes);
            
            // Find current episode in episode list
            // Handle both formats: anime-name?ep=episode-number or anime-name-episode-number
            const findCurrentEpisode = () => {
              // First, try to find the episode by direct ID match
              const directMatch = episodesData.episodes.find(ep => ep.id === currentEpisodeId);
              if (directMatch) {
                console.log('[Watch] Found episode by direct ID match:', directMatch.number);
                return directMatch;
              }
              
              // As a fallback, try to match by episode number
              // Extract episode number from the URL if it's in the format anime-id?ep=number
              if (currentEpisodeId.includes('?ep=')) {
                const [, queryString] = currentEpisodeId.split('?');
                if (queryString) {
                  const episodeNumber = queryString.replace('ep=', '');
                  console.log('[Watch] Trying to find by episode number:', episodeNumber);
                  
                  const numberMatch = episodesData.episodes.find(ep => 
                    ep.number && ep.number.toString() === episodeNumber.toString()
                  );
                  
                  if (numberMatch) {
                    console.log('[Watch] Found episode by number:', numberMatch.number);
                    return numberMatch;
                  }
                }
              }
              
              // If no match found, return first episode as fallback
              console.warn('[Watch] Could not find matching episode, falling back to first episode');
              return episodesData.episodes[0];
            };
            
            const episode = findCurrentEpisode();
            if (episode) {
              setCurrentEpisode(episode);
              console.log('[Watch] Current episode found:', episode.number);
            } else {
              console.warn('[Watch] Current episode not found in episode list');
            }
          } else {
            console.warn('[Watch] No episodes found for this anime');
          }
        } catch (error) {
          console.error('[Watch] Error fetching anime details:', error);
        } finally {
          setIsRetrying(false);
        }
      };
      
      fetchAnimeDetails();
    }
  }, [animeId, currentEpisodeId]);

  const handleDubToggle = () => {
    setIsDub(prev => {
      const newDubState = !prev;
      // Refetch servers for the new audio type
      fetchEpisodeServers(currentEpisodeId).then(data => {
        if (data && data.servers && data.servers.length > 0) {
          // Filter servers based on new audio preference
          const filteredServers = data.servers.filter(server => 
            server.category === (newDubState ? 'dub' : 'sub')
          );
          
          setAvailableServers(filteredServers);
          
          // Update selected server if needed
          // First try to find HD-1 server
          let preferredServer = filteredServers.find(server => 
            server.serverName && server.serverName.toLowerCase() === 'hd-2'
          );
          
          // If not found, look for vidstreaming
          if (!preferredServer) {
            preferredServer = filteredServers.find(server => 
              server.serverName && server.serverName.toLowerCase().includes('vidstreaming')
            );
          }
          
          if (preferredServer && preferredServer.serverName) {
            setSelectedServer(preferredServer.serverName.toLowerCase());
            console.log(`[Watch] Selected preferred server: ${preferredServer.serverName}`);
          } else if (filteredServers.length > 0 && filteredServers[0].serverName) {
            setSelectedServer(filteredServers[0].serverName.toLowerCase());
            console.log(`[Watch] Selected first available server: ${filteredServers[0].serverName}`);
          }
        }
      });
      return newDubState;
    });
  };

  const handleServerChange = (server) => {
    setSelectedServer(server);
  };

  const handleEpisodeClick = (newEpisodeId) => {
    if (newEpisodeId !== currentEpisodeId) {
      console.log(`[Watch] Episode clicked, ID: ${newEpisodeId}`);
      
      // Use the episode ID directly as it should already be in the correct format
      // from the API response (animeId?ep=episodeNumber)
      
      // Update the URL using history API
      const newUrl = `/watch/${encodeURIComponent(newEpisodeId)}`;
      window.history.pushState({ episodeId: newEpisodeId }, '', newUrl);
      
      // Update state to trigger video reload
      setCurrentEpisodeId(newEpisodeId);
      
      // Update current episode in state
      if (episodes) {
        const newEpisode = episodes.find(ep => ep.id === newEpisodeId);
        if (newEpisode) {
          setCurrentEpisode(newEpisode);
        }
      }
    }
  };

  const findAdjacentEpisodes = () => {
    if (!episodes || !currentEpisode) return { prev: null, next: null };
    
    const currentIndex = episodes.findIndex(ep => ep.number === currentEpisode.number);
    if (currentIndex === -1) return { prev: null, next: null };
    
    return {
      prev: currentIndex > 0 ? episodes[currentIndex - 1] : null,
      next: currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null
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
                          key={`${currentEpisodeId}-${isDub}-${selectedServer}`}
                          src={videoSource} 
                          poster={anime?.image} 
                          headers={videoHeaders} 
                          subtitles={subtitles}
                          thumbnails={thumbnails}
                          category={isDub ? 'dub' : 'sub'}
                          intro={episodeData?.intro || null}
                          outro={episodeData?.outro || null}
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
                <div className="flex flex-wrap items-center justify-between gap-y-4">
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

                  {/* Server Selection */}
                  {availableServers.length > 0 && (
                    <div className="flex items-center gap-4">
                      <h3 className="text-white/80 text-sm font-medium">Servers</h3>
                                              <div className="flex gap-2 flex-wrap">
                          {availableServers.map((server) => 
                            server.serverName ? (
                              <button
                                key={`${server.serverName}-${server.serverId}`}
                                onClick={() => handleServerChange(server.serverName.toLowerCase())}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                  selectedServer === server.serverName.toLowerCase()
                                    ? 'bg-white text-black' 
                                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 ring-1 ring-white/10'
                                }`}
                              >
                                {server.serverName}
                              </button>
                            ) : null
                          )}
                        </div>
                    </div>
                  )}

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
                  {episodes && episodes.length > 0 && (
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
                            <Link
                              key={index}
                              href={`/genres/${encodeURIComponent(genre.toLowerCase())}`}
                              className="px-3 py-1 rounded-full bg-white/5 text-white text-sm 
                                       hover:bg-white/10 transition-all cursor-pointer ring-1 ring-white/10"
                            >
                              {genre}
                            </Link>
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
            {episodes && episodes.length > 0 ? (
              <div className="h-full max-h-[calc(100vh-2rem)] overflow-hidden">
                <EpisodeList 
                  episodes={episodes}
                  currentEpisode={currentEpisode}
                  onEpisodeClick={handleEpisodeClick}
                  isDub={isDub}
                />
              </div>
            ) : (
              <div className="bg-white/5 rounded-2xl shadow-2xl p-6 ring-1 ring-white/10">
                <div className="text-center text-gray-400">
                  {isLoading ? 'Loading episodes...' : 'No episodes available'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 