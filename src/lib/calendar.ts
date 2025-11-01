/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { format } from 'date-fns';
import { supabase } from './supabase';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date | null;
  gameId?: string | null;
  teamId?: string | null;
  location?: string | null;
  isAllDay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCalendarEvent = Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCalendarEvent = Partial<CreateCalendarEvent>;

// Fetch events for a specific month
export async function fetchMonthEvents(date: Date): Promise<CalendarEvent[]> {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

  // Fetch events that overlap the month: end_date >= startOfMonth AND start_date <= endOfMonth
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('end_date', startOfMonth)
    .lte('start_date', endOfMonth)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data.map((event: any) => ({
    ...event,
    startDate: new Date(event.start_date),
    endDate: event.end_date ? new Date(event.end_date) : null,
    createdAt: new Date(event.created_at),
    updatedAt: new Date(event.updated_at),
  }));
}

// Create a new event
export async function createEvent(event: CreateCalendarEvent): Promise<CalendarEvent | null> {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert([{
      title: event.title,
      description: event.description,
      start_date: event.startDate.toISOString(),
      end_date: event.endDate?.toISOString() || null,
      location: event.location || null,
      is_all_day: event.isAllDay || false,
      event_type: 'family',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    return null;
  }

  return {
    ...data,
    startDate: new Date(data.start_date),
    endDate: data.end_date ? new Date(data.end_date) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Update an existing event
export async function updateEvent(id: string, event: UpdateCalendarEvent): Promise<CalendarEvent | null> {
  const { data, error } = await supabase
    .from('calendar_events')
    .update({
      title: event.title,
      description: event.description,
      start_date: event.startDate?.toISOString(),
      end_date: event.endDate?.toISOString(),
      location: event.location || null,
      is_all_day: event.isAllDay || false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    return null;
  }

  return {
    ...data,
    startDate: new Date(data.start_date),
    endDate: data.end_date ? new Date(data.end_date) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Delete an event
export async function deleteEvent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    return false;
  }

  return true;
}