"use client";

import React, { useState, useEffect } from "react";
import { PlayerDetails } from "@/components/player-details";
import { Roster } from "@/components/roster";
import { TeamDropdown } from "@/components/team-dropdown";
import { useMLBData, useMLBTeams } from "@/lib/hooks";
import { ErrorBoundary, useRenderCounter } from "@/lib/util";
import { TeamRecordData, Game, Player } from "@/lib/types";
import { LastGame, TodaysGame } from "@/components/games";
import { TeamRecord } from "@/components/team-record";
import { CARDINALS_ID } from "@/lib/consts";

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
  "/20151205_175052.jpg",
];
function getRandomizedImages(images: string[]) {
  const arr = [...images];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Page() {
  useRenderCounter();
  const { teams, loading: teamsLoading, error: teamsError } = useMLBTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    CARDINALS_ID.toString()
  );
  const { state, fetchPlayerData, clearPlayerInfo } = useMLBData(selectedTeamId);
  const { data, teamRecord, todaysGame, lastGame, loading, error, playerInfo } = state;

  const [bgIndex, setBgIndex] = useState(0);
  const [randomImages, setRandomImages] = useState<string[]>(getRandomizedImages(bgImages));
  useEffect(() => {
    setRandomImages(getRandomizedImages(bgImages));
    setBgIndex(0);
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % randomImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (bgIndex === 0) {
      setRandomImages(getRandomizedImages(bgImages));
    }
  }, [bgIndex]);

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  if (teamsLoading || loading) {
    return <div>Loading...</div>;
  }

  if (teamsError || error) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="min-h-screen w-full relative bg-gray-100 dark:bg-gray-900">
      <img
        src={randomImages[bgIndex]}
        alt="MLB BG"
        className="absolute inset-0 w-full h-full object-cover opacity-30 z-0 transition-all duration-1000"
      />
      <div className="absolute top-6 left-6 z-10">
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          onClick={() => { window.location.href = '/'; }}
        >
          Back to Home
        </button>
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <ErrorBoundary>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold">MLB Dashboard</h1>
              <div className="flex gap-2">
                <TeamDropdown
                  teams={teams}
                  selectedTeamId={selectedTeamId}
                  onSelectTeam={handleTeamChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4 md:col-span-1">
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

              <div className="space-y-4 md:col-span-1">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Team Roster</h2>
                  {data ? (
                    <Roster data={(data || []) as Player[]} onPlayerClick={fetchPlayerData} />
                  ) : (
                    <div>No roster data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}