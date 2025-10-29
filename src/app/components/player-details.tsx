"use client";
import { useState, useEffect } from "react";
import { fetchLastFiveGamesStats } from "../lib/util";
import { fetchPlayerStatsByYear } from "../lib/player-stats";
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
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  interface YearStats {
    gamesPlayed?: number;
    avg?: string;
    homeRuns?: number;
    rbi?: number;
    hits?: number;
    runs?: number;
    doubles?: number;
    triples?: number;
    stolenBases?: number;
    baseOnBalls?: number;
    strikeOuts?: number;
    ops?: string;
    obp?: string;
    slg?: string;
    atBats?: number;
    plateAppearances?: number;
    era?: string;
    wins?: number;
    losses?: number;
    saves?: number;
    inningsPitched?: string;
    whip?: string;
    qualityStarts?: number;
    earnedRuns?: number;
  }

  const [yearStats, setYearStats] = useState<YearStats | null>(null);
  const [loadingYearStats, setLoadingYearStats] = useState<boolean>(false);
  const [yearOptions, setYearOptions] = useState<number[]>([]);

  const headshotUrl = `https://content.mlb.com/images/headshots/current/60x60/${playerInfo?.id}@2x.png`;
  const fallbackImage = "/mlb-logo.svg";

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

  // Populate year options when player info changes
  useEffect(() => {
    if (playerInfo.stats) {
      const yearStats = playerInfo.stats.find(stat => 
        stat.type.displayName === 'yearByYear' &&
        stat.group.displayName === (playerInfo.isPitcher ? 'pitching' : 'hitting')
      );
      
      const years = yearStats?.splits
        ?.map(split => parseInt(split.season || '', 10))
        .filter(year => !isNaN(year))
        .sort((a, b) => b - a) || [];

      setYearOptions(years);
      
      // Set initial year to most recent
      if (years.length > 0 && !selectedYear) {
        setSelectedYear(years[0]);
      }
    }
  }, [playerInfo.stats, playerInfo.isPitcher]);

  // Fetch stats for selected year when it changes
  useEffect(() => {
    const fetchYearStats = async () => {
      if (!playerInfo.id || !selectedYear) return;
      
      setLoadingYearStats(true);
      try {
        const stats = await fetchPlayerStatsByYear(playerInfo.id, selectedYear);
        setYearStats(stats);
      } catch (error) {
        console.error('Error fetching year stats:', error);
      } finally {
        setLoadingYearStats(false);
      }
    };

    fetchYearStats();
  }, [playerInfo.id, selectedYear]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-12 text-black dark:text-white">
      <h2 className="text-2xl font-semibold text-red-700 dark:text-red-300 mb-4">
        Player Details
      </h2>

      {/* Player Info */}
      <div className="flex flex-col sm:flex-row sm:items-start mb-6">
        <div className="relative mb-4 sm:mb-0 sm:mr-6">
          <Image
            src={imageError ? fallbackImage : headshotUrl}
            alt={`${playerInfo.fullName} headshot`}
            width={150}
            height={150}
            className="rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
            onError={() => setImageError(true)}
            priority={true}
            unoptimized={true}
          />
        </div>
        <div>
          <p className="text-xl font-bold text-navy-800 dark:text-white">
            {playerInfo.fullName}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Position: {playerInfo.primaryPosition?.name || "N/A"}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Team: {playerInfo.currentTeam?.name || "N/A"}
          </p>
          {playerInfo.primaryPosition?.code === "1" ? (
            <p className="text-gray-600 dark:text-gray-300">
              Throws: {typeof playerInfo.pitchHand === 'object' ? 'N/A' : (playerInfo.pitchHand || "N/A")}
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              Bats: {typeof playerInfo.batSide === 'object' ? 'N/A' : (playerInfo.batSide || "N/A")}
            </p>
          )}
        </div>
      </div>

      {/* ===== SEASON STATS ===== */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">
            Season Stats
          </h3>
          <div className="flex items-center space-x-2">
            <label htmlFor="yearSelect" className="text-gray-600 dark:text-gray-300">
              Select Year:
            </label>
            <select
              id="yearSelect"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {loadingYearStats ? (
          <div className="text-gray-600 dark:text-gray-300">Loading stats...</div>
        ) : (
          <div>
            {/* Career Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {selectedYear} Season Stats
              </h4>
              {playerInfo.isPitcher ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Stat label="ERA" value={yearStats?.era || "0.00"} />
                  <Stat label="Record" value={`${yearStats?.wins || 0}-${yearStats?.losses || 0}`} />
                  <Stat label="K's" value={yearStats?.strikeOuts || 0} />
                  <Stat label="IP" value={yearStats?.inningsPitched || "0.0"} />
                  <Stat label="WHIP" value={yearStats?.whip || "0.00"} />
                  <Stat label="Saves" value={yearStats?.saves || 0} />
                  <Stat label="Games" value={yearStats?.gamesPlayed || 0} />
                  <Stat label="Quality Starts" value={yearStats?.qualityStarts || 0} />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Stat label="AVG" value={yearStats?.avg || ".000"} />
                  <Stat label="HR" value={yearStats?.homeRuns || 0} />
                  <Stat label="RBI" value={yearStats?.rbi || 0} />
                  <Stat label="Hits" value={yearStats?.hits || 0} />
                  <Stat label="OPS" value={yearStats?.ops || ".000"} />
                  <Stat label="Runs" value={yearStats?.runs || 0} />
                  <Stat label="2B" value={yearStats?.doubles || 0} />
                  <Stat label="SB" value={yearStats?.stolenBases || 0} />
                </div>
              )}
            </div>

            {/* Selected Year Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {yearOptions[0]} Season
              </h4>
              {playerInfo.isPitcher ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Stat label="ERA" value={playerInfo.seasonStats?.era || "0.00"} />
                  <Stat label="Record" value={`${playerInfo.seasonStats?.wins || 0}-${playerInfo.seasonStats?.losses || 0}`} />
                  <Stat label="Strikeouts" value={playerInfo.seasonStats?.strikeOuts || 0} />
                  <Stat label="IP" value={playerInfo.seasonStats?.inningsPitched || "0.0"} />
                  <Stat label="WHIP" value={playerInfo.seasonStats?.whip || "0.00"} />
                  <Stat label="Saves" value={playerInfo.seasonStats?.saves || 0} />
                  <Stat label="Starts" value={playerInfo.seasonStats?.gameStarts || 0} />
                  <Stat label="Quality Starts" value={playerInfo.seasonStats?.qualityStarts || 0} />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Stat label="AVG" value={playerInfo.seasonStats?.avg || ".000"} />
                  <Stat label="HR" value={playerInfo.seasonStats?.homeRuns || 0} />
                  <Stat label="RBI" value={playerInfo.seasonStats?.rbi || 0} />
                  <Stat label="Hits" value={playerInfo.seasonStats?.hits || 0} />
                  <Stat label="OPS" value={playerInfo.seasonStats?.ops || ".000"} />
                  <Stat label="Runs" value={playerInfo.seasonStats?.runs || 0} />
                  <Stat label="SB" value={playerInfo.seasonStats?.stolenBases || 0} />
                  <Stat label="Games" value={playerInfo.seasonStats?.gamesPlayed || 0} />
                </div>
              )}

              {playerInfo.isTwoWayPlayer && playerInfo.isPitcher && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {yearOptions[0]} Batting Stats
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Stat label="AVG" value={playerInfo.seasonStats?.avg || ".000"} />
                    <Stat label="HR" value={playerInfo.seasonStats?.homeRuns || 0} />
                    <Stat label="RBI" value={playerInfo.seasonStats?.rbi || 0} />
                    <Stat label="OPS" value={playerInfo.seasonStats?.ops || ".000"} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
