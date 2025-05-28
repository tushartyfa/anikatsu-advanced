'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TrendingList({ trendingAnime = [] }) {
  return (
    <div className="mb-10 bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <h2 className="text-lg font-semibold text-white">Trending Now</h2>
      </div>

      <div className="min-h-[375px] max-h-[490px] overflow-y-auto toplists-scrollbar">
        <div className="pt-3.5 space-y-2">
          {trendingAnime.slice(0, 10).map((anime, index) => (
            <Link 
              href={`/anime/${anime.id}`} 
              key={anime.id || index}
              className="block px-3.5 py-3 hover:bg-white/5 transition-colors relative overflow-hidden"
            >
              <div className="flex items-center gap-3">
                {/* Rank number */}
                <div className="flex items-center justify-center w-8 text-lg font-bold text-[var(--text-muted)]">
                  #{index + 1}
                </div>

                {/* Anime image */}
                <div className="relative w-[45px] h-[60px] flex-shrink-0">
                  <Image
                    src={anime.image || '/placeholder.png'}
                    alt={anime.title}
                    className="rounded object-cover"
                    fill
                    sizes="45px"
                  />
                </div>

                {/* Anime info */}
                <div className="flex items-center flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white line-clamp-2">
                    {anime.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 