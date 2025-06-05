'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function SeasonCard({ season }) {
  const [imageError, setImageError] = useState(false);
  
  if (!season) return null;
  
  const handleImageError = () => {
    console.log("Image error for:", season.name);
    setImageError(true);
  };
  
  // Get image URL with fallback
  const imageSrc = imageError ? '/images/placeholder.png' : season.poster;
  
  // Generate link
  const infoLink = `/anime/${season.id}`;
  
  return (
    <Link 
      href={infoLink}
      className="block w-full rounded-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] group"
      prefetch={false}
    >
      <div className={`relative aspect-[3/1.5] rounded-lg overflow-hidden bg-gray-900 shadow-lg ${season.isCurrent ? 'border-2 border-white' : ''}`}>
        {/* Background image with blur */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-60 z-[2]"></div>
          <Image
            src={imageSrc}
            alt={season.name || 'Season'}
            fill
            className="object-cover blur-[2px]"
            onError={handleImageError}
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={true}
            priority={false}
          />
        </div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10 p-3">
          <div className="text-center">
            <h3 className="text-white font-bold text-lg line-clamp-1">
              {season.title || season.name}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
} 