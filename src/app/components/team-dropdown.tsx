import React from "react";

interface Team {
  id: number | string;
  name: string;
}

interface TeamDropdownProps {
  teams: Team[];
  selectedTeamId: string;
  onSelectTeam: (teamId: string) => void;
}

export const TeamDropdown = (props: TeamDropdownProps) => {
  const { teams, selectedTeamId, onSelectTeam } = props;
  return (
    <select
      value={selectedTeamId || ""}
      onChange={(e) => onSelectTeam(e.target.value)}
      className="bg-white dark:bg-gray-700 text-black dark:text-white p-2 rounded border border-gray-300 dark:border-gray-600"
    >
      <option value="">Select a Team</option>
      {teams.map((team: Team) => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </select>
  );
};

