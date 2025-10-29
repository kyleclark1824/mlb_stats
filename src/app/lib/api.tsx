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
  const response = await fetch(
    `${apiHost}/people/${playerId}?hydrate=stats(group=[hitting,pitching],type=[career,yearByYear,statSplits],sitCodes=[h,p])`
  );
  if (!response.ok) throw new Error("Failed to fetch player details");
  const { people } = await response.json();
  const player = people?.[0];
  
  if (!player) return null;

  const stats = player.stats || [];
  const isPitcher = player.primaryPosition?.code === "1";

  // Get career stats based on player type
  const careerStats = stats.find(
    (s: { type: { displayName: string }; group: { displayName: string } }) => s.type.displayName === 'career' && 
    s.group.displayName === (isPitcher ? 'pitching' : 'hitting')
  )?.splits?.[0]?.stat || {};

  // Get year by year stats
  const yearByYearStats = stats.find(
    (s: { type: { displayName: string }; group: { displayName: string } }) => s.type.displayName === 'yearByYear' && 
    s.group.displayName === (isPitcher ? 'pitching' : 'hitting')
  )?.splits || [];

  const currentYearStats = yearByYearStats.find(
    (s: { season?: string }) => s.season === new Date().getFullYear().toString()
  )?.stat || {};

  // If player is Shohei Ohtani or other two-way player, get both sets of stats
  const isTwoWayPlayer = player.primaryPosition?.code === "1" && player.batSide;
  let battingStats = {};
  const pitchingStats = {};

  if (isTwoWayPlayer) {
    const careerBatting = stats.find(
      (s: { type: { displayName: string }; group: { displayName: string } }) => s.type.displayName === 'career' && s.group.displayName === 'hitting'
    )?.splits?.[0]?.stat || {};

    const yearBatting = stats.find(
      (s: { type: { displayName: string }; group: { displayName: string } }) => s.type.displayName === 'yearByYear' && s.group.displayName === 'hitting'
    )?.splits?.find(
      (s: { season?: string }) => s.season === new Date().getFullYear().toString()
    )?.stat || {};

    battingStats = {
      careerAVG: careerBatting.avg,
      careerHR: careerBatting.homeRuns,
      careerRBI: careerBatting.rbi,
      yearAVG: yearBatting.avg,
      yearHR: yearBatting.homeRuns,
      yearRBI: yearBatting.rbi
    };
  }

  return {
    id: player.id,
    fullName: player.fullName,
    currentTeam: player.currentTeam,
    primaryPosition: player.primaryPosition,
    batSide: player.batSide?.description,
    pitchHand: player.pitchHand?.description,
    isPitcher,
    isTwoWayPlayer,
    stats: player.stats || [],
    processedStats: isPitcher ? {
      careerERA: careerStats.era,
      careerWins: careerStats.wins,
      careerStrikeouts: careerStats.strikeOuts,
      careerGames: careerStats.gamesPlayed,
      careerSaves: careerStats.saves,
      careerInningsPitched: careerStats.inningsPitched,
      ...battingStats
    } : {
      careerAVG: careerStats.avg,
      careerHR: careerStats.homeRuns,
      careerRBI: careerStats.rbi,
      careerHits: careerStats.hits,
      careerGames: careerStats.gamesPlayed,
      careerRuns: careerStats.runs,
      careerSB: careerStats.stolenBases,
      careerOPS: careerStats.ops,
      ...pitchingStats
    },
    seasonStats: isPitcher ? {
      gamesPlayed: currentYearStats.gamesPlayed,
      era: currentYearStats.era,
      wins: currentYearStats.wins,
      losses: currentYearStats.losses,
      saves: currentYearStats.saves,
      strikeOuts: currentYearStats.strikeOuts,
      inningsPitched: currentYearStats.inningsPitched,
      whip: currentYearStats.whip,
      gameStarts: currentYearStats.gameStarts,
      qualityStarts: currentYearStats.qualityStarts
    } : {
      gamesPlayed: currentYearStats.gamesPlayed,
      avg: currentYearStats.avg,
      homeRuns: currentYearStats.homeRuns,
      rbi: currentYearStats.rbi,
      hits: currentYearStats.hits,
      runs: currentYearStats.runs,
      doubles: currentYearStats.doubles,
      triples: currentYearStats.triples,
      stolenBases: currentYearStats.stolenBases,
      baseOnBalls: currentYearStats.baseOnBalls,
      strikeOuts: currentYearStats.strikeOuts,
      ops: currentYearStats.ops,
      obp: currentYearStats.obp,
      slg: currentYearStats.slg
    }
  };
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
