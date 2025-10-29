import { useState, useEffect, useReducer, useCallback } from "react";
import { fetchTeams, fetchTeamDetails, fetchRoster, fetchSchedule, fetchLastGame, fetchBoxScore, fetchPlayerDetails } from './api'
import { 
  Team, 
  Player,
  MLBDataState,
  MLBDataAction 
} from './types'

// --- Hooks ---

// useMLBTeams Hook
export const useMLBTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        const teamsData = await fetchTeams();
        setTeams(
          teamsData.filter(
            (team) => team.league?.id === 103 || team.league?.id === 104,
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
export const initialState: MLBDataState = {
  data: null,
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

export const reducer = (state: MLBDataState, action: MLBDataAction): MLBDataState => {
  switch (action.type) {
    case "SET_INITIAL_DATA":
      return { ...state, ...(action.payload || {}), loading: false };
    case "SET_PLAYER_DATA":
      return { ...state, playerInfo: action.payload, isFetchingPlayer: false };
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
  const [state, dispatch] = useReducer(reducer, initialState);
  const boxScore = state.boxScore;

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

        const newState: Partial<MLBDataState> = {
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

        interface PlayerBoxScoreInfo {
          stats?: {
            batting?: Record<string, unknown>;
            pitching?: Record<string, unknown>;
          };
          seasonStats?: {
            batting?: Record<string, unknown>;
            pitching?: Record<string, unknown>;
          };
        }

        // Use the BoxScoreStats type from types.ts
        let currentBoxScoreStats: {
          batting?: Record<string, string | number>;
          pitching?: Record<string, string | number>;
        } | undefined;
        let currentBoxScoreSeasonStats: {
          batting?: Record<string, string | number>;
          pitching?: Record<string, string | number>;
        } | undefined;

        if (boxScore) {
          const players = boxScore.teams?.home?.players || {};
          const awayPlayers = boxScore.teams?.away?.players || {};
          const allPlayers = { ...players, ...awayPlayers };
          const playerStats = allPlayers[`ID${id}`] as PlayerBoxScoreInfo | undefined;

          if (playerStats) {
            currentBoxScoreStats = {
              batting: (playerStats.stats?.batting || {}) as Record<string, string | number>,
              pitching: (playerStats.stats?.pitching || {}) as Record<string, string | number>,
            };
            currentBoxScoreSeasonStats = {
              batting: (playerStats.seasonStats?.batting || {}) as Record<string, string | number>,
              pitching: (playerStats.seasonStats?.pitching || {}) as Record<string, string | number>,
            };
          }
        }

        const yearStats = player.stats?.find((stat: { 
          type: { displayName: string }; 
          group: { displayName: string };
          splits: Array<{
            season?: string;
            stat: Record<string, unknown>;
          }>;
        }) => 
          stat.type.displayName === 'yearByYear' && 
          stat.group.displayName === (player.primaryPosition?.code === "1" ? "pitching" : "hitting")
        );
        const seasonSplit = yearStats?.splits?.find(
          (split: { season?: string; stat: Record<string, unknown> }) => 
            split.season === new Date().getFullYear().toString()
        );
        const seasonStats = seasonSplit?.stat || {};

        dispatch({
          type: "SET_PLAYER_DATA",
          payload: {
            person: {
              id: player.id,
              fullName: player.fullName
            },
            currentTeam: player.currentTeam,
            primaryPosition: player.primaryPosition,
            boxScoreStats: currentBoxScoreStats,
            boxScoreSeasonStats: currentBoxScoreSeasonStats,
            seasonStats,
            stats: player.stats || [],
            batSide: player.batSide,
            pitchHand: player.pitchHand,
            isPitcher: player.isPitcher,
            isTwoWayPlayer: player.isTwoWayPlayer
          } as unknown as Player,
        });
      } catch (err: unknown) {
        dispatch({ type: "SET_ERROR", payload: err instanceof Error ? err.message : String(err) });
      }
    },
    [boxScore, state.isFetchingPlayer],
  );

  return {
    state,
    fetchPlayerData,
    clearPlayerInfo: () => dispatch({ type: "CLEAR_PLAYER" }),
  };
};