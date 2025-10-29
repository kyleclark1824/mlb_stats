"use client";
import { useState, useEffect } from "react";
import { fetchLastFiveGamesStats } from "../lib/util";
import Image from "next/image";

// ===== TYPES =====
import { PlayerDetail } from "../lib/types";


interface LastFiveGamesStats {
  gamesCount: number;
  battingStats?: {
    atBats: number;
    hits: number;
    homeRuns: number;
    rbi: number;
  };
  pitchingStats?: {
    inningsPitched: number;
    strikeOuts: number;
    hits: number;
    earnedRuns: number;
  };
}

type PlayerInfo = PlayerDetail;

interface PlayerDetailsProps {
  playerInfo: PlayerInfo;
  onClose: () => void;
}

// ===== COMPONENT =====
export const PlayerDetails: React.FC<PlayerDetailsProps> = ({
  playerInfo,
  onClose,
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [lastFiveGamesStats, setLastFiveGamesStats] =
    useState<LastFiveGamesStats | null>(null);
  const [loadingLastFive, setLoadingLastFive] = useState<boolean>(false);
  const [errorLastFive, setErrorLastFive] = useState<string | null>(null);

  const headshotUrl = `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.jpg/w_213,q_auto:best/v1/people/${playerInfo?.id}/headshot/67/current`;
  const fallbackImage = "/default-player.png";

  // Fetch last 5 games stats when component mounts
  useEffect(() => {
    const fetchStatsAsync = async () => {
      setLoadingLastFive(true);
      try {
        const stats = await fetchLastFiveGamesStats(
          playerInfo.currentTeam?.id ?? "",
          playerInfo?.id ?? 0
        );
        setLastFiveGamesStats(stats);
      } catch (err: unknown) {
        setErrorLastFive(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingLastFive(false);
      }
    };
    fetchStatsAsync();
  }, [playerInfo?.id, playerInfo.currentTeam?.id]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-12 text-black dark:text-white">
      <h2 className="text-2xl font-semibold text-red-700 dark:text-red-300 mb-4">
        Player Details
      </h2>

      {/* Player Info */}
      <div className="flex flex-col sm:flex-row sm:items-start mb-6">
        <div className="mb-4 sm:mb-0 sm:mr-6">
          <Image
            src={imageError ? fallbackImage : headshotUrl}
            alt={`${playerInfo.fullName} headshot`}
            width={150}
            height={150}
            className="rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
            onError={() => setImageError(true)}
            priority={false}
            placeholder="blur"
            blurDataURL="/placeholder.png"
          />
        </div>
        <div>
          <p className="text-xl font-bold text-navy-800 dark:text-white">
            {playerInfo.fullName}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Position: {playerInfo.primaryPosition?.name || "N/A"}
          </p>
        </div>
      </div>

      {/* ===== SEASON STATS ===== */}
      {playerInfo.seasonStats &&
        Object.keys(playerInfo.seasonStats).length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-navy-800 dark:text-white mb-2">
              {playerInfo.seasonYear} Season Stats
            </h3>

            {/* Pitchers */}
            {playerInfo.primaryPosition?.code === "1" ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat label="Innings Pitched" value={playerInfo.seasonStats.inningsPitched || "0.0"} />
                <Stat label="Strikeouts" value={playerInfo.seasonStats.strikeOuts || 0} />
                <Stat label="ERA" value={playerInfo.seasonStats.era || "0.00"} />
                <Stat label="Wins" value={playerInfo.seasonStats.wins || 0} />
              </div>
            ) : (
              // Hitters
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat label="Batting Avg" value={playerInfo.seasonStats.avg || ".000"} />
                <Stat label="Home Runs" value={playerInfo.seasonStats.homeRuns || 0} />
                <Stat label="RBIs" value={playerInfo.seasonStats.rbi || 0} />
                <Stat label="Hits" value={playerInfo.seasonStats.hits || 0} />
              </div>
            )}
          </div>
        )}

      {/* ===== LAST GAME STATS ===== */}
      {playerInfo.lastGameStats ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white mb-2">
            Last Game Stats
          </h3>

          {/* Batting */}
          {playerInfo.lastGameStats.batting &&
            Object.keys(playerInfo.lastGameStats.batting).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat label="At Bats" value={playerInfo.lastGameStats.batting.atBats || 0} />
                <Stat label="Hits" value={playerInfo.lastGameStats.batting.hits || 0} />
                <Stat label="Home Runs" value={playerInfo.lastGameStats.batting.homeRuns || 0} />
                <Stat label="RBIs" value={playerInfo.lastGameStats.batting.rbi || 0} />
              </div>
            )}

          {/* Pitching */}
          {playerInfo.lastGameStats.pitching &&
            Object.keys(playerInfo.lastGameStats.pitching).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <Stat label="Innings Pitched" value={playerInfo.lastGameStats.pitching.inningsPitched || "0.0"} />
                <Stat label="Strikeouts" value={playerInfo.lastGameStats.pitching.strikeOuts || 0} />
                <Stat label="Hits Allowed" value={playerInfo.lastGameStats.pitching.hits || 0} />
                <Stat label="Earned Runs" value={playerInfo.lastGameStats.pitching.earnedRuns || 0} />
              </div>
            )}
        </div>
      ) : (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white mb-2">
            Last Game Stats
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            No stats available for the last game.
          </p>
        </div>
      )}

      {/* ===== LAST 5 GAMES ===== */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-navy-800 dark:text-white mb-2">
          Last 5 Games Stats
        </h3>
        {loadingLastFive ? (
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        ) : errorLastFive ? (
          <p className="text-red-700 dark:text-red-300">Error: {errorLastFive}</p>
        ) : lastFiveGamesStats && lastFiveGamesStats.gamesCount > 0 ? (
          <>
            {/* Batting */}
            {lastFiveGamesStats.battingStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat label="At Bats" value={lastFiveGamesStats.battingStats.atBats} />
                <Stat label="Hits" value={lastFiveGamesStats.battingStats.hits} />
                <Stat label="Home Runs" value={lastFiveGamesStats.battingStats.homeRuns} />
                <Stat label="RBIs" value={lastFiveGamesStats.battingStats.rbi} />
              </div>
            )}

            {/* Pitching */}
            {lastFiveGamesStats.pitchingStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <Stat label="Innings Pitched" value={lastFiveGamesStats.pitchingStats.inningsPitched.toFixed(1)} />
                <Stat label="Strikeouts" value={lastFiveGamesStats.pitchingStats.strikeOuts} />
                <Stat label="Hits Allowed" value={lastFiveGamesStats.pitchingStats.hits} />
                <Stat label="Earned Runs" value={lastFiveGamesStats.pitchingStats.earnedRuns} />
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">
            No stats available for the last 5 games.
          </p>
        )}
      </div>

      {/* ===== CLOSE BUTTON ===== */}
      <button
        onClick={onClose}
        className="mt-6 bg-red-700 dark:bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 dark:hover:bg-red-700 transition"
      >
        Close
      </button>
    </div>
  );
};

// ===== SMALL REUSABLE STAT COMPONENT =====
interface StatProps {
  label: string;
  value: string | number;
}

const Stat: React.FC<StatProps> = ({ label, value }) => (
  <div>
    <p className="text-gray-600 dark:text-gray-300">{label}</p>
    <p className="font-bold">{value}</p>
  </div>
);
