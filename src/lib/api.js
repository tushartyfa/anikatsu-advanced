const API_BASE_URL = process.env.ANIWATCH_API || "https://justaniwatchapi.vercel.app/api/v2/hianime";

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
      console.error('Invalid anime ID provided');
      return null;
    }
    
    const encodedId = encodeURIComponent(id);
    const url = `${API_BASE_URL}/anime/${encodedId}`;
    console.log('[API Call] Fetching anime info from:', url);
    
    // Server-side fetch doesn't need credentials or mode settings
    const requestOptions = {
      method: 'GET',
      headers: API_HEADERS,
    };

    const response = await fetch(url, requestOptions);

    // Handle failed requests gracefully
    if (!response.ok) {
      console.error(`[API Error] Status: ${response.status}`);
      return createFallbackAnimeData(id);
    }
    
    // Parse the JSON response
    const data = await response.json();
    console.log('[API Response]', data);
    
    // Check if the response is successful
    if (!data.success && data.status !== 200) {
      console.error('[API Error] Invalid response format:', data);
      return createFallbackAnimeData(id);
    }

    // The data structure might be nested in different ways depending on the API
    const responseData = data.data || data;
    
    // Log the data structure for debugging
    console.log('[API Data Structure]', JSON.stringify(responseData, null, 2));

    // Extract the anime data from the response
    const animeData = responseData.anime;
    
    if (!animeData) {
      console.error('[API Error] Missing anime data in response:', responseData);
      return createFallbackAnimeData(id);
    }
    
    // Create mock characterVoiceActor data if missing
    if (!animeData.info?.characterVoiceActor || !Array.isArray(animeData.info?.characterVoiceActor) || animeData.info?.characterVoiceActor.length === 0) {
      console.log('[API Fix] Adding mock characterVoiceActor data');
      
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
      console.log('[API Debug] Raw info keys:', Object.keys(animeData.info));
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
            console.warn('[API Warning] charactersVoiceActors is missing');
            return [];
          }
          if (!Array.isArray(charData)) {
            console.warn('[API Warning] charactersVoiceActors is not an array:', typeof charData);
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
    console.error('[API Error] Error fetching anime info:', error);
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

export const fetchEpisodeSources = async (episodeId, dub = false) => {
  try {
    if (!episodeId || episodeId === 'undefined') {
      console.error('Invalid episode ID provided');
      return { sources: [] };
    }
    
    const apiUrl = `${API_BASE_URL}/episode/sources?animeEpisodeId=${episodeId}&category=${dub ? 'dub' : 'sub'}`;
    console.log(`[API Call] Fetching sources from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: API_HEADERS,
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch episode sources: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[API Response] Raw data:', data);
    
    if (!data || !data.data) {
      console.error('[API Error] Empty response received');
      return { sources: [] };
    }
    
        return {
      sources: data.data.sources,
      headers: data.data.headers || { "Referer": "https://hianime.to/" },
      subtitles: data.data.subtitles || []
    };
  } catch (error) {
    console.error('Error fetching episode sources:', error);
    return { sources: [] };
  }
};

export const searchAnime = async (query, page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}`);
    if (!response.ok) throw new Error('Failed to search anime');
    const data = await response.json();
    return {
      results: data.data.animes || [],
      currentPage: data.data.currentPage,
      hasNextPage: data.data.hasNextPage
    };
  } catch (error) {
    console.error('Error searching anime:', error);
    return { results: [] };
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
    const response = await fetch(`${API_BASE_URL}/search/suggestion?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to fetch search suggestions');
    const data = await response.json();
    return data.data.suggestions || [];
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
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