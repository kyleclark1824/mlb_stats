/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session?.user) {
        router.push("/calendar");
      }
      if (event === 'USER_UPDATED' && session?.user) {
        router.push("/calendar");
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setError("Check your email for confirmation!");
    } catch (err) {
      setError("Unexpected error. See console.");
      console.error(err);
    }
    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else setError("");
    } catch (err) {
      setError("Unexpected error. See console.");
      console.error(err);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setError(error.message);
    } catch (err) {
      setError("Unexpected error. See console.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-lg border border-gray-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-blue-900 dark:text-blue-100">Sign Up / Sign In</h2>
        <button onClick={() => router.push('/calendar')} className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">Back to Calendar</button>
      </div>
      <div className="mb-6">
        <span className="font-semibold">Status:</span>
        {user ? (
          <span className="ml-2 text-green-700 font-bold">Logged in as {user.email}</span>
        ) : (
          <span className="ml-2 text-red-700 font-bold">Not logged in</span>
        )}
      </div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full mb-4 p-3 border-2 border-blue-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-600"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full mb-4 p-3 border-2 border-blue-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-600"
      />
      <div className="flex items-center mb-4 gap-2">
        {!user && (
          <>
            <button onClick={handleSignUp} disabled={loading} className="px-4 py-2 bg-blue-700 text-white font-bold rounded-lg shadow hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400">
              Sign Up
            </button>
            <button onClick={handleSignIn} disabled={loading} className="px-4 py-2 bg-green-700 text-white font-bold rounded-lg shadow hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-400">
              Sign In
            </button>
          </>
        )}
        {user && (
          <button onClick={handleSignOut} disabled={loading} className="px-4 py-2 bg-gray-700 text-white font-bold rounded-lg shadow hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400">
            Sign Out
          </button>
        )}
      </div>
      {loading && <div className="mt-2 text-blue-700 font-semibold">Loading...</div>}
      {error && <div className="mt-2 text-red-700 font-semibold">{error}</div>}
      <div className="mt-8 text-center text-gray-600 dark:text-gray-300 text-sm">
        <span>Powered by Supabase Auth & Next.js</span>
      </div>
    </div>
  );
}
