/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
import { useHomeInfo } from "@/src/context/HomeInfoContext";
import { useWatch } from "@/src/hooks/useWatch";
import BouncingLoader from "@/src/components/ui/bouncingloader/Bouncingloader";
import IframePlayer from "@/src/components/player/IframePlayer";
import Episodelist from "@/src/components/episodelist/Episodelist";
import website_name from "@/src/config/website";
import Sidecard from "@/src/components/sidecard/Sidecard";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import {
  faClosedCaptioning,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Servers from "@/src/components/servers/Servers";
import CategoryCardLoader from "@/src/components/Loader/CategoryCard.loader";
import { Skeleton } from "@/src/components/ui/Skeleton/Skeleton";
import SidecardLoader from "@/src/components/Loader/Sidecard.loader";
import Voiceactor from "@/src/components/voiceactor/Voiceactor";
import Watchcontrols from "@/src/components/watchcontrols/Watchcontrols";
import useWatchControl from "@/src/hooks/useWatchControl";
import Player from "@/src/components/player/Player";

export default function Watch() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: animeId } = useParams();
  const queryParams = new URLSearchParams(location.search);
  let initialEpisodeId = queryParams.get("ep");
  const [tags, setTags] = useState([]);
  const { language } = useLanguage();
  const { homeInfo } = useHomeInfo();
  const isFirstSet = useRef(true);
  const [showNextEpisodeSchedule, setShowNextEpisodeSchedule] = useState(true);
  const {
    // error,
    buffering,
    streamInfo,
    streamUrl,
    animeInfo,
    episodes,
    nextEpisodeSchedule,
    animeInfoLoading,
    totalEpisodes,
    isFullOverview,
    intro,
    outro,
    subtitles,
    thumbnail,
    setIsFullOverview,
    activeEpisodeNum,
    seasons,
    episodeId,
    setEpisodeId,
    activeServerId,
    setActiveServerId,
    servers,
    serverLoading,
    activeServerType,
    setActiveServerType,
    activeServerName,
    setActiveServerName
  } = useWatch(animeId, initialEpisodeId);
  const {
    autoPlay,
    setAutoPlay,
    autoSkipIntro,
    setAutoSkipIntro,
    autoNext,
    setAutoNext,
  } = useWatchControl();

  useEffect(() => {
    if (!episodes || episodes.length === 0) return;
    
    const isValidEpisode = episodes.some(ep => {
      const epNumber = ep.id.split('ep=')[1];
      return epNumber === episodeId; 
    });
    
    // If missing or invalid episodeId, fallback to first
    if (!episodeId || !isValidEpisode) {
      const fallbackId = episodes[0].id.match(/ep=(\d+)/)?.[1];
      if (fallbackId && fallbackId !== episodeId) {
        setEpisodeId(fallbackId);
      }
      return;
    }
  
    const newUrl = `/watch/${animeId}?ep=${episodeId}`;
    if (isFirstSet.current) {
      navigate(newUrl, { replace: true });
      isFirstSet.current = false;
    } else {
      navigate(newUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, animeId, navigate, episodes]);

  // Update document title
  useEffect(() => {
    if (animeInfo) {
      document.title = `Watch ${animeInfo.title} English Sub/Dub online Free on ${website_name}`;
    }
    return () => {
      document.title = `${website_name} | Free anime streaming platform`;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId]);

  // Redirect if no episodes
  useEffect(() => {
    if (totalEpisodes !== null && totalEpisodes === 0) {
      navigate(`/${animeId}`);
    }
  }, [streamInfo, episodeId, animeId, totalEpisodes, navigate]);

  useEffect(() => {
    const adjustHeight = () => {
      if (window.innerWidth > 1200) {
        const player = document.querySelector(".player");
        const episodes = document.querySelector(".episodes");
        if (player && episodes) {
          episodes.style.height = `${player.clientHeight}px`;
        }
      } else {
        const episodes = document.querySelector(".episodes");
        if (episodes) {
          episodes.style.height = "auto";
        }
      }
    };
    adjustHeight();
    window.addEventListener("resize", adjustHeight);
    return () => {
      window.removeEventListener("resize", adjustHeight);
    };
  });

  function Tag({ bgColor, index, icon, text }) {
    return (
      <div
        className={`flex space-x-1 justify-center items-center px-[4px] py-[1px] text-black font-semibold text-[13px] ${
          index === 0 ? "rounded-l-[4px]" : "rounded-none"
        }`}
        style={{ backgroundColor: bgColor }}
      >
        {icon && <FontAwesomeIcon icon={icon} className="text-[12px]" />}
        <p className="text-[12px]">{text}</p>
      </div>
    );
  }

  useEffect(() => {
    setTags([
      {
        condition: animeInfo?.animeInfo?.tvInfo?.rating,
        bgColor: "#ffffff",
        text: animeInfo?.animeInfo?.tvInfo?.rating,
      },
      {
        condition: animeInfo?.animeInfo?.tvInfo?.quality,
        bgColor: "#FFBADE",
        text: animeInfo?.animeInfo?.tvInfo?.quality,
      },
      {
        condition: animeInfo?.animeInfo?.tvInfo?.sub,
        icon: faClosedCaptioning,
        bgColor: "#B0E3AF",
        text: animeInfo?.animeInfo?.tvInfo?.sub,
      },
      {
        condition: animeInfo?.animeInfo?.tvInfo?.dub,
        icon: faMicrophone,
        bgColor: "#B9E7FF",
        text: animeInfo?.animeInfo?.tvInfo?.dub,
      },
    ]);
  }, [animeId, animeInfo]);
  return (
    <div className="w-full min-h-screen bg-[#0a0a0a]">
      <div className="w-full max-w-[1920px] mx-auto px-6 pt-[128px] pb-12 max-[1200px]:pt-[64px] max-[1024px]:px-4 max-md:pt-[50px]">
        <div className="grid grid-cols-[minmax(0,70%),minmax(0,30%)] gap-6 w-full h-full max-[1200px]:flex max-[1200px]:flex-col">
          {/* Left Column - Player, Controls, Servers */}
          <div className="flex flex-col w-full gap-6">
            <div className="player w-full h-fit bg-black flex flex-col rounded-xl overflow-hidden">
              {/* Video Container */}
              <div className="w-full relative aspect-video bg-black">
                {!buffering ? (["hd-1", "hd-4"].includes(activeServerName.toLowerCase()) ?
                  <IframePlayer
                    episodeId={episodeId}
                    servertype={activeServerType}
                    serverName={activeServerName}
                    animeInfo={animeInfo}
                    episodeNum={activeEpisodeNum}
                    episodes={episodes}
                    playNext={(id) => setEpisodeId(id)}
                    autoNext={autoNext}
                  /> : <Player
                    streamUrl={streamUrl}
                    subtitles={subtitles}
                    intro={intro}
                    outro={outro}
                    serverName={activeServerName.toLowerCase()}
                    thumbnail={thumbnail}
                    autoSkipIntro={autoSkipIntro}
                    autoPlay={autoPlay}
                    autoNext={autoNext}
                    episodeId={episodeId}
                    episodes={episodes}
                    playNext={(id) => setEpisodeId(id)}
                    animeInfo={animeInfo}
                    episodeNum={activeEpisodeNum}
                    streamInfo={streamInfo}
                  />
                ) : (
                  <div className="absolute inset-0 flex justify-center items-center bg-black">
                    <BouncingLoader />
                  </div>
                )}
                <p className="text-center underline font-medium text-[15px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                  {!buffering && !activeServerType ? (
                    servers ? (
                      <>
                        Probably this server is down, try other servers
                        <br />
                        Either reload or try again after sometime
                      </>
                    ) : (
                      <>
                        Probably streaming server is down
                        <br />
                        Either reload or try again after sometime
                      </>
                    )
                  ) : null}
                </p>
              </div>

              {/* Controls Section */}
              <div className="bg-[#0f0f0f]">
                {!buffering && (
                  <div className="border-b border-[#272727]">
                    <Watchcontrols
                      autoPlay={autoPlay}
                      setAutoPlay={setAutoPlay}
                      autoSkipIntro={autoSkipIntro}
                      setAutoSkipIntro={setAutoSkipIntro}
                      autoNext={autoNext}
                      setAutoNext={setAutoNext}
                      episodes={episodes}
                      totalEpisodes={totalEpisodes}
                      episodeId={episodeId}
                      onButtonClick={(id) => setEpisodeId(id)}
                    />
                  </div>
                )}

                {/* Title and Server Selection */}
                <div className="p-3">

                  <div>
                    <Servers
                      servers={servers}
                      activeEpisodeNum={activeEpisodeNum}
                      activeServerId={activeServerId}
                      setActiveServerId={setActiveServerId}
                      serverLoading={serverLoading}
                      setActiveServerType={setActiveServerType}
                      activeServerType={activeServerType}
                      setActiveServerName={setActiveServerName}
                    />
                  </div>
                </div>

                {/* Next Episode Schedule */}
                {nextEpisodeSchedule?.nextEpisodeSchedule && showNextEpisodeSchedule && (
                  <div className="px-3 pb-3">
                    <div className="w-full p-3 rounded-lg bg-[#272727] flex items-center justify-between">
                      <div className="flex items-center gap-x-3">
                        <span className="text-[18px]">🚀</span>
                        <div>
                          <span className="text-gray-400 text-sm">Next episode estimated at</span>
                          <span className="ml-2 text-white text-sm font-medium">
                            {new Date(
                              new Date(nextEpisodeSchedule.nextEpisodeSchedule).getTime() -
                              new Date().getTimezoneOffset() * 60000
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                      <button
                        className="text-2xl text-gray-500 hover:text-white transition-colors"
                        onClick={() => setShowNextEpisodeSchedule(false)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Anime Info Section */}
            <div className="p-6 bg-[#141414] rounded-lg">
              <div className="flex gap-x-6 max-[600px]:flex-col max-[600px]:gap-y-4">
                {animeInfo && animeInfo?.poster ? (
                  <img
                    src={`${animeInfo?.poster}`}
                    alt=""
                    className="w-[120px] h-[180px] object-cover rounded-md max-[600px]:w-full max-[600px]:h-[200px]"
                  />
                ) : (
                  <Skeleton className="w-[120px] h-[180px] rounded-md" />
                )}
                <div className="flex flex-col gap-y-4 flex-1">
                  {animeInfo && animeInfo?.title ? (
                    <h1 className="text-[28px] font-medium text-white leading-tight">
                      {language ? animeInfo?.title : animeInfo?.japanese_title}
                    </h1>
                  ) : (
                    <Skeleton className="w-[170px] h-[20px] rounded-xl" />
                  )}
                  <div className="flex flex-wrap gap-2">
                    {animeInfo ? (
                      tags.map(
                        ({ condition, icon, text }, index) =>
                          condition && (
                            <span key={index} className="px-3 py-1 bg-[#1a1a1a] rounded-full text-sm flex items-center gap-x-1 text-gray-300">
                              {icon && <FontAwesomeIcon icon={icon} className="text-[12px]" />}
                              {text}
                            </span>
                          )
                      )
                    ) : (
                      <Skeleton className="w-[70px] h-[20px] rounded-xl" />
                    )}
                  </div>
                  {animeInfo?.animeInfo?.Overview && (
                    <p className="text-[15px] text-gray-400 leading-relaxed">
                      {animeInfo?.animeInfo?.Overview.length > 270 ? (
                        <>
                          {isFullOverview
                            ? animeInfo?.animeInfo?.Overview
                            : `${animeInfo?.animeInfo?.Overview.slice(0, 270)}...`}
                          <button
                            className="ml-2 text-gray-300 hover:text-white transition-colors"
                            onClick={() => setIsFullOverview(!isFullOverview)}
                          >
                            {isFullOverview ? "Show Less" : "Read More"}
                          </button>
                        </>
                      ) : (
                        animeInfo?.animeInfo?.Overview
                      )}
                    </p>
                  )}
                  <Link
                    to={`/${animeId}`}
                    className="w-fit px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 hover:text-white rounded-md transition-all text-sm font-medium mt-2"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Seasons Section */}
            {seasons?.length > 0 && (
              <div className="p-6 bg-[#141414] rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-white">More Seasons</h2>
                <div className="grid grid-cols-5 gap-4 max-[1200px]:grid-cols-4 max-[900px]:grid-cols-3 max-[600px]:grid-cols-2">
                  {seasons.map((season, index) => (
                    <Link
                      to={`/${season.id}`}
                      key={index}
                      className={`relative aspect-[2/3] rounded-lg overflow-hidden group ${
                        animeId === String(season.id) ? "ring-2 ring-white" : ""
                      }`}
                    >
                      <img
                        src={`${season.season_poster}`}
                        alt=""
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 group-hover:bg-opacity-40 transition-all">
                        <p className="text-center text-sm font-medium">
                          {season.season}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Section */}
            {animeInfo?.recommended_data.length > 0 && (
              <div className="p-6 bg-[#141414] rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-white">Recommended</h2>
                <CategoryCard
                  data={animeInfo?.recommended_data}
                  limit={animeInfo?.recommended_data.length}
                  showViewMore={false}
                />
              </div>
            )}

            {/* Related Anime Section */}
            {animeInfo && animeInfo.related_data ? (
              <div className="p-6 bg-[#141414] rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-white">Related Anime</h2>
                <Sidecard
                  data={animeInfo.related_data}
                  className="!mt-0"
                />
              </div>
            ) : (
              <div className="mt-6">
                <SidecardLoader />
              </div>
            )}
          </div>

          {/* Right Column - Episodes */}
          <div className="episodes h-full bg-[#141414] rounded-lg overflow-hidden">
            {!episodes ? (
              <div className="h-full flex items-center justify-center">
                <BouncingLoader />
              </div>
            ) : (
              <Episodelist
                episodes={episodes}
                currentEpisode={episodeId}
                onEpisodeClick={(id) => setEpisodeId(id)}
                totalEpisodes={totalEpisodes}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
