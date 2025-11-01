"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
    setSuccess(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setUploading(true);
    setError(null);
    setSuccess(null);
    // Upload to Supabase Storage
    const filePath = file.name;
  const { error: uploadError } = await supabase.storage.from("backgrounds").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    // Insert metadata into images table
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    const { error: dbError } = await supabase.from("images").insert({
      path: filePath,
      uploaded_by: userId,
      uploaded_at: new Date().toISOString()
    });
    if (dbError) {
      setError(dbError.message);
      setUploading(false);
      return;
    }
    setSuccess("Upload successful!");
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-8">
      <button
        className="absolute top-6 left-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out cursor-pointer"
        onClick={() => router.push("/")}
      >
        Back to Home
      </button>
      <h1 className="text-4xl font-bold mb-8">Upload Image</h1>
      <div className="bg-gray-800 rounded-lg p-8 shadow-lg w-full max-w-md flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 text-white"
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-semibold shadow hover:bg-yellow-700 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {error && <div className="text-red-500 mt-4">{error}</div>}
        {success && <div className="text-green-500 mt-4">{success}</div>}
      </div>
    </div>
  );
}
