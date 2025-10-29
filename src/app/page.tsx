"use client";

import React, { useState } from "react";
import Image from "next/image";

import { PlayerDetails } from "./components/player-details";
import { Roster } from "./components/roster";
import { TeamDropdown } from "./components/team-dropdown";
import { useMLBData, useMLBTeams } from "./lib/hooks";
import { ErrorBoundary, useRenderCounter } from "./lib/util";
import { TeamRecordData, Game, Player } from "./lib/types";
import { LastGame, TodaysGame } from "./components/games";
import { TeamRecord } from "./components/team-record";
import { CARDINALS_ID } from "./lib/consts";

// --- ThemeToggle Component ---
interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  isDarkMode,
  toggleTheme,
}) => (
  <button
    onClick={toggleTheme}
    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
    aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
  >
    <Image
      src={isDarkMode ? "/sun.svg" : "/moon.svg"}
      alt={isDarkMode ? "Light mode icon" : "Dark mode icon"}
      width={20}
      height={20}
    />
  </button>
);

// --- Main Component ---
const HomePage: React.FC = () => {
  useRenderCounter();

  const { teams, loading: teamsLoading, error: teamsError } = useMLBTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    CARDINALS_ID.toString()
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const { state, fetchPlayerData, clearPlayerInfo } =
    useMLBData(selectedTeamId);
  const { data, playerInfo, teamRecord, todaysGame, lastGame, loading, error } =
    state;

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

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
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-b from-red-900 to-gray-100 text-black"
      } font-sans`}
    >
      <ErrorBoundary>
        {/* HEADER */}
        <header className="bg-red-700 dark:bg-gray-800 text-white py-8 text-center">
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
            <ThemeToggle
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          </div>
        </header>

        {/* MAIN */}
        <main className="container mx-auto py-8 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
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

              {playerInfo && (
                <PlayerDetails
                  playerInfo={playerInfo}
                  onClose={clearPlayerInfo}
                />
              )}
            </div>
          </div>
        </main>
      </ErrorBoundary>
    </div>
  );
};

export default HomePage;
