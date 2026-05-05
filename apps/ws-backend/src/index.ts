import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend_common";
import { RoomManager } from "./RoomManager.js";
import { WS_PORT } from "@repo/backend_common";
import { queue, compressData, stripAppState, CanvasUpdateJobData } from "./queue.js";
import "./worker.js";

const wss = new WebSocketServer({ port: WS_PORT });
const roomManager = RoomManager.getInstance();

// ── Debounce canvas updates: only queue after 2s of inactivity per room ──
const CANVAS_DEBOUNCE_MS = 2000;
const pendingCanvasUpdates = new Map<string, {timeout: NodeJS.Timeout; data: CanvasUpdateJobData;}>();

function scheduleCanvasUpdate(jobData: CanvasUpdateJobData) {
  const { roomId } = jobData;

  const existing = pendingCanvasUpdates.get(roomId);
  if (existing) {
    clearTimeout(existing.timeout);
  }

  const timeout = setTimeout(async () => {
    pendingCanvasUpdates.delete(roomId);
    try {
      await queue.add("canvas-update", jobData);
      console.log(`[Debounce] Queued canvas update for room ${roomId}`);
    } catch (err) {
      console.error(`[Debounce] Failed to queue canvas update:`, err);
    }
  }, CANVAS_DEBOUNCE_MS);

  pendingCanvasUpdates.set(roomId, { timeout, data: jobData });
}

function checkUser(token: string) : [string | null, string | null] {
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        if(typeof decoded === "string"){
            return [null, null];
        }

        if(!decoded || !decoded.userId){
          return [null, null];
        }

        return [decoded.userId, decoded.name];
    } catch (error) {
        return [null, null];
    }
}

wss.on("connection", (ws: WebSocket, request) => {
  console.log("New client connected");
  const url = request.url;
  if(!url){
    return;
  }

  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  const [userId, name] = checkUser(token);

  if(!userId || !name){
    ws.close();
    return null;
  }

  let currentRoomId: string | null = null;

  ws.on("message", async function message(data) {
    try {
      const parsedData = JSON.parse(data.toString());
      const { action, roomId, content } = parsedData;

      if (action === "join") {
        // Leave previous room if user was in one
        if (currentRoomId) {
          const removed = roomManager.leaveRoom(currentRoomId, userId, ws);
          if (removed) {
            roomManager.broadcast(currentRoomId, JSON.stringify({
              type: "user-left",
              userId,
              name,
              users: roomManager.getUsersInRoom(currentRoomId),
              timestamp: new Date().toISOString()
            }));
          }
        }

        // Join new room
        currentRoomId = roomId;
        const isNewUser = roomManager.joinRoom(roomId, userId, name, ws);
        
        // Only notify others if this is a genuinely new user, not a reconnect
        if (isNewUser) {
          roomManager.broadcast(roomId, JSON.stringify({
            type: "user-joined",
            userId,
            name,
            users: roomManager.getUsersInRoom(roomId),
            timestamp: new Date().toISOString()
          }));
        }

      } else if (action === "message" && currentRoomId) {

        await queue.add("chat-message-and-canvas-update", {
          roomId,
          userId,
          message: content,
        });

        // Broadcast message to room
        roomManager.broadcast(currentRoomId, JSON.stringify({
          type: "message",
          roomId: currentRoomId,
          userId,
          name,
          content,
          timestamp: new Date().toISOString()
        }), userId);
      }

      else if (action === "canvas-update" && currentRoomId) {

        // Strip non-essential appState fields & compress before queuing
        const strippedAppState = stripAppState(content.appState);
        const compressedData = await compressData({
          elements: content.elements,
          appState: strippedAppState,
          files: content.files,
        });

        // Debounce: only queue the latest canvas state per room after 2s idle
        scheduleCanvasUpdate({
          roomId,
          userId,
          compressedData,
        });

        // Broadcast canvas update to room (uncompressed, for real-time display)
        roomManager.broadcast(currentRoomId, JSON.stringify({
          type: "canvas-update",
          roomId: currentRoomId,
          userId,
          name,
          content,
          users: roomManager.getUsersInRoom(currentRoomId),
          timestamp: new Date().toISOString()
        }));
      }


    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    if (currentRoomId) {
      const removed = roomManager.leaveRoom(currentRoomId, userId, ws);
      if (removed) {
        console.log(`Client ${userId} disconnected from room ${currentRoomId}`);
        roomManager.broadcast(currentRoomId, JSON.stringify({
          type: "user-left",
          userId,
          name,
          users: roomManager.getUsersInRoom(currentRoomId),
          timestamp: new Date().toISOString()
        }));
      }
    }
  });

});

// ── One-time cleanup: purge old completed & failed jobs from Redis ──────
(async () => {
  try {
    const completedRemoved = await queue.clean(0, 0, "completed");
    const failedRemoved = await queue.clean(0, 0, "failed");
    console.log(`[Cleanup] Removed ${completedRemoved.length} completed and ${failedRemoved.length} failed old jobs from Redis`);
  } catch (err) {
    console.error("[Cleanup] Failed to clean old jobs:", err);
  }
})();

console.log(`WebSocket server is running on port ${WS_PORT}`);