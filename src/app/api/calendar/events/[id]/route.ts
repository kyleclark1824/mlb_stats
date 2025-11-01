/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET specific event
export async function GET(
  request: Request,
  context: any
) {
  const { params } = context;
  try {
    const event = await prisma.calendarEvent.findUnique({
      where: {
        id: params.id
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Error fetching event' },
      { status: 500 }
    );
  }
}

// Update event
export async function PUT(
  request: Request,
  params: any
) {
  try {
    const data = await request.json();
    const event = await prisma.calendarEvent.update({
      where: {
        id: params.id
      },
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
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Error updating event' },
      { status: 500 }
    );
  }
}

// Delete event
export async function DELETE(
  request: Request,
  params: any
) {
  try {
    await prisma.calendarEvent.delete({
      where: {
        id: params.id
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Error deleting event' },
      { status: 500 }
    );
  }
}