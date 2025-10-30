import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all events or filter by date range
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where = startDate && endDate ? {
      AND: [
        { startDate: { gte: new Date(startDate) } },
        { startDate: { lte: new Date(endDate) } }
      ]
    } : {};

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: {
        startDate: 'asc'
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Error fetching events' },
      { status: 500 }
    );
  }
}

// Create new event
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const event = await prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        gameId: data.gameId,
        teamId: data.teamId,
        eventType: data.eventType,
        location: data.location,
        isAllDay: data.isAllDay
      }
    });
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Error creating event' },
      { status: 500 }
    );
  }
}