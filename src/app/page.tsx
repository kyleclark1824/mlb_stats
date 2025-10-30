"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const homeImages = [
  "/IMG_3877.JPG",
  "/Family_Whiteface.jpg",
  "/panarama_2.jpg",
  "/sunset_final_2.jpg",
  "/20160407_204258.jpg",
  "/bella_new.jpg",
  "/Birds.jpg",
  "/IMG_8636.jpg",
  "/chicken.jpg",
  "/20151205_175052.jpg"
];

function getRandomizedImages(images: string[]) {
  const arr = [...images];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Page() {
  const router = useRouter();
  const [bgIndex, setBgIndex] = useState(0);
  const [randomImages, setRandomImages] = useState<string[]>(getRandomizedImages(homeImages));

  useEffect(() => {
    setRandomImages(getRandomizedImages(homeImages));
    setBgIndex(0);
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % randomImages.length);
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (bgIndex === 0) {
      setRandomImages(getRandomizedImages(homeImages));
    }
  }, [bgIndex]);

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <img src={randomImages[bgIndex]} alt="Family" className="absolute inset-0 w-full h-full object-cover opacity-30 z-0 transition-all duration-1000" />
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white drop-shadow-lg">Welcome to the Clark Family Page</h1>
        <h3 className="text-lg text-gray-700 dark:text-gray-300 mt-2">There&apos;s always a reason not to do something 100%</h3>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-2">But never a good one</p>
      </div>
      <div className="relative z-10 w-full flex justify-center items-center mt-32">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-5xl">
          <div
            className="bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 shadow-lg rounded-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center md:col-span-1"
            onClick={() => router.push('/mlb')}
          >
            <h2 className="text-xl font-bold mb-2 text-blue-900 dark:text-blue-200">MLB Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
              View MLB team rosters, player stats, game schedules and more.
            </p>
          </div>
          <div
            className="bg-gradient-to-br from-green-100 to-green-300 dark:from-green-900 dark:to-green-700 shadow-lg rounded-lg p-8 cursor-pointer hover:shadow-xl transition-shadow border border-green-200 dark:border-green-800 flex flex-col items-center justify-center md:col-span-4"
            onClick={() => router.push('/calendar')}
          >
            <h2 className="text-2xl font-bold mb-2 text-green-900 dark:text-green-200">Family Calendar</h2>
            <p className="text-gray-700 dark:text-gray-300 text-center">
              View and manage family events, appointments, and activities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}