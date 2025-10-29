import { useState, useEffect } from "react";
import { debounce } from "../lib/util.tsx"
import { fetchLastFiveGamesStats, fetchStats } from "../lib/util.tsx"
import Image from "next/image";

  // PlayerDetails Component
export const PlayerDetails = ({ playerInfo, onClose }) => {
  const [imageError, setImageError] = useState(false);
  const [lastFiveGamesStats, setLastFiveGamesStats] = useState(null);
  const [loadingLastFive, setLoadingLastFive] = useState(false);
  const [errorLastFive, setErrorLastFive] = useState(null);

  // Construct the headshot URL
  const headshotUrl = `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.jpg/w_213,q_auto:best/v1/people/${playerInfo?.id}/headshot/67/current`;
  // Fallback image (place in /public directory)
  const fallbackImage = "/default-player.png";

  // Fetch last 5 games stats when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingLastFive(true);
      try {
        const stats = await fetchLastFiveGamesStats(playerInfo.currentTeam?.id, playerInfo?.id);
        setLastFiveGamesStats(stats);
      } catch (err) {
        setErrorLastFive(err.message);
      } finally {
        setLoadingLastFive(false);
      }
    };
    fetchStats();
  }, [playerInfo?.id, playerInfo.currentTeam?.id]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-12 text-black dark:text-white">
      <h2 className="text-2xl font-semibold text-red-700 dark:text-red-300 mb-4">
        Player Details
      </h2>
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

      {/* Season Stats */}
      {playerInfo.seasonStats &&
        Object.keys(playerInfo.seasonStats).length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-navy-800 dark:text-white mb-2">
              {playerInfo.seasonYear} Season Stats
            </h3>
            {playerInfo.primaryPosition?.code === "1" ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Innings Pitched
                  </p>
                  <p className="font-bold">
                    {playerInfo.seasonStats.inningsPitched || "0.0"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Strikeouts</p>
                  <p className="font-bold">
                    {playerInfo.seasonStats.strikeOuts || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">ERA</p>
                  <p className="font-bold">
                    {playerInfo.seasonStats.era || "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Wins</p>
                  <p className="font-bold">{playerInfo.seasonStats.wins || 0}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Batting Avg</p>
                  <p className="font-bold">
                    {playerInfo.seasonStats.avg || ".000"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Home Runs</p>
                  <p className="font-bold">
                    {playerInfo.seasonStats.homeRuns || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">RBIs</p>
                  <p className="font-bold">{playerInfo.seasonStats.rbi || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Hits</p>
                  <p className="font-bold">{playerInfo.seasonStats.hits || 0}</p>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Last Game Stats */}
      {playerInfo.lastGameStats ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white mb-2">
            Last Game Stats
          </h3>
          {playerInfo.lastGameStats.batting &&
            Object.keys(playerInfo.lastGameStats.batting).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-300">At Bats</p>
                  <p className="font-bold">
                    {playerInfo.lastGameStats.batting.atBats || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Hits</p>
                  <p className="font-bold">
                    {playerInfo.lastGameStats.batting.hits || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Home Runs</p>
                  <p className="font-bold">
                    {playerInfo.lastGameStats.batting.homeRuns || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">RBIs</p>
                  <p className="font-bold">
                    {playerInfo.lastGameStats.batting.rbi || 0}
                  </p>
                </div>
              </div>
            )}
          {playerInfo.lastGameStats.pitching &&
            Object.keys(playerInfo.lastGameStats.pitching).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Innings Pitched
                  </p>
                  <p className="font-bold">
                    {playerInfo.lastGameStats.pitching.inningsPitched || "0.0"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Strikeouts</p>
                  <p className="font-bold">
                    {playerInfo.lastGameStats.pitching.strikeOuts || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Hits Allowed</p>
                  <p className="font-bold">
                    {playerInfo.lastGameStats.pitching.hits || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Earned Runs</p>
                  <p className="font-bold">
                    {playerInfo.lastGameStats.pitching.earnedRuns || 0}
                  </p>
                </div>
              </div>
            )}
          {(!playerInfo.lastGameStats.batting ||
            Object.keys(playerInfo.boxScoreStats.batting).length === 0) &&
            (!playerInfo.lastGameStats.pitching ||
              Object.keys(playerInfo.lastGameStats.pitching).length === 0) && (
              <p className="text-gray-600 dark:text-gray-300">
                No stats available for the last game.
              </p>
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

      {/* Last 5 Games Stats */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-navy-800 dark:text-white mb-2">
          Last 5 Games Stats
        </h3>
        {loadingLastFive ? (
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        ) : errorLastFive ? (
          <p className="text-red-700 dark:text-red-300">
            Error: {errorLastFive}
          </p>
        ) : lastFiveGamesStats && lastFiveGamesStats.gamesCount > 0 ? (
          <>
            {lastFiveGamesStats.battingStats &&
              (lastFiveGamesStats.battingStats.atBats > 0 ||
                lastFiveGamesStats.battingStats.hits > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">At Bats</p>
                    <p className="font-bold">
                      {lastFiveGamesStats.battingStats.atBats}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Hits</p>
                    <p className="font-bold">
                      {lastFiveGamesStats.battingStats.hits}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Home Runs</p>
                    <p className="font-bold">
                      {lastFiveGamesStats.battingStats.homeRuns}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">RBIs</p>
                    <p className="font-bold">
                      {lastFiveGamesStats.battingStats.rbi}
                    </p>
                  </div>
                </div>
              )}
            {lastFiveGamesStats.pitchingStats &&
              (lastFiveGamesStats.pitchingStats.inningsPitched > 0 ||
                lastFiveGamesStats.pitchingStats.strikeOuts > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Innings Pitched
                    </p>
                    <p className="font-bold">
                      {lastFiveGamesStats.pitchingStats.inningsPitched.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Strikeouts</p>
                    <p className="font-bold">
                      {lastFiveGamesStats.pitchingStats.strikeOuts}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Hits Allowed</p>
                    <p className="font-bold">
                      {lastFiveGamesStats.pitchingStats.hits}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Earned Runs</p>
                    <p className="font-bold">
                      {lastFiveGamesStats.pitchingStats.earnedRuns}
                    </p>
                  </div>
                </div>
              )}
            {(!lastFiveGamesStats.battingStats ||
              (lastFiveGamesStats.battingStats.atBats === 0 &&
                lastFiveGamesStats.battingStats.hits === 0)) &&
              (!lastFiveGamesStats.pitchingStats ||
                (lastFiveGamesStats.pitchingStats.inningsPitched === 0 &&
                  lastFiveGamesStats.pitchingStats.strikeOuts === 0)) && (
                <p className="text-gray-600 dark:text-gray-300">
                  No stats available for the last {lastFiveGamesStats.gamesCount} games.
                </p>
              )}
          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">
            No stats available for the last 5 games.
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className="mt-6 bg-red-700 dark:bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 dark:hover:bg-red-700 transition"
      >
        Close
      </button>
    </div>
  );
};