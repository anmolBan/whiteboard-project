/*
 * ==================================================================
 *  EXCALIDRAW CANVAS PAGE
 *
 *  KEY CONCEPTS (5 things you need to know):
 *
 *  1. "use client"        - Excalidraw uses browser APIs (canvas, DOM),
 *                           so the component MUST be a Client Component.
 *
 *  2. dynamic import      - Excalidraw doesn't support SSR. We use
 *                           next/dynamic with { ssr: false } so the
 *                           module is only loaded in the browser.
 *
 *  3. CSS import          - Excalidraw ships its own stylesheet. Without
 *                           importing it, all icons & UI render unstyled
 *                           and oversized (the bug we fixed earlier).
 *
 *  4. Full-viewport div   - Excalidraw fills whatever container you give
 *                           it, so we make the wrapper 100vw x 100vh.
 *
 *  5. use(params)         - In Next.js 15+, route params are a Promise.
 *                           React's use() hook unwraps them.
 * ==================================================================
 */

"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// CRITICAL - loads Excalidraw's own CSS so icons/toolbar render at correct size
import "@excalidraw/excalidraw/index.css";
import { useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";
import ChatComponent from "./ChatComponent";
import { useRouter } from "next/navigation";

/*
 * --- THEMED LOADING SPINNER ---
 * Shows while Excalidraw JS bundle is being downloaded & parsed.
 * Matches the landing page's dark-purple aesthetic.
 */
function CanvasLoader() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#080815]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-pulse-glow absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-700/20 blur-[140px]" />
        <div
          className="animate-pulse-glow absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[140px]"
          style={{ animationDelay: "2s" }}
        />
        <div className="grid-bg absolute inset-0 opacity-100" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-xl shadow-purple-500/30">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 blur-2xl opacity-40 animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-lg font-bold text-white">Preparing your canvas</h2>
          <p className="text-sm text-gray-500">
            Setting up the collaborative workspace...
          </p>
          <div className="mt-2 h-1 w-48 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="loading-bar h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * --- Dynamic import with SSR disabled ---
 * Excalidraw uses canvas/DOM APIs that don't exist on the server.
 * The loading prop shows our themed spinner while the bundle loads.
 */
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false, loading: () => <CanvasLoader /> }
);

/*
 * --- STYLED CANVAS PAGE ---
 * Includes: header bar, logo, room name, save indicator,
 * collaborator avatars, share button, and ambient glow effects.
*/
export default function CanvasComponent({roomId, roomName, canvasData, initialChats}: { roomId: string, roomName: string, canvasData: any, initialChats: {userId: string, name: string, message: string, timestamp: string}[]}) {
  // Next.js 15+ passes params as a Promise - unwrap with use()
  const savedElements = canvasData?.canvasData?.elements ?? null;

  const [saved, setSaved] = useState(true);
  const [mounted, setMounted] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCursorButton = useRef<string>("up");
  const {socket, loading} = useSocket();
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [roomMembers, setRoomMembers] = useState<{userId: string, name: string}[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const session = useSession();
  const router = useRouter();

  // Extract saved elements from the API response — null if nothing saved yet

  useEffect(() => {
    if(session.status === "loading"){
      return;
    }
    if(session.status === 'unauthenticated' || !session.data?.user?.accessToken || session.data.expires < new Date().toISOString()){
      router.push("/signin");
    }
  }, [session, router]);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // Join the room — only depends on socket & roomId, NOT excalidrawAPI
  useEffect(() => {
    if(socket && !loading){
      socket.send(JSON.stringify({
        action: "join",
        roomId
      }));
    }
  }, [socket, loading, roomId]);

  // Handle incoming messages — separate effect so excalidrawAPI changes don't re-send join
  useEffect(() => {
    if(!socket || loading) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if(data.type === "user-joined" || data.type === "user-left"){
        setRoomMembers(data.users);
      }
      // }
      if(data.type === "canvas-update" && data.roomId === roomId){
        if(data.userId !== session?.data?.user?.id){
          excalidrawAPI?.updateScene({ elements: data.content.elements });
        }
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, loading, roomId, excalidrawAPI, session]);

  function handleChange(elements: any, appState: any, files: any) {
    const cursorButton = appState.cursorButton ?? "up";
    // Log only when the pointer is released (action finished)
    if (prevCursorButton.current === "down" && cursorButton === "up") {
      setSaved(false);
      if(socket && !loading){
        socket.send(JSON.stringify({
          action: "canvas-update",
          roomId,
          content: { elements, appState, files }   // send complete canvas state
        }));
        setTimeout(() => {
          setSaved(true)
        }, 800);
        // setSaved(true); // Optimistically set to saved; will be corrected if server update fails or if another user's update comes in
      }
    }
    prevCursorButton.current = cursorButton;
  }


  // Pretty room name from slug
  // not working
  // const displayName = roomName
  //   .replace(/-/g, " ")
  //   .replace(/\b\w/g, (l) => l.toUpperCase());

  const displayName = roomName;

  return (
      <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#080815]">
        {/* Ambient glow blobs behind the canvas */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="animate-pulse-glow absolute -top-60 -left-60 h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[180px]" />
          <div
            className="animate-pulse-glow absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[180px]"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Top bar with logo, room name, save status, collaborators, share */}
        <header className="relative z-[9999] flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0c0c1d]/80 px-3 backdrop-blur-xl">
          {/* Left: Logo + Room name */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="group flex items-center gap-2 rounded-lg px-1 py-0.5 transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 shadow-md shadow-purple-500/20 transition-shadow group-hover:shadow-purple-500/40">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <span className="hidden text-sm font-bold text-white sm:block">
                SketchSync
              </span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1">
              <svg
                className="shrink-0 text-purple-400/60"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <span className="max-w-[200px] truncate text-xs font-medium text-gray-300">
                {displayName}
              </span>
            </div>
          </div>

          {/* Centre: Save indicator */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {saved ? (
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/[0.06] px-3 py-0.5">
                <svg
                  className="text-emerald-400"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="text-[11px] font-medium text-emerald-400/90">
                  Saved
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/10 bg-amber-500/[0.06] px-3 py-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-medium text-amber-400/90">
                  Saving...
                </span>
              </div>
            )}
          </div>

          {/* Right: Collaborators + Chat toggle + Share */}
          <div className="flex items-center gap-2.5">
            <div className="hidden items-center sm:flex">
              {/* Show only first 3 members of the group */}
              {roomMembers.slice(0, 3).map((u, i) => (
                <div
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0c0c1d] text-[9px] font-bold text-white"
                  style={{
                    backgroundColor: `hsl(${(i * 137.508) % 360} 70% 50%)`, // distribute colors evenly
                    marginLeft: i > 0 ? -6 : 0,
                  }}
                >
                  {u.name.charAt(0).toUpperCase()}
                </div>
              ))}
              <div className="ml-2 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[11px] text-gray-500">{roomMembers.length} online</span>
              </div>
            </div>
            <div className="hidden h-4 w-px bg-white/10 sm:block" />
            <button
              onClick={() => setChatOpen(prev => !prev)}
              className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                chatOpen
                  ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                  : "bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:bg-white/[0.06] hover:text-gray-300"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <span className="hidden sm:inline">Chat</span>
            </button>
            <div className="hidden h-4 w-px bg-white/10 sm:block" />
            <button className="group flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-purple-500/40 hover:scale-[1.03] active:scale-[0.97]">
              <svg
                className="transition-transform group-hover:scale-110"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>
          </div>
        </header>

        {/* Canvas fills remaining space via flex-1 */}
        <main className="excalidraw-canvas-wrapper relative flex-1">
          {mounted && (
            <Excalidraw
              theme="dark"
              excalidrawAPI={(api) => setExcalidrawAPI(api)}
              initialData={savedElements ? { elements: savedElements } : null}
              onChange={handleChange}
              UIOptions={{
                canvasActions: { changeViewBackgroundColor: false },
              }}
            />
          )}
        </main>
      <ChatComponent roomId={roomId} socket={socket} loading={loading} chats={initialChats} isOpen={chatOpen} onToggle={() => setChatOpen(false)} />
    </div>
  );
}