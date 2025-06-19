// Use absolute URL for server components and relative URL for client components
const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer 
  ? process.env.ANIWATCH_API // Use environment variable with fallback
  : "/api/v2/hianime"; // Use relative URL for client-side

// Common headers for all API requests
const API_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Origin': 'https://hianime.to',
  'Referer': 'https://hianime.to/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

export const fetchRecentEpisodes = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/recently-updated?page=${page}`, {
      headers: API_HEADERS,
      credentials: 'omit'
    });
    if (!response.ok) throw new Error('Failed to fetch recent episodes');
    const data = await response.json();
    return { 
      results: data.data.animes.map(anime => ({
        id: anime.id,
        name: anime.name,
        poster: anime.poster,
        type: anime.type,
        episodes: {
          sub: anime.episodes?.sub || 0,
          dub: anime.episodes?.dub || 0
        }
      })) || [],
      currentPage: data.data.currentPage,
      hasNextPage: data.data.hasNextPage
    };
  } catch (error) {
    console.error('Error fetching recent episodes:', error);
    return { results: [] };
  }
};

export const fetchTopAiring = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/top-airing?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch top airing');
    const data = await response.json();
    return { 
      results: data.data.animes.map(anime => ({
        id: anime.id,
        name: anime.name,
        poster: anime.poster,
        type: anime.type,
        episodes: {
          sub: anime.episodes?.sub || 0,
          dub: anime.episodes?.dub || 0
        }
      })) || [],
      currentPage: data.data.currentPage,
      hasNextPage: data.data.hasNextPage
    };
  } catch (error) {
    console.error('Error fetching top airing:', error);
    return { results: [] };
  }
};

export const fetchMostPopular = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/most-popular?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch most popular');
    const data = await response.json();
    return { 
      results: data.data.animes.map(anime => ({
        id: anime.id,
        name: anime.name,
        poster: anime.poster,
        type: anime.type,
        episodes: {
          sub: anime.episodes?.sub || 0,
          dub: anime.episodes?.dub || 0
        }
      })) || [],
      currentPage: data.data.currentPage,
      hasNextPage: data.data.hasNextPage
    };
  } catch (error) {
    console.error('Error fetching most popular:', error);
    return { results: [] };
  }
};

export const fetchMostFavorite = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/most-favorite?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch most favorite');
    const data = await response.json();
    return { 
      results: data.data.animes || [],
      currentPage: data.data.currentPage,
      hasNextPage: data.data.hasNextPage
    };
  } catch (error) {
    console.error('Error fetching most favorite:', error);
    return { results: [] };
  }
};

export const fetchLatestCompleted = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/completed?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch latest completed');
    const data = await response.json();
    return { 
      results: data.data.animes.map(anime => ({
        id: anime.id,
        name: anime.name,
        poster: anime.poster,
        type: anime.type,
        episodes: {
          sub: anime.episodes?.sub || 0,
          dub: anime.episodes?.dub || 0
        }
      })) || [],
      currentPage: data.data.currentPage,
      hasNextPage: data.data.hasNextPage
    };
  } catch (error) {
    console.error('Error fetching latest completed:', error);
    return { results: [] };
  }
};

export const fetchTopUpcoming = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/top-upcoming?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch top upcoming');
    const data = await response.json();
    return { 
      results: data.data.animes || [],
      currentPage: data.data.currentPage,
      hasNextPage: data.data.hasNextPage
    };
  } catch (error) {
    console.error('Error fetching top upcoming:', error);
    return { results: [] };
  }
};

export const fetchTrending = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/home`);
    if (!response.ok) throw new Error('Failed to fetch trending anime');
    const data = await response.json();
    
    // Map the trending animes to match the TrendingList component's expected format
    const trendingAnimes = (data.data.trendingAnimes || []).map(anime => ({
      id: anime.id,
      title: anime.name,
      image: anime.poster,
      rank: anime.rank
    }));
    
    return { 
      results: trendingAnimes
    };
  } catch (error) {
    console.error('Error fetching trending anime:', error);
    return { results: [] };
  }
};

export const fetchAnimeInfo = async (id) => {
  try {
    if (!id) {
      return null;
    }
    
    const encodedId = encodeURIComponent(id);
    const url = `${API_BASE_URL}/anime/${encodedId}`;
    
    // Server-side fetch doesn't need credentials or mode settings
    const requestOptions = {
      method: 'GET',
      headers: API_HEADERS,
    };

    const response = await fetch(url, requestOptions);

    // Handle failed requests gracefully
    if (!response.ok) {
      return createFallbackAnimeData(id);
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Check if the response is successful
    if (!data.success && data.status !== 200) {
      return createFallbackAnimeData(id);
    }

    // The data structure might be nested in different ways depending on the API
    const responseData = data.data || data;

    // Extract the anime data from the response
    const animeData = responseData.anime;
    
    if (!animeData) {
      return createFallbackAnimeData(id);
    }
    
    // Create mock characterVoiceActor data if missing
    if (!animeData.info?.characterVoiceActor || !Array.isArray(animeData.info?.characterVoiceActor) || animeData.info?.characterVoiceActor.length === 0) {
      
      // Ensure the info object exists
      if (!animeData.info) animeData.info = {};
      
      // Add mock data for the characters and voice actors
      animeData.info.characterVoiceActor = [
        {
          character: {
            id: "character-1",
            name: animeData.info?.name ? `${animeData.info.name} Main Character` : "Main Character",
            poster: animeData.info?.poster || "https://via.placeholder.com/150",
            cast: "Main"
          },
          voiceActor: {
            id: "voice-actor-1",
            name: "Voice Actor",
            poster: "https://via.placeholder.com/150",
            cast: "Japanese"
          }
        },
        {
          character: {
            id: "character-2",
            name: "Supporting Character",
            poster: "https://via.placeholder.com/150",
            cast: "Supporting"
          },
          voiceActor: {
            id: "voice-actor-2",
            name: "Voice Actor 2",
            poster: "https://via.placeholder.com/150",
            cast: "Japanese"
          }
        }
      ];
    }
    
    // Check for characterVoiceActor data
    console.log('[API Debug] charactersVoiceActors:', 
      animeData.info?.charactersVoiceActors 
        ? `Found ${animeData.info.charactersVoiceActors.length} characters`
        : 'Missing charactersVoiceActors data'
    );
    
    // Check the raw API response structure for characterVoiceActor
    if (animeData.info) {
      console.log('[API Debug] Raw charactersVoiceActors type:', 
        animeData.info.charactersVoiceActors ? 
          typeof animeData.info.charactersVoiceActors + ' ' + 
          (Array.isArray(animeData.info.charactersVoiceActors) ? 'is Array' : 'not Array') : 
          'undefined'
      );
    }
    
    // Return the complete data structure as expected by the components
    return {
      info: {
        id: id,
        name: animeData.info?.name || '',
        jname: animeData.info?.jname || '',
        poster: animeData.info?.poster || '',
        description: animeData.info?.description || '',
        stats: {
          rating: animeData.info?.stats?.rating || '0',
          quality: animeData.info?.stats?.quality || 'HD',
          episodes: animeData.info?.stats?.episodes || { sub: 0, dub: 0 },
          type: animeData.info?.stats?.type || 'TV',
          duration: animeData.info?.stats?.duration || 'Unknown'
        },
        promotionalVideos: Array.isArray(animeData.info?.promotionalVideos) 
          ? animeData.info.promotionalVideos 
          : [],
        characterVoiceActor: (() => {
          // Explicit validation of charactersVoiceActors data (note the "s" in characters)
          const charData = animeData.info?.charactersVoiceActors;
          if (!charData) {
            return [];
          }
          if (!Array.isArray(charData)) {
            return [];
          }
          
          // Validate each item in the array to ensure it has the required structure
          return charData.filter(item => {
            if (!item) return false;
            if (!item.character || !item.voiceActor) return false;
            
            // Ensure character and voiceActor have all required fields
            const hasRequiredFields = 
              item.character.id && 
              item.character.name && 
              item.character.poster && 
              item.voiceActor.id && 
              item.voiceActor.name && 
              item.voiceActor.poster;
              
            return hasRequiredFields;
          });
        })(),
        charactersVoiceActors: (() => {
          // Explicit validation of charactersVoiceActors data (note the "s" in characters)
          const charData = animeData.info?.charactersVoiceActors;
          if (!charData) {
            return [];
          }
          if (!Array.isArray(charData)) {
            return [];
          }
          
          // Validate each item in the array to ensure it has the required structure
          return charData.filter(item => {
            if (!item) return false;
            if (!item.character || !item.voiceActor) return false;
            
            // Ensure character and voiceActor have all required fields
            const hasRequiredFields = 
              item.character.id && 
              item.character.name && 
              item.character.poster && 
              item.voiceActor.id && 
              item.voiceActor.name && 
              item.voiceActor.poster;
              
            return hasRequiredFields;
          });
        })()
      },
      moreInfo: animeData.moreInfo || {
        aired: '',
        genres: [],
        status: 'Unknown',
        studios: '',
        duration: ''
      },
      relatedAnime: Array.isArray(responseData.relatedAnimes) 
        ? responseData.relatedAnimes 
        : [],
      recommendations: Array.isArray(responseData.recommendedAnimes) 
        ? responseData.recommendedAnimes 
        : [],
      mostPopular: Array.isArray(responseData.mostPopularAnimes) 
        ? responseData.mostPopularAnimes 
        : [],
      seasons: Array.isArray(responseData.seasons) 
        ? responseData.seasons 
        : []
    };
  } catch (error) {
    return createFallbackAnimeData(id);
  }
};

// Helper function to create fallback anime data when the API fails
function createFallbackAnimeData(id) {
  // Create the mock character data to be reused
  const mockCharacterData = [
    {
      character: {
        id: "character-1",
        name: "Main Character",
        poster: "https://via.placeholder.com/150",
        cast: "Main"
      },
      voiceActor: {
        id: "voice-actor-1",
        name: "Voice Actor",
        poster: "https://via.placeholder.com/150",
        cast: "Japanese"
      }
    },
    {
      character: {
        id: "character-2",
        name: "Supporting Character",
        poster: "https://via.placeholder.com/150",
        cast: "Supporting"
      },
      voiceActor: {
        id: "voice-actor-2",
        name: "Voice Actor 2",
        poster: "https://via.placeholder.com/150",
        cast: "Japanese"
      }
    }
  ];

  return {
    info: {
      id: id,
      name: 'Anime Information Temporarily Unavailable',
      jname: '',
      poster: 'https://via.placeholder.com/225x318?text=Anime',
      description: 'The anime data could not be loaded at this time. Please try again later.',
      stats: {
        rating: '0',
        quality: 'HD',
        episodes: {
          sub: 0,
          dub: 0
        },
        type: 'Unknown',
        duration: 'Unknown'
      },
      promotionalVideos: [],
      // Use same property name as in fetchAnimeInfo to match what the frontend expects
      characterVoiceActor: mockCharacterData,
      // Also include the API property name for compatibility
      charactersVoiceActors: mockCharacterData
    },
    moreInfo: {
      aired: '',
      genres: ['Action', 'Adventure'],
      status: 'Unknown',
      studios: '',
      duration: ''
    },
    relatedAnime: [],
    recommendations: [],
    mostPopular: [],
    seasons: []
  };
}

export const fetchAnimeEpisodes = async (animeId) => {
  try {
    if (!animeId) {
      console.error('Invalid anime ID provided');
      return { episodes: [] };
    }
    
    const apiUrl = `${API_BASE_URL}/anime/${encodeURIComponent(animeId)}/episodes`;
    console.log(`[API Call] Fetching episodes for anime: ${animeId}`);
    
    const response = await fetch(apiUrl, {
      headers: API_HEADERS,
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch episodes: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[API Response] Episodes count:', data?.data?.episodes?.length || 0);
    
    if (!data || !data.data) {
      console.error('[API Error] Empty response received for episodes');
      return { episodes: [] };
    }
    
    // API already returns episodeId in correct format (animeId?ep=episodeNumber)
    // So we simply use it directly without any formatting
    
    return {
      episodes: data.data.episodes || [],
      totalEpisodes: data.data.totalEpisodes || 0
    };
  } catch (error) {
    console.error('Error fetching anime episodes:', error);
    return { episodes: [] };
  }
};

export const fetchEpisodeServers = async (episodeId) => {
  try {
    if (!episodeId || episodeId === 'undefined') {
      console.error('Invalid episode ID provided');
      return { servers: [] };
    }
    
    console.log(`[API] Processing episode ID: ${episodeId}`);
    
    // episodeId should already be in the correct format (animeId?ep=episodeNumber)
    // from the API response, so we use it directly
    const apiUrl = `${API_BASE_URL}/episode/servers?animeEpisodeId=${encodeURIComponent(episodeId)}`;
    console.log(`[API Call] Fetching servers from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: API_HEADERS,
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch episode servers: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[API Response] Episode servers:', data);
    
    if (!data || !data.success || !data.data) {
      console.error('[API Error] Empty response received for episode servers');
      return { servers: [] };
    }
    
    // Get all servers from the response (sub, dub, raw)
    // The response has separate arrays for sub, dub, and raw servers
    const subServers = data.data.sub || [];
    const dubServers = data.data.dub || [];
    const rawServers = data.data.raw || [];
    
    // Combine all servers into a single array for easier handling
    const allServers = [
      ...subServers.map(s => ({ ...s, category: 'sub' })),
      ...dubServers.map(s => ({ ...s, category: 'dub' })),
      ...rawServers.map(s => ({ ...s, category: 'raw' }))
    ];
    
    return {
      servers: allServers,
      episodeId: data.data.episodeId,
      episodeNo: data.data.episodeNo,
      hasSubServers: subServers.length > 0,
      hasDubServers: dubServers.length > 0,
      hasRawServers: rawServers.length > 0
    };
  } catch (error) {
    console.error('Error fetching episode servers:', error);
    return { servers: [] };
  }
};

export const fetchEpisodeSources = async (episodeId, dub = false, server = 'hd-2') => {
  try {
    if (!episodeId || episodeId === 'undefined') {
      console.error('Invalid episode ID provided');
      return { sources: [] };
    }
    
    console.log(`[API] Processing episode ID for sources: ${episodeId}`);
    
    // episodeId should already be in the correct format (animeId?ep=episodeNumber)
    // from the API response, so we use it directly
    const category = dub ? 'dub' : 'sub';
    const serverName = server || 'hd-2'; // Default to hd-2 if server is null or empty
    const apiUrl = `${API_BASE_URL}/episode/sources?animeEpisodeId=${encodeURIComponent(episodeId)}&category=${category}&server=${serverName}`;
    console.log(`[API Call] Fetching sources from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: API_HEADERS,
      credentials: 'omit'
    });
    
    // Log raw response details for debugging
    console.log('[API Response] Status:', response.status, response.statusText);
    console.log('[API Response] Headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch episode sources: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[API Response] Raw data:', JSON.stringify(data, null, 2));
    
    if (!data) {
      console.error('[API Error] No data received - response was null or undefined');
      return { sources: [] };
    }
    
    // Check if response is valid (status 200 or success flag)
    // Some API responses use success flag, others use status code
    const isValidResponse = (data.success === true) || (data.status === 200);
    if (!isValidResponse) {
      console.error('[API Error] Response indicates failure - invalid status or success flag');
      return { sources: [] };
    }
    
    // Get the data object from either data.data (new format) or data (old format)
    const responseData = data.data || data;
    
    if (!responseData) {
      console.error('[API Error] Empty data object in response');
      return { sources: [] };
    }
    
    if (!responseData.sources || responseData.sources.length === 0) {
      console.error('[API Error] No sources found in response data');
      return { sources: [] };
    }
    
    console.log('[API Success] Found sources:', responseData.sources.map(s => ({ 
      url: s.url.substring(0, 50) + '...',
      quality: s.quality,
      isM3U8: s.isM3U8
    })));
    
    return {
      sources: responseData.sources || [],
      headers: responseData.headers || { "Referer": "https://hianime.to/" },
      subtitles: responseData.tracks || responseData.subtitles || [],
      anilistID: responseData.anilistID || null,
      malID: responseData.malID || null,
      intro: responseData.intro || null,
      outro: responseData.outro || null
    };
  } catch (error) {
    console.error('Error fetching episode sources:', error);
    return { sources: [] };
  }
};

export const searchAnime = async (query, page = 1, filters = {}) => {
  try {
    // Build the URL with query and page parameters
    let url = `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}`;
    
    // Add any additional filters to the URL
    if (filters && Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }
      });
    }
    
    console.log("[API] Searching anime at:", url);
    
    // Make the request
    const response = await fetch(url, {
      headers: API_HEADERS,
      next: { revalidate: 60 }, // Cache for 60 seconds
      cache: 'no-cache' // Don't use browser cache
    });
    
    if (!response.ok) {
      console.error(`[API] Search error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to search anime: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("[API] Search response:", data);
    
    // Check if the response is valid and matches expected format
    if (!data.data) {
      console.error('[API] Invalid response format from search API:', data);
      return { 
        results: [], 
        mostPopularResults: [],
        currentPage: page, 
        hasNextPage: false,
        searchQuery: query,
        searchFilters: filters
      };
    }
    
    return {
      results: data.data.animes || [],
      mostPopularResults: data.data.mostPopularAnimes || [],
      currentPage: data.data.currentPage || page,
      hasNextPage: data.data.hasNextPage || false,
      totalPages: data.data.totalPages || 1,
      searchQuery: data.data.searchQuery || query,
      searchFilters: data.data.searchFilters || filters
    };
  } catch (error) {
    console.error('[API] Error searching anime:', error);
    return { 
      results: [], 
      mostPopularResults: [],
      currentPage: page, 
      hasNextPage: false,
      searchQuery: query,
      searchFilters: filters
    };
  }
};

export const fetchGenres = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/home`);
    if (!response.ok) throw new Error('Failed to fetch genres');
    const data = await response.json();
    return data.data.genres || [];
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

export const fetchGenreAnime = async (genre, page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/genre/${encodeURIComponent(genre)}?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch genre anime');
    const data = await response.json();
    return {
      results: data.data.animes || [],
      currentPage: data.data.currentPage,
      hasNextPage: data.data.hasNextPage
    };
  } catch (error) {
    console.error('Error fetching genre anime:', error);
    return { results: [] };
  }
};

export const fetchSearchSuggestions = async (query) => {
  try {
    console.log("[API] Fetching search suggestions for:", query);
    const response = await fetch(`${API_BASE_URL}/search/suggestion?q=${encodeURIComponent(query)}`, {
      headers: API_HEADERS,
      next: { revalidate: 60 }, // Cache for 60 seconds
      cache: 'no-cache' // Don't use browser cache
    });
    
    if (!response.ok) {
      console.error(`[API] Search suggestions error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch search suggestions: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("[API] Search suggestions response:", data);
    
    if (!data.data) {
      console.error('[API] Invalid response format from search suggestions API:', data);
      return [];
    }
    
    // Map the suggestions to include required fields
    return (data.data.suggestions || []).map(suggestion => ({
      id: suggestion.id,
      title: suggestion.name || suggestion.title,
      image: suggestion.poster || suggestion.image,
      // Include additional fields that might be useful for display
      type: suggestion.type || 'ANIME', 
      jname: suggestion.jname || ''
    }));
  } catch (error) {
    console.error('[API] Error fetching search suggestions:', error);
    return [];
  }
};

export const fetchSchedule = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${API_BASE_URL}/schedule?date=${today}`);
    if (!response.ok) throw new Error('Failed to fetch schedule');
    const data = await response.json();
    
    // Map the scheduled animes to include all required fields
    const scheduledAnimes = data.data.scheduledAnimes || [];
    return {
      scheduledAnimes: scheduledAnimes.map(anime => ({
        id: anime.id,
        time: anime.time,
        name: anime.name,
        jname: anime.jname,
        airingTimestamp: anime.airingTimestamp,
        secondsUntilAiring: anime.secondsUntilAiring
      }))
    };
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return { scheduledAnimes: [] };
  }
};

export const fetchSpotlightAnime = async (limit = 8) => {
  try {
    const response = await fetch(`${API_BASE_URL}/home`);
    if (!response.ok) throw new Error('Failed to fetch spotlight anime');
    const data = await response.json();
    
    // Map the spotlight animes to match the exact schema from the API
    const spotlightAnimes = (data.data.spotlightAnimes || []).map(anime => ({
      id: anime.id,
      name: anime.name,
      jname: anime.jname,
      poster: anime.poster,
      banner: anime.banner,
      description: anime.description,
      rank: anime.rank,
      otherInfo: anime.otherInfo || [],
      episodes: {
        sub: anime.episodes?.sub || 0,
        dub: anime.episodes?.dub || 0
      }
    }));
    
    return spotlightAnimes.slice(0, limit);
  } catch (error) {
    console.error('Error fetching spotlight anime:', error);
    return [];
  }
};

// Top 10 sections with proper data mapping
export const fetchTopToday = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/home`);
    if (!response.ok) throw new Error('Failed to fetch top today');
    const data = await response.json();
    
    // Map the top 10 animes to include all required fields
    return (data.data.top10Animes?.today || []).map(anime => ({
        id: anime.id,
      name: anime.name,
      poster: anime.poster,
        rank: anime.rank,
      episodes: anime.episodes || { sub: 0, dub: 0 }
      }));
  } catch (error) {
    console.error('Error fetching top today:', error);
      return [];
  }
};

export const fetchTopWeek = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/home`);
    if (!response.ok) throw new Error('Failed to fetch top week');
    const data = await response.json();
    
    // Map the top 10 animes to include all required fields
    return (data.data.top10Animes?.week || []).map(anime => ({
        id: anime.id,
      name: anime.name,
      poster: anime.poster,
        rank: anime.rank,
      episodes: anime.episodes || { sub: 0, dub: 0 }
      }));
  } catch (error) {
    console.error('Error fetching top week:', error);
      return [];
  }
};

export const fetchTopMonth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/home`);
    if (!response.ok) throw new Error('Failed to fetch top month');
    const data = await response.json();
    
    // Map the top 10 animes to include all required fields
    return (data.data.top10Animes?.month || []).map(anime => ({
        id: anime.id,
      name: anime.name,
      poster: anime.poster,
        rank: anime.rank,
      episodes: anime.episodes || { sub: 0, dub: 0 }
      }));
  } catch (error) {
    console.error('Error fetching top month:', error);
    return [];
  }
}; 