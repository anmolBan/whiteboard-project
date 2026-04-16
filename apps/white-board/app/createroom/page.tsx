"use client";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CreateRoom() {
  const session = useSession();
  const router = useRouter();
  const [createRoomName, setCreateRoomName] = useState("");
  const [joinRoomName, setJoinRoomName] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if(session.status === "loading"){
      return;
    }
    if(session.status === "unauthenticated" || !session.data?.accessToken || session.data.expires < new Date().toISOString()){
      router.push("/signin");
    }
  }, [session, router]);

  if (session.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080815]">
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute -top-52 -left-52 h-[600px] w-[600px] rounded-full bg-purple-700/20 blur-[140px] animate-pulse-glow" />
          <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[140px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
          <div className="grid-bg absolute inset-0 opacity-60" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30">
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  const handleCreateRoomClick = async () => {
    if (!createRoomName.trim()) {
      setError("Please enter a room name.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/create-room`,
        { name: createRoomName.trim() },
        {
          headers: {
            Authorization: `Bearer ${session.data?.accessToken}`,
          },
        }
      );

      if (response.status === 201) {
        router.push(`/canvas/${createRoomName.trim()}`);
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        setError("A room with this name already exists. Try a different name.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to create room. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoomClick = async () => {
    if (!joinRoomName.trim()) {
      setError("Please enter a room name to join.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/room/${joinRoomName.trim()}`,
        {
          headers: {
            Authorization: `Bearer ${session.data?.accessToken}`,
          },
        }
      );
      if (response.data.roomId) {
        router.push(`/canvas/${joinRoomName.trim()}`);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError("Room not found. Check the name and try again.");
      } else if (error.response?.data?.message) {
        if(error.response.status === 401){
          setError("Your session has expired. Please sign in again.");
        }
        else{
          setError(error.response.data.message);
        }
      } else {
        setError("Failed to join room. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "create") handleCreateRoomClick();
    else handleJoinRoomClick();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080815] text-white flex flex-col">
      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-52 -left-52 h-[600px] w-[600px] rounded-full bg-purple-700/20 blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[140px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/3 left-1/2 h-[300px] w-[300px] rounded-full bg-sky-600/10 blur-[140px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="grid-bg absolute inset-0 opacity-60" />
      </div>

      {/* ══════════ NAVBAR ══════════ */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 md:px-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">SketchSync</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-white/10 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-lg animate-fade-up">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-xl shadow-purple-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Your <span className="animate-shimmer">workspace</span> awaits
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Create a new room or join an existing one to start collaborating.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-sm">
            {/* Tabs */}
            <div className="mb-6 flex rounded-xl border border-white/10 bg-white/[0.02] p-1">
              <button
                onClick={() => { setActiveTab("create"); setError(""); }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  activeTab === "create"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Create Room
              </button>
              <button
                onClick={() => { setActiveTab("join"); setError(""); }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  activeTab === "join"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                </svg>
                Join Room
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {activeTab === "create" ? (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Room name
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={createRoomName}
                      onChange={(e) => setCreateRoomName(e.target.value)}
                      placeholder="e.g. design-sprint-2026"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-purple-500/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    Choose a unique name for your collaborative workspace.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Room name
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={joinRoomName}
                      onChange={(e) => setJoinRoomName(e.target.value)}
                      placeholder="Enter the room name to join"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-purple-500/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    Ask your teammate for the room name to join their session.
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    {activeTab === "create" ? "Creating room…" : "Joining room…"}
                  </>
                ) : (
                  <>
                    {activeTab === "create" ? "Create & open room" : "Join room"}
                    <svg className="transition-transform group-hover:translate-x-1" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-xs text-gray-600">quick tips</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            {/* Tips */}
            <div className="space-y-3">
              {[
                {
                  icon: (
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 110 8 4 4 0 010-8z" />
                  ),
                  text: "Share the room name with your team to collaborate in real time",
                },
                {
                  icon: (
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7zM13 2v7h7" />
                  ),
                  text: "Your canvas is auto-saved — pick up right where you left off",
                },
                {
                  icon: (
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  ),
                  text: "Rooms are private and secured with your authentication",
                },
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10">
                    <svg className="text-purple-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {tip.icon}
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">{tip.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Logged in as{" "}
            <span className="font-medium text-gray-400">
              {session.data?.user?.email}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}