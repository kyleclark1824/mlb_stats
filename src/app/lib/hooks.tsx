import { useState, useEffect, useReducer, useCallback } from "react";
import {fetchTeams, fetchTeamDetails, fetchRoster, fetchSchedule, fetchLastGame, fetchBoxScore, fetchPlayerDetails } from './api'
import { Game, Roster, TeamRecordData, PlayerDetail } from './types'

// --- Types ---
type Team = { league?: { id?: number }; [key: string]: unknown };

type BoxScore = {
  teams?: {
    home?: { players?: Record<string, unknown> };
    away?: { players?: Record<string, unknown> };
  };
};

type State = {
  data: Roster;
  playerInfo: PlayerDetail | null;
  teamRecord: TeamRecordData | null;
  todaysGame: Game | null;
  lastGame: Game | null;
  boxScore: BoxScore | null;
  homeTeam: boolean;
  homeVenueId: number | null;
  loading: boolean;
  error: string | null;
  isFetchingPlayer: boolean;
};

type Action =
  | { type: "SET_INITIAL_DATA"; payload: Partial<State> }
  | { type: "SET_PLAYER_DATA"; payload: PlayerDetail }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_FETCHING_PLAYER" }
  | { type: "CLEAR_PLAYER" };

// --- Hooks ---

// useMLBTeams Hook
export const useMLBTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        const teamsData = await fetchTeams();
        setTeams(
          teamsData.filter(
            (team: Team) => team.league?.id === 103 || team.league?.id === 104,
          ),
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchTeamsData();
  }, []);

  return { teams, loading, error };
};

// useMLBData Hook
export const initialState: State = {
  data: [],
  playerInfo: null,
  teamRecord: null,
  todaysGame: null,
  lastGame: null,
  boxScore: null,
  homeTeam: false,
  homeVenueId: null,
  loading: true,
  error: null,
  isFetchingPlayer: false,
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_INITIAL_DATA":
      return { ...state, ...(action.payload || {}), loading: false } as State;
    case "SET_PLAYER_DATA":
      return { ...state, playerInfo: action.payload , isFetchingPlayer: false };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
        isFetchingPlayer: false,
      };
    case "SET_FETCHING_PLAYER":
      return { ...state, isFetchingPlayer: true };
    case "CLEAR_PLAYER":
      return { ...state, playerInfo: null };
    default:
      return state;
  }
};

export const useMLBData = (teamId: string | number | undefined) => {
  const [state, dispatch] = useReducer(reducer, initialState as State);
  const boxScore = (state as State).boxScore as { teams?: { home: { players: Record<string, unknown> }, away: { players: Record<string, unknown> } } } | null;

  useEffect(() => {
    if (!teamId) return;
    const fetchData = async () => {
      dispatch({ type: "SET_INITIAL_DATA", payload: { loading: true } });
      try {
        const teamDetails = await fetchTeamDetails(teamId);
        const homeVenueId = teamDetails.venue?.id;

        const [rosterResult, scheduleResult, lastGameResult] =
          await Promise.allSettled([
            fetchRoster(teamId),
            fetchSchedule(teamId),
            fetchLastGame(teamId),
          ]);

        const roster =
          rosterResult.status === "fulfilled" ? rosterResult.value : [];
        const game =
          scheduleResult.status === "fulfilled" ? scheduleResult.value : null;
        const lastGame =
          lastGameResult.status === "fulfilled" ? lastGameResult.value : null;

        const newState: Partial<State> = {
          data: roster,
          todaysGame: game,
          lastGame,
          homeVenueId,
        };
        if (game) {
          const boxScoreData = await fetchBoxScore(game.gamePk);
          newState.boxScore = boxScoreData;
          newState.homeTeam = game.venue?.id === homeVenueId;
          const teamKey = newState.homeTeam ? "home" : "away";
          const teamData = game.teams?.[teamKey];
          if (teamData?.leagueRecord) {
            newState.teamRecord = teamData.leagueRecord;
          }
        }
        console.log("setting", newState);
        dispatch({ type: "SET_INITIAL_DATA", payload: newState });
      } catch (err: unknown) {
        dispatch({ type: "SET_ERROR", payload: err instanceof Error ? err.message : String(err) });
      }
    };
    fetchData();
  }, [teamId]);

  const fetchPlayerData = useCallback(
    async (id: string | number) => {
      if (state.isFetchingPlayer) return;
      dispatch({ type: "SET_FETCHING_PLAYER" });
      try {
        const player = await fetchPlayerDetails(id);
        if (!player) throw new Error("Player not found");

        let boxScoreStats = null;
        let boxScoreSeasonStats = null;
        const boxScoreSeasonYear =
          ((state.todaysGame as { season?: string } | null | undefined)?.season) ||
          new Date().getFullYear().toString();
 
        if (boxScore) {
          const players = boxScore.teams?.home?.players || {};
          const awayPlayers = boxScore.teams?.away?.players || {};
          const allPlayers = { ...players, ...awayPlayers };
          const playerStats = allPlayers[`ID${id}`] as { stats?: { batting?: Record<string, unknown>; pitching?: Record<string, unknown> }; seasonStats?: { batting?: Record<string, unknown>; pitching?: Record<string, unknown> } } | undefined;

          if (playerStats) {
            boxScoreStats = {
              batting: playerStats?.stats?.batting || {},
              pitching: playerStats?.stats?.pitching || {},
            };
            boxScoreSeasonStats = {
              batting: playerStats.seasonStats?.batting || {},
              pitching: playerStats.seasonStats?.pitching || {},
            };
          }
        }

        const seasonSplit = player.stats?.[0]?.splits?.find(
          (split: { stat?: { group?: string }; season?: string }) =>
            split.stat?.group ===
            (player.primaryPosition?.code === "1" ? "pitching" : "hitting"),
        );
        const seasonStats = seasonSplit?.stat || {};
        const seasonYear =
          seasonSplit?.season || new Date().getFullYear().toString();

        dispatch({
          type: "SET_PLAYER_DATA",
          payload: {
            ...player,
            boxScoreStats,
            boxScoreSeasonStats,
            boxScoreSeasonYear,
            seasonStats,
            seasonYear,
          },
        });
      } catch (err: unknown) {
        dispatch({ type: "SET_ERROR", payload: err instanceof Error ? err.message : String(err) });
      }
    },
    [boxScore, state.isFetchingPlayer, state.todaysGame],
  );

  return {
    state,
    fetchPlayerData,
    clearPlayerInfo: () => dispatch({ type: "CLEAR_PLAYER" }),
  };
};