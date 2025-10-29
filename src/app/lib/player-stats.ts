export const fetchPlayerStatsByYear = async (playerId: number | string, year: number) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MLB_API_HOST || 'https://statsapi.mlb.com/api/v1'}/people/${playerId}?hydrate=stats(group=[hitting,pitching],type=[yearByYear])`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    const data = await response.json();
    const player = data.people?.[0];
    const isPitcher = player?.primaryPosition?.code === "1";

    const yearByYearStats = data.people?.[0]?.stats?.find(
      (stat: { type: { displayName: string }; group: { displayName: string } }) => stat.type.displayName === 'yearByYear' && 
      stat.group.displayName === (isPitcher ? 'pitching' : 'hitting')
    );

    const seasonStats = yearByYearStats?.splits?.find(
      (split: { season?: string }) => split.season === year.toString()
    );

    if (!seasonStats) {
      return null;
    }

    // Get the actual stats object from the response
    const stats = seasonStats.stat;
    
    return isPitcher ? {
      gamesPlayed: stats.gamesPlayed,
      gameStarts: stats.gameStarts,
      era: stats.era,
      wins: stats.wins,
      losses: stats.losses,
      saves: stats.saves,
      strikeOuts: stats.strikeOuts,
      inningsPitched: stats.inningsPitched,
      whip: stats.whip,
      qualityStarts: stats.qualityStarts,
      hits: stats.hits,
      earnedRuns: stats.earnedRuns
    } : {
      gamesPlayed: stats.gamesPlayed,
      avg: stats.avg,
      homeRuns: stats.homeRuns,
      rbi: stats.rbi,
      hits: stats.hits,
      runs: stats.runs,
      doubles: stats.doubles,
      triples: stats.triples,
      stolenBases: stats.stolenBases,
      baseOnBalls: stats.baseOnBalls,
      strikeOuts: stats.strikeOuts,
      ops: stats.ops,
      obp: stats.obp,
      slg: stats.slg,
      atBats: stats.atBats,
      plateAppearances: stats.plateAppearances
    };
  } catch (error) {
    console.error('Error fetching player stats:', error);
    throw error;
  }
};