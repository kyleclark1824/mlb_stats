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

export interface Player {
  person: PlayerPerson;
  position?: { name?: string; code?: string };
  // optional fields from API, left loose for now
  stats?: Record<string, unknown>;
  seasonStats?: Record<string, unknown>;
}

export type Roster = Player[];

// Player detail returned from people endpoint (used by PlayerDetails)
export interface PlayerDetail {
  id: number;
  fullName: string;
  primaryPosition?: { code?: string; name?: string };
  currentTeam?: { id?: number; name?: string };
  stats?: Record<string, unknown>;
  seasonStats?: {
    avg?: string;
    homeRuns?: number;
    rbi?: number;
    hits?: number;
    inningsPitched?: string;
    strikeOuts?: number;
    era?: string;
    wins?: number;
  };
  seasonYear?: string | number;
  lastGameStats?: {
    batting?: { atBats?: number; hits?: number; homeRuns?: number; rbi?: number };
    pitching?: { inningsPitched?: number | string; strikeOuts?: number; hits?: number; earnedRuns?: number };
  };
  boxScoreStats?: {
    batting?: Record<string, unknown>;
    pitching?: Record<string, unknown>;
  };
}
