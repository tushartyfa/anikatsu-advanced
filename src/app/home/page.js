import React from 'react';
import AnimeCard from '@/components/AnimeCard';
import TopLists from '@/components/TopLists';
import AnimeCalendar from '@/components/AnimeCalendar';
import GenreBar from '@/components/GenreBar';
import SpotlightCarousel from '@/components/SpotlightCarousel';
import AnimeTabs from '@/components/AnimeTabs';
import TrendingList from '@/components/TrendingList';
import Link from 'next/link';
import { 
  fetchRecentEpisodes, 
  fetchMostFavorite,
  fetchSpotlightAnime,
  fetchTopToday,
  fetchTopWeek,
  fetchTopMonth,
  fetchMostPopular,
  fetchTopAiring,
  fetchLatestCompleted,
  fetchTrending
} from '@/lib/api';

// New unified section component with grid layout
const AnimeGridSection = ({ title, animeList = [], viewMoreLink, isRecent = false }) => {
  if (!animeList || animeList.length === 0) {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-12 text-center text-[var(--text-muted)] border border-[var(--border)]">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-[var(--border)] rounded mx-auto mb-4"></div>
            <div className="h-4 w-48 bg-[var(--border)] rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {viewMoreLink && (
          <Link 
            href={viewMoreLink} 
            className="text-[var(--text-muted)] hover:text-white text-sm transition-colors flex items-center"
            prefetch={false}
          >
            <span>View All</span>
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {animeList.slice(0, 12).map((anime, index) => (
          <AnimeCard 
            key={anime.id + '-' + index} 
            anime={anime} 
            isRecent={isRecent}
          />
        ))}
      </div>
    </div>
  );
};

async function HomePage() {
  try {
    console.log('[HomePage] Fetching home page data');
    
    // Fetch all data in parallel
    const [
      spotlightData,
      recentEpisodes, 
      mostFavorite,
      topToday,
      topWeek,
      topMonth,
      topAiring,
      popular,
      latestCompleted,
      trending
    ] = await Promise.all([
      fetchSpotlightAnime().catch(err => {
        console.error("[HomePage] Error fetching spotlight anime:", err.message);
        return [];
      }),
      fetchRecentEpisodes().catch(err => {
        console.error("[HomePage] Error fetching recent episodes:", err.message);
        return { results: [] };
      }),
      fetchMostFavorite().catch(err => {
        console.error("[HomePage] Error fetching most favorite:", err.message);
        return { results: [] };
      }),
      fetchTopToday().catch(err => {
        console.error("[HomePage] Error fetching top today:", err.message);
        return [];
      }),
      fetchTopWeek().catch(err => {
        console.error("[HomePage] Error fetching top week:", err.message);
        return [];
      }),
      fetchTopMonth().catch(err => {
        console.error("[HomePage] Error fetching top month:", err.message);
        return [];
      }),
      fetchTopAiring().catch(err => {
        console.error("[HomePage] Error fetching top airing anime:", err.message);
        return { results: [] };
      }),
      fetchMostPopular().catch(err => {
        console.error("[HomePage] Error fetching popular anime:", err.message);
        return { results: [] };
      }),
      fetchLatestCompleted().catch(err => {
        console.error("[HomePage] Error fetching latest completed anime:", err.message);
        return { results: [] };
      }),
      fetchTrending().catch(err => {
        console.error("[HomePage] Error fetching trending anime:", err.message);
        return { results: [] };
      })
    ]);
    
    console.log('[HomePage] Data fetched successfully');
    
    return (
      <div className="py-6 bg-[var(--background)] text-white">
        <div className="w-full px-4 md:px-[4rem]">
          {/* Spotlight Carousel */}
          <SpotlightCarousel items={spotlightData} />
          
          {/* Genre Bar */}
          <div className="mb-8">
            <GenreBar />
          </div>
          
          {/* Main Content + Sidebar Layout */}
          <div className="flex flex-col lg:flex-row lg:gap-6">
            {/* Main Content - 2/3 width on large screens */}
            <div className="lg:w-3/4">
              {/* Latest Episodes Grid */}
              <AnimeGridSection 
                title="Latest Episodes" 
                animeList={recentEpisodes?.results || []} 
                viewMoreLink="/recent"
                isRecent={true}
              />

              {/* Anime Tabs Section */}
              <AnimeTabs
                topAiring={topAiring?.results || []}
                popular={popular?.results || []}
                latestCompleted={latestCompleted?.results || []}
              />
            </div>
            
            {/* Sidebar - 1/4 width on large screens */}
            <div className="lg:w-1/4 mt-8 lg:mt-0">
              {/* Trending List */}
              <TrendingList trendingAnime={trending?.results || []} />
              
              {/* Calendar Widget */}
              <AnimeCalendar />
              
              {/* Top Lists */}
              <TopLists 
                topToday={topToday} 
                topWeek={topWeek} 
                topMonth={topMonth} 
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('[HomePage] Error in HomePage:', error.message);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-[var(--card)] border border-[var(--border)] p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Unable to load content</h2>
          <p className="text-[var(--text-muted)] mb-6">There was an error loading the home page content. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}

export default HomePage;