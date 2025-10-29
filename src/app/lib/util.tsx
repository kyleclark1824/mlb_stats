import React, { Component } from "react";
import {apiHost, fetchBoxScore} from "./api.tsx"
import {CARDINALS_ID} from "./consts.tsx"

// --- Utility Functions ---
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// --- Render Counter Hook for Debugging ---
export const useRenderCounter = (componentName) => {
  const renderCount = React.useRef(0);
  renderCount.current += 1;
};

// --- Error Boundary ---
export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mx-4 my-4 rounded">
          <p className="font-bold">Error</p>
          <p>{this.state.error?.message || "An unexpected error occurred"}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export const fetchLastFiveGamesStats = async (teamId, playerId) => {
  const today = new Date().toISOString().split("T")[0];
  const seasonStart = "2025-03-28"; // Adjust based on actual season start
  const response = await fetch(
    `${apiHost}/schedule?sportId=1&teamId=${CARDINALS_ID}&startDate=${seasonStart}&endDate=${today}`,
  );
  if (!response.ok) throw new Error("Failed to fetch last 5 games");

  const { dates } = await response.json();
  const games = [];
  for (let i = dates.length - 1; i >= 0 && games.length < 5; i--) {
    const completedGames = dates[i].games.filter(
      (game) => game.status?.abstractGameState === "Final",
    );

    if (i === 0) {
      completedGames[0].lastGame = true;
    }
    games.push(...completedGames);
  }
  const lastFiveGames = games.slice(0, 5);

  let battingStats = {
    atBats: 0,
    hits: 0,
    homeRuns: 0,
    rbi: 0,
  };
  let pitchingStats = {
    inningsPitched: 0,
    strikeOuts: 0,
    hits: 0,
    earnedRuns: 0,
  };

  for (const game of lastFiveGames) {
    console.log("fetching");
    const boxScore = await fetchBoxScore(game.gamePk);
    console.log("boxScore:", boxScore);
    const players = {
      ...boxScore.teams?.home?.players,
      ...boxScore.teams?.away?.players,
    };
    const playerStats = players[`ID${playerId}`];
    if (playerStats) {
      if (playerStats.stats?.batting) {
        if (game.lastGame) {
          lastGameStats.atBats += playerStats.stats.batting.atBats || 0;
          lastGameStats.hits += playerStats.stats.batting.hits || 0;
          lastGameStats.homeRuns += playerStats.stats.batting.homeRuns || 0;
          lastGameStats.rbi += playerStats.stats.batting.rbi || 0;
        }

        battingStats.atBats += playerStats.stats.batting.atBats || 0;
        battingStats.hits += playerStats.stats.batting.hits || 0;
        battingStats.homeRuns += playerStats.stats.batting.homeRuns || 0;
        battingStats.rbi += playerStats.stats.batting.rbi || 0;
      }
      if (playerStats.stats?.pitching) {
        pitchingStats.inningsPitched += parseFloat(
          playerStats.stats.pitching.inningsPitched || 0,
        );
        pitchingStats.strikeOuts += playerStats.stats.pitching.strikeOuts || 0;
        pitchingStats.hits += playerStats.stats.pitching.hits || 0;
        pitchingStats.earnedRuns += playerStats.stats.pitching.earnedRuns || 0;
      }
    }
  }

  return { battingStats, pitchingStats, gamesCount: lastFiveGames.length };
};
