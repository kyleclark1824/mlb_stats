"use client";

import React, { useState } from "react";
import { PlayerDetails } from "@/components/player-details";
import { Roster } from "@/components/roster";
import { TeamDropdown } from "@/components/team-dropdown";
import { useMLBData, useMLBTeams } from "@/lib/hooks";
import { ErrorBoundary, useRenderCounter } from "@/lib/util";
import { TeamRecordData, Game, Player } from "@/lib/types";
import { LastGame, TodaysGame } from "@/components/games";
import { TeamRecord } from "@/components/team-record";
import { CARDINALS_ID } from "@/lib/consts";

export default function Page() {
  useRenderCounter();

  const { teams, loading: teamsLoading, error: teamsError } = useMLBTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    CARDINALS_ID.toString()
  );

  const { state, fetchPlayerData, clearPlayerInfo } = useMLBData(selectedTeamId);
  const { data, teamRecord, todaysGame, lastGame, loading, error, playerInfo } = state;

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
    <div className="container mx-auto px-4 py-8">
      <ErrorBoundary>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">MLB Dashboard</h1>
            <TeamDropdown
              teams={teams}
              selectedTeamId={selectedTeamId}
              onSelectTeam={handleTeamChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
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

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Team Roster</h2>
                {data ? (
                  <div className="overflow-y-auto max-h-[600px]">
                    <Roster data={(data || []) as Player[]} onPlayerClick={fetchPlayerData} />
                  </div>
                ) : (
                  <div>No roster data available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}