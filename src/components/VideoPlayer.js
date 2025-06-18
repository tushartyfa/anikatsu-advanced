'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import NextImage from 'next/image';

// Get the M3U8 Proxy URL from environment variables
const CORSPROXY_URL = process.env.NEXT_PUBLIC_CORSPROXY_URL;

// Debug the environment variable
console.log('CORSPROXY_URL:', CORSPROXY_URL);

export default function VideoPlayer({ src, poster, headers = {}, subtitles = [], thumbnails = null, category = 'sub', intro = null, outro = null, autoSkipIntro = false, autoSkipOutro = false, episodeId }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [videoHeaders, setVideoHeaders] = useState(headers);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [previewPosition, setPreviewPosition] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isDubbed, setIsDubbed] = useState(category === 'dub');
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  
  // New state variables
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState(null);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(null);
  const [showQualityOptions, setShowQualityOptions] = useState(false);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [showSubtitleOptions, setShowSubtitleOptions] = useState(false);
  const [audioBoost, setAudioBoost] = useState(100);
  const [settingsView, setSettingsView] = useState('main'); // 'main', 'quality', 'speed', 'audio'

  // Add state for buffering and last buffer update
  const [isBuffering, setIsBuffering] = useState(false);
  const [lastBufferUpdate, setLastBufferUpdate] = useState(Date.now());
  const bufferCheckInterval = useRef(null);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [castState, setCastState] = useState('NO_DEVICES_AVAILABLE');
  const [previewTime, setPreviewTime] = useState(0);
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState(false);

  // Add state for mouse movement
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const hideControlsTimer = useRef(null);

  // Add isMobile state
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // matches Tailwind's md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset video state when episodeId changes
  useEffect(() => {
    setIsPlaying(false);
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setBufferedProgress(0);
    
    // Reset video element
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [episodeId]);

  // Handle video click based on device type
  const handleVideoClick = () => {
    if (isMobile) {
      setShowControls(!showControls);
    } else {
      togglePlay();
    }
  };

  // Function to check if a URL is an M3U8 URL and if so, route it through the external proxy
  const getProxiedUrl = (url) => {
    if (!url) return url;
    
    // Log the original URL for debugging
    console.log('[VideoPlayer] Original URL:', url);
    
    // Check if the URL is an M3U8 URL
    if (url.includes('.m3u8') || url.includes('application/vnd.apple.mpegurl')) {
      // Check if we have a CORS proxy URL configured
      if (!CORSPROXY_URL) {
        console.warn('[VideoPlayer] No CORS proxy URL configured, using original URL');
        return url;
      }
      
      // Route through the external M3U8 proxy server
      const encodedUrl = encodeURIComponent(url);
      const proxiedUrl = `${CORSPROXY_URL}/m3u8-proxy?url=${encodedUrl}`;
      console.log('[VideoPlayer] Using proxied URL:', proxiedUrl);
      return proxiedUrl;
    }
    
    return url;
  };

  // Set headers from props when they change
  useEffect(() => {
    setVideoHeaders(headers);
    console.log('Headers updated from props:', headers);
  }, [headers]);

  // Format time from seconds to MM:SS
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Event handlers
  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const progress = (video.currentTime / video.duration) * 100;
    setProgress(isNaN(progress) ? 0 : progress);
    setCurrentTime(video.currentTime);

    // Show/hide skip intro button
    if (intro) {
      const isInIntro = video.currentTime >= intro.start && video.currentTime < intro.end;
      setShowSkipIntro(isInIntro);
      
      // Auto skip intro if enabled
      if (isInIntro && autoSkipIntro) {
        video.currentTime = intro.end;
      }
    }

    // Show/hide skip outro button
    if (outro) {
      const isInOutro = video.currentTime >= outro.start && video.currentTime < outro.end;
      setShowSkipOutro(isInOutro);
      
      // Auto skip outro if enabled
      if (isInOutro && autoSkipOutro) {
        video.currentTime = outro.end;
      }
    }
  };

  const onDurationChange = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  const onLoadedData = () => {
    setIsLoading(false);
  };

  const onError = () => {
    setError('Error playing video');
    setIsLoading(false);
  };

  const onEnded = () => {
    setIsPlaying(false);
  };

  // Toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Change current time on seek
  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  };

  // Change volume
  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
  };

  // Function to get highest quality level
  const getHighestQuality = () => {
    if (!qualities.length) return -1;
    const sortedQualities = [...qualities].sort((a, b) => (b.height || 0) - (a.height || 0));
    return sortedQualities[0].id;
  };

  // Function to get next lower quality level
  const getNextLowerQuality = (currentId) => {
    if (!qualities.length) return -1;
    const sortedQualities = [...qualities].sort((a, b) => (b.height || 0) - (a.height || 0));
    const currentIndex = sortedQualities.findIndex(q => q.id === currentId);
    if (currentIndex < sortedQualities.length - 1) {
      return sortedQualities[currentIndex + 1].id;
    }
    return currentId;
  };

  // Set up HLS.js for M3U8 streams
  useEffect(() => {
    if (!src) return;
    
    const video = videoRef.current;
    if (!video) return;
    
    let hls = null;
    
    const setupHls = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if the source is an M3U8 stream
        const isHlsStream = src.includes('.m3u8') || src.includes('application/vnd.apple.mpegurl');
        
        if (isHlsStream && Hls.isSupported()) {
          console.log('[VideoPlayer] HLS is supported, initializing');
          
          hls = new Hls({
            xhrSetup: (xhr, url) => {
              console.log('[VideoPlayer] HLS XHR setup for URL:', url);
              
              // Set headers for HLS requests
              Object.entries(videoHeaders).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value);
                console.log(`[VideoPlayer] Setting header: ${key}`);
              });
            },
            // Additional HLS settings for better performance
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            startLevel: -1, // Auto level selection
            capLevelToPlayerSize: true, // Limit quality based on player size
            debug: false,
            // Add more robust error recovery
            fragLoadingMaxRetry: 5,
            manifestLoadingMaxRetry: 5,
            levelLoadingMaxRetry: 5,
            fragLoadingRetryDelay: 1000,
            manifestLoadingRetryDelay: 1000,
            levelLoadingRetryDelay: 1000
          });
          
          window.hls = hls; // Save reference for debugging
          
          // Bind HLS to video element
          const proxiedSrc = getProxiedUrl(src);
          console.log('[VideoPlayer] Loading proxied source:', proxiedSrc);
          hls.loadSource(proxiedSrc);
          hls.attachMedia(video);
          
          // Handle HLS events
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('[VideoPlayer] HLS manifest parsed');
            // Get available qualities
            const levels = hls.levels.map((level, index) => ({
              id: index,
              label: `${level.height}p`,
              height: level.height,
              selected: index === hls.currentLevel
            }));
            
            console.log('[VideoPlayer] Available qualities:', levels);
            setQualities(levels);
            setCurrentQuality(hls.currentLevel);
            
            // Auto-play when ready
            if (isPlaying) {
              video.play().catch(err => {
                console.error('[VideoPlayer] Autoplay error:', err);
              });
            }
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('[VideoPlayer] HLS error:', event, data);
            
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('[VideoPlayer] HLS network error, attempting recovery');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('[VideoPlayer] HLS media error, attempting recovery');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('[VideoPlayer] HLS fatal error, cannot recover');
                  setError('Failed to load video - please try another server');
                  break;
              }
            }
          });
        } else {
          // For non-HLS streams, use native video player
          console.log('[VideoPlayer] Using native player for source:', src);
          
          // Set headers for direct video requests
          const fetchOptions = {
            headers: videoHeaders
          };
          
          try {
            const response = await fetch(src, fetchOptions);
            if (!response.ok) {
              console.error('[VideoPlayer] Failed to fetch video:', response.status, response.statusText);
              throw new Error('Failed to load video');
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            video.src = url;
            
            // Auto-play when ready
            if (isPlaying) {
              video.play().catch(err => {
                console.error('[VideoPlayer] Autoplay error:', err);
              });
            }
          } catch (error) {
            console.error('[VideoPlayer] Error loading video:', error);
            setError('Failed to load video - please try another server');
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('[VideoPlayer] Error setting up video:', error);
        setError('Failed to load video - please try another server');
        setIsLoading(false);
      }
    };
    
    setupHls();
    
    // Cleanup
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, videoHeaders, isPlaying]);

  // Add event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!src || src === 'undefined' || src.includes('undefined')) {
      setError('No valid video source provided');
      setIsLoading(false);
      return;
    }

    // Get the proxied URL if it's an M3U8 URL
    const proxiedSrc = getProxiedUrl(src);

    setIsLoading(true);
    
    const setupHls = async () => {
      if (Hls.isSupported()) {
        if (hls) {
          hls.destroy();
        }
        
        hls = new Hls({
          debug: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          enableWorker: false, // Disable worker for easier debugging
          startLevel: -1, // Start with Auto quality
          autoLevelEnabled: true, // Enable auto quality switching
          abrEwmaDefaultEstimate: 500000, // Start with a higher bandwidth estimate
          abrBandWidthFactor: 0.95, // Be more aggressive with quality upgrades
          abrBandWidthUpFactor: 0.7, // Be more conservative with quality downgrades
          xhrSetup: function(xhr, url) {
            console.log('HLS attempting to load:', url);
            
            // Only route external URLs through the proxy
            if (!url.startsWith(CORSPROXY_URL) && !url.startsWith('blob:') && url.includes('://')) {
              // If this is a segment URL from an HLS manifest
              const proxiedUrl = `${CORSPROXY_URL}/ts-proxy?url=${encodeURIComponent(url)}&headers=${encodeURIComponent(JSON.stringify(videoHeaders))}`;
              console.log('Redirecting segment request through proxy:', proxiedUrl);
              xhr.open('GET', proxiedUrl, true);
              return;
            }
          }
        });
        
        // Make hls instance globally accessible for quality switching
        window.hls = hls;
        
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('Video and HLS attached');
        });
        
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log('Manifest parsed successfully');
          setIsLoading(false);
          
          // Extract available quality levels
          if (data && data.levels && data.levels.length > 0) {
            const availableQualities = data.levels.map((level, index) => ({
              id: index,
              height: level.height,
              width: level.width,
              bitrate: level.bitrate,
              name: level.height ? `${level.height}p` : `Quality ${index + 1}`
            }));
            
            setQualities(availableQualities);
            setCurrentQuality({ id: -1, name: 'Auto' }); // Set to Auto by default
            console.log('Available qualities:', availableQualities);

            // Start with highest quality in Auto mode
            const highestQuality = getHighestQuality();
            if (highestQuality !== -1) {
              hls.nextLevel = highestQuality;
            }
          }
          
          video.play().catch(e => {
            console.warn('Auto-play was prevented:', e);
            setIsPlaying(false);
          });
        });

        // Monitor buffering state
        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          setIsBuffering(false);
          setLastBufferUpdate(Date.now());
        });

        hls.on(Hls.Events.BUFFER_STALLED, () => {
          setIsBuffering(true);
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error details:', data);
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Network error:', data.details);
                console.error('Error with URL:', data.url);
                
                if (data.response && data.response.code === 403) {
                  setError(`Access denied (403 Forbidden). Please check your headers.`);
                  setIsLoading(false);
                  return;
                }
                
                if (data.response && (data.response.code === 404 || data.url?.includes(CORSPROXY_URL))) {
                  setError(`Could not connect to proxy server. Please check if the proxy is running at ${CORSPROXY_URL}`);
                  setIsLoading(false);
                  return;
                }
                
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                setError('Failed to load video: ' + (data.details || 'Unknown error'));
                setIsLoading(false);
                break;
            }
          }
        });
        
        console.log('Loading source:', proxiedSrc);
        hls.loadSource(proxiedSrc);
        hls.attachMedia(video);
        
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // For Safari on iOS/Mac
        console.log('Using native HLS support');
        video.src = proxiedSrc;
        
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          video.play().catch(e => {
            console.warn('Auto-play was prevented:', e);
            setIsPlaying(false);
          });
        });
        
      } else {
        // Direct fallback for non-HLS browsers
        console.log('No HLS support, trying direct playback');
        try {
          video.src = proxiedSrc;
          setIsLoading(false);
        } catch (e) {
          console.error('Error setting video source:', e);
          setError('Your browser cannot play this video');
          setIsLoading(false);
        }
      }
    };

    setupHls();

    // Set up buffer monitoring
    bufferCheckInterval.current = setInterval(() => {
      if (isBuffering && Date.now() - lastBufferUpdate > 5000) {
        // If buffering for more than 5 seconds, try switching to lower quality
        if (window.hls && currentQuality?.id !== -1) {
          const nextLowerQuality = getNextLowerQuality(window.hls.currentLevel);
          if (nextLowerQuality !== window.hls.currentLevel) {
            window.hls.nextLevel = nextLowerQuality;
            console.log('Switching to lower quality due to buffering:', nextLowerQuality);
          }
        }
      }
    }, 1000);

    // Cleanup function
    return () => {
      if (hls) {
        hls.destroy();
      }
      if (bufferCheckInterval.current) {
        clearInterval(bufferCheckInterval.current);
      }
    };
  }, [src, videoHeaders]);

  // Add event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('error', onError);
    video.addEventListener('ended', onEnded);
    
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('error', onError);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    }
  };

  // Skip forward 10 seconds
  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
  };

  // Skip backward 10 seconds
  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 10, 0);
  };

  // Change playback speed
  const changePlaybackSpeed = (speed) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedOptions(false);
  };

  // Toggle subtitles
  const toggleSubtitles = () => {
    setShowSubtitles(!showSubtitles);
  };

  // Initialize subtitle tracks when the video element is created
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSubtitle) return;
    
    console.log('[VideoPlayer] Initializing subtitle tracks on mount');
    
      // Apply the active subtitle
  if (activeSubtitle && showSubtitles) {
    // First remove any existing tracks
    const existingTracks = video.querySelectorAll('track');
    existingTracks.forEach(track => track.remove());
    
    // Create and append the track element
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = activeSubtitle.label || activeSubtitle.lang || 'Default';
    track.srclang = activeSubtitle.lang || 'en';
    
    // Format subtitle URL correctly - it might be in different formats
    let subtitleUrl = activeSubtitle.src || activeSubtitle.url;
    
    // Some subtitle URLs might need proxying if they're from a different origin
    if (subtitleUrl && (subtitleUrl.startsWith('http://') || subtitleUrl.startsWith('https://'))) {
      const proxyBase = process.env.NEXT_PUBLIC_CORSPROXY_URL || '';
      if (proxyBase && !subtitleUrl.includes(window.location.host)) {
        subtitleUrl = `${proxyBase}/subtitle-proxy?url=${encodeURIComponent(subtitleUrl)}`;
        console.log('[VideoPlayer] Proxying subtitle URL:', subtitleUrl);
      }
    }
    
    track.src = subtitleUrl;
    track.default = true;
    
    console.log('[VideoPlayer] Adding track on mount with src:', track.src);
    video.appendChild(track);
    
    // Force the track to be active after a short delay
    setTimeout(() => {
      if (video.textTracks && video.textTracks.length > 0) {
        console.log('[VideoPlayer] Activating text track');
        video.textTracks[0].mode = 'showing';
      }
    }, 500);
  }
  }, [videoRef.current, activeSubtitle, showSubtitles]);

  // This function manually applies the selected subtitle to the video
  const applySubtitle = (subtitle) => {
    console.log('[VideoPlayer] Applying subtitle:', JSON.stringify(subtitle));
    if (!videoRef.current || !subtitle) return;
    
    // Ensure we have valid URL
    let subtitleUrl = subtitle.src || subtitle.url;
    if (!subtitleUrl) {
      console.error('[VideoPlayer] No valid URL found in subtitle:', JSON.stringify(subtitle));
      return;
    }
    
    // Some subtitle URLs might need proxying if they're from a different origin
    if (subtitleUrl && (subtitleUrl.startsWith('http://') || subtitleUrl.startsWith('https://'))) {
      const proxyBase = process.env.NEXT_PUBLIC_CORSPROXY_URL || '';
      if (proxyBase && !subtitleUrl.includes(window.location.host)) {
        subtitleUrl = `${proxyBase}/subtitle-proxy?url=${encodeURIComponent(subtitleUrl)}`;
        console.log('[VideoPlayer] Proxying subtitle URL:', subtitleUrl);
      }
    }
    
    console.log('[VideoPlayer] Final subtitle URL:', subtitleUrl);
    
    // Remove all existing tracks
    const video = videoRef.current;
    const existingTracks = video.querySelectorAll('track');
    existingTracks.forEach(track => track.remove());
    
    // Create a new track element
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = subtitle.label || subtitle.lang || 'Unknown';
    track.srclang = subtitle.lang || 'en';
    track.src = subtitleUrl;
    track.default = true;
    
    // Add track to video
    video.appendChild(track);
    
    // Force enable the track
    setTimeout(() => {
      if (video.textTracks && video.textTracks.length > 0) {
        video.textTracks[0].mode = 'showing';
        console.log('[VideoPlayer] Track enabled, mode:', video.textTracks[0].mode);
      } else {
        console.error('[VideoPlayer] No text tracks available after adding track');
      }
    }, 100);
  };

  // Handle subtitle change from UI
  const changeSubtitle = (subtitle) => {
    console.log('[VideoPlayer] changeSubtitle called with:', JSON.stringify(subtitle));
    
    if (!subtitle) {
      setShowSubtitles(false);
      setActiveSubtitle(null);
      
      // Remove all tracks
      if (videoRef.current) {
        const existingTracks = videoRef.current.querySelectorAll('track');
        existingTracks.forEach(track => track.remove());
      }
      
      console.log('[VideoPlayer] Subtitles turned off');
      return;
    }
    
    // Set state and apply the subtitle
    setActiveSubtitle(subtitle);
    setShowSubtitles(true);
    applySubtitle(subtitle);
  };

  // Change quality function update
  const changeQuality = (quality) => {
    const video = videoRef.current;
    if (!video || !window.hls) return;
    
    // Save current time
    const currentTime = video.currentTime;
    
    if (quality.id === -1) {
      // Auto mode
      window.hls.currentLevel = -1;
      window.hls.nextLevel = getHighestQuality(); // Start with highest quality in Auto mode
      window.hls.autoLevelEnabled = true;
    } else {
      // Manual mode
    window.hls.currentLevel = quality.id;
      window.hls.autoLevelEnabled = false;
    }
    
    setCurrentQuality(quality);
    console.log(`Changed quality to ${quality.name}`);
  };

  // Toggle settings menu
  const toggleSettings = () => {
    setShowSettings(!showSettings);
    setShowQualityOptions(false);
    setShowSpeedOptions(false);
    setShowSubtitleOptions(false);
  };

  // Handle mouse movement and auto-hide controls
  const handleMouseMove = () => {
    setIsMouseMoving(true);
      setShowControls(true);
    
    // Clear existing timer
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    
    // Set new timer to hide controls after 3 seconds
    hideControlsTimer.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, []);

  // Update timer when play state changes
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    } else {
      // Start hide timer when video starts playing
      handleMouseMove();
    }
  }, [isPlaying]);

  // Set default subtitle when subtitles change
  useEffect(() => {
    console.log('[VideoPlayer] Subtitles prop received:', JSON.stringify(subtitles));
    
    if (subtitles && subtitles.length > 0) {
      // Set the first subtitle as active (should be English after our sorting)
      console.log('[VideoPlayer] Setting active subtitle to:', JSON.stringify(subtitles[0]));
      setActiveSubtitle(subtitles[0]);
      setShowSubtitles(true);
      
      // Apply the subtitle if video is already loaded
      if (videoRef.current) {
        setTimeout(() => {
          applySubtitle(subtitles[0]);
        }, 500);
      }
    } else {
      console.log('[VideoPlayer] No subtitles available, setting activeSubtitle to null');
      setActiveSubtitle(null);
    }
  }, [subtitles]);

  // Function to format time for thumbnail preview
  const formatPreviewTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle timeline hover
  const handleTimelineHover = (e) => {
    if (!thumbnails) return;

    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    
    // Calculate preview position and time
    const previewTimeValue = percentage * (videoRef.current?.duration || 0);
    setPreviewTime(previewTimeValue);
    
    // Position the preview element
    // Ensure the preview stays within the viewport
    const previewWidth = 160; // Width of preview container
    let position = (offsetX - previewWidth / 2) / rect.width * 100;
    
    // Prevent preview from going off-screen
    const minPosition = (previewWidth / 2) / rect.width * 100;
    const maxPosition = 100 - (previewWidth / 2) / rect.width * 100;
    position = Math.max(minPosition, Math.min(maxPosition, position));
    
    setPreviewPosition(position);
    setShowPreview(true);
  };
  
  // Handle timeline hover end
  const handleTimelineLeave = () => {
    setShowPreview(false);
  };

  // Update buffer progress
  const updateBufferProgress = () => {
    const video = videoRef.current;
    if (!video || !video.buffered || !video.buffered.length) return;

    const buffered = video.buffered;
    const currentTime = video.currentTime;
    
    // Find the appropriate buffered range
    for (let i = 0; i < buffered.length; i++) {
      if (buffered.start(i) <= currentTime && currentTime <= buffered.end(i)) {
        setBufferedProgress((buffered.end(i) / video.duration) * 100);
        break;
      }
    }
  };

  // Add buffer progress listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleProgress = () => {
      updateBufferProgress();
    };

    video.addEventListener('progress', handleProgress);
    video.addEventListener('timeupdate', handleProgress);

    return () => {
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('timeupdate', handleProgress);
    };
  }, []);

  // Update audio boost function to handle percentage
  const changeAudioBoost = (boost) => {
    const video = videoRef.current;
    if (!video) return;
    const multiplier = boost / 100;
    video.volume = Math.min(volume * multiplier, 1);
    video.volume = Math.min(multiplier, 1); // Set volume directly based on boost
    setAudioBoost(boost);
  };

  // Add Google Cast functionality
  const initializeCast = () => {
    if (!window.chrome || !window.chrome.cast) {
      console.log('Chrome Cast API not available');
      return;
    }

    // Initialize Cast API
    const initCastApi = () => {
      const sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
      const apiConfig = new chrome.cast.ApiConfig(
        sessionRequest,
        (session) => {
          console.log('Cast session success:', session);
        },
        (availability) => {
          setIsCastAvailable(availability === chrome.cast.ReceiverAvailability.AVAILABLE);
        },
        chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
      );

      chrome.cast.initialize(apiConfig,
        () => {
          console.log('Cast API initialized successfully');
          setIsCastAvailable(true);
        },
        (error) => {
          console.error('Cast API initialization error:', error);
        }
      );
    };

    // Load Cast Framework
    window['__onGCastApiAvailable'] = (isAvailable) => {
      if (isAvailable) {
        // Initialize Cast Framework
        const context = cast.framework.CastContext.getInstance();
        context.setOptions({
          receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
          autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
        });

        // Listen for cast state changes
        context.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, (event) => {
          setCastState(event.castState);
        });

        // Initialize the old Cast API as well
        initCastApi();
      }
    };

    // Load the Cast SDK if not already loaded
    if (!document.querySelector('#cast-script')) {
      const script = document.createElement('script');
      script.id = 'cast-script';
      script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
      document.head.appendChild(script);
    }
  };

  // Function to start casting
  const startCasting = async () => {
    try {
      if (!window.chrome || !window.chrome.cast) {
        console.log('Cast API not available');
        return;
      }

      const context = cast.framework.CastContext.getInstance();
      
      // If not connected, request a session
      if (context.getCastState() === cast.framework.CastState.NOT_CONNECTED) {
        try {
          await context.requestSession();
          console.log('Cast session requested');
        } catch (error) {
          console.error('Error requesting cast session:', error);
          return;
        }
      }

      // Get current session
      const session = context.getCurrentSession();
      if (!session) {
        console.log('No cast session available');
        return;
      }

      // Prepare media info
      const mediaInfo = new chrome.cast.media.MediaInfo(src, 'application/x-mpegURL');
      mediaInfo.customData = null;
      mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
      
      // Add current time and duration
      const currentTime = videoRef.current?.currentTime || 0;
      const duration = videoRef.current?.duration || 0;
      
      const request = new chrome.cast.media.LoadRequest(mediaInfo);
      request.currentTime = currentTime;
      request.autoplay = true;

      try {
        await session.loadMedia(request);
        console.log('Media loaded successfully');
        
        // Pause the video player when casting starts
        if (videoRef.current) {
          videoRef.current.pause();
        }
      } catch (error) {
        console.error('Error loading media:', error);
      }
    } catch (error) {
      console.error('Error starting cast:', error);
    }
  };

  // Initialize Cast when component mounts
  useEffect(() => {
    initializeCast();
  }, []);

  // Load and verify thumbnails
  useEffect(() => {
    if (thumbnails) {
      const img = new window.Image();
      img.onload = () => {
        setThumbnailsLoaded(true);
        console.log('Thumbnails loaded successfully');
      };
      img.onerror = (err) => {
        console.error('Error loading thumbnails:', err);
      };
      img.src = thumbnails;
    }
  }, [thumbnails]);

  // Update isDubbed when category changes
  useEffect(() => {
    setIsDubbed(category === 'dub');
  }, [category]);

  // Add skip intro/outro functions
  const skipIntro = () => {
    if (videoRef.current && intro?.end) {
      videoRef.current.currentTime = intro.end;
    }
  };

  const skipOutro = () => {
    if (videoRef.current && outro?.end) {
      videoRef.current.currentTime = outro.end;
    }
  };

  return (
    <div 
      className="relative bg-black w-full aspect-video group/player"
      onMouseEnter={() => !isMobile && setShowControls(true)}
      onMouseLeave={() => !isMobile && isPlaying && setShowControls(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Mobile Controls (Only visible on small screens) */}
      <div className="absolute top-0 left-0 right-0 z-10 p-2 md:hidden">
        <div className="flex justify-between items-center">
          {/* Settings Button */}
          <div className="relative group/settings">
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                if (!showSettings) {
                  setSettingsView('main');
                }
                setShowSubtitleOptions(false);
              }}
              className={`p-1.5 text-white hover:text-white/80 transition-colors hover:bg-white/10 rounded-lg ${
                showSettings ? 'bg-white/20' : ''
              }`}
            >
              <svg className={`w-6 h-6 transition-transform duration-300 ${showSettings ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        preload="metadata"
        onClick={handleVideoClick}
        playsInline
        crossOrigin="anonymous"
        onTimeUpdate={onTimeUpdate}
        onDurationChange={onDurationChange}
        onLoadedData={() => {
          onLoadedData();
          // Only apply subtitles if it's not a dub and subtitles are enabled
          if (activeSubtitle && showSubtitles && !isDubbed) {
            setTimeout(() => {
              applySubtitle(activeSubtitle);
            }, 100);
          }
        }}
        onError={onError}
        onEnded={onEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={src} type={src.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4'} />
        Your browser does not support the video tag.
      </video>

      {/* Pause Overlay with Blur */}
      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300" />
      )}
      
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="relative w-16 h-16">
            {/* Outer ring with fade effect */}
            <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-[ping_1.5s_ease-in-out_infinite]"></div>
            
            {/* Inner spinning ring */}
            <div className="absolute inset-2 rounded-full border-2 border-white/40 animate-[spin_1s_linear_infinite]"></div>
            
            {/* Core circle with pulse */}
            <div className="absolute inset-4 rounded-full bg-white/10 animate-[pulse_1s_ease-in-out_infinite]"></div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="text-white text-center p-6 max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-pulse"></div>
              <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-500 text-xl font-medium mb-2">Error: {error}</p>
            <p className="text-gray-400">Please try a different server or check your connection.</p>
          </div>
        </div>
      )}
      
      {/* Center Play Button (only shown briefly on state change) */}
        <div 
        className={`absolute inset-0 flex items-center justify-center`}
          onClick={handleVideoClick}
      >
        <div className={`transform transition-all duration-200 ${
          isPlaying ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}>
          <button 
            className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center"
        >
          <svg 
              className="w-8 h-8 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          </button>
        </div>
      </div>

      {/* Skip Intro Button */}
      {showSkipIntro && (
        <div className="absolute bottom-24 right-4 z-50">
          <button
            onClick={skipIntro}
            className="px-4 py-2 bg-black/80 text-white rounded-md text-sm font-medium hover:bg-black/90 transition-colors flex items-center gap-2"
          >
            Skip Intro
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Skip Outro Button */}
      {showSkipOutro && (
        <div className="absolute bottom-24 right-4 z-50">
          <button
            onClick={skipOutro}
            className="px-4 py-2 bg-black/80 text-white rounded-md text-sm font-medium hover:bg-black/90 transition-colors flex items-center gap-2"
          >
            Skip Outro
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Video Controls */}
      <div 
        className={`absolute inset-x-0 bottom-0 transition-all duration-200 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        } ${isMouseMoving ? 'cursor-auto' : 'cursor-none'}`}
        onMouseEnter={() => {
          setShowControls(true);
          if (hideControlsTimer.current) {
            clearTimeout(hideControlsTimer.current);
          }
        }}
      >
        {/* Progress Bar Container */}
        <div className="relative group/progress mt-8">
          {/* Preview Thumbnail */}
          {showPreview && thumbnailsLoaded && (
            <div 
              className="absolute bottom-6 transform -translate-x-1/2 bg-black/90 rounded-lg overflow-hidden shadow-lg z-50"
              style={{ left: `${previewPosition}%` }}
            >
              <div className="w-40 aspect-video relative">
                <img 
                  src={thumbnails}
                  className="w-full h-full object-cover"
                  alt="Preview"
                  draggable="false"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs text-center py-1">
                  {formatPreviewTime(previewTime)}
                </div>
              </div>
            </div>
          )}

          {/* Progress Track */}
          <div 
            className="h-1 relative cursor-pointer group/track"
            onClick={handleSeek}
            onMouseMove={handleTimelineHover}
            onMouseLeave={handleTimelineLeave}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-white/20 rounded-full"></div>
            
            {/* Buffered Progress */}
            <div 
              className="absolute inset-y-0 left-0 bg-white/30 transition-all duration-100 rounded-full"
              style={{ width: `${bufferedProgress}%` }}
            ></div>
            
            {/* Intro Marker */}
            {intro && (
              <div 
                className="absolute inset-y-0 bg-yellow-400/50 pointer-events-none"
                style={{ 
                  left: `${(intro.start / duration) * 100}%`,
                  width: `${((intro.end - intro.start) / duration) * 100}%`
                }}
              />
            )}

            {/* Outro Marker */}
            {outro && (
              <div 
                className="absolute inset-y-0 bg-yellow-400/50 pointer-events-none"
                style={{ 
                  left: `${(outro.start / duration) * 100}%`,
                  width: `${((outro.end - outro.start) / duration) * 100}%`
                }}
              />
            )}
            
            {/* Played Progress */}
            <div 
              className="absolute inset-y-0 left-0 bg-white/80 transition-all duration-100 rounded-full"
              style={{ width: `${progress}%` }}
            />

            {/* Progress Handle */}
            <div 
              className="absolute w-3 h-3 -translate-x-1/2 opacity-0 group-hover/track:opacity-100 transition-opacity duration-200 pointer-events-none"
              style={{ 
                left: `${progress}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-full h-full rounded-full bg-white"></div>
            </div>
          </div>
        </div>
        
        {/* Controls Bar */}
        <div className="px-4 pb-1 pt-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button 
                onClick={handleVideoClick} 
                className="text-white hover:text-white/80 transition-colors p-1.5 hover:bg-white/10 rounded-lg"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Volume and Time Controls */}
              <div className="flex items-center">
                {/* Volume */}
                <div className="relative group/volume">
                  <div className="flex items-center">
                    <button className="text-white hover:text-white/80 transition-colors p-1.5 hover:bg-white/10 rounded-lg">
                      {volume === 0 ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      )}
                    </button>
                    <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-200 flex items-center">
                      <div className="px-2 py-2 flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={handleVolumeChange}
                          style={{
                            background: `linear-gradient(to right, white ${volume * 100}%, rgba(255, 255, 255, 0.2) ${volume * 100}%)`
                          }}
                          className="w-16 h-1 appearance-none rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-[1] hover:[&::-webkit-slider-thumb]:bg-white/90 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 hover:[&::-moz-range-thumb]:bg-white/90 [&::-moz-range-progress]:bg-white [&::-moz-range-track]:bg-white/20 [&::-moz-range-track]:rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="text-white text-sm ml-2">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-white/60 mx-1">/</span>
                  <span className="text-white/60">{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Skip Backward/Forward */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={skipBackward} 
                  className="text-white hover:text-white/80 transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                  title="Rewind 10 seconds"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.5 3C17.15 3 21.08 6.03 22.47 10.22L20.1 11C19.05 7.81 16.04 5.5 12.5 5.5C10.54 5.5 8.77 6.22 7.38 7.38L10 10H3V3L5.6 5.6C7.45 4 9.85 3 12.5 3M10 12V22H8V14H6V12H10M18 14V20C18 21.11 17.11 22 16 22H14C12.9 22 12 21.1 12 20V14C12 12.9 12.9 12 14 12H16C17.11 12 18 12.9 18 14M16 14H14V20H16V14Z" />
                  </svg>
                </button>

                <button 
                  onClick={skipForward} 
                  className="text-white hover:text-white/80 transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                  title="Forward 10 seconds"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.5 3C14.15 3 16.55 4 18.4 5.6L21 3V10H14L16.62 7.38C15.23 6.22 13.46 5.5 11.5 5.5C7.96 5.5 4.95 7.81 3.9 11L1.53 10.22C2.92 6.03 6.85 3 11.5 3M10 12V22H8V14H6V12H10M18 14V20C18 21.11 17.11 22 16 22H14C12.9 22 12 21.1 12 20V14C12 12.9 12.9 12 14 12H16C17.11 12 18 12.9 18 14M16 14H14V20H16V14Z" />
                  </svg>
                </button>
              </div>

              {/* Hide cast and settings buttons on mobile since they're at the top */}
              <div className="hidden md:flex items-center gap-2">
                {/* Settings */}
                <div className="relative group/settings">
                  <button
                    onClick={() => {
                      setShowSettings(!showSettings);
                      if (!showSettings) {
                        setSettingsView('main');
                      }
                      setShowSubtitleOptions(false);
                    }}
                    className={`p-1.5 text-white hover:text-white/80 transition-colors hover:bg-white/10 rounded-lg ${
                      showSettings ? 'bg-white/20' : ''
                    }`}
                  >
                    <svg className={`w-6 h-6 transition-transform duration-300 ${showSettings ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                    </svg>
                  </button>
                  {/* Settings menu content remains the same */}
                  {showSettings && (
                    <div 
                      className="absolute bottom-[48px] right-0 bg-black/90 rounded-lg overflow-hidden"
                      style={{
                        width: '200px',
                        transform: 'translateZ(0)', // Force GPU acceleration
                      }}
                    >
                      {/* Main Settings View */}
                      <div className={`transition-all duration-300 ${
                        settingsView !== 'main' ? 'opacity-0 -translate-x-full absolute' : 'opacity-100'
                      }`}>
                        <div className="p-1.5 text-xs font-medium text-white border-b border-white/10">
                          Settings
                        </div>
                        <div className="p-0.5">
                          {/* Quality Option */}
                          <button
                            onClick={() => setSettingsView('quality')}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-white/10 rounded flex items-center justify-between text-white"
                          >
                            <span>Quality</span>
                            <div className="flex items-center text-white/60">
                              <span>{currentQuality?.name || 'Auto'}</span>
                              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6 1.41-1.41z"/>
                              </svg>
                            </div>
                          </button>

                          {/* Playback Speed Option */}
                          <button
                            onClick={() => setSettingsView('speed')}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-white/10 rounded flex items-center justify-between text-white"
                          >
                            <span>Speed</span>
                            <div className="flex items-center text-white/60">
                              <span>{playbackSpeed}x</span>
                              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                              </svg>
                            </div>
                          </button>

                          {/* Audio Boost Option */}
                          <button
                            onClick={() => setSettingsView('audio')}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-white/10 rounded flex items-center justify-between text-white"
                          >
                            <span>Volume Boost</span>
                            <div className="flex items-center text-white/60">
                              <span>{audioBoost}%</span>
                              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                              </svg>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Quality Settings View */}
                      <div className={`transition-all duration-300 ${
                        settingsView !== 'quality' ? 'opacity-0 translate-x-full absolute' : 'opacity-100'
                      }`}>
                        <div className="p-1.5 text-xs font-medium text-white border-b border-white/10 flex items-center">
                          <button 
                            onClick={() => setSettingsView('main')}
                            className="hover:bg-white/10 rounded p-1 mr-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                            </svg>
                          </button>
                          Quality
                        </div>
                        <div className="p-0.5">
                          <button
                            onClick={() => {
                              changeQuality({ id: -1, name: 'Auto' });
                              setSettingsView('main');
                            }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-white/10 rounded flex items-center justify-between ${
                              currentQuality?.id === -1 ? 'text-white' : 'text-white/60'
                            }`}
                          >
                            <span>Auto {currentQuality?.id !== -1 ? `(${currentQuality?.name})` : ''}</span>
                            {currentQuality?.id === -1 && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            )}
                          </button>
                          {qualities
                            .sort((a, b) => (b.height || 0) - (a.height || 0))
                            .map((quality) => (
                              <button
                                key={quality.id}
                                onClick={() => {
                                  changeQuality(quality);
                                  setSettingsView('main');
                                }}
                                className={`w-full px-3 py-2 text-left text-xs hover:bg-white/10 rounded flex items-center justify-between ${
                                  currentQuality?.id === quality.id ? 'text-white' : 'text-white/60'
                                }`}
                              >
                                <span>{quality.name}</span>
                                {currentQuality?.id === quality.id && (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                  </svg>
                                )}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Picture in Picture */}
              <button 
                onClick={async () => {
                  try {
                    if (document.pictureInPictureElement) {
                      await document.exitPictureInPicture();
                    } else if (document.pictureInPictureEnabled) {
                      await videoRef.current.requestPictureInPicture();
                    }
                  } catch (error) {
                    console.error('PiP error:', error);
                  }
                }}
                className="p-1.5 text-white hover:text-white/80 transition-colors hover:bg-white/10 rounded-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z"/>
                </svg>
              </button>

              {/* Fullscreen */}
              <button 
                onClick={toggleFullscreen} 
                className="p-1.5 text-white hover:text-white/80 transition-colors hover:bg-white/10 rounded-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 