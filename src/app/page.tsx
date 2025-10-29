"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
  Component,
} from "react";
import Image from "next/image";

import { PlayerDetails } from "./components/player-details.tsx";
import { Roster } from "./components/roster.tsx";
import { TeamDropdown } from "./components/team-dropdown.tsx"

import { useMLBData, useMLBTeams } from "./lib/hooks.tsx"
import { ErrorBoundary, debounce, useRenderCounter} from "./lib/util.tsx"
import { LastGame, TodaysGame } from "./components/games.tsx"
import { TeamRecord } from "./components/team-record.tsx"
import { CARDINALS_ID } from "./lib/consts.tsx"




// --- UI Components ---


// ThemeToggle Component
const ThemeToggle = ({ isDarkMode, toggleTheme }) => (
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
const HomePage = () => {
  useRenderCounter("HomePage");
  const { teams, loading: teamsLoading, error: teamsError } = useMLBTeams();
  const [selectedTeamId, setSelectedTeamId] = useState(CARDINALS_ID.toString()); // Default to Cardinals
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const { state, fetchPlayerData, clearPlayerInfo } =
    useMLBData(selectedTeamId);
  const { data, playerInfo, teamRecord, todaysGame, lastGame, loading, error } =
    state;

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (teamsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

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

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gradient-to-b from-red-900 to-gray-100 text-black"} font-sans`}
    >
      <ErrorBoundary>
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
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </div>
        </header>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 py-12">
            {Array(8)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
          </div>
        )}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mx-4 my-4 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {teamRecord && <TeamRecord record={teamRecord} />}
              <TodaysGame game={todaysGame} />
              <LastGame game={lastGame} />
            </div>

            {playerInfo && (
              <PlayerDetails
                playerInfo={playerInfo}
                onClose={clearPlayerInfo}
              />
            )}

            <Roster data={data} onPlayerClick={fetchPlayerData} />
          </main>
        )}

        <footer className="bg-navy-800 dark:bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="mb-4 sm:mb-0">© 2025 MLB Team Dashboard</p>
            <div className="flex gap-6">
              <a
                href="https://nextjs.org/learn"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline text-white"
              >
                <Image
                  aria-hidden
                  src="/file.svg"
                  alt="File icon"
                  width={16}
                  height={16}
                />
                Learn
              </a>
              <a
                href="https://vercel.com/templates?framework=next.js"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline text-white"
              >
                <Image
                  aria-hidden
                  src="/window.svg"
                  alt="Window icon"
                  width={16}
                  height={16}
                />
                Examples
              </a>
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline text-white"
              >
                <Image
                  aria-hidden
                  src="/globe.svg"
                  alt="Globe icon"
                  width={16}
                  height={16}
                />
                Next.js
              </a>
            </div>
          </div>
        </footer>
      </ErrorBoundary>
    </div>
  );
};



export default HomePage;
