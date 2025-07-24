import Suggestion from '../suggestion/Suggestion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import useSearch from '@/src/hooks/useSearch';
import { useNavigate } from 'react-router-dom';

function MobileSearch() {
    const navigate = useNavigate();
    const {
        isSearchVisible,
        searchValue,
        setSearchValue,
        isFocused,
        setIsFocused,
        debouncedValue,
        suggestionRefs,
        addSuggestionRef,
    } = useSearch();
    const handleSearchClick = () => {
        if (searchValue.trim() && window.innerWidth <= 600) {
            navigate(`/search?keyword=${encodeURIComponent(searchValue)}`);
        }
    };
    return (
        <>
            {isSearchVisible && (
                <div className="flex w-full mt-2 relative custom-md:hidden px-4">
                    <div className="relative w-full">
                        <input
                            type="text"
                            className="w-full px-5 py-2 bg-[#2a2a2a]/75 text-white border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors placeholder-white/50"
                            placeholder="Search anime..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => {
                                setTimeout(() => {
                                    const isInsideSuggestionBox = suggestionRefs.current.some(
                                        (ref) => ref && ref.contains(document.activeElement),
                                    );
                                    if (!isInsideSuggestionBox) {
                                        setIsFocused(false);
                                    }
                                }, 100);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearchClick();
                                }
                            }}
                        />
                        <button 
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                            onClick={handleSearchClick}
                        >
                            <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                className="text-lg"
                            />
                        </button>
                    </div>
                    {searchValue.trim() && isFocused && (
                        <div
                            ref={addSuggestionRef}
                            className="absolute z-[100000] top-full w-full"
                        >
                            <Suggestion keyword={debouncedValue} className="w-full" />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default MobileSearch;
