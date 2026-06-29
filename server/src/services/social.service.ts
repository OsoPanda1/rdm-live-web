import { db } from "../lib/store.js";
import { emitMsrEvent } from "./audit.service.js";

export function createChannel(input: { ownerId: string; name: string; description?: string }) {
  const id = crypto.randomUUID();
  const channel = {
    id,
    ownerId: input.ownerId,
    name: input.name,
    description: input.description,
    members: [input.ownerId],
    createdAt: new Date().toISOString(),
  };
  db.socialChannels.set(id, channel);
  emitMsrEvent({ layer: "L5", category: "social.channel.created", summary: `Canal ${input.name} creado`, payload: { channelId: id } });
  return channel;
}

export function joinChannel(input: { channelId: string; userId: string }) {
  const channel = db.socialChannels.get(input.channelId);
  if (!channel) {
    return null;
  }
  if (!channel.members.includes(input.userId)) {
    channel.members.push(input.userId);
  }
  return channel;
}

export function createPost(input: { authorId: string; content: string; channelId?: string; mediaUrls?: string[] }) {
  const id = crypto.randomUUID();
  const post = {
    id,
    authorId: input.authorId,
    channelId: input.channelId,
    content: input.content,
    mediaUrls: input.mediaUrls ?? [],
    likes: [],
    createdAt: new Date().toISOString(),
  };
  db.socialPosts.set(id, post);
  return post;
}

export function likePost(input: { postId: string; userId: string }) {
  const post = db.socialPosts.get(input.postId);
  if (!post) {
    return null;
  }
  if (!post.likes.includes(input.userId)) {
    post.likes.push(input.userId);
  }
  return post;
}

export function addComment(input: { postId: string; authorId: string; content: string }) {
  const post = db.socialPosts.get(input.postId);
  if (!post) {
    return null;
  }

  const id = crypto.randomUUID();
  const comment = {
    id,
    postId: input.postId,
    authorId: input.authorId,
    content: input.content,
    createdAt: new Date().toISOString(),
  };
  db.socialComments.set(id, comment);
  return comment;
}

export function sendDirectMessage(input: { roomId: string; senderId: string; content: string }) {
  const id = crypto.randomUUID();
  const message = {
    id,
    roomId: input.roomId,
    senderId: input.senderId,
    content: input.content,
    createdAt: new Date().toISOString(),
  };
  db.directMessages.set(id, message);
  return message;
}

export function listSocialSnapshot() {
  return {
    channels: [...db.socialChannels.values()],
    posts: [...db.socialPosts.values()],
    comments: [...db.socialComments.values()],
  };
}
