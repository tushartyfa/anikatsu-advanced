'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TopLists({ topToday = [], topWeek = [], topMonth = [] }) {
  const [activeTab, setActiveTab] = useState('today');
  
  const tabs = [
    { id: 'today', label: 'Today', data: topToday },
    { id: 'week', label: 'Week', data: topWeek },
    { id: 'month', label: 'Month', data: topMonth },
  ];

  // Add custom scrollbar styles
  useEffect(() => {
    // Add custom styles for the toplists scrollbar
    const style = document.createElement('style');
    style.textContent = `
      .toplists-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .toplists-scrollbar::-webkit-scrollbar-track {
        background: var(--card);
      }
      .toplists-scrollbar::-webkit-scrollbar-thumb {
        background-color: var(--border);
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup function
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Find the active tab data
  const activeTabData = tabs.find(tab => tab.id === activeTab)?.data || [];
  
  return (
    <div className="mb-10 bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <h2 className="text-lg font-semibold text-white">Top 10 Anime</h2>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="grid grid-cols-3 border-b border-[var(--border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 transition-colors text-sm font-medium ${
              activeTab === tab.id
                ? 'text-white bg-[var(--background)] border-b-2 border-[var(--border)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--background)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* List content */}
      <div className="p-4">
        {activeTabData.length === 0 ? (
          <div className="py-8 text-center text-[var(--text-muted)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-sm">No data available</p>
            <p className="text-xs mt-1 opacity-70">Check another tab or come back later</p>
          </div>
        ) : (
          <div className="space-y-2 min-h-[375px] max-h-[490px] overflow-y-auto pr-1 toplists-scrollbar">
            {activeTabData.slice(0, 10).map((anime, index) => (
              <Link 
                href={`/anime/${anime.id}`} 
                key={anime.id}
                className="block p-3 rounded hover:bg-white/5 transition-colors border border-[var(--border)] bg-[var(--card)] relative overflow-hidden"
              >
                {/* Top rank highlight for top 3 */}
                {index < 3 && (
                  <div className="absolute top-0 left-0 w-1 h-full opacity-70" 
                    style={{
                      background: index === 0 ? 'linear-gradient(to bottom, #303030, #1a1a1a)' : 
                               index === 1 ? 'linear-gradient(to bottom, #282828, #181818)' : 
                               'linear-gradient(to bottom, #202020, #161616)'
                    }}
                  />
                )}
                
                <div className="flex items-center">
                  {/* Rank number with monochrome styling */}
                  <div className="flex-shrink-0 w-8 flex items-center justify-center mr-3">
                    <span 
                      className={`flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold ${
                        index === 0 ? 'bg-white/20 text-white' :
                        index === 1 ? 'bg-white/15 text-white' :
                        index === 2 ? 'bg-white/10 text-white' :
                        'bg-[var(--background)] text-white/70 border border-[var(--border)]'
                      }`}
                    >
                      {anime.rank || index + 1}
                    </span>
                  </div>
                  
                  {/* Anime thumbnail with subtle shadow */}
                  <div className="flex-shrink-0 w-12 h-16 relative rounded overflow-hidden mr-3 shadow-md">
                    <Image
                      src={anime.poster || '/images/placeholder.png'}
                      alt={anime.name}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="mb-1">
                      <h3 className="text-sm font-medium text-white line-clamp-1">
                        {anime.name}
                      </h3>
                    </div>
                    
                    {/* Episodes if available */}
                    {anime.episodes && (
                      <div className="flex items-center mb-1">
                        {anime.episodes.sub > 0 && (
                          <span className="text-xs bg-[var(--background)] text-[var(--text-muted)] px-1.5 py-0.5 rounded">
                            SUB {anime.episodes.sub}
                          </span>
                        )}
                        {anime.episodes.dub > 0 && (
                          <span className="text-xs bg-[var(--background)] text-[var(--text-muted)] px-1.5 py-0.5 rounded ml-1">
                            DUB {anime.episodes.dub}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 