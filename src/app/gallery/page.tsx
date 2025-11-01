"use client";
import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

// List of public images (update if needed)
const images = [
  "/backgrounds/20151205_175052.jpg",
  "/backgrounds/20160407_204258.jpg",
  "/backgrounds/7.jpg",
  "/backgrounds/bella_new.jpg",
  "/backgrounds/Birds.jpg",
  "/backgrounds/chicken.jpg",
  "/backgrounds/dad_Day1.JPG",
  "/backgrounds/Family_Whiteface.jpg",
  "/backgrounds/Fred2.jpg",
  "/backgrounds/giraffe.jpg",
  "/backgrounds/girls_at_barnham.jpg",
  "/backgrounds/IMG_3029.jpg",
  "/backgrounds/IMG_3877.JPG",
  "/backgrounds/IMG_5899 (2).jpg",
  "/backgrounds/IMG_6007 (2).jpg",
  "/backgrounds/IMG_6819.jpg",
  "/backgrounds/IMG_7306.jpg",
  "/backgrounds/IMG_7382.jpg",
  "/backgrounds/IMG_8531.jpg",
  "/backgrounds/IMG_8636.jpg",
  "/backgrounds/kace1.jpg",
  "/backgrounds/kace_bubbles.jpg",
  "/backgrounds/kids.jpg",
  "/backgrounds/KRM_married.jpg",
  "/backgrounds/M&R.jpg",
  "/backgrounds/moon.jpg",
  "/backgrounds/panarama_2.jpg",
  "/backgrounds/Preg.jpg",
  "/backgrounds/preg1.jpg",
  "/backgrounds/preg3.jpg",
  "/backgrounds/RaulPainted.jpg",
  "/backgrounds/summer 2010 030.jpg",
  "/backgrounds/sunset2.jpg",
  "/backgrounds/sunset_final_2.jpg",
  "/backgrounds/Tybee1.jpg",
  "/backgrounds/uphill.jpg",
  "/backgrounds/wall1 (2).jpg",
  "/backgrounds/wall3 (2).jpg",
  "/backgrounds/wall4 (2).jpg"
];

export default function GalleryPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  React.useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setAuthChecked(true);
    };
    checkUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-8">
      <button
        className="absolute top-6 left-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out cursor-pointer"
        onClick={() => router.push("/")}
      >
        Back to Home
      </button>
      <h1 className="text-4xl font-bold mb-8">Image Gallery</h1>
      {authChecked && user && (
        <button
          className="mb-8 px-6 py-3 bg-yellow-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200 ease-in-out cursor-pointer"
          onClick={() => router.push("/upload")}
        >
          Upload Image
        </button>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full max-w-5xl mb-12">
        {images.map((src) => (
          <div
            key={src}
            className={`relative rounded-lg overflow-hidden shadow-lg cursor-pointer border-4 transition-all duration-200 ${selected === src ? "border-blue-500" : "border-transparent"}`}
            onClick={() => setSelected(src)}
          >
            <Image src={src.replace('/public/', '/backgrounds/')} alt="Gallery" width={300} height={200} className="object-cover w-full h-48" />
          </div>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative">
            <Image src={selected.replace('/public/', '/backgrounds/')} alt="Selected" width={900} height={600} className="rounded-lg shadow-2xl max-w-full max-h-[80vh]" />
            <button
              className="absolute top-2 right-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
