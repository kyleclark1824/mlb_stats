"use client";

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: string;
  type: 'MLB' | 'NBA' | 'NFL' | 'NHL' | 'Other';
  description?: string;
}

export default function Page() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: '',
    type: 'MLB',
    description: ''
  });

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const addEvent = () => {
    if (!selectedDate || !newEvent.title) return;

    const event: Event = {
      id: Date.now().toString(),
      ...newEvent,
      date: format(selectedDate, 'yyyy-MM-dd')
    };

    setEvents(prev => [...prev, event]);
    setShowEventModal(false);
    setNewEvent({ title: '', date: '', type: 'MLB', description: '' });
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const openNewEventModal = (date: Date) => {
    setSelectedDate(date);
    setShowEventModal(true);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => event.date === format(date, 'yyyy-MM-dd'));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          <div className="space-x-2">
            <button
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-semibold">
              {day}
            </div>
          ))}
          {daysInMonth.map(day => {
            const dayEvents = getEventsForDate(day);
            return (
              <div
                key={day.toISOString()}
                onClick={() => openNewEventModal(day)}
                className="min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <div className="font-semibold mb-1">{format(day, 'd')}</div>
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="text-sm p-1 rounded bg-blue-100 dark:bg-blue-900 flex justify-between items-center"
                    >
                      <span>{event.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEvent(event.id);
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Add Event for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <select
                  value={newEvent.type}
                  onChange={e => setNewEvent(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="MLB">MLB</option>
                  <option value="NBA">NBA</option>
                  <option value="NFL">NFL</option>
                  <option value="NHL">NHL</option>
                  <option value="Other">Other</option>
                </select>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}