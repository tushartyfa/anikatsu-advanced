'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchSchedule } from '@/lib/api';

export default function AnimeCalendar() {
  const [selectedDay, setSelectedDay] = useState(getCurrentDayIndex());
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add custom scrollbar styles
  useEffect(() => {
    // Add custom styles for the calendar scrollbar
    const style = document.createElement('style');
    style.textContent = `
      .schedule-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .schedule-scrollbar::-webkit-scrollbar-track {
        background: var(--card);
      }
      .schedule-scrollbar::-webkit-scrollbar-thumb {
        background-color: var(--border);
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup function
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Get current day index (0-6, Sunday is 0)
  function getCurrentDayIndex() {
    const dayIndex = new Date().getDay();
    return dayIndex; // Sunday is 0, Monday is 1, etc.
  }
  
  // Get current date info for the header
  const getCurrentDateInfo = () => {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Calculate the date for the selected day
    const currentDayIndex = today.getDay();
    let daysDiff = selectedDay - currentDayIndex;
    
    // Always get the previous occurrence (or today if it's the current day)
    if (daysDiff > 0) {
      daysDiff -= 7; // Go back to previous week
    }
    
    const selectedDate = new Date(today);
    selectedDate.setDate(today.getDate() + daysDiff);
    
    return {
      day: dayNames[selectedDay],
      date: selectedDate.getDate(),
      month: monthNames[selectedDate.getMonth()]
    };
  };
  
  const dateInfo = getCurrentDateInfo();
  
  // Generate week days for the calendar
  const days = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 0 },
  ];
  
  useEffect(() => {
    async function loadScheduleData() {
      setIsLoading(true);
      try {
        // Get the date for the selected day
        const today = new Date();
        const currentDayIndex = today.getDay();
        let daysDiff = selectedDay - currentDayIndex;
        
        if (daysDiff > 0) {
          daysDiff -= 7;
        }
        
        const selectedDate = new Date(today);
        selectedDate.setDate(today.getDate() + daysDiff);
        
        // Format date as YYYY-MM-DD
        const formattedDate = selectedDate.toISOString().split('T')[0];
        
        // Fetch schedule data for the selected date
        const data = await fetchSchedule(formattedDate);
        
        if (data && data.scheduledAnimes) {
          // Process and sort the scheduled animes by time
          const processedData = data.scheduledAnimes
            .map(anime => ({
              id: anime.id,
              title: anime.name,
              japaneseTitle: anime.jname,
              time: anime.time,
              airingTimestamp: anime.airingTimestamp,
              secondsUntilAiring: anime.secondsUntilAiring
            }))
            .sort((a, b) => {
              // Convert time strings to comparable values (assuming 24-hour format)
              const timeA = a.time.split(':').map(Number);
              const timeB = b.time.split(':').map(Number);
              return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
            });
          
          setScheduleData(processedData);
        } else {
          setScheduleData([]);
        }
      } catch (error) {
        console.error('Error loading schedule data:', error);
        setScheduleData([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadScheduleData();
  }, [selectedDay]);
  
  return (
    <div className="mb-10 bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Release Calendar</h2>
          <div className="text-sm text-[var(--text-muted)]">
            {dateInfo.month} {dateInfo.date}
          </div>
        </div>
        
        {/* Day selector */}
        <div className="flex justify-between">
          {days.map((day) => (
            <button
              key={day.value}
              onClick={() => setSelectedDay(day.value)}
              className={`
                flex-1 py-2 text-sm font-medium rounded-md transition-colors
                ${selectedDay === day.value 
                  ? 'bg-white text-[var(--background)]' 
                  : 'text-[var(--text-muted)] hover:text-white'
                }
              `}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Schedule list */}
      <div className="min-h-[375px] max-h-[490px] overflow-y-auto schedule-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-[375px]">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
          </div>
        ) : scheduleData.length > 0 ? (
          <div className="pt-3.5 space-y-2">
            {scheduleData.map((anime) => (
              <Link 
                href={`/anime/${anime.id}`} 
                key={anime.id}
                className="block px-3.5 py-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Time */}
                  <div className="w-16 text-sm font-medium text-[var(--text-muted)]">
                    {anime.time}
                  </div>
                  
                  {/* Anime info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white line-clamp-1">
                      {anime.title}
                    </h3>
                    {anime.japaneseTitle && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                        {anime.japaneseTitle}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[375px] text-[var(--text-muted)] text-sm">
            No releases scheduled
          </div>
        )}
      </div>
    </div>
  );
} 