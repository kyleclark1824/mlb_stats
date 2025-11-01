"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { CalendarEvent, fetchMonthEvents, createEvent, deleteEvent } from '@/lib/calendar';
import { supabase } from '@/lib/supabase';

// Dynamically import all .jpg files from /public/backgrounds
const bgImages = [
  // List all .jpg files in /public/backgrounds
  "/backgrounds/20151205_175052.jpg",
  "/backgrounds/20160407_204258.jpg",
  "/backgrounds/7.jpg",
  "/backgrounds/bella_new.jpg",
  "/backgrounds/Birds.jpg",
  "/backgrounds/chicken.jpg",
  "/backgrounds/dad_Day1.JPG",
  "/backgrounds/Family_Whiteface.jpg",
  "/backgrounds/Fred2.jpg",
  "/backgrounds/giraffe.jpg",
  "/backgrounds/girls_at_barnham.jpg",
  "/backgrounds/IMG_3029.jpg",
  "/backgrounds/IMG_3877.JPG",
  "/backgrounds/IMG_5899 (2).jpg",
  "/backgrounds/IMG_6007 (2).jpg",
  "/backgrounds/IMG_6819.jpg",
  "/backgrounds/IMG_7306.jpg",
  "/backgrounds/IMG_7382.jpg",
  "/backgrounds/IMG_8531.jpg",
  "/backgrounds/IMG_8636.jpg",
  "/backgrounds/kace1.jpg",
  "/backgrounds/kace_bubbles.jpg",
  "/backgrounds/kids.jpg",
  "/backgrounds/KRM_married.jpg",
  "/backgrounds/M&R.jpg",
  "/backgrounds/moon.jpg",
  "/backgrounds/panarama_2.jpg",
  "/backgrounds/Preg.jpg",
  "/backgrounds/preg1.jpg",
  "/backgrounds/preg3.jpg",
  "/backgrounds/RaulPainted.jpg",
  "/backgrounds/summer 2010 030.jpg",
  "/backgrounds/sunset2.jpg",
  "/backgrounds/sunset_final_2.jpg",
  "/backgrounds/Tybee1.jpg",
  "/backgrounds/uphill.jpg",
  "/backgrounds/wall1 (2).jpg",
  "/backgrounds/wall3 (2).jpg",
  "/backgrounds/wall4 (2).jpg"
];
function getRandomizedImages(images: string[]) {
  const arr = [...images];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Calendar() {

  const [user, setUser] = useState<unknown>(null);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const router = useRouter();
  const [viewEvent, setViewEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  // Helper to round to nearest half hour
  function getRoundedHalfHour(date = new Date()) {
    const d = new Date(date);
    d.setSeconds(0, 0);
    const minutes = d.getMinutes();
    if (minutes < 15) {
      d.setMinutes(0);
    } else if (minutes < 45) {
      d.setMinutes(30);
    } else {
      d.setMinutes(0);
      d.setHours(d.getHours() + 1);
    }
    return d;
  }

    // Check user authentication and whitelist
  useEffect(() => {
    const EMAIL_WHITELIST = [
      'kyle.clark1824@gmail.com',
      'maria.clark5550@gmail.com',
    ];
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      if (data?.user?.email && EMAIL_WHITELIST.includes(data.user.email)) {
        setIsWhitelisted(true);
      } else {
        setIsWhitelisted(false);
      }
      setAuthChecked(true);
    };
    checkUser();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [currentDate]);
  
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(getRoundedHalfHour());
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(getRoundedHalfHour(new Date(Date.now() + 60 * 60 * 1000)));

  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    startDate: new Date(),
    endDate: new Date(),
    description: '',
    isAllDay: false,
    location: ''
  });
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Client-only random background image selection to avoid hydration mismatch
  const [bgIndex, setBgIndex] = useState<number | null>(null);
  const [randomImages, setRandomImages] = useState<string[]>(bgImages);
  useEffect(() => {
    // Only run on client
    // Shuffle images and start with a random index
    const randomized = getRandomizedImages(bgImages);
    setRandomImages(randomized);
    setBgIndex(Math.floor(Math.random() * randomized.length));
    const interval = setInterval(() => {
      setBgIndex(prev => {
        if (prev === null) return Math.floor(Math.random() * randomized.length);
        // Pick a random image each time
        let next = Math.floor(Math.random() * randomized.length);
        // Avoid repeating the same image
        if (next === prev) next = (next + 1) % randomized.length;
        return next;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [currentDate]);
  useEffect(() => {
    if (bgIndex === 0) {
      setRandomImages(getRandomizedImages(bgImages));
    }
  }, [bgIndex, currentDate]);

  // Load events from database on mount and when month changes
  useEffect(() => {
    const loadEvents = async () => {
      const monthEvents = await fetchMonthEvents(currentDate);
      setEvents(monthEvents);
    };
    loadEvents();
  }, [currentDate]);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();

  const addEvent = async () => {
    if (!isWhitelisted) {
      alert('You are not authorized to create events.');
      return;
    }
    if (!selectedStartDate || !selectedEndDate || !newEvent.title) return;

    const eventData = {
      ...newEvent,
      startDate: selectedStartDate,
      endDate: selectedEndDate,
    };
    console.log('Creating event with data:', {
      ...eventData,
      startDateISO: selectedStartDate?.toISOString(),
      endDateISO: selectedEndDate?.toISOString(),
    });

    const createdEvent = await createEvent(eventData);
    if (createdEvent) {
      setEvents(prev => [...prev, createdEvent]);
      setShowEventModal(false);
      setNewEvent({
        title: '',
        startDate: new Date(),
        endDate: null,
        description: '',
        isAllDay: false,
        location: ''
      });
    }
  };

  const removeEvent = async (id: string) => {
    const success = await deleteEvent(id);
    if (success) {
      setEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  const openNewEventModal = (date: Date) => {
    // Use rounded half hour for start, 1 hour after for end
    const start = getRoundedHalfHour(date);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setSelectedStartDate(start);
    setSelectedEndDate(end);
    setNewEvent(prev => ({
      ...prev,
      startDate: start,
      endDate: end
    }));
    setShowEventModal(true);
  };

  // Returns events that occur on a given date (including multi-day events)
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const start = new Date(event.startDate);
      const end = event.endDate ? new Date(event.endDate) : start;
      // Check if the date is within the event's range (inclusive)
      return (
        date >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
        date <= new Date(end.getFullYear(), end.getMonth(), end.getDate())
      );
    });
  };

  return (
  <div className="min-h-screen w-full relative bg-gray-100 dark:bg-gray-900">
    {bgIndex !== null && (
      <Image src={randomImages[bgIndex]} alt="Calendar BG" fill priority className="absolute inset-0 w-full h-full object-cover opacity-30 z-0 transition-all duration-1000" />
    )}
    <div className="absolute top-6 left-6 z-10">
      <button
        className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out cursor-pointer"
        onClick={() => router.push('/')}
      >
        Back to Home
      </button>
    </div>
    <div className="relative z-10 container mx-auto px-4 py-8">
      <div className="flex justify-end mb-4">
        {authChecked && isWhitelisted && (
          <a href="/gallery" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2">Gallery</a>
        )}
        {authChecked && !user && (
          <a href="/auth" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Sign In</a>
        )}
      </div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-row w-full items-center justify-between">
          <div className="flex items-center mb-2 space-x-2">
            <button
              className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-blue-500 hover:text-white transition"
              aria-label="Previous Month"
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            >
              &#8592;
            </button>
            <h1 className="text-4xl font-bold">Family Calendar</h1>
            <button
              className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-blue-500 hover:text-white transition"
              aria-label="Next Month"
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            >
              &#8594;
            </button>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-8">
            <button
              className={`px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-blue-500 hover:text-white'}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-blue-500 hover:text-white'}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-blue-500 hover:text-white'}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
          </div>
        </div>
      </div>
      {/* Only show calendar if user is logged in and whitelisted */}
      {authChecked && isWhitelisted ? (
        <>
          {/* Month View */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-2">
              {/* Weekday headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center font-semibold">
                  {day}
                </div>
              ))}
              {/* Pad empty cells before the first day of the month */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`pad-${i}`} className="min-h-[100px] p-2" />
              ))}
              {daysInMonth.map(day => {
                const dayEvents = getEventsForDate(day);
                return (
                  <div
                    key={day.toISOString()}
                    className="min-h-[100px] p-2 border border-gray-700 dark:border-gray-900 bg-gray-800/80 dark:bg-gray-900/80 hover:bg-gray-700 dark:hover:bg-gray-800 text-white rounded-lg cursor-pointer transition"
                    onClick={e => {
                      if (e.target === e.currentTarget) {
                        openNewEventModal(day);
                      }
                    }}
                  >
                    <div className="font-semibold mb-1 text-white">{format(day, 'd')}</div>
                    <div className="space-y-1">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className="text-sm p-1 rounded bg-blue-900/80 dark:bg-blue-800 flex justify-between items-center cursor-pointer text-white hover:bg-blue-600 dark:hover:bg-blue-600"
                          onClick={e => {
                            e.stopPropagation();
                            setViewEvent(event);
                          }}
                        >
                          <span className="flex-1">
                            {format(event.startDate, 'h:mm a')} - {format(event.endDate ?? event.startDate, 'h:mm a')} {event.title}
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              removeEvent(event.id);
                            }}
                            className="ml-2 px-2 py-1 text-xs bg-red-700 text-white rounded hover:bg-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* Week View */}
          {viewMode === 'week' && (
            <div className="grid grid-cols-7 gap-2">
              {/* Weekday headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center font-semibold">
                  {day}
                </div>
              ))}
              {/* Show days for the current week */}
              {(() => {
                const weekStart = new Date(currentDate);
                weekStart.setDate(currentDate.getDate() - currentDate.getDay());
                return Array.from({ length: 7 }).map((_, i) => {
                  const day = new Date(weekStart);
                  day.setDate(weekStart.getDate() + i);
                  const dayEvents = getEventsForDate(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className="min-h-[180px] h-auto p-2 pb-8 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={e => {
                        if (e.target === e.currentTarget) {
                          openNewEventModal(day);
                        }
                      }}
                    >
                      <div className="font-semibold mb-1">{format(day, 'd')}</div>
                      <div className="space-y-1">
                        {dayEvents.map(event => (
                          <div
                            key={event.id}
                            className="text-sm p-1 rounded bg-blue-900/80 dark:bg-blue-800 flex justify-between items-center cursor-pointer"
                            onClick={e => {
                              e.stopPropagation();
                              setViewEvent(event);
                            }}
                          >
                            <span className="flex-1">
                              {format(event.startDate, 'h:mm a')} - {format(event.endDate ?? event.startDate, 'h:mm a')} {event.title}
                            </span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                removeEvent(event.id);
                              }}
                              className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              aria-label="Delete Event"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
          {/* Day View */}
          {viewMode === 'day' && (
            <div className="grid grid-cols-1 gap-2">
              <div className="p-2 text-center font-semibold">
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="min-h-[180px] h-auto p-2 pb-8 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={e => {
                  if (e.target === e.currentTarget) {
                    openNewEventModal(currentDate);
                  }
                }}
              >
                <div className="space-y-1">
                  {getEventsForDate(currentDate).map(event => (
                    <div
                      key={event.id}
                      className="text-sm p-1 rounded bg-blue-100 dark:bg-blue-900 flex justify-between items-center cursor-pointer hover:bg-blue-300 dark:hover:bg-blue-700"
                      onClick={e => {
                        e.stopPropagation();
                        setViewEvent(event);
                      }}
                    >
                      <span className="flex-1">
                        {format(event.startDate, 'h:mm a')} - {format(event.endDate ?? event.startDate, 'h:mm a')} {event.title}
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          removeEvent(event.id);
                        }}
                        className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        aria-label="Delete Event"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* New Event Modal */}
          {showEventModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-4xl relative overflow-visible">
                {bgIndex !== null && (
                  <Image src={randomImages[bgIndex]} alt="Event BG" fill priority className="absolute inset-0 w-full h-full object-cover opacity-20 z-0 transition-all duration-1000" />
                )}
                <div className="relative z-10">
                  <h2 className="text-xl font-bold mb-4">
                    Add Event for {selectedStartDate ? format(selectedStartDate, 'MMMM d, yyyy') : ''}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Event Title</label>
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                        className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${!newEvent.title ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="w-full">
                        <label className="block text-sm mb-1">Start Date & Time</label>
                        <DatePicker
                          selected={selectedStartDate ?? new Date()}
                          onChange={date => {
                            if (date) {
                              setSelectedStartDate(date);
                              setNewEvent(prev => ({ ...prev, startDate: date }));
                            }
                          }}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          className="px-3 py-2 border rounded w-full min-w-[400px] dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="w-full">
                        <label className="block text-sm mb-1">End Date & Time</label>
                        <DatePicker
                          selected={selectedEndDate ?? new Date()}
                          onChange={date => {
                            if (date) {
                              setSelectedEndDate(date);
                              setNewEvent(prev => ({ ...prev, endDate: date }));
                            }
                          }}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          className="px-3 py-2 border rounded w-full min-w-[400px] dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Location (Optional)</label>
                      <input
                        type="text"
                        value={newEvent.location || ''}
                        onChange={e => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                      <textarea
                        value={newEvent.description}
                        onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowEventModal(false)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addEvent}
                        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${!newEvent.title ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!newEvent.title}
                      >
                        Add Event
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* View Event Modal */}
          {viewEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-xl">
                <h2 className="text-xl font-bold mb-4">Event Details</h2>
                <div className="mb-2"><span className="font-semibold">Title:</span> {viewEvent.title}</div>
                <div className="mb-2"><span className="font-semibold">Date:</span> {viewEvent.startDate ? format(viewEvent.startDate, 'MMMM d, yyyy') : ''}</div>
                <div className="mb-2"><span className="font-semibold">Time:</span> {viewEvent.startDate ? format(viewEvent.startDate, 'h:mm a') : ''} - {viewEvent.endDate ? format(viewEvent.endDate, 'h:mm a') : ''}</div>
                {viewEvent.location && <div className="mb-2"><span className="font-semibold">Location:</span> {viewEvent.location}</div>}
                {viewEvent.description && <div className="mb-2"><span className="font-semibold">Description:</span> {viewEvent.description}</div>}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setViewEvent(null)}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-900"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : authChecked ? (
        <div className="text-center text-xl text-red-600 mt-12">Only familia can see the secret squirrel stuff! (login to prove it)</div>
      ) : (
        <div className="text-center text-xl text-gray-600 mt-12">Checking authentication...</div>
      )}
    </div>
  </div>
  );
}