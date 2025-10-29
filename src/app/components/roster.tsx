"use client";
import React, { useMemo } from "react";
import { debounce } from "../lib/util";

// --- Types ---
interface Player {
  person: {
    id: number;
    fullName: string;
  };
  position?: {
    name?: string;
  };
}

interface RosterProps {
  data: Player[];
  onPlayerClick: (playerId: number) => void;
}

// --- Component ---
export const Roster: React.FC<RosterProps> = ({ data, onPlayerClick }) => {
  const debouncedOnPlayerClick = useMemo(
    () => debounce(onPlayerClick, 300),
    [onPlayerClick]
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold text-red-700 dark:text-red-300 mb-6">
        Team Roster
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.map((player) => (
          <div
            key={player.person?.id}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" && player.person?.id) {
                debouncedOnPlayerClick(player.person.id);
              }
            }}
            onClick={() =>
              player.person?.id && debouncedOnPlayerClick(player.person.id)
            }
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
            aria-label={`View details for ${player.person?.fullName ?? "player"}`}
          >
            <p className="text-lg font-semibold text-navy-800 dark:text-white">
              {player.person?.fullName ?? "Unknown Player"}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Position: {player.position?.name ?? "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
