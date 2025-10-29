// --- API Utilities ---
export const apiHost =
  process.env.NEXT_PUBLIC_MLB_API_HOST || "https://statsapi.mlb.com/api/v1";

export const fetchTeams = async () => {
  const response = await fetch(`${apiHost}/teams?sportId=1`);
  if (!response.ok) throw new Error("Failed to fetch teams");
  const data = await response.json();
  return data.teams || [];
};

export const fetchTeamDetails = async (teamId: string | number) => {
  const response = await fetch(`${apiHost}/teams/${teamId}`);
  if (!response.ok) throw new Error("Failed to fetch team details");
  const data = await response.json();
  return data.teams?.[0] || {};
};

export const fetchRoster = async (teamId: string | number) => {
  const response = await fetch(`${apiHost}/teams/${teamId}/roster`);
  if (!response.ok) throw new Error("Failed to fetch roster");
  const { roster } = await response.json();
  return roster || [];
};

export const fetchSchedule = async (teamId: string | number) => {
  const response = await fetch(
    `${apiHost}/schedule?sportId=1&teamId=${teamId}`,
  );
  if (!response.ok) throw new Error("Failed to fetch schedule");
  const { dates } = await response.json();
  return dates?.[0]?.games?.[0] || null;
};

export const fetchBoxScore = async (gamePk: string | number) => {
  const response = await fetch(`${apiHost}/game/${gamePk}/boxscore`);
  if (!response.ok) throw new Error("Failed to fetch box score");
  return await response.json();
};

export const fetchPlayerDetails = async (playerId: string | number) => {
  const response = await fetch(`${apiHost}/people/${playerId}?hydrate=stats`);
  if (!response.ok) throw new Error("Failed to fetch player details");
  const { people } = await response.json();
  return people?.[0] || null;
};

export const fetchLastGame = async (teamId: string | number) => {
  const today = new Date().toISOString().split("T")[0];
  const seasonStart = "2025-03-28"; // Adjust based on actual season start
  const response = await fetch(
    `${apiHost}/schedule?sportId=1&teamId=${teamId}&startDate=${seasonStart}&endDate=${today}`,
  );
  if (!response.ok) throw new Error("Failed to fetch schedule");
  const { dates } = await response.json();
  for (let i = dates.length - 1; i >= 0; i--) {
    const games = dates[i].games;
    for (const game of games) {
      if (game.status?.abstractGameState === "Final") {
        return game;
      }
    }
  }
  return null;
};
