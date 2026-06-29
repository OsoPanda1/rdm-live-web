import { db } from "../lib/store.js";

export function createStreamRoom(input: { hostId: string; title: string }) {
  const id = crypto.randomUUID();
  const room = {
    id,
    hostId: input.hostId,
    title: input.title,
    status: "live" as const,
    viewers: 0,
    createdAt: new Date().toISOString(),
  };
  db.streamRooms.set(id, room);
  return room;
}

export function endStreamRoom(roomId: string) {
  const room = db.streamRooms.get(roomId);
  if (!room) return null;
  room.status = "ended";
  return room;
}

export function createVideoCallRoom(input: { ownerId: string; name: string }) {
  const id = crypto.randomUUID();
  const room = {
    id,
    name: input.name,
    ownerId: input.ownerId,
    participants: [input.ownerId],
    status: "open" as const,
    createdAt: new Date().toISOString(),
  };
  db.videoCallRooms.set(id, room);
  return room;
}

export function joinVideoCallRoom(input: { roomId: string; userId: string }) {
  const room = db.videoCallRooms.get(input.roomId);
  if (!room || room.status !== "open") {
    return null;
  }
  if (!room.participants.includes(input.userId)) {
    room.participants.push(input.userId);
  }
  return room;
}

export function listStreams() {
  return {
    streams: [...db.streamRooms.values()],
    videoCalls: [...db.videoCallRooms.values()],
  };
}
