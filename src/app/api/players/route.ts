import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      include: {
        team: true,
        stats: true
      }
    });
    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Error fetching players' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const player = await prisma.player.create({
      data: {
        id: data.id,
        fullName: data.fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        primaryNumber: data.primaryNumber,
        currentAge: data.currentAge,
        birthDate: data.birthDate,
        birthCity: data.birthCity,
        birthCountry: data.birthCountry,
        height: data.height,
        weight: data.weight,
        active: data.active,
        primaryPosition: data.primaryPosition,
        batSide: data.batSide,
        pitchHand: data.pitchHand,
        teamId: data.teamId
      }
    });
    return NextResponse.json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Error creating player' },
      { status: 500 }
    );
  }
}