import Image from 'next/image';

export default function AnimeInfo({ anime }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden">
      <div className="relative">
        {/* Banner Image - You'll need to add bannerImage to your anime object */}
        <div className="w-full h-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent z-10" />
          {anime.bannerImage ? (
            <Image
              src={anime.bannerImage}
              alt=""
              fill
              className="object-cover opacity-50"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900" />
          )}
        </div>

        {/* Content */}
        <div className="relative z-20 -mt-24 px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover Image */}
            <div className="relative w-40 md:w-48 flex-shrink-0">
              <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl border-4 border-[#1a1a1a]">
                <Image
                  src={anime.coverImage}
                  alt={anime.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="flex-grow">
              {/* Title and Alternative Titles */}
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {anime.title}
                </h1>
                {anime.alternativeTitles && (
                  <div className="text-gray-400 text-sm">
                    {anime.alternativeTitles.join(' • ')}
                  </div>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#242424] rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">Status</div>
                  <div className="text-white font-medium">{anime.status}</div>
                </div>
                <div className="bg-[#242424] rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">Episodes</div>
                  <div className="text-white font-medium">{anime.totalEpisodes}</div>
                </div>
                <div className="bg-[#242424] rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">Season</div>
                  <div className="text-white font-medium">{anime.season} {anime.year}</div>
                </div>
                <div className="bg-[#242424] rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">Studio</div>
                  <div className="text-white font-medium">{anime.studio}</div>
                </div>
              </div>

              {/* Genres */}
              {anime.genres && (
                <div className="mb-6">
                  <div className="text-gray-400 text-sm mb-2">Genres</div>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 rounded-full bg-[#242424] text-white text-sm hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Synopsis */}
              <div>
                <div className="text-gray-400 text-sm mb-2">Synopsis</div>
                <div className="text-gray-300 text-sm leading-relaxed">
                  {anime.synopsis}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 