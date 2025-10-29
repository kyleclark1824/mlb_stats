// TeamRecord Component
export const TeamRecord = ({ record }) => (
  <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
    <h2 className="text-2xl font-semibold text-red-700 dark:text-red-300 mb-4">
      Team Record
    </h2>
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <p className="text-gray-600 dark:text-gray-300">Wins</p>
        <p className="text-xl font-bold text-navy-800 dark:text-white">
          {record.wins}
        </p>
      </div>
      <div>
        <p className="text-gray-600 dark:text-gray-300">Losses</p>
        <p className="text-xl font-bold text-navy-800 dark:text-white">
          {record.losses}
        </p>
      </div>
      <div>
        <p className="text-gray-600 dark:text-gray-300">Win %</p>
        <p className="text-xl font-bold text-navy-800 dark:text-white">
          {record.pct}
        </p>
      </div>
    </div>
  </div>
);