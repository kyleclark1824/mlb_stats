import React, { useState, useEffect, useReducer, useMemo, useCallback } from "react";
import {fetchTeams, fetchTeamsData, fetchTeamDetails, fetchRoster, fetchSchedule, fetchLastGame, fetchBoxScore, fetchPlayerDetails } from './api.tsx'

// --- Hooks ---

// useMLBTeams Hook
export const useMLBTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        const teamsData = await fetchTeams();
        setTeams(
          teamsData.filter(
            (team) => team.league?.id === 103 || team.league?.id === 104,
          ),
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamsData();
  }, []);

  return { teams, loading, error };
};

// useMLBData Hook
export const initialState = {
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

export const reducer = (state, action) => {
  switch (action.type) {
    case "SET_INITIAL_DATA":
      return { ...state, ...action.payload, loading: false };
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

export const useMLBData = (teamId) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const boxScore = useMemo(() => state.boxScore, [state.boxScore]);

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

        const newState = {
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
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: err.message });
      }
    };
    fetchData();
  }, [teamId]);

  const fetchPlayerData = useCallback(
    async (id) => {
      if (state.isFetchingPlayer) return;
      dispatch({ type: "SET_FETCHING_PLAYER" });
      try {
        const player = await fetchPlayerDetails(id);
        if (!player) throw new Error("Player not found");

        let boxScoreStats = null;
        let boxScoreSeasonStats = null;
        let boxScoreSeasonYear =
          state.todaysGame?.season || new Date().getFullYear().toString();
        console.log("here", boxScore);
        if (boxScore) {
          const players = boxScore.teams?.home?.players || {};
          const awayPlayers = boxScore.teams?.away?.players || {};
          const allPlayers = { ...players, ...awayPlayers };
          const playerStats = allPlayers[`ID${id}`];
          console.log(allPlayers, id);
          if (playerStats) {
            boxScoreStats = {
              batting: playerStats.stats?.batting || {},
              pitching: playerStats.stats?.pitching || {},
            };
            boxScoreSeasonStats = {
              batting: playerStats.seasonStats?.batting || {},
              pitching: playerStats.seasonStats?.pitching || {},
            };
          }
        }

        const seasonSplit = player.stats?.[0]?.splits?.find(
          (split) =>
            split.stat.group ===
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
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: err.message });
      }
    },
    [boxScore],
  );

  return {
    state,
    fetchPlayerData,
    clearPlayerInfo: () => dispatch({ type: "CLEAR_PLAYER" }),
  };
};