import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        players: true
      }
    });
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Error fetching teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const team = await prisma.team.create({
      data: {
        id: data.id,
        name: data.name,
        abbreviation: data.abbreviation,
        teamCode: data.teamCode,
        locationName: data.locationName,
        division: data.division,
        league: data.league,
        venue: data.venue
      }
    });
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Error creating team' },
      { status: 500 }
    );
  }
}