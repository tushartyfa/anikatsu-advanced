import { useLanguage } from "@/src/context/LanguageContext";
import {
  faAngleDown,
  faCirclePlay,
  faList,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import "./Episodelist.css";

function Episodelist({
  episodes,
  onEpisodeClick,
  currentEpisode,
  totalEpisodes,
}) {
  const [activeEpisodeId, setActiveEpisodeId] = useState(currentEpisode);
  const { language } = useLanguage();
  const listContainerRef = useRef(null);
  const activeEpisodeRef = useRef(null);
  const [showDropDown, setShowDropDown] = useState(false);
  const [selectedRange, setSelectedRange] = useState([1, 100]);
  const [activeRange, setActiveRange] = useState("1-100");
  const [episodeNum, setEpisodeNum] = useState(currentEpisode);
  const dropDownRef = useRef(null);
  const [searchedEpisode, setSearchedEpisode] = useState(null);

  const scrollToActiveEpisode = () => {
    if (activeEpisodeRef.current && listContainerRef.current) {
      const container = listContainerRef.current;
      const activeEpisode = activeEpisodeRef.current;
      const containerTop = container.getBoundingClientRect().top;
      const containerHeight = container.clientHeight;
      const activeEpisodeTop = activeEpisode.getBoundingClientRect().top;
      const activeEpisodeHeight = activeEpisode.clientHeight;
      const offset = activeEpisodeTop - containerTop;
      container.scrollTop =
        container.scrollTop +
        offset -
        containerHeight / 2 +
        activeEpisodeHeight / 2;
    }
  };
  useEffect(() => {
    setActiveEpisodeId(episodeNum);
  }, [episodeNum]);
  useEffect(() => {
    scrollToActiveEpisode();
  }, [activeEpisodeId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setShowDropDown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleChange(e) {
    const value = e.target.value;
    if (value.trim() === "") {
      const newRange = findRangeForEpisode(1);
      setSelectedRange(newRange);
      setActiveRange(`${newRange[0]}-${newRange[1]}`);
      setSearchedEpisode(null);
    } else if (!value || isNaN(value)) {
      setSearchedEpisode(null);
    } else if (
      !isNaN(value) &&
      parseInt(value, 10) > totalEpisodes &&
      episodeNum !== null
    ) {
      const newRange = findRangeForEpisode(episodeNum);
      setSelectedRange(newRange);
      setActiveRange(`${newRange[0]}-${newRange[1]}`);
      setSearchedEpisode(null);
    } else if (!isNaN(value) && value.trim() !== "") {
      const num = parseInt(value, 10);
      const foundEpisode = episodes.find((item) => item?.episode_no === num);
      if (foundEpisode) {
        const newRange = findRangeForEpisode(num);
        setSelectedRange(newRange);
        setActiveRange(`${newRange[0]}-${newRange[1]}`);
        setSearchedEpisode(foundEpisode?.id);
      }
    } else {
      setSearchedEpisode(null);
    }
  }

  function findRangeForEpisode(episodeNumber) {
    const step = 100;
    const start = Math.floor((episodeNumber - 1) / step) * step + 1;
    const end = Math.min(start + step - 1, totalEpisodes);
    return [start, end];
  }

  function generateRangeOptions(totalEpisodes) {
    const ranges = [];
    const step = 100;

    for (let i = 0; i < totalEpisodes; i += step) {
      const start = i + 1;
      const end = Math.min(i + step, totalEpisodes);
      ranges.push(`${start}-${end}`);
    }
    return ranges;
  }
  useEffect(() => {
    if (currentEpisode && episodeNum) {
      if (episodeNum < selectedRange[0] || episodeNum > selectedRange[1]) {
        const newRange = findRangeForEpisode(episodeNum);
        setSelectedRange(newRange);
        setActiveRange(`${newRange[0]}-${newRange[1]}`);
      }
    }
  }, [currentEpisode, totalEpisodes, episodeNum]);

  const handleRangeSelect = (range) => {
    const [start, end] = range.split("-").map(Number);
    setSelectedRange([start, end]);
  };

  useEffect(() => {
    const activeEpisode = episodes.find(
      (item) => item?.id.match(/ep=(\d+)/)?.[1] === activeEpisodeId
    );
    if (activeEpisode) {
      setEpisodeNum(activeEpisode?.episode_no);
    }
  }, [activeEpisodeId, episodes]);

  return (
    <div className="relative flex flex-col w-full h-full max-[1200px]:max-h-[500px]">
      <div className="sticky top-0 z-10 flex flex-col gap-y-[5px] justify-start px-4 py-5 bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <h1 className="text-[14px] font-semibold text-white mb-2">Episodes</h1>
        {totalEpisodes > 100 && (
          <div className="w-full flex gap-x-4 items-center max-[1200px]:justify-between">
            <div className="min-w-fit flex text-[13px]">
              <div
                onClick={() => setShowDropDown((prev) => !prev)}
                className="text-gray-300 w-fit mt-1 text-[13px] relative cursor-pointer flex justify-center items-center hover:text-white transition-colors"
                ref={dropDownRef}
              >
                <FontAwesomeIcon icon={faList} className="text-gray-400" />
                <div className="w-fit flex justify-center items-center gap-x-2 ml-4">
                  <p className="text-[12px]">
                    {selectedRange[0]}-{selectedRange[1]}
                  </p>
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    className="mt-[2px] text-[10px]"
                  />
                </div>
                {showDropDown && (
                  <div className="absolute flex flex-col top-full mt-[10px] left-0 z-30 bg-[#2a2a2a] w-[150px] max-h-[200px] overflow-y-auto rounded-lg border border-[#3a3a3a] shadow-lg">
                    {generateRangeOptions(totalEpisodes).map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          handleRangeSelect(item);
                          setActiveRange(item);
                        }}
                        className={`hover:bg-[#3a3a3a] cursor-pointer transition-colors ${
                          item === activeRange ? "bg-[#404040]" : ""
                        }`}
                      >
                        <p className="font-medium text-[12px] p-3 flex justify-between items-center text-gray-300 hover:text-white">
                          {item}
                          {item === activeRange ? (
                            <FontAwesomeIcon icon={faCheck} className="text-white" />
                          ) : null}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="border border-[#3a3a3a] rounded-lg py-2 px-3 flex items-center gap-x-3 bg-[#2a2a2a] focus-within:border-gray-500 transition-colors">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="text-[12px] text-gray-400"
              />
              <input
                type="text"
                className="w-full bg-transparent focus:outline-none rounded-sm text-[13px] text-white placeholder:text-gray-500"
                placeholder="Go to episode..."
                onChange={handleChange}
              />
            </div>
          </div>
        )}
      </div>
      <div ref={listContainerRef} className="w-full h-full overflow-y-auto bg-[#1a1a1a]">
        <div
          className={`${
            totalEpisodes > 30
              ? "p-4 grid grid-cols-5 gap-2 max-[1200px]:grid-cols-12 max-[860px]:grid-cols-10 max-[575px]:grid-cols-8 max-[478px]:grid-cols-6 max-[350px]:grid-cols-5"
              : ""
          }`}
        >
          {totalEpisodes > 30
            ? episodes
                .slice(selectedRange[0] - 1, selectedRange[1])
                .map((item, index) => {
                  const episodeNumber = item?.id.match(/ep=(\d+)/)?.[1];
                  const isActive =
                    activeEpisodeId === episodeNumber ||
                    currentEpisode === episodeNumber;
                  const isSearched = searchedEpisode === item?.id;

                  return (
                    <div
                      key={item?.id}
                      ref={isActive ? activeEpisodeRef : null}
                      className={`flex items-center justify-center rounded-lg h-[35px] text-[13px] font-medium cursor-pointer transition-all ${
                        item?.filler
                          ? isActive
                            ? "bg-white text-black"
                            : "bg-[#2a2a2a] text-gray-400"
                          : ""
                      } hover:bg-[#404040] 
                          hover:text-white
                       ${
                         isActive
                           ? "bg-white text-black ring-1 ring-white"
                           : "bg-[#2a2a2a] text-gray-400"
                       } ${isSearched ? "ring-2 ring-white" : ""}`}
                      onClick={() => {
                        if (episodeNumber) {
                          onEpisodeClick(episodeNumber);
                          setActiveEpisodeId(episodeNumber);
                          setSearchedEpisode(null);
                        }
                      }}
                    >
                      <span className="transition-colors">
                        {index + selectedRange[0]}
                      </span>
                    </div>
                  );
                })
            : episodes?.map((item, index) => {
                const episodeNumber = item?.id.match(/ep=(\d+)/)?.[1];
                const isActive =
                  activeEpisodeId === episodeNumber ||
                  currentEpisode === episodeNumber;
                const isSearched = searchedEpisode === item?.id;

                return (
                  <div
                    key={item?.id}
                    ref={isActive ? activeEpisodeRef : null}
                    className={`w-full px-4 py-3 flex items-center justify-start gap-x-6 cursor-pointer transition-all ${
                      (index + 1) % 2 && !isActive
                        ? "bg-[#202020]"
                        : "bg-[#1a1a1a]"
                    } hover:bg-[#2a2a2a] ${
                      isActive ? "bg-[#2a2a2a]" : ""
                    } ${isSearched ? "ring-1 ring-white" : ""}`}
                    onClick={() => {
                      if (episodeNumber) {
                        onEpisodeClick(episodeNumber);
                        setActiveEpisodeId(episodeNumber);
                        setSearchedEpisode(null);
                      }
                    }}
                  >
                    <p className={`text-[14px] font-medium ${isActive ? "text-white" : "text-gray-400"}`}>
                      {index + 1}
                    </p>
                    <div className="w-full flex items-center justify-between gap-x-[5px]">
                      <h1 className={`line-clamp-1 text-[14px] transition-colors ${
                        isActive ? "text-white font-medium" : "text-gray-400 font-normal"
                      }`}>
                        {language === "EN" ? item?.title : item?.japanese_title}
                      </h1>
                      {isActive && (
                        <FontAwesomeIcon
                          icon={faCirclePlay}
                          className="w-[18px] h-[18px] text-white"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}

export default Episodelist;
