// TodaysGame Component
export const TodaysGame = ({ game }) =>
  game ? (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-red-700 dark:text-red-300 mb-4">
        Today's Game
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        {new Date(game.gameDate).toLocaleString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        })}
      </p>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        @{game.venue?.name}
      </p>
      <div className="flex justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-300">
            {game.teams.home.team.name}
          </p>
          <p className="text-xl font-bold text-navy-800 dark:text-white">
            {game.teams.home.score || 0}
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-300">
            {game.teams.away.team.name}
          </p>
          <p className="text-xl font-bold text-navy-800 dark:text-white">
            {game.teams.away.score || 0}
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-red-700 dark:text-red-300 mb-4">
        Today's Game
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        No game scheduled today.
      </p>
    </div>
  );

// LastGame Component
export const LastGame = ({ game }) =>
  game ? (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-red-700 dark:text-red-300 mb-4">
        Last Game
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        {new Date(game.gameDate).toLocaleString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        @{game.venue?.name}
      </p>
      <div className="flex justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-300">
            {game.teams.home.team.name}
          </p>
          <p className="text-xl font-bold text-navy-800 dark:text-white">
            {game.teams.home.score || 0}
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-300">
            {game.teams.away.team.name}
          </p>
          <p className="text-xl font-bold text-navy-800 dark:text-white">
            {game.teams.away.score || 0}
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-red-700 dark:text-red-300 mb-4">
        Last Game
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        No last game data available.
      </p>
    </div>
  );