import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend_common";
import { RoomManager } from "./RoomManager.js";
import { WS_PORT } from "@repo/backend_common";
import prisma from "@repo/db";

const wss = new WebSocketServer({ port: WS_PORT });
const roomManager = RoomManager.getInstance();

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

  if(!userId){
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
          roomManager.leaveRoom(currentRoomId, userId);
          roomManager.broadcast(currentRoomId, JSON.stringify({
            type: "user-left",
            userId,
            name,
            timestamp: new Date().toISOString()
          }), userId);
        }

        // Join new room
        currentRoomId = roomId;
        roomManager.joinRoom(roomId, userId, ws);
        
        // Notify others in the room
        roomManager.broadcast(roomId, JSON.stringify({
          type: "user-joined",
          userId,
          name,
          users: roomManager.getUsersInRoom(roomId),
          timestamp: new Date().toISOString()
        }), userId);

      } else if (action === "message" && currentRoomId) {

        await prisma.chat.create({
          data: {
            roomId,
            userId,
            message: content
          }
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
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    if (currentRoomId) {
      console.log(`Client ${userId} disconnected from room ${currentRoomId}`);
      roomManager.leaveRoom(currentRoomId, userId);
      roomManager.broadcast(currentRoomId, JSON.stringify({
        type: "user-left",
        userId,
        name,
        users: roomManager.getUsersInRoom(currentRoomId),
        timestamp: new Date().toISOString()
      }));
    }
  });

});

console.log(`WebSocket server is running on port ${WS_PORT}`);