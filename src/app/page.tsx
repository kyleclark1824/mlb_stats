"use client";

import React, { useState } from "react";
import Image from "next/image";

import { PlayerDetails } from "./components/player-details";
import { Roster } from "./components/roster";
import { TeamDropdown } from "./components/team-dropdown";
import { useMLBData, useMLBTeams } from "./lib/hooks";
import { ErrorBoundary, useRenderCounter } from "./lib/util";
import { TeamRecordData, Game, Player, Team } from "./lib/types";
import { LastGame, TodaysGame } from "./components/games";
import { TeamRecord } from "./components/team-record";
import { CARDINALS_ID } from "./lib/consts";

// --- TeamLogo Component ---
interface TeamLogoProps {
  teamId: string;
  teams: Team[];
}

const TeamLogo: React.FC<TeamLogoProps> = ({ teamId, teams }) => {
  const team = teams.find(t => t.id.toString() === teamId);
  const teamName = team?.name || 'MLB';
  
  return (
    <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full overflow-hidden">
      <Image
        src={`https://www.mlbstatic.com/team-logos/${teamId}.svg`}
        alt={`${teamName} logo`}
        width={40}
        height={40}
        className="object-contain"
      />
    </div>
  );
};

// --- Main Component ---
const HomePage: React.FC = () => {
  useRenderCounter();

  const { teams, loading: teamsLoading, error: teamsError } = useMLBTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    CARDINALS_ID.toString()
  );

  const { state, fetchPlayerData, clearPlayerInfo } =
    useMLBData(selectedTeamId);
  const { data, playerInfo, teamRecord, todaysGame, lastGame, loading, error } =
    state;

  // --- Loading state ---
  if (teamsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500" />
      </div>
    );
  }

  // --- Error state ---
  if (teamsError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-900 border-l-4 border-red-500 text-red-300 p-4 rounded">
          <p className="font-bold">Error</p>
          <p>{teamsError}</p>
        </div>
      </div>
    );
  }

  // --- Main Layout ---
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <ErrorBoundary>
        {/* HEADER */}
        <header className="bg-gray-800 text-white py-8 text-center">
          <Image
            src="/mlb-logo.png"
            alt="MLB Logo"
            width={150}
            height={90}
            priority
            className="mx-auto"
          />
          <h1 className="text-4xl font-bold mt-4">MLB Team Dashboard</h1>

          <div className="mt-4 flex justify-center items-center space-x-4">
            <TeamDropdown
              teams={teams}
              selectedTeamId={selectedTeamId}
              onSelectTeam={setSelectedTeamId}
            />
            <TeamLogo
              teamId={selectedTeamId}
              teams={teams}
            />
          </div>
        </header>

        {/* MAIN */}
        <main className="container mx-auto py-8 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                {playerInfo && (
                <PlayerDetails
                  playerInfo={playerInfo}
                  onClose={clearPlayerInfo}
                />
              )}
              {!!teamRecord && <TeamRecord record={teamRecord as TeamRecordData} />}
              {!!todaysGame && <TodaysGame game={todaysGame as Game} />}
              {!!lastGame && <LastGame game={lastGame as Game} />}
            </div>

            <div className="lg:col-span-2">
              <div className="mb-6">
                {loading ? (
                  <div className="animate-pulse">Loading team data...</div>
                ) : error ? (
                  <div className="text-red-600">Error: {error}</div>
                ) : (
                  <Roster data={(data || []) as Player[]} onPlayerClick={fetchPlayerData} />
                )}
              </div>

            
            </div>
          </div>
        </main>
      </ErrorBoundary>
    </div>
  );
};

export default HomePage;
