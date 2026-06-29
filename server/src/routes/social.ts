import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import {
  addComment,
  createChannel,
  createPost,
  joinChannel,
  likePost,
  listSocialSnapshot,
  sendDirectMessage,
} from "../services/social.service.js";

const channelSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

const postSchema = z.object({
  channelId: z.string().optional(),
  content: z.string().min(2),
  mediaUrls: z.array(z.string().url()).max(8).optional(),
});

const commentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1),
});

const joinSchema = z.object({ channelId: z.string().min(1) });
const dmSchema = z.object({ roomId: z.string().min(1), content: z.string().min(1) });

const socialRouter = Router();

socialRouter.get("/snapshot", (_req, res) => {
  return res.json(listSocialSnapshot());
});

socialRouter.post("/channels", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const parsed = channelSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  return res.status(201).json({ channel: createChannel({ ownerId: req.user.id, ...parsed.data }) });
});

socialRouter.post("/channels/join", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const parsed = joinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const channel = joinChannel({ channelId: parsed.data.channelId, userId: req.user.id });
  if (!channel) {
    return res.status(404).json({ error: "Channel not found" });
  }
  return res.json({ channel });
});

socialRouter.post("/posts", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  return res.status(201).json({ post: createPost({ authorId: req.user.id, ...parsed.data }) });
});

socialRouter.post("/posts/:postId/like", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const postIdParam = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const post = likePost({ postId: postIdParam, userId: req.user.id });
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  return res.json({ post });
});

socialRouter.post("/comments", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const comment = addComment({ authorId: req.user.id, ...parsed.data });
  if (!comment) {
    return res.status(404).json({ error: "Post not found" });
  }
  return res.status(201).json({ comment });
});

socialRouter.post("/dm", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const parsed = dmSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  return res.status(201).json({ message: sendDirectMessage({ senderId: req.user.id, ...parsed.data }) });
});

export default socialRouter;
