"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to Sports Stats</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => router.push("/mlb")}
        >
          <h2 className="text-2xl font-bold mb-4">MLB Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">
            View MLB team rosters, player stats, game schedules and more.
          </p>
        </div>
        <div 
          className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => router.push("/calendar")}
        >
          <h2 className="text-2xl font-bold mb-4">Sports Calendar</h2>
          <p className="text-gray-600 dark:text-gray-300">
            View upcoming games and events across multiple sports.
          </p>
        </div>
      </div>
    </div>
  );
}
