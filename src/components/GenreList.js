'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetchGenres } from '@/lib/api';

export default function GenreList() {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  
  useEffect(() => {
    async function loadGenres() {
      try {
        const genreData = await fetchGenres();
        setGenres(genreData || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadGenres();
  }, []);
  
  // Predefined popular genres if API doesn't return them
  const defaultGenres = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
    "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", 
    "Supernatural", "Thriller", "Isekai", "Mecha", "Sports"
  ];
  
  // Use fetched genres or fallback to default genres
  const displayGenres = genres.length > 0 ? genres : defaultGenres;
  
  // Show only first 12 genres if not showing all
  const visibleGenres = showAll ? displayGenres : displayGenres.slice(0, 12);
  
  if (isLoading) {
    return (
      <div className="mb-10 bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-white">Genres</h2>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-10 bg-[var(--border)] rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-10 bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold text-white">Genres</h2>
      </div>
      
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visibleGenres.map((genre) => (
          <Link
            key={genre}
            href={`/search?genre=${genre.toLowerCase()}`}
            className="bg-[var(--background)] hover:bg-white/10 text-white text-sm text-center py-2 px-3 rounded transition-colors truncate"
          >
            {genre}
          </Link>
        ))}
      </div>
      
      {displayGenres.length > 12 && (
        <div className="p-4 pt-0 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-white/70 hover:text-white text-sm transition-colors inline-flex items-center"
          >
            <span>{showAll ? 'Show Less' : 'Show All'}</span>
            <svg 
              className={`ml-1 w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
} 