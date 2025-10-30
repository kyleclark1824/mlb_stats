"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { CalendarEvent, fetchMonthEvents, createEvent, deleteEvent } from '@/lib/calendar';

const bgImages = [
  "/IMG_3877.JPG",
  "/Family_Whiteface.jpg",
  "/panarama_2.jpg",
  "/sunset_final_2.jpg",
  "/20160407_204258.jpg",
  "/bella_new.jpg",
  "/Birds.jpg",
  "/IMG_8636.jpg",
  "/chicken.jpg",
  "/20151205_175052.jpg"
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

  const [bgIndex, setBgIndex] = useState(0);
  const [randomImages, setRandomImages] = useState<string[]>(getRandomizedImages(bgImages));
  useEffect(() => {
    setRandomImages(getRandomizedImages(bgImages));
    setBgIndex(0);
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % randomImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [randomImages.length]);
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
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();

  const addEvent = async () => {
    console.log('Add Event button clicked');
  if (!selectedStartDate || !selectedEndDate || !newEvent.title) return;

    // Use selectedStartDate and selectedEndDate directly from react-datepicker
    const eventData = {
      ...newEvent,
      startDate: selectedStartDate,
      endDate: selectedEndDate,
    };
    // Debug log: show event data before sending to Supabase
    console.log('Creating event with data:', eventData);

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
      <Image src={randomImages[bgIndex]} alt="Calendar BG" fill priority className="absolute inset-0 w-full h-full object-cover opacity-30 z-0 transition-all duration-1000" />
      <div className="absolute top-6 left-6 z-10">
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          onClick={() => window.location.href = '/'}
        >
          Back to Home
        </button>
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <a href="/auth" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Sign Up / Sign In</a>
        </div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Family Calendar</h1>
        </div>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (viewMode === 'month') setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
                  if (viewMode === 'week') setCurrentDate(prev => {
                    const d = new Date(prev);
                    d.setDate(d.getDate() - 7);
                    return d;
                  });
                  if (viewMode === 'day') setCurrentDate(prev => {
                    const d = new Date(prev);
                    d.setDate(d.getDate() - 1);
                    return d;
                  });
                }}
                className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600"
                aria-label="Previous"
              >&#8592;</button>
              <h1 className="text-2xl font-bold">
                {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                {viewMode === 'week' && `Week of ${format(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay()), 'MMM d, yyyy')}`}
                {viewMode === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h1>
              <button
                onClick={() => {
                  if (viewMode === 'month') setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                  if (viewMode === 'week') setCurrentDate(prev => {
                    const d = new Date(prev);
                    d.setDate(d.getDate() + 7);
                    return d;
                  });
                  if (viewMode === 'day') setCurrentDate(prev => {
                    const d = new Date(prev);
                    d.setDate(d.getDate() + 1);
                    return d;
                  });
                }}
                className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600"
                aria-label="Next"
              >&#8594;</button>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}
              >Month</button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}
              >Week</button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}
              >Day</button>
            </div>
          </div>
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
                            // Type guard for CalendarEvent with fallback for snake_case keys
                            const getDateField = (obj: CalendarEvent, camel: keyof CalendarEvent, snake: string, fallback: Date): Date => {
                              if (obj[camel]) return new Date(obj[camel] as Date);
                              // @ts-expect-error: fallback for snake_case
                              if (obj[snake]) return new Date(obj[snake]);
                              return fallback;
                            };
                            const getEndDateField = (obj: CalendarEvent, camel: keyof CalendarEvent, snake: string): Date | null => {
                              if (obj[camel]) return new Date(obj[camel] as Date);
                              // @ts-expect-error: fallback for snake_case
                              if (obj[snake]) return new Date(obj[snake]);
                              return null;
                            };
                            setViewEvent({
                              ...event,
                              startDate: getDateField(event, 'startDate', 'start_date', new Date()),
                              endDate: getEndDateField(event, 'endDate', 'end_date'),
                              createdAt: getDateField(event, 'createdAt', 'created_at', new Date()),
                              updatedAt: getDateField(event, 'updatedAt', 'updated_at', new Date()),
                            });
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
        </div>

        {/* New Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-4xl relative overflow-visible">
              <Image src={randomImages[bgIndex]} alt="Event BG" fill priority className="absolute inset-0 w-full h-full object-cover opacity-20 z-0 transition-all duration-1000" />
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
      </div>
    </div>
  );
}