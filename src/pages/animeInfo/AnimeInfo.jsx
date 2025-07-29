import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faClosedCaptioning,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import website_name from "@/src/config/website";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import Sidecard from "@/src/components/sidecard/Sidecard";
import Loader from "@/src/components/Loader/Loader";
import Error from "@/src/components/error/Error";
import { useLanguage } from "@/src/context/LanguageContext";
import { useHomeInfo } from "@/src/context/HomeInfoContext";
import Voiceactor from "@/src/components/voiceactor/Voiceactor";

function InfoItem({ label, value, isProducer = true }) {
  return (
    value && (
      <div className="text-[14px] font-medium transition-all duration-300">
        <span className="text-gray-400">{`${label}: `}</span>
        <span className="font-light text-white/90">
          {Array.isArray(value) ? (
            value.map((item, index) =>
              isProducer ? (
                <Link
                  to={`/producer/${item
                    .replace(/[&'"^%$#@!()+=<>:;,.?/\\|{}[\]`~*_]/g, "")
                    .split(" ")
                    .join("-")
                    .replace(/-+/g, "-")}`}
                  key={index}
                  className="cursor-pointer transition-colors duration-300 hover:text-gray-300"
                >
                  {item}
                  {index < value.length - 1 && ", "}
                </Link>
              ) : (
                <span key={index} className="cursor-pointer">
                  {item}
                </span>
              )
            )
          ) : isProducer ? (
            <Link
              to={`/producer/${value
                .replace(/[&'"^%$#@!()+=<>:;,.?/\\|{}[\]`~*_]/g, "")
                .split(" ")
                .join("-")
                .replace(/-+/g, "-")}`}
              className="cursor-pointer transition-colors duration-300 hover:text-gray-300"
            >
              {value}
            </Link>
          ) : (
            <span className="cursor-pointer">{value}</span>
          )}
        </span>
      </div>
    )
  );
}

function Tag({ bgColor, index, icon, text }) {
  return (
    <div
      className={`flex space-x-1 justify-center items-center px-3 py-1 text-white backdrop-blur-md bg-white/10 font-medium text-[13px] rounded-full transition-all duration-300 hover:bg-white/20`}
    >
      {icon && <FontAwesomeIcon icon={icon} className="text-[12px] mr-1" />}
      <p className="text-[12px]">{text}</p>
    </div>
  );
}

function AnimeInfo({ random = false }) {
  const { language } = useLanguage();
  const { id: paramId } = useParams();
  const id = random ? null : paramId;
  const [isFull, setIsFull] = useState(false);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [seasons, setSeasons] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { homeInfo } = useHomeInfo();
  const { id: currentId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (id === "404-not-found-page") {
      console.log("404 got!");
      return null;
    } else {
      const fetchAnimeInfo = async () => {
        setLoading(true);
        try {
          const data = await getAnimeInfo(id, random);
          setSeasons(data?.seasons);
          setAnimeInfo(data.data);
        } catch (err) {
          console.error("Error fetching anime info:", err);
          setError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAnimeInfo();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [id, random]);
  useEffect(() => {
    if (animeInfo && location.pathname === `/${animeInfo.id}`) {
      document.title = `Watch ${animeInfo.title} English Sub/Dub online Free on ${website_name}`;
    }
    return () => {
      document.title = `${website_name} | Free anime streaming platform`;
    };
  }, [animeInfo]);
  if (loading) return <Loader type="animeInfo" />;
  if (error) {
    return <Error />;
  }
  if (!animeInfo) {
    navigate("/404-not-found-page");
    return undefined;
  }
  const { title, japanese_title, poster, animeInfo: info } = animeInfo;
  const tags = [
    {
      condition: info.tvInfo?.rating,
      bgColor: "#ffffff",
      text: info.tvInfo.rating,
    },
    {
      condition: info.tvInfo?.quality,
      bgColor: "#FFBADE",
      text: info.tvInfo.quality,
    },
    {
      condition: info.tvInfo?.sub,
      icon: faClosedCaptioning,
      bgColor: "#B0E3AF",
      text: info.tvInfo.sub,
    },
    {
      condition: info.tvInfo?.dub,
      icon: faMicrophone,
      bgColor: "#B9E7FF",
      text: info.tvInfo.dub,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="relative w-full overflow-hidden mt-[64px] max-md:mt-[50px]">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={`${poster}`}
            alt={`${title} Background`}
            className="w-full h-full object-cover filter blur-lg opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/80 via-[#121212]/95 to-[#121212]"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster Section */}
            <div className="flex-shrink-0">
              <div className="relative w-[220px] h-[330px] rounded-xl overflow-hidden shadow-2xl mx-auto lg:mx-0">
                <img
                  src={`${poster}`}
                  alt={`${title} Poster`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                {animeInfo.adultContent && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-sm font-semibold">
                    18+
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-6">
              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                {language === "EN" ? title : japanese_title}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {tags.map(({ condition, icon, text }, index) =>
                  condition && (
                    <Tag
                      key={index}
                      index={index}
                      icon={icon}
                      text={text}
                    />
                  )
                )}
              </div>

              {/* Details Section */}
              <div className="space-y-3 py-4 backdrop-blur-md bg-white/5 rounded-xl px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Japanese", value: info?.Japanese },
                    { label: "Synonyms", value: info?.Synonyms },
                    { label: "Aired", value: info?.Aired },
                    { label: "Premiered", value: info?.Premiered },
                    { label: "Duration", value: info?.Duration },
                    { label: "Status", value: info?.Status },
                    { label: "MAL Score", value: info?.["MAL Score"] },
                  ].map((item, index) => (
                    <InfoItem
                      key={index}
                      label={item.label}
                      value={item.value}
                      isProducer={false}
                    />
                  ))}
                </div>

                {/* Genres */}
                {info?.Genres && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-gray-400 mb-2">Genres</p>
                    <div className="flex flex-wrap gap-2">
                      {info.Genres.map((genre, index) => (
                        <Link
                          to={`/genre/${genre.split(" ").join("-")}`}
                          key={index}
                          className="px-3 py-1 text-sm bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                        >
                          {genre}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Studios & Producers */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  {[
                    { label: "Studios", value: info?.Studios },
                    { label: "Producers", value: info?.Producers },
                  ].map((item, index) => (
                    <InfoItem
                      key={index}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </div>
              </div>

              {/* Watch Button */}
              {animeInfo?.animeInfo?.Status?.toLowerCase() !== "not-yet-aired" ? (
                <Link
                  to={`/watch/${animeInfo.id}`}
                  className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 group"
                >
                  <FontAwesomeIcon
                    icon={faPlay}
                    className="mr-2 text-sm group-hover:text-white"
                  />
                  <span className="font-medium">Watch Now</span>
                </Link>
              ) : (
                <div className="inline-flex items-center px-6 py-3 bg-gray-700/50 rounded-full">
                  <span className="font-medium">Not released</span>
                </div>
              )}

              {/* Overview */}
              {info?.Overview && (
                <div className="text-gray-300 leading-relaxed max-w-3xl">
                  {info.Overview.length > 270 ? (
                    <>
                      {isFull
                        ? info.Overview
                        : `${info.Overview.slice(0, 270)}...`}
                      <button
                        className="ml-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
                        onClick={() => setIsFull(!isFull)}
                      >
                        {isFull ? "Show Less" : "Read More"}
                      </button>
                    </>
                  ) : (
                    info.Overview
                  )}
                </div>
              )}

              {/* Share Section */}
              <div className="flex items-center space-x-4 pt-4">
                <img
                  src="https://media.tenor.com/hJfxLKzDUFcAAAAM/bleach-best-anime.gif"
                  alt="Share Anime"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold text-white/70">Share Anime</p>
                  <p className="text-white/50">with your friends</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seasons Section */}
      {seasons?.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-8">More Seasons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {seasons.map((season, index) => (
              <Link
                to={`/${season.id}`}
                key={index}
                className={`relative w-full aspect-[3/1] rounded-lg overflow-hidden cursor-pointer group ${
                  currentId === String(season.id)
                    ? "ring-2 ring-white/40 shadow-lg shadow-white/10"
                    : ""
                }`}
              >
                <img
                  src={season.season_poster}
                  alt={season.season}
                  className={`w-full h-full object-cover scale-150 ${
                    currentId === String(season.id)
                      ? "opacity-50"
                      : "opacity-40"
                  }`}
                />
                {/* Dots Pattern Overlay */}
                <div 
                  className="absolute inset-0 z-10" 
                  style={{ 
                    backgroundImage: `url('data:image/svg+xml,<svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="1.5" cy="1.5" r="0.5" fill="white" fill-opacity="0.25"/></svg>')`,
                    backgroundSize: '3px 3px'
                  }}
                />
                {/* Dark Gradient Overlay */}
                <div className={`absolute inset-0 z-20 bg-gradient-to-r ${
                  currentId === String(season.id)
                    ? "from-black/50 to-transparent"
                    : "from-black/40 to-transparent"
                }`} />
                {/* Title Container */}
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                  <p className={`text-[18px] font-bold text-center px-4 transition-colors duration-300 ${
                    currentId === String(season.id)
                      ? "text-white"
                      : "text-white/90 group-hover:text-white"
                  }`}>
                    {season.season}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Voice Actors Section */}
      {animeInfo?.charactersVoiceActors.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <Voiceactor animeInfo={animeInfo} />
        </div>
      )}

      {/* Recommendations Section */}
      {animeInfo.recommended_data.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <CategoryCard
            label="Recommended for you"
            data={animeInfo.recommended_data}
            limit={animeInfo.recommended_data.length}
            showViewMore={false}
          />
        </div>
      )}
    </div>
  );
}

export default AnimeInfo;
