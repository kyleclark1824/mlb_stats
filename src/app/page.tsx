"use client";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: 'url(/IMG_3877.JPG)' }}
    >
      <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-2xl p-8 max-w-2xl mt-8 ml-8 text-left backdrop-blur-md">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-900 dark:text-white drop-shadow-lg">Welcome to the Clark Family Page</h1>
        <h3 className="text-lg text-gray-700 dark:text-gray-300 mb-8">There's always a reason not to do something 100%</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">But never a good one</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* <div
            className="bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 shadow-lg rounded-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border border-blue-200 dark:border-blue-800"
            onClick={() => router.push('/mlb')}
          >
            <h2 className="text-2xl font-bold mb-4">MLB Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300">
              View MLB team rosters, player stats, game schedules and more.
            </p>
          </div> */}
          <div
            className="bg-gradient-to-br from-green-100 to-green-300 dark:from-green-900 dark:to-green-700 shadow-lg rounded-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border border-green-200 dark:border-green-800"
            onClick={() => router.push('/calendar')}
          >
            <h2 className="text-2xl font-bold mb-4 text-green-900 dark:text-green-200">Family Calendar</h2>
            <p className="text-gray-700 dark:text-gray-300">
              View and manage family events, appointments, and activities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}