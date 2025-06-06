import React, { Suspense } from 'react';
import Link from 'next/link';
import { fetchAnimeInfo } from '@/lib/api';
import AnimeDetails from '@/components/AnimeDetails.js';

// Loading state component
const LoadingState = () => (
  <div className="min-h-screen">
    <div className="animate-pulse">
      {/* Background Placeholder */}
      <div className="h-[400px] bg-gray-800"></div>
      
      {/* Content Placeholder */}
      <div className="container mx-auto px-4 -mt-32">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster Placeholder */}
          <div className="w-full md:w-1/4">
            <div className="bg-gray-700 rounded-lg aspect-[3/4]"></div>
          </div>
          
          {/* Details Placeholder */}
          <div className="w-full md:w-3/4">
            <div className="h-8 bg-gray-700 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded mb-6 w-1/3"></div>
            <div className="h-28 bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-700 rounded w-40"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Error state component
const ErrorState = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Error Loading Anime</h1>
      <p className="text-gray-400 mb-6">{error}</p>
      <div className="space-y-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[var(--primary)] text-[var(--background)] rounded-lg hover:opacity-90 transition-opacity block w-full mb-4"
        >
          Try Again
        </button>
        <Link 
          href="/home" 
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:opacity-90 transition-opacity inline-block"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  </div>
);

// Not found state component
const NotFoundState = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-white mb-4">Anime Not Found</h1>
      <p className="text-gray-400 mb-6">The anime you&apos;re looking for doesn&apos;t exist or was removed.</p>
      <Link href="/home" className="px-6 py-3 bg-[var(--primary)] text-[var(--background)] rounded-lg hover:opacity-90 transition-opacity">
        Go Back Home
      </Link>
    </div>
  </div>
);

// Main anime content component
const AnimeContent = async ({ id }) => {
  try {
    const anime = await fetchAnimeInfo(id);
    
    if (!anime || !anime.info) {
      return <NotFoundState />;
    }
    
    return (
      <div className="min-h-screen pb-12 mt-1.5">
        <AnimeDetails anime={anime} />
      </div>
    );
  } catch (error) {
    return <ErrorState error={error.message || 'An error occurred while loading the anime.'} />;
  }
};

// Main page component with Suspense
export default function AnimeInfoPage({ params }) {
  const { id } = params;
  
  return (
    <Suspense fallback={<LoadingState />}>
      <AnimeContent id={id} />
    </Suspense>
  );
}