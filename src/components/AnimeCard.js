'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchAnimeEpisodes } from '@/lib/api';

export default function AnimeCard({ anime, isRecent }) {
  const [imageError, setImageError] = useState(false);
  const [firstEpisodeId, setFirstEpisodeId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef(null);
  
  // Fetch first episode ID when component mounts for recent anime
  useEffect(() => {
    const fetchFirstEpisode = async () => {
      // Only fetch for recent anime and if we don't already have the episode ID
      if (isRecent && anime?.id && !firstEpisodeId && !isLoading) {
        setIsLoading(true);
        try {
          console.log(`[AnimeCard] Fetching episodes for anime: ${anime.id}`);
          const response = await fetchAnimeEpisodes(anime.id);
          console.log(`[AnimeCard] Episodes response for ${anime.name}:`, response);
          
          if (response.episodes && response.episodes.length > 0) {
            // Check for the episode ID in the format expected by the watch page
            const firstEp = response.episodes[0];
            if (firstEp.id) {
              setFirstEpisodeId(firstEp.id);
              console.log(`[AnimeCard] First episode ID (id) for ${anime.name}: ${firstEp.id}`);
            } else if (firstEp.episodeId) {
              setFirstEpisodeId(firstEp.episodeId);
              console.log(`[AnimeCard] First episode ID (episodeId) for ${anime.name}: ${firstEp.episodeId}`);
            } else {
              // Create a fallback ID if neither id nor episodeId are available
              const fallbackId = `${anime.id}?ep=1`;
              setFirstEpisodeId(fallbackId);
              console.log(`[AnimeCard] Using fallback ID for ${anime.name}: ${fallbackId}`);
            }
          } else if (anime.id) {
            // If no episodes found, create a fallback ID
            const fallbackId = `${anime.id}?ep=1`;
            setFirstEpisodeId(fallbackId);
            console.log(`[AnimeCard] No episodes found for ${anime.name}, using fallback ID: ${fallbackId}`);
          }
        } catch (error) {
          console.error(`[AnimeCard] Error fetching episodes for ${anime.id}:`, error);
          // Even on error, try to use fallback
          if (anime.id) {
            const fallbackId = `${anime.id}?ep=1`;
            setFirstEpisodeId(fallbackId);
            console.log(`[AnimeCard] Error for ${anime.name}, using fallback ID: ${fallbackId}`);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchFirstEpisode();
    
    // Clean up timer if component unmounts
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [anime?.id, anime?.name, isRecent, firstEpisodeId, isLoading]);

  if (!anime) return null;
  
  const handleImageError = () => {
    console.log("Image error for:", anime.name);
    setImageError(true);
  };
  
  // Get image URL with fallback
  const imageSrc = imageError ? '/images/placeholder.png' : anime.poster;
  
  // Generate appropriate links
  const infoLink = `/anime/${anime.id}`;
  
  // Build the watch URL based on the first episode ID or fallback
  const watchLink = isRecent && firstEpisodeId 
    ? `/watch/${firstEpisodeId}` 
    : isRecent 
      ? `/anime/${anime.id}` // Temporarily link to info page while loading
      : `/anime/${anime.id}`; // Non-recent anime always link to info
  
  return (
    <div className="anime-card w-full flex flex-col">
      {/* Image card linking to watch page for recent anime, or info page otherwise */}
      <Link 
        href={isRecent ? watchLink : infoLink}
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