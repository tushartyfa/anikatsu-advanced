import { FaChevronLeft } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm, faRandom, faHome, faClock, faFire, faTv, faPlay, faCirclePlay, faFilePen, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "@/src/context/LanguageContext";
import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const MENU_ITEMS = [
  { name: "Home", path: "/home", icon: faHome },
  { name: "Subbed Anime", path: "/subbed-anime", icon: faFilePen },
  { name: "Dubbed Anime", path: "/dubbed-anime", icon: faPlay },
  { name: "Most Popular", path: "/most-popular", icon: faFire },
  { name: "Movies", path: "/movie", icon: faFilm },
  { name: "TV Series", path: "/tv", icon: faTv },
  { name: "OVAs", path: "/ova", icon: faCirclePlay },
  { name: "ONAs", path: "/ona", icon: faPlay },
  { name: "Specials", path: "/special", icon: faClock },
  { name: "Join Telegram", path: "https://t.me/zenime_discussion", icon: faPaperPlane },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const scrollPosition = useRef(0);

  useEffect(() => {
    if (isOpen) {
      scrollPosition.current = window.pageYOffset;
      document.body.classList.add('sidebar-open');
      document.body.style.top = `-${scrollPosition.current}px`;
    } else {
      document.body.classList.remove('sidebar-open');
      document.body.style.top = '';
      window.scrollTo(0, scrollPosition.current);
    }
    return () => {
      document.body.classList.remove('sidebar-open');
      document.body.style.top = '';
    };
  }, [isOpen]);

  useEffect(() => {
    onClose();
  }, [location]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 transform transition-all duration-400 ease-in-out backdrop-blur-lg bg-black/50"
          onClick={onClose}
          style={{ zIndex: 1000000 }}
        />
      )}

      <div
        className={`fixed h-[100dvh] w-[280px] max-[575px]:w-[260px] top-0 left-0 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ zIndex: 1000200 }}
      >
        <div
          className="bg-[#0a0a0a] w-full h-full flex flex-col items-start overflow-y-auto sidebar"
        >
          {/* Header */}
          <div className="w-full p-6 border-b border-white/5">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
            >
              <FaChevronLeft className="text-sm" />
              <span className="text-sm font-medium">Close Menu</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="w-full p-4 border-b border-white/5 lg:hidden">
            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/random"
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <FontAwesomeIcon icon={faRandom} className="text-lg" />
                <span className="text-xs font-medium">Random</span>
              </Link>
              <Link
                to="/movie"
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <FontAwesomeIcon icon={faFilm} className="text-lg" />
                <span className="text-xs font-medium">Movie</span>
              </Link>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5">
                <div className="flex bg-white/10 rounded">
                  {["EN", "JP"].map((lang, index) => (
                    <button
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`px-2 py-1 text-xs font-medium transition-colors ${
                        language === lang
                          ? "bg-white/15 text-white"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-medium text-white/60">Language</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="w-full p-2">
            {MENU_ITEMS.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <FontAwesomeIcon icon={item.icon} className="text-lg w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
