"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

interface ChatComponentProps {
    roomId: string;
    socket: WebSocket | null;
    loading: boolean;
    chats: {userId: string, name: string, message: string, timestamp: string}[];
    isOpen: boolean;
    onToggle: () => void;
}

/** Deterministic colour from a string (userId / name) */
function userColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const hue = ((hash % 360) + 360) % 360;
    return `hsl(${hue} 70% 60%)`;
}

export default function ChatComponent({ roomId, socket, loading, chats, isOpen, onToggle }: ChatComponentProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<{userId: string, name: string, message: string, timestamp: string}[]>(chats);
    const [inputMessage, setInputMessage] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to newest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!socket || loading) return;

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === "message" && data.roomId === roomId) {
                setMessages(prev => [...prev, {
                    userId: data.userId,
                    name: data.name,
                    message: data.content,
                    timestamp: data.timestamp
                }]);
            }
        };

        socket.addEventListener("message", handleMessage);
        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socket, loading, roomId]);

    const sendMessage = () => {
        if (!socket || inputMessage.trim() === "") return;
        socket.send(JSON.stringify({
            action: "message",
            roomId,
            content: inputMessage
        }));
        setMessages(prev => [...prev, {
            userId: session?.user.id ?? "",
            name: session?.user.name ?? "",
            message: inputMessage,
            timestamp: new Date().toISOString()
        }]);
        setInputMessage("");
    };

    const isOwnMessage = (userId: string) => userId === session?.user.id;

    if (!isOpen) return null;

    return (
        <div
            className="absolute right-4 top-16 bottom-4 z-[9999] flex w-[340px] flex-col rounded-2xl border border-white/[0.06] bg-[#0c0c1d]/90 shadow-2xl shadow-purple-900/20 backdrop-blur-2xl animate-chat-slide-in"
        >
            {/* ── Header ── */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold text-white">Chat</span>
                    <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                        {messages.length}
                    </span>
                </div>
                <button
                    onClick={onToggle}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin">
                {loading && (
                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                        <span className="text-xs text-gray-500">Connecting...</span>
                    </div>
                )}
                {!loading && !socket && (
                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>
                        <span className="text-xs text-gray-500">Connection failed</span>
                    </div>
                )}
                {!loading && socket && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                        </div>
                        <span className="text-xs text-gray-500">No messages yet</span>
                        <span className="text-[10px] text-gray-600">Start the conversation!</span>
                    </div>
                )}
                {messages.map((msg, index) => {
                    const own = isOwnMessage(msg.userId);
                    return (
                        <div key={index} className={`flex flex-col ${own ? "items-end" : "items-start"}`}>
                            {/* Name + timestamp */}
                            <div className={`flex items-center gap-1.5 mb-0.5 ${own ? "flex-row-reverse" : ""}`}>
                                <div
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                                    style={{ backgroundColor: userColor(msg.userId) }}
                                >
                                    {(msg.name || "?").charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[10px] font-medium" style={{ color: userColor(msg.userId) }}>
                                    {own ? "You" : msg.name}
                                </span>
                                <span className="text-[9px] text-gray-600" suppressHydrationWarning>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                            {/* Bubble */}
                            <div
                                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                                    own
                                        ? "rounded-tr-sm bg-gradient-to-br from-purple-600/80 to-indigo-600/80 text-white"
                                        : "rounded-tl-sm bg-white/[0.05] text-gray-200 border border-white/[0.06]"
                                }`}
                            >
                                {msg.message}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* ── Input ── */}
            <div className="border-t border-white/[0.06] px-3 py-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 transition-colors focus-within:border-purple-500/30 focus-within:bg-white/[0.04]">
                    <input
                        type="text"
                        value={inputMessage}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none"
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!socket || inputMessage.trim() === ""}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-purple-500/40 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-purple-500/20"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}