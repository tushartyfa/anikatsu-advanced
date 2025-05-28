'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function AnimeCard({ anime, isRecent }) {
  const [imageError, setImageError] = useState(false);
  
  if (!anime) return null;
  
  const handleImageError = () => {
    console.log("Image error for:", anime.name);
    setImageError(true);
  };
  
  // Get image URL with fallback
  const imageSrc = imageError ? '/images/placeholder.png' : anime.poster;
  
  // Generate appropriate links
  const infoLink = `/anime/${anime.id}`;
  const watchLink = isRecent 
    ? `/watch/${anime.id}?ep=${anime.episodes?.sub || anime.episodes?.dub || 1}` 
    : `/anime/${anime.id}`;
  
  return (
    <div className="anime-card w-full flex flex-col">
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