'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchAnimeEpisodes } from '@/lib/api';

export default function AnimeCard({ anime, isRecent }) {
  const [imageError, setImageError] = useState(false);
  const [firstEpisodeId, setFirstEpisodeId] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);
  
  if (!anime) return null;
  
  const handleImageError = () => {
    console.log("Image error for:", anime.name);
    setImageError(true);
  };
  
  // Fetch first episode ID when component is hovered
  useEffect(() => {
    const fetchFirstEpisode = async () => {
      if (anime?.id && isHovered && !firstEpisodeId) {
        try {
          const response = await fetchAnimeEpisodes(anime.id);
          if (response.episodes && response.episodes.length > 0) {
            // Get the first episode's episodeId
            setFirstEpisodeId(response.episodes[0].episodeId);
            console.log(`[AnimeCard] First episode ID for ${anime.name}: ${response.episodes[0].episodeId}`);
          }
        } catch (error) {
          console.error(`[AnimeCard] Error fetching episodes for ${anime.id}:`, error);
        }
      }
    };
    
    fetchFirstEpisode();
  }, [anime?.id, isHovered, firstEpisodeId]);
  
  const handleMouseEnter = () => {
    // Clear any existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    // Set a small delay to prevent API calls for quick mouseovers
    timerRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300); // Delay to prevent unnecessary API calls
  };
  
  const handleMouseLeave = () => {
    // Clear the timer if the user moves the mouse away quickly
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsHovered(false);
  };
  
  // Get image URL with fallback
  const imageSrc = imageError ? '/images/placeholder.png' : anime.poster;
  
  // Generate appropriate links
  const infoLink = `/anime/${anime.id}`;
  
  // Build the watch URL based on the first episode ID or fallback
  const watchLink = isRecent ? (
    firstEpisodeId 
      ? `/watch/${firstEpisodeId}` 
      : `/watch/${anime.id}?ep=${anime.episodes?.sub || anime.episodes?.dub || 1}`
  ) : infoLink;
  
  return (
    <div 
      className="anime-card w-full flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image card linking to watch page */}
      <Link 
        href={watchLink}
        className="block w-full rounded-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] group"
        prefetch={false}
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900 shadow-lg">
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 transition-opacity duration-300 z-[3]"></div>
          
          {/* Play button triangle - appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-white drop-shadow-lg">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          
          <Image
            src={imageSrc}
            alt={anime.name || 'Anime'}
            fill
            className="object-cover rounded-lg"
            onError={handleImageError}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            unoptimized={true}
            priority={false}
          />
          
          {/* Badges in bottom left */}
          <div className="absolute bottom-2 left-2 flex space-x-1 z-10">
            {/* Episode badges */}
            {anime.episodes && (
              <>
                {anime.episodes.sub > 0 && (
                  <div className="bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    SUB {anime.episodes.sub}
                  </div>
                )}
                {anime.episodes.dub > 0 && (
                  <div className="bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    DUB {anime.episodes.dub}
                  </div>
                )}
              </>
            )}
            
            {/* Type badge */}
            {anime.type && (
              <div className="bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                {anime.type}
              </div>
            )}
          </div>
        </div>
      </Link>
      
      {/* Title linking to info page */}
      <Link 
        href={infoLink} 
        className="block mt-2"
        prefetch={false}
      >
        <h3 className="text-sm font-medium text-white line-clamp-2 hover:text-[var(--primary)] transition-colors">
          {anime.name}
        </h3>
      </Link>
    </div>
  );
} 