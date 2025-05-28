'use client';

import React, { useState } from 'react';
import AnimeCard from './AnimeCard';
import Link from 'next/link';

const tabs = [
  { id: 'topAiring', label: 'TOP AIRING' },
  { id: 'popular', label: 'POPULAR' },
  { id: 'latestCompleted', label: 'LATEST COMPLETED' }
];

export default function AnimeTabs({ topAiring = [], popular = [], latestCompleted = [] }) {
  const [activeTab, setActiveTab] = useState('topAiring');

  const getActiveList = () => {
    switch (activeTab) {
      case 'topAiring':
        return topAiring;
      case 'popular':
        return popular;
      case 'latestCompleted':
        return latestCompleted;
      default:
        return [];
    }
  };

  const getViewAllLink = () => {
    switch (activeTab) {
      case 'topAiring':
        return '/top-airing';
      case 'popular':
        return '/most-popular';
      case 'latestCompleted':
        return '/latest-completed';
      default:
        return '/';
    }
  };

  return (
    <div className="mb-10">
      {/* Tabs Navigation */}
      <div className="flex items-center mb-6 border-b border-[var(--border)] overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)]"></div>
            )}
          </button>
        ))}
        <Link
          href={getViewAllLink()}
          className="text-[var(--text-muted)] hover:text-white text-xs sm:text-sm transition-colors flex items-center ml-auto px-3 sm:px-6 py-3 whitespace-nowrap flex-shrink-0"
          prefetch={false}
        >
          <span>View All</span>
          <svg className="ml-1 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
      </div>

      {/* Anime Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {getActiveList().slice(0, 18).map((anime, index) => (
          <AnimeCard 
            key={anime.id + '-' + index} 
            anime={anime}
          />
        ))}
      </div>
    </div>
  );
} 