import { WebSocket } from "ws";

export class RoomManager {
  private static instance: RoomManager;
  private rooms: Map<string, Map<string, WebSocket>> = new Map();

  private constructor() {}

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  public joinRoom(roomId: string, userId: string, ws: WebSocket): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }
    this.rooms.get(roomId)!.set(userId, ws);
  }

  public leaveRoom(roomId: string, userId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(userId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  public broadcast(roomId: string, message: string, excludeUserId?: string): void {
    const room = this.rooms.get(roomId);
    console.log(message);
    if (room) {
      room.forEach((ws, userId) => {
        if (!excludeUserId || userId !== excludeUserId) {
          ws.send(message);
        }
      });
    }
  }

  public getUsersInRoom(roomId: string): string[] {
    return Array.from(this.rooms.get(roomId)?.keys() || []);
  }

  public getRoomByUserId(userId: string): string | null {
    for (const [roomId, users] of this.rooms.entries()) {
      if (users.has(userId)) {
        return roomId;
      }
    }
    return null;
  }
}
