'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AnimeDetails({ anime }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  
  console.log('AnimeDetails received:', anime);
  
  if (!anime?.info) {
    console.error('Invalid anime data structure:', anime);
    return null;
  }
  
  const { info, moreInfo, relatedAnime, recommendations, mostPopular, seasons } = anime;

  // Helper function to render anime cards
  const renderAnimeCards = (animeList, title) => {
    if (!animeList || animeList.length === 0) return null;
    
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white mb-4 text-center md:text-left">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {animeList.map((item, index) => (
            <Link key={index} href={`/anime/${item.id}`} className="block group">
              <div className="bg-[var(--card)] rounded-lg overflow-hidden transition-transform hover:scale-105">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={item.poster}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-white text-sm font-medium line-clamp-2">{item.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };
  
  // Helper function to render seasons
  const renderSeasons = () => {
    if (!seasons || seasons.length === 0) return null;
    
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white mb-4 text-center md:text-left">Seasons</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {seasons.map((season, index) => (
            <Link key={index} href={`/anime/${season.id}`} className="block group">
              <div className={`${season.isCurrent ? 'border-2 border-[var(--primary)]' : ''} bg-[var(--card)] rounded-lg overflow-hidden transition-transform hover:scale-105`}>
                <div className="relative aspect-[3/4]">
                  <Image
                    src={season.poster}
                    alt={season.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover"
                  />
                  {season.isCurrent && (
                    <div className="absolute top-2 right-2 bg-[var(--primary)] text-black text-xs px-2 py-1 rounded-full">
                      Current
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-white text-sm font-medium line-clamp-2">{season.title || season.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };
  
  // Video modal for promotional videos
  const VideoModal = ({ video, onClose }) => {
    if (!video) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-4xl w-full bg-[var(--card)] rounded-lg overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 z-10 bg-black bg-opacity-50 rounded-full p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="aspect-video w-full">
            <iframe
              src={video.source}
              title={video.title || "Promotional Video"}
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          
          {video.title && (
            <div className="p-3">
              <p className="text-white font-medium">{video.title}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Video Modal */}
      {activeVideo && <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />}
    
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 h-[250px] md:h-[400px] overflow-hidden -z-10">
        {info.poster && (
          <>
            <Image
              src={info.poster}
              alt={info.name}
              fill
              className="object-cover opacity-10 blur-sm"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)] to-[var(--background)]"></div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-4 pt-6 md:pt-8">
        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Left Column - Poster and Mobile Title */}
          <div className="w-full md:w-1/4 lg:w-1/4">
            <div className="bg-[var(--card)] rounded-xl md:rounded-lg overflow-hidden shadow-xl max-w-[180px] mx-auto md:max-w-none">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={info.poster}
                  alt={info.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Mobile Title Section */}
            <div className="md:hidden mt-4 text-center">
              <h1 className="text-2xl font-bold text-white mb-2">{info.name}</h1>
              {info.jname && (
                <h2 className="text-base text-gray-400">{info.jname}</h2>
              )}
            </div>

            {/* Mobile Quick Info */}
            <div className="md:hidden mt-4 flex flex-wrap justify-center gap-2">
              {info.stats?.rating && (
                <div className="flex items-center bg-[var(--card)] px-3 py-1.5 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-yellow-400 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white font-medium">{info.stats.rating}</span>
                </div>
              )}
              {moreInfo?.status && (
                <div className="bg-[var(--card)] px-3 py-1.5 rounded-full text-sm text-white">
                  {moreInfo.status}
                </div>
              )}
              {info.stats?.type && (
                <div className="bg-[var(--card)] px-3 py-1.5 rounded-full text-sm text-white">
                  {info.stats.type}
                </div>
              )}
              {info.stats?.episodes && (
                <div className="bg-[var(--card)] px-3 py-1.5 rounded-full text-sm text-white">
                  {info.stats.episodes.sub > 0 && `SUB ${info.stats.episodes.sub}`}
                  {info.stats.episodes.dub > 0 && info.stats.episodes.sub > 0 && ' | '}
                  {info.stats.episodes.dub > 0 && `DUB ${info.stats.episodes.dub}`}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="w-full md:w-3/4 lg:w-3/4 mt-6 md:mt-0">
            <div className="flex flex-col gap-5 md:gap-6">
              {/* Desktop Title Section */}
              <div className="hidden md:block">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{info.name}</h1>
                {info.jname && (
                  <h2 className="text-lg text-gray-400">{info.jname}</h2>
                )}
              </div>

              {/* Desktop Quick Info */}
              <div className="hidden md:flex flex-wrap gap-3">
                {info.stats?.rating && (
                  <div className="flex items-center bg-[var(--card)] px-3 py-1 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-yellow-400 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-white font-medium">{info.stats.rating}</span>
                  </div>
                )}
                {moreInfo?.status && (
                  <div className="bg-[var(--card)] px-3 py-1 rounded-full text-sm text-white">
                    {moreInfo.status}
                  </div>
                )}
                {info.stats?.type && (
                  <div className="bg-[var(--card)] px-3 py-1 rounded-full text-sm text-white">
                    {info.stats.type}
                  </div>
                )}
                {info.stats?.episodes && (
                  <div className="bg-[var(--card)] px-3 py-1 rounded-full text-sm text-white">
                    {info.stats.episodes.sub > 0 && `SUB ${info.stats.episodes.sub}`}
                    {info.stats.episodes.dub > 0 && info.stats.episodes.sub > 0 && ' | '}
                    {info.stats.episodes.dub > 0 && `DUB ${info.stats.episodes.dub}`}
                  </div>
                )}
                {info.stats?.quality && (
                  <div className="bg-[var(--card)] px-3 py-1 rounded-full text-sm text-white">
                    {info.stats.quality}
                  </div>
                )}
                {info.stats?.duration && (
                  <div className="bg-[var(--card)] px-3 py-1 rounded-full text-sm text-white">
                    {info.stats.duration}
                  </div>
                )}
              </div>

              {/* Synopsis */}
              <div className="bg-[var(--card)] rounded-xl md:rounded-lg p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold text-white mb-3">Synopsis</h3>
                <div className="relative">
                  <p className={`text-gray-300 leading-relaxed text-sm md:text-base ${!isExpanded ? 'line-clamp-4' : ''}`}>
                    {info.description || 'No description available for this anime.'}
                  </p>
                  {info.description && info.description.length > 100 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-[var(--primary)] hover:underline text-sm mt-2 font-medium"
                    >
                      {isExpanded ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              </div>

              {/* Watch Button */}
              {info.stats?.episodes && (info.stats.episodes.sub > 0 || info.stats.episodes.dub > 0) && (
                <div className="flex items-center gap-4">
                  <Link 
                    href={`/watch/${info.id}?ep=1`}
                    className="bg-[#ffffff] text-[var(--background)] px-6 py-3 rounded-xl md:rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center font-medium text-base w-full md:w-auto"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 mr-2"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                    <span>Start Watching</span>
                  </Link>
                </div>
              )}

              {/* Promotional Videos */}
              {info.promotionalVideos && info.promotionalVideos.length > 0 && (
                <div className="bg-[var(--card)] rounded-xl md:rounded-lg p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-3">Promotional Videos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {info.promotionalVideos.map((video, index) => (
                      <div 
                        key={index} 
                        className="relative aspect-video cursor-pointer group overflow-hidden rounded-lg"
                        onClick={() => setActiveVideo(video)}
                      >
                        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <Image
                          src={video.thumbnail || '/images/video-placeholder.jpg'}
                          alt={video.title || `Promotional Video ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="space-y-5 md:space-y-6">
                {/* Genres */}
                {moreInfo?.genres && moreInfo.genres.length > 0 && (
                  <div>
                    <h3 className="text-white font-medium mb-3 text-center md:text-left">Genres</h3>
                    <div className="overflow-x-auto hide-scrollbar">
                      <div className="flex flex-wrap md:flex-nowrap gap-2 justify-center md:justify-start pb-1">
                        {moreInfo.genres.map((genre, index) => (
                          <Link
                            key={index}
                            href={`/genre/${genre.toLowerCase()}`}
                            className="px-3 py-1.5 bg-[var(--card)] text-gray-300 text-sm rounded-full whitespace-nowrap hover:text-white transition-colors"
                          >
                            {genre}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Studios */}
                {moreInfo?.studios && (
                  <div>
                    <h3 className="text-white font-medium mb-3 text-center md:text-left">Studios</h3>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <div className="px-3 py-1.5 bg-[var(--card)] text-gray-300 text-sm rounded-full">
                        {moreInfo.studios}
                      </div>
                    </div>
                  </div>
                )}

                {/* Aired Date */}
                {moreInfo?.aired && (
                  <div>
                    <h3 className="text-white font-medium mb-3 text-center md:text-left">Aired</h3>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <div className="px-3 py-1.5 bg-[var(--card)] text-gray-300 text-sm rounded-full">
                        {moreInfo.aired}
                      </div>
                    </div>
                  </div>
                )}

                {/* Character & Voice Actors */}
                {info.characterVoiceActor && info.characterVoiceActor.length > 0 && (
                  <div>
                    <h3 className="text-white font-medium mb-3 text-center md:text-left">Characters & Voice Actors</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {info.characterVoiceActor.map((item, index) => (
                        <div key={index} className="bg-[var(--card)] p-3 rounded-lg flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                <Image
                                  src={item.character.poster}
                                  alt={item.character.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm text-white truncate">{item.character.name}</p>
                                <p className="text-xs text-gray-400 truncate">{item.character.cast}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                <Image
                                  src={item.voiceActor.poster}
                                  alt={item.voiceActor.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm text-white truncate">{item.voiceActor.name}</p>
                                <p className="text-xs text-gray-400 truncate">{item.voiceActor.cast}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Seasons Section */}
        {renderSeasons()}
        
        {/* Related Anime Section */}
        {renderAnimeCards(relatedAnime, 'Related Anime')}
        
        {/* Recommendations Section */}
        {renderAnimeCards(recommendations, 'You May Also Like')}
        
        {/* Most Popular Section */}
        {renderAnimeCards(mostPopular, 'Most Popular')}
      </div>
    </div>
  );
}