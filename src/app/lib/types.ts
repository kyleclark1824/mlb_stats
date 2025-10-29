// Shared app types for components and hooks

export interface TeamRecordData {
  wins: number;
  losses: number;
  pct: string | number;
}

export interface Venue {
  id?: number;
  name?: string;
}

export interface TeamInfo {
  name: string;
  id?: number;
}

export interface TeamScore {
  team: TeamInfo;
  score?: number;
  leagueRecord?: TeamRecordData;
}

export interface Teams {
  home: TeamScore;
  away: TeamScore;
}

export interface Team {
  id: number | string;
  name: string;
}

export interface Game {
  gameDate: string;
  venue?: Venue;
  teams: Teams;
  season?: string;
  gamePk?: number;
}

export interface PlayerPerson {
  id: number;
  fullName: string;
}

export interface SeasonStats {
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
  inningsPitched?: string;
  era?: string;
  wins?: number;
  losses?: number;
  whip?: string;
  saves?: number;
  gamesPlayed?: number;
  gameStarts?: number;
  qualityStarts?: number;
}

export interface CareerStats {
  careerERA?: string;
  careerWins?: number;
  careerStrikeouts?: number;
  careerGames?: number;
  careerAVG?: string;
  careerHR?: number;
  careerRBI?: number;
  careerHits?: number;
  careerOPS?: string;
  careerSaves?: number;
  careerInningsPitched?: string;
  careerRuns?: number;
  careerSB?: number;
}

export interface BoxScoreStats {
  batting?: Record<string, unknown>;
  pitching?: Record<string, unknown>;
}

export interface LastGameStats {
  batting?: {
    atBats: number;
    hits: number;
    homeRuns: number;
    rbi: number;
  };
  pitching?: {
    inningsPitched: string;
    strikeOuts: number;
    hits: number;
    earnedRuns: number;
  };
}

export interface PlayerDetail {
  id: number;
  fullName: string;
  currentTeam?: {
    id: number;
    name: string;
  };
  primaryPosition?: {
    name: string;
    code: string;
  };
  pitchHand?: string;
  batSide?: string;
  isPitcher?: boolean;
  isTwoWayPlayer?: boolean;
  stats: Array<{
    type: { displayName: string };
    group: { displayName: string };
    splits: Array<{
      season?: string;
      stat: Record<string, unknown>;
    }>;
  }>;
  processedStats?: CareerStats;
  seasonStats?: SeasonStats;
  boxScoreStats?: BoxScoreStats;
  boxScoreSeasonStats?: BoxScoreStats;
  boxScoreSeasonYear?: string;
  lastGameStats?: LastGameStats;
  seasonYear?: number;
}

export interface Player {
  person: PlayerPerson;
  position?: { name: string; code: string };
  stats?: Record<string, unknown>;
  seasonStats?: Record<string, unknown>;
}

export type Roster = Player[];
