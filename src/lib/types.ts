// API Response Types
export interface TeamsResponse {
  teams: Team[];
}

export interface TeamResponse {
  teams: Team[];
}

export interface RosterResponse {
  roster: Player[];
}

export interface ScheduleResponse {
  dates: Array<{
    games: Game[];
  }>;
}

export interface BoxScoreResponse {
  teams: {
    home: {
      players: Record<string, BoxScorePlayer>;
    };
    away: {
      players: Record<string, BoxScorePlayer>;
    };
  };
}

export interface PlayerResponse {
  people: Player[];
}

// Entity Types
export interface TeamRecordData {
  wins: number;
  losses: number;
  pct: string | number;
  gamesBack?: string;
  wildCardGamesBack?: string;
  leagueGamesBack?: string;
  sportGamesBack?: string;
  divisionGamesBack?: string;
  conferenceGamesBack?: string;
  lastUpdated?: string;
}

export interface Venue {
  id: number;
  name: string;
}

export interface League {
  id: number;
  name: string;
}

export interface Division {
  id: number;
  name: string;
}

export interface Team {
  id: number | string;
  name: string;
  teamCode?: string;
  abbreviation?: string;
  teamName?: string;
  locationName?: string;
  shortName?: string;
  league?: League;
  division?: Division;
  venue?: Venue;
}

export interface TeamGameStats {
  team: Team;
  score?: number;
  leagueRecord?: TeamRecordData;
  isWinner?: boolean;
}

export interface Game {
  gameDate: string;
  venue: Venue;
  teams: {
    home: TeamGameStats;
    away: TeamGameStats;
  };
  season: string;
  gamePk: number;
  gameType?: string;
  status?: {
    abstractGameState: string;
    codedGameState: string;
    detailedState: string;
    statusCode: string;
    startTimeTBD: boolean;
  };
}

export interface BoxScorePlayer {
  person: {
    id: number;
    fullName: string;
  };
  jerseyNumber: string;
  position: {
    code: string;
    name: string;
    type: string;
    abbreviation: string;
  };
  status: {
    code: string;
    description: string;
  };
  stats?: {
    batting?: Record<string, number | string>;
    pitching?: Record<string, number | string>;
  };
  seasonStats?: {
    batting?: Record<string, number | string>;
    pitching?: Record<string, number | string>;
  };
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
  batting?: Record<string, number | string>;
  pitching?: Record<string, number | string>;
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

export interface Player {
  person: {
    id: number;
    fullName: string;
    firstName?: string;
    lastName?: string;
    primaryNumber?: string;
    birthDate?: string;
    currentAge?: number;
    birthCity?: string;
    birthStateProvince?: string;
    birthCountry?: string;
  };
  position?: {
    name?: string;
  };
  height?: string;
  weight?: number;
  active?: boolean;
  primaryPosition?: {
    code: string;
    name: string;
    type: string;
    abbreviation: string;
  };
  currentTeam?: {
    id: number;
    name: string;
  };
  stats?: Array<{
    type: { displayName: string };
    group: { displayName: string };
    splits: Array<{
      season?: string;
      stat: Record<string, unknown>;
    }>;
  }>;
  seasonStats?: SeasonStats;
  processedStats?: CareerStats;
  boxScoreStats?: BoxScoreStats;
  boxScoreSeasonStats?: BoxScoreStats;
  lastGameStats?: LastGameStats;
}

// State Types
export interface MLBDataState {
  data: Player[] | null;
  playerInfo: Player | null;
  teamRecord: TeamRecordData | null;
  todaysGame: Game | null;
  lastGame: Game | null;
  boxScore: BoxScoreResponse | null;
  homeTeam: boolean;
  homeVenueId: number | null;
  loading: boolean;
  error: string | null;
  isFetchingPlayer: boolean;
}

// Action Types
export type MLBDataAction =
  | { type: "SET_INITIAL_DATA"; payload: Partial<MLBDataState> }
  | { type: "SET_PLAYER_DATA"; payload: Player }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_FETCHING_PLAYER" }
  | { type: "CLEAR_PLAYER" };

// Component Props Types
export interface PlayerDetailsProps {
  playerInfo: Player | null;
  onClose: () => void;
}

export interface RosterProps {
  data: Player[];
  onPlayerClick: (playerId: number) => void;
}

export interface TeamDropdownProps {
  teams: Team[];
  selectedTeamId: string | number;
  onChange: (teamId: string) => void;
}

export interface TeamRecordProps {
  record: TeamRecordData;
}

export interface GameProps {
  game: Game;
}