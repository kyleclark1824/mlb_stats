// TeamDropdown Component
export const TeamDropdown = ({ teams, selectedTeamId, onSelectTeam }) => (
  <select
    value={selectedTeamId || ""}
    onChange={(e) => onSelectTeam(e.target.value)}
    className="bg-white dark:bg-gray-700 text-black dark:text-white p-2 rounded border border-gray-300 dark:border-gray-600"
  >
    <option value="">Select a Team</option>
    {teams.map((team) => (
      <option key={team?.id} value={team?.id}>
        {team.name}
      </option>
    ))}
  </select>
);
