"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({chats, roomId, slug} : {
    chats: { message: string, name: string, userId: string, timestamp: string }[],
    roomId: string,
    slug: string
}){
    const [messages, setMessages] = useState(chats);
    const {socket, loading} = useSocket();
    const [messageInput, setMessageInput] = useState("");
    const [userId, setUserId] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const decoded = JSON.parse(atob(token.split('.')[1]!));
                setUserId(decoded.userId || "");
            }
        } catch {}
    }, []);

    useEffect(() => {
        if(socket && !loading){
            socket.send(JSON.stringify({
                action: "join",
                roomId
            }));

            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                if(parsedData.type === "message" && parsedData.roomId === roomId){
                    setMessages(prevMessages => [...prevMessages, {
                        userId: parsedData.userId,
                        message: parsedData.content,
                        name: parsedData.name,
                        timestamp: parsedData.timestamp
                    }]);
                } else if(parsedData.type === "join" && parsedData.roomId === roomId){
                    console.log("A new user joined the room:", parsedData.userId);
                } else if(parsedData.type === "user-left" && parsedData.roomId === roomId){
                    console.log("A user left the room:", parsedData.userId);
                }
            }
        }
    }, [socket, loading]);

    const sendMessage = () => {
        if(socket && !loading && messageInput.trim() !== ""){
            const now = new Date().toISOString();
            socket.send(JSON.stringify({
                action: "message",
                roomId,
                content: messageInput
            }));
            setMessages(prev => [...prev, {
                userId: userId,
                name: "You",
                message: messageInput,
                timestamp: now
            }]);
            setMessageInput("");
        }
    };

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const getAvatarColor = (id: string) => {
        const colors = [
            "from-violet-500 to-purple-600",
            "from-cyan-500 to-blue-600",
            "from-emerald-500 to-teal-600",
            "from-orange-500 to-red-600",
            "from-pink-500 to-rose-600",
            "from-amber-500 to-yellow-600",
        ];
        let hash = 0;
        for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e]">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-white">{slug}</h1>
                    <p className="text-xs text-white/40">
                        {loading ? "Connecting..." : "Online"}
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ml-1.5 ${loading ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-white/30 gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMe = msg.userId === userId;
                    const showName = index === 0 || messages[index - 1]?.userId !== msg.userId;
                    const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.userId !== msg.userId;
                    const displayName = isMe ? "You" : msg.name;

                    return (
                        <div key={index} className={`w-full ${showName ? "mt-4" : "mt-0.5"} ${isMe ? "text-right" : "text-left"}`}>
                            {/* Name */}
                            {showName && (
                                <p className={`text-[11px] font-medium mb-1 ${isMe ? "mr-[42px] text-violet-300/70" : "ml-[42px] text-white/40"}`}>
                                    {displayName}
                                </p>
                            )}

                            {/* Avatar + Bubble row */}
                            <div className={`flex items-center gap-2.5 w-full ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                <div className="w-8 h-8 flex-shrink-0">
                                    {isMe ? (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white shadow-md shadow-violet-500/20">
                                            {getInitials(displayName)}
                                        </div>
                                    ) : (
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(msg.userId)} flex items-center justify-center text-[11px] font-bold text-white shadow-md`}>
                                            {getInitials(displayName)}
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={`
                                        px-4  pt-[5px] pb-[8px] flex items-center text-sm leading-relaxed break-words max-w-[75%] text-left
                                        ${isMe
                                            ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-2xl rounded-br-md shadow-lg shadow-violet-600/20"
                                            : "bg-white/[0.08] text-white/90 rounded-2xl rounded-bl-md border border-white/[0.06] shadow-lg shadow-black/10"
                                        }
                                    `}
                                >
                                    {msg.message}
                                </div>
                            </div>

                            {/* Timestamp */}
                            {isLastInGroup && (
                                <p className={`text-[10px] mt-1 text-white/25 ${isMe ? "mr-[42px]" : "ml-[42px]"}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 py-4 border-t border-white/10 bg-white/[0.03] backdrop-blur-md">
                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                            className="w-full px-5 py-3 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all duration-200"
                        />
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={!messageInput.trim() || loading}
                        className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-violet-500/25 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}